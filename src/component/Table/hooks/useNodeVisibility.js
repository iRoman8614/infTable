import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Хук для управления видимостью узлов дерева
 */
export const useNodeVisibility = (treeStructure) => {
    const [nodeVisibility, setNodeVisibility] = useState({});
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    // Инициализация видимости узлов
    useEffect(() => {
        const visibility = {};
        const addNodeAndChildren = (node) => {
            // COMPONENT элементы по умолчанию невидимы (закрытый глазик)
            const isVisible = node.type !== 'COMPONENT';
            visibility[node.id] = isVisible;
            if (!isVisible) {
                console.log(`[useNodeVisibility] Initializing ${node.id} (${node.type}) as NOT visible`);
            }
            node.children.forEach(addNodeAndChildren);
        };
        treeStructure.tree.forEach(addNodeAndChildren);
        console.log(`[useNodeVisibility] Initialized visibility for ${Object.keys(visibility).length} nodes`);
        setNodeVisibility(visibility);
    }, [treeStructure]);

    // Получение всех потомков узла
    const getAllDescendants = useCallback((nodeId) => {
        const node = treeStructure.nodesMap.get(nodeId);
        if (!node) return [];

        const descendants = [];
        const traverse = (n) => {
            n.children.forEach(child => {
                descendants.push(child.id);
                traverse(child);
            });
        };
        traverse(node);
        return descendants;
    }, [treeStructure.nodesMap]);

    // Проверка полной видимости узла
    const isNodeFullyVisible = useCallback((nodeId) => {
        let currentNodeId = nodeId;
        while (currentNodeId) {
            if (!nodeVisibility[currentNodeId]) return false;
            const node = treeStructure.nodesMap.get(currentNodeId);
            if (!node) return false;
            currentNodeId = node.parentId;
        }
        return true;
    }, [nodeVisibility, treeStructure.nodesMap]);

    // Переключение видимости узла
    const toggleNodeVisibility = useCallback((nodeId) => {
        setNodeVisibility(prev => {
            const newVisibility = { ...prev };
            const newValue = !prev[nodeId];
            newVisibility[nodeId] = newValue;

            if (!newValue) {
                // Скрываем все потомков
                const descendants = getAllDescendants(nodeId);
                descendants.forEach(id => {
                    newVisibility[id] = false;
                });
            } else {
                // Показываем детей
                const node = treeStructure.nodesMap.get(nodeId);
                if (node && node.children) {
                    node.children.forEach(child => {
                        newVisibility[child.id] = true;

                        // Рекурсивно показываем потомков если их родители видимы
                        const showDescendantsRecursively = (n) => {
                            if (n.children) {
                                n.children.forEach(childNode => {
                                    const shouldShow = () => {
                                        let currentId = childNode.parentId;
                                        while (currentId && currentId !== nodeId) {
                                            if (!newVisibility[currentId]) return false;
                                            const currentNode = treeStructure.nodesMap.get(currentId);
                                            currentId = currentNode?.parentId;
                                        }
                                        return true;
                                    };

                                    if (shouldShow()) {
                                        newVisibility[childNode.id] = true;
                                        showDescendantsRecursively(childNode);
                                    }
                                });
                            }
                        };
                        showDescendantsRecursively(child);
                    });
                }
            }

            return newVisibility;
        });
    }, [getAllDescendants, treeStructure.nodesMap]);


    const setNodeVisibilityDirect = useCallback((nodeId, visible) => {
        setNodeVisibility(prev => {
            const newVisibility = { ...prev };
            newVisibility[nodeId] = visible;

            if (!visible) {
                const descendants = getAllDescendants(nodeId);
                descendants.forEach(id => {
                    newVisibility[id] = false;
                });
            }

            return newVisibility;
        });
    }, [getAllDescendants]);

    // Переключение развертывания узла
    const toggleNodeExpansion = useCallback((nodeId) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    }, []);

    // Переключение видимости всех детей
    const toggleAllChildrenVisibility = useCallback((nodeId, visible) => {
        const descendants = getAllDescendants(nodeId);
        const updates = {};
        descendants.forEach(id => {
            updates[id] = visible;
        });
        setNodeVisibility(prev => ({ ...prev, ...updates }));
    }, [getAllDescendants]);

    // Видимые листовые узлы
    const visibleLeafNodes = useMemo(() => {
        return treeStructure.leafNodes.filter(node => isNodeFullyVisible(node.id));
    }, [treeStructure.leafNodes, isNodeFullyVisible]);

    // Фильтрация дерева для поиска
    const filteredTree = useMemo(() => {
        if (!searchTerm) return treeStructure.tree;

        const filterNodes = (nodes) => {
            return nodes.reduce((filtered, node) => {
                const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
                const filteredChildren = filterNodes(node.children);

                if (matchesSearch || filteredChildren.length > 0) {
                    filtered.push({ ...node, children: filteredChildren });
                }

                return filtered;
            }, []);
        };

        return filterNodes(treeStructure.tree);
    }, [treeStructure.tree, searchTerm]);

    return {
        // Состояния
        nodeVisibility,
        expandedNodes,
        searchTerm,
        visibleLeafNodes,
        filteredTree,

        // Сеттеры
        setSearchTerm,

        // Функции
        toggleNodeVisibility,
        setNodeVisibilityDirect,
        toggleNodeExpansion,
        toggleAllChildrenVisibility,
        isNodeFullyVisible,
        getAllDescendants
    };
};
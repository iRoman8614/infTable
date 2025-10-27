import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Хук для управления видимостью children элементов
 */
export const useChildrenVisibility = (treeStructure, visibleData) => {
    const [childrenVisibility, setChildrenVisibility] = useState({});

    // Инициализация видимости children элементов
    useEffect(() => {
        const newChildrenVisibility = {};
        
        // Проходим по всем данным и собираем children элементы
        Object.values(visibleData).forEach(dayData => {
            if (dayData.elements) {
                Object.values(dayData.elements).forEach(element => {
                    if (element.children && Array.isArray(element.children)) {
                        const nodeId = element.nodeId || element.headerId;
                        if (nodeId) {
                            if (!newChildrenVisibility[nodeId]) {
                                newChildrenVisibility[nodeId] = {};
                            }
                            
                            element.children.forEach(child => {
                                // Инициализируем только если состояние еще не установлено пользователем
                                if (!childrenVisibility[nodeId]?.[child.id]) {
                                    newChildrenVisibility[nodeId][child.id] = false; // По умолчанию скрыты
                                }
                            });
                        }
                    }
                });
            }
        });

        // Обновляем только новые узлы, не перезаписывая существующие
        setChildrenVisibility(prev => {
            const updated = { ...prev };
            Object.keys(newChildrenVisibility).forEach(nodeId => {
                if (!updated[nodeId]) {
                    updated[nodeId] = newChildrenVisibility[nodeId];
                } else {
                    // Добавляем только новые children элементы
                    Object.keys(newChildrenVisibility[nodeId]).forEach(childId => {
                        if (updated[nodeId][childId] === undefined) {
                            updated[nodeId][childId] = newChildrenVisibility[nodeId][childId];
                        }
                    });
                }
            });
            return updated;
        });
    }, [visibleData]);

    // Переключение видимости конкретного child элемента
    const toggleChildrenVisibility = useCallback((nodeId, childId) => {
        console.log(`[useChildrenVisibility] Toggling ${nodeId}.${childId}`);
        setChildrenVisibility(prev => {
            const newState = {
                ...prev,
                [nodeId]: {
                    ...prev[nodeId],
                    [childId]: !prev[nodeId]?.[childId]
                }
            };
            console.log(`[useChildrenVisibility] New state for ${nodeId}:`, newState[nodeId]);
            return newState;
        });
    }, []);

    // Переключение видимости всех children элементов узла
    const toggleAllChildrenVisibility = useCallback((nodeId, visible) => {
        setChildrenVisibility(prev => {
            const nodeChildren = prev[nodeId] || {};
            const updatedChildren = {};
            
            Object.keys(nodeChildren).forEach(childId => {
                updatedChildren[childId] = visible;
            });

            return {
                ...prev,
                [nodeId]: updatedChildren
            };
        });
    }, []);

    // Получение видимых children элементов для конкретного узла
    const getVisibleChildren = useCallback((nodeId) => {
        const nodeChildren = childrenVisibility[nodeId] || {};
        return Object.keys(nodeChildren).filter(childId => nodeChildren[childId]);
    }, [childrenVisibility]);

    // Проверка есть ли видимые children элементы у узла
    const hasVisibleChildren = useCallback((nodeId) => {
        const visibleChildren = getVisibleChildren(nodeId);
        return visibleChildren.length > 0;
    }, [getVisibleChildren]);

    // Получение всех children элементов для узла из данных
    const getChildrenFromData = useCallback((nodeId) => {
        const allChildren = new Set();
        
        Object.values(visibleData).forEach(dayData => {
            if (dayData.elements) {
                Object.values(dayData.elements).forEach(element => {
                    if (element.children && Array.isArray(element.children)) {
                        const elementNodeId = element.nodeId || element.headerId;
                        if (elementNodeId === nodeId) {
                            element.children.forEach(child => {
                                allChildren.add(child);
                            });
                        }
                    }
                });
            }
        });

        return Array.from(allChildren);
    }, [visibleData]);

    // Обновление структуры дерева с информацией о children элементах
    const enhancedTreeStructure = useMemo(() => {
        if (!treeStructure || !treeStructure.tree) {
            return treeStructure;
        }

        const enhanceNode = (node) => {
            // Для листовых узлов (станций) используем childrenData из структуры заголовков
            if (!node.children || node.children.length === 0) {
                return {
                    ...node,
                    childrenData: node.childrenData || [],
                    children: []
                };
            }
            
            // Для родительских узлов рекурсивно обрабатываем детей
            return {
                ...node,
                children: node.children.map(enhanceNode)
            };
        };

        return {
            ...treeStructure,
            tree: treeStructure.tree.map(enhanceNode)
        };
    }, [treeStructure]);

    // Получение статистики по children элементам
    const getChildrenStats = useCallback(() => {
        const stats = {
            totalNodes: 0,
            nodesWithChildren: 0,
            totalChildren: 0,
            visibleChildren: 0
        };

        Object.keys(childrenVisibility).forEach(nodeId => {
            stats.totalNodes++;
            const nodeChildren = childrenVisibility[nodeId];
            const childrenCount = Object.keys(nodeChildren).length;
            
            if (childrenCount > 0) {
                stats.nodesWithChildren++;
                stats.totalChildren += childrenCount;
                stats.visibleChildren += Object.values(nodeChildren).filter(Boolean).length;
            }
        });

        return stats;
    }, [childrenVisibility]);

    return {
        // Состояния
        childrenVisibility,
        enhancedTreeStructure,
        
        // Функции
        toggleChildrenVisibility,
        toggleAllChildrenVisibility,
        getVisibleChildren,
        hasVisibleChildren,
        getChildrenFromData,
        getChildrenStats
    };
};

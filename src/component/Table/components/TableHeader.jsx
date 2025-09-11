import React, { useCallback } from 'react';
import { getContrastTextColor } from '../utils/ContrastTextColor';

/**
 * Компонент заголовка таблицы
 */
export const TableHeader = ({
                                treeStructure,
                                nodeVisibility,
                                activeColorTheme
                            }) => {
    // Функция расчета colspan
    const calculateColspan = useCallback((node) => {
        if (node.children.length === 0) {
            return isNodeFullyVisible(node.id) ? 1 : 0;
        }
        return node.children.reduce((sum, child) => sum + calculateColspan(child), 0);
    }, []);

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

    // Фильтрация видимых узлов для заголовка
    const filterVisibleNodes = useCallback((nodes) => {
        return nodes.filter(node => {
            if (isNodeFullyVisible(node.id)) return true;

            const hasVisibleDescendants = (n) => {
                if (n.children.length === 0) return false;
                return n.children.some(child =>
                    isNodeFullyVisible(child.id) || hasVisibleDescendants(child)
                );
            };

            return hasVisibleDescendants(node);
        }).map(node => ({
            ...node,
            children: filterVisibleNodes(node.children)
        }));
    }, [isNodeFullyVisible]);

    // Рендер строк заголовка
    const renderHeaderRows = useCallback(() => {
        const rows = [];
        const visibleTree = filterVisibleNodes(treeStructure.tree);

        let currentLevelNodes = visibleTree;
        let depth = 1;

        while (currentLevelNodes.length > 0 && depth <= treeStructure.maxDepth) {
            const currentDepth = depth; // Создаем локальную копию для безопасности

            rows.push(
                <tr key={`header-row-${currentDepth}`}>
                    {/* Ячейка "Дата" - отображается только в первой строке */}
                    {currentDepth === 1 && (
                        <th
                            rowSpan={treeStructure.maxDepth}
                            style={{
                                padding: '8px',
                                minWidth: '100px',
                                borderRight: '1px solid #ddd',
                                fontSize: '14px',
                                fontWeight: 'normal',
                                whiteSpace: 'nowrap',
                                color: getContrastTextColor(activeColorTheme("BGHeader")),
                                backgroundColor: activeColorTheme("BGHeader")
                            }}
                        >
                            Дата
                        </th>
                    )}

                    {/* Ячейки для узлов дерева */}
                    {currentLevelNodes.map(node => {
                        const colspan = calculateColspan(node);
                        if (colspan === 0) return null;

                        const isVisible = isNodeFullyVisible(node.id);
                        const backgroundColor = isVisible ? node.metadata.color : '#ccc';

                        return (
                            <th
                                key={node.id}
                                colSpan={colspan}
                                rowSpan={node.children.length === 0 ? treeStructure.maxDepth - currentDepth + 1 : 1}
                                style={{
                                    backgroundColor: backgroundColor,
                                    padding: '8px',
                                    fontSize: '12px',
                                    fontWeight: 'normal',
                                    textAlign: 'center',
                                    // ЗДЕСЬ ИСПОЛЬЗУЕТСЯ ФУНКЦИЯ КОНТРАСТНОГО ЦВЕТА
                                    color: getContrastTextColor(backgroundColor),
                                    opacity: isVisible ? 1 : 0.5,
                                    border: '1px solid #ddd'
                                }}
                            >
                                {node.name}
                            </th>
                        );
                    })}
                </tr>
            );

            // Переходим к следующему уровню
            const nextLevelNodes = [];
            currentLevelNodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    nextLevelNodes.push(...node.children);
                }
            });

            currentLevelNodes = filterVisibleNodes(nextLevelNodes);
            depth++;
        }

        return rows;
    }, [treeStructure, filterVisibleNodes, calculateColspan, isNodeFullyVisible, activeColorTheme]);

    return (
        <thead style={{
            position: 'sticky',
            top: 0,
            backgroundColor: activeColorTheme("BGHeader"),
            zIndex: 10
        }}>
        {renderHeaderRows()}
        </thead>
    );
};
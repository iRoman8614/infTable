import React, { useCallback, useMemo } from 'react';
import {getContrastTextColor} from '../utils/ContrastTextColor'


/**
 * Оптимизированный компонент заголовка таблицы
 */
export const TableHeader = React.memo(({
                                           treeStructure,
                                           nodeVisibility,
                                           activeColorTheme
                                       }) => {
    // Мемоизированная проверка полной видимости узла
    const isNodeFullyVisible = useCallback((nodeId) => {
        if (!nodeVisibility || typeof nodeVisibility !== 'object') {
            return true; // По умолчанию считаем видимым
        }

        let currentNodeId = nodeId;
        while (currentNodeId) {
            if (!nodeVisibility[currentNodeId]) {
                return false;
            }
            const node = treeStructure.nodesMap?.get(currentNodeId);
            if (!node) {
                return false;
            }
            currentNodeId = node.parentId;
        }
        return true;
    }, [nodeVisibility, treeStructure.nodesMap]);

    // Мемоизированная функция расчета colspan
    const calculateColspan = useCallback((node) => {
        if (!node) {
            return 0;
        }

        if (!node.children || node.children.length === 0) {
            const isVisible = isNodeFullyVisible(node.id);
            return isVisible ? 1 : 0;
        }

        const colspan = node.children.reduce((sum, child) => sum + calculateColspan(child), 0);
        return colspan;
    }, [isNodeFullyVisible]);

    // Мемоизированная фильтрация видимых узлов
    const filterVisibleNodes = useCallback((nodes) => {
        if (!Array.isArray(nodes)) {
            return [];
        }

        const filtered = nodes.filter(node => {
            if (isNodeFullyVisible(node.id)) {
                return true;
            }

            const hasVisibleDescendants = (n) => {
                if (!n.children || n.children.length === 0) return false;
                return n.children.some(child =>
                    isNodeFullyVisible(child.id) || hasVisibleDescendants(child)
                );
            };

            const hasVisible = hasVisibleDescendants(node);
            return hasVisible;
        }).map(node => ({
            ...node,
            children: filterVisibleNodes(node.children || [])
        }));
        return filtered;
    }, [isNodeFullyVisible]);

    // Мемоизированное видимое дерево
    const visibleTree = useMemo(() => {
        if (!treeStructure || !treeStructure.tree || !Array.isArray(treeStructure.tree)) {
            return [];
        }
        return filterVisibleNodes(treeStructure.tree);
    }, [treeStructure.tree, filterVisibleNodes]);

    // Мемоизированный рендер строк заголовка
    const headerRows = useMemo(() => {
        if (!treeStructure || visibleTree.length === 0) {
            return [];
        }

        console.log('[TableHeader] Пересчет строк заголовка');
        console.log('[TableHeader] Видимое дерево:', visibleTree);
        console.log('[TableHeader] Максимальная глубина:', treeStructure.maxDepth);

        const rows = [];
        let currentLevelNodes = visibleTree;
        let depth = 1;

        while (currentLevelNodes.length > 0 && depth <= treeStructure.maxDepth) {
            const currentDepth = depth;
            const rowCells = [];

            // Ячейка "Дата" - отображается только в первой строке
            if (currentDepth === 1) {
                rowCells.push(
                    <th
                        key="date-header"
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
                );
            }

            // Ячейки для узлов дерева
            currentLevelNodes.forEach(node => {
                const colspan = calculateColspan(node);
                if (colspan === 0) {
                    return;
                }

                const isVisible = isNodeFullyVisible(node.id);
                const backgroundColor = isVisible && node.metadata?.color ? node.metadata.color : '#ccc';
                const rowSpan = (!node.children || node.children.length === 0) ?
                    treeStructure.maxDepth - currentDepth + 1 : 1;

                rowCells.push(
                    <th
                        key={node.id}
                        colSpan={colspan}
                        rowSpan={rowSpan}
                        style={{
                            backgroundColor: backgroundColor,
                            padding: '8px',
                            fontSize: '12px',
                            fontWeight: 'normal',
                            textAlign: 'center',
                            color: getContrastTextColor(backgroundColor),
                            opacity: isVisible ? 1 : 0.5,
                            border: '1px solid #ddd'
                        }}
                    >
                        {node.name}
                    </th>
                );
            });

            rows.push(
                <tr key={`header-row-${currentDepth}`}>
                    {rowCells}
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
    }, [
        treeStructure,
        visibleTree,
        calculateColspan,
        isNodeFullyVisible,
        activeColorTheme,
        filterVisibleNodes
    ]);

    // Мемоизированный стиль заголовка
    const headerStyle = useMemo(() => ({
        position: 'sticky',
        top: 0,
        backgroundColor: activeColorTheme("BGHeader"),
        zIndex: 10
    }), [activeColorTheme]);

    return (
        <thead style={headerStyle}>
        {headerRows}
        </thead>
    );
});
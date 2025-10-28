import React, { useCallback, useMemo } from 'react';
import {getContrastTextColor} from '../utils/ContrastTextColor'

/**
 * Оптимизированный компонент заголовка таблицы
 */
export const TableHeader = React.memo(({
                                           treeStructure,
                                           nodeVisibility,
                                           activeColorTheme,
                                           allowedTypes = ['NODE', 'ASSEMBLE', 'COMPONENT'],
                                           onFilterClick
                                       }) => {

    const isNodeFullyVisible = useCallback((nodeId) => {
        if (!nodeVisibility || typeof nodeVisibility !== 'object') {
            return true;
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

    const isNodeTypeAllowed = useCallback((node) => {
        if (!node || !node.type) {
            return true;
        }
        return allowedTypes.includes(node.type);
    }, [allowedTypes]);

    const calculateColspan = useCallback((node) => {
        if (!node) {
            return 0;
        }

        if (!isNodeTypeAllowed(node)) {
            if (node.children && node.children.length > 0) {
                return node.children.reduce((sum, child) => sum + calculateColspan(child), 0);
            }
            return 0;
        }

        if (!node.children || node.children.length === 0) {
            const isVisible = isNodeFullyVisible(node.id);
            return isVisible ? 1 : 0;
        }

        const colspan = node.children.reduce((sum, child) => sum + calculateColspan(child), 0);
        return colspan;
    }, [isNodeFullyVisible, isNodeTypeAllowed]);

    const filterVisibleNodes = useCallback((nodes) => {
        if (!Array.isArray(nodes)) {
            return [];
        }

        const filtered = nodes.filter(node => {
            if (!isNodeTypeAllowed(node)) {
                return false;
            }

            if (isNodeFullyVisible(node.id)) {
                return true;
            }

            const hasVisibleDescendants = (n) => {
                if (!n.children || n.children.length === 0) return false;
                return n.children.some(child =>
                    isNodeTypeAllowed(child) && (isNodeFullyVisible(child.id) || hasVisibleDescendants(child))
                );
            };

            const hasVisible = hasVisibleDescendants(node);
            return hasVisible;
        }).map(node => ({
            ...node,
            children: filterVisibleNodes(node.children || [])
        }));
        return filtered;
    }, [isNodeFullyVisible, isNodeTypeAllowed]);

    const visibleTree = useMemo(() => {
        if (!treeStructure || !treeStructure.tree || !Array.isArray(treeStructure.tree)) {
            return [];
        }
        return filterVisibleNodes(treeStructure.tree);
    }, [treeStructure.tree, filterVisibleNodes]);

    const headerRows = useMemo(() => {
        if (!treeStructure || visibleTree.length === 0) {
            return [];
        }

        const rows = [];
        let currentLevelNodes = visibleTree;
        let depth = 1;

        while (currentLevelNodes.length > 0 && depth <= treeStructure.maxDepth) {
            const currentDepth = depth;
            const rowCells = [];

            if (currentDepth === 1) {
                rowCells.push(
                    <th
                        key="date-header"
                        rowSpan={treeStructure.maxDepth}
                        className="vt-th-date"
                        style={{
                            color: getContrastTextColor(activeColorTheme("BGHeader")),
                            backgroundColor: activeColorTheme("BGHeader")
                        }}
                    >
                        <div className="vt-th-tools">
                            <span>Дата</span>
                        </div>
                    </th>
                );
            }

            currentLevelNodes.forEach(node => {
                if (!isNodeTypeAllowed(node)) {
                    return;
                }

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
                        className="vt-th-node"
                        style={{
                            backgroundColor: backgroundColor,
                            color: getContrastTextColor(backgroundColor),
                            opacity: isVisible ? 1 : 0.5
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

    const headerStyle = useMemo(() => ({
        backgroundColor: activeColorTheme("BGHeader")
    }), [activeColorTheme]);

    return (
        <thead className="vt-thead" style={headerStyle}>
        {headerRows}
        </thead>
    );
});
import React, {useCallback, useMemo, useState} from 'react';
import {getContrastTextColor} from '../utils/ContrastTextColor'

/**
 * Оптимизированный компонент заголовка таблицы
 */
export const TableHeader = React.memo(({
                                           treeStructure,
                                           nodeVisibility,
                                           activeColorTheme,
                                           allowedTypes = ['NODE', 'ASSEMBLE', 'COMPONENT'],
                                           jumpToDate,
                                           onDatePickerClick
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

    const handleDatePickerClick = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();

        console.log('[TableHeader] Date picker button clicked');

        if (onDatePickerClick) {
            onDatePickerClick();
        }

        if (typeof window !== 'undefined' && window.VirtualizedTableState?.onDatePickerClick) {
            try {
                window.VirtualizedTableState.onDatePickerClick();
            } catch (error) {
                console.error('Ошибка в VirtualizedTableState.onDatePickerClick:', error);
            }
        } else {
            console.warn('[TableHeader] VirtualizedTableState.onDatePickerClick не установлен');
        }

        const customEvent = new CustomEvent('table-date-picker-click', {
            bubbles: true
        });
        window.dispatchEvent(customEvent);
    }, [onDatePickerClick]);

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
                            <div className="vt-th-tool">
                                <span>Дата</span>{"  "}
                                <button className="vt-th-date-btn" onClick={handleDatePickerClick}>
                                    <svg  width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 9H21M7 3V5M17 3V5M6 13H8M6 17H8M11 13H13M11 17H13M16 13H18M16 17H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                </button>
                            </div>
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
        filterVisibleNodes,
        jumpToDate,
        handleDatePickerClick
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
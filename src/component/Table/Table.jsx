import React, {useState, useMemo, useCallback, useEffect} from 'react';
import { TableHeader } from './components/TableHeader.jsx';
// import { FilterModal } from './components/FilterModal.jsx';
import { useTableLogic } from './hooks/useTableLogic.js';
import { useNodeVisibility } from './hooks/useNodeVisibility.js';
import { useChildrenVisibility } from './hooks/useChildrenVisibility.js';
import { useDragAndDrop } from './hooks/useDragAndDrop.js';
import { parseDateString } from './utils/dateUtils.js';
import { useHeadersLoader, useGlobalClickHandlers } from './hooks/useTableHelpers.js';
import {getContrastTextColor} from "./utils/ContrastTextColor";
import '../../styles/table.css';

const ALLOWED_HEADER_TYPES = ['NODE', 'ASSEMBLE'];

export const Table = ({
                          maxWidth = '100%',
                          maxHeight = '600px',
                          colorTheme,
                          scrollBatchSize = 30,
                          debug = false,
                          dataProvider = null,
                          headerProvider = null,
                          onDataLoad = null,
                          onError = null,
                          onCellDoubleClick = null,
                          onCellMove = null,
                          editMode: propEditMode,
                          // showFilters: propShowFilters,
                          showDeviations: propShowDeviations,
                          dateRange: propDateRange
                      }) => {
    const [clickLoading, setClickLoading] = useState(new Set());
    const [dateRangeState, setDateRangeState] = useState(
        typeof window !== 'undefined' && window.VirtualizedTableState
            ? window.VirtualizedTableState.dateRange
            : (propDateRange || null)
    );

    const editMode = useMemo(() => {
        return typeof window !== 'undefined' && window.VirtualizedTableState
            ? window.VirtualizedTableState.editMode
            : (propEditMode || false);
    }, [propEditMode]);

    const dateRange = useMemo(() => {
        return dateRangeState;
    }, [dateRangeState]);

    // const showFilters = useMemo(() => {
    //     return typeof window !== 'undefined' && window.VirtualizedTableState
    //         ? window.VirtualizedTableState.showFilters
    //         : (propShowFilters || false);
    // }, [propShowFilters]);

    useEffect(() => {
        let isMounted = true;

        return () => {
            if (!isMounted) return;
            isMounted = false;

            console.log('[Table] Реальное размонтирование - сброс');

            if (typeof window !== 'undefined' && typeof window.resetTableInitialization === 'function') {
                window.resetTableInitialization();
            }

            if (typeof window !== 'undefined' && window.VirtualizedTableState) {
                window.VirtualizedTableState._initialized = false;
                window.VirtualizedTableState._loading = false;
                window.VirtualizedTableState._error = null;
                delete window.VirtualizedTableState.refreshTableViewport;
            }
        };
    }, []);

    const { headersData, headersError, isLoading: headersLoading } = useHeadersLoader(
        typeof window !== 'undefined' && window.VirtualizedTableState?.headerProvider
            ? window.VirtualizedTableState.headerProvider
            : headerProvider
    );

    const activeColorTheme = useMemo(() => {
        if (colorTheme) return colorTheme;

        return (value, isPast) => {
            if (value === "BGHeader") return '#dee3f5';
            if (value === "DATE") return isPast ? '#acb5e3' : 'white';

            switch (value) {
                case 0: return isPast ? '#acb5e3' : 'white';
                default: return isPast ? '#acb5e3' : 'white';
            }
        };
    }, [colorTheme]);

    const filterNodesByType = useCallback((nodes, allowedTypes) => {
        return nodes.reduce((filtered, node) => {
            if (!allowedTypes.includes(node.type)) {
                if (node.children && node.children.length > 0) {
                    const filteredChildren = filterNodesByType(node.children, allowedTypes);
                    filtered.push(...filteredChildren);
                }
                return filtered;
            }

            const filteredChildren = node.children && node.children.length > 0
                ? filterNodesByType(node.children, allowedTypes)
                : [];

            filtered.push({
                ...node,
                children: filteredChildren
            });

            return filtered;
        }, []);
    }, []);

    const fullTreeStructure = useMemo(() => {
        if (!headersData || !headersData.headers || !Array.isArray(headersData.headers)) {
            return { tree: [], maxDepth: 1, leafNodes: [], nodesMap: new Map() };
        }

        const nodesMap = new Map();
        const tree = [];

        headersData.headers.forEach(header => {
            nodesMap.set(header.id, { ...header, children: [] });
        });

        headersData.headers.forEach(header => {
            if (header.parentId === null || header.parentId === undefined) {
                tree.push(nodesMap.get(header.id));
            } else {
                const parent = nodesMap.get(header.parentId);
                if (parent) {
                    parent.children.push(nodesMap.get(header.id));
                }
            }
        });

        const getMaxDepth = (node) => {
            if (node.children.length === 0) return 1;
            return 1 + Math.max(...node.children.map(getMaxDepth));
        };
        const maxDepth = tree.length > 0 ? Math.max(...tree.map(getMaxDepth)) : 1;

        const leafNodes = [];
        const findLeaves = (node) => {
            if (node.children.length === 0) {
                leafNodes.push(node);
            } else {
                node.children.forEach(findLeaves);
            }
        };
        tree.forEach(findLeaves);

        return { tree, maxDepth, leafNodes, nodesMap };
    }, [headersData]);

    // Структура дерева для заголовков (только NODE и ASSEMBLE)
    const treeStructure = useMemo(() => {
        const filteredTree = filterNodesByType(fullTreeStructure.tree, ALLOWED_HEADER_TYPES);

        const getMaxDepth = (node) => {
            if (!node.children || node.children.length === 0) return 1;
            return 1 + Math.max(...node.children.map(getMaxDepth));
        };
        const maxDepth = filteredTree.length > 0 ? Math.max(...filteredTree.map(getMaxDepth)) : 1;

        const leafNodes = [];
        const findLeaves = (node) => {
            if (!node.children || node.children.length === 0) {
                leafNodes.push(node);
            } else {
                node.children.forEach(findLeaves);
            }
        };
        filteredTree.forEach(findLeaves);

        return {
            tree: filteredTree,
            maxDepth,
            leafNodes,
            nodesMap: fullTreeStructure.nodesMap
        };
    }, [fullTreeStructure, filterNodesByType]);

    const filterTreeStructure = useMemo(() => {
        return fullTreeStructure;
    }, [fullTreeStructure]);

    const [childrenData, setChildrenData] = useState(
        (typeof window !== 'undefined' && window.VirtualizedTableState)
            ? window.VirtualizedTableState.childrenData
            : []
    );

    useEffect(() => {
        const handleStateChange = (event) => {
            if (event.detail.property === 'childrenData') {
                setChildrenData(event.detail.value);
            } else if (event.detail.property === 'dateRange') {
                console.log('[Table] dateRange changed to:', event.detail.value);
                setDateRangeState(event.detail.value);
            }
        };

        window.addEventListener('virtualized-table-state-change', handleStateChange);
        return () => window.removeEventListener('virtualized-table-state-change', handleStateChange);
    }, []);

    const getCellChildren = useCallback((processedRow, nodeId) => {
        if (!processedRow || !processedRow.elements || !processedRow.elements[nodeId]) {
            return [];
        }

        const element = processedRow.elements[nodeId];
        const children = element.children || [];
        const result = [];

        children.forEach(child => {
            if (child.subChildren && Array.isArray(child.subChildren)) {
                child.subChildren.forEach(subChild => {
                    result.push({
                        ...subChild,
                        parentId: child.id
                    });
                });
            } else if (child.value) {
                result.push({
                    id: child.id,
                    value: child.value,
                    name: child.name,
                    parentId: null
                });
            }
        });

        return result;
    }, []);

    const getVisibleCellChildren = useCallback((processedRow, nodeId) => {
        const children = getCellChildren(processedRow, nodeId);
        if (children.length === 0) return [];

        const result = children.filter(child => {
            if (child.parentId === 'shift' || child.id === 'shift') {
                return false;
            }

            if (childrenData.length === 0) {
                return false;
            }

            const isIncluded = childrenData.includes(child.id);
            return isIncluded;
        });
        return result;
    }, [getCellChildren, childrenData]);

    const shouldDisplayCell = useCallback((processedRow, nodeId) => {
        if (!processedRow || !processedRow.elements || !processedRow.elements[nodeId]) {
            return true; // Показываем пустую ячейку если нет данных
        }

        const element = processedRow.elements[nodeId];
        return element.displayed !== false; // Отображаем если не явно скрыта
    }, []);


    const tableLogic = useTableLogic({
        scrollBatchSize,
        dataProvider,
        onDataLoad,
        onError,
        treeStructure,
        getVisibleCellChildren,
        shouldDisplayCell,
        dateRange
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && tableLogic.refreshViewport) {
            window.refreshTableViewport = tableLogic.refreshViewport;

            return () => {
                delete window.refreshTableViewport;
            };
        }
    }, [tableLogic.refreshViewport]);

    useEffect(() => {
        if (typeof window !== 'undefined' && tableLogic.jumpToDate && window.VirtualizedTableState) {
            window.VirtualizedTableState.jumpToDate = tableLogic.jumpToDate;

            return () => {
                if (window.VirtualizedTableState) {
                    delete window.VirtualizedTableState.jumpToDate;
                }
            };
        }
    }, [tableLogic.jumpToDate]);

    const filterNodeVisibilityLogic = useNodeVisibility(filterTreeStructure);
    const nodeVisibilityLogic = useNodeVisibility(treeStructure);

    const syncedNodeVisibility = useMemo(() => {
        const synced = { ...nodeVisibilityLogic.nodeVisibility };
        Object.keys(filterNodeVisibilityLogic.nodeVisibility).forEach(nodeId => {
            const node = filterTreeStructure.nodesMap.get(nodeId);
            if (node && node.type !== 'COMPONENT') {
                synced[nodeId] = filterNodeVisibilityLogic.nodeVisibility[nodeId];
            }
        });
        return synced;
    }, [nodeVisibilityLogic.nodeVisibility, filterNodeVisibilityLogic.nodeVisibility, filterTreeStructure.nodesMap]);

    useEffect(() => {
        const handleStateChange = (event) => {
            if (event.detail.property === 'visibleColumns') {
                const columnIds = event.detail.value;
                console.log('[Table] visibleColumns changed:', columnIds);

                if (columnIds.length === 0) {
                    // Пустой массив - показать все (восстановить дефолтное состояние)
                    filterTreeStructure.nodesMap.forEach((node, nodeId) => {
                        const shouldBeVisible = node.type !== 'COMPONENT'; // COMPONENT скрыты по умолчанию
                        filterNodeVisibilityLogic.setNodeVisibilityDirect(nodeId, shouldBeVisible);
                    });
                } else {
                    // Непустой массив - показать ТОЛЬКО указанные ID
                    filterTreeStructure.nodesMap.forEach((node, nodeId) => {
                        const shouldBeVisible = columnIds.includes(nodeId);
                        console.log(`[Table] Setting ${nodeId} visibility to ${shouldBeVisible}`);
                        filterNodeVisibilityLogic.setNodeVisibilityDirect(nodeId, shouldBeVisible);
                    });
                }

                // Принудительно обновляем viewport
                if (tableLogic.refreshViewport) {
                    setTimeout(() => {
                        tableLogic.refreshViewport();
                    }, 50);
                }

                console.log('[Table] Visibility updated');
            }
        };

        window.addEventListener('virtualized-table-state-change', handleStateChange);
        return () => window.removeEventListener('virtualized-table-state-change', handleStateChange);
    }, [filterNodeVisibilityLogic, filterTreeStructure, tableLogic]);

    // const [childrenData, setChildrenData] = useState(
    //     (typeof window !== 'undefined' && window.VirtualizedTableState)
    //         ? window.VirtualizedTableState.childrenData
    //         : []
    // );
    //
    // useEffect(() => {
    //     const handleStateChange = (event) => {
    //         if (event.detail.property === 'childrenData') {
    //             setChildrenData(event.detail.value);
    //         }
    //     };
    //
    //     window.addEventListener('virtualized-table-state-change', handleStateChange);
    //     return () => window.removeEventListener('virtualized-table-state-change', handleStateChange);
    // }, []);

    const [showDeviations, setShowDeviations] = useState(
        (typeof window !== 'undefined' && window.VirtualizedTableState)
            ? window.VirtualizedTableState.showDeviations
            : (propShowDeviations || false)
    );

    useEffect(() => {
        const handleStateChange = (event) => {
            if (event.detail.property === 'showDeviations') {
                console.log('[Table] showDeviations changed to:', event.detail.value);
                setShowDeviations(event.detail.value);
            }
        };

        window.addEventListener('virtualized-table-state-change', handleStateChange);
        return () => window.removeEventListener('virtualized-table-state-change', handleStateChange);
    }, []);

    const isNodeFullyVisible = useCallback((nodeId) => {
        let currentNodeId = nodeId;
        while (currentNodeId) {
            if (!syncedNodeVisibility[currentNodeId]) return false;
            const node = treeStructure.nodesMap.get(currentNodeId);
            if (!node) return false;
            currentNodeId = node.parentId;
        }
        return true;
    }, [syncedNodeVisibility, treeStructure.nodesMap]);

    const visibleLeafNodes = useMemo(() => {
        return treeStructure.leafNodes.filter(node => isNodeFullyVisible(node.id));
    }, [treeStructure.leafNodes, isNodeFullyVisible]);

    const childrenVisibilityLogic = useChildrenVisibility(treeStructure, tableLogic.processedCache);

    // Drag & Drop функциональность
    const dragDropHandlers = useDragAndDrop(editMode, onCellMove);

    const hasDoubleClickHandlers = useMemo(() => {
        const hasProps = !!onCellDoubleClick;
        const hasGlobal = typeof window !== 'undefined' && window.VirtualizedTableState?.onCellDoubleClick;

        if (debug) {
            console.log('[Table] Double click handlers check:', {
                onCellDoubleClick: hasProps,
                globalDoubleClickHandler: !!hasGlobal
            });
        }

        return hasProps || hasGlobal;
    }, [onCellDoubleClick, debug]);

    // обработчик двойного клика
    const handleCellDoubleClick = useCallback(async (date, nodeId, cellValue, event) => {
        const clickKey = `${date}-${nodeId}`;

        if (clickLoading.has(clickKey)) {
            return;
        }

        setClickLoading(prev => new Set([...prev, clickKey]));

        try {
            const cellData = {
                date,
                nodeId,
                value: cellValue,
                draggable: getCellDraggable(tableLogic.processedCache[date], nodeId),
                backgroundColor: getCellBackgroundColor(tableLogic.processedCache[date], nodeId),
                fontColor: getCellFontColor(tableLogic.processedCache[date], nodeId)
            };

            console.log('[Table] Cell double-clicked, preparing data:', cellData);

            if (onCellDoubleClick) {
                await onCellDoubleClick(cellData, event);
            } else {
                console.log('[Table] No onCellDoubleClick prop, skipping');
            }

        } catch (error) {
            console.error('[Table] Double click error:', error);
        } finally {
            setClickLoading(prev => {
                const updated = new Set(prev);
                updated.delete(clickKey);
                return updated;
            });
        }
    }, [clickLoading, onCellDoubleClick, tableLogic.processedCache]);

    const getCellValue = useCallback((processedRow, nodeId) => {
        if (!processedRow) {
            return '-';
        }

        if (!processedRow.elements || Object.keys(processedRow.elements).length === 0) {
            return '-';
        }

        if (!processedRow.elements[nodeId]) {
            return null;
        }

        const element = processedRow.elements[nodeId];
        const value = element.status;

        if (value === null || value === undefined || value === '') {
            return null;
        }

        return value;
    }, []);

    // Получение цвета ячейки из данных
    const getCellColor = useCallback((processedRow, nodeId) => {
        return processedRow?.elements?.[nodeId]?.color || null;
    }, []);

    // Получение цвета фона ячейки из данных
    const getCellBackgroundColor = useCallback((processedRow, nodeId) => {
        return processedRow?.elements?.[nodeId]?.backgroundColor || null;
    }, []);

    // Получение цвета текста ячейки из данных
    const getCellFontColor = useCallback((processedRow, nodeId) => {
        return processedRow?.elements?.[nodeId]?.fontColor || null;
    }, []);


    // Получение флага draggable из данных
    const getCellDraggable = useCallback((processedRow, nodeId) => {
        if (!processedRow || !processedRow.elements || !processedRow.elements[nodeId]) {
            return false;
        }

        const element = processedRow.elements[nodeId];
        return element.draggable === true;
    }, []);

    // Функция проверки нужно ли отображать ячейку (учитывает rowspan и colspan)
    // const shouldDisplayCell = useCallback((processedRow, nodeId) => {
    //     if (!processedRow || !processedRow.elements || !processedRow.elements[nodeId]) {
    //         return true; // Показываем пустую ячейку если нет данных
    //     }
    //
    //     const element = processedRow.elements[nodeId];
    //     return element.displayed !== false; // Отображаем если не явно скрыта
    // }, []);

    // Функция получения rowspan
    const getCellRowspan = useCallback((processedRow, nodeId) => {
        if (!processedRow || !processedRow.elements || !processedRow.elements[nodeId]) {
            return 1;
        }

        const element = processedRow.elements[nodeId];
        return element.displayed === false ? 0 : (element.rowspan || 1);
    }, []);

    // Функция получения colspan
    const getCellColspan = useCallback((processedRow, nodeId) => {
        if (!processedRow || !processedRow.elements || !processedRow.elements[nodeId]) {
            return 1;
        }

        const element = processedRow.elements[nodeId];
        return element.displayed === false ? 0 : (element.colspan || 1);
    }, []);

    // const getCellChildren = useCallback((processedRow, nodeId) => {
    //     if (!processedRow || !processedRow.elements || !processedRow.elements[nodeId]) {
    //         return [];
    //     }
    //
    //     const element = processedRow.elements[nodeId];
    //     const children = element.children || [];
    //     const result = [];
    //
    //     children.forEach(child => {
    //         if (child.subChildren && Array.isArray(child.subChildren)) {
    //             child.subChildren.forEach(subChild => {
    //                 result.push({
    //                     ...subChild,
    //                     parentId: child.id
    //                 });
    //             });
    //         } else if (child.value) {
    //             result.push({
    //                 id: child.id,
    //                 value: child.value,
    //                 name: child.name,
    //                 parentId: null
    //             });
    //         }
    //     });
    //
    //     return result;
    // }, []);

    const getCellShift = useCallback((processedRow, nodeId) => {
        if (!processedRow || !processedRow.elements || !processedRow.elements[nodeId]) {
            return [];
        }
        const element = processedRow.elements[nodeId];
        const children = element.children || [];
        const shiftChild = children.find(c => c.id === 'shift');
        if (!shiftChild) {
            return [];
        }

        if (shiftChild.subChildren && Array.isArray(shiftChild.subChildren) && shiftChild.subChildren.length > 0) {
            return shiftChild.subChildren;
        }

        if (shiftChild.value) {
            return [{
                id: 'shift',
                value: shiftChild.value,
                name: shiftChild.name
            }];
        }
        return [];
    }, []);

    const getCellOperating = useCallback((processedRow, nodeId) => {
        if (!processedRow || !processedRow.elements || !processedRow.elements[nodeId]) {
            return [];
        }

        const element = processedRow.elements[nodeId];
        return element.operating || [];
    }, []);

    // const getVisibleCellChildren = useCallback((processedRow, nodeId) => {
    //     const children = getCellChildren(processedRow, nodeId);
    //     if (children.length === 0) return [];
    //
    //     const result = children.filter(child => {
    //         if (child.parentId === 'shift' || child.id === 'shift') {
    //             return false;
    //         }
    //
    //         if (childrenData.length === 0) {
    //             return false;
    //         }
    //
    //         const isIncluded = childrenData.includes(child.id);
    //         return isIncluded;
    //     });
    //     return result;
    // }, [getCellChildren, childrenData]);

    const hasAnyVisibleChildren = useMemo(() => {
        return Object.values(childrenVisibilityLogic.childrenVisibility).some(nodeChildren =>
            Object.values(nodeChildren).some(isVisible => isVisible)
        );
    }, [childrenVisibilityLogic.childrenVisibility]);

    let startIndex, endIndex, visibleDates, paddingTop, paddingBottom;

    if (hasAnyVisibleChildren) {
        const calculateDynamicViewport = () => {
            if (!tableLogic.containerRef.current) {
                return { start: 0, end: Math.min(tableLogic.dates.length, 20) };
            }

            const container = tableLogic.containerRef.current;
            const scrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;

            if (!containerHeight || containerHeight === 0 || tableLogic.dates.length === 0) {
                return { start: 0, end: Math.min(tableLogic.dates.length, 20) };
            }

            let visibleStart = 0;
            let currentPosition = 0;

            for (let i = 0; i < tableLogic.dates.length; i++) {
                const dateString = tableLogic.dates[i];
                const processedRow = tableLogic.processedCache[dateString];

                let rowHeight = 40; // Высота по умолчанию
                if (processedRow) {
                    const hasChildrenInRow = visibleLeafNodes.some(leafNode => {
                        if (!shouldDisplayCell(processedRow, leafNode.id)) return false;
                        const cellChildren = getVisibleCellChildren(processedRow, leafNode.id);
                        return cellChildren.length > 0;
                    });
                    rowHeight = hasChildrenInRow ? 120 : 40;
                }

                if (currentPosition + rowHeight > scrollTop) {
                    visibleStart = i;
                    break;
                }
                currentPosition += rowHeight;
            }

            // Находим индекс строки, которая находится в нижней части viewport
            let visibleEnd = tableLogic.dates.length;
            currentPosition = 0;

            for (let i = 0; i < tableLogic.dates.length; i++) {
                const dateString = tableLogic.dates[i];
                const processedRow = tableLogic.processedCache[dateString];

                let rowHeight = 40; // Высота по умолчанию
                if (processedRow) {
                    const hasChildrenInRow = visibleLeafNodes.some(leafNode => {
                        if (!shouldDisplayCell(processedRow, leafNode.id)) return false;
                        const cellChildren = getVisibleCellChildren(processedRow, leafNode.id);
                        return cellChildren.length > 0;
                    });
                    rowHeight = hasChildrenInRow ? 120 : 40;
                }

                if (currentPosition > scrollTop + containerHeight) {
                    visibleEnd = i;
                    break;
                }
                currentPosition += rowHeight;
            }

            const bufferSize = 10;
            const start = Math.max(0, visibleStart - bufferSize);
            const end = Math.min(tableLogic.dates.length, visibleEnd + bufferSize);

            return { start, end };
        };

        const dynamicViewport = calculateDynamicViewport();
        startIndex = dynamicViewport.start;
        endIndex = dynamicViewport.end;
        visibleDates = tableLogic.dates.slice(startIndex, endIndex);

        // Вычисляем динамические отступы
        let topPadding = 0;
        let bottomPadding = 0;

        // paddingTop - сумма высот всех строк до startIndex
        for (let i = 0; i < startIndex; i++) {
            const dateString = tableLogic.dates[i];
            const processedRow = tableLogic.processedCache[dateString];

            if (processedRow) {
                const hasChildrenInRow = nodeVisibilityLogic.visibleLeafNodes.some(leafNode => {
                    if (!shouldDisplayCell(processedRow, leafNode.id)) return false;
                    const cellChildren = getVisibleCellChildren(processedRow, leafNode.id);
                    return cellChildren.length > 0;
                });
                topPadding += hasChildrenInRow ? 120 : 40;
            } else {
                topPadding += 40;
            }
        }

        // paddingBottom - сумма высот всех строк после endIndex
        for (let i = endIndex; i < tableLogic.dates.length; i++) {
            const dateString = tableLogic.dates[i];
            const processedRow = tableLogic.processedCache[dateString];

            if (processedRow) {
                const hasChildrenInRow = nodeVisibilityLogic.visibleLeafNodes.some(leafNode => {
                    if (!shouldDisplayCell(processedRow, leafNode.id)) return false;
                    const cellChildren = getVisibleCellChildren(processedRow, leafNode.id);
                    return cellChildren.length > 0;
                });
                bottomPadding += hasChildrenInRow ? 120 : 40;
            } else {
                bottomPadding += 40;
            }
        }

        paddingTop = topPadding;
        paddingBottom = bottomPadding;
    } else {
        // Статический режим: используем стандартную логику
        const { start, end } = tableLogic.visibleRange;
        startIndex = start;
        endIndex = end;
        visibleDates = tableLogic.dates.slice(startIndex, endIndex);
        paddingTop = startIndex * tableLogic.rowHeight;
        paddingBottom = Math.max(0, (tableLogic.dates.length - endIndex) * tableLogic.rowHeight);
    }

    // Отображение ошибки
    if (headersError) {
        return (
            <div className="vt-error">
                <h4>Ошибка загрузки заголовков</h4>
                <p>{headersError}</p>
                <p className="vt-error__note">
                    Используются заголовки по умолчанию
                </p>
            </div>
        );
    }

    // Отображение загрузки заголовков
    if (headersLoading) {
        return (
            <div className="vt-loading">
                <div className="vt-spinner" />
                Загрузка заголовков...
            </div>
        );
    }

    return (
        <>
            {/*<FilterModal*/}
            {/*    isOpen={showFilters}*/}
            {/*    onClose={() => {*/}
            {/*        if (typeof window !== 'undefined' && window.VirtualizedTableAPI) {*/}
            {/*            window.VirtualizedTableAPI.setShowFilters(false);*/}
            {/*        }*/}
            {/*    }}*/}
            {/*    filteredTree={filterNodeVisibilityLogic.filteredTree}*/}
            {/*    nodeVisibility={filterNodeVisibilityLogic.nodeVisibility}*/}
            {/*    expandedNodes={filterNodeVisibilityLogic.expandedNodes}*/}
            {/*    searchTerm={filterNodeVisibilityLogic.searchTerm}*/}
            {/*    setSearchTerm={filterNodeVisibilityLogic.setSearchTerm}*/}
            {/*    toggleNodeVisibility={toggleFilterNodeVisibility}*/}
            {/*    toggleNodeExpansion={filterNodeVisibilityLogic.toggleNodeExpansion}*/}
            {/*    childrenVisibility={childrenVisibilityLogic.childrenVisibility}*/}
            {/*    toggleChildrenVisibility={childrenVisibilityLogic.toggleChildrenVisibility}*/}
            {/*/>*/}

            <div
                ref={tableLogic.containerRef}
                className="vt-container"
                style={{ maxWidth, maxHeight }}
                onScroll={tableLogic.handleScroll}
            >
                <table className="vt-table">
                    <TableHeader
                        treeStructure={treeStructure}
                        nodeVisibility={syncedNodeVisibility}
                        activeColorTheme={activeColorTheme}
                        allowedTypes={ALLOWED_HEADER_TYPES}
                        jumpToDate={tableLogic.jumpToDate}
                        onFilterClick={() => {
                            if (typeof window !== 'undefined' && window.VirtualizedTableAPI) {
                                window.VirtualizedTableAPI.setShowFilters(true);
                            }
                        }}
                    />

                    <tbody>
                    {paddingTop > 0 && (
                        <tr className="vt-spacer-row" style={{ height: paddingTop }}>
                            <td className="vt-spacer-cell" colSpan={visibleLeafNodes.length + 1} />
                        </tr>
                    )}

                    {visibleDates.map((dateString, index) => {
                        const processedRow = tableLogic.processedCache[dateString];
                        const isLoading = !processedRow;
                        const rowDate = parseDateString(dateString);
                        const isPastDate = rowDate.getTime() < tableLogic.today.getTime();

                        const hasChildrenInRow = nodeVisibilityLogic.visibleLeafNodes.some(leafNode => {
                            if (!shouldDisplayCell(processedRow, leafNode.id)) return false;
                            const cellChildren = processedRow ? getVisibleCellChildren(processedRow, leafNode.id) : [];
                            return cellChildren.length > 0;
                        });

                        const currentRowHeight = hasChildrenInRow ? 120 : 40;

                        return (
                            <tr
                                key={`${dateString}-${startIndex + index}`}
                                className="vt-row"
                                style={{ height: `${currentRowHeight}px`, backgroundColor: activeColorTheme("DATE", isPastDate) }}
                            >
                                <td className="vt-cell-date" style={{ color: isPastDate ? '#666' : 'inherit' }}>
                                    {dateString}
                                </td>

                                {visibleLeafNodes.map((leafNode) => {
                                    if (!shouldDisplayCell(processedRow, leafNode.id)) {
                                        return null;
                                    }

                                    const cellValue = processedRow ? getCellValue(processedRow, leafNode.id) : null;

                                    if (cellValue === null) {
                                        return null;
                                    }

                                    const cellBackgroundColor = processedRow ? getCellBackgroundColor(processedRow, leafNode.id) : null;
                                    const cellFontColor = processedRow ? getCellFontColor(processedRow, leafNode.id) : null;
                                    const isDraggable = processedRow ? getCellDraggable(processedRow, leafNode.id) : false;
                                    const cellRowspan = processedRow ? getCellRowspan(processedRow, leafNode.id) : 1;
                                    const cellColspan = processedRow ? getCellColspan(processedRow, leafNode.id) : 1;
                                    const cellChildren = processedRow ? getVisibleCellChildren(processedRow, leafNode.id) : [];
                                    const cellOperating = processedRow ? getCellOperating(processedRow, leafNode.id) : [];
                                    const cellShift = processedRow ? getCellShift(processedRow, leafNode.id) : [];
                                    const clickKey = `${dateString}-${leafNode.id}`;
                                    const isCellLoading = clickLoading.has(clickKey);

                                    const dragStyles = dragDropHandlers.getCellDragStyles(
                                        dateString,
                                        leafNode.id,
                                        cellBackgroundColor || activeColorTheme(cellValue, isPastDate),
                                        isDraggable
                                    );

                                    // Определяем итоговый цвет текста
                                    const finalFontColor = cellFontColor || getContrastTextColor(cellBackgroundColor || activeColorTheme(cellValue, isPastDate));

                                    return (
                                        <td
                                            key={`${dateString}-${leafNode.id}`}
                                            rowSpan={cellRowspan > 1 ? cellRowspan : undefined}
                                            colSpan={cellColspan > 1 ? cellColspan : undefined}
                                            draggable={editMode && isDraggable}
                                            onDoubleClick={editMode && hasDoubleClickHandlers ? (event) => {
                                                console.log('[Table] Cell double-clicked, calling double click handler');
                                                handleCellDoubleClick(dateString, leafNode.id, cellValue, event);
                                            } : undefined}
                                            onDragStart={editMode && isDraggable ? (e) => dragDropHandlers.handleDragStart(e, dateString, leafNode.id, cellValue, isDraggable) : undefined}
                                            onDragEnd={editMode && isDraggable ? dragDropHandlers.handleDragEnd : undefined}
                                            onDragOver={editMode ? (e) => dragDropHandlers.handleDragOver(e, dateString, leafNode.id, isDraggable) : undefined}
                                            onDragLeave={editMode ? dragDropHandlers.handleDragLeave : undefined}
                                            onDrop={editMode && isDraggable ? (e) => dragDropHandlers.handleDrop(e, dateString, leafNode.id, isDraggable) : undefined}
                                            className="vt-cell"
                                            style={{
                                                color: finalFontColor,
                                                width: cellColspan > 1 ? `${cellColspan * 50}px` : undefined,
                                                ...dragStyles
                                            }}
                                        >
                                            <div className="vt-cell__content">
                                                <div className="vt-cell__value">
                                                    {cellValue}
                                                </div>
                                                {showDeviations && cellShift.map((sh, idx) => (
                                                    <div key={`shift-${idx}`} title={sh.name}>
                                                        {sh.value}
                                                    </div>
                                                ))}
                                                {!isLoading && cellChildren.length > 0 && (
                                                    <div className="vt-cell__children">
                                                        {cellChildren.map((child, index) => (
                                                            <div key={child.id} title={child.name} className="vt-cell__child">
                                                                {child.value}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}

                    {paddingBottom > 0 && (
                        <tr className="vt-spacer-row" style={{ height: paddingBottom }}>
                            <td className="vt-spacer-cell" colSpan={visibleLeafNodes.length + 1} />
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Table;
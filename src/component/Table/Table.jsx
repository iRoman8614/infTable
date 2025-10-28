
import React, {useState, useMemo, useCallback, useEffect, useRef} from 'react';
import { TableHeader } from './components/TableHeader.jsx';
import { FilterModal } from './components/FilterModal.jsx';
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
                          scrollBatchSize = 50,
                          debug = false,
                          dataProvider = null,
                          headerProvider = null,
                          onDataLoad = null,
                          onError = null,
                          onCellDoubleClick = null,
                          onCellMove = null,
                          editMode: propEditMode,
                          showFilters: propShowFilters,
                          showDeviations: propShowDeviations
                      }) => {
    const [clickLoading, setClickLoading] = useState(new Set());

    const editMode = useMemo(() => {
        return typeof window !== 'undefined' && window.VirtualizedTableState
            ? window.VirtualizedTableState.editMode
            : (propEditMode || false);
    }, [propEditMode]);

    const showFilters = useMemo(() => {
        return typeof window !== 'undefined' && window.VirtualizedTableState
            ? window.VirtualizedTableState.showFilters
            : (propShowFilters || false);
    }, [propShowFilters]);

    const [showDeviations, setShowDeviations] = useState(
        (typeof window !== 'undefined' && window.VirtualizedTableState)
            ? window.VirtualizedTableState.showDeviations
            : (propShowDeviations || false)
    );

// Слушатель изменений showDeviations
    useEffect(() => {
        const handleStateChange = (event) => {
            if (event.detail.property === 'showDeviations') {
                setShowDeviations(event.detail.value);
            }
        };

        window.addEventListener('virtualized-table-state-change', handleStateChange);
        return () => window.removeEventListener('virtualized-table-state-change', handleStateChange);
    }, []);

    const hasGlobalHandlers = useGlobalClickHandlers();

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

    // Функция для фильтрации узлов по типу
    const filterNodesByType = useCallback((nodes, allowedTypes) => {
        return nodes.reduce((filtered, node) => {
            // Проверяем тип узла
            if (!allowedTypes.includes(node.type)) {
                // Если тип не разрешен, пропускаем этот узел, но проверяем его детей
                if (node.children && node.children.length > 0) {
                    const filteredChildren = filterNodesByType(node.children, allowedTypes);
                    filtered.push(...filteredChildren);
                }
                return filtered;
            }

            // Если тип разрешен, включаем узел с отфильтрованными детьми
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

    // Структура полного дерева (для внутренней логики)
    const fullTreeStructure = useMemo(() => {
        if (!headersData || !headersData.headers || !Array.isArray(headersData.headers)) {
            console.warn('[Table] Некорректные данные заголовков:', headersData);
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

    // Структура дерева для фильтров (все типы: NODE, ASSEMBLE, COMPONENT)
    const filterTreeStructure = useMemo(() => {
        // Для фильтров используем полное дерево без фильтрации
        return fullTreeStructure;
    }, [fullTreeStructure]);

    // Хуки для управления состоянием
    const tableLogic = useTableLogic({
        scrollBatchSize,
        dataProvider,
        onDataLoad,
        onError,
        treeStructure
    });

    // useEffect(() => {
    //     if (typeof window !== 'undefined' && tableLogic.refreshViewport) {
    //         window.refreshTableViewport = tableLogic.refreshViewport;
    //
    //         return () => {
    //             delete window.refreshTableViewport;
    //         };
    //     }
    // }, [tableLogic.refreshViewport]);

    useEffect(() => {
        if (typeof window !== 'undefined' && tableLogic.refreshViewport) {
            window.VirtualizedTableState.refreshTableViewport = tableLogic.refreshViewport;

            return () => {
                delete window.VirtualizedTableState.refreshTableViewport;
            };
        }
    }, [tableLogic.refreshViewport]);

    // Объединенная логика видимости - одна для фильтров и заголовков
    // Используем filterTreeStructure для получения всех узлов
    const filterNodeVisibilityLogic = useNodeVisibility(filterTreeStructure);

    // Дополнительная логика видимости для заголовков на основе отфильтрованного дерева
    const nodeVisibilityLogic = useNodeVisibility(treeStructure);
    
    // Синхронизация: берем видимость из фильтров для заголовков (кроме COMPONENT)
    const syncedNodeVisibility = useMemo(() => {
        const synced = { ...nodeVisibilityLogic.nodeVisibility };
        Object.keys(filterNodeVisibilityLogic.nodeVisibility).forEach(nodeId => {
            const node = filterTreeStructure.nodesMap.get(nodeId);
            // Синхронизируем только NODE и ASSEMBLE типы (не COMPONENT)
            if (node && node.type !== 'COMPONENT') {
                synced[nodeId] = filterNodeVisibilityLogic.nodeVisibility[nodeId];
            }
        });
        return synced;
    }, [nodeVisibilityLogic.nodeVisibility, filterNodeVisibilityLogic.nodeVisibility, filterTreeStructure.nodesMap]);

    // Функция проверки видимости узла
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

    // Видимые листовые узлы для ячеек
    const visibleLeafNodes = useMemo(() => {
        return treeStructure.leafNodes.filter(node => isNodeFullyVisible(node.id));
    }, [treeStructure.leafNodes, isNodeFullyVisible]);

    // Управление видимостью children элементов
    const childrenVisibilityLogic = useChildrenVisibility(treeStructure, tableLogic.processedCache);

    // Создаем обертку для toggleNodeVisibility фильтров, которая также управляет children visibility
    const toggleFilterNodeVisibility = useCallback((nodeId) => {
        // Сохраняем текущее состояние перед переключением
        const wasVisible = filterNodeVisibilityLogic.nodeVisibility[nodeId];
        
        // Переключаем видимость узла в фильтрах
        filterNodeVisibilityLogic.toggleNodeVisibility(nodeId);
        
        // Новое состояние - обратное предыдущему
        const isNowVisible = !wasVisible;
        
        const node = filterTreeStructure.nodesMap.get(nodeId);
        console.log(`[ToggleFilter] Toggling node ${nodeId}, type: ${node?.type}, isNowVisible: ${isNowVisible}`);
        
        // Для COMPONENT элементов - управляем children в ячейках
        if (node && node.type === 'COMPONENT') {
            console.log(`[ToggleFilter] Toggling COMPONENT: ${nodeId}, isNowVisible: ${isNowVisible}`);
            
            // Нужно найти все COMPONENT узлы внутри этого узла (детали компонента)
            const findComponentNodes = (n) => {
                const results = [];
                if (n.type === 'COMPONENT' && n.id !== nodeId) {
                    results.push(n.id);
                }
                if (n.children) {
                    n.children.forEach(child => {
                        results.push(...findComponentNodes(child));
                    });
                }
                return results;
            };
            
            const componentNodes = findComponentNodes(node);
            console.log(`[ToggleFilter] Found component child nodes:`, componentNodes);
            
            // Находим родительскую станцию (ASSEMBLE тип)
            const findParentStation = (nodeId) => {
                let currentNodeId = nodeId;
                while (currentNodeId) {
                    const currentNode = filterTreeStructure.nodesMap.get(currentNodeId);
                    if (currentNode && currentNode.type === 'ASSEMBLE') {
                        return currentNode;
                    }
                    currentNodeId = currentNode?.parentId;
                }
                return null;
            };
            
            const stationNode = findParentStation(nodeId);
            
            if (stationNode) {
                console.log(`[ToggleFilter] Found parent station: ${stationNode.id}`);
                
                // Находим children элементы этой станции в ячейках
                const stationChildren = childrenVisibilityLogic.childrenVisibility[stationNode.id] || {};
                console.log(`[ToggleFilter] Station ${stationNode.id} has children in visibility:`, Object.keys(stationChildren));
                
                // Проверяем все листовые узлы дочерних COMPONENT элементов
                componentNodes.forEach(componentNodeId => {
                    const componentNode = filterTreeStructure.nodesMap.get(componentNodeId);
                    if (componentNode && !componentNode.children || componentNode.children.length === 0) {
                        // Это листовой узел (деталь компонента)
                        // Проверяем есть ли в children станции
                        if (stationChildren[componentNodeId] !== undefined) {
                            const childIsVisible = stationChildren[componentNodeId];
                            console.log(`[ToggleFilter] Component detail ${componentNodeId} visibility: ${childIsVisible}`);
                            
                            // Если компонент теперь видим и children скрыт - включаем
                            // Если компонент теперь невидим и children видим - выключаем
                            if (isNowVisible && !childIsVisible) {
                                console.log(`[ToggleFilter] Enabling child ${componentNodeId} for station ${stationNode.id}`);
                                childrenVisibilityLogic.toggleChildrenVisibility(stationNode.id, componentNodeId);
                            } else if (!isNowVisible && childIsVisible) {
                                console.log(`[ToggleFilter] Disabling child ${componentNodeId} for station ${stationNode.id}`);
                                childrenVisibilityLogic.toggleChildrenVisibility(stationNode.id, componentNodeId);
                            }
                        }
                    }
                });
            }
        }
    }, [filterNodeVisibilityLogic, filterTreeStructure, childrenVisibilityLogic]);

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
                color: getCellColor(tableLogic.processedCache[date], nodeId)
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
        if (!processedRow || !processedRow.elements || !processedRow.elements[nodeId]) {
            return '-';
        }

        const element = processedRow.elements[nodeId];
        const value = element.status;

        if (value === null || value === undefined || value === '') {
            return '-';
        }

        return value;
    }, []);

    // Получение цвета ячейки из данных
    const getCellColor = useCallback((processedRow, nodeId) => {
        return processedRow?.elements?.[nodeId]?.color || null;
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
    const shouldDisplayCell = useCallback((processedRow, nodeId) => {
        if (!processedRow || !processedRow.elements || !processedRow.elements[nodeId]) {
            return true; // Показываем пустую ячейку если нет данных
        }

        const element = processedRow.elements[nodeId];
        return element.displayed !== false; // Отображаем если не явно скрыта
    }, []);

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

    // Функция получения children элементов ячейки
    const getCellChildren = useCallback((processedRow, nodeId) => {
        if (!processedRow || !processedRow.elements || !processedRow.elements[nodeId]) {
            return [];
        }

        const element = processedRow.elements[nodeId];
        return element.children || [];
    }, []);

    // Функция получения видимых children элементов
    const getVisibleCellChildren = useCallback((processedRow, nodeId) => {
        const children = getCellChildren(processedRow, nodeId);
        const visibleChildren = childrenVisibilityLogic.getVisibleChildren(nodeId);

        return children.filter(child => visibleChildren.includes(child.id));
    }, [getCellChildren, childrenVisibilityLogic]);

    const getCellOperating = useCallback((processedRow, nodeId) => {
        if (!processedRow || !processedRow.elements || !processedRow.elements[nodeId]) {
            return [];
        }

        const element = processedRow.elements[nodeId];
        return element.operating || [];
    }, []);

    // получение shift
    const getCellShift = useCallback((processedRow, nodeId) => {
        if (!processedRow || !processedRow.elements || !processedRow.elements[nodeId]) {
            return [];
        }

        const element = processedRow.elements[nodeId];
        return element.shift || [];
    }, []);

    // Слушаем изменения глобального состояния
    useEffect(() => {
        const handleStateChange = (event) => {
            // Форсируем перерендер если изменилось состояние
            if (event.detail.property === 'editMode' || event.detail.property === 'showFilters') {
                // React автоматически перерендерит при изменении useMemo зависимостей
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('virtualized-table-state-change', handleStateChange);

            return () => {
                window.removeEventListener('virtualized-table-state-change', handleStateChange);
            };
        }
    }, []);

    // Проверяем, есть ли хотя бы один видимый children элемент
    const hasAnyVisibleChildren = useMemo(() => {
        return Object.values(childrenVisibilityLogic.childrenVisibility).some(nodeChildren =>
            Object.values(nodeChildren).some(isVisible => isVisible)
        );
    }, [childrenVisibilityLogic.childrenVisibility]);

    // Вычисляем видимые даты и отступы для виртуализации
    let startIndex, endIndex, visibleDates, paddingTop, paddingBottom;

    if (hasAnyVisibleChildren) {
        // Динамический режим: пересчитываем viewport с учетом реальной высоты строк
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

            // Находим индекс строки, которая находится в верхней части viewport
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
            <FilterModal
                isOpen={showFilters}
                onClose={() => {
                    if (typeof window !== 'undefined' && window.VirtualizedTableAPI) {
                        window.VirtualizedTableAPI.setShowFilters(false);
                    }
                }}
                filteredTree={filterNodeVisibilityLogic.filteredTree}
                nodeVisibility={filterNodeVisibilityLogic.nodeVisibility}
                expandedNodes={filterNodeVisibilityLogic.expandedNodes}
                searchTerm={filterNodeVisibilityLogic.searchTerm}
                setSearchTerm={filterNodeVisibilityLogic.setSearchTerm}
                toggleNodeVisibility={toggleFilterNodeVisibility}
                toggleNodeExpansion={filterNodeVisibilityLogic.toggleNodeExpansion}
                childrenVisibility={childrenVisibilityLogic.childrenVisibility}
                toggleChildrenVisibility={childrenVisibilityLogic.toggleChildrenVisibility}
            />

            {/* Контейнер таблицы */}
            <div
                ref={tableLogic.containerRef}
                className="vt-container"
                style={{ maxWidth, maxHeight }}
                onScroll={tableLogic.handleScroll}
            >
                <table className="vt-table">
                    {/* Заголовок таблицы */}
                    <TableHeader
                        treeStructure={treeStructure}
                        nodeVisibility={syncedNodeVisibility}
                        activeColorTheme={activeColorTheme}
                        allowedTypes={ALLOWED_HEADER_TYPES}
                        onFilterClick={() => {
                            if (typeof window !== 'undefined' && window.VirtualizedTableAPI) {
                                window.VirtualizedTableAPI.setShowFilters(true);
                            }
                        }}
                    />

                    {/* Тело таблицы */}
                    <tbody>
                    {/* Верхний отступ для виртуализации */}
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

                        // Проверяем, есть ли в этой строке children элементы
                        const hasChildrenInRow = nodeVisibilityLogic.visibleLeafNodes.some(leafNode => {
                            if (!shouldDisplayCell(processedRow, leafNode.id)) return false;
                            const cellChildren = processedRow ? getVisibleCellChildren(processedRow, leafNode.id) : [];
                            return cellChildren.length > 0;
                        });

                        // Логика высоты: 40px по умолчанию, 120px (3 * 40px) если есть children элементы
                        const currentRowHeight = hasChildrenInRow ? 120 : 40;

                        return (
                            <tr
                                key={`${dateString}-${startIndex + index}`}
                                className="vt-row"
                                style={{ height: `${currentRowHeight}px`, backgroundColor: activeColorTheme("DATE", isPastDate) }}
                            >
                                {/* Колонка с датой */}
                                <td className="vt-cell-date" style={{ color: isPastDate ? '#666' : 'inherit' }}>
                                    {dateString}
                                </td>

                                {visibleLeafNodes.map((leafNode) => {
                                    if (!shouldDisplayCell(processedRow, leafNode.id)) {
                                        return null;
                                    }

                                    const cellValue = processedRow ? getCellValue(processedRow, leafNode.id) : '-';
                                    const cellColor = processedRow ? getCellColor(processedRow, leafNode.id) : null;
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
                                        cellColor || activeColorTheme(cellValue, isPastDate),
                                        isDraggable
                                    );

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
                                            style={{ color: getContrastTextColor(cellColor), width: cellColspan > 1 ? `${cellColspan * 50}px` : undefined, ...dragStyles }}
                                        >
                                            <div className="vt-cell__content">
                                                <div className="vt-cell__value">
                                                    {cellValue}
                                                    {showDeviations && cellOperating.map((op, idx) => (
                                                        <React.Fragment key={`op-${idx}`}>
                                                            <br/>
                                                            {op.value}
                                                        </React.Fragment>
                                                    ))}
                                                    {showDeviations && cellShift.map((sh, idx) => (
                                                        <React.Fragment key={`sh-${idx}`}>
                                                            <br/>
                                                            {sh.value}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                                {!isLoading && cellChildren.length > 0 && (
                                                    <div className="vt-cell__children">
                                                        {cellChildren.map((child, index) => (
                                                            <div key={child.id} className="vt-cell__child">
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

                    {/* Нижний отступ для виртуализации */}
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
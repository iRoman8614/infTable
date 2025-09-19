import React, {useState, useMemo, useCallback, useEffect} from 'react';
import { TableHeader } from './components/TableHeader.jsx';
import { FiltersPanel } from './components/FiltersPanel.jsx';
import { useTableLogic } from './hooks/useTableLogic.js';
import { useNodeVisibility } from './hooks/useNodeVisibility.js';
import { useDragAndDrop } from './hooks/useDragAndDrop.js';
import { parseDateString } from './utils/dateUtils.js';
import { useHeadersLoader, useGlobalClickHandlers } from './hooks/useTableHelpers.js';
import {getContrastTextColor} from "./utils/ContrastTextColor";

export const Table = ({
                          maxWidth = '100%',
                          maxHeight = '600px',
                          colorTheme,
                          scrollBatchSize = 7,
                          debug = false,
                          dataProvider = null,
                          headerProvider = null,
                          onDataLoad = null,
                          onError = null,
                          onCellClick = null,
                          onCellMove = null,
                          editMode: propEditMode,
                          showFilters: propShowFilters
                      }) => {
    // Состояния с синхронизацией с глобальным состоянием
    const [clickLoading, setClickLoading] = useState(new Set());

    // Получаем состояние из глобального объекта или используем пропсы
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

    // Отслеживание глобальных обработчиков
    const hasGlobalHandlers = useGlobalClickHandlers();

    // Загрузка заголовков с мемоизацией
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

    // Структура дерева заголовков (мемоизированная)
    const treeStructure = useMemo(() => {
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

    // Хуки для управления состоянием
    const tableLogic = useTableLogic({
        scrollBatchSize,
        dataProvider,
        onDataLoad,
        onError,
        treeStructure
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && tableLogic.refreshViewport) {
            window.refreshTableViewport = tableLogic.refreshViewport;

            return () => {
                delete window.refreshTableViewport;
            };
        }
    }, [tableLogic.refreshViewport]);

    const nodeVisibilityLogic = useNodeVisibility(treeStructure);

    // Drag & Drop функциональность
    const dragDropHandlers = useDragAndDrop(editMode, onCellMove);

    // Проверка наличия обработчиков кликов
    const hasClickHandlers = useMemo(() => {
        const hasProps = !!onCellClick;
        const hasWindow = hasGlobalHandlers;
        const hasGlobal = typeof window !== 'undefined' && window.VirtualizedTableState?.onCellClick;

        if (debug) {
            console.log('[Table] Click handlers check:', {
                onCellClick: hasProps,
                windowHandler: hasWindow,
                globalHandler: !!hasGlobal
            });
        }

        return hasProps || hasWindow || hasGlobal;
    }, [onCellClick, hasGlobalHandlers, debug]);

    // Обработчик клика с использованием глобального состояния
    const handleCellClick = useCallback(async (date, nodeId, cellValue, event) => {
        const clickKey = `${date}-${nodeId}`;

        if (clickLoading.has(clickKey)) {
            return;
        }

        setClickLoading(prev => new Set([...prev, clickKey]));

        try {
            const cellData = { date, nodeId, value: cellValue };

            // Локальный обработчик (из пропсов)
            if (onCellClick) {
                await onCellClick(cellData, event);
            }

            // Глобальный обработчик из VirtualizedTableState
            if (typeof window !== 'undefined' && window.VirtualizedTableState?.onCellClick) {
                await window.VirtualizedTableState.onCellClick(cellData, event);
            }

            // Обработчик window.onTableCellClick (обратная совместимость)
            if (typeof window !== 'undefined' && window.onTableCellClick) {
                const jsonString = JSON.stringify(cellData);
                console.log('[Table] JSON string:', jsonString);

                if (window.onTableCellClick.constructor.name === 'AsyncFunction') {
                    await window.onTableCellClick(jsonString);
                } else {
                    window.onTableCellClick(jsonString);
                }
            }

        } catch (error) {
            console.error('[Table] Click error:', error);
        } finally {
            setClickLoading(prev => {
                const updated = new Set(prev);
                updated.delete(clickKey);
                return updated;
            });
        }
    }, [clickLoading, onCellClick]);

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

    // НОВАЯ функция получения colspan
    const getCellColspan = useCallback((processedRow, nodeId) => {
        if (!processedRow || !processedRow.elements || !processedRow.elements[nodeId]) {
            return 1;
        }

        const element = processedRow.elements[nodeId];
        return element.displayed === false ? 0 : (element.colspan || 1);
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

    // Вычисляем видимые даты и отступы для виртуализации
    const { start: startIndex, end: endIndex } = tableLogic.visibleRange;
    const visibleDates = tableLogic.dates.slice(startIndex, endIndex);
    const paddingTop = startIndex * tableLogic.rowHeight;
    const paddingBottom = Math.max(0, (tableLogic.dates.length - endIndex) * tableLogic.rowHeight);

    // Отображение ошибки
    if (headersError) {
        return (
            <div style={{
                padding: '20px',
                border: '1px solid #dc3545',
                borderRadius: '4px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                marginBottom: '20px'
            }}>
                <h4>Ошибка загрузки заголовков</h4>
                <p>{headersError}</p>
                <p style={{ fontSize: '12px', marginTop: '10px' }}>
                    Используются заголовки по умолчанию
                </p>
            </div>
        );
    }

    // Отображение загрузки заголовков
    if (headersLoading) {
        return (
            <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#666'
            }}>
                <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '2px solid #ddd',
                    borderTop: '2px solid #007bff',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 10px'
                }} />
                Загрузка заголовков...
            </div>
        );
    }

    return (
        <>
            {showFilters && (
                <FiltersPanel
                    filteredTree={nodeVisibilityLogic.filteredTree}
                    nodeVisibility={nodeVisibilityLogic.nodeVisibility}
                    expandedNodes={nodeVisibilityLogic.expandedNodes}
                    searchTerm={nodeVisibilityLogic.searchTerm}
                    setSearchTerm={nodeVisibilityLogic.setSearchTerm}
                    setShowFilters={() => {
                        if (typeof window !== 'undefined' && window.VirtualizedTableAPI) {
                            window.VirtualizedTableAPI.setShowFilters(false);
                        }
                    }}
                    toggleNodeVisibility={nodeVisibilityLogic.toggleNodeVisibility}
                    toggleNodeExpansion={nodeVisibilityLogic.toggleNodeExpansion}
                />
            )}

            {/* Контейнер таблицы */}
            <div
                ref={tableLogic.containerRef}
                style={{
                    maxWidth,
                    width: 'fit-content',
                    height: '100%',
                    maxHeight,
                    overflow: 'auto',
                    border: '1px solid #ccc',
                    position: 'relative',
                    fontFamily: 'serif',
                }}
                onScroll={tableLogic.handleScroll}
            >
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                    {/* Заголовок таблицы */}
                    <TableHeader
                        treeStructure={treeStructure}
                        nodeVisibility={nodeVisibilityLogic.nodeVisibility}
                        activeColorTheme={activeColorTheme}
                    />

                    {/* Тело таблицы */}
                    <tbody>
                    {/* Верхний отступ для виртуализации */}
                    {paddingTop > 0 && (
                        <tr style={{ height: paddingTop }}>
                            <td colSpan={nodeVisibilityLogic.visibleLeafNodes.length + 1} style={{ padding: 0, border: 'none' }} />
                        </tr>
                    )}

                    {/* ОБНОВЛЕННЫЙ рендер видимых строк данных с поддержкой rowspan и colspan */}
                    {visibleDates.map((dateString, index) => {
                        const processedRow = tableLogic.processedCache[dateString];
                        const isLoading = !processedRow;
                        const rowDate = parseDateString(dateString);
                        const isPastDate = rowDate.getTime() < tableLogic.today.getTime();

                        return (
                            <tr
                                key={`${dateString}-${startIndex + index}`}
                                style={{
                                    height: `${tableLogic.rowHeight}px`,
                                    backgroundColor: isLoading ? 'transparent' : activeColorTheme("DATE", isPastDate),
                                }}
                            >
                                {/* Колонка с датой */}
                                <td style={{
                                    padding: '8px',
                                    borderRight: '1px solid #ddd',
                                    fontSize: '14px',
                                    fontWeight: 'normal',
                                    whiteSpace: 'nowrap',
                                    color: isPastDate ? '#666' : 'inherit',
                                }}>
                                    {dateString}
                                </td>

                                {nodeVisibilityLogic.visibleLeafNodes.map((leafNode) => {
                                    if (!shouldDisplayCell(processedRow, leafNode.id)) {
                                        return null;
                                    }

                                    const cellValue = processedRow ? getCellValue(processedRow, leafNode.id) : '-';
                                    const cellColor = processedRow ? getCellColor(processedRow, leafNode.id) : null;
                                    const isDraggable = processedRow ? getCellDraggable(processedRow, leafNode.id) : false;
                                    const cellRowspan = processedRow ? getCellRowspan(processedRow, leafNode.id) : 1;
                                    const cellColspan = processedRow ? getCellColspan(processedRow, leafNode.id) : 1;
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
                                            colSpan={cellColspan > 1 ? cellColspan : undefined} // НОВОЕ
                                            draggable={editMode && isDraggable}
                                            onDoubleClick={editMode && hasClickHandlers ? (event) => {
                                                console.log('[Table] Cell double-clicked, calling handler');
                                                handleCellClick(dateString, leafNode.id, cellValue, event);
                                            } : undefined}
                                            onDragStart={editMode && isDraggable ? (e) => dragDropHandlers.handleDragStart(e, dateString, leafNode.id, cellValue, isDraggable) : undefined}
                                            onDragEnd={editMode && isDraggable ? dragDropHandlers.handleDragEnd : undefined}
                                            onDragOver={editMode ? (e) => dragDropHandlers.handleDragOver(e, dateString, leafNode.id, isDraggable) : undefined}
                                            onDragLeave={editMode ? dragDropHandlers.handleDragLeave : undefined}
                                            onDrop={editMode && isDraggable ? (e) => dragDropHandlers.handleDrop(e, dateString, leafNode.id, isDraggable) : undefined}
                                            style={{
                                                padding: '4px',
                                                textAlign: 'center',
                                                fontSize: '14px',
                                                minWidth: '50px',
                                                verticalAlign: 'middle',
                                                borderRight: '1px solid #ddd',
                                                fontWeight: 'normal',
                                                userSelect: 'none',
                                                color: getContrastTextColor(cellValue.color),
                                                opacity: isCellLoading ? 0.6 : 1,
                                                position: 'relative',
                                                // ОБНОВЛЕННЫЕ стили для colspan
                                                width: cellColspan > 1 ? `${cellColspan * 50}px` : undefined,
                                                ...dragStyles
                                            }}
                                        >
                                            {isLoading ? (
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    borderRadius: '50%',
                                                    border: '2px solid #ddd',
                                                    borderTop: '2px solid #007bff',
                                                    animation: 'spin 1s linear infinite',
                                                    margin: 'auto',
                                                }} />
                                            ) : isCellLoading ? (
                                                <>
                                                    {cellValue}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '2px',
                                                        right: '2px',
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        border: '1px solid #007bff',
                                                        borderTop: '1px solid transparent',
                                                        animation: 'spin 0.8s linear infinite',
                                                    }} />
                                                </>
                                            ) : cellValue}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}

                    {/* Нижний отступ для виртуализации */}
                    {paddingBottom > 0 && (
                        <tr style={{ height: paddingBottom }}>
                            <td colSpan={nodeVisibilityLogic.visibleLeafNodes.length + 1} style={{ padding: 0, border: 'none' }} />
                        </tr>
                    )}
                    </tbody>
                </table>

                <style>
                    {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                </style>
            </div>
        </>
    );
};

export default Table;
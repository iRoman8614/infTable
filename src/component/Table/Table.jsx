import React, {useState, useMemo, useCallback, useEffect} from 'react';
import { TableHeader } from './components/TableHeader.jsx';
import { FiltersPanel } from './components/FiltersPanel.jsx';
import { useTableLogic } from './hooks/useTableLogic.js';
import { useNodeVisibility } from './hooks/useNodeVisibility.js';
import { useDragAndDrop } from './hooks/useDragAndDrop.js';
import { parseDateString } from './utils/dateUtils.js';
import { useHeadersLoader, useGlobalClickHandlers } from './hooks/useTableHelpers.js';

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
                          onCellMove = null
                      }) => {
    // Состояния
    const [showFilters, setShowFilters] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [clickLoading, setClickLoading] = useState(new Set());

    // Отслеживание глобальных обработчиков
    const hasGlobalHandlers = useGlobalClickHandlers();

    // Загрузка заголовков с мемоизацией
    const { headersData, headersError, isLoading: headersLoading } = useHeadersLoader(headerProvider);

    // Цветовая тема (мемоизирована)
    const activeColorTheme = useMemo(() => {
        if (colorTheme) return colorTheme;

        return (value, isPast) => {
            if (value === "BGHeader") return '#dee3f5';
            if (value === "DATE") return isPast ? '#acb5e3' : '#white';

            switch (value) {
                case 0: return isPast ? '#acb5e3' : 'white';
                default: return isPast ? '#acb5e3' : 'white';
            }
        };
    }, [colorTheme]);

    // Структура дерева заголовков (мемоизирована)
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

        if (debug) {
            console.log('[Table] Click handlers check:', {
                onCellClick: hasProps,
                windowHandler: hasWindow,
                windowObject: typeof window !== 'undefined' ? typeof window.onTableCellClick : 'undefined'
            });
        }

        return hasProps || hasWindow;
    }, [onCellClick, hasGlobalHandlers, debug]);

    // Обработчик клика
    const handleCellClick = useCallback(async (date, nodeId) => {
        const clickKey = `${date}-${nodeId}`;

        if (clickLoading.has(clickKey)) {
            return;
        }

        setClickLoading(prev => new Set([...prev, clickKey]));

        try {
            const cellData = { date, nodeId };
            const jsonString = JSON.stringify(cellData);

            console.log('[Table] JSON string:', jsonString);

            if (typeof window !== 'undefined' &&
                window.onTableCellClick &&
                typeof window.onTableCellClick === 'function') {

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
    }, [clickLoading]);

    // Получение значения ячейки (мемоизировано)
    const getCellValue = useCallback((processedRow, nodeId) => {
        return processedRow.elements && processedRow.elements[nodeId]
            ? processedRow.elements[nodeId].status
            : 'М';
    }, []);

    // Получение цвета ячейки из данных
    const getCellColor = useCallback((processedRow, nodeId) => {
        return processedRow.elements && processedRow.elements[nodeId]
            ? processedRow.elements[nodeId].color
            : null;
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
            {/* Панель управления */}
            <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '10px',
                alignItems: 'center'
            }}>
                <div>План 1</div>
                <div>Отображать отклонения</div>

                {/* Чекбокс режима редактирования */}
                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    gap: '8px'
                }}>
                    <input
                        type="checkbox"
                        checked={editMode}
                        onChange={(e) => setEditMode(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                    />
                    Режим редактирования
                </label>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: 'rgba(108,155,255,0.45)',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Задать фильтр
                </button>
            </div>

            {/* Панель фильтров */}
            {showFilters && (
                <FiltersPanel
                    filteredTree={nodeVisibilityLogic.filteredTree}
                    nodeVisibility={nodeVisibilityLogic.nodeVisibility}
                    expandedNodes={nodeVisibilityLogic.expandedNodes}
                    searchTerm={nodeVisibilityLogic.searchTerm}
                    setSearchTerm={nodeVisibilityLogic.setSearchTerm}
                    setShowFilters={setShowFilters}
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

                    {/* Видимые строки данных */}
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

                                {/* Колонки данных для каждого видимого узла */}
                                {nodeVisibilityLogic.visibleLeafNodes.map((leafNode) => {
                                    const cellValue = processedRow ? getCellValue(processedRow, leafNode.id) : 'М';
                                    const cellColor = processedRow ? getCellColor(processedRow, leafNode.id) : null;
                                    const clickKey = `${dateString}-${leafNode.id}`;
                                    const isCellLoading = clickLoading.has(clickKey);

                                    // Получаем drag & drop стили
                                    const dragStyles = dragDropHandlers.getCellDragStyles(
                                        dateString,
                                        leafNode.id,
                                        cellColor || activeColorTheme(cellValue, isPastDate)
                                    );

                                    return (
                                        <td
                                            key={`${dateString}-${leafNode.id}`}
                                            draggable={editMode}
                                            onDoubleClick={hasClickHandlers && editMode ? (event) => {
                                                console.log('[Table] Cell double-clicked, calling handler');
                                                handleCellClick(dateString, leafNode.id, cellValue, event);
                                            } : undefined}
                                            onDragStart={editMode ? (e) => dragDropHandlers.handleDragStart(e, dateString, leafNode.id, cellValue) : undefined}
                                            onDragEnd={editMode ? dragDropHandlers.handleDragEnd : undefined}
                                            onDragOver={editMode ? (e) => dragDropHandlers.handleDragOver(e, dateString, leafNode.id) : undefined}
                                            onDragLeave={editMode ? dragDropHandlers.handleDragLeave : undefined}
                                            onDrop={editMode ? (e) => dragDropHandlers.handleDrop(e, dateString, leafNode.id) : undefined}
                                            style={{
                                                padding: '4px',
                                                textAlign: 'center',
                                                fontSize: '14px',
                                                minWidth: '50px',
                                                verticalAlign: 'middle',
                                                borderRight: '1px solid #ddd',
                                                fontWeight: 'normal',
                                                userSelect: 'none',
                                                opacity: isCellLoading ? 0.6 : 1,
                                                position: 'relative',
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
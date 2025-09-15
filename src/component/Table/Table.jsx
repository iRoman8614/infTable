import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { TableHeader } from './components/TableHeader.jsx';
import { FiltersPanel } from './components/FiltersPanel.jsx';
import { useTableLogic } from './hooks/useTableLogic.js';
import { useNodeVisibility } from './hooks/useNodeVisibility.js';

// Встроенные утилиты
const parseDateString = (dateString) => {
    const [day, month, year] = dateString.split('.').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
};

// Дефолтные заголовки
const defaultHeaders = {
    headers: [
        { id: "station1", parentId: null, name: "Станция 1", metadata: { color: "#4caf50" } },
        { id: "station2", parentId: null, name: "Станция 2", metadata: { color: "#ff9800" } },
        { id: "station3", parentId: null, name: "Станция 3", metadata: { color: "#f44336" } },
        { id: "station4", parentId: null, name: "Станция 4", metadata: { color: "#2196f3" } },
        { id: "station5", parentId: null, name: "Станция 5", metadata: { color: "#9c27b0" } }
    ]
};

/**
 * Хук для управления загрузкой заголовков с мемоизацией
 */
const useHeadersLoader = (headerProvider) => {
    const [headersData, setHeadersData] = useState(defaultHeaders);
    const [headersError, setHeadersError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const loadedRef = useRef(false);
    const lastProviderRef = useRef(null);

    // Мемоизированная функция загрузки
    const loadHeaders = useCallback(async () => {
        // Проверяем, нужно ли загружать заново
        if (loadedRef.current && lastProviderRef.current === headerProvider) {
            console.log('[HeadersLoader] Заголовки уже загружены, пропускаем');
            return;
        }

        console.log('[HeadersLoader] Начинаем загрузку заголовков...');
        setIsLoading(true);
        setHeadersError(null);

        try {
            let structure = null;

            // Проверяем переданный headerProvider
            if (headerProvider && typeof headerProvider === 'function') {
                console.log('[HeadersLoader] Используем переданный headerProvider');

                if (headerProvider.constructor.name === 'AsyncFunction') {
                    structure = await headerProvider();
                } else {
                    structure = headerProvider();
                }

                if (structure && structure.headers && Array.isArray(structure.headers)) {
                    console.log(`[HeadersLoader] Загружены заголовки: ${structure.headers.length} элементов`);
                    setHeadersData(structure);
                    loadedRef.current = true;
                    lastProviderRef.current = headerProvider;
                    return;
                } else {
                    console.error('[HeadersLoader] Переданный headerProvider возвращает некорректную структуру:', structure);
                }
            }

            // Проверяем глобальные провайдеры только если нет переданного
            if (!headerProvider && typeof window !== 'undefined') {
                // Проверяем window.HeadersProvider
                if (window.HeadersProvider && typeof window.HeadersProvider === 'function') {
                    console.log('[HeadersLoader] Используем window.HeadersProvider');

                    if (window.HeadersProvider.constructor.name === 'AsyncFunction') {
                        structure = await window.HeadersProvider();
                    } else {
                        structure = window.HeadersProvider();
                    }

                    if (structure && structure.headers && Array.isArray(structure.headers)) {
                        console.log(`[HeadersLoader] Загружены заголовки из window: ${structure.headers.length} элементов`);
                        setHeadersData(structure);
                        loadedRef.current = true;
                        lastProviderRef.current = null;
                        return;
                    }
                }

                // Проверяем window.hp
                if (window.hp && typeof window.hp === 'function') {
                    console.log('[HeadersLoader] Используем window.hp');

                    if (window.hp.constructor.name === 'AsyncFunction') {
                        structure = await window.hp();
                    } else {
                        structure = window.hp();
                    }

                    if (structure && structure.headers && Array.isArray(structure.headers)) {
                        console.log(`[HeadersLoader] Загружены заголовки из hp: ${structure.headers.length} элементов`);
                        setHeadersData(structure);
                        loadedRef.current = true;
                        lastProviderRef.current = null;
                        return;
                    }
                }
            }

            // Fallback на дефолтные заголовки
            console.log('[HeadersLoader] Используем заголовки по умолчанию');
            setHeadersData(defaultHeaders);
            loadedRef.current = true;
            lastProviderRef.current = headerProvider;

        } catch (error) {
            console.error('[HeadersLoader] Ошибка при загрузке заголовков:', error);
            setHeadersError(error.message);
            setHeadersData(defaultHeaders);
            loadedRef.current = false;
        } finally {
            setIsLoading(false);
        }
    }, [headerProvider]);

    // Загружаем заголовки только при изменении провайдера или первой инициализации
    useEffect(() => {
        if (!loadedRef.current || lastProviderRef.current !== headerProvider) {
            loadHeaders();
        }
    }, [loadHeaders]);

    // Функция для принудительной перезагрузки
    const reloadHeaders = useCallback(() => {
        loadedRef.current = false;
        lastProviderRef.current = null;
        loadHeaders();
    }, [loadHeaders]);

    return {
        headersData,
        headersError,
        isLoading,
        reloadHeaders
    };
};

/**
 * Хук для отслеживания доступности глобальных обработчиков
 */
const useGlobalClickHandlers = () => {
    const [hasGlobalHandlers, setHasGlobalHandlers] = useState(false);

    useEffect(() => {
        const checkHandlers = () => {
            const hasWindowHandler = typeof window !== 'undefined' &&
                typeof window.onTableCellClick === 'function';
            setHasGlobalHandlers(hasWindowHandler);
        };

        // Проверяем сразу
        checkHandlers();

        // Проверяем периодически на случай динамической загрузки
        const interval = setInterval(checkHandlers, 500);

        // Слушаем события изменения window объекта
        const handleWindowChange = () => {
            setTimeout(checkHandlers, 100);
        };

        if (typeof window !== 'undefined') {
            // Отслеживаем загрузку скриптов
            window.addEventListener('load', handleWindowChange);
            document.addEventListener('DOMContentLoaded', handleWindowChange);

            return () => {
                clearInterval(interval);
                window.removeEventListener('load', handleWindowChange);
                document.removeEventListener('DOMContentLoaded', handleWindowChange);
            };
        }

        return () => clearInterval(interval);
    }, []);

    return hasGlobalHandlers;
};

/**
 * VIRTUALIZED TABLE COMPONENT без логики rowspan
 */
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
                          onCellClick = null
                      }) => {
    // Состояния
    const [showFilters, setShowFilters] = useState(false);
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
                case 'М': return '#cdef8d';
                case 'О': return '#ffce42';
                case 'П': return '#86cb89';
                case 'ПР': return '#4a86e8';
                case 'Р': return 'white';
                case 0: return isPast ? '#acb5e3' : 'white';
                default: return isPast ? '#acb5e3' : 'white';
            }
        };
    }, [colorTheme]);

    // Структура дерева заголовков (мемоизирована)
    const treeStructure = useMemo(() => {
        console.log('[Table] Построение структуры дерева...');

        if (!headersData || !headersData.headers || !Array.isArray(headersData.headers)) {
            console.warn('[Table] Некорректные данные заголовков:', headersData);
            return { tree: [], maxDepth: 1, leafNodes: [], nodesMap: new Map() };
        }

        const nodesMap = new Map();
        const tree = [];

        // Создаем карту узлов
        headersData.headers.forEach(header => {
            nodesMap.set(header.id, { ...header, children: [] });
        });

        // Строим дерево
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

        // Вычисляем максимальную глубину
        const getMaxDepth = (node) => {
            if (node.children.length === 0) return 1;
            return 1 + Math.max(...node.children.map(getMaxDepth));
        };
        const maxDepth = tree.length > 0 ? Math.max(...tree.map(getMaxDepth)) : 1;

        // Находим все листовые узлы
        const leafNodes = [];
        const findLeaves = (node) => {
            if (node.children.length === 0) {
                leafNodes.push(node);
            } else {
                node.children.forEach(findLeaves);
            }
        };
        tree.forEach(findLeaves);

        console.log(`[Table] Дерево построено: глубина=${maxDepth}, листьев=${leafNodes.length}`);
        return { tree, maxDepth, leafNodes, nodesMap };
    }, [headersData]);

    // Хуки для управления состоянием с новой логикой up/down
    const tableLogic = useTableLogic({
        scrollBatchSize,
        dataProvider,
        onDataLoad,
        onError,
        treeStructure
    });

    const nodeVisibilityLogic = useNodeVisibility(treeStructure);

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

    // Async обработчик клика по ячейке (исправленный для избежания циклических ссылок)
    const handleCellClick = useCallback(async (date, nodeId, cellValue, event) => {
        const clickKey = `${date}-${nodeId}`;

        console.log('[Table] Cell click triggered:', {
            date,
            nodeId,
            cellValue,
            hasOnCellClick: !!onCellClick,
            hasWindowHandler: typeof window !== 'undefined' && typeof window.onTableCellClick === 'function'
        });

        // Предотвращаем множественные клики
        if (clickLoading.has(clickKey)) {
            console.log('[Table] Click already in progress, skipping');
            return;
        }

        setClickLoading(prev => new Set([...prev, clickKey]));

        try {
            // Извлекаем только безопасные данные из node, избегая циклических ссылок
            const nodeData = treeStructure.nodesMap.get(nodeId);
            const safeNodeData = nodeData ? {
                id: nodeData.id,
                name: nodeData.name,
                parentId: nodeData.parentId,
                metadata: nodeData.metadata
            } : null;

            // Создаем безопасные данные ячейки без DOM-ссылок
            const safeCellData = {
                date,
                nodeId,
                // value: cellValue,
                // node: safeNodeData,
                // // Убираем event - он содержит DOM-ссылки и циклические зависимости
                // timestamp: new Date().toISOString(),
                // clickPosition: event ? {
                //     clientX: event.clientX,
                //     clientY: event.clientY,
                //     ctrlKey: event.ctrlKey,
                //     shiftKey: event.shiftKey,
                //     altKey: event.altKey
                // } : null
            };

            // Вызываем переданный обработчик
            if (onCellClick) {
                console.log('[Table] Calling provided onCellClick handler');
                if (onCellClick.constructor.name === 'AsyncFunction') {
                    await onCellClick(safeCellData);
                } else {
                    onCellClick(safeCellData);
                }
            }

            // Проверяем глобальные обработчики кликов
            if (typeof window !== 'undefined') {
                // Проверяем window.onTableCellClick
                if (window.onTableCellClick && typeof window.onTableCellClick === 'function') {
                    console.log('[Table] Calling window.onTableCellClick handler');
                    try {
                        if (window.onTableCellClick.constructor.name === 'AsyncFunction') {
                            await window.onTableCellClick(safeCellData);
                        } else {
                            window.onTableCellClick(safeCellData);
                        }
                    } catch (error) {
                        console.error('[Table] Error in window.onTableCellClick:', error);
                    }
                } else {
                    console.log('[Table] No window.onTableCellClick handler found');
                }

                // Кастомное событие с безопасными данными
                try {
                    const customEvent = new CustomEvent('table-cell-click', {
                        detail: safeCellData,
                        bubbles: true
                    });
                    window.dispatchEvent(customEvent);
                    console.log('[Table] Custom event dispatched');
                } catch (error) {
                    console.error('[Table] Error dispatching custom event:', error);
                }
            }

        } catch (error) {
            console.error('[Table] Ошибка при обработке клика:', error);
        } finally {
            setClickLoading(prev => {
                const updated = new Set(prev);
                updated.delete(clickKey);
                return updated;
            });
        }
    }, [onCellClick, treeStructure.nodesMap, clickLoading]);

    // Получение значения ячейки (мемоизировано)
    const getCellValue = useCallback((processedRow, nodeId) => {
        return processedRow.elements && processedRow.elements[nodeId]
            ? processedRow.elements[nodeId].status
            : 'М';
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
                <div>Режим редактирования</div>
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
                                    const clickKey = `${dateString}-${leafNode.id}`;
                                    const isCellLoading = clickLoading.has(clickKey);

                                    return (
                                        <td
                                            key={`${dateString}-${leafNode.id}`}
                                            onClick={hasClickHandlers ? (event) => {
                                                console.log('[Table] Cell clicked, calling handler');
                                                handleCellClick(dateString, leafNode.id, cellValue, event);
                                            } : undefined}
                                            style={{
                                                padding: '4px',
                                                textAlign: 'center',
                                                backgroundColor: isLoading ?
                                                    'transparent' :
                                                    activeColorTheme(cellValue, isPastDate),
                                                fontSize: '14px',
                                                minWidth: '50px',
                                                verticalAlign: 'middle',
                                                borderRight: '1px solid #ddd',
                                                fontWeight: 'normal',
                                                cursor: hasClickHandlers ? 'pointer' : 'default',
                                                userSelect: 'none',
                                                opacity: isCellLoading ? 0.6 : 1,
                                                position: 'relative'
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

            {/* Панель отладки */}
            {debug && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '6px 12px',
                    margin: "20px 0",
                    border: '1px solid #ddd',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#666',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    width: 'fit-content'
                }}>
                    <span><strong>Заголовков загружено:</strong> {headersData?.headers?.length || 0}</span>
                    <span><strong>Глубина дерева:</strong> {treeStructure.maxDepth}</span>
                    <span><strong>Листовых узлов:</strong> {treeStructure.leafNodes.length}</span>
                    <span><strong>Видимых листовых:</strong> {nodeVisibilityLogic.visibleLeafNodes.length}</span>
                    <span><strong>Всего дат:</strong> {tableLogic.dates.length}</span>
                    <span><strong>Видимые строки:</strong> {visibleDates.length}</span>
                    <span><strong>Активных кликов:</strong> {clickLoading.size}</span>
                    <span><strong>Статус заголовков:</strong> {headersLoading ? 'загружаются' : 'загружены'}</span>
                    <span><strong>Обработчики кликов:</strong> {hasClickHandlers ? 'активны' : 'отсутствуют'}</span>
                    <span><strong>onCellClick prop:</strong> {onCellClick ? 'есть' : 'нет'}</span>
                    <span><strong>window.onTableCellClick:</strong> {typeof window !== 'undefined' && typeof window.onTableCellClick === 'function' ? 'есть' : 'нет'}</span>
                    <span><strong>Логика ячеек:</strong> Простая (без rowspan)</span>
                </div>
            )}
        </>
    );
};

export default Table;
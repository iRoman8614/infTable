// import React, { useState, useMemo, useCallback } from 'react';
// import { TableHeader } from './components/TableHeader.jsx';
// import { FiltersPanel } from './components/FiltersPanel.jsx';
// import { useTableLogic } from './hooks/useTableLogic.js';
// import { useNodeVisibility } from './hooks/useNodeVisibility.js';
// import { parseDateString } from './utils/dateUtils.js';
// import { defaultHeaders } from './data/defaultData.js';
//
// /**
//  * ENHANCED VIRTUALIZED TABLE COMPONENT
//  *
//  * Высокопроизводительная виртуализированная таблица с поддержкой:
//  * - Бесконечного скролла (infinite scroll)
//  * - Динамической загрузки данных батчами
//  * - Иерархических заголовков через headerProvider
//  * - Системы фильтрации и поиска колонок
//  * - Объединения ячеек (rowspan) для одинаковых значений
//  * - Кастомных цветовых тем
//  * - Отладочной информации
//  *
//  * @version 3.0.0
//  * @author Enhanced Version
//  */
// export const Table = ({
//                           maxWidth = '100%',
//                           maxHeight = '600px',
//                           colorTheme,
//                           scrollBatchSize = 7,
//                           debug = false,
//                           dataProvider = null,
//                           headerProvider = null,
//                           onDataLoad = null,
//                           onError = null,
//                           onCellClick = null
//                       }) => {
//     // Состояние для показа фильтров
//     const [showFilters, setShowFilters] = useState(false);
//
//     // Цветовая тема
//     const defaultColorTheme = useCallback((value, isPast) => {
//         if (value === "BGHeader") return '#dee3f5';
//         if (value === "DATE") return isPast ? '#acb5e3' : '#white';
//
//         switch (value) {
//             case 'М': return '#cdef8d';
//             case 'О': return '#ffce42';
//             case 'П': return '#86cb89';
//             case 'ПР': return '#4a86e8';
//             case 'Р': return 'white';
//             case 0: return isPast ? '#acb5e3' : 'white';
//             default: return isPast ? '#acb5e3' : 'white';
//         }
//     }, []);
//
//     const activeColorTheme = colorTheme || defaultColorTheme;
//
//     // Структура дерева заголовков
//     const treeStructure = useMemo(() => {
//         const headers = headerProvider || defaultHeaders;
//         const nodesMap = new Map();
//         const tree = [];
//
//         // Создаем карту узлов
//         headers.headers.forEach(header => {
//             nodesMap.set(header.id, { ...header, children: [] });
//         });
//
//         // Строим дерево
//         headers.headers.forEach(header => {
//             if (header.parentId === null) {
//                 tree.push(nodesMap.get(header.id));
//             } else {
//                 const parent = nodesMap.get(header.parentId);
//                 if (parent) {
//                     parent.children.push(nodesMap.get(header.id));
//                 }
//             }
//         });
//
//         // Вычисляем максимальную глубину
//         const getMaxDepth = (node) => {
//             if (node.children.length === 0) return 1;
//             return 1 + Math.max(...node.children.map(getMaxDepth));
//         };
//         const maxDepth = Math.max(...tree.map(getMaxDepth));
//
//         // Находим все листовые узлы
//         const leafNodes = [];
//         const findLeaves = (node) => {
//             if (node.children.length === 0) {
//                 leafNodes.push(node);
//             } else {
//                 node.children.forEach(findLeaves);
//             }
//         };
//         tree.forEach(findLeaves);
//
//         return { tree, maxDepth, leafNodes, nodesMap };
//     }, [headerProvider]);
//
//     // Хуки для управления состоянием
//     const tableLogic = useTableLogic({
//         scrollBatchSize,
//         dataProvider,
//         onDataLoad,
//         onError,
//         treeStructure
//     });
//
//     const nodeVisibilityLogic = useNodeVisibility(treeStructure);
//
//     // Обработчик клика по ячейке
//     const handleCellClick = useCallback((date, nodeId, cellValue, event) => {
//         if (onCellClick) {
//             onCellClick({
//                 date,
//                 nodeId,
//                 value: cellValue,
//                 node: treeStructure.nodesMap.get(nodeId),
//                 event
//             });
//         }
//     }, [onCellClick, treeStructure.nodesMap]);
//
//     // Получение значения ячейки
//     const getCellValue = useCallback((processedRow, nodeId) => {
//         return processedRow.elements && processedRow.elements[nodeId]
//             ? processedRow.elements[nodeId].status
//             : 'М';
//     }, []);
//
//     // Вычисляем видимые даты и отступы
//     const { start: startIndex, end: endIndex } = tableLogic.visibleRange;
//     const visibleDates = tableLogic.dates.slice(startIndex, endIndex);
//     const paddingTop = startIndex * tableLogic.rowHeight;
//     const paddingBottom = Math.max(0, (tableLogic.dates.length - endIndex) * tableLogic.rowHeight);
//
//     return (
//         <>
//             {/* Панель управления */}
//             <div style={{
//                 display: 'flex',
//                 gap: '20px',
//                 marginBottom: '10px',
//                 alignItems: 'center'
//             }}>
//                 <div>План 1</div>
//                 <div>Отображать отклонения</div>
//                 <div>Режим редактирования</div>
//                 <button
//                     onClick={() => setShowFilters(!showFilters)}
//                     style={{
//                         padding: '8px 16px',
//                         backgroundColor: 'rgba(108,155,255,0.45)',
//                         border: '1px solid #ccc',
//                         borderRadius: '4px',
//                         cursor: 'pointer'
//                     }}
//                 >
//                     Задать фильтр
//                 </button>
//             </div>
//
//             {/* Панель фильтров */}
//             {showFilters && (
//                 <FiltersPanel
//                     filteredTree={nodeVisibilityLogic.filteredTree}
//                     nodeVisibility={nodeVisibilityLogic.nodeVisibility}
//                     expandedNodes={nodeVisibilityLogic.expandedNodes}
//                     searchTerm={nodeVisibilityLogic.searchTerm}
//                     setSearchTerm={nodeVisibilityLogic.setSearchTerm}
//                     setShowFilters={setShowFilters}
//                     toggleNodeVisibility={nodeVisibilityLogic.toggleNodeVisibility}
//                     toggleNodeExpansion={nodeVisibilityLogic.toggleNodeExpansion}
//                 />
//             )}
//
//             {/* Контейнер таблицы */}
//             <div
//                 ref={tableLogic.containerRef}
//                 style={{
//                     maxWidth,
//                     width: 'fit-content',
//                     height: '100%',
//                     maxHeight,
//                     overflow: 'auto',
//                     border: '1px solid #ccc',
//                     position: 'relative',
//                     fontFamily: 'serif',
//                 }}
//                 onScroll={tableLogic.handleScroll}
//             >
//                 <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
//                     {/* Заголовок таблицы */}
//                     <TableHeader
//                         treeStructure={treeStructure}
//                         nodeVisibility={nodeVisibilityLogic.nodeVisibility}
//                         activeColorTheme={activeColorTheme}
//                     />
//
//                     {/* Тело таблицы */}
//                     <tbody>
//                     {/* Верхний отступ для виртуализации */}
//                     {paddingTop > 0 && (
//                         <tr style={{ height: paddingTop }}>
//                             <td colSpan={nodeVisibilityLogic.visibleLeafNodes.length + 1} style={{ padding: 0, border: 'none' }} />
//                         </tr>
//                     )}
//
//                     {/* Видимые строки данных */}
//                     {visibleDates.map((dateString, index) => {
//                         const processedRow = tableLogic.processedCache[dateString];
//                         const isLoading = !processedRow;
//                         const rowDate = parseDateString(dateString);
//                         const isPastDate = rowDate.getTime() < tableLogic.today.getTime();
//
//                         return (
//                             <tr
//                                 key={`${dateString}-${startIndex + index}`}
//                                 style={{
//                                     height: `${tableLogic.rowHeight}px`,
//                                     backgroundColor: isLoading ? 'transparent' : activeColorTheme("DATE", isPastDate),
//                                 }}
//                             >
//                                 {/* Колонка с датой */}
//                                 <td style={{
//                                     padding: '8px',
//                                     borderRight: '1px solid #ddd',
//                                     fontSize: '14px',
//                                     fontWeight: 'normal',
//                                     whiteSpace: 'nowrap',
//                                     color: isPastDate ? '#666' : 'inherit',
//                                 }}>
//                                     {dateString}
//                                 </td>
//
//                                 {/* Колонки данных для каждого видимого узла */}
//                                 {nodeVisibilityLogic.visibleLeafNodes.map((leafNode) => {
//                                     const cellValue = processedRow ? getCellValue(processedRow, leafNode.id) : 'М';
//
//                                     let shouldDisplay = true;
//                                     let rowSpan = 1;
//
//                                     // Проверяем объединение ячеек (rowspan)
//                                     if (processedRow) {
//                                         const elementData = processedRow.elements[leafNode.id];
//                                         if (elementData) {
//                                             shouldDisplay = elementData.displayed;
//                                             rowSpan = elementData.rowspan;
//                                         }
//                                     }
//
//                                     // Не рендерим ячейку, если она объединена с предыдущей
//                                     if (!shouldDisplay) {
//                                         return null;
//                                     }
//
//                                     return (
//                                         <td
//                                             key={`${dateString}-${leafNode.id}`}
//                                             rowSpan={rowSpan}
//                                             onClick={onCellClick ? (event) => handleCellClick(dateString, leafNode.id, cellValue, event) : undefined}
//                                             style={{
//                                                 padding: '4px',
//                                                 textAlign: 'center',
//                                                 backgroundColor: isLoading ?
//                                                     'transparent' :
//                                                     activeColorTheme(cellValue, isPastDate),
//                                                 fontSize: '14px',
//                                                 minWidth: '50px',
//                                                 verticalAlign: 'middle',
//                                                 borderRight: '1px solid #ddd',
//                                                 fontWeight: 'normal',
//                                                 cursor: onCellClick ? 'pointer' : 'default',
//                                                 userSelect: 'none'
//                                             }}
//                                         >
//                                             {isLoading ? (
//                                                 // Индикатор загрузки
//                                                 <div style={{
//                                                     width: '16px',
//                                                     height: '16px',
//                                                     borderRadius: '50%',
//                                                     border: '2px solid #ddd',
//                                                     borderTop: '2px solid #007bff',
//                                                     animation: 'spin 1s linear infinite',
//                                                     margin: 'auto',
//                                                 }} />
//                                             ) : (
//                                                 // Значение ячейки
//                                                 cellValue
//                                             )}
//                                         </td>
//                                     );
//                                 })}
//                             </tr>
//                         );
//                     })}
//
//                     {/* Нижний отступ для виртуализации */}
//                     {paddingBottom > 0 && (
//                         <tr style={{ height: paddingBottom }}>
//                             <td colSpan={nodeVisibilityLogic.visibleLeafNodes.length + 1} style={{ padding: 0, border: 'none' }} />
//                         </tr>
//                     )}
//                     </tbody>
//                 </table>
//
//                 {/* CSS анимации */}
//                 <style>
//                     {`
//                     @keyframes spin {
//                         0% { transform: rotate(0deg); }
//                         100% { transform: rotate(360deg); }
//                     }
//                 `}
//                 </style>
//             </div>
//
//             {/* Панель отладки */}
//             {debug && (
//                 <div style={{
//                     background: 'rgba(255, 255, 255, 0.95)',
//                     padding: '6px 12px',
//                     margin: "20px 0",
//                     border: '1px solid #ddd',
//                     fontSize: '11px',
//                     fontFamily: 'monospace',
//                     color: '#666',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     gap: '8px',
//                     flexWrap: 'wrap',
//                     width: 'fit-content'
//                 }}>
//                     <span><strong>Видимые строки:</strong> {visibleDates.length}</span>
//                     <span><strong>Диапазон:</strong> {startIndex}-{endIndex}</span>
//                     <span><strong>Всего дат:</strong> {tableLogic.dates.length}</span>
//                     <span><strong>В кэше сырых данных:</strong> {Object.keys(tableLogic.dataCache).length}</span>
//                     <span><strong>В кэше обработанных:</strong> {Object.keys(tableLogic.processedCache).length}</span>
//                     <span><strong>Загружается батчей:</strong> {tableLogic.loadingBatches.size}</span>
//                     <span><strong>Размер батча:</strong> {scrollBatchSize} дней</span>
//                     <span><strong>Скорость скролла:</strong> {tableLogic.scrollVelocity.current.toFixed(2)}</span>
//                     <span><strong>Глубина дерева:</strong> {treeStructure.maxDepth}</span>
//                     <span><strong>Всего листовых узлов:</strong> {treeStructure.leafNodes.length}</span>
//                     <span><strong>Видимых листовых узлов:</strong> {nodeVisibilityLogic.visibleLeafNodes.length}</span>
//                     <span><strong>Развернутых узлов:</strong> {nodeVisibilityLogic.expandedNodes.size}</span>
//                     <span><strong>Поисковый запрос:</strong> "{nodeVisibilityLogic.searchTerm}"</span>
//                 </div>
//             )}
//         </>
//     );
// };
//
// export default Table;

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { TableHeader } from './components/TableHeader.jsx';
import { FiltersPanel } from './components/FiltersPanel.jsx';
import { useTableLogic } from './hooks/useTableLogic.js';
import { useNodeVisibility } from './hooks/useNodeVisibility.js';

// Встроенные утилиты (убираем зависимости от внешних файлов)
const parseDateString = (dateString) => {
    const [day, month, year] = dateString.split('.').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
};

// Дефолтные заголовки (встроенные)
const defaultHeaders = {
    headers: [
        { id: "default1", parentId: null, name: "По умолчанию 1", metadata: { color: "#4caf50" } },
        { id: "default2", parentId: null, name: "По умолчанию 2", metadata: { color: "#ff9800" } },
        { id: "default3", parentId: null, name: "По умолчанию 3", metadata: { color: "#f44336" } },
        { id: "default4", parentId: null, name: "По умолчанию 4", metadata: { color: "#2196f3" } }
    ]
};

/**
 * VIRTUALIZED TABLE COMPONENT
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
    const [headersData, setHeadersData] = useState(defaultHeaders);
    const [headersError, setHeadersError] = useState(null);

    // Цветовая тема
    const defaultColorTheme = useCallback((value, isPast) => {
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
    }, []);

    const activeColorTheme = colorTheme || defaultColorTheme;

    // Эффект для загрузки заголовков
    useEffect(() => {
        console.log('[Table] Инициализация заголовков...');

        try {
            // Проверяем переданный headerProvider
            if (headerProvider && typeof headerProvider === 'function') {
                console.log('[Table] Используем переданный headerProvider');
                const structure = headerProvider();

                if (structure && structure.headers && Array.isArray(structure.headers)) {
                    console.log(`[Table] Загружены заголовки: ${structure.headers.length} элементов`);
                    setHeadersData(structure);
                    setHeadersError(null);
                    return;
                } else {
                    console.error('[Table] Переданный headerProvider возвращает некорректную структуру:', structure);
                }
            }

            // Проверяем глобальные провайдеры
            if (typeof window !== 'undefined') {
                if (window.HeadersProvider && typeof window.HeadersProvider === 'function') {
                    console.log('[Table] Используем window.HeadersProvider');
                    const structure = window.HeadersProvider();

                    if (structure && structure.headers && Array.isArray(structure.headers)) {
                        console.log(`[Table] Загружены заголовки из window: ${structure.headers.length} элементов`);
                        setHeadersData(structure);
                        setHeadersError(null);
                        return;
                    }
                }

                if (window.hp && typeof window.hp === 'function') {
                    console.log('[Table] Используем window.hp');
                    const structure = window.hp();

                    if (structure && structure.headers && Array.isArray(structure.headers)) {
                        console.log(`[Table] Загружены заголовки из hp: ${structure.headers.length} элементов`);
                        setHeadersData(structure);
                        setHeadersError(null);
                        return;
                    }
                }
            }

            // Fallback на дефолтные заголовки
            console.log('[Table] Используем заголовки по умолчанию');
            setHeadersData(defaultHeaders);
            setHeadersError(null);

        } catch (error) {
            console.error('[Table] Ошибка при загрузке заголовков:', error);
            setHeadersError(error.message);
            setHeadersData(defaultHeaders);
        }
    }, [headerProvider]);

    // Структура дерева заголовков
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

    // Хуки для управления состоянием
    const tableLogic = useTableLogic({
        scrollBatchSize,
        dataProvider,
        onDataLoad,
        onError,
        treeStructure
    });

    const nodeVisibilityLogic = useNodeVisibility(treeStructure);

    // Обработчик клика по ячейке
    const handleCellClick = useCallback((date, nodeId, cellValue, event) => {
        if (onCellClick) {
            onCellClick({
                date,
                nodeId,
                value: cellValue,
                node: treeStructure.nodesMap.get(nodeId),
                event
            });
        }
    }, [onCellClick, treeStructure.nodesMap]);

    // Получение значения ячейки
    const getCellValue = useCallback((processedRow, nodeId) => {
        return processedRow.elements && processedRow.elements[nodeId]
            ? processedRow.elements[nodeId].status
            : 'М';
    }, []);

    // Вычисляем видимые даты и отступы
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

                                    let shouldDisplay = true;
                                    let rowSpan = 1;

                                    if (processedRow) {
                                        const elementData = processedRow.elements[leafNode.id];
                                        if (elementData) {
                                            shouldDisplay = elementData.displayed;
                                            rowSpan = elementData.rowspan;
                                        }
                                    }

                                    if (!shouldDisplay) {
                                        return null;
                                    }

                                    return (
                                        <td
                                            key={`${dateString}-${leafNode.id}`}
                                            rowSpan={rowSpan}
                                            onClick={onCellClick ? (event) => handleCellClick(dateString, leafNode.id, cellValue, event) : undefined}
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
                                                cursor: onCellClick ? 'pointer' : 'default',
                                                userSelect: 'none'
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
                </div>
            )}
        </>
    );
};

export default Table;
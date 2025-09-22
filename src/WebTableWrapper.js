// // import React, { useCallback, useEffect, useState, useRef } from 'react';
// // import r2wc from '@r2wc/react-to-web-component';
// // import { Table } from './component/Table/index';
// //
// // // Импортируем глобальное состояние
// // import './VirtualizedTableState.js';
// //
// // /**
// //  * Wrapper компонент для Web Component с поддержкой глобального состояния
// //  */
// // const TableWrapper = ({
// //                           maxWidth,
// //                           maxHeight,
// //                           scrollBatchSize,
// //                           debug,
// //                           dataProviderName,
// //                           headerProviderName,
// //                           onCellClickHandler
// //                       }) => {
// //     const [isReady, setIsReady] = useState(false);
// //
// //     // Состояния синхронизированные с глобальным объектом
// //     const [editMode, setEditMode] = useState(false);
// //     const [showFilters, setShowFilters] = useState(false);
// //     const [stateVersion, setStateVersion] = useState(0);
// //
// //     // Refs для кэширования провайдеров
// //     const dataProviderRef = useRef(null);
// //     const headerProviderRef = useRef(null);
// //     const lastCheckRef = useRef(0);
// //
// //     // Цветовая тема
// //     const colorTheme = useCallback((value, isPast) => {
// //         if (value === "BGHeader") return '#dee3f5';
// //         if (value === "DATE") return isPast ? '#acb5e3' : 'white';
// //         return isPast ? '#acb5e3' : 'white';
// //     }, []);
// //
// //     // Обработчик клика с поддержкой нового API
// //     const handleCellClick = useCallback((cellData, event) => {
// //         console.log('[TableWrapper] Ячейка кликнута:', cellData);
// //
// //         // Используем новый API если доступен
// //         if (typeof window !== 'undefined' && window.VirtualizedTableState?.onCellClick) {
// //             try {
// //                 window.VirtualizedTableState.onCellClick(cellData, event);
// //             } catch (error) {
// //                 console.error('Ошибка в глобальном обработчике кликов:', error);
// //             }
// //         }
// //
// //         // Пробуем найти обработчик по имени
// //         if (onCellClickHandler && window[onCellClickHandler]) {
// //             try {
// //                 window[onCellClickHandler](cellData);
// //             } catch (error) {
// //                 console.error(`Ошибка в обработчике ${onCellClickHandler}:`, error);
// //             }
// //         }
// //
// //         // Обратная совместимость
// //         if (window.onTableCellClick) {
// //             try {
// //                 const jsonString = JSON.stringify(cellData);
// //                 window.onTableCellClick(jsonString);
// //             } catch (error) {
// //                 console.error('Ошибка в window.onTableCellClick:', error);
// //             }
// //         }
// //
// //         // Кастомное событие
// //         const customEvent = new CustomEvent('table-cell-double-click', {
// //             detail: cellData,
// //             bubbles: true
// //         });
// //         window.dispatchEvent(customEvent);
// //     }, [onCellClickHandler]);
// //
// //     // ИСПРАВЛЕННАЯ функция получения провайдера данных БЕЗ stateVersion в зависимостях
// //     const getDataProvider = useCallback(() => {
// //         // Проверяем, нужно ли обновить кэш
// //         const now = Date.now();
// //         if (dataProviderRef.current && (now - lastCheckRef.current < 1000)) {
// //             return dataProviderRef.current;
// //         }
// //
// //         let provider = null;
// //
// //         // Сначала проверяем глобальное состояние
// //         if (typeof window !== 'undefined' && window.VirtualizedTableState?.dataProvider) {
// //             console.log('[WebTableWrapper] Используем глобальный провайдер данных');
// //             provider = window.VirtualizedTableState.dataProvider;
// //         }
// //         // Затем проверяем по имени
// //         else if (dataProviderName && typeof dataProviderName === 'string' && window[dataProviderName]) {
// //             const namedProvider = window[dataProviderName];
// //             if (typeof namedProvider === 'function') {
// //                 console.log(`[WebTableWrapper] Используем провайдер данных: window.${dataProviderName}`);
// //                 provider = namedProvider;
// //             }
// //         }
// //         // Проверяем стандартные имена
// //         else {
// //             const possibleProviders = ['dp', 'dataProvider', 'DataProvider'];
// //             for (const providerName of possibleProviders) {
// //                 if (window[providerName] && typeof window[providerName] === 'function') {
// //                     console.log(`[WebTableWrapper] Используем провайдер данных: window.${providerName}`);
// //                     provider = window[providerName];
// //                     break;
// //                 }
// //             }
// //         }
// //
// //         if (!provider) {
// //             console.warn('[WebTableWrapper] Провайдер данных не найден');
// //         }
// //
// //         // Кэшируем результат
// //         dataProviderRef.current = provider;
// //         lastCheckRef.current = now;
// //         return provider;
// //     }, [dataProviderName]); // Убираем stateVersion из зависимостей
// //
// //     // ИСПРАВЛЕННАЯ функция получения провайдера заголовков БЕЗ stateVersion в зависимостях
// //     const getHeaderProvider = useCallback(() => {
// //         // Используем тот же кэш что и для dataProvider
// //         const now = Date.now();
// //         if (headerProviderRef.current && (now - lastCheckRef.current < 1000)) {
// //             return headerProviderRef.current;
// //         }
// //
// //         let provider = null;
// //
// //         // Сначала проверяем глобальное состояние
// //         if (typeof window !== 'undefined' && window.VirtualizedTableState?.headerProvider) {
// //             console.log('[WebTableWrapper] Используем глобальный провайдер заголовков');
// //             provider = window.VirtualizedTableState.headerProvider;
// //         }
// //         // Затем проверяем по имени
// //         else if (headerProviderName && typeof headerProviderName === 'string' && window[headerProviderName]) {
// //             const namedProvider = window[headerProviderName];
// //             if (typeof namedProvider === 'function') {
// //                 console.log(`[WebTableWrapper] Используем провайдер заголовков: window.${headerProviderName}`);
// //                 provider = namedProvider;
// //             }
// //         }
// //         // Проверяем стандартные имена
// //         else {
// //             const standardProviders = ['hp', 'HeadersProvider'];
// //             for (const providerName of standardProviders) {
// //                 if (window[providerName] && typeof window[providerName] === 'function') {
// //                     console.log(`[WebTableWrapper] Используем провайдер заголовков: window.${providerName}`);
// //                     provider = window[providerName];
// //                     break;
// //                 }
// //             }
// //         }
// //
// //         if (!provider) {
// //             console.warn('[WebTableWrapper] Провайдер заголовков не найден');
// //         }
// //
// //         // Кэшируем результат
// //         headerProviderRef.current = provider;
// //         return provider;
// //     }, [headerProviderName]); // Убираем stateVersion из зависимостей
// //
// //     // Синхронизация с глобальным состоянием (оптимизированная)
// //     useEffect(() => {
// //         const syncStateFromGlobal = () => {
// //             if (typeof window !== 'undefined' && window.VirtualizedTableState) {
// //                 const state = window.VirtualizedTableState;
// //                 setEditMode(prev => prev !== state.editMode ? state.editMode : prev);
// //                 setShowFilters(prev => prev !== state.showFilters ? state.showFilters : prev);
// //                 setStateVersion(prev => prev + 1);
// //             }
// //         };
// //
// //         // Начальная синхронизация
// //         syncStateFromGlobal();
// //
// //         // Слушаем изменения глобального состояния
// //         const handleGlobalStateChange = (event) => {
// //             console.log('[TableWrapper] Глобальное состояние изменилось:', event.detail);
// //             syncStateFromGlobal();
// //         };
// //
// //         if (typeof window !== 'undefined') {
// //             window.addEventListener('virtualized-table-state-change', handleGlobalStateChange);
// //
// //             // УБИРАЕМ частую проверку каждые 100ms - заменяем на редкую проверку
// //             const syncInterval = setInterval(syncStateFromGlobal, 5000); // Раз в 5 секунд вместо 100ms
// //
// //             return () => {
// //                 window.removeEventListener('virtualized-table-state-change', handleGlobalStateChange);
// //                 clearInterval(syncInterval);
// //             };
// //         }
// //     }, []);
// //
// //     // ИСПРАВЛЕННАЯ инициализация компонента с использованием refs
// //     useEffect(() => {
// //         const initializeWithRetry = () => {
// //             const dataProvider = getDataProvider();
// //             const headerProvider = getHeaderProvider();
// //
// //             if (dataProvider || headerProvider) {
// //                 console.log('[WebTableWrapper] Провайдеры найдены, инициализируем таблицу');
// //                 setIsReady(true);
// //
// //                 // Обновляем глобальное состояние только если провайдеры изменились
// //                 if (typeof window !== 'undefined' && window.VirtualizedTableState) {
// //                     if (!window.VirtualizedTableState.dataProvider && dataProvider) {
// //                         window.VirtualizedTableState.dataProvider = dataProvider;
// //                     }
// //                     if (!window.VirtualizedTableState.headerProvider && headerProvider) {
// //                         window.VirtualizedTableState.headerProvider = headerProvider;
// //                     }
// //                 }
// //             } else {
// //                 console.log('[WebTableWrapper] Провайдеры не найдены, повторная проверка через 1000мс');
// //                 setTimeout(initializeWithRetry, 1000); // Увеличиваем интервал
// //             }
// //         };
// //
// //         // Проверяем только если еще не готов
// //         if (!isReady) {
// //             initializeWithRetry();
// //
// //             const checkInterval = setInterval(() => {
// //                 if (!isReady) {
// //                     initializeWithRetry();
// //                 }
// //             }, 2000); // Увеличиваем интервал проверки
// //
// //             return () => clearInterval(checkInterval);
// //         }
// //     }, [isReady]); // Убираем getDataProvider и getHeaderProvider из зависимостей
// //
// //     // Сброс кэша провайдеров при изменении имен
// //     useEffect(() => {
// //         dataProviderRef.current = null;
// //         headerProviderRef.current = null;
// //         lastCheckRef.current = 0;
// //     }, [dataProviderName, headerProviderName]);
// //
// //     if (!isReady) {
// //         return (
// //             <div style={{
// //                 display: 'flex',
// //                 flexDirection: 'column',
// //                 justifyContent: 'center',
// //                 alignItems: 'center',
// //                 height: '200px',
// //                 fontSize: '14px',
// //                 color: '#666',
// //                 gap: '10px'
// //             }}>
// //                 <div style={{
// //                     width: '20px',
// //                     height: '20px',
// //                     borderRadius: '50%',
// //                     border: '2px solid #ddd',
// //                     borderTop: '2px solid #007bff',
// //                     animation: 'spin 1s linear infinite'
// //                 }} />
// //                 <div>Инициализация таблицы...</div>
// //                 <div style={{ fontSize: '12px', color: '#999' }}>
// //                     Ожидание провайдеров данных и заголовков
// //                 </div>
// //                 {typeof window !== 'undefined' && window.VirtualizedTableState && (
// //                     <div style={{ fontSize: '10px', color: '#999' }}>
// //                         Режим редактирования: {editMode ? 'включен' : 'выключен'}
// //                     </div>
// //                 )}
// //                 <style>
// //                     {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
// //                 </style>
// //             </div>
// //         );
// //     }
// //
// //     return (
// //         <Table
// //             maxWidth={maxWidth}
// //             maxHeight={maxHeight}
// //             scrollBatchSize={parseInt(scrollBatchSize) ||
// //                 (typeof window !== 'undefined' && window.VirtualizedTableState
// //                     ? window.VirtualizedTableState.scrollBatchSize
// //                     : 7)}
// //             debug={debug === 'true' || debug === true ||
// //                 (typeof window !== 'undefined' && window.VirtualizedTableState?.debug)}
// //             colorTheme={colorTheme}
// //             dataProvider={getDataProvider()}
// //             headerProvider={getHeaderProvider()}
// //             onCellClick={handleCellClick}
// //             editMode={editMode}
// //             showFilters={showFilters}
// //         />
// //     );
// // };
// //
// // // Преобразование в Web Component БЕЗ Shadow DOM
// // const TableWebComponent = r2wc(TableWrapper, {
// //     props: {
// //         maxWidth: 'string',
// //         maxHeight: 'string',
// //         scrollBatchSize: 'string',
// //         debug: 'string',
// //         dataProviderName: 'string',
// //         headerProviderName: 'string',
// //         onCellClickHandler: 'string'
// //     },
// //     shadow: false
// // });
// //
// // // Регистрация Web Component
// // customElements.define('virtualized-table', TableWebComponent);
// //
// // // Проверка регистрации и дополнительная диагностика
// // if (typeof window !== 'undefined') {
// //     window.checkTableComponent = function() {
// //         const isRegistered = customElements.get('virtualized-table');
// //         const state = window.VirtualizedTableState ? { ...window.VirtualizedTableState } : null;
// //
// //         console.log('[ComponentCheck] Статус:', {
// //             registered: !!isRegistered,
// //             globalState: !!window.VirtualizedTableState,
// //             API: !!window.VirtualizedTableAPI,
// //             state: state
// //         });
// //
// //         return {
// //             registered: !!isRegistered,
// //             globalState: state
// //         };
// //     };
// //
// //     // Автоматическая инициализация глобальных функций если они не существуют
// //     setTimeout(() => {
// //         if (!window.VirtualizedTableState) {
// //             console.warn('[WebTableWrapper] VirtualizedTableState не найден, создаем базовый объект');
// //             window.VirtualizedTableState = {
// //                 editMode: false,
// //                 showFilters: false,
// //                 debug: false,
// //                 scrollBatchSize: 7,
// //                 bufferSize: 4,
// //                 onCellClick: null,
// //                 onCellMove: null,
// //                 onDataLoad: null,
// //                 onError: null,
// //                 dataProvider: null,
// //                 headerProvider: null,
// //                 _initialized: false,
// //                 _loading: false,
// //                 _error: null
// //             };
// //         }
// //
// //         if (!window.VirtualizedTableAPI) {
// //             console.warn('[WebTableWrapper] VirtualizedTableAPI не найден, создаем базовое API');
// //             window.VirtualizedTableAPI = {
// //                 setEditMode: (enabled) => {
// //                     window.VirtualizedTableState.editMode = enabled;
// //                 },
// //                 setShowFilters: (show) => {
// //                     window.VirtualizedTableState.showFilters = show;
// //                 },
// //                 getState: () => ({ ...window.VirtualizedTableState })
// //             };
// //         }
// //     }, 100);
// // }
// //
// // export { TableWrapper };
// // export default TableWebComponent;
//
//
// import React, { useCallback, useEffect, useState, useRef } from 'react';
// import r2wc from '@r2wc/react-to-web-component';
// import { Table } from './component/Table/index';
//
// // Импортируем глобальное состояние
// import './VirtualizedTableState.js';
//
// /**
//  * Wrapper компонент для Web Component с поддержкой глобального состояния
//  */
// const TableWrapper = ({
//                           maxWidth,
//                           maxHeight,
//                           scrollBatchSize,
//                           debug,
//                           dataProviderName,
//                           headerProviderName,
//                           onCellClickHandler
//                       }) => {
//     const [isReady, setIsReady] = useState(false);
//
//     // Состояния синхронизированные с глобальным объектом
//     const [editMode, setEditMode] = useState(false);
//     const [showFilters, setShowFilters] = useState(false);
//     const [stateVersion, setStateVersion] = useState(0);
//
//     // Refs для кэширования провайдеров
//     const dataProviderRef = useRef(null);
//     const headerProviderRef = useRef(null);
//     const lastCheckRef = useRef(0);
//
//     // Цветовая тема
//     const colorTheme = useCallback((value, isPast) => {
//         if (value === "BGHeader") return '#dee3f5';
//         if (value === "DATE") return isPast ? '#acb5e3' : 'white';
//         return isPast ? '#acb5e3' : 'white';
//     }, []);
//
//     // ИСПРАВЛЕННЫЙ обработчик клика - все через VirtualizedTableState
//     // const handleCellClick = useCallback((cellData, event) => {
//     //     console.log('[TableWrapper] Ячейка кликнута:', cellData);
//     //
//     //     // 1. ОСНОВНОЙ ПУТЬ - через VirtualizedTableState.onCellClick
//     //     if (typeof window !== 'undefined' && window.VirtualizedTableState?.onCellClick) {
//     //         try {
//     //             window.VirtualizedTableState.onCellClick(cellData, event);
//     //         } catch (error) {
//     //             console.error('Ошибка в VirtualizedTableState.onCellClick:', error);
//     //         }
//     //     }
//     //
//     //     // 2. ОБРАТНАЯ СОВМЕСТИМОСТЬ - пробуем найти обработчик по имени
//     //     if (onCellClickHandler && window[onCellClickHandler]) {
//     //         try {
//     //             window[onCellClickHandler](cellData);
//     //         } catch (error) {
//     //             console.error(`Ошибка в обработчике ${onCellClickHandler}:`, error);
//     //         }
//     //     }
//     //
//     //     // 3. УСТАРЕВШИЙ API - window.onTableCellClick (будет удален)
//     //     if (window.onTableCellClick) {
//     //         try {
//     //             const jsonString = JSON.stringify(cellData);
//     //             window.onTableCellClick(jsonString);
//     //             console.warn('[TableWrapper] window.onTableCellClick устарел, используйте VirtualizedTableAPI.setOnCellClick()');
//     //         } catch (error) {
//     //             console.error('Ошибка в window.onTableCellClick:', error);
//     //         }
//     //     }
//     //
//     //     // 4. Кастомное событие для дополнительной совместимости
//     //     const customEvent = new CustomEvent('table-cell-click', {
//     //         detail: cellData,
//     //         bubbles: true
//     //     });
//     //     window.dispatchEvent(customEvent);
//     // }, [onCellClickHandler]);
//
//     // НОВЫЙ обработчик двойного клика - через VirtualizedTableState
//     const handleCellDoubleClick = useCallback((cellData, event) => {
//         console.log('[TableWrapper] Ячейка ДВАЖДЫ кликнута (двойной клик):', cellData);
//
//         // 1. ОСНОВНОЙ ПУТЬ - через VirtualizedTableState.onCellDoubleClick
//         if (typeof window !== 'undefined' && window.VirtualizedTableState?.onCellDoubleClick) {
//             try {
//                 const jsonString = JSON.stringify(cellData);
//                 console.log('[TableWrapper] cellData как объект:', cellData);
//                 console.log('[TableWrapper] Преобразованная JSON строка:', jsonString);
//                 console.log('[TableWrapper] Тип jsonString:', typeof jsonString);
//                 console.log('[TableWrapper] Вызываем обработчик с:', jsonString);
//
//                 window.VirtualizedTableState.onCellDoubleClick(jsonString, event);
//
//                 console.log('[TableWrapper] Обработчик вызван успешно');
//             } catch (error) {
//                 console.error('Ошибка в VirtualizedTableState.onCellDoubleClick:', error);
//             }
//         } else {
//             console.warn('[TableWrapper] VirtualizedTableState.onCellDoubleClick не установлен');
//         }
//
//         // 2. Кастомное событие
//         const customEvent = new CustomEvent('table-cell-double-click', {
//             detail: cellData,
//             bubbles: true
//         });
//         window.dispatchEvent(customEvent);
//     }, []);
//
//     // НОВЫЙ обработчик перемещения ячейки - через VirtualizedTableState
//     const handleCellMove = useCallback((moveData) => {
//         console.log('[TableWrapper] Ячейка перемещена:', moveData);
//
//         // 1. ОСНОВНОЙ ПУТЬ - через VirtualizedTableState.onCellMove
//         if (typeof window !== 'undefined' && window.VirtualizedTableState?.onCellMove) {
//             try {
//                 window.VirtualizedTableState.onCellMove(moveData);
//             } catch (error) {
//                 console.error('Ошибка в VirtualizedTableState.onCellMove:', error);
//             }
//         }
//
//         // 2. УСТАРЕВШИЙ API - window.onTableCellMove (будет удален)
//         if (window.onTableCellMove) {
//             try {
//                 window.onTableCellMove(moveData);
//                 console.warn('[TableWrapper] window.onTableCellMove устарел, используйте VirtualizedTableAPI.setOnCellMove()');
//             } catch (error) {
//                 console.error('Ошибка в window.onTableCellMove:', error);
//             }
//         }
//
//         // 3. Кастомное событие
//         const customEvent = new CustomEvent('table-cell-move', {
//             detail: moveData,
//             bubbles: true
//         });
//         window.dispatchEvent(customEvent);
//     }, []);
//
//     // Функция получения провайдера данных БЕЗ stateVersion в зависимостях
//     const getDataProvider = useCallback(() => {
//         // Проверяем, нужно ли обновить кэш
//         const now = Date.now();
//         if (dataProviderRef.current && (now - lastCheckRef.current < 1000)) {
//             return dataProviderRef.current;
//         }
//
//         let provider = null;
//
//         // Сначала проверяем глобальное состояние
//         if (typeof window !== 'undefined' && window.VirtualizedTableState?.dataProvider) {
//             console.log('[WebTableWrapper] Используем глобальный провайдер данных');
//             provider = window.VirtualizedTableState.dataProvider;
//         }
//         // Затем проверяем по имени
//         else if (dataProviderName && typeof dataProviderName === 'string' && window[dataProviderName]) {
//             const namedProvider = window[dataProviderName];
//             if (typeof namedProvider === 'function') {
//                 console.log(`[WebTableWrapper] Используем провайдер данных: window.${dataProviderName}`);
//                 provider = namedProvider;
//             }
//         }
//         // Проверяем стандартные имена
//         else {
//             const possibleProviders = ['dp', 'dataProvider', 'DataProvider'];
//             for (const providerName of possibleProviders) {
//                 if (window[providerName] && typeof window[providerName] === 'function') {
//                     console.log(`[WebTableWrapper] Используем провайдер данных: window.${providerName}`);
//                     provider = window[providerName];
//                     break;
//                 }
//             }
//         }
//
//         if (!provider) {
//             console.warn('[WebTableWrapper] Провайдер данных не найден');
//         }
//
//         // Кэшируем результат
//         dataProviderRef.current = provider;
//         lastCheckRef.current = now;
//         return provider;
//     }, [dataProviderName]);
//
//     // Функция получения провайдера заголовков БЕЗ stateVersion в зависимостях
//     const getHeaderProvider = useCallback(() => {
//         // Используем тот же кэш что и для dataProvider
//         const now = Date.now();
//         if (headerProviderRef.current && (now - lastCheckRef.current < 1000)) {
//             return headerProviderRef.current;
//         }
//
//         let provider = null;
//
//         // Сначала проверяем глобальное состояние
//         if (typeof window !== 'undefined' && window.VirtualizedTableState?.headerProvider) {
//             console.log('[WebTableWrapper] Используем глобальный провайдер заголовков');
//             provider = window.VirtualizedTableState.headerProvider;
//         }
//         // Затем проверяем по имени
//         else if (headerProviderName && typeof headerProviderName === 'string' && window[headerProviderName]) {
//             const namedProvider = window[headerProviderName];
//             if (typeof namedProvider === 'function') {
//                 console.log(`[WebTableWrapper] Используем провайдер заголовков: window.${headerProviderName}`);
//                 provider = namedProvider;
//             }
//         }
//         // Проверяем стандартные имена
//         else {
//             const standardProviders = ['hp', 'HeadersProvider'];
//             for (const providerName of standardProviders) {
//                 if (window[providerName] && typeof window[providerName] === 'function') {
//                     console.log(`[WebTableWrapper] Используем провайдер заголовков: window.${providerName}`);
//                     provider = window[providerName];
//                     break;
//                 }
//             }
//         }
//
//         if (!provider) {
//             console.warn('[WebTableWrapper] Провайдер заголовков не найден');
//         }
//
//         // Кэшируем результат
//         headerProviderRef.current = provider;
//         return provider;
//     }, [headerProviderName]);
//
//     // Синхронизация с глобальным состоянием (оптимизированная)
//     useEffect(() => {
//         const syncStateFromGlobal = () => {
//             if (typeof window !== 'undefined' && window.VirtualizedTableState) {
//                 const state = window.VirtualizedTableState;
//                 setEditMode(prev => prev !== state.editMode ? state.editMode : prev);
//                 setShowFilters(prev => prev !== state.showFilters ? state.showFilters : prev);
//                 setStateVersion(prev => prev + 1);
//             }
//         };
//
//         // Начальная синхронизация
//         syncStateFromGlobal();
//
//         // Слушаем изменения глобального состояния
//         const handleGlobalStateChange = (event) => {
//             console.log('[TableWrapper] Глобальное состояние изменилось:', event.detail);
//             syncStateFromGlobal();
//         };
//
//         if (typeof window !== 'undefined') {
//             window.addEventListener('virtualized-table-state-change', handleGlobalStateChange);
//
//             // Редкая проверка каждые 5 секунд вместо 100ms
//             const syncInterval = setInterval(syncStateFromGlobal, 5000);
//
//             return () => {
//                 window.removeEventListener('virtualized-table-state-change', handleGlobalStateChange);
//                 clearInterval(syncInterval);
//             };
//         }
//     }, []);
//
//     // Инициализация компонента с использованием refs
//     useEffect(() => {
//         const initializeWithRetry = () => {
//             const dataProvider = getDataProvider();
//             const headerProvider = getHeaderProvider();
//
//             if (dataProvider || headerProvider) {
//                 console.log('[WebTableWrapper] Провайдеры найдены, инициализируем таблицу');
//                 setIsReady(true);
//
//                 // Обновляем глобальное состояние только если провайдеры изменились
//                 if (typeof window !== 'undefined' && window.VirtualizedTableState) {
//                     if (!window.VirtualizedTableState.dataProvider && dataProvider) {
//                         window.VirtualizedTableState.dataProvider = dataProvider;
//                     }
//                     if (!window.VirtualizedTableState.headerProvider && headerProvider) {
//                         window.VirtualizedTableState.headerProvider = headerProvider;
//                     }
//                 }
//             } else {
//                 console.log('[WebTableWrapper] Провайдеры не найдены, повторная проверка через 1000мс');
//                 setTimeout(initializeWithRetry, 1000);
//             }
//         };
//
//         // Проверяем только если еще не готов
//         if (!isReady) {
//             initializeWithRetry();
//
//             const checkInterval = setInterval(() => {
//                 if (!isReady) {
//                     initializeWithRetry();
//                 }
//             }, 2000);
//
//             return () => clearInterval(checkInterval);
//         }
//     }, [isReady]);
//
//     // Сброс кэша провайдеров при изменении имен
//     useEffect(() => {
//         dataProviderRef.current = null;
//         headerProviderRef.current = null;
//         lastCheckRef.current = 0;
//     }, [dataProviderName, headerProviderName]);
//
//     if (!isReady) {
//         return (
//             <div style={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 height: '200px',
//                 fontSize: '14px',
//                 color: '#666',
//                 gap: '10px'
//             }}>
//                 <div style={{
//                     width: '20px',
//                     height: '20px',
//                     borderRadius: '50%',
//                     border: '2px solid #ddd',
//                     borderTop: '2px solid #007bff',
//                     animation: 'spin 1s linear infinite'
//                 }} />
//                 <div>Инициализация таблицы...</div>
//                 <div style={{ fontSize: '12px', color: '#999' }}>
//                     Ожидание провайдеров данных и заголовков
//                 </div>
//                 {typeof window !== 'undefined' && window.VirtualizedTableState && (
//                     <div style={{ fontSize: '10px', color: '#999' }}>
//                         Режим редактирования: {editMode ? 'включен' : 'выключен'}
//                     </div>
//                 )}
//                 <style>
//                     {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
//                 </style>
//             </div>
//         );
//     }
//
//     return (
//         <Table
//             maxWidth={maxWidth}
//             maxHeight={maxHeight}
//             scrollBatchSize={parseInt(scrollBatchSize) ||
//                 (typeof window !== 'undefined' && window.VirtualizedTableState
//                     ? window.VirtualizedTableState.scrollBatchSize
//                     : 7)}
//             debug={debug === 'true' || debug === true ||
//                 (typeof window !== 'undefined' && window.VirtualizedTableState?.debug)}
//             colorTheme={colorTheme}
//             dataProvider={getDataProvider()}
//             headerProvider={getHeaderProvider()}
//             // onCellClick={handleCellClick}
//             onCellDoubleClick={handleCellDoubleClick}
//             onCellMove={handleCellMove}
//             editMode={editMode}
//             showFilters={showFilters}
//         />
//     );
// };
//
// // Преобразование в Web Component БЕЗ Shadow DOM
// const TableWebComponent = r2wc(TableWrapper, {
//     props: {
//         maxWidth: 'string',
//         maxHeight: 'string',
//         scrollBatchSize: 'string',
//         debug: 'string',
//         dataProviderName: 'string',
//         headerProviderName: 'string',
//         onCellClickHandler: 'string'
//     },
//     shadow: false
// });
//
// // Регистрация Web Component
// customElements.define('virtualized-table', TableWebComponent);
//
// // Проверка регистрации и дополнительная диагностика
// if (typeof window !== 'undefined') {
//     window.checkTableComponent = function() {
//         const isRegistered = customElements.get('virtualized-table');
//         const state = window.VirtualizedTableState ? { ...window.VirtualizedTableState } : null;
//
//         console.log('[ComponentCheck] Статус:', {
//             registered: !!isRegistered,
//             globalState: !!window.VirtualizedTableState,
//             API: !!window.VirtualizedTableAPI,
//             state: state
//         });
//
//         return {
//             registered: !!isRegistered,
//             globalState: state
//         };
//     };
//
//     // Автоматическая инициализация глобальных функций если они не существуют
//     setTimeout(() => {
//         if (!window.VirtualizedTableState) {
//             console.warn('[WebTableWrapper] VirtualizedTableState не найден, создаем базовый объект');
//             window.VirtualizedTableState = {
//                 editMode: false,
//                 showFilters: false,
//                 debug: false,
//                 scrollBatchSize: 7,
//                 bufferSize: 4,
//                 onCellClick: null,
//                 onCellDoubleClick: null,
//                 onCellMove: null,
//                 onDataLoad: null,
//                 onError: null,
//                 dataProvider: null,
//                 headerProvider: null,
//                 _initialized: false,
//                 _loading: false,
//                 _error: null
//             };
//         }
//
//         if (!window.VirtualizedTableAPI) {
//             console.warn('[WebTableWrapper] VirtualizedTableAPI не найден, создаем базовое API');
//             window.VirtualizedTableAPI = {
//                 setEditMode: (enabled) => {
//                     window.VirtualizedTableState.editMode = enabled;
//                 },
//                 setShowFilters: (show) => {
//                     window.VirtualizedTableState.showFilters = show;
//                 },
//                 getState: () => ({ ...window.VirtualizedTableState }),
//                 setOnCellClick: (handler) => {
//                     window.VirtualizedTableState.onCellClick = handler;
//                 },
//                 setOnCellDoubleClick: (handler) => {
//                     window.VirtualizedTableState.onCellDoubleClick = handler;
//                 },
//                 setOnCellMove: (handler) => {
//                     window.VirtualizedTableState.onCellMove = handler;
//                 }
//             };
//         }
//     }, 100);
// }
//
// export { TableWrapper };
// export default TableWebComponent;

import React, { useCallback, useEffect, useState, useRef } from 'react';
import r2wc from '@r2wc/react-to-web-component';
import { Table } from './component/Table/index';

// Импортируем глобальное состояние
import './VirtualizedTableState.js';

/**
 * Wrapper компонент для Web Component с поддержкой глобального состояния
 */
const TableWrapper = ({
                          maxWidth,
                          maxHeight,
                          scrollBatchSize,
                          debug,
                          dataProviderName,
                          headerProviderName,
                          onCellClickHandler
                      }) => {
    const [isReady, setIsReady] = useState(false);

    // Состояния синхронизированные с глобальным объектом
    const [editMode, setEditMode] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [stateVersion, setStateVersion] = useState(0);

    // Refs для кэширования провайдеров
    const dataProviderRef = useRef(null);
    const headerProviderRef = useRef(null);
    const lastCheckRef = useRef(0);

    // Цветовая тема
    const colorTheme = useCallback((value, isPast) => {
        if (value === "BGHeader") return '#dee3f5';
        if (value === "DATE") return isPast ? '#acb5e3' : 'white';
        return isPast ? '#acb5e3' : 'white';
    }, []);

    // ИСПРАВЛЕННЫЙ обработчик клика - все через VirtualizedTableState
    const handleCellClick = useCallback((cellData, event) => {
        console.log('[TableWrapper] Ячейка кликнута:', cellData);

        // 1. ОСНОВНОЙ ПУТЬ - через VirtualizedTableState.onCellClick
        if (typeof window !== 'undefined' && window.VirtualizedTableState?.onCellClick) {
            try {
                window.VirtualizedTableState.onCellClick(cellData, event);
            } catch (error) {
                console.error('Ошибка в VirtualizedTableState.onCellClick:', error);
            }
        }

        // 2. ОБРАТНАЯ СОВМЕСТИМОСТЬ - пробуем найти обработчик по имени
        if (onCellClickHandler && window[onCellClickHandler]) {
            try {
                window[onCellClickHandler](cellData);
            } catch (error) {
                console.error(`Ошибка в обработчике ${onCellClickHandler}:`, error);
            }
        }

        // 3. УСТАРЕВШИЙ API - window.onTableCellClick (будет удален)
        if (window.onTableCellClick) {
            try {
                const jsonString = JSON.stringify(cellData);
                window.onTableCellClick(jsonString);
                console.warn('[TableWrapper] window.onTableCellClick устарел, используйте VirtualizedTableAPI.setOnCellClick()');
            } catch (error) {
                console.error('Ошибка в window.onTableCellClick:', error);
            }
        }

        // 4. Кастомное событие для дополнительной совместимости
        const customEvent = new CustomEvent('table-cell-click', {
            detail: cellData,
            bubbles: true
        });
        window.dispatchEvent(customEvent);
    }, [onCellClickHandler]);

    // НОВЫЙ обработчик двойного клика - через VirtualizedTableState
    const handleCellDoubleClick = useCallback((cellData, event) => {
        console.log('[TableWrapper] Ячейка ДВАЖДЫ кликнута (двойной клик):', cellData);

        // 1. ОСНОВНОЙ ПУТЬ - через VirtualizedTableState.onCellDoubleClick
        if (typeof window !== 'undefined' && window.VirtualizedTableState?.onCellDoubleClick) {
            try {
                const jsonString = JSON.stringify(cellData);
                console.log('[TableWrapper] cellData как объект:', cellData);
                console.log('[TableWrapper] Преобразованная JSON строка:', jsonString);
                console.log('[TableWrapper] Тип jsonString:', typeof jsonString);
                console.log('[TableWrapper] Вызываем обработчик с:', jsonString);

                window.VirtualizedTableState.onCellDoubleClick(jsonString, event);

                console.log('[TableWrapper] Обработчик вызван успешно');
            } catch (error) {
                console.error('Ошибка в VirtualizedTableState.onCellDoubleClick:', error);
            }
        } else {
            console.warn('[TableWrapper] VirtualizedTableState.onCellDoubleClick не установлен');
        }

        // 2. Кастомное событие
        const customEvent = new CustomEvent('table-cell-double-click', {
            detail: cellData,
            bubbles: true
        });
        window.dispatchEvent(customEvent);
    }, []);

    // НОВЫЙ обработчик перемещения ячейки - через VirtualizedTableState
    const handleCellMove = useCallback((moveData) => {
        console.log('[TableWrapper] Ячейка перемещена:', moveData);

        // 1. ОСНОВНОЙ ПУТЬ - через VirtualizedTableState.onCellMove
        if (typeof window !== 'undefined' && window.VirtualizedTableState?.onCellMove) {
            try {
                window.VirtualizedTableState.onCellMove(moveData);
            } catch (error) {
                console.error('Ошибка в VirtualizedTableState.onCellMove:', error);
            }
        }

        // 2. УСТАРЕВШИЙ API - window.onTableCellMove (будет удален)
        if (window.onTableCellMove) {
            try {
                window.onTableCellMove(moveData);
                console.warn('[TableWrapper] window.onTableCellMove устарел, используйте VirtualizedTableAPI.setOnCellMove()');
            } catch (error) {
                console.error('Ошибка в window.onTableCellMove:', error);
            }
        }

        // 3. Кастомное событие
        const customEvent = new CustomEvent('table-cell-move', {
            detail: moveData,
            bubbles: true
        });
        window.dispatchEvent(customEvent);
    }, []);

    // Функция получения провайдера данных БЕЗ stateVersion в зависимостях
    const getDataProvider = useCallback(() => {
        // Проверяем, нужно ли обновить кэш
        const now = Date.now();
        if (dataProviderRef.current && (now - lastCheckRef.current < 1000)) {
            return dataProviderRef.current;
        }

        let provider = null;

        // Сначала проверяем глобальное состояние
        if (typeof window !== 'undefined' && window.VirtualizedTableState?.dataProvider) {
            console.log('[WebTableWrapper] Используем глобальный провайдер данных');
            provider = window.VirtualizedTableState.dataProvider;
        }
        // Затем проверяем по имени
        else if (dataProviderName && typeof dataProviderName === 'string' && window[dataProviderName]) {
            const namedProvider = window[dataProviderName];
            if (typeof namedProvider === 'function') {
                console.log(`[WebTableWrapper] Используем провайдер данных: window.${dataProviderName}`);
                provider = namedProvider;
            }
        }
        // Проверяем стандартные имена
        else {
            const possibleProviders = ['dp', 'dataProvider', 'DataProvider'];
            for (const providerName of possibleProviders) {
                if (window[providerName] && typeof window[providerName] === 'function') {
                    console.log(`[WebTableWrapper] Используем провайдер данных: window.${providerName}`);
                    provider = window[providerName];
                    break;
                }
            }
        }

        if (!provider) {
            console.warn('[WebTableWrapper] Провайдер данных не найден');
        }

        // Кэшируем результат
        dataProviderRef.current = provider;
        lastCheckRef.current = now;
        return provider;
    }, [dataProviderName]);

    // Функция получения провайдера заголовков БЕЗ stateVersion в зависимостях
    const getHeaderProvider = useCallback(() => {
        // Используем тот же кэш что и для dataProvider
        const now = Date.now();
        if (headerProviderRef.current && (now - lastCheckRef.current < 1000)) {
            return headerProviderRef.current;
        }

        let provider = null;

        // Сначала проверяем глобальное состояние
        if (typeof window !== 'undefined' && window.VirtualizedTableState?.headerProvider) {
            console.log('[WebTableWrapper] Используем глобальный провайдер заголовков');
            provider = window.VirtualizedTableState.headerProvider;
        }
        // Затем проверяем по имени
        else if (headerProviderName && typeof headerProviderName === 'string' && window[headerProviderName]) {
            const namedProvider = window[headerProviderName];
            if (typeof namedProvider === 'function') {
                console.log(`[WebTableWrapper] Используем провайдер заголовков: window.${headerProviderName}`);
                provider = namedProvider;
            }
        }
        // Проверяем стандартные имена
        else {
            const standardProviders = ['hp', 'HeadersProvider'];
            for (const providerName of standardProviders) {
                if (window[providerName] && typeof window[providerName] === 'function') {
                    console.log(`[WebTableWrapper] Используем провайдер заголовков: window.${providerName}`);
                    provider = window[providerName];
                    break;
                }
            }
        }

        if (!provider) {
            console.warn('[WebTableWrapper] Провайдер заголовков не найден');
        }

        // Кэшируем результат
        headerProviderRef.current = provider;
        return provider;
    }, [headerProviderName]);

    // Синхронизация с глобальным состоянием (оптимизированная)
    useEffect(() => {
        const syncStateFromGlobal = () => {
            if (typeof window !== 'undefined' && window.VirtualizedTableState) {
                const state = window.VirtualizedTableState;
                setEditMode(prev => prev !== state.editMode ? state.editMode : prev);
                setShowFilters(prev => prev !== state.showFilters ? state.showFilters : prev);
                setStateVersion(prev => prev + 1);
            }
        };

        // Начальная синхронизация
        syncStateFromGlobal();

        // Слушаем изменения глобального состояния
        const handleGlobalStateChange = (event) => {
            console.log('[TableWrapper] Глобальное состояние изменилось:', event.detail);
            syncStateFromGlobal();
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('virtualized-table-state-change', handleGlobalStateChange);

            // Редкая проверка каждые 5 секунд вместо 100ms
            const syncInterval = setInterval(syncStateFromGlobal, 5000);

            return () => {
                window.removeEventListener('virtualized-table-state-change', handleGlobalStateChange);
                clearInterval(syncInterval);
            };
        }
    }, []);

    // Инициализация компонента с использованием refs
    useEffect(() => {
        const initializeWithRetry = () => {
            const dataProvider = getDataProvider();
            const headerProvider = getHeaderProvider();

            if (dataProvider || headerProvider) {
                console.log('[WebTableWrapper] Провайдеры найдены, инициализируем таблицу');
                setIsReady(true);

                // Обновляем глобальное состояние только если провайдеры изменились
                if (typeof window !== 'undefined' && window.VirtualizedTableState) {
                    if (!window.VirtualizedTableState.dataProvider && dataProvider) {
                        window.VirtualizedTableState.dataProvider = dataProvider;
                    }
                    if (!window.VirtualizedTableState.headerProvider && headerProvider) {
                        window.VirtualizedTableState.headerProvider = headerProvider;
                    }
                }
            } else {
                console.log('[WebTableWrapper] Провайдеры не найдены, повторная проверка через 1000мс');
                setTimeout(initializeWithRetry, 1000);
            }
        };

        // Проверяем только если еще не готов
        if (!isReady) {
            initializeWithRetry();

            const checkInterval = setInterval(() => {
                if (!isReady) {
                    initializeWithRetry();
                }
            }, 2000);

            return () => clearInterval(checkInterval);
        }
    }, [isReady]);

    // Сброс кэша провайдеров при изменении имен
    useEffect(() => {
        dataProviderRef.current = null;
        headerProviderRef.current = null;
        lastCheckRef.current = 0;
    }, [dataProviderName, headerProviderName]);

    if (!isReady) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px',
                fontSize: '14px',
                color: '#666',
                gap: '10px'
            }}>
                <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '2px solid #ddd',
                    borderTop: '2px solid #007bff',
                    animation: 'spin 1s linear infinite'
                }} />
                <div>Инициализация таблицы...</div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                    Ожидание провайдеров данных и заголовков
                </div>
                {typeof window !== 'undefined' && window.VirtualizedTableState && (
                    <div style={{ fontSize: '10px', color: '#999' }}>
                        Режим редактирования: {editMode ? 'включен' : 'выключен'}
                    </div>
                )}
                <style>
                    {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                </style>
            </div>
        );
    }

    return (
        <Table
            maxWidth={maxWidth}
            maxHeight={maxHeight}
            scrollBatchSize={parseInt(scrollBatchSize) ||
                (typeof window !== 'undefined' && window.VirtualizedTableState
                    ? window.VirtualizedTableState.scrollBatchSize
                    : 7)}
            debug={debug === 'true' || debug === true ||
                (typeof window !== 'undefined' && window.VirtualizedTableState?.debug)}
            colorTheme={colorTheme}
            dataProvider={getDataProvider()}
            headerProvider={getHeaderProvider()}
            onCellClick={handleCellClick}
            onCellDoubleClick={handleCellDoubleClick}
            onCellMove={handleCellMove}
            editMode={editMode}
            showFilters={showFilters}
        />
    );
};

// Преобразование в Web Component БЕЗ Shadow DOM
const TableWebComponent = r2wc(TableWrapper, {
    props: {
        maxWidth: 'string',
        maxHeight: 'string',
        scrollBatchSize: 'string',
        debug: 'string',
        dataProviderName: 'string',
        headerProviderName: 'string',
        onCellClickHandler: 'string'
    },
    shadow: false
});

// Регистрация Web Component
customElements.define('virtualized-table', TableWebComponent);

// Проверка регистрации и дополнительная диагностика
if (typeof window !== 'undefined') {
    window.checkTableComponent = function() {
        const isRegistered = customElements.get('virtualized-table');
        const state = window.VirtualizedTableState ? { ...window.VirtualizedTableState } : null;

        console.log('[ComponentCheck] Статус:', {
            registered: !!isRegistered,
            globalState: !!window.VirtualizedTableState,
            API: !!window.VirtualizedTableAPI,
            state: state
        });

        return {
            registered: !!isRegistered,
            globalState: state
        };
    };

    // Автоматическая инициализация глобальных функций если они не существуют
    setTimeout(() => {
        if (!window.VirtualizedTableState) {
            console.warn('[WebTableWrapper] VirtualizedTableState не найден, создаем базовый объект');
            window.VirtualizedTableState = {
                editMode: false,
                showFilters: false,
                debug: false,
                scrollBatchSize: 7,
                bufferSize: 4,
                onCellClick: null,
                onCellDoubleClick: null,
                onCellMove: null,
                onDataLoad: null,
                onError: null,
                dataProvider: null,
                headerProvider: null,
                _initialized: false,
                _loading: false,
                _error: null
            };
        }

        if (!window.VirtualizedTableAPI) {
            console.warn('[WebTableWrapper] VirtualizedTableAPI не найден, создаем базовое API');
            window.VirtualizedTableAPI = {
                setEditMode: (enabled) => {
                    window.VirtualizedTableState.editMode = enabled;
                },
                setShowFilters: (show) => {
                    window.VirtualizedTableState.showFilters = show;
                },
                getState: () => ({ ...window.VirtualizedTableState }),
                setOnCellClick: (handler) => {
                    window.VirtualizedTableState.onCellClick = handler;
                },
                setOnCellDoubleClick: (handler) => {
                    window.VirtualizedTableState.onCellDoubleClick = handler;
                },
                setOnCellMove: (handler) => {
                    window.VirtualizedTableState.onCellMove = handler;
                }
            };
        }
    }, 100);
}

export { TableWrapper };
export default TableWebComponent;
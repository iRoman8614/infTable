// import React, { useCallback, useEffect, useState } from 'react';
// import r2wc from '@r2wc/react-to-web-component';
// import { Table, setDataProvider, setHeaderProvider, defaultHeaders } from './component/Table/index';
//
// /**
//  * Wrapper компонент для преобразования React Table в Web Component
//  */
// const TableWrapper = ({
//                           maxWidth,
//                           maxHeight,
//                           scrollBatchSize,
//                           debug,
//                           colorThemeName,
//                           dataProviderName,
//                           headerProviderName,
//                           onCellClickHandler
//                       }) => {
//     // Состояния
//     const [isProviderReady, setIsProviderReady] = useState(false);
//     const [headerProviderFunction, setHeaderProviderFunction] = useState(null);
//
//     // ОТЛАДОЧНОЕ ЛОГИРОВАНИЕ
//     useEffect(() => {
//         console.log('[TableWrapper DEBUG] Состояние провайдеров:');
//         console.log('- headerProviderName:', headerProviderName);
//         console.log('- headerProviderFunction:', typeof headerProviderFunction);
//         console.log('- defaultHeaders:', defaultHeaders);
//         console.log('- window[headerProviderName]:', window[headerProviderName]);
//
//         if (headerProviderFunction) {
//             try {
//                 const structure = headerProviderFunction();
//                 console.log('[TableWrapper DEBUG] Результат вызова headerProvider:');
//                 console.log('- структура:', structure);
//                 console.log('- headers field:', structure?.headers);
//                 console.log('- is array:', Array.isArray(structure?.headers));
//                 console.log('- length:', structure?.headers?.length);
//             } catch (error) {
//                 console.error('[TableWrapper DEBUG] Ошибка при тестовом вызове headerProvider:', error);
//             }
//         }
//     }, [headerProviderFunction, headerProviderName]);
//
//     // Цветовая тема по умолчанию
//     const colorTheme = useCallback((value, isPast) => {
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
//     }, [colorThemeName]);
//
//     // Обработчик клика по ячейке
//     const handleCellClick = useCallback((cellData) => {
//         console.log('[TableWrapper] Клик по ячейке:', cellData);
//
//         // Приоритет 1: Именованный обработчик из атрибута
//         if (onCellClickHandler && window[onCellClickHandler]) {
//             try {
//                 window[onCellClickHandler](cellData);
//             } catch (error) {
//                 console.error(`[TableWrapper] Ошибка в обработчике ${onCellClickHandler}:`, error);
//             }
//         }
//         // Приоритет 2: Глобальный обработчик
//         else if (window.onTableCellClick && typeof window.onTableCellClick === 'function') {
//             try {
//                 window.onTableCellClick(cellData);
//             } catch (error) {
//                 console.error('[TableWrapper] Ошибка в window.onTableCellClick:', error);
//             }
//         }
//         // Приоритет 3: Стандартный вывод в консоль
//         else {
//             console.log(`[TableWrapper] Клик: ${cellData.date} | ${cellData.nodeId} | ${cellData.value} | ${cellData.node?.name}`);
//         }
//
//         // Всегда отправляем кастомное событие
//         if (typeof window !== 'undefined') {
//             const customEvent = new CustomEvent('table-cell-click', {
//                 detail: cellData,
//                 bubbles: true
//             });
//             window.dispatchEvent(customEvent);
//         }
//     }, [onCellClickHandler]);
//
//     // Эффект для установки провайдеров
//     useEffect(() => {
//         let checkCount = 0;
//         const maxChecks = 50; // 5 секунд максимум
//
//         const setupProviders = () => {
//             checkCount++;
//             let dataProviderFound = false;
//             let headerProviderFound = false;
//
//             console.log(`[TableWrapper] Попытка установки провайдеров #${checkCount}`);
//
//             // === УСТАНОВКА DATA PROVIDER ===
//             if (dataProviderName && window[dataProviderName]) {
//                 console.log(`[TableWrapper] Устанавливаем провайдер данных: ${dataProviderName}`);
//                 setDataProvider(window[dataProviderName]);
//                 dataProviderFound = true;
//             }
//             else if (window.dp && typeof window.dp === 'function') {
//                 console.log('[TableWrapper] Найден глобальный провайдер данных window.dp');
//                 setDataProvider(window.dp);
//                 dataProviderFound = true;
//             }
//             else if (!dataProviderName && !window.dp) {
//                 console.log('[TableWrapper] Используем встроенный провайдер данных');
//                 dataProviderFound = true;
//             }
//
//             // === УСТАНОВКА HEADER PROVIDER (НОВАЯ ЛОГИКА) ===
//             if (headerProviderName && window[headerProviderName]) {
//                 const headerFunc = window[headerProviderName];
//
//                 console.log(`[TableWrapper] Найден провайдер заголовков: ${headerProviderName}`);
//                 console.log('[TableWrapper] Тип провайдера:', typeof headerFunc);
//
//                 if (typeof headerFunc === 'function') {
//                     try {
//                         // Проверяем, что функция возвращает корректную структуру
//                         const testResult = headerFunc();
//                         if (testResult && testResult.headers && Array.isArray(testResult.headers)) {
//                             console.log(`[TableWrapper] ✅ Функция провайдера корректна, заголовков: ${testResult.headers.length}`);
//
//                             // Устанавливаем глобальный провайдер
//                             setHeaderProvider(headerFunc);
//                             // И сохраняем локальную ссылку
//                             setHeaderProviderFunction(() => headerFunc);
//                             headerProviderFound = true;
//                         } else {
//                             console.error('[TableWrapper] ❌ Функция провайдера возвращает некорректную структуру');
//                             console.error('Ожидается: { headers: [...] }');
//                             console.error('Получено:', testResult);
//                         }
//                     } catch (error) {
//                         console.error(`[TableWrapper] ❌ Ошибка при тестировании провайдера ${headerProviderName}:`, error);
//                     }
//                 } else if (typeof headerFunc === 'object' && headerFunc.headers) {
//                     // Поддержка старого формата - объекта (создаем функцию-обертку)
//                     console.log('[TableWrapper] ⚠️ Провайдер заголовков в старом формате (объект), создаем обертку');
//                     const wrapperFunction = () => headerFunc;
//
//                     setHeaderProvider(wrapperFunction);
//                     setHeaderProviderFunction(() => wrapperFunction);
//                     headerProviderFound = true;
//                 } else {
//                     console.error(`[TableWrapper] ❌ Провайдер заголовков должен быть функцией или объектом с полем headers`);
//                 }
//             }
//             else if (window.hp) {
//                 console.log('[TableWrapper] Найден глобальный провайдер заголовков window.hp');
//                 console.log('[TableWrapper] Тип window.hp:', typeof window.hp);
//
//                 if (typeof window.hp === 'function') {
//                     setHeaderProvider(window.hp);
//                     setHeaderProviderFunction(() => window.hp);
//                     headerProviderFound = true;
//                 } else if (typeof window.hp === 'object' && window.hp.headers) {
//                     // Старый формат - создаем обертку
//                     const wrapperFunction = () => window.hp;
//                     setHeaderProvider(wrapperFunction);
//                     setHeaderProviderFunction(() => wrapperFunction);
//                     headerProviderFound = true;
//                 }
//             }
//             else if (!headerProviderName && !window.hp) {
//                 console.log('[TableWrapper] Используем встроенный провайдер заголовков');
//                 // Создаем функцию-обертку для defaultHeaders
//                 const defaultFunction = () => defaultHeaders;
//                 setHeaderProviderFunction(() => defaultFunction);
//                 headerProviderFound = true;
//             }
//
//             // Проверяем готовность
//             const needsDataProvider = dataProviderName || window.dp;
//             const needsHeaderProvider = headerProviderName || window.hp;
//
//             const dataReady = !needsDataProvider || dataProviderFound;
//             const headerReady = !needsHeaderProvider || headerProviderFound;
//
//             console.log(`[TableWrapper] Состояние готовности: data=${dataReady}, header=${headerReady}`);
//
//             if (dataReady && headerReady) {
//                 console.log('[TableWrapper] ✅ Все провайдеры готовы!');
//                 setIsProviderReady(true);
//                 return;
//             }
//
//             // Превышено время ожидания
//             if (checkCount >= maxChecks) {
//                 console.log('[TableWrapper] ⚠️ Превышено время ожидания, используем встроенные провайдеры');
//                 if (!headerProviderFunction) {
//                     console.log('[TableWrapper] Устанавливаем defaultHeaders как fallback');
//                     const defaultFunction = () => defaultHeaders;
//                     setHeaderProviderFunction(() => defaultFunction);
//                 }
//                 setIsProviderReady(true);
//                 return;
//             }
//
//             // Продолжаем ожидание
//             const pendingProviders = [];
//             if (!dataReady) pendingProviders.push('данных');
//             if (!headerReady) pendingProviders.push('заголовков');
//
//             console.log(`[TableWrapper] Ожидание провайдеров ${pendingProviders.join(', ')}, попытка ${checkCount}/${maxChecks}...`);
//             setTimeout(setupProviders, 100);
//         };
//
//         setupProviders();
//     }, [dataProviderName, headerProviderName, headerProviderFunction]);
//
//     // Индикатор загрузки
//     const needsExternalProviders = (dataProviderName || window.dp || headerProviderName || window.hp);
//
//     if (needsExternalProviders && !isProviderReady) {
//         return (
//             <div style={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 height: '200px',
//                 fontSize: '14px',
//                 color: '#666',
//                 gap: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px',
//                 backgroundColor: '#f9f9f9'
//             }}>
//                 <div>⏳ Загрузка провайдеров...</div>
//                 <div style={{ fontSize: '12px', textAlign: 'center' }}>
//                     {dataProviderName && <div>📊 Данные: {dataProviderName}</div>}
//                     {headerProviderName && <div>🏗️ Заголовки: {headerProviderName} (функция)</div>}
//                     {onCellClickHandler && <div>👆 Клики: {onCellClickHandler}</div>}
//                 </div>
//             </div>
//         );
//     }
//
//     // ФИНАЛЬНАЯ ПРОВЕРКА ПЕРЕД РЕНДЕРОМ
//     const finalHeaderProvider = headerProviderFunction || (() => defaultHeaders);
//     console.log('[TableWrapper] 🎯 ФИНАЛЬНЫЙ РЕНДЕР:');
//     console.log('- headerProviderFunction передается в Table:', typeof finalHeaderProvider);
//     console.log('- isProviderReady:', isProviderReady);
//
//     // Рендер основной таблицы
//     return (
//         <Table
//             maxWidth={maxWidth}
//             maxHeight={maxHeight}
//             scrollBatchSize={parseInt(scrollBatchSize) || 7}
//             debug={debug === 'true' || debug === true}
//             colorTheme={colorTheme}
//             headerProvider={finalHeaderProvider}
//             onCellClick={handleCellClick}
//         />
//     );
// };
//
// // Преобразование React компонента в Web Component
// const TableWebComponent = r2wc(TableWrapper, {
//     props: {
//         maxWidth: 'string',                    // Максимальная ширина
//         maxHeight: 'string',                   // Максимальная высота
//         scrollBatchSize: 'string',             // Размер батча загрузки
//         debug: 'string',                       // Режим отладки (true/false)
//         colorThemeName: 'string',              // Имя цветовой темы
//         dataProviderName: 'string',            // Имя провайдера данных в window
//         headerProviderName: 'string',          // Имя провайдера заголовков в window (функция)
//         onCellClickHandler: 'string'           // Имя обработчика кликов в window
//     },
//     shadow: 'open'  // Используем Shadow DOM
// });
//
// // Регистрация Web Component
// customElements.define('virtualized-table', TableWebComponent);
//
// // Дополнительная проверка регистрации
// if (typeof window !== 'undefined') {
//     console.log('[Web Component] virtualized-table зарегистрирован');
//
//     // Добавляем глобальную функцию для проверки
//     window.checkTableComponent = function() {
//         const isRegistered = customElements.get('virtualized-table');
//         console.log('virtualized-table зарегистрирован:', !!isRegistered);
//         return !!isRegistered;
//     };
// }
//
// // Экспорты
// export { TableWrapper };
// export default TableWebComponent;

import React, { useCallback, useEffect, useState } from 'react';
import r2wc from '@r2wc/react-to-web-component';
import { Table } from './component/Table/index';

/**
 * Простой wrapper компонент для Web Component
 */
const TableWrapper = ({
                          maxWidth,
                          maxHeight,
                          scrollBatchSize,
                          debug,
                          colorThemeName,
                          dataProviderName,
                          headerProviderName,
                          onCellClickHandler
                      }) => {
    const [isReady, setIsReady] = useState(false);

    // Цветовая тема
    const colorTheme = useCallback((value, isPast) => {
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
    }, [colorThemeName]);

    // Обработчик клика
    const handleCellClick = useCallback((cellData) => {
        console.log('[TableWrapper] Клик по ячейке:', cellData);

        // Пробуем найти обработчик
        if (onCellClickHandler && window[onCellClickHandler]) {
            try {
                window[onCellClickHandler](cellData);
            } catch (error) {
                console.error(`Ошибка в обработчике ${onCellClickHandler}:`, error);
            }
        } else if (window.onTableCellClick) {
            try {
                window.onTableCellClick(cellData);
            } catch (error) {
                console.error('Ошибка в window.onTableCellClick:', error);
            }
        }

        // Кастомное событие
        const customEvent = new CustomEvent('table-cell-click', {
            detail: cellData,
            bubbles: true
        });
        window.dispatchEvent(customEvent);
    }, [onCellClickHandler]);

    // Получение провайдеров
    const getDataProvider = useCallback(() => {
        if (dataProviderName && window[dataProviderName]) {
            console.log(`[TableWrapper] Используем провайдер данных: ${dataProviderName}`);
            return window[dataProviderName];
        }
        if (window.dp && typeof window.dp === 'function') {
            console.log('[TableWrapper] Используем window.dp');
            return window.dp;
        }
        console.log('[TableWrapper] Провайдер данных не найден, будет использован встроенный');
        return null;
    }, [dataProviderName]);

    const getHeaderProvider = useCallback(() => {
        if (headerProviderName && window[headerProviderName]) {
            console.log(`[TableWrapper] Используем провайдер заголовков: ${headerProviderName}`);
            return window[headerProviderName];
        }
        if (window.hp && typeof window.hp === 'function') {
            console.log('[TableWrapper] Используем window.hp');
            return window.hp;
        }
        if (window.HeadersProvider && typeof window.HeadersProvider === 'function') {
            console.log('[TableWrapper] Используем window.HeadersProvider');
            return window.HeadersProvider;
        }
        console.log('[TableWrapper] Провайдер заголовков не найден, будет использован встроенный');
        return null;
    }, [headerProviderName]);

    // Инициализация
    useEffect(() => {
        console.log('[TableWrapper] Инициализация...');
        console.log('Props:', {
            maxWidth, maxHeight, scrollBatchSize, debug,
            dataProviderName, headerProviderName, onCellClickHandler
        });

        // Проверяем провайдеры
        const dataProvider = getDataProvider();
        const headerProvider = getHeaderProvider();

        console.log('[TableWrapper] Найденные провайдеры:', {
            dataProvider: typeof dataProvider,
            headerProvider: typeof headerProvider
        });

        setIsReady(true);
    }, [getDataProvider, getHeaderProvider]);

    if (!isReady) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px',
                fontSize: '14px',
                color: '#666'
            }}>
                Инициализация таблицы...
            </div>
        );
    }

    return (
        <Table
            maxWidth={maxWidth}
            maxHeight={maxHeight}
            scrollBatchSize={parseInt(scrollBatchSize) || 7}
            debug={debug === 'true' || debug === true}
            colorTheme={colorTheme}
            dataProvider={getDataProvider()}
            headerProvider={getHeaderProvider()}
            onCellClick={handleCellClick}
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
        colorThemeName: 'string',
        dataProviderName: 'string',
        headerProviderName: 'string',
        onCellClickHandler: 'string'
    },
    shadow: false  // ВАЖНО: отключаем Shadow DOM
});

// Регистрация Web Component
customElements.define('virtualized-table', TableWebComponent);

// Проверка регистрации
if (typeof window !== 'undefined') {
    console.log('[WebTableWrapper] virtualized-table зарегистрирован');

    window.checkTableComponent = function() {
        const isRegistered = customElements.get('virtualized-table');
        console.log('virtualized-table зарегистрирован:', !!isRegistered);
        return !!isRegistered;
    };
}

export { TableWrapper };
export default TableWebComponent;
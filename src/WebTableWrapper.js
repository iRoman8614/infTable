// import React, { useCallback, useEffect, useState } from 'react';
// import r2wc from '@r2wc/react-to-web-component';
// import { Table, setDataProvider } from './table';
//
// const TableWrapper = ({ maxWidth, maxHeight, scrollBatchSize, debug, colorThemeName, dataProviderName }) => {
//     const [isProviderReady, setIsProviderReady] = useState(false);
//
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
//     // Эффект для установки провайдера данных
//     useEffect(() => {
//         let checkCount = 0;
//         const maxChecks = 50; // Максимум 5 секунд ожидания
//
//         const setupProvider = () => {
//             checkCount++;
//
//             // Если указано имя провайдера, используем его из window
//             if (dataProviderName && window[dataProviderName]) {
//                 console.log(`[TableWrapper] Устанавливаем провайдер: ${dataProviderName}`);
//                 setDataProvider(window[dataProviderName]);
//                 setIsProviderReady(true);
//                 return;
//             }
//
//             // Проверяем наличие глобального провайдера window.dp
//             if (window.dp && typeof window.dp === 'function') {
//                 console.log('[TableWrapper] Найден глобальный провайдер window.dp');
//                 setDataProvider(window.dp);
//                 setIsProviderReady(true);
//                 return;
//             }
//
//             // Если достигли максимума попыток или нет внешнего провайдера
//             if (checkCount >= maxChecks || (!dataProviderName && !window.dp)) {
//                 console.log('[TableWrapper] Используем встроенный провайдер');
//                 setIsProviderReady(true);
//                 return;
//             }
//
//             // Продолжаем ожидание
//             console.log(`[TableWrapper] Провайдер не найден, попытка ${checkCount}/${maxChecks}...`);
//             setTimeout(setupProvider, 100);
//         };
//
//         setupProvider();
//     }, [dataProviderName]);
//
//     // Показываем индикатор загрузки только если ожидаем внешний провайдер
//     if ((dataProviderName || window.dp) && !isProviderReady) {
//         return (
//             <div style={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 height: '200px',
//                 fontSize: '14px',
//                 color: '#666'
//             }}>
//                 Загрузка провайдера данных...
//             </div>
//         );
//     }
//
//     return (
//         <Table
//             maxWidth={maxWidth}
//             maxHeight={maxHeight}
//             scrollBatchSize={parseInt(scrollBatchSize) || 7}
//             debug={debug === 'true' || debug === true}
//             colorTheme={colorTheme}
//         />
//     );
// };
//
// const TableWebComponent = r2wc(TableWrapper, {
//     props: {
//         maxWidth: 'string',
//         maxHeight: 'string',
//         scrollBatchSize: 'string',
//         debug: 'string',
//         colorThemeName: 'string',
//         dataProviderName: 'string',
//     },
//     shadow: 'open'
// });
//
// customElements.define('virtualized-table', TableWebComponent);
//
// export default TableWebComponent;

import React, { useCallback, useEffect, useState } from 'react';
import r2wc from '@r2wc/react-to-web-component';
import { Table, setDataProvider, defaultHeaders } from './table';

const TableWrapper = ({
                          maxWidth,
                          maxHeight,
                          scrollBatchSize,
                          debug,
                          colorThemeName,
                          dataProviderName,
                          headerProviderName
                      }) => {
    const [isProviderReady, setIsProviderReady] = useState(false);
    const [headerProvider, setHeaderProvider] = useState(null);

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

    // Эффект для установки провайдеров
    useEffect(() => {
        let checkCount = 0;
        const maxChecks = 50; // Максимум 5 секунд ожидания

        const setupProviders = () => {
            checkCount++;
            let dataProviderFound = false;
            let headerProviderFound = false;

            // === УСТАНОВКА DATA PROVIDER ===
            // Если указано имя провайдера данных, используем его из window
            if (dataProviderName && window[dataProviderName]) {
                console.log(`[TableWrapper] Устанавливаем провайдер данных: ${dataProviderName}`);
                setDataProvider(window[dataProviderName]);
                dataProviderFound = true;
            }
            // Проверяем наличие глобального провайдера window.dp
            else if (window.dp && typeof window.dp === 'function') {
                console.log('[TableWrapper] Найден глобальный провайдер данных window.dp');
                setDataProvider(window.dp);
                dataProviderFound = true;
            }
            // Если нет внешнего провайдера, используем встроенный
            else if (!dataProviderName && !window.dp) {
                console.log('[TableWrapper] Используем встроенный провайдер данных');
                dataProviderFound = true;
            }

            // === УСТАНОВКА HEADER PROVIDER ===
            // Если указано имя провайдера заголовков, используем его из window
            if (headerProviderName && window[headerProviderName]) {
                console.log(`[TableWrapper] Устанавливаем провайдер заголовков: ${headerProviderName}`);
                setHeaderProvider(window[headerProviderName]);
                headerProviderFound = true;
            }
            // Проверяем наличие глобального провайдера window.hp
            else if (window.hp && typeof window.hp === 'object') {
                console.log('[TableWrapper] Найден глобальный провайдер заголовков window.hp');
                setHeaderProvider(window.hp);
                headerProviderFound = true;
            }
            // Если нет внешнего провайдера заголовков, используем дефолтный
            else if (!headerProviderName && !window.hp) {
                console.log('[TableWrapper] Используем встроенный провайдер заголовков');
                setHeaderProvider(defaultHeaders);
                headerProviderFound = true;
            }

            // Проверяем готовность
            const needsDataProvider = dataProviderName || window.dp;
            const needsHeaderProvider = headerProviderName || window.hp;

            const dataReady = !needsDataProvider || dataProviderFound;
            const headerReady = !needsHeaderProvider || headerProviderFound;

            if (dataReady && headerReady) {
                console.log('[TableWrapper] Все провайдеры готовы');
                setIsProviderReady(true);
                return;
            }

            // Если достигли максимума попыток
            if (checkCount >= maxChecks) {
                console.log('[TableWrapper] Превышено время ожидания, используем встроенные провайдеры');
                if (!headerProvider) {
                    setHeaderProvider(defaultHeaders);
                }
                setIsProviderReady(true);
                return;
            }

            // Продолжаем ожидание
            const pendingProviders = [];
            if (!dataReady) pendingProviders.push('данных');
            if (!headerReady) pendingProviders.push('заголовков');

            console.log(`[TableWrapper] Ожидание провайдеров ${pendingProviders.join(', ')}, попытка ${checkCount}/${maxChecks}...`);
            setTimeout(setupProviders, 100);
        };

        setupProviders();
    }, [dataProviderName, headerProviderName]);

    // Показываем индикатор загрузки только если ожидаем внешние провайдеры
    const needsExternalProviders = (dataProviderName || window.dp || headerProviderName || window.hp);

    if (needsExternalProviders && !isProviderReady) {
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
                <div>Загрузка провайдеров...</div>
                <div style={{ fontSize: '12px' }}>
                    {dataProviderName && `Данные: ${dataProviderName}`}
                    {dataProviderName && headerProviderName && ' | '}
                    {headerProviderName && `Заголовки: ${headerProviderName}`}
                </div>
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
            headerProvider={headerProvider}
        />
    );
};

const TableWebComponent = r2wc(TableWrapper, {
    props: {
        maxWidth: 'string',
        maxHeight: 'string',
        scrollBatchSize: 'string',
        debug: 'string',
        colorThemeName: 'string',
        dataProviderName: 'string',
        headerProviderName: 'string',
    },
    shadow: 'open'
});

customElements.define('virtualized-table', TableWebComponent);

// Экспортируем для удобства использования
export { TableWrapper };
export default TableWebComponent;
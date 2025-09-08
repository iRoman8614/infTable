// import React, { useCallback } from 'react';
// import r2wc from '@r2wc/react-to-web-component';
// import { Table } from './table';
//
// const TableWrapper = ({ maxWidth, maxHeight, scrollBatchSize, debug, colorThemeName }) => {
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
//     },
//     shadow: 'open'
// });
//
// customElements.define('virtualized-table', TableWebComponent);
//
// export default TableWebComponent;

import React, { useCallback, useEffect, useState } from 'react';
import r2wc from '@r2wc/react-to-web-component';
import { Table, setDataProvider } from './table';

const TableWrapper = ({ maxWidth, maxHeight, scrollBatchSize, debug, colorThemeName, dataProviderName }) => {
    const [isProviderReady, setIsProviderReady] = useState(false);

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

    // Эффект для установки провайдера данных
    useEffect(() => {
        let checkCount = 0;
        const maxChecks = 50; // Максимум 5 секунд ожидания

        const setupProvider = () => {
            checkCount++;

            // Если указано имя провайдера, используем его из window
            if (dataProviderName && window[dataProviderName]) {
                console.log(`[TableWrapper] Устанавливаем провайдер: ${dataProviderName}`);
                setDataProvider(window[dataProviderName]);
                setIsProviderReady(true);
                return;
            }

            // Проверяем наличие глобального провайдера window.dp
            if (window.dp && typeof window.dp === 'function') {
                console.log('[TableWrapper] Найден глобальный провайдер window.dp');
                setDataProvider(window.dp);
                setIsProviderReady(true);
                return;
            }

            // Если достигли максимума попыток или нет внешнего провайдера
            if (checkCount >= maxChecks || (!dataProviderName && !window.dp)) {
                console.log('[TableWrapper] Используем встроенный провайдер');
                setIsProviderReady(true);
                return;
            }

            // Продолжаем ожидание
            console.log(`[TableWrapper] Провайдер не найден, попытка ${checkCount}/${maxChecks}...`);
            setTimeout(setupProvider, 100);
        };

        setupProvider();
    }, [dataProviderName]);

    // Показываем индикатор загрузки только если ожидаем внешний провайдер
    if ((dataProviderName || window.dp) && !isProviderReady) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px',
                fontSize: '14px',
                color: '#666'
            }}>
                Загрузка провайдера данных...
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
    },
    shadow: 'open'
});

customElements.define('virtualized-table', TableWebComponent);

export default TableWebComponent;
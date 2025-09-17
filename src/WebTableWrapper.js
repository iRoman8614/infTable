import React, { useCallback, useEffect, useState } from 'react';
import r2wc from '@r2wc/react-to-web-component';
import { Table } from './component/Table/index';

/**
 * Wrapper компонент для Web Component
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

    // Цветовая тема
    const colorTheme = useCallback((value, isPast) => {
        if (value === "BGHeader") return '#dee3f5';
        if (value === "DATE") return isPast ? '#acb5e3' : 'white';
        return isPast ? '#acb5e3' : 'white';
    }, []);

    // Обработчик клика
    const handleCellClick = useCallback((cellData) => {
        console.log('[TableWrapper] Двойной клик по ячейке:', cellData);

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
        const customEvent = new CustomEvent('table-cell-double-click', {
            detail: cellData,
            bubbles: true
        });
        window.dispatchEvent(customEvent);
    }, [onCellClickHandler]);

    const getDataProvider = useCallback(() => {
        if (dataProviderName && typeof dataProviderName === 'string' && window[dataProviderName]) {
            const provider = window[dataProviderName];
            if (typeof provider === 'function') {
                console.log(`[WebTableWrapper] Используем провайдер данных: window.${dataProviderName}`);
                return provider;
            }
        }

        if (window.dp && typeof window.dp === 'function') {
            console.log('[WebTableWrapper] Используем провайдер данных: window.dp');
            return window.dp;
        }

        const possibleProviders = ['dataProvider', 'DataProvider'];
        for (const providerName of possibleProviders) {
            if (window[providerName] && typeof window[providerName] === 'function') {
                console.log(`[WebTableWrapper] Используем провайдер данных: window.${providerName}`);
                return window[providerName];
            }
        }
        console.warn('[WebTableWrapper] Провайдер данных не найден');
        return null;
    }, [dataProviderName]);

    const getHeaderProvider = useCallback(() => {
        if (headerProviderName && typeof headerProviderName === 'string' && window[headerProviderName]) {
            const provider = window[headerProviderName];
            if (typeof provider === 'function') {
                console.log(`[WebTableWrapper] Используем провайдер заголовков: window.${headerProviderName}`);
                return provider;
            }
        }

        const standardProviders = ['hp', 'HeadersProvider'];
        for (const providerName of standardProviders) {
            if (window[providerName] && typeof window[providerName] === 'function') {
                console.log(`[WebTableWrapper] Используем провайдер заголовков: window.${providerName}`);
                return window[providerName];
            }
        }

        console.warn('[WebTableWrapper] Провайдер заголовков не найден');
        return null;
    }, [headerProviderName]);

    useEffect(() => {
        const initializeWithRetry = () => {
            const dataProvider = getDataProvider();
            const headerProvider = getHeaderProvider();

            if (dataProvider || headerProvider) {
                console.log('[WebTableWrapper] Провайдеры найдены, инициализируем таблицу');
                setIsReady(true);
            } else {
                console.log('[WebTableWrapper] Провайдеры не найдены, повторная проверка через 500мс');
                setTimeout(initializeWithRetry, 500);
            }
        };

        initializeWithRetry();

        const checkInterval = setInterval(() => {
            if (!isReady) {
                initializeWithRetry();
            }
        }, 1000);

        return () => clearInterval(checkInterval);
    }, [isReady, getDataProvider, getHeaderProvider]);

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
        dataProviderName: 'string',
        headerProviderName: 'string',
        onCellClickHandler: 'string'
    },
    shadow: false
});

// Регистрация Web Component
customElements.define('virtualized-table', TableWebComponent);

// Проверка регистрации
if (typeof window !== 'undefined') {
    window.checkTableComponent = function() {
        const isRegistered = customElements.get('virtualized-table');
        return !!isRegistered;
    };
}

export { TableWrapper };
export default TableWebComponent;
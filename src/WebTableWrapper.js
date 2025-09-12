import React, { useCallback, useEffect, useState } from 'react';
import r2wc from '@r2wc/react-to-web-component';
import { Table } from './component/Table/index';
import App from "./App";

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
            console.log(`[TestTest]  Используем провайдер данных: ${dataProviderName}`);
            return window[dataProviderName];
        }
        if (window.dp && typeof window.dp === 'function') {
            console.log('[TestTest] Используем window.dp');
            return window.dp;
        }
        console.log('[TestTest] Провайдер данных не найден, будет использован встроенный');
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
        <React.StrictMode>
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
        </React.StrictMode>
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
    shadow: false
});

// Регистрация Web Component
customElements.define('virtualized-table', TableWebComponent);

// Проверка регистрации
if (typeof window !== 'undefined') {
    window.checkTableComponent = function() {
        const isRegistered = customElements.get('virtualized-table');
        console.log('virtualized-table зарегистрирован:', !!isRegistered);
        return !!isRegistered;
    };
}

export { TableWrapper };
export default TableWebComponent;
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
        if (value === "DATE") return isPast ? '#acb5e3' : '#white';
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

    // Получение провайдеров
    const getDataProvider = useCallback(() => {
        if (dataProviderName && window[dataProviderName]) {
            return window[dataProviderName];
        }
        if (window.dp && typeof window.dp === 'function') {
            return window.dp;
        }
        return null;
    }, [dataProviderName]);

    const getHeaderProvider = useCallback(() => {
        const provider = (headerProviderName && window[headerProviderName]) ||
            window.hp ||
            window.HeadersProvider;

        return typeof provider === 'function' ? provider : null;
    }, [headerProviderName]);

    // Инициализация
    useEffect(() => {
        setIsReady(true);
    }, []);

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
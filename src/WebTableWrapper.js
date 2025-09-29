import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
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
                          dataProviderName,
                          headerProviderName
                      }) => {
    const [isReady, setIsReady] = useState(false);

    // Состояния синхронизированные с глобальным объектом
    const [editMode, setEditMode] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Refs для кэширования провайдеров
    const dataProviderRef = useRef(null);
    const headerProviderRef = useRef(null);

    // Цветовая тема
    const colorTheme = useCallback((value, isPast) => {
        if (value === "BGHeader") return '#dee3f5';
        if (value === "DATE") return isPast ? '#acb5e3' : 'white';
        return isPast ? '#acb5e3' : 'white';
    }, []);

    const handleCellDoubleClick = useCallback((cellData, event) => {
        console.log('[TableWrapper] Ячейка ДВАЖДЫ кликнута (двойной клик):', cellData);

        if (typeof window !== 'undefined' && window.VirtualizedTableState?.onCellDoubleClick) {
            try {
                const jsonString = JSON.stringify(cellData);
                console.log('[TableWrapper] DoubleClick - возвращаем JSON string:', jsonString);
                window.VirtualizedTableState.onCellDoubleClick(jsonString, event);
            } catch (error) {
                console.error('Ошибка в VirtualizedTableState.onCellDoubleClick:', error);
            }
        } else {
            console.warn('[TableWrapper] VirtualizedTableState.onCellDoubleClick не установлен');
        }

        const customEvent = new CustomEvent('table-cell-double-click', {
            detail: cellData,
            bubbles: true
        });
        window.dispatchEvent(customEvent);
    }, []);

    // Обработчик перемещения ячейки - только через VirtualizedTableState
    const handleCellMove = useCallback((moveData) => {
        console.log('[TableWrapper] Ячейка перемещена:', moveData);

        if (typeof window !== 'undefined' && window.VirtualizedTableState?.onCellMove) {
            try {
                const jsonString = JSON.stringify(moveData);
                console.log('[TableWrapper] CellMove - возвращаем JSON string:', jsonString);
                window.VirtualizedTableState.onCellMove(jsonString);
            } catch (error) {
                console.error('Ошибка в VirtualizedTableState.onCellMove:', error);
            }
        } else {
            console.warn('[TableWrapper] VirtualizedTableState.onCellMove не установлен');
        }

        // Кастомное событие
        const customEvent = new CustomEvent('table-cell-move', {
            detail: moveData,
            bubbles: true
        });
        window.dispatchEvent(customEvent);
    }, []);

    // Функция получения провайдера данных - возвращает стабильную ссылку
    const getDataProvider = useCallback(() => {
        // Если провайдер уже найден, всегда возвращаем его
        if (dataProviderRef.current) {
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

        // Кэшируем результат навсегда (до сброса)
        dataProviderRef.current = provider;
        return provider;
    }, [dataProviderName]);

    // Функция получения провайдера заголовков - возвращает стабильную ссылку
    const getHeaderProvider = useCallback(() => {
        // Если провайдер уже найден, всегда возвращаем его
        if (headerProviderRef.current) {
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

        // Кэшируем результат навсегда (до сброса)
        headerProviderRef.current = provider;
        return provider;
    }, [headerProviderName]);

    // Мемоизированные провайдеры для передачи в Table
    const memoizedDataProvider = useMemo(() => getDataProvider(), [getDataProvider]);
    const memoizedHeaderProvider = useMemo(() => getHeaderProvider(), [getHeaderProvider]);

    // Синхронизация с глобальным состоянием (без интервала)
    useEffect(() => {
        const syncStateFromGlobal = () => {
            if (typeof window !== 'undefined' && window.VirtualizedTableState) {
                const state = window.VirtualizedTableState;
                setEditMode(prev => prev !== state.editMode ? state.editMode : prev);
                setShowFilters(prev => prev !== state.showFilters ? state.showFilters : prev);
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

            return () => {
                window.removeEventListener('virtualized-table-state-change', handleGlobalStateChange);
            };
        }
    }, []);

    // Инициализация компонента с использованием refs
    useEffect(() => {
        const initializeWithRetry = () => {
            const dataProvider = getDataProvider();
            const headerProvider = getHeaderProvider();

            if (dataProvider && headerProvider) {
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
    }, [isReady, getDataProvider, getHeaderProvider]);

    // Сброс кэша провайдеров при изменении имен
    useEffect(() => {
        dataProviderRef.current = null;
        headerProviderRef.current = null;
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
            scrollBatchSize={parseInt(scrollBatchSize) || 7}
            colorTheme={colorTheme}
            dataProvider={memoizedDataProvider}
            headerProvider={memoizedHeaderProvider}
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
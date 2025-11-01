/**
 * Глобальное состояние виртуализированной таблицы
 * Для использования в Java Vaadin и других интеграциях
 */

window.VirtualizedTableState = {
    // Провайдеры данных
    dataProvider: null,
    headerProvider: null,
    lockProvider: null,
    // Режимы отображения
    editMode: false,
    lockMode: false,
    // showFilters: false,
    showDeviations: false,
    visibleColumns: [],
    childrenData: [],
    // Ограничение диапазона дат [startDate, endDate] или null для бесконечной таблицы
    dateRange: null,
    // Обработчики событий
    onCellDoubleClick: null,
    onDatePickerClick: null,
    onCellMove: null,
    // Внутренние состояния (только для чтения)
    _initialized: false,
    _loading: false,
    _error: null
};

/**
 * API для управления состоянием таблицы
 */
window.VirtualizedTableAPI = {
    /**
     * Установить провайдер данных
     * @param {function} provider - функция провайдера данных
     */
    setDataProvider(provider) {
        if (typeof provider !== 'function') {
            console.warn('[VirtualizedTableAPI] setDataProvider expects function');
            return;
        }

        if (window.VirtualizedTableState.dataProvider === provider) {
            console.log('[VirtualizedTableAPI] Data provider уже установлен, пропускаем');
            return;
        }

        window.VirtualizedTableState.dataProvider = provider;
        console.log('[VirtualizedTableAPI] ✅ Data provider установлен');

        this._dispatchStateEvent('dataProvider', provider);
    },

    /**
     * Установить провайдер заголовков
     * @param {function|object} provider - функция или объект провайдера заголовков
     */
    setHeaderProvider(provider) {
        if (typeof provider !== 'function' && typeof provider !== 'object') {
            console.warn('[VirtualizedTableAPI] setHeaderProvider expects function or object');
            return;
        }

        if (window.VirtualizedTableState.headerProvider === provider) {
            console.log('[VirtualizedTableAPI] Header provider уже установлен, пропускаем');
            return;
        }

        window.VirtualizedTableState.headerProvider = provider;
        console.log('[VirtualizedTableAPI] ✅ Header provider установлен');

        this._dispatchStateEvent('headerProvider', provider);
    },

    /**
     * Установить обработчик двойного клика по ячейке
     * @param {function} handler - функция обработчик (cellData, event) => void
     */
    setOnCellDoubleClick(handler) {
        if (typeof handler !== 'function') {
            console.warn('[VirtualizedTableAPI] setOnCellDoubleClick expects function');
            return;
        }

        window.VirtualizedTableState.onCellDoubleClick = handler;
        console.log('[VirtualizedTableAPI] Cell double click handler set');
    },

    /**
     * Установить обработчик перемещения ячейки (drag & drop)
     * @param {function} handler - функция обработчик (moveData) => void
     */
    setOnCellMove(handler) {
        if (typeof handler !== 'function') {
            console.warn('[VirtualizedTableAPI] setOnCellMove expects function');
            return;
        }

        window.VirtualizedTableState.onCellMove = handler;
        console.log('[VirtualizedTableAPI] Cell move handler set');
    },

    /**
     * Установить режим редактирования
     * @param {boolean} enabled - включить/выключить режим редактирования
     */
    // setEditMode(enabled) {
    //     if (typeof enabled !== 'boolean') {
    //         console.warn('[VirtualizedTableAPI] setEditMode expects boolean');
    //         return;
    //     }
    //
    //     window.VirtualizedTableState.editMode = enabled;
    //     console.log('[VirtualizedTableAPI] Edit mode set to:', enabled);
    //
    //     this._dispatchStateEvent('editMode', enabled);
    // },
    setEditMode(enabled) {
        if (typeof enabled !== 'boolean') {
            console.warn('[VirtualizedTableAPI] setEditMode expects boolean');
            return;
        }

        if (enabled && window.VirtualizedTableState.lockMode) {
            console.log('[VirtualizedTableAPI] Отключаем lockMode при включении editMode');
            window.VirtualizedTableState.lockMode = false;
            this._dispatchStateEvent('lockMode', false);
        }

        window.VirtualizedTableState.editMode = enabled;
        console.log('[VirtualizedTableAPI] Edit mode set to:', enabled);

        this._dispatchStateEvent('editMode', enabled);
    },

    /**
     * Установить режим блокировки ячеек
     * @param {boolean} enabled - включить/выключить режим блокировки
     */
    setLockMode(enabled) {
        if (typeof enabled !== 'boolean') {
            console.warn('[VirtualizedTableAPI] setLockMode expects boolean');
            return;
        }

        if (enabled && window.VirtualizedTableState.editMode) {
            console.log('[VirtualizedTableAPI] Отключаем editMode при включении lockMode');
            window.VirtualizedTableState.editMode = false;
            this._dispatchStateEvent('editMode', false);
        }

        window.VirtualizedTableState.lockMode = enabled;
        console.log('[VirtualizedTableAPI] Lock mode set to:', enabled);

        this._dispatchStateEvent('lockMode', enabled);
    },

    /**
     * Установить провайдер блокировки
     * @param {function} provider - функция провайдера блокировки
     * provider(lockDataJson: string) => Promise<void> | void
     *
     * lockDataJson = JSON string с форматом:
     * {
     *   "cells": [{"date": "2025-01-15", "nodeId": "node1", state}],
     *   "button": 0,
     *   "state": "true"
     * }
     */
    setLockProvider(provider) {
        if (typeof provider !== 'function') {
            console.warn('[VirtualizedTableAPI] setLockProvider expects function');
            return;
        }

        if (window.VirtualizedTableState.lockProvider === provider) {
            console.log('[VirtualizedTableAPI] Lock provider уже установлен, пропускаем');
            return;
        }

        window.VirtualizedTableState.lockProvider = provider;
        console.log('[VirtualizedTableAPI] ✅ Lock provider установлен');

        this._dispatchStateEvent('lockProvider', provider);
    },

    // /**
    //  * Установить обработчик блокировки ячеек
    //  * @param {function} handler - функция обработчик (lockDataJson: string) => void
    //  *
    //  * DEPRECATED: Используйте setLockProvider для автоматической обработки и обновления данных
    //  */
    // setOnCellLock(handler) {
    //     if (typeof handler !== 'function') {
    //         console.warn('[VirtualizedTableAPI] setOnCellLock expects function');
    //         return;
    //     }
    //
    //     window.VirtualizedTableState.onCellLock = handler;
    //     console.log('[VirtualizedTableAPI] Cell lock handler set');
    // },


    // /**
    //  * Установить видимость панели фильтров
    //  * @param {boolean} show - показать/скрыть панель фильтров
    //  */
    // setShowFilters(show) {
    //     if (typeof show !== 'boolean') {
    //         console.warn('[VirtualizedTableAPI] setShowFilters expects boolean');
    //         return;
    //     }
    //
    //     window.VirtualizedTableState.showFilters = show;
    //     console.log('[VirtualizedTableAPI] Show filters set to:', show);
    //
    //     this._dispatchStateEvent('showFilters', show);
    // },

    /**
     * Установить видимость отклонений (operating и shift)
     * @param {boolean} show - показать/скрыть отклонения
     */
    setShowDeviations(show) {
        if (typeof show !== 'boolean') {
            console.warn('[VirtualizedTableAPI] setShowDeviations expects boolean');
            return;
        }

        window.VirtualizedTableState.showDeviations = show;
        console.log('[VirtualizedTableAPI] Show deviations set to:', show);

        this._dispatchStateEvent('showDeviations', show);
    },

    /**
     * Установить ограничение диапазона дат
     * @param {Array<string>|null} range - массив из 2 дат [startDate, endDate] в формате DD.MM.YYYY или YYYY-MM-DD
     *   null или [] = бесконечная таблица
     *   ['01.01.2025', '31.12.2025'] или ['2025-01-01', '2025-12-31'] = ограниченная таблица с буфером ±10 дней
     */
    setDateRange(range) {
        if (range !== null && (!Array.isArray(range) || (range.length !== 0 && range.length !== 2))) {
            console.warn('[VirtualizedTableAPI] setDateRange expects null, [], or array of 2 dates');
            return;
        }

        // Если пустой массив, преобразуем в null
        if (Array.isArray(range) && range.length === 0) {
            range = null;
        }

        // Валидация формата дат (поддерживаем DD.MM.YYYY как в parseDateString)
        if (range !== null && range.length === 2) {
            const dateRegexDDMMYYYY = /^\d{2}\.\d{2}\.\d{4}$/;
            const dateRegexYYYYMMDD = /^\d{4}-\d{2}-\d{2}$/;

            const isValidStart = dateRegexDDMMYYYY.test(range[0]) || dateRegexYYYYMMDD.test(range[0]);
            const isValidEnd = dateRegexDDMMYYYY.test(range[1]) || dateRegexYYYYMMDD.test(range[1]);

            if (!isValidStart || !isValidEnd) {
                console.warn('[VirtualizedTableAPI] setDateRange expects dates in DD.MM.YYYY or YYYY-MM-DD format');
                return;
            }

            // Проверка что startDate <= endDate
            // Парсим даты с учетом поддерживаемых форматов
            let startDate, endDate;
            try {
                // Локальный парсер на случай если TableUtils еще не доступен
                const parseDDMMYYYY = (dateStr) => {
                    if (window.TableUtils?.parseDateString) {
                        return window.TableUtils.parseDateString(dateStr);
                    }
                    const [day, month, year] = dateStr.split('.').map(Number);
                    return new Date(Date.UTC(year, month - 1, day));
                };

                if (dateRegexDDMMYYYY.test(range[0])) {
                    startDate = parseDDMMYYYY(range[0]);
                } else {
                    startDate = new Date(range[0] + 'T00:00:00Z');
                }

                if (dateRegexDDMMYYYY.test(range[1])) {
                    endDate = parseDDMMYYYY(range[1]);
                } else {
                    endDate = new Date(range[1] + 'T00:00:00Z');
                }
            } catch (error) {
                console.warn('[VirtualizedTableAPI] Error parsing dates:', error);
                return;
            }

            if (startDate > endDate) {
                console.warn('[VirtualizedTableAPI] setDateRange: startDate must be <= endDate');
                return;
            }
        }

        window.VirtualizedTableState.dateRange = range;
        const mode = range ? 'LIMITED' : 'INFINITE';
        console.log(`[VirtualizedTableAPI] ✅ Date range set to ${mode}:`, range);

        // Диспатчим событие ПЕРЕД resetTable, чтобы компоненты успели обработать изменения
        this._dispatchStateEvent('dateRange', range);

        // Сброс таблицы для применения новых ограничений
        this.resetTable();
    },

    /**
     * Получить текущий диапазон дат
     * @returns {Array<string>|null} текущий диапазон или null
     */
    getDateRange() {
        return window.VirtualizedTableState.dateRange;
    },

    /**
     * Обновить viewport таблицы принудительно
     */
    refreshViewport() {
        if (typeof window.VirtualizedTableState.refreshViewport === 'function') {
            console.log('[VirtualizedTableAPI] Refreshing viewport...');
            window.VirtualizedTableState.refreshViewport();
        } else {
            console.warn('[VirtualizedTableAPI] Table not initialized or refresh function not available');
        }
    },

    /**
     * Перейти к указанной дате
     * @param {string} dateString - дата в формате DD.MM.YYYY или YYYY-MM-DD
     */
    jumpToDate(dateString) {
        if (typeof window.VirtualizedTableState.jumpToDate === 'function') {
            console.log(`[VirtualizedTableAPI] Jumping to date: ${dateString}`);
            window.VirtualizedTableState.jumpToDate(dateString);
        } else {
            console.warn('[VirtualizedTableAPI] Table not initialized or jumpToDate function not available');
        }
    },

    /**
     * Установить обработчик клика по кнопке выбора даты
     * @param {function} handler - функция обработчик () => void
     */
    setOnDatePickerClick(handler) {
        if (typeof handler !== 'function') {
            console.warn('[VirtualizedTableAPI] setOnDatePickerClick expects function');
            return;
        }

        window.VirtualizedTableState.onDatePickerClick = handler;
        console.log('[VirtualizedTableAPI] Date picker click handler set');
    },

    /**
     * Сбросить состояние таблицы для повторной инициализации
     */
    resetTable() {
        console.log('[VirtualizedTableAPI] Resetting table state...');

        if (typeof window.resetTableInitialization === 'function') {
            window.resetTableInitialization();
        }

        window.VirtualizedTableState._initialized = false;
        window.VirtualizedTableState._loading = false;
        window.VirtualizedTableState._error = null;

        delete window.VirtualizedTableState.refreshTableViewport;

        console.log('[VirtualizedTableAPI] Table state reset complete');

        this._dispatchStateEvent('reset', true);
    },

    /**
     * Установить видимые столбцы по ID
     * @param {Array<string>} columnIds - массив ID столбцов для отображения
     *   Пустой массив [] = показать все столбцы
     *   Непустой массив ['id1', 'id2'] = показать только указанные
     */
    setVisibleColumns(columnIds) {
        if (!Array.isArray(columnIds)) {
            console.warn('[VirtualizedTableAPI] setVisibleColumns expects array');
            return;
        }

        window.VirtualizedTableState.visibleColumns = columnIds;
        console.log('[VirtualizedTableAPI] Visible columns set to:', columnIds.length === 0 ? 'ALL' : columnIds);

        this._dispatchStateEvent('visibleColumns', columnIds);
    },

    /**
     * Установить видимые children по ID
     * @param {Array<string>} childrenIds - массив ID children для отображения
     *   Пустой массив [] = не показывать children (кроме shift если showDeviations=true)
     *   Непустой массив ['id1', 'id2'] = показать только указанные
     */
    setChildrenData(childrenIds) {
        if (!Array.isArray(childrenIds)) {
            console.warn('[VirtualizedTableAPI] setChildrenData expects array');
            return;
        }

        window.VirtualizedTableState.childrenData = childrenIds;
        console.log('[VirtualizedTableAPI] Children data set to:', childrenIds.length === 0 ? 'NONE' : childrenIds);

        this._dispatchStateEvent('childrenData', childrenIds);
    },

    /**
     * Получить текущие видимые children
     * @returns {Array<string>} массив ID видимых children
     */
    getChildrenData() {
        return window.VirtualizedTableState.childrenData || [];
    },

    /**
     * Получить текущие видимые столбцы
     * @returns {Array<string>} массив ID видимых столбцов
     */
    getVisibleColumns() {
        return window.VirtualizedTableState.visibleColumns || [];
    },

    /**
     * Получить текущее состояние таблицы
     * @returns {object} копия текущего состояния
     */
    getState() {
        return {
            initialized: window.VirtualizedTableState._initialized,
            loading: window.VirtualizedTableState._loading,
            error: window.VirtualizedTableState._error,
            hasDataProvider: !!window.VirtualizedTableState.dataProvider,
            hasHeaderProvider: !!window.VirtualizedTableState.headerProvider,
            hasLockProvider: !!window.VirtualizedTableState.lockProvider,
            hasOnCellDoubleClick: !!window.VirtualizedTableState.onCellDoubleClick,
            hasOnCellMove: !!window.VirtualizedTableState.onCellMove,
            hasOnCellLock: !!window.VirtualizedTableState.onCellLock,
            editMode: window.VirtualizedTableState.editMode,
            lockMode: window.VirtualizedTableState.lockMode,
            dateRange: window.VirtualizedTableState.dateRange,
            dateRangeMode: window.VirtualizedTableState.dateRange ? 'LIMITED' : 'INFINITE'
        };
    },

    /**
     * Внутренняя функция для диспатча событий
     */
    _dispatchStateEvent(property, value) {
        const event = new CustomEvent('virtualized-table-state-change', {
            detail: {
                property,
                value,
                state: this.getState()
            },
            bubbles: true
        });
        window.dispatchEvent(event);
    }
};

console.log('[VirtualizedTableState] Global state and API initialized');
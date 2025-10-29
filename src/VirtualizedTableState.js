/**
 * Глобальное состояние виртуализированной таблицы
 * Для использования в Java Vaadin и других интеграциях
 */

window.VirtualizedTableState = {
    // Провайдеры данных
    dataProvider: null,
    headerProvider: null,
    // Режимы отображения
    editMode: false,
    // showFilters: false,
    showDeviations: false,
    visibleColumns: [],
    childrenData: [],
    // Обработчики событий
    onCellDoubleClick: null,
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
    setEditMode(enabled) {
        if (typeof enabled !== 'boolean') {
            console.warn('[VirtualizedTableAPI] setEditMode expects boolean');
            return;
        }

        window.VirtualizedTableState.editMode = enabled;
        console.log('[VirtualizedTableAPI] Edit mode set to:', enabled);

        this._dispatchStateEvent('editMode', enabled);
    },

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
     * Обновить viewport таблицы принудительно
     */
    refreshViewport() {
        if (typeof window.VirtualizedTableState.refreshTableViewport === 'function') {
            console.log('[VirtualizedTableAPI] Refreshing viewport...');
            window.VirtualizedTableState.refreshTableViewport();
        } else {
            console.warn('[VirtualizedTableAPI] Table not initialized or refresh function not available');
        }
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
            hasOnCellDoubleClick: !!window.VirtualizedTableState.onCellDoubleClick,
            hasOnCellMove: !!window.VirtualizedTableState.onCellMove
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
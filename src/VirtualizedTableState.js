/**
 * Глобальное состояние виртуализированной таблицы
 * Для использования в Java Vaadin и других интеграциях
 */

// Создаем глобальный объект состояния
window.VirtualizedTableState = {
    // Провайдеры данных
    dataProvider: null,
    headerProvider: null,
    // Режимы отображения
    editMode: false,
    showFilters: false,
    showDeviations: false,
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

    // /**
    //  * Установить провайдер данных
    //  * @param {function} provider - функция провайдера данных
    //  */
    // setDataProvider(provider) {
    //     if (typeof provider !== 'function') {
    //         console.warn('[VirtualizedTableAPI] setDataProvider expects function');
    //         return;
    //     }
    //
    //     window.VirtualizedTableState.dataProvider = provider;
    //     console.log('[VirtualizedTableAPI] Data provider set');
    //
    //     this._dispatchStateEvent('dataProvider', provider);
    // },
    //
    // /**
    //  * Установить провайдер заголовков
    //  * @param {function|object} provider - функция или объект провайдера заголовков
    //  */
    // setHeaderProvider(provider) {
    //     if (typeof provider !== 'function' && typeof provider !== 'object') {
    //         console.warn('[VirtualizedTableAPI] setHeaderProvider expects function or object');
    //         return;
    //     }
    //
    //     window.VirtualizedTableState.headerProvider = provider;
    //     console.log('[VirtualizedTableAPI] Header provider set');
    //
    //     this._dispatchStateEvent('headerProvider', provider);
    // },

    /**
     * Установить провайдер данных
     * @param {function} provider - функция провайдера данных
     */
    setDataProvider(provider) {
        if (typeof provider !== 'function') {
            console.warn('[VirtualizedTableAPI] setDataProvider expects function');
            return;
        }

        // Проверяем, не установлен ли уже тот же провайдер
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

        // Проверяем, не установлен ли уже тот же провайдер
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

    /**
     * Установить видимость панели фильтров
     * @param {boolean} show - показать/скрыть панель фильтров
     */
    setShowFilters(show) {
        if (typeof show !== 'boolean') {
            console.warn('[VirtualizedTableAPI] setShowFilters expects boolean');
            return;
        }

        window.VirtualizedTableState.showFilters = show;
        console.log('[VirtualizedTableAPI] Show filters set to:', show);

        this._dispatchStateEvent('showFilters', show);
    },

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
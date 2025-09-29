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

        window.VirtualizedTableState.dataProvider = provider;
        console.log('[VirtualizedTableAPI] Data provider set');

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

        window.VirtualizedTableState.headerProvider = provider;
        console.log('[VirtualizedTableAPI] Header provider set');

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
     * Обновить viewport таблицы принудительно
     */
    refreshViewport() {
        if (typeof window.refreshTableViewport === 'function') {
            console.log('[VirtualizedTableAPI] Refreshing viewport...');
            window.refreshTableViewport();
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

/**
 * ДОКУМЕНТАЦИЯ API ДЛЯ РАЗРАБОТЧИКОВ
 *
 * === ОСНОВНЫЕ МЕТОДЫ ===
 *
 * // Установка провайдеров
 * VirtualizedTableAPI.setDataProvider(async (startDate, direction, batchSize) => {
 *   const response = await fetch('/api/table-data', {
 *     method: 'POST',
 *     body: JSON.stringify({ startDate, direction, batchSize })
 *   });
 *   return response.text(); // возвращает JSON string
 * });
 *
 * VirtualizedTableAPI.setHeaderProvider(async () => {
 *   const response = await fetch('/api/headers');
 *   return response.json();
 * });
 *
 * // Обработчики событий
 * VirtualizedTableAPI.setOnCellDoubleClick((cellData, event) => {
 *   console.log('Двойной клик:', cellData);
 * });
 *
 * VirtualizedTableAPI.setOnCellMove((moveData) => {
 *   console.log('Перемещение:', moveData);
 * });
 *
 * // Обновление viewport
 * VirtualizedTableAPI.refreshViewport();
 *
 * // Проверка состояния
 * const state = VirtualizedTableAPI.getState();
 * console.log('Состояние:', state);
 *
 * === ФОРМАТ ПРОВАЙДЕРА ДАННЫХ ===
 *
 * async function dataProvider(startDate, direction, batchSize)
 *
 * Параметры:
 * - startDate: string - дата в формате "DD.MM.YYYY"
 * - direction: string - "up" или "down" (направление загрузки)
 * - batchSize: number - количество записей для загрузки
 *
 * Возврат: string (JSON) в формате:
 * {
 *   "data": [
 *     {
 *       "date": "DD.MM.YYYY",
 *       "columns": [
 *         {
 *           "headerId": "string",     // ID заголовка
 *           "value": "string",        // Значение ячейки
 *           "rowspan": number,        // Объединение строк (опционально)
 *           "colspan": number,        // Объединение столбцов (опционально)
 *           "color": "string",        // Цвет фона (опционально)
 *           "draggable": boolean      // Можно ли перетаскивать (опционально)
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * === ФОРМАТ ПРОВАЙДЕРА ЗАГОЛОВКОВ ===
 *
 * {
 *   "headers": [
 *     {
 *       "id": "string",              // Уникальный ID заголовка
 *       "parentId": "string|null",   // ID родительского заголовка
 *       "type": "string",            // Тип узла
 *       "name": "string",            // Отображаемое имя
 *       "metadata": {
 *         "color": "string",         // Цвет заголовка
 *         "tooltip": "string",       // Подсказка (опционально)
 *         "workCount": number        // Количество работ (опционально)
 *       }
 *     }
 *   ]
 * }
 *
 * === ФОРМАТ ДАННЫХ ДЛЯ ОБРАБОТЧИКОВ ===
 *
 * onCellDoubleClick: (cellData, event) => void
 * cellData = {
 *   date: "DD.MM.YYYY",
 *   nodeId: "string",
 *   value: "string",
 *   color: "string|null",
 *   draggable: boolean,
 *   rowspan: number,
 *   colspan: number
 * }
 *
 * onCellMove: (moveData) => void
 * moveData = {
 *   fromDate: "DD.MM.YYYY",
 *   toDate: "DD.MM.YYYY",
 *   fromNodeId: "string",
 *   toNodeId: "string",
 *   value: "string"
 * }
 */
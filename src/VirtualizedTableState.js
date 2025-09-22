/**
 * Глобальное состояние виртуализированной таблицы
 * Для использования в Java Vaadin и других интеграциях
 */

// Создаем глобальный объект состояния
window.VirtualizedTableState = {
    // Основные режимы
    editMode: false,
    showFilters: false,
    debug: false,

    // Настройки производительности
    scrollBatchSize: 7,
    bufferSize: 4,

    // Обработчики событий
    onCellClick: null,
    onCellMove: null,
    onDataLoad: null,
    onError: null,

    // Провайдеры данных
    dataProvider: null,
    headerProvider: null,

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
     * Включить/выключить режим редактирования
     * @param {boolean} enabled - true для включения режима редактирования
     */
    setEditMode(enabled) {
        if (typeof enabled !== 'boolean') {
            console.warn('[VirtualizedTableAPI] setEditMode expects boolean parameter');
            return;
        }

        window.VirtualizedTableState.editMode = enabled;
        console.log(`[VirtualizedTableAPI] Edit mode ${enabled ? 'enabled' : 'disabled'}`);

        // Диспатчим событие для уведомления компонентов
        this._dispatchStateEvent('editMode', enabled);
    },

    /**
     * Показать/скрыть панель фильтров
     * @param {boolean} show - true для показа панели фильтров
     */
    setShowFilters(show) {
        if (typeof show !== 'boolean') {
            console.warn('[VirtualizedTableAPI] setShowFilters expects boolean parameter');
            return;
        }

        window.VirtualizedTableState.showFilters = show;
        console.log(`[VirtualizedTableAPI] Filters panel ${show ? 'opened' : 'closed'}`);

        // Диспатчим событие для уведомления компонентов
        this._dispatchStateEvent('showFilters', show);
    },

    /**
     * Установить размер батча для скроллинга
     * @param {number} size - размер батча (рекомендуется 5-20)
     */
    setScrollBatchSize(size) {
        if (typeof size !== 'number' || size < 1 || size > 50) {
            console.warn('[VirtualizedTableAPI] setScrollBatchSize expects number between 1 and 50');
            return;
        }

        window.VirtualizedTableState.scrollBatchSize = size;
        console.log(`[VirtualizedTableAPI] Scroll batch size set to ${size}`);

        this._dispatchStateEvent('scrollBatchSize', size);
    },

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
     * Установить обработчик клика по ячейке
     * @param {function} handler - функция обработчик
     */
    setOnCellClick(handler) {
        if (typeof handler !== 'function') {
            console.warn('[VirtualizedTableAPI] setOnCellClick expects function');
            return;
        }

        window.VirtualizedTableState.onCellClick = handler;
        console.log('[VirtualizedTableAPI] Cell click handler set');
    },

    /**
     * Получить текущее состояние таблицы
     * @returns {object} копия текущего состояния
     */
    getState() {
        return {
            editMode: window.VirtualizedTableState.editMode,
            showFilters: window.VirtualizedTableState.showFilters,
            debug: window.VirtualizedTableState.debug,
            scrollBatchSize: window.VirtualizedTableState.scrollBatchSize,
            bufferSize: window.VirtualizedTableState.bufferSize,
            initialized: window.VirtualizedTableState._initialized,
            loading: window.VirtualizedTableState._loading,
            error: window.VirtualizedTableState._error
        };
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

// Обратная совместимость со старым API
window.editMode = function(enabled) {
    window.VirtualizedTableAPI.setEditMode(enabled);
};

window.showFilters = function(show) {
    window.VirtualizedTableAPI.setShowFilters(show);
};

window.getTableState = function() {
    return window.VirtualizedTableAPI.getState();
};

console.log('[VirtualizedTableState] Global state and API initialized');

/**
 * ДОКУМЕНТАЦИЯ API ДЛЯ РАЗРАБОТЧИКОВ
 *
 * === ФОРМАТ ПРОВАЙДЕРА ДАННЫХ ===
 *
 * Функция провайдера данных должна иметь сигнатуру:
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
 * Функция или объект провайдера заголовков должен возвращать:
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
 * === ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ ===
 *
 * // Базовая настройка
 * VirtualizedTableAPI.setEditMode(true);
 * VirtualizedTableAPI.setShowFilters(true);
 * VirtualizedTableAPI.setScrollBatchSize(10);
 * VirtualizedTableAPI.refreshViewport()
 *
 * // Установка провайдеров
 * VirtualizedTableAPI.setDataProvider(async (startDate, direction, batchSize) => {
 *   const response = await fetch('/api/table-data', {
 *     method: 'POST',
 *     body: JSON.stringify({ startDate, direction, batchSize })
 *   });
 *   return response.text();
 * });
 *
 * VirtualizedTableAPI.setHeaderProvider(async () => {
 *   const response = await fetch('/api/headers');
 *   return response.json();
 * });
 *
 * // Обработчики событий
 * VirtualizedTableAPI.setOnCellClick((cellData) => {
 *   console.log('Cell clicked:', cellData);
 * });
 *
 * // Слушаем изменения состояния
 * window.addEventListener('virtualized-table-state-change', (event) => {
 *   console.log('State changed:', event.detail);
 * });
 *
 * === ПОДДЕРЖИВАЕМЫЕ АТРИБУТЫ COLSPAN И ROWSPAN ===
 *
 * Для объединения ячеек используйте:
 * - rowspan: number - объединяет ячейки по вертикали
 * - colspan: number - объединяет ячейки по горизонтали
 *
 * При использовании rowspan/colspan следующие ячейки в диапазоне
 * НЕ должны передаваться в данных - они будут автоматически скрыты.
 *
 * Пример с rowspan и colspan:
 * {
 *   "date": "01.01.2025",
 *   "columns": [
 *     {
 *       "headerId": "cell1",
 *       "value": "Объединенная ячейка",
 *       "rowspan": 3,      // объединяет 3 строки вниз
 *       "colspan": 2,      // объединяет 2 колонки направо
 *       "color": "#ffeb3b"
 *     },
 *     // Ячейки с headerId cell2, cell3 в этой строке НЕ передаются
 *     {
 *       "headerId": "cell4",
 *       "value": "Обычная ячейка"
 *     }
 *   ]
 * }
 *
 * // В следующих 2-х строках НЕ передавайте данные для cell1, cell2, cell3
 */

/**
 * Глобальное состояние виртуализированной таблицы
 * Для использования в Java Vaadin и других интеграциях
 */

// Создаем глобальный объект состояния
window.VirtualizedTableState = {
    // Основные режимы
    editMode: false,
    showFilters: false,
    debug: false,

    // Настройки производительности
    scrollBatchSize: 7,
    bufferSize: 4,

    // Обработчики событий - ВСЕ в стейте
    onCellClick: null,
    onCellDoubleClick: null,
    onCellMove: null,
    onDataLoad: null,
    onError: null,

    // Провайдеры данных
    dataProvider: null,
    headerProvider: null,

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
     * Включить/выключить режим редактирования
     * @param {boolean} enabled - true для включения режима редактирования
     */
    setEditMode(enabled) {
        if (typeof enabled !== 'boolean') {
            console.warn('[VirtualizedTableAPI] setEditMode expects boolean parameter');
            return;
        }

        window.VirtualizedTableState.editMode = enabled;
        console.log(`[VirtualizedTableAPI] Edit mode ${enabled ? 'enabled' : 'disabled'}`);

        // Диспатчим событие для уведомления компонентов
        this._dispatchStateEvent('editMode', enabled);
    },

    /**
     * Показать/скрыть панель фильтров
     * @param {boolean} show - true для показа панели фильтров
     */
    setShowFilters(show) {
        if (typeof show !== 'boolean') {
            console.warn('[VirtualizedTableAPI] setShowFilters expects boolean parameter');
            return;
        }

        window.VirtualizedTableState.showFilters = show;
        console.log(`[VirtualizedTableAPI] Filters panel ${show ? 'opened' : 'closed'}`);

        // Диспатчим событие для уведомления компонентов
        this._dispatchStateEvent('showFilters', show);
    },

    /**
     * Установить размер батча для скроллинга
     * @param {number} size - размер батча (рекомендуется 5-20)
     */
    setScrollBatchSize(size) {
        if (typeof size !== 'number' || size < 1 || size > 50) {
            console.warn('[VirtualizedTableAPI] setScrollBatchSize expects number between 1 and 50');
            return;
        }

        window.VirtualizedTableState.scrollBatchSize = size;
        console.log(`[VirtualizedTableAPI] Scroll batch size set to ${size}`);

        this._dispatchStateEvent('scrollBatchSize', size);
    },

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
     * Установить обработчик клика по ячейке
     * @param {function} handler - функция обработчик (cellData, event) => void
     */
    setOnCellClick(handler) {
        if (typeof handler !== 'function') {
            console.warn('[VirtualizedTableAPI] setOnCellClick expects function');
            return;
        }

        window.VirtualizedTableState.onCellClick = handler;
        console.log('[VirtualizedTableAPI] Cell click handler set');
    },

    /**
     * Установить обработчик двойного клика по ячейке
     * @param {function} handler - функция обработчик (cellDataJsonString, event) => void
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
     * Установить обработчик перемещения ячейки
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
     * Установить обработчик загрузки данных
     * @param {function} handler - функция обработчик (dataArray, startDate, batchSize) => void
     */
    setOnDataLoad(handler) {
        if (typeof handler !== 'function') {
            console.warn('[VirtualizedTableAPI] setOnDataLoad expects function');
            return;
        }

        window.VirtualizedTableState.onDataLoad = handler;
        console.log('[VirtualizedTableAPI] Data load handler set');
    },

    /**
     * Установить обработчик ошибок
     * @param {function} handler - функция обработчик (error, context) => void
     */
    setOnError(handler) {
        if (typeof handler !== 'function') {
            console.warn('[VirtualizedTableAPI] setOnError expects function');
            return;
        }

        window.VirtualizedTableState.onError = handler;
        console.log('[VirtualizedTableAPI] Error handler set');
    },

    /**
     * Получить текущее состояние таблицы
     * @returns {object} копия текущего состояния
     */
    getState() {
        return {
            editMode: window.VirtualizedTableState.editMode,
            showFilters: window.VirtualizedTableState.showFilters,
            debug: window.VirtualizedTableState.debug,
            scrollBatchSize: window.VirtualizedTableState.scrollBatchSize,
            bufferSize: window.VirtualizedTableState.bufferSize,
            initialized: window.VirtualizedTableState._initialized,
            loading: window.VirtualizedTableState._loading,
            error: window.VirtualizedTableState._error,
            hasDataProvider: !!window.VirtualizedTableState.dataProvider,
            hasHeaderProvider: !!window.VirtualizedTableState.headerProvider,
            hasOnCellClick: !!window.VirtualizedTableState.onCellClick,
            hasOnCellDoubleClick: !!window.VirtualizedTableState.onCellDoubleClick,
            hasOnCellMove: !!window.VirtualizedTableState.onCellMove
        };
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

// Обратная совместимость со старым API
window.editMode = function(enabled) {
    window.VirtualizedTableAPI.setEditMode(enabled);
};

window.showFilters = function(show) {
    window.VirtualizedTableAPI.setShowFilters(show);
};

window.getTableState = function() {
    return window.VirtualizedTableAPI.getState();
};

// УБИРАЕМ старые обработчики - все идет через стейт
// window.onTableCellClick - УБРАНО
// window.onTableCellMove - УБРАНО

console.log('[VirtualizedTableState] Global state and API initialized');

/**
 * ОБНОВЛЕННАЯ ДОКУМЕНТАЦИЯ API ДЛЯ РАЗРАБОТЧИКОВ
 *
 * === ЕДИНЫЙ API ЧЕРЕЗ VirtualizedTableState ===
 *
 * ВСЕ обработчики событий теперь устанавливаются через VirtualizedTableState:
 *
 * // Обработчики событий
 * VirtualizedTableAPI.setOnCellClick((cellData, event) => {
 *   console.log('Клик:', cellData);
 * });
 *
 * VirtualizedTableAPI.setOnCellDoubleClick((cellDataJsonString, event) => {
 *   const cellData = JSON.parse(cellDataJsonString);
 *   console.log('Двойной клик:', cellData);
 * });
 *
 * VirtualizedTableAPI.setOnCellMove((moveData) => {
 *   console.log('Перемещение:', moveData);
 * });
 *
 * VirtualizedTableAPI.setOnDataLoad((dataArray, startDate, batchSize) => {
 *   console.log('Данные загружены:', dataArray.length);
 * });
 *
 * VirtualizedTableAPI.setOnError((error, context) => {
 *   console.error('Ошибка:', error, context);
 * });
 *
 * === ОБРАТНАЯ СОВМЕСТИМОСТЬ ===
 *
 * Старые глобальные функции больше НЕ поддерживаются:
 * - window.onTableCellClick - УДАЛЕНО
 * - window.onTableCellMove - УДАЛЕНО
 *
 * Используйте новый API для всех обработчиков событий.
 *
 * === ФОРМАТ ДАННЫХ ДЛЯ ОБРАБОТЧИКОВ ===
 *
 * onCellClick: (cellData, event) => void
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
 * onCellDoubleClick: (cellDataJsonString, event) => void
 * cellDataJsonString = JSON.stringify(cellData)
 *
 * onCellMove: (moveData) => void
 * moveData = {
 *   fromDate: "DD.MM.YYYY",
 *   toDate: "DD.MM.YYYY",
 *   fromNodeId: "string",
 *   toNodeId: "string",
 *   value: "string"
 * }
 *
 * === ПРОВЕРКА СОСТОЯНИЯ ===
 *
 * const state = VirtualizedTableAPI.getState();
 * console.log('Обработчики:', {
 *   hasOnCellClick: state.hasOnCellClick,
 *   hasOnCellDoubleClick: state.hasOnCellDoubleClick,
 *   hasOnCellMove: state.hasOnCellMove
 * });
 */
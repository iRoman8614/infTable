[//]: # ([//]: # &#40;# API&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;## Использование&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;### ФОРМАТ ПРОВАЙДЕРА ДАННЫХ&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;Функция провайдера данных должна иметь сигнатуру:&#41;)
[//]: # ()
[//]: # ([//]: # &#40;async function dataProvider&#40;startDate, direction, batchSize&#41;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;Параметры:&#41;)
[//]: # ()
[//]: # ([//]: # &#40;- startDate: string - дата в формате "DD.MM.YYYY"&#41;)
[//]: # ()
[//]: # ([//]: # &#40;- direction: string - "up" или "down" &#40;направление загрузки&#41;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;- batchSize: number - количество записей для загрузки&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;Возврат: string &#40;JSON&#41; в формате:&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;```jsx&#41;)
[//]: # ()
[//]: # ([//]: # &#40;{&#41;)
[//]: # ()
[//]: # ([//]: # &#40;    "data": [&#41;)
[//]: # ()
[//]: # ([//]: # &#40;        {&#41;)
[//]: # ()
[//]: # ([//]: # &#40;            "date": "DD.MM.YYYY",&#41;)
[//]: # ()
[//]: # ([//]: # &#40;            "columns": [&#41;)
[//]: # ()
[//]: # ([//]: # &#40;                {&#41;)
[//]: # ()
[//]: # ([//]: # &#40;                    "headerId": "string",     // ID заголовка&#41;)
[//]: # ()
[//]: # ([//]: # &#40;                    "value": "string",        // Значение ячейки&#41;)
[//]: # ()
[//]: # ([//]: # &#40;                    "rowspan": number,        // Объединение строк &#40;опционально&#41;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;                    "colspan": number,        // Объединение столбцов &#40;опционально&#41;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;                    "color": "string",        // Цвет фона &#40;опционально&#41;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;                    "draggable": boolean      // Можно ли перетаскивать &#40;опционально&#41;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;                }&#41;)
[//]: # ()
[//]: # ([//]: # &#40;            ]&#41;)
[//]: # ()
[//]: # ([//]: # &#40;        }&#41;)
[//]: # ()
[//]: # ([//]: # &#40;    ]&#41;)
[//]: # ()
[//]: # ([//]: # &#40;}&#41;)
[//]: # ()
[//]: # ([//]: # &#40;```&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;### ФОРМАТ ПРОВАЙДЕРА ЗАГОЛОВКОВ&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;Возврат: string &#40;JSON&#41; в формате:&#41;)
[//]: # ()
[//]: # ([//]: # &#40;```jsx&#41;)
[//]: # ()
[//]: # ([//]: # &#40;{&#41;)
[//]: # ()
[//]: # ([//]: # &#40;    "headers": [&#41;)
[//]: # ()
[//]: # ([//]: # &#40;        {&#41;)
[//]: # ()
[//]: # ([//]: # &#40;            "id": "string",              // Уникальный ID заголовка&#41;)
[//]: # ()
[//]: # ([//]: # &#40;            "parentId": "string|null",   // ID родительского заголовка&#41;)
[//]: # ()
[//]: # ([//]: # &#40;            "type": "string",            // Тип узла&#41;)
[//]: # ()
[//]: # ([//]: # &#40;            "name": "string",            // Отображаемое имя&#41;)
[//]: # ()
[//]: # ([//]: # &#40;            "metadata": {&#41;)
[//]: # ()
[//]: # ([//]: # &#40;                "color": "string",         // Цвет заголовка&#41;)
[//]: # ()
[//]: # ([//]: # &#40;                "tooltip": "string",       // Подсказка &#40;опционально&#41;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;                "workCount": number        // Количество работ &#40;опционально&#41;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;            }&#41;)
[//]: # ()
[//]: # ([//]: # &#40;        }&#41;)
[//]: # ()
[//]: # ([//]: # &#40;    ]&#41;)
[//]: # ()
[//]: # ([//]: # &#40;}&#41;)
[//]: # ()
[//]: # ([//]: # &#40;```&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;### Базовая настройка&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;```jsx&#41;)
[//]: # ()
[//]: # ([//]: # &#40;VirtualizedTableAPI.setEditMode&#40;true/false&#41;;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;VirtualizedTableAPI.setShowFilters&#40;true/false&#41;;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;VirtualizedTableAPI.setScrollBatchSize&#40;10&#41;;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;VirtualizedTableAPI.refreshViewport&#40;&#41;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;```&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;### Установка провайдеров&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;```jsx&#41;)
[//]: # ()
[//]: # ([//]: # &#40;window.dp = async function&#40;startDate, direction, batchSize&#41; {...}&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;или&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;VirtualizedTableAPI.setDataProvider&#40;async &#40;startDate, direction, batchSize&#41; => {&#41;)
[//]: # ()
[//]: # ([//]: # &#40;    const response = await fetch&#40;'/api/table-data', {&#41;)
[//]: # ()
[//]: # ([//]: # &#40;        method: 'POST',&#41;)
[//]: # ()
[//]: # ([//]: # &#40;        body: JSON.stringify&#40;{ startDate, direction, batchSize }&#41;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;    }&#41;;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;    return response.text&#40;&#41;;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;}&#41;;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;window.hp = async function&#40;&#41; {...}&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;или&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;VirtualizedTableAPI.setHeaderProvider&#40;async &#40;&#41; => {&#41;)
[//]: # ()
[//]: # ([//]: # &#40;    const response = await fetch&#40;'/api/headers'&#41;;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;    return response.json&#40;&#41;;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;}&#41;;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;window.onTableCellClick = function&#40;cellDataJson&#41; { ... }&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;или&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;VirtualizedTableAPI.setOnCellClick&#40;&#40;cellData&#41; => {&#41;)
[//]: # ()
[//]: # ([//]: # &#40;    console.log&#40;'Cell clicked:', cellData&#41;;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;}&#41;;&#41;)
[//]: # ()
[//]: # ([//]: # &#40;```&#41;)
[//]: # ()
[//]: # (# Консольные команды для работы с VirtualizedTableState)

[//]: # ()
[//]: # (## Основные изменения)

[//]: # ()
[//]: # (### 1. Фильтры вынесены в отдельный Web Component)

[//]: # (- Компонент: `<virtualized-table-filters>`)

[//]: # (- Общение через глобальное состояние `VirtualizedTableState`)

[//]: # (- Поддержка мультитабличных сценариев)

[//]: # ()
[//]: # (### 2. Исправлен дабл клик)

[//]: # (- Обработчики теперь получают JSON строку вместо `[object Object]`)

[//]: # (- Унифицированное API через `VirtualizedTableState.onCellClick`)

[//]: # ()
[//]: # (### 3. Унифицированное API)

[//]: # (- Все обработчики кроме `hp` и `dp` работают через `VirtualizedTableState`)

[//]: # (- Deprecated методы показывают предупреждения)

[//]: # (- Обратная совместимость сохранена)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## 🚀 Быстрый старт)

[//]: # ()
[//]: # (### Базовая настройка)

[//]: # (```javascript)

[//]: # (// Включить режим редактирования)

[//]: # (VirtualizedTableAPI.setEditMode&#40;true&#41;)

[//]: # ()
[//]: # (// Показать фильтры)

[//]: # (VirtualizedTableAPI.setShowFilters&#40;true&#41;)

[//]: # ()
[//]: # (// Установить размер батча)

[//]: # (VirtualizedTableAPI.setScrollBatchSize&#40;10&#41;)

[//]: # (```)

[//]: # ()
[//]: # (### Установка провайдеров)

[//]: # (```javascript)

[//]: # (// Провайдер данных)

[//]: # (VirtualizedTableAPI.setDataProvider&#40;async &#40;startDate, direction, batchSize&#41; => {)

[//]: # (  const response = await fetch&#40;'/api/table-data', {)

[//]: # (    method: 'POST',)

[//]: # (    body: JSON.stringify&#40;{ startDate, direction, batchSize }&#41;)

[//]: # (  }&#41;;)

[//]: # (  return response.text&#40;&#41;; // JSON строка)

[//]: # (}&#41;)

[//]: # ()
[//]: # (// Провайдер заголовков)

[//]: # (VirtualizedTableAPI.setHeaderProvider&#40;async &#40;&#41; => {)

[//]: # (  const response = await fetch&#40;'/api/headers'&#41;;)

[//]: # (  return response.json&#40;&#41;; // Объект с массивом headers)

[//]: # (}&#41;)

[//]: # (```)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## 📋 Основные команды)

[//]: # ()
[//]: # (### Управление режимами)

[//]: # (```javascript)

[//]: # (VirtualizedTableAPI.setEditMode&#40;true&#41;           // Включить редактирование)

[//]: # (VirtualizedTableAPI.setEditMode&#40;false&#41;          // Выключить редактирование)

[//]: # (VirtualizedTableAPI.setShowFilters&#40;true&#41;        // Показать фильтры)

[//]: # (VirtualizedTableAPI.setShowFilters&#40;false&#41;       // Скрыть фильтры)

[//]: # (```)

[//]: # ()
[//]: # (### Получение состояния)

[//]: # (```javascript)

[//]: # (VirtualizedTableAPI.getState&#40;&#41;                  // Текущее состояние)

[//]: # (VirtualizedTableAPI.getTableIds&#40;&#41;               // Список всех таблиц)

[//]: # (VirtualizedTableAPI.refreshViewport&#40;&#41;           // Обновить viewport)

[//]: # (```)

[//]: # ()
[//]: # (### Настройка производительности)

[//]: # (```javascript)

[//]: # (VirtualizedTableAPI.setScrollBatchSize&#40;15&#41;      // Размер батча &#40;5-20&#41;)

[//]: # (```)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## 🎯 Обработчики событий)

[//]: # ()
[//]: # (### Клики по ячейкам &#40;ИСПРАВЛЕНО - теперь JSON строка&#41;)

[//]: # (```javascript)

[//]: # (VirtualizedTableAPI.setOnCellClick&#40;&#40;cellData, event&#41; => {)

[//]: # (  console.log&#40;'Cell clicked:', cellData&#41;;)

[//]: # (  // cellData содержит: { date: "01.01.2025", nodeId: "task1", value: "✅" })

[//]: # (}&#41;)

[//]: # ()
[//]: # (// DEPRECATED &#40;но работает&#41;:)

[//]: # (window.onTableCellClick = &#40;jsonString&#41; => {)

[//]: # (  const cellData = JSON.parse&#40;jsonString&#41;;)

[//]: # (  console.log&#40;'Cell clicked &#40;deprecated&#41;:', cellData&#41;;)

[//]: # (})

[//]: # (```)

[//]: # ()
[//]: # (### Перемещение ячеек &#40;drag & drop&#41;)

[//]: # (```javascript)

[//]: # (VirtualizedTableAPI.setOnCellMove&#40;&#40;moveData&#41; => {)

[//]: # (  console.log&#40;'Cell moved:', moveData&#41;;)

[//]: # (  // moveData содержит: )

[//]: # (  // { )

[//]: # (  //   source: { date: "01.01.2025", nodeId: "task1" },)

[//]: # (  //   target: { date: "02.01.2025", nodeId: "task1" })

[//]: # (  // })

[//]: # (}&#41;)

[//]: # ()
[//]: # (// DEPRECATED &#40;но работает&#41;:)

[//]: # (window.onTableCellMove = &#40;jsonString&#41; => {)

[//]: # (  const moveData = JSON.parse&#40;jsonString&#41;;)

[//]: # (  console.log&#40;'Cell moved &#40;deprecated&#41;:', moveData&#41;;)

[//]: # (})

[//]: # (```)

[//]: # ()
[//]: # (### Загрузка данных и ошибки)

[//]: # (```javascript)

[//]: # (VirtualizedTableAPI.setOnDataLoad&#40;&#40;dataArray, startDate, batchSize&#41; => {)

[//]: # (  console.log&#40;`Loaded ${dataArray.length} records from ${startDate}`&#41;;)

[//]: # (}&#41;)

[//]: # ()
[//]: # (VirtualizedTableAPI.setOnError&#40;&#40;error, context&#41; => {)

[//]: # (  console.error&#40;'Table error:', error, context&#41;;)

[//]: # (}&#41;)

[//]: # (```)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## 📊 Мультитабличные сценарии)

[//]: # ()
[//]: # (### Управление конкретными таблицами)

[//]: # (```javascript)

[//]: # (// Управление фильтрами для разных таблиц)

[//]: # (VirtualizedTableAPI.setShowFilters&#40;true, 'table1'&#41;    // Показать фильтры table1)

[//]: # (VirtualizedTableAPI.setShowFilters&#40;false, 'table2'&#41;   // Скрыть фильтры table2)

[//]: # ()
[//]: # (// Получение состояния конкретной таблицы)

[//]: # (VirtualizedTableAPI.getState&#40;'table1'&#41;                // Состояние table1)

[//]: # ()
[//]: # (// Обновление конкретной таблицы)

[//]: # (VirtualizedTableAPI.refreshViewport&#40;'table1'&#41;         // Обновить table1)

[//]: # (```)

[//]: # ()
[//]: # (### HTML разметка для нескольких таблиц)

[//]: # (```html)

[//]: # (<!-- Фильтры для первой таблицы -->)

[//]: # (<virtualized-table-filters table-id="table1"></virtualized-table-filters>)

[//]: # (<virtualized-table table-id="table1"></virtualized-table>)

[//]: # ()
[//]: # (<!-- Фильтры для второй таблицы -->)

[//]: # (<virtualized-table-filters table-id="table2"></virtualized-table-filters>)

[//]: # (<virtualized-table table-id="table2"></virtualized-table>)

[//]: # (```)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## 🔧 Диагностика и отладка)

[//]: # ()
[//]: # (### Проверка состояния)

[//]: # (```javascript)

[//]: # (// Текущее состояние)

[//]: # (console.log&#40;'State:', VirtualizedTableAPI.getState&#40;&#41;&#41;)

[//]: # ()
[//]: # (// Список всех таблиц)

[//]: # (console.log&#40;'Tables:', VirtualizedTableAPI.getTableIds&#40;&#41;&#41;)

[//]: # ()
[//]: # (// Глобальное состояние &#40;полная информация&#41;)

[//]: # (console.log&#40;'Global state:', window.VirtualizedTableState&#41;)

[//]: # ()
[//]: # (// Проверка провайдеров)

[//]: # (console.log&#40;'Data provider:', typeof window.VirtualizedTableState.dataProvider&#41;)

[//]: # (console.log&#40;'Header provider:', typeof window.VirtualizedTableState.headerProvider&#41;)

[//]: # (```)

[//]: # ()
[//]: # (### Мониторинг изменений)

[//]: # (```javascript)

[//]: # (// Слушать все изменения состояния)

[//]: # (window.addEventListener&#40;'virtualized-table-state-change', &#40;event&#41; => {)

[//]: # (  console.log&#40;'State changed:', event.detail&#41;;)

[//]: # (  // event.detail содержит: { property, value, tableId, state })

[//]: # (}&#41;)

[//]: # ()
[//]: # (// Проверка компонента)

[//]: # (window.checkTableComponent&#40;'table1'&#41;  // Диагностика конкретной таблицы)

[//]: # (```)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## ⚡ Быстрые команды)

[//]: # ()
[//]: # (### Полная настройка одной командой)

[//]: # (```javascript)

[//]: # (&#40;function setupTable&#40;&#41; {)

[//]: # (  // Основные настройки)

[//]: # (  VirtualizedTableAPI.setEditMode&#40;true&#41;;)

[//]: # (  VirtualizedTableAPI.setScrollBatchSize&#40;10&#41;;)

[//]: # (  )
[//]: # (  // Обработчики)

[//]: # (  VirtualizedTableAPI.setOnCellClick&#40;&#40;cellData&#41; => {)

[//]: # (    console.log&#40;'Clicked:', JSON.stringify&#40;cellData&#41;&#41;;)

[//]: # (  }&#41;;)

[//]: # (  )
[//]: # (  VirtualizedTableAPI.setOnCellMove&#40;&#40;moveData&#41; => {)

[//]: # (    console.log&#40;'Moved:', JSON.stringify&#40;moveData&#41;&#41;;)

[//]: # (  }&#41;;)

[//]: # (  )
[//]: # (  console.log&#40;'Table configured!'&#41;;)

[//]: # (}&#41;&#40;&#41;;)

[//]: # (```)

[//]: # ()
[//]: # (### Быстрое тестирование)

[//]: # (```javascript)

[//]: # (// Включить все возможности)

[//]: # (VirtualizedTableAPI.setEditMode&#40;true&#41;)

[//]: # (VirtualizedTableAPI.setShowFilters&#40;true&#41;)

[//]: # ()
[//]: # (// Протестировать клик &#40;эмуляция&#41;)

[//]: # (VirtualizedTableState.onCellClick?.&#40;{ )

[//]: # (  date: "01.01.2025", )

[//]: # (  nodeId: "test", )

[//]: # (  value: "test" )

[//]: # (}, null&#41;)

[//]: # (```)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## 🔄 Совместимость &#40;DEPRECATED&#41;)

[//]: # ()
[//]: # (### Старые методы &#40;показывают предупреждения&#41;)

[//]: # (```javascript)

[//]: # (// DEPRECATED - используйте VirtualizedTableAPI.setEditMode)

[//]: # (window.editMode&#40;true&#41;)

[//]: # ()
[//]: # (// DEPRECATED - используйте VirtualizedTableAPI.setShowFilters  )

[//]: # (window.showFilters&#40;true&#41;)

[//]: # ()
[//]: # (// DEPRECATED - используйте VirtualizedTableAPI.getState)

[//]: # (window.getTableState&#40;&#41;)

[//]: # ()
[//]: # (// DEPRECATED - используйте VirtualizedTableAPI.setOnCellClick)

[//]: # (window.onTableCellClick = &#40;jsonString&#41; => { ... })

[//]: # ()
[//]: # (// DEPRECATED - используйте VirtualizedTableAPI.setOnCellMove)

[//]: # (window.onTableCellMove = &#40;jsonString&#41; => { ... })

[//]: # (```)

[//]: # ()
[//]: # (### Обратная совместимость &#40;сохранена поддержка&#41;)

[//]: # (```javascript)

[//]: # (// Эти методы продолжают работать)

[//]: # (window.hp = &#40;&#41; => &#40;{ headers: [...] }&#41;      // Провайдер заголовков)

[//]: # (window.dp = &#40;date, dir, size&#41; => { ... }    // Провайдер данных)

[//]: # (```)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## 📝 Примеры использования)

[//]: # ()
[//]: # (### Простая настройка)

[//]: # (```javascript)

[//]: # (// 1. Установить провайдеры)

[//]: # (VirtualizedTableAPI.setDataProvider&#40;myDataProvider&#41;)

[//]: # (VirtualizedTableAPI.setHeaderProvider&#40;myHeaderProvider&#41;)

[//]: # ()
[//]: # (// 2. Настроить обработчики)

[//]: # (VirtualizedTableAPI.setOnCellClick&#40;&#40;cellData&#41; => {)

[//]: # (  alert&#40;`Clicked: ${cellData.value} on ${cellData.date}`&#41;)

[//]: # (}&#41;)

[//]: # ()
[//]: # (// 3. Включить функции)

[//]: # (VirtualizedTableAPI.setEditMode&#40;true&#41;)

[//]: # (VirtualizedTableAPI.setShowFilters&#40;true&#41;)

[//]: # (```)

[//]: # ()
[//]: # (### Продвинутая настройка с мониторингом)

[//]: # (```javascript)

[//]: # (// Настройка с полным мониторингом)

[//]: # (VirtualizedTableAPI.setOnDataLoad&#40;&#40;data, startDate, batchSize&#41; => {)

[//]: # (  console.log&#40;`📊 Loaded ${data.length} records from ${startDate}`&#41;)

[//]: # (}&#41;)

[//]: # ()
[//]: # (VirtualizedTableAPI.setOnError&#40;&#40;error, context&#41; => {)

[//]: # (  console.error&#40;'❌ Table error:', error.message, context&#41;)

[//]: # (}&#41;)

[//]: # ()
[//]: # (VirtualizedTableAPI.setOnCellClick&#40;&#40;cellData, event&#41; => {)

[//]: # (  console.log&#40;'🖱️ Cell clicked:', JSON.stringify&#40;cellData&#41;&#41;)

[//]: # (}&#41;)

[//]: # ()
[//]: # (VirtualizedTableAPI.setOnCellMove&#40;&#40;moveData&#41; => {)

[//]: # (  console.log&#40;'🔄 Cell moved:', JSON.stringify&#40;moveData&#41;&#41;)

[//]: # (}&#41;)

[//]: # ()
[//]: # (// Мониторинг изменений состояния)

[//]: # (window.addEventListener&#40;'virtualized-table-state-change', &#40;event&#41; => {)

[//]: # (  console.log&#40;'🔔 State change:', event.detail.property, '=', event.detail.value&#41;)

[//]: # (}&#41;)

[//]: # (```)

[//]: # ()
[//]: # (### Работа с несколькими таблицами)

[//]: # (```javascript)

[//]: # (// Настройка первой таблицы)

[//]: # (VirtualizedTableAPI.setEditMode&#40;true, 'orders-table'&#41;)

[//]: # (VirtualizedTableAPI.setShowFilters&#40;true, 'orders-table'&#41;)

[//]: # ()
[//]: # (// Настройка второй таблицы  )

[//]: # (VirtualizedTableAPI.setEditMode&#40;false, 'reports-table'&#41;)

[//]: # (VirtualizedTableAPI.setShowFilters&#40;false, 'reports-table'&#41;)

[//]: # ()
[//]: # (// Получение состояния всех таблиц)

[//]: # (VirtualizedTableAPI.getTableIds&#40;&#41;.forEach&#40;tableId => {)

[//]: # (  console.log&#40;`Table ${tableId}:`, VirtualizedTableAPI.getState&#40;tableId&#41;&#41;)

[//]: # (}&#41;)

[//]: # (```)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## 🎮 Консольная игровая площадка)

[//]: # ()
[//]: # (После загрузки страницы доступны готовые команды для тестирования:)

[//]: # ()
[//]: # (```javascript)

[//]: # (testCommands.enableEdit&#40;&#41;     // Быстро включить редактирование)

[//]: # (testCommands.showFilters&#40;&#41;    // Быстро показать фильтры  )

[//]: # (testCommands.getState&#40;&#41;       // Быстро получить состояние)

[//]: # (testCommands.quickSetup&#40;&#41;     // Быстрая настройка всего)

[//]: # (```)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## 🚨 Важные изменения)

[//]: # ()
[//]: # (1. **Фильтры вынесены в отдельный компонент** - используйте `<virtualized-table-filters>`)

[//]: # (2. **Исправлен дабл клик** - теперь возвращает JSON строку, а не `[object Object]`)

[//]: # (3. **Унифицированное API** - все через `VirtualizedTableState`, кроме `hp` и `dp`)

[//]: # (4. **Мультитабличность** - поддержка нескольких таблиц с разными настройками)

[//]: # (5. **Deprecated предупреждения** - старые методы показывают предупреждения в консоли)

[//]: # ()
[//]: # (Используйте новое API для лучшей производительности и функциональности!)

# API команды для виртуализированной таблицы

## Основные команды управления

### Управление режимами
```javascript
// Включить/выключить режим редактирования
VirtualizedTableAPI.setEditMode(true);
VirtualizedTableAPI.setEditMode(false);

// Показать/скрыть панель фильтров
VirtualizedTableAPI.setShowFilters(true);
VirtualizedTableAPI.setShowFilters(false);

// Установить размер батча для загрузки данных (5-50)
VirtualizedTableAPI.setScrollBatchSize(10);
VirtualizedTableAPI.setScrollBatchSize(20);
```

### Обновление и диагностика
```javascript
// Принудительно обновить viewport таблицы
VirtualizedTableAPI.refreshViewport();

// Получить текущее состояние таблицы
VirtualizedTableAPI.getState();

// Проверить статус компонента
window.checkTableComponent();
```

## Установка провайдеров данных

### Провайдер данных
```javascript
// Установить провайдер данных
VirtualizedTableAPI.setDataProvider(async (startDate, direction, batchSize) => {
  const response = await fetch('/api/table-data', {
    method: 'POST',
    body: JSON.stringify({ startDate, direction, batchSize })
  });
  return response.text(); // Должен вернуть JSON строку
});

// Или через глобальную функцию
window.dp = function(startDate, direction, batchSize) {
  return JSON.stringify({
    "data": [
      {
        "date": "22.09.2025",
        "columns": [
          {
            "headerId": "station1",
            "value": "М",
            "color": "#ffeb3b",
            "draggable": true,
            "rowspan": 2,
            "colspan": 1
          }
        ]
      }
    ]
  });
};
```

### Провайдер заголовков
```javascript
// Установить провайдер заголовков
VirtualizedTableAPI.setHeaderProvider(async () => {
  const response = await fetch('/api/headers');
  return response.json();
});

// Или через глобальную функцию
window.hp = function() {
  return {
    "headers": [
      {
        "id": "station1",
        "parentId": "line1",
        "type": "component",
        "name": "Станция 1",
        "metadata": {
          "color": "#f44336",
          "tooltip": "Рабочая станция",
          "workCount": 5
        }
      }
    ]
  };
};
```

## Установка обработчиков событий

### Обработчик клика по ячейке
```javascript
// Устанавливает обработчик клика (получает объект cellData + event)
VirtualizedTableAPI.setOnCellClick((cellData, event) => {
  console.log('Клик по ячейке:', cellData);
  alert(`Ячейка: ${cellData.date} - ${cellData.nodeId} = ${cellData.value}`);
});

// Убрать обработчик
VirtualizedTableAPI.setOnCellClick(null);
```

### Обработчик двойного клика
```javascript
// Устанавливает обработчик двойного клика (получает JSON строку + event)
VirtualizedTableAPI.setOnCellDoubleClick((cellDataJsonString, event) => {
  const cellData = JSON.parse(cellDataJsonString);
  console.log('Двойной клик (JSON):', cellData);
  alert(`Данные JSON: ${cellDataJsonString}`);
});

// Убрать обработчик
VirtualizedTableAPI.setOnCellDoubleClick(null);
```

### Обработчик перемещения ячейки
```javascript
// Устанавливает обработчик drag & drop
VirtualizedTableAPI.setOnCellMove((moveData) => {
  console.log('Перемещение ячейки:', moveData);
  // moveData = { fromDate, toDate, fromNodeId, toNodeId, value }
});

// Убрать обработчик
VirtualizedTableAPI.setOnCellMove(null);
```

### Обработчик загрузки данных
```javascript
// Срабатывает при успешной загрузке данных
VirtualizedTableAPI.setOnDataLoad((dataArray, startDate, batchSize) => {
  console.log(`Загружено ${dataArray.length} записей от ${startDate}`);
});
```

### Обработчик ошибок
```javascript
// Срабатывает при ошибках загрузки или обработки
VirtualizedTableAPI.setOnError((error, context) => {
  console.error('Ошибка в таблице:', error);
  console.log('Контекст:', context);
});
```

## Диагностические команды

### Проверка состояния
```javascript
// Полная информация о состоянии
const state = VirtualizedTableAPI.getState();
console.log('Состояние таблицы:', state);

// Проверка конкретных параметров
console.log('Режим редактирования:', state.editMode);
console.log('Панель фильтров:', state.showFilters);
console.log('Размер батча:', state.scrollBatchSize);
console.log('Инициализирована:', state.initialized);
console.log('Загружается:', state.loading);
console.log('Ошибка:', state.error);

// Проверка обработчиков
console.log('Обработчики установлены:', {
  click: state.hasOnCellClick,
  doubleClick: state.hasOnCellDoubleClick,
  move: state.hasOnCellMove
});
```

### Прямой доступ к глобальному состоянию
```javascript
// Прямое чтение состояния (только для отладки)
console.log('Глобальное состояние:', window.VirtualizedTableState);

// Проверка провайдеров
console.log('Провайдер данных:', !!window.VirtualizedTableState.dataProvider);
console.log('Провайдер заголовков:', !!window.VirtualizedTableState.headerProvider);
```

## Быстрые команды для отладки

### Мгновенная настройка для тестирования
```javascript
// Быстрая настройка таблицы для тестирования
function quickSetup() {
  VirtualizedTableAPI.setEditMode(true);
  VirtualizedTableAPI.setShowFilters(true);
  VirtualizedTableAPI.setScrollBatchSize(10);
  
  VirtualizedTableAPI.setOnCellClick((cellData) => {
    console.log('Клик:', cellData);
  });
  
  VirtualizedTableAPI.setOnCellDoubleClick((json) => {
    console.log('Двойной клик JSON:', json);
  });
  
  console.log('Быстрая настройка завершена');
}

// Запуск
quickSetup();
```

### Очистка всех настроек
```javascript
// Сброс всех обработчиков
function clearAllHandlers() {
  VirtualizedTableAPI.setOnCellClick(null);
  VirtualizedTableAPI.setOnCellDoubleClick(null);
  VirtualizedTableAPI.setOnCellMove(null);
  VirtualizedTableAPI.setOnDataLoad(null);
  VirtualizedTableAPI.setOnError(null);
  console.log('Все обработчики очищены');
}

// Сброс режимов
function resetModes() {
  VirtualizedTableAPI.setEditMode(false);
  VirtualizedTableAPI.setShowFilters(false);
  VirtualizedTableAPI.setScrollBatchSize(7);
  console.log('Режимы сброшены к значениям по умолчанию');
}
```

## События для прослушивания

### Слушатель изменений состояния
```javascript
// Подписка на изменения глобального состояния
window.addEventListener('virtualized-table-state-change', (event) => {
  console.log('Состояние изменилось:', event.detail);
  console.log('Свойство:', event.detail.property);
  console.log('Новое значение:', event.detail.value);
});
```

### Кастомные события ячеек
```javascript
// Слушатель кликов по ячейкам
window.addEventListener('table-cell-click', (event) => {
  console.log('Кастомное событие клика:', event.detail);
});

// Слушатель двойных кликов
window.addEventListener('table-cell-double-click', (event) => {
  console.log('Кастомное событие двойного клика:', event.detail);
});

// Слушатель перемещений
window.addEventListener('table-cell-move', (event) => {
  console.log('Кастомное событие перемещения:', event.detail);
});
```

## Примеры использования в реальных сценариях

### Интеграция с Java Vaadin
```javascript
// Для Java Vaadin приложений
VirtualizedTableAPI.setOnCellClick((cellData, event) => {
  // Отправка данных на сервер
  fetch('/vaadin/cell-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cellData)
  });
});

VirtualizedTableAPI.setOnCellDoubleClick((jsonString, event) => {
  // Передача JSON строки в Java
  if (window.vaadinCallback) {
    window.vaadinCallback.cellDoubleClick(jsonString);
  }
});
```

### Отладка производительности
```javascript
// Мониторинг загрузок данных
VirtualizedTableAPI.setOnDataLoad((dataArray, startDate, batchSize) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Загружено: ${dataArray.length} записей, батч: ${batchSize}`);
});

// Отслеживание ошибок
VirtualizedTableAPI.setOnError((error, context) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ОШИБКА:`, error);
  console.log('Контекст ошибки:', context);
});
```

### Автоматическое тестирование
```javascript
// Функция для автотестов
async function runTableTests() {
  console.log('🧪 Запуск тестов таблицы...');
  
  // Проверка API
  if (typeof VirtualizedTableAPI === 'undefined') {
    console.error('❌ VirtualizedTableAPI не найден');
    return false;
  }
  
  // Тест режимов
  VirtualizedTableAPI.setEditMode(true);
  VirtualizedTableAPI.setShowFilters(true);
  
  const state = VirtualizedTableAPI.getState();
  if (state.editMode && state.showFilters) {
    console.log('✅ Тест режимов прошел');
  } else {
    console.error('❌ Тест режимов провален');
    return false;
  }
  
  // Тест обработчиков
  let clickReceived = false;
  VirtualizedTableAPI.setOnCellClick(() => { clickReceived = true; });
  
  const stateAfter = VirtualizedTableAPI.getState();
  if (stateAfter.hasOnCellClick) {
    console.log('✅ Тест обработчиков прошел');
  } else {
    console.error('❌ Тест обработчиков провален');
    return false;
  }
  
  console.log('🎉 Все тесты прошли успешно');
  return true;
}

// Запуск тестов
runTableTests();
```
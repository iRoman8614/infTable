# API

## Использование

### ФОРМАТ ПРОВАЙДЕРА ДАННЫХ

Функция провайдера данных должна иметь сигнатуру:
async function dataProvider(startDate, direction, batchSize)

Параметры:
- startDate: string - дата в формате "DD.MM.YYYY"
- direction: string - "up" или "down" (направление загрузки)
- batchSize: number - количество записей для загрузки

Возврат: string (JSON) в формате:

```jsx
{
    "data": [
        {
            "date": "DD.MM.YYYY",
            "columns": [
                {
                    "headerId": "string",     // ID заголовка
                    "value": "string",        // Значение ячейки
                    "rowspan": number,        // Объединение строк (опционально)
                    "colspan": number,        // Объединение столбцов (опционально)
                    "color": "string",        // Цвет фона (опционально)
                    "draggable": boolean      // Можно ли перетаскивать (опционально)
                }
            ]
        }
    ]
}
```

### ФОРМАТ ПРОВАЙДЕРА ЗАГОЛОВКОВ

Возврат: string (JSON) в формате:
```jsx
{
    "headers": [
        {
            "id": "string",              // Уникальный ID заголовка
            "parentId": "string|null",   // ID родительского заголовка
            "type": "string",            // Тип узла
            "name": "string",            // Отображаемое имя
            "metadata": {
                "color": "string",         // Цвет заголовка
                "tooltip": "string",       // Подсказка (опционально)
                "workCount": number        // Количество работ (опционально)
            }
        }
    ]
}
```

### Базовая настройка

```jsx
VirtualizedTableAPI.setEditMode(true/false);
VirtualizedTableAPI.setShowFilters(true/false);
VirtualizedTableAPI.setScrollBatchSize(10);
VirtualizedTableAPI.refreshViewport()
```

### Установка провайдеров

```jsx
window.dp = async function(startDate, direction, batchSize) {...}

или

VirtualizedTableAPI.setDataProvider(async (startDate, direction, batchSize) => {
    const response = await fetch('/api/table-data', {
        method: 'POST',
        body: JSON.stringify({ startDate, direction, batchSize })
    });
    return response.text();
});




window.hp = async function() {...}

или

VirtualizedTableAPI.setHeaderProvider(async () => {
    const response = await fetch('/api/headers');
    return response.json();
});



window.onTableCellClick = function(cellDataJson) { ... }

или

VirtualizedTableAPI.setOnCellClick((cellData) => {
    console.log('Cell clicked:', cellData);
});
```
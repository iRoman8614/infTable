# Enhanced Virtualized Table

Высокопроизводительная виртуализированная таблица с поддержкой иерархических заголовков, фильтрации и бесконечного скролла.

## Основные возможности

- **Виртуализация**: Отображение только видимых строк для работы с большими объемами данных
- **Бесконечный скролл**: Динамическая загрузка данных при скролле
- **Иерархические заголовки**: Поддержка многоуровневых заголовков
- **Фильтрация**: Скрытие/показ колонок и поиск по названиям
- **Объединение ячеек**: Автоматический rowspan для одинаковых значений
- **Кастомные темы**: Настраиваемые цветовые схемы

## Использование

### Базовое использование

```jsx
import Table from './Table.jsx';

function App() {
    return (
        <Table
            maxWidth="100%"
            maxHeight="600px"
            scrollBatchSize={7}
            debug={false}
        />
    );
}
```

### С кастомным провайдером данных

```jsx
import Table, { setDataProvider } from './Table.jsx';

// Кастомный провайдер данных
const customDataProvider = async (startDate, days, leafNodes) => {
    const response = await fetch('/api/data', {
        method: 'POST',
        body: JSON.stringify({ startDate, days, nodes: leafNodes.map(n => n.id) })
    });
    
    return await response.json();
};

// Устанавливаем провайдер
setDataProvider(customDataProvider);

function App() {
    return (
        <Table
            dataProvider={customDataProvider}
            onDataLoad={(data, startDate, batchSize) => {
                console.log('Загружено данных:', data.length);
            }}
            onError={(error, context) => {
                console.error('Ошибка загрузки:', error, context);
            }}
        />
    );
}
```

### С кастомными заголовками

```jsx
const customHeaders = {
    "headers": [
        {
            "id": "department1",
            "parentId": null,
            "type": "node",
            "name": "Отдел разработки",
            "metadata": {
                "color": "#2196f3",
                "tooltip": "Основной отдел разработки",
                "workCount": 50
            }
        },
        {
            "id": "team1",
            "parentId": "department1",
            "type": "assembly",
            "name": "Команда Frontend",
            "metadata": {
                "color": "#4caf50",
                "tooltip": "Команда фронтенд разработки",
                "workCount": 15
            }
        },
        {
            "id": "developer1",
            "parentId": "team1",
            "type": "component",
            "name": "Разработчик 1",
            "metadata": {
                "color": "#ff9800",
                "tooltip": "Senior разработчик",
                "workCount": 1
            }
        }
    ]
};

function App() {
    return (
        <Table
            headerProvider={customHeaders}
        />
    );
}
```

### Создание кастомных компонентов

```jsx
import { useTableLogic, useNodeVisibility } from './hooks';
import { TableHeader, FiltersPanel } from './components';

function CustomTable(props) {
    const tableLogic = useTableLogic(props);
    const nodeVisibility = useNodeVisibility(props.treeStructure);
    
    // Ваша кастомная логика...
    
    return (
        <div>
            <FiltersPanel {...nodeVisibility} />
            <table>
                <TableHeader 
                    treeStructure={props.treeStructure}
                    nodeVisibility={nodeVisibility.nodeVisibility}
                    activeColorTheme={props.colorTheme}
                />
                {/* Ваш кастомный tbody */}
            </table>
        </div>
    );
}
```

## API Справка

### Компонент Table

| Prop | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `maxWidth` | string | '100%' | Максимальная ширина таблицы |
| `maxHeight` | string | '600px' | Максимальная высота таблицы |
| `colorTheme` | function | defaultColorTheme | Функция цветовой темы |
| `scrollBatchSize` | number | 7 | Размер батча при загрузке данных |
| `debug` | boolean | false | Показать отладочную информацию |
| `dataProvider` | function | null | Кастомный провайдер данных |
| `headerProvider` | object | null | Кастомная структура заголовков |
| `onDataLoad` | function | null | Callback при загрузке данных |
| `onError` | function | null | Callback при ошибках |

### Провайдер данных

Функция провайдера данных должна иметь следующую сигнатуру:

```javascript
async function dataProvider(startDate, days, leafNodes) {
    // startDate: строка даты в формате "DD.MM.YYYY"
    // days: количество дней для загрузки
    // leafNodes: массив листовых узлов из дерева заголовков
    
    return {
        data: [
            {
                date: "01.01.2024",
                node1: "М",
                node2: "О",
                // ... данные для каждого листового узла
            }
        ]
    };
}
```

### Структура заголовков

```javascript
{
    "headers": [
        {
            "id": "unique_id",           // Уникальный идентификатор
            "parentId": "parent_id",     // ID родителя (null для корневых)
            "type": "node",              // Тип узла
            "name": "Отображаемое имя",  // Название для отображения
            "metadata": {
                "color": "#2196f3",      // Цвет заголовка
                "tooltip": "Подсказка",  // Tooltip (опционально)
                "workCount": 50          // Количество (опционально)
            }
        }
    ]
}
```

## Утилиты

### Работа с датами

```javascript
import { formatDate, parseDateString } from './utils/dateUtils.js';

const date = new Date();
const formatted = formatDate(date); // "01.01.2024"
const parsed = parseDateString("01.01.2024"); // Date object
```

### Управление провайдером данных

```javascript
import { setDataProvider, getDataProvider } from './utils/dataProcessing.js';

// Установка глобального провайдера
setDataProvider(myCustomProvider);

// Получение текущего провайдера
const currentProvider = getDataProvider();
```

## Производительность

Компонент оптимизирован для работы с большими объемами данных:

- Виртуализация строк - отображаются только видимые элементы
- Интеллектуальный throttling скролла
- Батчевая загрузка данных
- Кэширование обработанных данных
- Компенсация скролла при добавлении данных

Рекомендуемые настройки для больших таблиц:
- `scrollBatchSize`: 10-20 для быстрых источников данных
- Используйте мемоизацию в кастомных провайдерах данных
- Оптимизируйте цветовые функции для простых случаев
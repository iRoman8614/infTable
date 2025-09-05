# VirtualizedTable

Высокопроизводительная виртуализированная таблица для React с поддержкой бесконечного скролла, динамической загрузки данных и объединения ячеек.

## Особенности

-  **Виртуализация** - отображение только видимых строк для высокой производительности
- ️ **Бесконечный скролл** - автоматическая подгрузка данных при прокрутке
-  **Батчевая загрузка** - оптимизированная загрузка данных порциями
-  **Объединение ячеек** - автоматический rowspan для одинаковых значений
-  **Кастомизация** - гибкая настройка цветов и стилей
-  **Адаптивность** - корректная работа на разных размерах экрана
-  **Web Components** - возможность использования как веб-компонент

## Системные требования

### Для React проектов
- **React**: 18.0.0 или выше
- **React DOM**: 18.0.0 или выше
- **Браузеры**: Chrome 88+, Firefox 78+, Safari 14+, Edge 88+

### Для веб-компонентов
- **Браузеры с поддержкой Custom Elements**: Chrome 54+, Firefox 63+, Safari 10.1+, Edge 79+
- **ES6+ поддержка** для современных браузеров

## Быстрый старт

### Установка в React проект

```bash
# Клонирование репозитория
git clone https://github.com/your-org/virtualized-table.git
cd virtualized-table

# Установка зависимостей
npm install

# Запуск в режиме разработки  
npm start

# Сборка для продакшена
npm run build
```

### Использование как React компонент

```jsx
import { Table } from './components/VirtualizedTable';

function App() {
  const customDataProvider = async (startDate, days) => {
    const response = await fetch(`/api/data?start=${startDate}&days=${days}`);
    return await response.json();
  };

  return (
    <div>
      <h1>Расписание оборудования</h1>
      <Table
        maxHeight="600px"
        dataProvider={customDataProvider}
        scrollBatchSize={7}
        debug={false}
      />
    </div>
  );
}
```

### Сборка веб-компонента

```bash
# Сборка веб-компонента
npm run build:webcomponent

# Результат: dist/virtualized-table.js (готов к использованию)
```

## Интеграция веб-компонента

### В HTML страницу

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Виртуализированная таблица</title>
</head>
<body>
    <h1>Управление оборудованием</h1>
    
    <!-- Веб-компонент таблицы -->
    <virtualized-table
        max-height="600px"
        scroll-batch-size="7"
        debug="false">
    </virtualized-table>

    <!-- Подключение скрипта -->
    <script src="path/to/virtualized-table.js"></script>
    
    <script>
        // Программное управление
        const table = document.querySelector('virtualized-table');
        table.setAttribute('max-height', '800px');
        table.setAttribute('debug', 'true');
    </script>
</body>
</html>
```

### CDN подключение

```html
<!-- Подключение с CDN (замените на ваш URL) -->
<script src="https://cdn.yourcompany.com/virtualized-table@1.0.0/dist/virtualized-table.js"></script>

<virtualized-table
    max-height="500px"
    scroll-batch-size="10">
</virtualized-table>
```

### В Angular проект

```typescript
// app.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <virtualized-table
      max-height="600px"
      [scroll-batch-size]="batchSize"
      [debug]="isDebug">
    </virtualized-table>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {
  batchSize = 7;
  isDebug = false;
}
```

```typescript
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ... остальная конфигурация
})
export class AppModule { }
```

### В Vue.js проект

```vue
<template>
  <div>
    <h1>Таблица оборудования</h1>
    <virtualized-table
      :max-height="tableHeight"
      :scroll-batch-size="batchSize"
      :debug="debugMode">
    </virtualized-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableHeight: '600px',
      batchSize: 7,
      debugMode: false
    }
  },
  mounted() {
    // Загружаем веб-компонент если еще не загружен
    if (!customElements.get('virtualized-table')) {
      import('./path/to/virtualized-table.js');
    }
  }
}
</script>
```

## Конфигурация

### Атрибуты веб-компонента

Веб-компонент поддерживает следующие атрибуты:

| Атрибут | Тип | По умолчанию | Описание |
|---------|-----|--------------|----------|
| `max-width` | string | '100%' | Максимальная ширина таблицы |
| `max-height` | string | '600px' | Максимальная высота таблицы |
| `scroll-batch-size` | string | '7' | Размер батча для загрузки данных |
| `debug` | string | 'false' | Показать отладочную информацию |
| `color-theme-name` | string | 'default' | Название цветовой темы |

```html
<virtualized-table
    max-width="1200px"
    max-height="800px"
    scroll-batch-size="10"
    debug="true"
    color-theme-name="default">
</virtualized-table>
```

### Переменные окружения

```bash
# .env файл
REACT_APP_API_BASE_URL=https://api.yourcompany.com
REACT_APP_BATCH_SIZE=7
REACT_APP_DEBUG_MODE=false
```

## Кастомизация

### CSS переменные для веб-компонента

```css
virtualized-table {
  /* Цвета */
  --table-header-bg: #e3f2fd;
  --table-border-color: #ddd;
  --table-row-height: 40px;
  
  /* Шрифты */
  --table-font-family: 'Arial', sans-serif;
  --table-font-size: 14px;
  
  /* Статусы */
  --status-m-color: #c8e6c9;  /* Монтаж */
  --status-o-color: #ffcdd2;  /* Остановка */
  --status-p-color: #fff3e0;  /* Подготовка */
  --status-pr-color: #e1bee7; /* Проверка */
  --status-r-color: #b3e5fc;  /* Работа */
}
```

### Программное изменение атрибутов

```javascript
const table = document.querySelector('virtualized-table');

// Изменение размера
table.setAttribute('max-height', '900px');

// Включение отладки
table.setAttribute('debug', 'true');

// Изменение размера батча
table.setAttribute('scroll-batch-size', '15');
```

## Настройка провайдера данных

### Глобальная настройка провайдера

Вы можете установить провайдер данных глобально:

```javascript
import { setDataProvider } from './path/to/table';

const customDataProvider = async (startDate, days) => {
  try {
    const response = await fetch(`/api/equipment-schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        startDate,
        days,
        includeWeekends: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    throw error;
  }
};

// Установка глобального провайдера
setDataProvider(customDataProvider);
```

### REST API

```javascript
const restDataProvider = async (startDate, days) => {
  try {
    const response = await fetch(`/api/equipment-schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        startDate,
        days,
        includeWeekends: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    throw error;
  }
};
```

### GraphQL

```javascript
const graphqlDataProvider = async (startDate, days) => {
  const query = `
    query GetEquipmentSchedule($startDate: String!, $days: Int!) {
      equipmentSchedule(startDate: $startDate, days: $days) {
        date
        aggregates {
          agr1 agr2 agr3
        }
        stages {
          stage1 { equipment status }
          stage2 { equipment status }
          stage3 { equipment status }
        }
      }
    }
  `;

  const response = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { startDate, days }
    })
  });

  const result = await response.json();
  
  // Трансформация данных в нужный формат
  return {
    data: result.data.equipmentSchedule.map(transformData)
  };
};
```

### WebSocket для реального времени

```javascript
class RealtimeDataProvider {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.cache = new Map();
    
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.updateCache(update);
    };
  }

  async getData(startDate, days) {
    // Проверяем кэш
    const cacheKey = `${startDate}-${days}`;
    if (this.cache.has(cacheKey)) {
      return { data: this.cache.get(cacheKey) };
    }

    // Запрашиваем данные
    const response = await fetch(`/api/data?start=${startDate}&days=${days}`);
    const data = await response.json();
    
    this.cache.set(cacheKey, data.data);
    return data;
  }

  updateCache(update) {
    // Обновляем кэш при получении real-time обновлений
    // Логика обновления...
  }
}
```

## Развертывание

### Статический хостинг

```bash
# Сборка для продакшена
npm run build

# Результат в папке build/
# Загрузите содержимое на ваш хостинг
```

### Docker

```dockerfile
# Dockerfile
FROM nginx:alpine

COPY build/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Сборка Docker образа
docker build -t virtualized-table .

# Запуск контейнера
docker run -p 8080:80 virtualized-table
```

### CDN развертывание

```bash
# Сборка и оптимизация для CDN
npm run build:cdn

# Результат оптимизирован для CDN:
# - Минификация
# - Gzip сжатие
# - Source maps
# - Версионирование файлов
```

## Troubleshooting

### Возможные проблемы

| Проблема | Симптомы | Решение |
|----------|----------|---------|
| Медленная прокрутка | Лаги при скролле | Уменьшите `scroll-batch-size` |
| Не загружаются данные | Пустая таблица | Проверьте провайдер данных |
| Неправильные цвета | Белые ячейки | Проверьте функцию `colorTheme` |
| Ошибка 404 в веб-компоненте | Не найден JS файл | Проверьте путь к скрипту |

### Включение отладки

```javascript
// Для React компонента
<Table debug={true} />

// Для веб-компонента
<virtualized-table debug="true"></virtualized-table>

// Программно
const table = document.querySelector('virtualized-table');
table.setAttribute('debug', 'true');
```

### Проверка загрузки веб-компонента

```javascript
// Проверка что компонент зарегистрирован
if (customElements.get('virtualized-table')) {
  console.log('Веб-компонент загружен успешно');
} else {
  console.error('Веб-компонент не найден');
}
```
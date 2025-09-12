// Основные экспорты
export { Table as default } from './Table.jsx';
export { Table } from './Table.jsx';

// Компоненты (для кастомизации)
export { TableHeader } from './components/TableHeader.jsx';
export { FiltersPanel } from './components/FiltersPanel.jsx';

// Хуки (для создания кастомных компонентов)
export { useTableLogic } from './hooks/useTableLogic.js';
export { useNodeVisibility } from './hooks/useNodeVisibility.js';

// Утилиты - только базовые, встроенные в компоненты
// (убрал импорты внешних файлов чтобы избежать проблем со сборкой)

// Простые утилиты даты (встроенные)
export const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

export const parseDateString = (dateString) => {
    const [day, month, year] = dateString.split('.').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
};

// Простой провайдер данных по умолчанию
export const setDataProvider = (provider) => {
    if (typeof window !== 'undefined') {
        window.__tableDataProvider = provider;
        console.log('[TableIndex] Data provider установлен');
    }
};

export const getDataProvider = () => {
    if (typeof window !== 'undefined') {
        return window.__tableDataProvider;
    }
    return null;
};

// Простой провайдер заголовков
export const setHeaderProvider = (provider) => {
    if (typeof window !== 'undefined') {
        window.__tableHeaderProvider = provider;
        console.log('[TableIndex] Header provider установлен');
    }
};

export const getHeaderProvider = () => {
    if (typeof window !== 'undefined') {
        return window.__tableHeaderProvider;
    }
    return null;
};

// Дефолтные заголовки (встроенные)
export const defaultHeaders = {
    headers: [
        {
            id: "default1",
            parentId: null,
            name: "Колонка 1",
            metadata: { color: "#4caf50" }
        },
        {
            id: "default2",
            parentId: null,
            name: "Колонка 2",
            metadata: { color: "#ff9800" }
        },
        {
            id: "default3",
            parentId: null,
            name: "Колонка 3",
            metadata: { color: "#f44336" }
        },
        {
            id: "default4",
            parentId: null,
            name: "Колонка 4",
            metadata: { color: "#2196f3" }
        }
    ]
};

console.log('[TableIndex] Модуль таблицы инициализирован');
// Основные экспорты
export { Table as default } from './Table.jsx';
export { Table } from './Table.jsx';

// Компоненты (для кастомизации)
export { TableHeader } from './components/TableHeader.jsx';
export { FiltersPanel } from './components/FiltersPanel.jsx';

// Хуки (для создания кастомных компонентов)
export { useTableLogic } from './hooks/useTableLogic.js';
export { useNodeVisibility } from './hooks/useNodeVisibility.js';
export { useDragAndDrop } from './hooks/useDragAndDrop.js';
export { useGlobalClickHandlers, useHeadersLoader } from './hooks/useTableHelpers';

// Утилиты
export { formatDate, parseDateString } from './utils/dateUtils.js';
export { getContrastTextColor } from './utils/ContrastTextColor.js';

// Глобальные провайдеры данных (объединено из dataProcessing.js)
let customDataProvider = null;

export const setDataProvider = (provider) => {
    customDataProvider = provider;
};

export const getDataProvider = () => {
    return customDataProvider;
};
/**
 * Утилиты для работы с датами
 */

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

// Экспортируем утилиты глобально
if (typeof window !== 'undefined') {
    window.TableUtils = {
        parseDateString,
        formatDate
    };
}
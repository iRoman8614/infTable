/**
 * Глобальный провайдер заголовков
 */
let headerProvider = null;

/**
 * Устанавливает провайдер заголовков
 * @param {Function} provider - Функция, возвращающая объект с заголовками
 */
export const setHeaderProvider = (provider) => {
    if (typeof provider !== 'function') {
        console.warn('[HeaderProvider] Провайдер должен быть функцией');
        return false;
    }

    console.log('[HeaderProvider] Установлен новый провайдер заголовков');
    headerProvider = provider;
    return true;
};

/**
 * Получает текущий провайдер заголовков
 * @returns {Function|null}
 */
export const getHeaderProvider = () => {
    return headerProvider;
};

/**
 * Получает структуру заголовков из провайдера
 * @returns {Object} Объект со структурой заголовков
 */
export const getHeadersStructure = () => {
    if (!headerProvider) {
        console.warn('[HeaderProvider] Провайдер заголовков не установлен');
        return null;
    }

    try {
        const structure = headerProvider();

        // Валидация структуры
        if (!structure || typeof structure !== 'object') {
            console.error('[HeaderProvider] Провайдер должен возвращать объект');
            return null;
        }

        if (!structure.headers || !Array.isArray(structure.headers)) {
            console.error('[HeaderProvider] Структура должна содержать поле headers как массив');
            return null;
        }

        console.log(`[HeaderProvider] Загружено ${structure.headers.length} заголовков`);
        return structure;

    } catch (error) {
        console.error('[HeaderProvider] Ошибка при вызове провайдера:', error);
        return null;
    }
};

/**
 * Очищает провайдер заголовков
 */
export const clearHeaderProvider = () => {
    console.log('[HeaderProvider] Провайдер заголовков очищен');
    headerProvider = null;
};
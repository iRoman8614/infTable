// Глобальный провайдер данных
let customDataProvider = null;

export const setDataProvider = (provider) => {
    customDataProvider = provider;
    console.log('[DataProvider] Установлен кастомный провайдер данных');
};

export const getDataProvider = () => {
    return customDataProvider;
};
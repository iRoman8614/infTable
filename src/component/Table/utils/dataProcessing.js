// Глобальный провайдер данных
let customDataProvider = null;

export const setDataProvider = (provider) => {
    customDataProvider = provider;
};

export const getDataProvider = () => {
    return customDataProvider;
};
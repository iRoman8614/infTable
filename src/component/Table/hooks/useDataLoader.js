import { useCallback, useRef } from 'react';

/**
 * Хук для загрузки данных при скролле
 * @param {Function} dataProvider - Callback функция для загрузки данных
 * @param {Function} onDataLoaded - Callback после успешной загрузки
 * @param {Function} onError - Callback при ошибке
 */
export const useDataLoader = (dataProvider, onDataLoaded, onError) => {
    const fetchingPromises = useRef({});
    const isLoadingRef = useRef(false);

    /**
     * Загружает батч данных
     * @param {string} startDate - Дата в формате DD.MM.YYYY
     * @param {string} direction - 'up' или 'down'
     * @param {number} batchSize - Количество дат для загрузки
     */
    const loadBatch = useCallback(async (startDate, direction, batchSize) => {
        const batchKey = `${startDate}:${direction}:${batchSize}`;

        // Если уже идет загрузка этого батча, возвращаем существующий promise
        if (fetchingPromises.current[batchKey]) {
            console.log(`[DataLoader] Батч уже загружается: ${batchKey}`);
            return fetchingPromises.current[batchKey];
        }

        console.log(`[DataLoader] Начало загрузки батча: date=${startDate}, direction=${direction}, size=${batchSize}`);

        const promise = (async () => {
            try {
                isLoadingRef.current = true;

                // Вызываем dataProvider
                let jsonString;
                if (!dataProvider) {
                    throw new Error('dataProvider не установлен');
                }

                if (dataProvider.constructor.name === 'AsyncFunction') {
                    jsonString = await dataProvider(startDate, direction, batchSize);
                } else {
                    jsonString = dataProvider(startDate, direction, batchSize);
                }

                if (typeof jsonString !== 'string') {
                    throw new Error('dataProvider должен возвращать JSON-строку');
                }

                // Парсим JSON
                let batchData;
                try {
                    batchData = JSON.parse(jsonString);
                } catch (parseError) {
                    throw new Error(`Ошибка парсинга JSON: ${parseError.message}`);
                }

                // Извлекаем массив данных
                let dataArray;
                if (batchData && batchData.data && Array.isArray(batchData.data)) {
                    dataArray = batchData.data;
                } else if (Array.isArray(batchData)) {
                    dataArray = batchData;
                } else {
                    throw new Error('dataProvider вернул некорректный формат. Ожидается: { data: [...] } или [...]');
                }

                console.log(`[DataLoader] Загружено ${dataArray.length} записей`);

                // Вызываем callback после загрузки
                if (onDataLoaded) {
                    onDataLoaded(dataArray, startDate, direction, batchSize);
                }

                return { data: dataArray };

            } catch (error) {
                console.error('[DataLoader] Ошибка загрузки данных:', error);

                if (onError) {
                    onError(error, { startDate, direction, batchSize });
                }

                throw error;
            } finally {
                isLoadingRef.current = false;
            }
        })();

        // Очищаем promise после завершения
        promise.finally(() => {
            delete fetchingPromises.current[batchKey];
        });

        fetchingPromises.current[batchKey] = promise;
        return promise;
    }, [dataProvider, onDataLoaded, onError]);

    const isLoading = useCallback(() => {
        return isLoadingRef.current;
    }, []);

    return {
        loadBatch,
        isLoading,
    };
};

export default useDataLoader;
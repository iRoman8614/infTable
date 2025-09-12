import { formatDate, parseDateString } from './dateUtils.js';

/**
 * Интерфейс для провайдера данных
 */
let customDataProvider = null;

/**
 * Дефолтный провайдер данных - заполняет все ячейки буквой "М"
 */
export const defaultDataProvider = async (startDate, days, leafNodes) => {
    console.log(`[EnhancedTable] Загружаем батч: ${startDate} (+${days} дней), листовых узлов: ${leafNodes.length}`);
    await new Promise(resolve => setTimeout(resolve, 300));

    const startDateObj = parseDateString(startDate);
    const batchData = [];

    // Возможные значения статусов
    const statusValues = ["М", "О", "П", "ПР", "Р"];
    const randomStatus = () => statusValues[Math.floor(Math.random() * statusValues.length)];

    for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDateObj);
        currentDate.setUTCDate(startDateObj.getUTCDate() + i);

        const dayData = {
            date: formatDate(currentDate),
            timestamp: Date.now()
        };

        // Заполняем данные для всех листовых узлов
        leafNodes.forEach(node => {
            // По умолчанию "М", но иногда случайные статусы для разнообразия
            dayData[node.id] = Math.random() > 0.8 ? randomStatus() : 'М';
        });

        batchData.push(dayData);
    }

    return { data: batchData };
};

/**
 * Обработка данных для таблицы с вычислением rowspan
 */
export function processDataForTable(data, leafNodes) {
    if (!data || data.length === 0 || !leafNodes.length) {
        return { processedData: [], leafElements: [] };
    }

    const processedData = data.map(row => {
        const processed = {
            date: row.date,
            elements: {}
        };

        leafNodes.forEach(node => {
            processed.elements[node.id] = {
                status: row[node.id] || 'М',
                rowspan: 1,
                displayed: true
            };
        });

        return processed;
    });

    // Вычисляем rowspan для каждого элемента
    leafNodes.forEach(node => {
        let i = 0;
        while (i < processedData.length) {
            const currentRow = processedData[i];
            const currentStatus = currentRow.elements[node.id]?.status;

            // Для статусов 'М' и 'Р' не объединяем ячейки
            if (currentStatus === 'М' || currentStatus === 'Р' || currentStatus === undefined) {
                i++;
                continue;
            }

            let spanCount = 1;
            let j = i + 1;

            // Ищем следующие строки с тем же статусом
            while (j < processedData.length) {
                const nextRow = processedData[j];
                const nextStatus = nextRow.elements[node.id]?.status;

                if (nextStatus === currentStatus) {
                    spanCount++;
                    nextRow.elements[node.id].displayed = false;
                    j++;
                } else {
                    break;
                }
            }

            if (spanCount > 1) {
                currentRow.elements[node.id].rowspan = spanCount;
            }
            i = j;
        }
    });

    return { processedData, leafElements: leafNodes.map(n => n.id) };
}

// Публичное API
export const setDataProvider = (provider) => {
    customDataProvider = provider;
};

export const getDataProvider = () => {
    return customDataProvider || defaultDataProvider;
};
import { formatDate, parseDateString } from './dateUtils.js';

/**
 * Async провайдер данных - новый формат с направлением
 */
export const defaultDataProvider = async (startDate, direction, batchSize) => {
    console.log(`[DataProvider] Загружаем батч: ${startDate}, направление: ${direction}, размер: ${batchSize}`);

    // Имитация задержки сервера
    await new Promise(resolve => setTimeout(resolve, 200));

    const startDateObj = parseDateString(startDate);
    const batchData = [];

    // Определяем диапазон дат в зависимости от направления
    let startDay = 0;
    let endDay = batchSize;

    if (direction === 'backward') {
        startDay = -batchSize;
        endDay = 0;
    }

    // Возможные значения статусов
    const statusValues = ["М", "О", "П", "ПР", "Р"];
    const randomStatus = () => statusValues[Math.floor(Math.random() * statusValues.length)];

    // Генерируем данные в новом формате
    for (let i = startDay; i < endDay; i++) {
        const currentDate = new Date(startDateObj);
        currentDate.setUTCDate(startDateObj.getUTCDate() + i);

        const dayData = {
            date: formatDate(currentDate),
            columns: [
                // Генерируем ТОЛЬКО для листовых узлов (которые отображаются в таблице)
                { headerId: "station1", value: randomStatus() },
                { headerId: "station2", value: randomStatus() },
                { headerId: "station3", value: randomStatus() },
                { headerId: "station4", value: randomStatus() },
                { headerId: "station5", value: randomStatus() },
                { headerId: "machine1", value: randomStatus() },
                { headerId: "machine2", value: randomStatus() },
                { headerId: "pcb_line1", value: randomStatus() },
                { headerId: "pcb_line2", value: randomStatus() }
            ]
        };

        batchData.push(dayData);
    }

    // Для up направления сортируем по возрастанию дат
    if (direction === 'up') {
        batchData.sort((a, b) => parseDateString(a.date) - parseDateString(b.date));
    }

    console.log(`[DataProvider] Возвращено ${batchData.length} записей в новом формате (направление: ${direction === 'up' ? 'даты раньше' : 'даты позже'})`);
    return { data: batchData };
};

/**
 * Преобразование нового формата данных в старый для совместимости
 */
export function transformDataFormat(newFormatData) {
    if (!newFormatData || !newFormatData.data || !Array.isArray(newFormatData.data)) {
        return { data: [] };
    }

    const transformedData = newFormatData.data.map(dayData => {
        const oldFormatRow = {
            date: dayData.date,
            timestamp: Date.now()
        };

        // Преобразуем columns в старый формат
        if (dayData.columns && Array.isArray(dayData.columns)) {
            dayData.columns.forEach(column => {
                oldFormatRow[column.headerId] = column.value;
            });
        }

        return oldFormatRow;
    });

    return { data: transformedData };
}

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

// Глобальный провайдер данных
let customDataProvider = null;

export const setDataProvider = (provider) => {
    customDataProvider = provider;
    console.log('[DataProvider] Установлен кастомный провайдер данных');
};

export const getDataProvider = () => {
    const provider = customDataProvider || defaultDataProvider;

    console.log('[DataProvider] Возвращаем провайдер с новым API');
    return provider;
};
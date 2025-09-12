// import { formatDate, parseDateString } from './dateUtils.js';
//
// /**
//  * Интерфейс для провайдера данных
//  */
// let customDataProvider = null;
//
// /**
//  * Дефолтный провайдер данных - заполняет все ячейки буквой "М"
//  */
// export const defaultDataProvider = async (startDate, days, leafNodes) => {
//     console.log(`[EnhancedTable] Загружаем батч: ${startDate} (+${days} дней), листовых узлов: ${leafNodes.length}`);
//     await new Promise(resolve => setTimeout(resolve, 300));
//
//     const startDateObj = parseDateString(startDate);
//     const batchData = [];
//
//     // Возможные значения статусов
//     const statusValues = ["М", "О", "П", "ПР", "Р"];
//     const randomStatus = () => statusValues[Math.floor(Math.random() * statusValues.length)];
//
//     for (let i = 0; i < days; i++) {
//         const currentDate = new Date(startDateObj);
//         currentDate.setUTCDate(startDateObj.getUTCDate() + i);
//
//         const dayData = {
//             date: formatDate(currentDate),
//             timestamp: Date.now()
//         };
//
//         // Заполняем данные для всех листовых узлов
//         leafNodes.forEach(node => {
//             // По умолчанию "М", но иногда случайные статусы для разнообразия
//             dayData[node.id] = Math.random() > 0.8 ? randomStatus() : 'М';
//         });
//
//         batchData.push(dayData);
//     }
//
//     return { data: batchData };
// };
//
// /**
//  * Обработка данных для таблицы с вычислением rowspan
//  */
// export function processDataForTable(data, leafNodes) {
//     if (!data || data.length === 0 || !leafNodes.length) {
//         return { processedData: [], leafElements: [] };
//     }
//
//     const processedData = data.map(row => {
//         const processed = {
//             date: row.date,
//             elements: {}
//         };
//
//         leafNodes.forEach(node => {
//             processed.elements[node.id] = {
//                 status: row[node.id] || 'М',
//                 rowspan: 1,
//                 displayed: true
//             };
//         });
//
//         return processed;
//     });
//
//     // Вычисляем rowspan для каждого элемента
//     leafNodes.forEach(node => {
//         let i = 0;
//         while (i < processedData.length) {
//             const currentRow = processedData[i];
//             const currentStatus = currentRow.elements[node.id]?.status;
//
//             // Для статусов 'М' и 'Р' не объединяем ячейки
//             if (currentStatus === 'М' || currentStatus === 'Р' || currentStatus === undefined) {
//                 i++;
//                 continue;
//             }
//
//             let spanCount = 1;
//             let j = i + 1;
//
//             // Ищем следующие строки с тем же статусом
//             while (j < processedData.length) {
//                 const nextRow = processedData[j];
//                 const nextStatus = nextRow.elements[node.id]?.status;
//
//                 if (nextStatus === currentStatus) {
//                     spanCount++;
//                     nextRow.elements[node.id].displayed = false;
//                     j++;
//                 } else {
//                     break;
//                 }
//             }
//
//             if (spanCount > 1) {
//                 currentRow.elements[node.id].rowspan = spanCount;
//             }
//             i = j;
//         }
//     });
//
//     return { processedData, leafElements: leafNodes.map(n => n.id) };
// }
//
// // Публичное API
// export const setDataProvider = (provider) => {
//     customDataProvider = provider;
// };
//
// export const getDataProvider = () => {
//     return customDataProvider || defaultDataProvider;
// };

import { formatDate, parseDateString } from './dateUtils.js';

/**
 * Дефолтный провайдер данных - теперь async и возвращает новый формат
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

    // Генерируем данные в новом формате
    for (let i = startDay; i < endDay; i++) {
        const currentDate = new Date(startDateObj);
        currentDate.setUTCDate(startDateObj.getUTCDate() + i);

        const dayData = {
            date: formatDate(currentDate),
            columns: [
                // Заполняем все ячейки значением 'М' (как требовалось)
                { headerId: "station1", value: "М" },
                { headerId: "station2", value: "М" },
                { headerId: "station3", value: "М" },
                { headerId: "station4", value: "М" },
                { headerId: "station5", value: "М" },
                { headerId: "machine1", value: "М" },
                { headerId: "machine2", value: "М" },
                { headerId: "pcb_line1", value: "М" },
                { headerId: "pcb_line2", value: "М" }
            ]
        };

        batchData.push(dayData);
    }

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
    // Возвращаем обертку для совместимости со старым API
    const provider = customDataProvider || defaultDataProvider;

    return async (startDate, days, leafNodes) => {
        console.log(`[DataProvider] Адаптация вызова: startDate=${startDate}, days=${days}, leafNodes=${leafNodes.length}`);

        try {
            // Вызываем новый API провайдера
            const newFormatResult = await provider(startDate, 'forward', days);

            // Преобразуем в старый формат для совместимости
            const oldFormatResult = transformDataFormat(newFormatResult);

            return oldFormatResult;
        } catch (error) {
            console.error('[DataProvider] Ошибка при вызове провайдера:', error);
            throw error;
        }
    };
};
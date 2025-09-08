// import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
//
// /**
//  * VIRTUALIZED TABLE COMPONENT
//  *
//  * Высокопроизводительная виртуализированная таблица с поддержкой:
//  * - Бесконечного скролла (infinite scroll)
//  * - Динамической загрузки данных батчами
//  * - Объединения ячеек (rowspan) для одинаковых значений
//  * - Кастомных цветовых тем
//  * - Отладочной информации
//  *
//  * @version 1.0.0
//  * @author Roman Baranovskii
//  */
//
// /**
//  * Интерфейс для провайдера данных
//  * Пользователь должен реализовать эту функцию для загрузки данных
//  *
//  * @param {string} startDate - Начальная дата в формате 'ДД.ММ.ГГГГ'
//  * @param {number} days - Количество дней для загрузки
//  * @returns {Promise<{data: Array}>} Промис с массивом данных
//  *
//  * Формат данных для каждого дня:
//  * {
//  *   date: "05.09.2025",
//  *   agr1: 5,                    // Числовые значения для агрегатов
//  *   agr2: 3,
//  *   agr3?: 8,                   // Опциональные агрегаты
//  *   stage1: [                   // Массивы объектов для стадий
//  *     {"20ГПА-1-1": "М"},
//  *     {"20ГПА-1-2": "О"},
//  *     // ...
//  *   ],
//  *   stage2: [...],
//  *   stage3: [...]
//  * }
//  */
// let customDataProvider = null;
//
// /**
//  * Дефолтный провайдер данных для демонстрации
//  * В продакшене замените на свою реализацию
//  */
// const defaultDataProvider = async (startDate, days) => {
//     console.log(`[VirtualizedTable] Загружаем батч: ${startDate} (+${days} дней)`);
//     await new Promise(resolve => setTimeout(resolve, 300));
//
//     const stagesValues = ["М", "М", "М", "М", "М", "М", "О", "П", "ПР", "Р"];
//     const randomStageValue = () => stagesValues[Math.floor(Math.random() * stagesValues.length)];
//
//     const generateDayData = (dateStr) => {
//         // Генерация структуры данных для одного дня
//         let stage1 = [
//             {"20ГПА-1-2": randomStageValue()},
//             {"20ГПА-1-3": randomStageValue()},
//             {"20ГПА-1-1": randomStageValue()},
//             {"20ГПА-1-4": randomStageValue()},
//         ];
//         let stage2 = [
//             {"20ГПА-2-2": randomStageValue()},
//             {"20ГПА-2-3": randomStageValue()},
//             {"20ГПА-2-1": randomStageValue()},
//             {"20ГПА-2-4": randomStageValue()},
//         ];
//         let stage3 = [
//             {"20ГПА-3-2": randomStageValue()},
//             {"20ГПА-3-3": randomStageValue()},
//             {"20ГПА-3-1": randomStageValue()},
//             {"20ГПА-3-4": randomStageValue()},
//         ];
//
//         const result = {
//             date: dateStr,
//             agr1: Math.floor(Math.random() * 10),
//             agr2: Math.floor(Math.random() * 10),
//             stage1: stage1,
//             stage2: stage2,
//             stage3: stage3
//         };
//
//         // Опциональные агрегаты
//         if (Math.random() > 0.7) {
//             result.agr3 = Math.floor(Math.random() * 10);
//         }
//
//         return result;
//     };
//
//     const startDateObj = parseDateString(startDate);
//     const batchData = [];
//
//     for (let i = 0; i < days; i++) {
//         const currentDate = new Date(startDateObj);
//         currentDate.setUTCDate(startDateObj.getUTCDate() + i);
//         const dateStr = formatDate(currentDate);
//         batchData.push(generateDayData(dateStr));
//     }
//
//     return { data: batchData };
// };
//
// /**
//  * Обработка данных для таблицы с вычислением rowspan
//  * Автоматически группирует одинаковые значения в соседних строках
//  *
//  * @param {Array} data - Массив сырых данных
//  * @returns {Object} Обработанные данные с информацией о rowspan
//  */
// function processDataForTable(data) {
//     if (!data || data.length === 0) {
//         return { processedData: [], allElements: [], stageElements: {}, agrElements: [] };
//     }
//
//     // Сбор всех уникальных элементов
//     const allElements = new Set();
//     const stageElements = {};
//     const agrKeys = new Set();
//
//     data.forEach(row => {
//         for (const key in row) {
//             if (key.startsWith('stage') && Array.isArray(row[key])) {
//                 const stageName = key;
//                 if (!stageElements[stageName]) {
//                     stageElements[stageName] = new Set();
//                 }
//
//                 row[key].forEach(item => {
//                     const elementName = Object.keys(item)[0];
//                     allElements.add(elementName);
//                     stageElements[stageName].add(elementName);
//                 });
//             } else if (key.startsWith('agr')) {
//                 agrKeys.add(key);
//                 allElements.add(key);
//             }
//         }
//     });
//
//     const sortedAllElements = Array.from(allElements).sort();
//     const sortedAgrElements = Array.from(agrKeys).sort();
//
//     // Создание базовой структуры для каждой строки
//     const processedData = data.map(row => {
//         const processed = {
//             date: row.date,
//             elements: {}
//         };
//
//         // Инициализация всех элементов значениями по умолчанию
//         sortedAllElements.forEach(elementName => {
//             processed.elements[elementName] = {
//                 status: '-',
//                 rowspan: 1,
//                 displayed: true
//             };
//         });
//
//         // Заполнение реальными данными
//         for (const key in row) {
//             if (key.startsWith('stage') && Array.isArray(row[key])) {
//                 row[key].forEach(item => {
//                     const elementName = Object.keys(item)[0];
//                     const status = item[elementName];
//                     if (processed.elements[elementName]) {
//                         processed.elements[elementName].status = status;
//                     }
//                 });
//             } else if (key.startsWith('agr')) {
//                 if (processed.elements[key]) {
//                     processed.elements[key].status = row[key];
//                 }
//             }
//         }
//
//         return processed;
//     });
//
//     // Вычисление rowspan для объединения ячеек
//     sortedAllElements.forEach(elementName => {
//         // Агрегаты не объединяются
//         if (elementName.startsWith('agr')) {
//             processedData.forEach(row => {
//                 if (row.elements[elementName]) {
//                     row.elements[elementName].rowspan = 1;
//                     row.elements[elementName].displayed = true;
//                 }
//             });
//             return;
//         }
//
//         // Сброс настроек отображения
//         processedData.forEach(row => {
//             if (row.elements[elementName]) {
//                 row.elements[elementName].rowspan = 1;
//                 row.elements[elementName].displayed = true;
//             }
//         });
//
//         // Поиск и группировка одинаковых значений
//         let i = 0;
//         while (i < processedData.length) {
//             const currentRow = processedData[i];
//             const currentStatus = currentRow.elements[elementName]?.status;
//
//             // Статусы 'М' и 'Р' не объединяются
//             if (currentStatus === 'М' || currentStatus === 'Р' || currentStatus === '-' || currentStatus === undefined) {
//                 i++;
//                 continue;
//             }
//
//             // Подсчет количества подряд идущих одинаковых статусов
//             let spanCount = 1;
//             let j = i + 1;
//
//             while (j < processedData.length) {
//                 const nextRow = processedData[j];
//                 const nextStatus = nextRow.elements[elementName]?.status;
//
//                 if (nextStatus === currentStatus) {
//                     spanCount++;
//                     nextRow.elements[elementName].displayed = false; // Скрыть дублирующиеся ячейки
//                     j++;
//                 } else {
//                     break;
//                 }
//             }
//
//             // Установка rowspan для первой ячейки группы
//             if (spanCount > 1) {
//                 currentRow.elements[elementName].rowspan = spanCount;
//             }
//             i = j;
//         }
//     });
//
//     return { processedData, sortedAllElements, stageElements, agrElements: sortedAgrElements };
// }
// /**
//  * Утилиты для работы с датами
//  */
// const formatDate = (date) => {
//     return date.toLocaleDateString('ru-RU', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric'
//     });
// };
//
// const parseDateString = (dateString) => {
//     const [day, month, year] = dateString.split('.').map(Number);
//     return new Date(Date.UTC(year, month - 1, day));
// };
//
// /**
//  * Оптимизированная throttle функция с возможностью принудительного выполнения
//  */
// const smartThrottle = (func, limit) => {
//     let lastFunc;
//     let lastRan;
//     let lastArgs;
//
//     const throttled = function(...args) {
//         const context = this;
//         lastArgs = args;
//
//         if (!lastRan) {
//             func.apply(context, args);
//             lastRan = Date.now();
//         } else {
//             clearTimeout(lastFunc);
//             lastFunc = setTimeout(function() {
//                 if ((Date.now() - lastRan) >= limit) {
//                     func.apply(context, lastArgs);
//                     lastRan = Date.now();
//                 }
//             }, limit - (Date.now() - lastRan));
//         }
//     };
//
//     throttled.flush = function() {
//         clearTimeout(lastFunc);
//         if (lastArgs) {
//             func.apply(this, lastArgs);
//             lastRan = Date.now();
//         }
//     };
//
//     return throttled;
// };
//
// /**
//  * ОСНОВНОЙ КОМПОНЕНТ ВИРТУАЛИЗИРОВАННОЙ ТАБЛИЦЫ
//  *
//  * @param {Object} props - Пропсы компонента
//  * @param {string} props.maxWidth - Максимальная ширина таблицы (по умолчанию '100%')
//  * @param {string} props.maxHeight - Максимальная высота таблицы (по умолчанию '600px')
//  * @param {Function} props.colorTheme - Функция для кастомизации цветов ячеек
//  * @param {number} props.scrollBatchSize - Размер батча для загрузки данных (по умолчанию 7)
//  * @param {boolean} props.debug - Показывать отладочную информацию (по умолчанию false)
//  * @param {Function} props.dataProvider - Кастомный провайдер данных
//  * @param {Object} props.headerConfig - Конфигурация заголовков
//  * @param {Function} props.onDataLoad - Коллбек при загрузке данных
//  * @param {Function} props.onError - Коллбек при ошибках
//  */
// export const Table = ({
//                           maxWidth = '100%',
//                           maxHeight = '600px',
//                           colorTheme,
//                           scrollBatchSize = 7,
//                           debug = false,
//                           dataProvider = null,
//                           headerConfig = null,
//                           onDataLoad = null,
//                           onError = null
//                       }) => {
//     // === СОСТОЯНИЕ КОМПОНЕНТА ===
//
//     // Основные данные
//     const [dates, setDates] = useState([]);                    // Массив всех дат
//     const [dataCache, setDataCache] = useState({});            // Кэш сырых данных по датам
//     const [processedCache, setProcessedCache] = useState({});  // Кэш обработанных данных с rowspan
//     const [loadingBatches, setLoadingBatches] = useState(new Set()); // Текущие загрузки
//     const [isInitialized, setIsInitialized] = useState(false); // Флаг инициализации
//
//     // Структура заголовков (динамически определяется из данных)
//     const [headerStructure, setHeaderStructure] = useState({});
//     const [groupOrder, setGroupOrder] = useState([]);
//
//     // Виртуализация
//     const [scrollTop, setScrollTop] = useState(0);
//     const [containerHeight, setContainerHeight] = useState(0);
//
//     // === РЕФЕРЕНСЫ ===
//     const containerRef = useRef(null);                    // Ссылка на контейнер таблицы
//     const fetchingPromises = useRef({});                  // Кэш промисов загрузки
//     const scrollVelocity = useRef(0);                     // Скорость скролла
//     const lastScrollTime = useRef(0);                     // Время последнего скролла
//     const lastScrollTop = useRef(0);                      // Последняя позиция скролла
//     const isScrollCompensating = useRef(false);           // Флаг компенсации скролла
//     const pendingRecalculation = useRef(null);            // Таймер пересчета rowspan
//
//     // Стабилизация структуры заголовков при быстром скролле
//     const stableHeaderStructure = useRef({});
//     const stableGroupOrder = useRef([]);
//     const headerUpdatePending = useRef(false);
//
//     // === КОНСТАНТЫ ===
//     const rowHeight = 40;        // Высота строки в пикселях
//     const bufferSize = 20;       // Размер буфера для виртуализации
//
//     // === ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ ===
//
//     // Сегодняшняя дата для определения прошлых дат
//     const today = useMemo(() => {
//         const date = new Date();
//         date.setUTCHours(0, 0, 0, 0);
//         return date;
//     }, []);
//
//     // Дефолтная цветовая тема
//     const defaultColorTheme = useCallback((value, isPast) => {
//         if (value === "BGHeader") return '#dee3f5';
//         if (value === "DATE") return isPast ? '#acb5e3' : '#white';
//
//         switch (value) {
//             case 'М': return '#cdef8d';
//             case 'О': return '#ffce42';
//             case 'П': return '#86cb89';
//             case 'ПР': return '#4a86e8';
//             case 'Р': return 'white';
//             case 0: return isPast ? '#acb5e3' : 'white';
//             default: return isPast ? '#acb5e3' : 'white';
//         }
//     }, []);
//
//     const activeColorTheme = colorTheme || defaultColorTheme;
//
//     // Расчет видимого диапазона с буферами
//     const visibleRange = useMemo(() => {
//         if (!containerHeight || dates.length === 0) {
//             return { start: 0, end: Math.max(dates.length, scrollBatchSize * 2) };
//         }
//
//         const visibleStart = Math.floor(scrollTop / rowHeight);
//         const visibleEnd = Math.ceil((scrollTop + containerHeight) / rowHeight);
//
//         const start = Math.max(0, visibleStart - bufferSize);
//         const end = Math.min(dates.length, visibleEnd + bufferSize);
//
//         return { start, end };
//     }, [scrollTop, containerHeight, dates.length, rowHeight, bufferSize, scrollBatchSize]);
//
//     // === ОСНОВНЫЕ ФУНКЦИИ ===
//
//     /**
//      * Генерация начального диапазона дат вокруг сегодняшнего дня
//      */
//     const generateInitialDates = useCallback(() => {
//         const initialDates = [];
//         const daysAround = Math.floor(scrollBatchSize * 4);
//
//         for (let i = -daysAround; i <= daysAround; i++) {
//             const date = new Date(today);
//             date.setUTCDate(today.getUTCDate() + i);
//             initialDates.push(formatDate(date));
//         }
//
//         return initialDates;
//     }, [today, scrollBatchSize]);
//
//     /**
//      * Динамическое обновление структуры заголовков на основе данных
//      * Стабилизировано для предотвращения мерцания при быстром скролле
//      */
//     const updateHeaderStructure = useCallback((newDataEntries) => {
//         // Не обновляем структуру во время активного скролла
//         if (isScrollCompensating.current || scrollVelocity.current > 0.5) {
//             headerUpdatePending.current = true;
//             return;
//         }
//
//         const newStructure = {};
//         const newGroupOrder = [];
//
//         // Если предоставлена кастомная конфигурация заголовков
//         if (headerConfig) {
//             Object.assign(newStructure, headerConfig.structure);
//             newGroupOrder.push(...headerConfig.order);
//         } else {
//             // Автоматическое определение структуры из данных
//             const allDataEntries = [...Object.values(dataCache), ...newDataEntries];
//
//             const uniqueAgrKeys = new Set();
//             const uniqueStageGroups = {};
//
//             allDataEntries.forEach(dayData => {
//                 for (const key in dayData) {
//                     if (key.startsWith('agr')) {
//                         uniqueAgrKeys.add(key);
//                     } else if (key.startsWith('stage') && Array.isArray(dayData[key])) {
//                         const stageName = key;
//                         if (!uniqueStageGroups[stageName]) {
//                             uniqueStageGroups[stageName] = new Set();
//                         }
//                         dayData[key].forEach(item => {
//                             Object.keys(item).forEach(itemKey => {
//                                 uniqueStageGroups[stageName].add(itemKey);
//                             });
//                         });
//                     }
//                 }
//             });
//
//             // Формирование групп агрегатов
//             const agrElements = Array.from(uniqueAgrKeys).sort();
//             if (agrElements.length > 0) {
//                 newStructure["Работающие агрегаты"] = agrElements;
//             }
//
//             // Формирование групп стадий
//             const sortedStageKeys = Object.keys(uniqueStageGroups).sort((a, b) => {
//                 const numA = parseInt(a.replace('stage', ''), 10);
//                 const numB = parseInt(b.replace('stage', ''), 10);
//                 return numA - numB;
//             });
//
//             sortedStageKeys.forEach(stageKey => {
//                 const groupName = `${stageKey.replace('stage', '')} Ступень`;
//                 newStructure[groupName] = Array.from(uniqueStageGroups[stageKey]).sort();
//             });
//
//             // Формирование порядка групп
//             if (newStructure["Работающие агрегаты"]) {
//                 newGroupOrder.push("Работающие агрегаты");
//             }
//             newGroupOrder.push(...sortedStageKeys.map(stageKey => `${stageKey.replace('stage', '')} Ступень`));
//         }
//
//         // Обновляем только при реальных изменениях
//         const structureChanged = JSON.stringify(stableHeaderStructure.current) !== JSON.stringify(newStructure);
//
//         if (structureChanged) {
//             stableHeaderStructure.current = newStructure;
//             stableGroupOrder.current = newGroupOrder;
//             setHeaderStructure(newStructure);
//             setGroupOrder(newGroupOrder);
//         }
//
//         headerUpdatePending.current = false;
//     }, [dataCache, headerConfig]);
//
//     /**
//      * Обработка отложенных обновлений заголовков
//      */
//     const processPendingHeaderUpdate = useCallback(() => {
//         if (headerUpdatePending.current && scrollVelocity.current <= 0.1 && !isScrollCompensating.current) {
//             updateHeaderStructure([]);
//         }
//     }, [updateHeaderStructure]);
//
//     /**
//      * Получение значения ячейки для рендеринга
//      */
//     const getCellValue = useCallback((processedRow, groupName, key) => {
//         if (groupName === "Работающие агрегаты") {
//             const originalData = dataCache[processedRow.date];
//             return originalData && originalData[key] !== undefined ? originalData[key] : '—';
//         }
//
//         return processedRow.elements && processedRow.elements[key]
//             ? processedRow.elements[key].status
//             : '—';
//     }, [dataCache]);
//
//     /**
//      * Стабильные значения для рендеринга (предотвращают мерцание)
//      */
//     const renderHeaderStructure = useMemo(() => {
//         if (scrollVelocity.current > 0.5 && Object.keys(stableHeaderStructure.current).length > 0) {
//             return stableHeaderStructure.current;
//         }
//         return headerStructure;
//     }, [headerStructure]);
//
//     const renderGroupOrder = useMemo(() => {
//         if (scrollVelocity.current > 0.5 && stableGroupOrder.current.length > 0) {
//             return stableGroupOrder.current;
//         }
//         return groupOrder;
//     }, [groupOrder]);
//
//     /**
//      * ЗАГРУЗКА ДАННЫХ
//      * Основная функция для загрузки батча данных
//      */
//     const loadBatch = useCallback(async (startDate, batchSize) => {
//         const batchKey = `${startDate}+${batchSize}`;
//
//         // Предотвращение дублирования запросов
//         if (fetchingPromises.current[batchKey] || loadingBatches.has(batchKey)) {
//             return fetchingPromises.current[batchKey];
//         }
//
//         setLoadingBatches(prev => new Set([...prev, batchKey]));
//
//         // Выбор провайдера данных
//         const activeDataProvider = dataProvider || customDataProvider || defaultDataProvider;
//
//         const promise = activeDataProvider(startDate, batchSize)
//             .then(batchData => {
//                 // Обновление кэша сырых данных
//                 setDataCache(prev => {
//                     const updated = { ...prev };
//                     batchData.data.forEach(dayData => {
//                         updated[dayData.date] = dayData;
//                     });
//                     return updated;
//                 });
//
//                 // Обновление структуры заголовков
//                 updateHeaderStructure(batchData.data);
//
//                 // Вызов коллбека загрузки данных
//                 if (onDataLoad) {
//                     onDataLoad(batchData.data, startDate, batchSize);
//                 }
//
//                 return batchData;
//             })
//             .catch(error => {
//                 console.error('[VirtualizedTable] Ошибка загрузки данных:', error);
//                 if (onError) {
//                     onError(error, { startDate, batchSize });
//                 }
//                 throw error;
//             })
//             .finally(() => {
//                 setLoadingBatches(prev => {
//                     const updated = new Set(prev);
//                     updated.delete(batchKey);
//                     return updated;
//                 });
//                 delete fetchingPromises.current[batchKey];
//             });
//
//         fetchingPromises.current[batchKey] = promise;
//         return promise;
//     }, [loadingBatches, updateHeaderStructure, dataProvider, onDataLoad, onError]);
//
//     /**
//      * ПЕРЕСЧЕТ ROWSPAN
//      * Отложенный пересчет с учетом скорости скролла
//      */
//     const scheduleRowspanRecalculation = useCallback(() => {
//         if (pendingRecalculation.current) {
//             clearTimeout(pendingRecalculation.current);
//         }
//
//         pendingRecalculation.current = setTimeout(() => {
//             if (!isScrollCompensating.current && scrollVelocity.current <= 0.3) {
//                 const allAvailableDates = Object.keys(dataCache).sort((a, b) => parseDateString(a) - parseDateString(b));
//                 const dataForProcessing = allAvailableDates.map(dateStr => dataCache[dateStr]).filter(Boolean);
//
//                 if (dataForProcessing.length > 0) {
//                     const processed = processDataForTable(dataForProcessing);
//                     setProcessedCache(prev => {
//                         const updated = { ...prev };
//                         processed.processedData.forEach(processedRow => {
//                             updated[processedRow.date] = processedRow;
//                         });
//                         return updated;
//                     });
//                 }
//             }
//             pendingRecalculation.current = null;
//         }, scrollVelocity.current > 1 ? 200 : 100);
//     }, [dataCache]);
//
//     /**
//      * ЗАГРУЗКА ВИДИМЫХ ДАННЫХ
//      * Загружает данные для текущего видимого диапазона
//      */
//     const loadVisibleData = useCallback(async () => {
//         const { start, end } = visibleRange;
//         const visibleDates = dates.slice(start, end);
//         const missingDates = visibleDates.filter(date => !dataCache[date]);
//
//         if (missingDates.length === 0) return;
//
//         // Группировка пропущенных дат в батчи
//         const batchesToLoad = [];
//         if (missingDates.length > 0) {
//             let currentBatchStart = missingDates[0];
//             let currentBatchLength = 1;
//
//             for (let i = 1; i < missingDates.length; i++) {
//                 const prevDate = parseDateString(missingDates[i - 1]);
//                 const currDate = parseDateString(missingDates[i]);
//                 const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
//
//                 if (daysDiff === 1 && currentBatchLength < scrollBatchSize) {
//                     currentBatchLength++;
//                 } else {
//                     batchesToLoad.push({ startDate: currentBatchStart, length: currentBatchLength });
//                     currentBatchStart = missingDates[i];
//                     currentBatchLength = 1;
//                 }
//             }
//             batchesToLoad.push({ startDate: currentBatchStart, length: currentBatchLength });
//         }
//
//         const loadPromises = batchesToLoad.map(batch =>
//             loadBatch(batch.startDate, scrollBatchSize)
//         );
//
//         await Promise.allSettled(loadPromises);
//         scheduleRowspanRecalculation();
//     }, [visibleRange, dates, dataCache, loadBatch, scrollBatchSize, scheduleRowspanRecalculation]);
//
//     /**
//      * РАСШИРЕНИЕ ДИАПАЗОНА ДАТ
//      * Добавляет новые даты при достижении границ
//      */
//     const extendDates = useCallback(async (direction, isPreemptive = false) => {
//         const loadPromises = [];
//
//         if (direction === 'forward') {
//             // Добавление дат в будущее
//             const lastDate = dates[dates.length - 1];
//             if (!lastDate) return;
//
//             const lastDateObj = parseDateString(lastDate);
//             const newDates = [];
//             const extendSize = isPreemptive ? scrollBatchSize * 2 : scrollBatchSize;
//
//             for (let i = 1; i <= extendSize; i++) {
//                 const date = new Date(lastDateObj);
//                 date.setUTCDate(lastDateObj.getUTCDate() + i);
//                 newDates.push(formatDate(date));
//             }
//
//             setDates(prev => [...prev, ...newDates]);
//
//             // Загрузка данных для новых дат
//             for (let i = 0; i < newDates.length; i += scrollBatchSize) {
//                 const batchStart = newDates[i];
//                 const batchSize = Math.min(scrollBatchSize, newDates.length - i);
//                 loadPromises.push(loadBatch(batchStart, batchSize));
//             }
//
//             await Promise.allSettled(loadPromises);
//             scheduleRowspanRecalculation();
//
//         } else if (direction === 'backward') {
//             // Добавление дат в прошлое с компенсацией скролла
//             const firstDate = dates[0];
//             if (!firstDate) return;
//
//             const firstDateObj = parseDateString(firstDate);
//             const newDates = [];
//             const extendSize = isPreemptive ? scrollBatchSize * 2 : scrollBatchSize;
//
//             for (let i = extendSize; i >= 1; i--) {
//                 const date = new Date(firstDateObj);
//                 date.setUTCDate(firstDateObj.getUTCDate() - i);
//                 newDates.push(formatDate(date));
//             }
//
//             if (containerRef.current) {
//                 isScrollCompensating.current = true;
//
//                 const currentScrollTop = containerRef.current.scrollTop;
//                 const currentFirstVisibleIndex = Math.floor(currentScrollTop / rowHeight);
//                 const scrollOffset = currentScrollTop % rowHeight;
//
//                 // Обновление дат с компенсацией скролла
//                 setDates(prevDates => {
//                     const updatedDates = [...newDates, ...prevDates];
//
//                     requestAnimationFrame(() => {
//                         if (containerRef.current && isScrollCompensating.current) {
//                             const compensatedScrollTop = (currentFirstVisibleIndex + newDates.length) * rowHeight + scrollOffset;
//                             containerRef.current.scrollTop = compensatedScrollTop;
//                             setScrollTop(compensatedScrollTop);
//
//                             setTimeout(() => {
//                                 isScrollCompensating.current = false;
//                             }, 50);
//                         }
//                     });
//
//                     return updatedDates;
//                 });
//             } else {
//                 setDates(prev => [...newDates, ...prev]);
//             }
//
//             // Загрузка данных для новых дат
//             for (let i = 0; i < newDates.length; i += scrollBatchSize) {
//                 const batchStart = newDates[i];
//                 const batchSize = Math.min(scrollBatchSize, newDates.length - i);
//                 loadPromises.push(loadBatch(batchStart, batchSize));
//             }
//
//             await Promise.allSettled(loadPromises);
//
//             setTimeout(() => {
//                 scheduleRowspanRecalculation();
//             }, 150);
//         }
//     }, [dates, scrollBatchSize, rowHeight, loadBatch, scheduleRowspanRecalculation]);
//
//     /**
//      * ОБРАБОТКА СКРОЛЛА
//      * Основная логика виртуализации и подгрузки данных
//      */
//     const handleScrollImmediate = useCallback(async () => {
//         if (!containerRef.current || isScrollCompensating.current) return;
//
//         const container = containerRef.current;
//         const newScrollTop = container.scrollTop;
//         const newContainerHeight = container.clientHeight;
//         const scrollHeight = container.scrollHeight;
//         const currentTime = Date.now();
//
//         // Вычисление скорости скролла
//         const timeDelta = currentTime - lastScrollTime.current;
//         const scrollDelta = newScrollTop - lastScrollTop.current;
//
//         if (timeDelta > 0) {
//             scrollVelocity.current = Math.abs(scrollDelta / timeDelta);
//         }
//
//         lastScrollTime.current = currentTime;
//         lastScrollTop.current = newScrollTop;
//
//         setScrollTop(newScrollTop);
//         setContainerHeight(newContainerHeight);
//
//         // Обработка отложенных обновлений заголовков
//         if (scrollVelocity.current <= 0.5) {
//             processPendingHeaderUpdate();
//         }
//
//         // Динамические пороги для расширения диапазона
//         const baseThreshold = rowHeight * bufferSize;
//         const velocityMultiplier = Math.min(3, 1 + scrollVelocity.current * 2);
//         const dynamicThreshold = baseThreshold * velocityMultiplier;
//
//         const topThreshold = dynamicThreshold;
//         const bottomThreshold = scrollHeight - newContainerHeight - dynamicThreshold;
//
//         const needsTopExtension = newScrollTop <= topThreshold && dates.length > 0;
//         const needsBottomExtension = newScrollTop >= bottomThreshold && dates.length > 0;
//
//         // Предварительная загрузка при высокой скорости
//         const isHighVelocity = scrollVelocity.current > 1;
//         const preemptiveTopThreshold = topThreshold * 2;
//         const preemptiveBottomThreshold = scrollHeight - newContainerHeight - (dynamicThreshold * 2);
//
//         const promises = [];
//
//         if (needsTopExtension) {
//             promises.push(extendDates('backward', isHighVelocity));
//         }
//
//         if (needsBottomExtension) {
//             promises.push(extendDates('forward', isHighVelocity));
//         }
//
//         if (isHighVelocity) {
//             if (scrollDelta < 0 && newScrollTop <= preemptiveTopThreshold) {
//                 promises.push(extendDates('backward', true));
//             } else if (scrollDelta > 0 && newScrollTop >= preemptiveBottomThreshold) {
//                 promises.push(extendDates('forward', true));
//             }
//         }
//
//         if (promises.length > 0) {
//             await Promise.allSettled(promises);
//         }
//     }, [dates, extendDates, rowHeight, bufferSize, processPendingHeaderUpdate]);
//
//     // Throttled версия обработчика скролла
//     const handleScrollThrottled = useMemo(
//         () => smartThrottle(handleScrollImmediate, 8),
//         [handleScrollImmediate]
//     );
//
//     const handleScroll = useCallback(() => {
//         if (isScrollCompensating.current) return;
//
//         handleScrollThrottled();
//
//         if (scrollVelocity.current > 2) {
//             setTimeout(() => {
//                 handleScrollThrottled.flush();
//             }, 50);
//         }
//     }, [handleScrollThrottled]);
//
//     // === ЭФФЕКТЫ ЖИЗНЕННОГО ЦИКЛА ===
//
//     /**
//      * ИНИЦИАЛИЗАЦИЯ КОМПОНЕНТА
//      */
//     useEffect(() => {
//         if (!isInitialized && dates.length === 0) {
//             const initialDates = generateInitialDates();
//             setDates(initialDates);
//
//             const initializeTable = async () => {
//                 const todayFormatted = formatDate(today);
//                 const todayIndex = initialDates.findIndex(date => date === todayFormatted);
//
//                 if (todayIndex !== -1 && containerRef.current) {
//                     // Ожидание инициализации размеров контейнера
//                     await new Promise(resolve => {
//                         const checkDimensions = () => {
//                             if (containerRef.current?.clientHeight > 0) {
//                                 resolve();
//                             } else {
//                                 requestAnimationFrame(checkDimensions);
//                             }
//                         };
//                         checkDimensions();
//                     });
//
//                     const containerHeight = containerRef.current.clientHeight;
//                     const visibleRows = Math.ceil(containerHeight / rowHeight);
//                     const totalRowsNeeded = visibleRows + (bufferSize * 2);
//                     const initialBatchSize = Math.max(scrollBatchSize * 2, totalRowsNeeded);
//
//                     const startIndex = Math.max(0, todayIndex - Math.floor(initialBatchSize / 2));
//                     const endIndex = Math.min(initialDates.length, startIndex + initialBatchSize);
//
//                     // Загрузка начальных данных
//                     const batchesToLoad = [];
//                     for (let i = startIndex; i < endIndex; i += scrollBatchSize) {
//                         const batchStart = initialDates[i];
//                         const batchSize = Math.min(scrollBatchSize, endIndex - i);
//                         batchesToLoad.push({ startDate: batchStart, size: batchSize });
//                     }
//
//                     const loadPromises = batchesToLoad.map(batch =>
//                         loadBatch(batch.startDate, batch.size)
//                     );
//
//                     await Promise.allSettled(loadPromises);
//                     scheduleRowspanRecalculation();
//
//                     // Позиционирование на сегодняшний день
//                     setTimeout(() => {
//                         if (containerRef.current) {
//                             const targetScroll = todayIndex * rowHeight - (containerHeight / 2) + (rowHeight / 2);
//                             containerRef.current.scrollTop = Math.max(0, targetScroll);
//
//                             setContainerHeight(containerHeight);
//                             setScrollTop(containerRef.current.scrollTop);
//                             setIsInitialized(true);
//
//                             // Предзагрузка дополнительных данных
//                             setTimeout(() => {
//                                 const preloadPromises = [];
//
//                                 if (startIndex > bufferSize) {
//                                     const preloadStartUp = Math.max(0, startIndex - bufferSize);
//                                     preloadPromises.push(loadBatch(initialDates[preloadStartUp], bufferSize));
//                                 }
//
//                                 if (endIndex < initialDates.length - bufferSize) {
//                                     preloadPromises.push(loadBatch(initialDates[endIndex], bufferSize));
//                                 }
//
//                                 if (preloadPromises.length > 0) {
//                                     Promise.allSettled(preloadPromises).then(() => {
//                                         scheduleRowspanRecalculation();
//                                     });
//                                 }
//                             }, 200);
//                         }
//                     }, 100);
//                 }
//             };
//
//             initializeTable();
//         }
//     }, [isInitialized, dates.length, generateInitialDates, today, rowHeight, scrollBatchSize, loadBatch, bufferSize, scheduleRowspanRecalculation]);
//
//     /**
//      * ЗАГРУЗКА ВИДИМЫХ ДАННЫХ
//      */
//     useEffect(() => {
//         if (isInitialized) {
//             loadVisibleData();
//         }
//     }, [isInitialized, loadVisibleData]);
//
//     /**
//      * ОЧИСТКА РЕСУРСОВ
//      */
//     useEffect(() => {
//         return () => {
//             if (pendingRecalculation.current) {
//                 clearTimeout(pendingRecalculation.current);
//             }
//         };
//     }, []);
//
//     /**
//      * ОЧИСТКА КЭША ДЛЯ ОПТИМИЗАЦИИ ПАМЯТИ
//      */
//     useEffect(() => {
//         const cleanup = () => {
//             const { start, end } = visibleRange;
//             const keepRange = bufferSize * 3;
//             const keepStart = Math.max(0, start - keepRange);
//             const keepEnd = Math.min(dates.length, end + keepRange);
//
//             const keepDates = new Set();
//             for (let i = keepStart; i < keepEnd; i++) {
//                 if (dates[i]) keepDates.add(dates[i]);
//             }
//
//             setDataCache(prev => {
//                 const filtered = {};
//                 Object.keys(prev).forEach(date => {
//                     if (keepDates.has(date)) {
//                         filtered[date] = prev[date];
//                     }
//                 });
//                 return Object.keys(filtered).length !== Object.keys(prev).length ? filtered : prev;
//             });
//
//             setProcessedCache(prev => {
//                 const filtered = {};
//                 Object.keys(prev).forEach(date => {
//                     if (keepDates.has(date)) {
//                         filtered[date] = prev[date];
//                     }
//                 });
//                 return Object.keys(filtered).length !== Object.keys(prev).length ? filtered : prev;
//             });
//         };
//
//         const interval = setInterval(cleanup, 5000);
//         return () => clearInterval(interval);
//     }, [visibleRange, dates, bufferSize]);
//
//     // === РЕНДЕРИНГ ===
//
//     const { start: startIndex, end: endIndex } = visibleRange;
//     const visibleDates = dates.slice(startIndex, endIndex);
//     const paddingTop = startIndex * rowHeight;
//     const paddingBottom = Math.max(0, (dates.length - endIndex) * rowHeight);
//
//     return (
//         <>
//             <div
//                 ref={containerRef}
//                 style={{
//                     maxWidth,
//                     width: 'fit-content',
//                     height: '100%',
//                     maxHeight,
//                     overflow: 'auto',
//                     border: '1px solid #ccc',
//                     position: 'relative',
//                     fontFamily: 'serif',
//                 }}
//                 onScroll={handleScroll}
//             >
//                 <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
//                     {/* ЗАГОЛОВОК ТАБЛИЦЫ */}
//                     <thead
//                         style={{
//                             position: 'sticky',
//                             top: 0,
//                             background: activeColorTheme("BGHeader"),
//                             zIndex: 10
//                         }}>
//                     {/* Первый ряд заголовков - группы */}
//                     <tr>
//                         <th rowSpan="2" style={{
//                             padding: '8px',
//                             minWidth: '100px',
//                             borderRight: '1px solid #ddd',
//                             fontSize: '14px',
//                             fontWeight: 'normal',
//                             whiteSpace: 'nowrap'
//                         }}>
//                             Дата
//                         </th>
//                         {renderGroupOrder.map((groupName, index) => (
//                             <th
//                                 key={groupName}
//                                 colSpan={renderHeaderStructure[groupName]?.length || 1}
//                                 style={{
//                                     textWrap: 'nowrap',
//                                     borderLeft: index > 0 ? '2px solid #fff' : 'none',
//                                     padding: '8px',
//                                     borderRight: '1px solid #ddd',
//                                     fontSize: '14px',
//                                     fontWeight: 'normal'
//                                 }}
//                             >
//                                 {groupName}
//                             </th>
//                         ))}
//                     </tr>
//                     {/* Второй ряд заголовков - элементы */}
//                     <tr>
//                         {renderGroupOrder.map((groupName, groupIndex) => (
//                             (renderHeaderStructure[groupName] || []).map((key, keyIndex) => (
//                                 <th
//                                     key={`${groupName}-${key}`}
//                                     style={{
//                                         borderLeft: keyIndex === 0 && groupIndex > 0 ? '2px solid #fff' : 'none',
//                                         padding: '5px',
//                                         borderRight: '1px solid #ddd',
//                                         fontSize: '12px',
//                                         fontWeight: 'normal',
//                                         minWidth: '60px'
//                                     }}
//                                 >
//                                     {key}
//                                 </th>
//                             ))
//                         ))}
//                     </tr>
//                     </thead>
//
//                     {/* ТЕЛО ТАБЛИЦЫ */}
//                     <tbody>
//                     {/* Верхний отступ для виртуализации */}
//                     {paddingTop > 0 && (
//                         <tr style={{ height: paddingTop }}>
//                             <td colSpan={1} style={{ padding: 0, border: 'none' }} />
//                         </tr>
//                     )}
//
//                     {/* ВИДИМЫЕ СТРОКИ */}
//                     {visibleDates.map((dateString, index) => {
//                         const processedRow = processedCache[dateString];
//                         const isLoading = !processedRow;
//                         const rowDate = parseDateString(dateString);
//                         const isPastDate = rowDate.getTime() < today.getTime();
//
//                         return (
//                             <tr
//                                 key={`${dateString}-${startIndex + index}`}
//                                 style={{
//                                     height: `${rowHeight}px`,
//                                     backgroundColor: isLoading ? 'transparent' : activeColorTheme("DATE", isPastDate),
//                                 }}
//                             >
//                                 {/* Колонка с датой */}
//                                 <td style={{
//                                     textWrap: 'nowrap',
//                                     borderLeft: index > 0 ? '2px solid #fff' : 'none',
//                                     padding: '8px',
//                                     borderRight: '1px solid #ddd',
//                                     fontSize: '14px',
//                                     fontWeight: 'normal',
//                                     color: isPastDate ? '#666' : 'inherit',
//                                 }}>
//                                     {dateString}
//                                 </td>
//
//                                 {/* Ячейки данных */}
//                                 {renderGroupOrder.map((groupName, groupIndex) => (
//                                     (renderHeaderStructure[groupName] || []).map((key, keyIndex) => {
//                                         const cellValue = processedRow ? getCellValue(processedRow, groupName, key) : '—';
//
//                                         let shouldDisplay = true;
//                                         let rowSpan = 1;
//
//                                         // Обработка rowspan для stage элементов
//                                         if (processedRow && groupName !== "Работающие агрегаты") {
//                                             const elementData = processedRow.elements[key];
//                                             if (elementData) {
//                                                 shouldDisplay = elementData.displayed;
//                                                 rowSpan = elementData.rowspan;
//                                             }
//                                         }
//
//                                         // Пропуск скрытых ячеек
//                                         if (!shouldDisplay) {
//                                             return null;
//                                         }
//
//                                         return (
//                                             <td
//                                                 key={`${dateString}-${groupName}-${key}`}
//                                                 rowSpan={rowSpan}
//                                                 style={{
//                                                     padding: '4px',
//                                                     textAlign: 'center',
//                                                     backgroundColor: isLoading ?
//                                                         'transparent' :
//                                                         activeColorTheme(cellValue, isPastDate),
//                                                     fontSize: '14px',
//                                                     minWidth: '50px',
//                                                     verticalAlign: 'middle',
//                                                     borderLeft: keyIndex === 0 && groupIndex > 0 ? '2px solid #fff' : 'none',
//                                                     fontWeight: 'normal',
//                                                 }}
//                                             >
//                                                 {/* Индикатор загрузки или значение */}
//                                                 {isLoading ? (
//                                                     <div style={{
//                                                         width: '16px',
//                                                         height: '16px',
//                                                         borderRadius: '50%',
//                                                         border: '2px solid #ddd',
//                                                         borderTop: '2px solid #007bff',
//                                                         animation: 'spin 1s linear infinite',
//                                                         margin: 'auto',
//                                                     }} />
//                                                 ) : (
//                                                     cellValue
//                                                 )}
//                                             </td>
//                                         );
//                                     })
//                                 ))}
//                             </tr>
//                         );
//                     })}
//
//                     {/* Нижний отступ для виртуализации */}
//                     {paddingBottom > 0 && (
//                         <tr style={{ height: paddingBottom }}>
//                             <td colSpan={1} style={{ padding: 0, border: 'none' }} />
//                         </tr>
//                     )}
//                     </tbody>
//                 </table>
//
//                 {/* CSS анимации */}
//                 <style>
//                     {`
//                     @keyframes spin {
//                         0% { transform: rotate(0deg); }
//                         100% { transform: rotate(360deg); }
//                     }
//                 `}
//                 </style>
//             </div>
//
//             {/* ОТЛАДОЧНАЯ ПАНЕЛЬ */}
//             {debug && <div style={{
//                 background: 'rgba(255, 255, 255, 0.95)',
//                 padding: '6px 12px',
//                 margin: "20px 0",
//                 border: '1px solid #ddd',
//                 fontSize: '11px',
//                 fontFamily: 'monospace',
//                 color: '#666',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 gap: '8px',
//                 flexWrap: 'wrap',
//                 width: 'fit-content'
//             }}>
//                 <span><strong>Видимые строки:</strong> {visibleDates.length}</span>
//                 <span><strong>Диапазон:</strong> {startIndex}-{endIndex}</span>
//                 <span><strong>Всего дат:</strong> {dates.length}</span>
//                 <span><strong>В кэше сырых данных:</strong> {Object.keys(dataCache).length}</span>
//                 <span><strong>В кэше обработанных:</strong> {Object.keys(processedCache).length}</span>
//                 <span><strong>Загружается батчей:</strong> {loadingBatches.size}</span>
//                 <span><strong>Размер батча:</strong> {scrollBatchSize} дней</span>
//                 <span><strong>Скорость скролла:</strong> {scrollVelocity.current.toFixed(2)}</span>
//                 <span><strong>Компенсация скролла:</strong> {isScrollCompensating.current ? 'Да' : 'Нет'}</span>
//             </div>}
//         </>
//     );
// };
//
// // === ПУБЛИЧНОЕ API ===
//
// /**
//  * Установка кастомного провайдера данных глобально
//  * @param {Function} provider - Функция провайдера данных
//  */
// export const setDataProvider = (provider) => {
//     customDataProvider = provider;
// };
//
// /**
//  * Получение текущего провайдера данных
//  * @returns {Function} Текущий провайдер данных
//  */
// export const getDataProvider = () => {
//     return customDataProvider || defaultDataProvider;
// };
//
// // Экспорт типов для TypeScript (если используется)
// export default Table;

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * VIRTUALIZED TABLE COMPONENT
 *
 * Высокопроизводительная виртуализированная таблица с поддержкой:
 * - Бесконечного скролла (infinite scroll)
 * - Динамической загрузки данных батчами
 * - Объединения ячеек (rowspan) для одинаковых значений
 * - Кастомных цветовых тем
 * - Отладочной информации
 *
 * @version 1.0.0
 * @author Roman Baranovskii
 */

/**
 * Утилиты для работы с датами - ОПРЕДЕЛЯЕМ В НАЧАЛЕ
 */
const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const parseDateString = (dateString) => {
    const [day, month, year] = dateString.split('.').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
};

// Экспортируем утилиты глобально сразу при загрузке модуля
if (typeof window !== 'undefined') {
    window.TableUtils = {
        parseDateString,
        formatDate
    };
}

/**
 * Интерфейс для провайдера данных
 */
let customDataProvider = null;

/**
 * Дефолтный провайдер данных для демонстрации
 */
const defaultDataProvider = async (startDate, days) => {
    console.log(`[VirtualizedTable] Загружаем батч: ${startDate} (+${days} дней)`);
    await new Promise(resolve => setTimeout(resolve, 300));

    const stagesValues = ["М", "М", "М", "М", "М", "М", "О", "П", "ПР", "Р"];
    const randomStageValue = () => stagesValues[Math.floor(Math.random() * stagesValues.length)];

    const generateDayData = (dateStr) => {
        let stage1 = [
            {"20ГПА-1-2": randomStageValue()},
            {"20ГПА-1-3": randomStageValue()},
            {"20ГПА-1-1": randomStageValue()},
            {"20ГПА-1-4": randomStageValue()},
        ];
        let stage2 = [
            {"20ГПА-2-2": randomStageValue()},
            {"20ГПА-2-3": randomStageValue()},
            {"20ГПА-2-1": randomStageValue()},
            {"20ГПА-2-4": randomStageValue()},
        ];
        let stage3 = [
            {"20ГПА-3-2": randomStageValue()},
            {"20ГПА-3-3": randomStageValue()},
            {"20ГПА-3-1": randomStageValue()},
            {"20ГПА-3-4": randomStageValue()},
        ];

        const result = {
            date: dateStr,
            agr1: Math.floor(Math.random() * 10),
            agr2: Math.floor(Math.random() * 10),
            stage1: stage1,
            stage2: stage2,
            stage3: stage3
        };

        if (Math.random() > 0.7) {
            result.agr3 = Math.floor(Math.random() * 10);
        }

        return result;
    };

    // ИСПОЛЬЗУЕМ ТОЛЬКО ЛОКАЛЬНЫЕ ФУНКЦИИ - НЕ ССЫЛАЕМСЯ НА ГЛОБАЛЬНЫЕ
    const startDateObj = parseDateString(startDate);
    const batchData = [];

    for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDateObj);
        currentDate.setUTCDate(startDateObj.getUTCDate() + i);
        const dateStr = formatDate(currentDate);
        batchData.push(generateDayData(dateStr));
    }

    return { data: batchData };
};

/**
 * Обработка данных для таблицы с вычислением rowspan
 */
function processDataForTable(data) {
    if (!data || data.length === 0) {
        return { processedData: [], allElements: [], stageElements: {}, agrElements: [] };
    }

    const allElements = new Set();
    const stageElements = {};
    const agrKeys = new Set();

    data.forEach(row => {
        for (const key in row) {
            if (key.startsWith('stage') && Array.isArray(row[key])) {
                const stageName = key;
                if (!stageElements[stageName]) {
                    stageElements[stageName] = new Set();
                }

                row[key].forEach(item => {
                    const elementName = Object.keys(item)[0];
                    allElements.add(elementName);
                    stageElements[stageName].add(elementName);
                });
            } else if (key.startsWith('agr')) {
                agrKeys.add(key);
                allElements.add(key);
            }
        }
    });

    const sortedAllElements = Array.from(allElements).sort();
    const sortedAgrElements = Array.from(agrKeys).sort();

    const processedData = data.map(row => {
        const processed = {
            date: row.date,
            elements: {}
        };

        sortedAllElements.forEach(elementName => {
            processed.elements[elementName] = {
                status: '-',
                rowspan: 1,
                displayed: true
            };
        });

        for (const key in row) {
            if (key.startsWith('stage') && Array.isArray(row[key])) {
                row[key].forEach(item => {
                    const elementName = Object.keys(item)[0];
                    const status = item[elementName];
                    if (processed.elements[elementName]) {
                        processed.elements[elementName].status = status;
                    }
                });
            } else if (key.startsWith('agr')) {
                if (processed.elements[key]) {
                    processed.elements[key].status = row[key];
                }
            }
        }

        return processed;
    });

    sortedAllElements.forEach(elementName => {
        if (elementName.startsWith('agr')) {
            processedData.forEach(row => {
                if (row.elements[elementName]) {
                    row.elements[elementName].rowspan = 1;
                    row.elements[elementName].displayed = true;
                }
            });
            return;
        }

        processedData.forEach(row => {
            if (row.elements[elementName]) {
                row.elements[elementName].rowspan = 1;
                row.elements[elementName].displayed = true;
            }
        });

        let i = 0;
        while (i < processedData.length) {
            const currentRow = processedData[i];
            const currentStatus = currentRow.elements[elementName]?.status;

            if (currentStatus === 'М' || currentStatus === 'Р' || currentStatus === '-' || currentStatus === undefined) {
                i++;
                continue;
            }

            let spanCount = 1;
            let j = i + 1;

            while (j < processedData.length) {
                const nextRow = processedData[j];
                const nextStatus = nextRow.elements[elementName]?.status;

                if (nextStatus === currentStatus) {
                    spanCount++;
                    nextRow.elements[elementName].displayed = false;
                    j++;
                } else {
                    break;
                }
            }

            if (spanCount > 1) {
                currentRow.elements[elementName].rowspan = spanCount;
            }
            i = j;
        }
    });

    return { processedData, sortedAllElements, stageElements, agrElements: sortedAgrElements };
}

/**
 * Throttle функция
 */
const smartThrottle = (func, limit) => {
    let lastFunc;
    let lastRan;
    let lastArgs;

    const throttled = function(...args) {
        const context = this;
        lastArgs = args;

        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, lastArgs);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };

    throttled.flush = function() {
        clearTimeout(lastFunc);
        if (lastArgs) {
            func.apply(this, lastArgs);
            lastRan = Date.now();
        }
    };

    return throttled;
};

/**
 * ОСНОВНОЙ КОМПОНЕНТ ТАБЛИЦЫ
 */
export const Table = ({
                          maxWidth = '100%',
                          maxHeight = '600px',
                          colorTheme,
                          scrollBatchSize = 7,
                          debug = false,
                          dataProvider = null,
                          headerConfig = null,
                          onDataLoad = null,
                          onError = null
                      }) => {

    // Состояние компонента
    const [dates, setDates] = useState([]);
    const [dataCache, setDataCache] = useState({});
    const [processedCache, setProcessedCache] = useState({});
    const [loadingBatches, setLoadingBatches] = useState(new Set());
    const [isInitialized, setIsInitialized] = useState(false);
    const [headerStructure, setHeaderStructure] = useState({});
    const [groupOrder, setGroupOrder] = useState([]);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    // Референсы
    const containerRef = useRef(null);
    const fetchingPromises = useRef({});
    const scrollVelocity = useRef(0);
    const lastScrollTime = useRef(0);
    const lastScrollTop = useRef(0);
    const isScrollCompensating = useRef(false);
    const pendingRecalculation = useRef(null);
    const stableHeaderStructure = useRef({});
    const stableGroupOrder = useRef([]);
    const headerUpdatePending = useRef(false);

    // Константы
    const rowHeight = 40;
    const bufferSize = 20;

    // Сегодняшняя дата
    const today = useMemo(() => {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        return date;
    }, []);

    // Цветовая тема
    const defaultColorTheme = useCallback((value, isPast) => {
        if (value === "BGHeader") return '#dee3f5';
        if (value === "DATE") return isPast ? '#acb5e3' : '#white';

        switch (value) {
            case 'М': return '#cdef8d';
            case 'О': return '#ffce42';
            case 'П': return '#86cb89';
            case 'ПР': return '#4a86e8';
            case 'Р': return 'white';
            case 0: return isPast ? '#acb5e3' : 'white';
            default: return isPast ? '#acb5e3' : 'white';
        }
    }, []);

    const activeColorTheme = colorTheme || defaultColorTheme;

    // Видимый диапазон
    const visibleRange = useMemo(() => {
        if (!containerHeight || dates.length === 0) {
            return { start: 0, end: Math.max(dates.length, scrollBatchSize * 2) };
        }

        const visibleStart = Math.floor(scrollTop / rowHeight);
        const visibleEnd = Math.ceil((scrollTop + containerHeight) / rowHeight);

        const start = Math.max(0, visibleStart - bufferSize);
        const end = Math.min(dates.length, visibleEnd + bufferSize);

        return { start, end };
    }, [scrollTop, containerHeight, dates.length, rowHeight, bufferSize, scrollBatchSize]);

    // Генерация начальных дат
    const generateInitialDates = useCallback(() => {
        const initialDates = [];
        const daysAround = Math.floor(scrollBatchSize * 4);

        for (let i = -daysAround; i <= daysAround; i++) {
            const date = new Date(today);
            date.setUTCDate(today.getUTCDate() + i);
            initialDates.push(formatDate(date));
        }

        return initialDates;
    }, [today, scrollBatchSize]);

    // Обновление структуры заголовков
    const updateHeaderStructure = useCallback((newDataEntries) => {
        if (isScrollCompensating.current || scrollVelocity.current > 0.5) {
            headerUpdatePending.current = true;
            return;
        }

        const newStructure = {};
        const newGroupOrder = [];

        if (headerConfig) {
            Object.assign(newStructure, headerConfig.structure);
            newGroupOrder.push(...headerConfig.order);
        } else {
            const allDataEntries = [...Object.values(dataCache), ...newDataEntries];
            const uniqueAgrKeys = new Set();
            const uniqueStageGroups = {};

            allDataEntries.forEach(dayData => {
                for (const key in dayData) {
                    if (key.startsWith('agr')) {
                        uniqueAgrKeys.add(key);
                    } else if (key.startsWith('stage') && Array.isArray(dayData[key])) {
                        const stageName = key;
                        if (!uniqueStageGroups[stageName]) {
                            uniqueStageGroups[stageName] = new Set();
                        }
                        dayData[key].forEach(item => {
                            Object.keys(item).forEach(itemKey => {
                                uniqueStageGroups[stageName].add(itemKey);
                            });
                        });
                    }
                }
            });

            const agrElements = Array.from(uniqueAgrKeys).sort();
            if (agrElements.length > 0) {
                newStructure["Работающие агрегаты"] = agrElements;
            }

            const sortedStageKeys = Object.keys(uniqueStageGroups).sort((a, b) => {
                const numA = parseInt(a.replace('stage', ''), 10);
                const numB = parseInt(b.replace('stage', ''), 10);
                return numA - numB;
            });

            sortedStageKeys.forEach(stageKey => {
                const groupName = `${stageKey.replace('stage', '')} Ступень`;
                newStructure[groupName] = Array.from(uniqueStageGroups[stageKey]).sort();
            });

            if (newStructure["Работающие агрегаты"]) {
                newGroupOrder.push("Работающие агрегаты");
            }
            newGroupOrder.push(...sortedStageKeys.map(stageKey => `${stageKey.replace('stage', '')} Ступень`));
        }

        const structureChanged = JSON.stringify(stableHeaderStructure.current) !== JSON.stringify(newStructure);

        if (structureChanged) {
            stableHeaderStructure.current = newStructure;
            stableGroupOrder.current = newGroupOrder;
            setHeaderStructure(newStructure);
            setGroupOrder(newGroupOrder);
        }

        headerUpdatePending.current = false;
    }, [dataCache, headerConfig]);

    const processPendingHeaderUpdate = useCallback(() => {
        if (headerUpdatePending.current && scrollVelocity.current <= 0.1 && !isScrollCompensating.current) {
            updateHeaderStructure([]);
        }
    }, [updateHeaderStructure]);

    const getCellValue = useCallback((processedRow, groupName, key) => {
        if (groupName === "Работающие агрегаты") {
            const originalData = dataCache[processedRow.date];
            return originalData && originalData[key] !== undefined ? originalData[key] : '—';
        }

        return processedRow.elements && processedRow.elements[key]
            ? processedRow.elements[key].status
            : '—';
    }, [dataCache]);

    const renderHeaderStructure = useMemo(() => {
        if (scrollVelocity.current > 0.5 && Object.keys(stableHeaderStructure.current).length > 0) {
            return stableHeaderStructure.current;
        }
        return headerStructure;
    }, [headerStructure]);

    const renderGroupOrder = useMemo(() => {
        if (scrollVelocity.current > 0.5 && stableGroupOrder.current.length > 0) {
            return stableGroupOrder.current;
        }
        return groupOrder;
    }, [groupOrder]);

    // Загрузка батча данных
    const loadBatch = useCallback(async (startDate, batchSize) => {
        const batchKey = `${startDate}+${batchSize}`;

        if (fetchingPromises.current[batchKey] || loadingBatches.has(batchKey)) {
            return fetchingPromises.current[batchKey];
        }

        setLoadingBatches(prev => new Set([...prev, batchKey]));

        // ПРИОРИТЕТ: customDataProvider > dataProvider > defaultDataProvider
        const activeDataProvider = dataProvider || customDataProvider || defaultDataProvider;

        const promise = activeDataProvider(startDate, batchSize)
            .then(batchData => {
                setDataCache(prev => {
                    const updated = { ...prev };
                    batchData.data.forEach(dayData => {
                        updated[dayData.date] = dayData;
                    });
                    return updated;
                });

                updateHeaderStructure(batchData.data);

                if (onDataLoad) {
                    onDataLoad(batchData.data, startDate, batchSize);
                }

                return batchData;
            })
            .catch(error => {
                console.error('[VirtualizedTable] Ошибка загрузки данных:', error);
                if (onError) {
                    onError(error, { startDate, batchSize });
                }
                throw error;
            })
            .finally(() => {
                setLoadingBatches(prev => {
                    const updated = new Set(prev);
                    updated.delete(batchKey);
                    return updated;
                });
                delete fetchingPromises.current[batchKey];
            });

        fetchingPromises.current[batchKey] = promise;
        return promise;
    }, [loadingBatches, updateHeaderStructure, dataProvider, onDataLoad, onError]);

    // Пересчет rowspan
    const scheduleRowspanRecalculation = useCallback(() => {
        if (pendingRecalculation.current) {
            clearTimeout(pendingRecalculation.current);
        }

        pendingRecalculation.current = setTimeout(() => {
            if (!isScrollCompensating.current && scrollVelocity.current <= 0.3) {
                const allAvailableDates = Object.keys(dataCache).sort((a, b) => parseDateString(a) - parseDateString(b));
                const dataForProcessing = allAvailableDates.map(dateStr => dataCache[dateStr]).filter(Boolean);

                if (dataForProcessing.length > 0) {
                    const processed = processDataForTable(dataForProcessing);
                    setProcessedCache(prev => {
                        const updated = { ...prev };
                        processed.processedData.forEach(processedRow => {
                            updated[processedRow.date] = processedRow;
                        });
                        return updated;
                    });
                }
            }
            pendingRecalculation.current = null;
        }, scrollVelocity.current > 1 ? 200 : 100);
    }, [dataCache]);

    // Загрузка видимых данных
    const loadVisibleData = useCallback(async () => {
        const { start, end } = visibleRange;
        const visibleDates = dates.slice(start, end);
        const missingDates = visibleDates.filter(date => !dataCache[date]);

        if (missingDates.length === 0) return;

        const batchesToLoad = [];
        if (missingDates.length > 0) {
            let currentBatchStart = missingDates[0];
            let currentBatchLength = 1;

            for (let i = 1; i < missingDates.length; i++) {
                const prevDate = parseDateString(missingDates[i - 1]);
                const currDate = parseDateString(missingDates[i]);
                const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

                if (daysDiff === 1 && currentBatchLength < scrollBatchSize) {
                    currentBatchLength++;
                } else {
                    batchesToLoad.push({ startDate: currentBatchStart, length: currentBatchLength });
                    currentBatchStart = missingDates[i];
                    currentBatchLength = 1;
                }
            }
            batchesToLoad.push({ startDate: currentBatchStart, length: currentBatchLength });
        }

        const loadPromises = batchesToLoad.map(batch =>
            loadBatch(batch.startDate, scrollBatchSize)
        );

        await Promise.allSettled(loadPromises);
        scheduleRowspanRecalculation();
    }, [visibleRange, dates, dataCache, loadBatch, scrollBatchSize, scheduleRowspanRecalculation]);

    // Расширение дат
    const extendDates = useCallback(async (direction, isPreemptive = false) => {
        const loadPromises = [];

        if (direction === 'forward') {
            const lastDate = dates[dates.length - 1];
            if (!lastDate) return;

            const lastDateObj = parseDateString(lastDate);
            const newDates = [];
            const extendSize = isPreemptive ? scrollBatchSize * 2 : scrollBatchSize;

            for (let i = 1; i <= extendSize; i++) {
                const date = new Date(lastDateObj);
                date.setUTCDate(lastDateObj.getUTCDate() + i);
                newDates.push(formatDate(date));
            }

            setDates(prev => [...prev, ...newDates]);

            for (let i = 0; i < newDates.length; i += scrollBatchSize) {
                const batchStart = newDates[i];
                const batchSize = Math.min(scrollBatchSize, newDates.length - i);
                loadPromises.push(loadBatch(batchStart, batchSize));
            }

            await Promise.allSettled(loadPromises);
            scheduleRowspanRecalculation();

        } else if (direction === 'backward') {
            const firstDate = dates[0];
            if (!firstDate) return;

            const firstDateObj = parseDateString(firstDate);
            const newDates = [];
            const extendSize = isPreemptive ? scrollBatchSize * 2 : scrollBatchSize;

            for (let i = extendSize; i >= 1; i--) {
                const date = new Date(firstDateObj);
                date.setUTCDate(firstDateObj.getUTCDate() - i);
                newDates.push(formatDate(date));
            }

            if (containerRef.current) {
                isScrollCompensating.current = true;

                const currentScrollTop = containerRef.current.scrollTop;
                const currentFirstVisibleIndex = Math.floor(currentScrollTop / rowHeight);
                const scrollOffset = currentScrollTop % rowHeight;

                setDates(prevDates => {
                    const updatedDates = [...newDates, ...prevDates];

                    requestAnimationFrame(() => {
                        if (containerRef.current && isScrollCompensating.current) {
                            const compensatedScrollTop = (currentFirstVisibleIndex + newDates.length) * rowHeight + scrollOffset;
                            containerRef.current.scrollTop = compensatedScrollTop;
                            setScrollTop(compensatedScrollTop);

                            setTimeout(() => {
                                isScrollCompensating.current = false;
                            }, 50);
                        }
                    });

                    return updatedDates;
                });
            } else {
                setDates(prev => [...newDates, ...prev]);
            }

            for (let i = 0; i < newDates.length; i += scrollBatchSize) {
                const batchStart = newDates[i];
                const batchSize = Math.min(scrollBatchSize, newDates.length - i);
                loadPromises.push(loadBatch(batchStart, batchSize));
            }

            await Promise.allSettled(loadPromises);

            setTimeout(() => {
                scheduleRowspanRecalculation();
            }, 150);
        }
    }, [dates, scrollBatchSize, rowHeight, loadBatch, scheduleRowspanRecalculation]);

    // Обработка скролла
    const handleScrollImmediate = useCallback(async () => {
        if (!containerRef.current || isScrollCompensating.current) return;

        const container = containerRef.current;
        const newScrollTop = container.scrollTop;
        const newContainerHeight = container.clientHeight;
        const scrollHeight = container.scrollHeight;
        const currentTime = Date.now();

        const timeDelta = currentTime - lastScrollTime.current;
        const scrollDelta = newScrollTop - lastScrollTop.current;

        if (timeDelta > 0) {
            scrollVelocity.current = Math.abs(scrollDelta / timeDelta);
        }

        lastScrollTime.current = currentTime;
        lastScrollTop.current = newScrollTop;

        setScrollTop(newScrollTop);
        setContainerHeight(newContainerHeight);

        if (scrollVelocity.current <= 0.5) {
            processPendingHeaderUpdate();
        }

        const baseThreshold = rowHeight * bufferSize;
        const velocityMultiplier = Math.min(3, 1 + scrollVelocity.current * 2);
        const dynamicThreshold = baseThreshold * velocityMultiplier;

        const topThreshold = dynamicThreshold;
        const bottomThreshold = scrollHeight - newContainerHeight - dynamicThreshold;

        const needsTopExtension = newScrollTop <= topThreshold && dates.length > 0;
        const needsBottomExtension = newScrollTop >= bottomThreshold && dates.length > 0;

        const isHighVelocity = scrollVelocity.current > 1;
        const preemptiveTopThreshold = topThreshold * 2;
        const preemptiveBottomThreshold = scrollHeight - newContainerHeight - (dynamicThreshold * 2);

        const promises = [];

        if (needsTopExtension) {
            promises.push(extendDates('backward', isHighVelocity));
        }

        if (needsBottomExtension) {
            promises.push(extendDates('forward', isHighVelocity));
        }

        if (isHighVelocity) {
            if (scrollDelta < 0 && newScrollTop <= preemptiveTopThreshold) {
                promises.push(extendDates('backward', true));
            } else if (scrollDelta > 0 && newScrollTop >= preemptiveBottomThreshold) {
                promises.push(extendDates('forward', true));
            }
        }

        if (promises.length > 0) {
            await Promise.allSettled(promises);
        }
    }, [dates, extendDates, rowHeight, bufferSize, processPendingHeaderUpdate]);

    const handleScrollThrottled = useMemo(
        () => smartThrottle(handleScrollImmediate, 8),
        [handleScrollImmediate]
    );

    const handleScroll = useCallback(() => {
        if (isScrollCompensating.current) return;

        handleScrollThrottled();

        if (scrollVelocity.current > 2) {
            setTimeout(() => {
                handleScrollThrottled.flush();
            }, 50);
        }
    }, [handleScrollThrottled]);

    // Эффекты
    useEffect(() => {
        if (!isInitialized && dates.length === 0) {
            const initialDates = generateInitialDates();
            setDates(initialDates);

            const initializeTable = async () => {
                const todayFormatted = formatDate(today);
                const todayIndex = initialDates.findIndex(date => date === todayFormatted);

                if (todayIndex !== -1 && containerRef.current) {
                    await new Promise(resolve => {
                        const checkDimensions = () => {
                            if (containerRef.current?.clientHeight > 0) {
                                resolve();
                            } else {
                                requestAnimationFrame(checkDimensions);
                            }
                        };
                        checkDimensions();
                    });

                    const containerHeight = containerRef.current.clientHeight;
                    const visibleRows = Math.ceil(containerHeight / rowHeight);
                    const totalRowsNeeded = visibleRows + (bufferSize * 2);
                    const initialBatchSize = Math.max(scrollBatchSize * 2, totalRowsNeeded);

                    const startIndex = Math.max(0, todayIndex - Math.floor(initialBatchSize / 2));
                    const endIndex = Math.min(initialDates.length, startIndex + initialBatchSize);

                    const batchesToLoad = [];
                    for (let i = startIndex; i < endIndex; i += scrollBatchSize) {
                        const batchStart = initialDates[i];
                        const batchSize = Math.min(scrollBatchSize, endIndex - i);
                        batchesToLoad.push({ startDate: batchStart, size: batchSize });
                    }

                    const loadPromises = batchesToLoad.map(batch =>
                        loadBatch(batch.startDate, batch.size)
                    );

                    await Promise.allSettled(loadPromises);
                    scheduleRowspanRecalculation();

                    setTimeout(() => {
                        if (containerRef.current) {
                            const targetScroll = todayIndex * rowHeight - (containerHeight / 2) + (rowHeight / 2);
                            containerRef.current.scrollTop = Math.max(0, targetScroll);

                            setContainerHeight(containerHeight);
                            setScrollTop(containerRef.current.scrollTop);
                            setIsInitialized(true);

                            setTimeout(() => {
                                const preloadPromises = [];

                                if (startIndex > bufferSize) {
                                    const preloadStartUp = Math.max(0, startIndex - bufferSize);
                                    preloadPromises.push(loadBatch(initialDates[preloadStartUp], bufferSize));
                                }

                                if (endIndex < initialDates.length - bufferSize) {
                                    preloadPromises.push(loadBatch(initialDates[endIndex], bufferSize));
                                }

                                if (preloadPromises.length > 0) {
                                    Promise.allSettled(preloadPromises).then(() => {
                                        scheduleRowspanRecalculation();
                                    });
                                }
                            }, 200);
                        }
                    }, 100);
                }
            };

            initializeTable();
        }
    }, [isInitialized, dates.length, generateInitialDates, today, rowHeight, scrollBatchSize, loadBatch, bufferSize, scheduleRowspanRecalculation]);

    useEffect(() => {
        if (isInitialized) {
            loadVisibleData();
        }
    }, [isInitialized, loadVisibleData]);

    useEffect(() => {
        return () => {
            if (pendingRecalculation.current) {
                clearTimeout(pendingRecalculation.current);
            }
        };
    }, []);

    useEffect(() => {
        const cleanup = () => {
            const { start, end } = visibleRange;
            const keepRange = bufferSize * 3;
            const keepStart = Math.max(0, start - keepRange);
            const keepEnd = Math.min(dates.length, end + keepRange);

            const keepDates = new Set();
            for (let i = keepStart; i < keepEnd; i++) {
                if (dates[i]) keepDates.add(dates[i]);
            }

            setDataCache(prev => {
                const filtered = {};
                Object.keys(prev).forEach(date => {
                    if (keepDates.has(date)) {
                        filtered[date] = prev[date];
                    }
                });
                return Object.keys(filtered).length !== Object.keys(prev).length ? filtered : prev;
            });

            setProcessedCache(prev => {
                const filtered = {};
                Object.keys(prev).forEach(date => {
                    if (keepDates.has(date)) {
                        filtered[date] = prev[date];
                    }
                });
                return Object.keys(filtered).length !== Object.keys(prev).length ? filtered : prev;
            });
        };

        const interval = setInterval(cleanup, 5000);
        return () => clearInterval(interval);
    }, [visibleRange, dates, bufferSize]);

    // Рендеринг
    const { start: startIndex, end: endIndex } = visibleRange;
    const visibleDates = dates.slice(startIndex, endIndex);
    const paddingTop = startIndex * rowHeight;
    const paddingBottom = Math.max(0, (dates.length - endIndex) * rowHeight);

    return (
        <>
            <div
                ref={containerRef}
                style={{
                    maxWidth,
                    width: 'fit-content',
                    height: '100%',
                    maxHeight,
                    overflow: 'auto',
                    border: '1px solid #ccc',
                    position: 'relative',
                    fontFamily: 'serif',
                }}
                onScroll={handleScroll}
            >
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                    <thead
                        style={{
                            position: 'sticky',
                            top: 0,
                            background: activeColorTheme("BGHeader"),
                            zIndex: 10
                        }}>
                    <tr>
                        <th rowSpan="2" style={{
                            padding: '8px',
                            minWidth: '100px',
                            borderRight: '1px solid #ddd',
                            fontSize: '14px',
                            fontWeight: 'normal',
                            whiteSpace: 'nowrap'
                        }}>
                            Дата
                        </th>
                        {renderGroupOrder.map((groupName, index) => (
                            <th
                                key={groupName}
                                colSpan={renderHeaderStructure[groupName]?.length || 1}
                                style={{
                                    textWrap: 'nowrap',
                                    borderLeft: index > 0 ? '2px solid #fff' : 'none',
                                    padding: '8px',
                                    borderRight: '1px solid #ddd',
                                    fontSize: '14px',
                                    fontWeight: 'normal'
                                }}
                            >
                                {groupName}
                            </th>
                        ))}
                    </tr>
                    <tr>
                        {renderGroupOrder.map((groupName, groupIndex) => (
                            (renderHeaderStructure[groupName] || []).map((key, keyIndex) => (
                                <th
                                    key={`${groupName}-${key}`}
                                    style={{
                                        borderLeft: keyIndex === 0 && groupIndex > 0 ? '2px solid #fff' : 'none',
                                        padding: '5px',
                                        borderRight: '1px solid #ddd',
                                        fontSize: '12px',
                                        fontWeight: 'normal',
                                        minWidth: '60px'
                                    }}
                                >
                                    {key}
                                </th>
                            ))
                        ))}
                    </tr>
                    </thead>

                    <tbody>
                    {paddingTop > 0 && (
                        <tr style={{ height: paddingTop }}>
                            <td colSpan={1} style={{ padding: 0, border: 'none' }} />
                        </tr>
                    )}

                    {visibleDates.map((dateString, index) => {
                        const processedRow = processedCache[dateString];
                        const isLoading = !processedRow;
                        const rowDate = parseDateString(dateString);
                        const isPastDate = rowDate.getTime() < today.getTime();

                        return (
                            <tr
                                key={`${dateString}-${startIndex + index}`}
                                style={{
                                    height: `${rowHeight}px`,
                                    backgroundColor: isLoading ? 'transparent' : activeColorTheme("DATE", isPastDate),
                                }}
                            >
                                <td style={{
                                    textWrap: 'nowrap',
                                    borderLeft: index > 0 ? '2px solid #fff' : 'none',
                                    padding: '8px',
                                    borderRight: '1px solid #ddd',
                                    fontSize: '14px',
                                    fontWeight: 'normal',
                                    color: isPastDate ? '#666' : 'inherit',
                                }}>
                                    {dateString}
                                </td>

                                {renderGroupOrder.map((groupName, groupIndex) => (
                                    (renderHeaderStructure[groupName] || []).map((key, keyIndex) => {
                                        const cellValue = processedRow ? getCellValue(processedRow, groupName, key) : '—';

                                        let shouldDisplay = true;
                                        let rowSpan = 1;

                                        if (processedRow && groupName !== "Работающие агрегаты") {
                                            const elementData = processedRow.elements[key];
                                            if (elementData) {
                                                shouldDisplay = elementData.displayed;
                                                rowSpan = elementData.rowspan;
                                            }
                                        }

                                        if (!shouldDisplay) {
                                            return null;
                                        }

                                        return (
                                            <td
                                                key={`${dateString}-${groupName}-${key}`}
                                                rowSpan={rowSpan}
                                                style={{
                                                    padding: '4px',
                                                    textAlign: 'center',
                                                    backgroundColor: isLoading ?
                                                        'transparent' :
                                                        activeColorTheme(cellValue, isPastDate),
                                                    fontSize: '14px',
                                                    minWidth: '50px',
                                                    verticalAlign: 'middle',
                                                    borderLeft: keyIndex === 0 && groupIndex > 0 ? '2px solid #fff' : 'none',
                                                    fontWeight: 'normal',
                                                }}
                                            >
                                                {isLoading ? (
                                                    <div style={{
                                                        width: '16px',
                                                        height: '16px',
                                                        borderRadius: '50%',
                                                        border: '2px solid #ddd',
                                                        borderTop: '2px solid #007bff',
                                                        animation: 'spin 1s linear infinite',
                                                        margin: 'auto',
                                                    }} />
                                                ) : (
                                                    cellValue
                                                )}
                                            </td>
                                        );
                                    })
                                ))}
                            </tr>
                        );
                    })}

                    {paddingBottom > 0 && (
                        <tr style={{ height: paddingBottom }}>
                            <td colSpan={1} style={{ padding: 0, border: 'none' }} />
                        </tr>
                    )}
                    </tbody>
                </table>

                <style>
                    {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
                </style>
            </div>

            {debug && <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '6px 12px',
                margin: "20px 0",
                border: '1px solid #ddd',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#666',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                flexWrap: 'wrap',
                width: 'fit-content'
            }}>
                <span><strong>Видимые строки:</strong> {visibleDates.length}</span>
                <span><strong>Диапазон:</strong> {startIndex}-{endIndex}</span>
                <span><strong>Всего дат:</strong> {dates.length}</span>
                <span><strong>В кэше сырых данных:</strong> {Object.keys(dataCache).length}</span>
                <span><strong>В кэше обработанных:</strong> {Object.keys(processedCache).length}</span>
                <span><strong>Загружается батчей:</strong> {loadingBatches.size}</span>
                <span><strong>Размер батча:</strong> {scrollBatchSize} дней</span>
                <span><strong>Скорость скролла:</strong> {scrollVelocity.current.toFixed(2)}</span>
                <span><strong>Компенсация скролла:</strong> {isScrollCompensating.current ? 'Да' : 'Нет'}</span>
            </div>}
        </>
    );
};

// Публичное API
export const setDataProvider = (provider) => {
    customDataProvider = provider;
};

export const getDataProvider = () => {
    return customDataProvider || defaultDataProvider;
};

// Экспортируем утилиты для внешнего использования
export { formatDate, parseDateString };

export default Table;
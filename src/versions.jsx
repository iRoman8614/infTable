// import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
//
// /**
//  * Имитирует асинхронную загрузку данных для диапазона дат (батч).
//  */
// const fetchBatchData = async (startDate, days) => {
//     console.log(`Загружаем батч: ${startDate} (+${days} дней)`);
//     await new Promise(resolve => setTimeout(resolve, 300));
//
//     const stagesValues = ["М", "М", "М", "М", "М", "М", "О", "П", "ПР", "Р"];
//     const randomStageValue = () => stagesValues[Math.floor(Math.random() * stagesValues.length)];
//
//     const generateDayData = (dateStr) => {
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
//  * Обработка данных для таблицы через rowspan
//  */
// function processDataForTable(data) {
//     if (!data || data.length === 0) {
//         return { processedData: [], allElements: [], stageElements: {}, agrElements: [] };
//     }
//
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
//     const processedData = data.map(row => {
//         const processed = {
//             date: row.date,
//             elements: {}
//         };
//
//         sortedAllElements.forEach(elementName => {
//             processed.elements[elementName] = {
//                 status: '-',
//                 rowspan: 1,
//                 displayed: true
//             };
//         });
//
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
//     // вычисление rowspan для каждого элемента
//     sortedAllElements.forEach(elementName => {
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
//         processedData.forEach(row => {
//             if (row.elements[elementName]) {
//                 row.elements[elementName].rowspan = 1;
//                 row.elements[elementName].displayed = true;
//             }
//         });
//
//         let i = 0;
//         while (i < processedData.length) {
//             const currentRow = processedData[i];
//             const currentStatus = currentRow.elements[elementName]?.status;
//
//             if (currentStatus === 'М' || currentStatus === 'Р' || currentStatus === '-' || currentStatus === undefined) {
//                 i++;
//                 continue;
//             }
//
//             let spanCount = 1;
//             let j = i + 1;
//
//             while (j < processedData.length) {
//                 const nextRow = processedData[j];
//                 const nextStatus = nextRow.elements[elementName]?.status;
//
//                 if (nextStatus === currentStatus) {
//                     spanCount++;
//                     nextRow.elements[elementName].displayed = false;
//                     j++;
//                 } else {
//                     break;
//                 }
//             }
//
//             if (spanCount > 1) {
//                 currentRow.elements[elementName].rowspan = spanCount;
//             }
//             i = j;
//         }
//     });
//
//     return { processedData, sortedAllElements, stageElements, agrElements: sortedAgrElements };
// }
//
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
//  * Виртуализированная таблица с rowspan и бесконечным скроллом
//  */
// export const Table = ({ maxWidth = '100%', maxHeight = '600px', colorTheme, scrollBatchSize = 7, debug = true }) => {
//     const [dates, setDates] = useState([]);
//     const [dataCache, setDataCache] = useState({});
//     const [processedCache, setProcessedCache] = useState({});
//     const [loadingBatches, setLoadingBatches] = useState(new Set());
//     const [isInitialized, setIsInitialized] = useState(false);
//
//     const [headerStructure, setHeaderStructure] = useState({});
//     const [groupOrder, setGroupOrder] = useState([]);
//
//     const [scrollTop, setScrollTop] = useState(0);
//     const [containerHeight, setContainerHeight] = useState(0);
//
//     const containerRef = useRef(null);
//     const fetchingPromises = useRef({});
//     const scrollVelocity = useRef(0);
//     const lastScrollTime = useRef(0);
//     const lastScrollTop = useRef(0);
//     const isScrollCompensating = useRef(false);
//     const pendingRecalculation = useRef(null);
//
//     const stableHeaderStructure = useRef({});
//     const stableGroupOrder = useRef([]);
//     const headerUpdatePending = useRef(false);
//
//     const rowHeight = 40;
//     const bufferSize = 20;
//
//     const today = useMemo(() => {
//         const date = new Date();
//         date.setUTCHours(0, 0, 0, 0);
//         return date;
//     }, []);
//
//     const defaultColorTheme = useCallback((value, isPast) => {
//         switch (value) {
//             case "М": return "#cdef8d"; // Светло-зеленый
//             case "О": return "#ffce42"; // Желтый
//             case "П": return "#86cb89"; // Зеленый
//             case "ПР": return "#4a86e8";// Синий
//             case "Р": return "white";   // Белый
//             case "BGHeader":  return "#dee3f5"; // Цвет заголовка таблицы
//             case "DATE": return isPast ?  "#acb5e3" : "white" // Цвет заполнения дат
//             case 0: return isPast ? '#acb5e3' : 'white'; // Светло-синий для прошедших дат, иначе белый
//             default: return isPast ? '#acb5e3' : 'white'; // Светло-синий для прошедших дат, иначе белый
//         }
//     }, []);
//
//     const activeColorTheme = colorTheme || defaultColorTheme;
//
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
//     const updateHeaderStructure = useCallback((newDataEntries) => {
//         if (isScrollCompensating.current || scrollVelocity.current > 0.5) {
//             headerUpdatePending.current = true;
//             return;
//         }
//
//         const newStructure = {};
//         const newGroupOrder = [];
//
//         const allDataEntries = [...Object.values(dataCache), ...newDataEntries];
//
//         const uniqueAgrKeys = new Set();
//         const uniqueStageGroups = {};
//
//         allDataEntries.forEach(dayData => {
//             for (const key in dayData) {
//                 if (key.startsWith('agr')) {
//                     uniqueAgrKeys.add(key);
//                 } else if (key.startsWith('stage') && Array.isArray(dayData[key])) {
//                     const stageName = key;
//                     if (!uniqueStageGroups[stageName]) {
//                         uniqueStageGroups[stageName] = new Set();
//                     }
//                     dayData[key].forEach(item => {
//                         Object.keys(item).forEach(itemKey => {
//                             uniqueStageGroups[stageName].add(itemKey);
//                         });
//                     });
//                 }
//             }
//         });
//
//         const agrElements = Array.from(uniqueAgrKeys).sort();
//         if (agrElements.length > 0) {
//             newStructure["Работающие агрегаты"] = agrElements;
//         }
//
//         const sortedStageKeys = Object.keys(uniqueStageGroups).sort((a, b) => {
//             const numA = parseInt(a.replace('stage', ''), 10);
//             const numB = parseInt(b.replace('stage', ''), 10);
//             return numA - numB;
//         });
//
//         sortedStageKeys.forEach(stageKey => {
//             const groupName = `${stageKey.replace('stage', '')} Ступень`;
//             newStructure[groupName] = Array.from(uniqueStageGroups[stageKey]).sort();
//         });
//
//         if (newStructure["Работающие агрегаты"]) {
//             newGroupOrder.push("Работающие агрегаты");
//         }
//         newGroupOrder.push(...sortedStageKeys.map(stageKey => `${stageKey.replace('stage', '')} Ступень`));
//
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
//     }, [dataCache]);
//
//     // Отложенное обновление структуры заголовков после окончания скролла
//     const processPendingHeaderUpdate = useCallback(() => {
//         if (headerUpdatePending.current && scrollVelocity.current <= 0.1 && !isScrollCompensating.current) {
//             updateHeaderStructure([]);
//         }
//     }, [updateHeaderStructure]);
//
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
//     // ИСПРАВЛЕНИЕ: Стабильные значения для рендеринга таблицы
//     const renderHeaderStructure = useMemo(() => {
//         // Используем стабильную структуру во время скролла
//         if (scrollVelocity.current > 0.5 && Object.keys(stableHeaderStructure.current).length > 0) {
//             return stableHeaderStructure.current;
//         }
//         return headerStructure;
//     }, [headerStructure]);
//
//     const renderGroupOrder = useMemo(() => {
//         // Используем стабильный порядок во время скролла
//         if (scrollVelocity.current > 0.5 && stableGroupOrder.current.length > 0) {
//             return stableGroupOrder.current;
//         }
//         return groupOrder;
//     }, [groupOrder]);
//
//     const loadBatch = useCallback(async (startDate, batchSize) => {
//         const batchKey = `${startDate}+${batchSize}`;
//
//         if (fetchingPromises.current[batchKey] || loadingBatches.has(batchKey)) {
//             return fetchingPromises.current[batchKey];
//         }
//
//         setLoadingBatches(prev => new Set([...prev, batchKey]));
//
//         const promise = fetchBatchData(startDate, batchSize)
//             .then(batchData => {
//                 setDataCache(prev => {
//                     const updated = { ...prev };
//                     batchData.data.forEach(dayData => {
//                         updated[dayData.date] = dayData;
//                     });
//                     return updated;
//                 });
//
//                 updateHeaderStructure(batchData.data);
//                 return batchData;
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
//     }, [loadingBatches, updateHeaderStructure]);
//
//     // Отложенный пересчет rowspan с учетом скорости скролла
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
//     const loadVisibleData = useCallback(async () => {
//         const { start, end } = visibleRange;
//         const visibleDates = dates.slice(start, end);
//         const missingDates = visibleDates.filter(date => !dataCache[date]);
//
//         if (missingDates.length === 0) return;
//
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
//     // ИСПРАВЛЕНИЕ: Полностью переписанная функция extendDates с правильной компенсацией скролла
//     const extendDates = useCallback(async (direction, isPreemptive = false) => {
//         const loadPromises = [];
//
//         if (direction === 'forward') {
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
//                 // ИСПРАВЛЕНИЕ: Используем callback setState для получения актуального состояния
//                 setDates(prevDates => {
//                     const updatedDates = [...newDates, ...prevDates];
//
//                     // Компенсация скролла в том же обновлении состояния
//                     requestAnimationFrame(() => {
//                         if (containerRef.current && isScrollCompensating.current) {
//                             // Рассчитываем новую позицию на основе актуального состояния
//                             const compensatedScrollTop = (currentFirstVisibleIndex + newDates.length) * rowHeight + scrollOffset;
//                             containerRef.current.scrollTop = compensatedScrollTop;
//                             setScrollTop(compensatedScrollTop);
//
//                             // Сбрасываем флаг компенсации через небольшую задержку
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
//             for (let i = 0; i < newDates.length; i += scrollBatchSize) {
//                 const batchStart = newDates[i];
//                 const batchSize = Math.min(scrollBatchSize, newDates.length - i);
//                 loadPromises.push(loadBatch(batchStart, batchSize));
//             }
//
//             await Promise.allSettled(loadPromises);
//
//             // Отложенный пересчет rowspan после завершения компенсации
//             setTimeout(() => {
//                 scheduleRowspanRecalculation();
//             }, 150);
//         }
//     }, [dates, scrollBatchSize, rowHeight, loadBatch, scheduleRowspanRecalculation]);
//
//     const handleScrollImmediate = useCallback(async () => {
//         if (!containerRef.current) return;
//
//         // ИСПРАВЛЕНИЕ: Игнорируем события скролла во время компенсации
//         if (isScrollCompensating.current) return;
//
//         const container = containerRef.current;
//         const newScrollTop = container.scrollTop;
//         const newContainerHeight = container.clientHeight;
//         const scrollHeight = container.scrollHeight;
//         const currentTime = Date.now();
//
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
//         // Обрабатываем отложенные обновления заголовков при замедлении скролла
//         if (scrollVelocity.current <= 0.5) {
//             processPendingHeaderUpdate();
//         }
//
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
//
//                     // Пересчитываем rowspan для всех загруженных данных
//                     scheduleRowspanRecalculation();
//
//                     setTimeout(() => {
//                         if (containerRef.current) {
//                             const targetScroll = todayIndex * rowHeight - (containerHeight / 2) + (rowHeight / 2);
//                             containerRef.current.scrollTop = Math.max(0, targetScroll);
//
//                             setContainerHeight(containerHeight);
//                             setScrollTop(containerRef.current.scrollTop);
//                             setIsInitialized(true);
//
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
//     useEffect(() => {
//         if (isInitialized) {
//             loadVisibleData();
//         }
//     }, [isInitialized, loadVisibleData]);
//
//     // Очистка таймаутов при размонтировании
//     useEffect(() => {
//         return () => {
//             if (pendingRecalculation.current) {
//                 clearTimeout(pendingRecalculation.current);
//             }
//         };
//     }, []);
//
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
//     const { start: startIndex, end: endIndex } = visibleRange;
//     const visibleDates = dates.slice(startIndex, endIndex);
//     const paddingTop = startIndex * rowHeight;
//     const paddingBottom = Math.max(0, (dates.length - endIndex) * rowHeight);
//
//     return (
//         <>
//             <div
//                 style={{
//                     display: 'flex',
//                     gap: '20px',
//                 }}
//             >
//                 <div>План 1</div>
//                 <div>Отображать отклонения</div>
//                 <div>Режим редактирования</div>
//                 <div>Задать фильтр</div>
//             </div>
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
//                     <thead
//                         style={{
//                             position: 'sticky',
//                             top: 0,
//                             background: activeColorTheme("BGHeader"),
//                             zIndex: 10
//                         }}>
//                     <tr>
//                         <th rowSpan="1" style={{
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
//                     <tr>
//                         <td style={{
//                             padding: '8px',
//                             minWidth: '100px',
//                             borderRight: '1px solid #ddd',
//                             fontSize: '14px',
//                             fontWeight: 'normal',
//                             whiteSpace: 'nowrap'
//                         }}>
//                             <input type={'date'} placeholder={'перейти к дате'} />
//                         </td>
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
//                     <tbody>
//                     {paddingTop > 0 && (
//                         <tr style={{ height: paddingTop }}>
//                             <td colSpan={1} style={{ padding: 0, border: 'none' }} />
//                         </tr>
//                     )}
//
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
//                                 {renderGroupOrder.map((groupName, groupIndex) => (
//                                     (renderHeaderStructure[groupName] || []).map((key, keyIndex) => {
//                                         const cellValue = processedRow ? getCellValue(processedRow, groupName, key) : '—';
//
//                                         let shouldDisplay = true;
//                                         let rowSpan = 1;
//
//                                         if (processedRow && groupName !== "Работающие агрегаты") {
//                                             const elementData = processedRow.elements[key];
//                                             if (elementData) {
//                                                 shouldDisplay = elementData.displayed;
//                                                 rowSpan = elementData.rowspan;
//                                             }
//                                         }
//
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
//                                                     borderRight: '1px solid #ddd',
//                                                     fontWeight: 'normal',
//                                                 }}
//                                             >
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
//                     {paddingBottom > 0 && (
//                         <tr style={{ height: paddingBottom }}>
//                             <td colSpan={1} style={{ padding: 0, border: 'none' }} />
//                         </tr>
//                     )}
//                     </tbody>
//                 </table>
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

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Имитирует асинхронную загрузку данных для диапазона дат (батч).
 */
const fetchBatchData = async (startDate, days) => {
    console.log(`Загружаем батч: ${startDate} (+${days} дней)`);
    await new Promise(resolve => setTimeout(resolve, 300));

    const stagesValues = ["М", "М", "М", "М", "М", "М", "О", "П", "ПР", "Р"];
    const randomStageValue = () => stagesValues[Math.floor(Math.random() * stagesValues.length)];
    const randomWorkHours = () => Array.from({length: Math.floor(Math.random() * 4) + 1}, () => Math.floor(Math.random() * 1000) + 100);

    const generateDayData = (dateStr) => {
        let stage1 = [
            {"name": "20ГПА-1-2", "status": randomStageValue(), "work_hours": randomWorkHours()},
            {"name": "20ГПА-1-3", "status": randomStageValue(), "work_hours": randomWorkHours()},
            {"name": "20ГПА-1-1", "status": randomStageValue(), "work_hours": randomWorkHours()},
            {"name": "20ГПА-1-4", "status": randomStageValue(), "work_hours": randomWorkHours()},
        ];
        let stage2 = [
            {"name": "20ГПА-2-2", "status": randomStageValue(), "work_hours": randomWorkHours()},
            {"name": "20ГПА-2-3", "status": randomStageValue(), "work_hours": randomWorkHours()},
            {"name": "20ГПА-2-1", "status": randomStageValue(), "work_hours": randomWorkHours()},
            {"name": "20ГПА-2-4", "status": randomStageValue(), "work_hours": randomWorkHours()},
        ];
        let stage3 = [
            {"name": "20ГПА-3-2", "status": randomStageValue(), "work_hours": randomWorkHours()},
            {"name": "20ГПА-3-3", "status": randomStageValue(), "work_hours": randomWorkHours()},
            {"name": "20ГПА-3-1", "status": randomStageValue(), "work_hours": randomWorkHours()},
            {"name": "20ГПА-3-4", "status": randomStageValue(), "work_hours": randomWorkHours()},
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
 * Обработка данных для таблицы через rowspan
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
                    const elementName = item.name;
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
                work_hours: [],
                rowspan: 1,
                displayed: true
            };
        });

        for (const key in row) {
            if (key.startsWith('stage') && Array.isArray(row[key])) {
                row[key].forEach(item => {
                    const elementName = item.name;
                    const status = item.status;
                    const workHours = item.work_hours || [];
                    if (processed.elements[elementName]) {
                        processed.elements[elementName].status = status;
                        processed.elements[elementName].work_hours = workHours;
                    }
                });
            } else if (key.startsWith('agr')) {
                if (processed.elements[key]) {
                    processed.elements[key].status = row[key];
                    processed.elements[key].work_hours = [];
                }
            }
        }

        return processed;
    });

    // вычисление rowspan для каждого элемента
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
 * Виртуализированная таблица с rowspan и бесконечным скроллом
 */
export const Table = ({ maxWidth = '100%', maxHeight = '600px', colorTheme, scrollBatchSize = 7, debug = true }) => {
    const [dates, setDates] = useState([]);
    const [dataCache, setDataCache] = useState({});
    const [processedCache, setProcessedCache] = useState({});
    const [loadingBatches, setLoadingBatches] = useState(new Set());
    const [isInitialized, setIsInitialized] = useState(false);
    const [showWorkHours, setShowWorkHours] = useState(false);

    const [headerStructure, setHeaderStructure] = useState({});
    const [groupOrder, setGroupOrder] = useState([]);

    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

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

    const rowHeight = 40;
    const bufferSize = 20;

    const today = useMemo(() => {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        return date;
    }, []);

    const defaultColorTheme = useCallback((value, isPast) => {
        switch (value) {
            case "М": return "#cdef8d"; // Светло-зеленый
            case "О": return "#ffce42"; // Желтый
            case "П": return "#86cb89"; // Зеленый
            case "ПР": return "#4a86e8";// Синий
            case "Р": return "white";   // Белый
            case "BGHeader":  return "#dee3f5"; // Цвет заголовка таблицы
            case "DATE": return isPast ?  "#acb5e3" : "white"; // Цвет заполнения дат
            case 0: return isPast ? '#acb5e3' : 'white'; // Светло-синий для прошедших дат, иначе белый
            default: return isPast ? '#acb5e3' : 'white'; // Светло-синий для прошедших дат, иначе белый
        }
    }, []);

    const activeColorTheme = colorTheme || defaultColorTheme;

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

    const updateHeaderStructure = useCallback((newDataEntries) => {
        if (isScrollCompensating.current || scrollVelocity.current > 0.5) {
            headerUpdatePending.current = true;
            return;
        }

        const newStructure = {};
        const newGroupOrder = [];

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
                        uniqueStageGroups[stageName].add(item.name);
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

        const structureChanged = JSON.stringify(stableHeaderStructure.current) !== JSON.stringify(newStructure);

        if (structureChanged) {
            stableHeaderStructure.current = newStructure;
            stableGroupOrder.current = newGroupOrder;
            setHeaderStructure(newStructure);
            setGroupOrder(newGroupOrder);
        }

        headerUpdatePending.current = false;
    }, [dataCache]);

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

        if (processedRow.elements && processedRow.elements[key]) {
            const element = processedRow.elements[key];
            if (showWorkHours && element.work_hours && element.work_hours.length > 0) {
                return (
                    <>
                        {element.status}
                        <br />
                        <span style={{ fontSize: '10px' }}>
                            {element.work_hours.map((hour, index) => (<span key={index}>{hour}<br/></span>))}
                        </span>
                    </>
                );
            }
            return element.status;
        }

        return '—';
    }, [dataCache, showWorkHours]);

    const getCellStatus = useCallback((processedRow, groupName, key) => {
        if (groupName === "Работающие агрегаты") {
            const originalData = dataCache[processedRow.date];
            return originalData && originalData[key] !== undefined ? originalData[key] : '—';
        }

        if (processedRow.elements && processedRow.elements[key]) {
            return processedRow.elements[key].status;
        }

        return '—';
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

    const loadBatch = useCallback(async (startDate, batchSize) => {
        const batchKey = `${startDate}+${batchSize}`;

        if (fetchingPromises.current[batchKey] || loadingBatches.has(batchKey)) {
            return fetchingPromises.current[batchKey];
        }

        setLoadingBatches(prev => new Set([...prev, batchKey]));

        const promise = fetchBatchData(startDate, batchSize)
            .then(batchData => {
                setDataCache(prev => {
                    const updated = { ...prev };
                    batchData.data.forEach(dayData => {
                        updated[dayData.date] = dayData;
                    });
                    return updated;
                });

                updateHeaderStructure(batchData.data);
                return batchData;
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
    }, [loadingBatches, updateHeaderStructure]);

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

    const { start: startIndex, end: endIndex } = visibleRange;
    const visibleDates = dates.slice(startIndex, endIndex);
    const paddingTop = startIndex * rowHeight;
    const paddingBottom = Math.max(0, (dates.length - endIndex) * rowHeight);

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    gap: '20px',
                    marginBottom: '10px',
                    alignItems: 'center'
                }}
            >
                <div>План 1</div>
                <div>Отображать отклонения</div>
                <div>Режим редактирования</div>
                <div>Задать фильтр</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={showWorkHours}
                        onChange={(e) => setShowWorkHours(e.target.checked)}
                    />
                    Показать часы работы
                </label>
            </div>
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
                        <th rowSpan="1" style={{
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
                        <td style={{
                            padding: '8px',
                            minWidth: '100px',
                            borderRight: '1px solid #ddd',
                            fontSize: '14px',
                            fontWeight: 'normal',
                            whiteSpace: 'nowrap'
                        }}>
                            <input type={'date'} placeholder={'перейти к дате'} />
                        </td>
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
                                        const cellStatus = processedRow ? getCellStatus(processedRow, groupName, key) : '—';

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
                                                        activeColorTheme(cellStatus, isPastDate),
                                                    fontSize: '14px',
                                                    minWidth: '50px',
                                                    verticalAlign: 'middle',
                                                    borderLeft: keyIndex === 0 && groupIndex > 0 ? '2px solid #fff' : 'none',
                                                    borderRight: '1px solid #ddd',
                                                    fontWeight: 'normal'
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
                <span><strong>Показать часы работы:</strong> {showWorkHours ? 'Да' : 'Нет'}</span>
            </div>}
        </>
    );
};

// import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
//
// /**
//  * Имитирует асинхронную загрузку данных для диапазона дат (батч).
//  */
// const fetchBatchData = async (startDate, days) => {
//     console.log(`Загружаем батч: ${startDate} (+${days} дней)`);
//     await new Promise(resolve => setTimeout(resolve, 300));
//
//     const stagesValues = ["М", "М", "М", "М", "М", "М", "О", "П", "ПР", "Р"];
//     const randomStageValue = () => stagesValues[Math.floor(Math.random() * stagesValues.length)];
//     const componentKeys = ["ГТД", "ГПА", "ОГК", "ДУС", "Трансмиссия"];
//
//     const randomWorkHours = () => {
//         const hours = {};
//         const availableComponents = componentKeys.filter(() => Math.random() > 0.3);
//         if (availableComponents.length === 0) availableComponents.push(componentKeys[0]);
//
//         availableComponents.forEach(component => {
//             hours[component] = Math.floor(Math.random() * 1000) + 100;
//         });
//         return hours;
//     };
//
//     const generateDayData = (dateStr) => {
//         const stages = [
//             {
//                 name: "1 Ступень",
//                 aggregates: [
//                     { name: "20ГПА-1-1", status: randomStageValue(), work_hours: randomWorkHours() },
//                     { name: "20ГПА-1-2", status: randomStageValue(), work_hours: randomWorkHours() },
//                     { name: "20ГПА-1-3", status: randomStageValue(), work_hours: randomWorkHours() },
//                     { name: "20ГПА-1-4", status: randomStageValue(), work_hours: randomWorkHours() }
//                 ]
//             },
//             {
//                 name: "2 Ступень",
//                 aggregates: [
//                     { name: "20ГПА-2-1", status: randomStageValue(), work_hours: randomWorkHours() },
//                     { name: "20ГПА-2-2", status: randomStageValue(), work_hours: randomWorkHours() },
//                     { name: "20ГПА-2-3", status: randomStageValue(), work_hours: randomWorkHours() },
//                     { name: "20ГПА-2-4", status: randomStageValue(), work_hours: randomWorkHours() }
//                 ]
//             },
//             {
//                 name: "3 Ступень",
//                 aggregates: [
//                     { name: "20ГПА-3-1", status: randomStageValue(), work_hours: randomWorkHours() },
//                     { name: "20ГПА-3-2", status: randomStageValue(), work_hours: randomWorkHours() },
//                     { name: "20ГПА-3-3", status: randomStageValue(), work_hours: randomWorkHours() },
//                     { name: "20ГПА-3-4", status: randomStageValue(), work_hours: randomWorkHours() }
//                 ]
//             }
//         ];
//
//         const result = {
//             date: dateStr,
//             stages: stages
//         };
//
//         if (Math.random() > 0.3) {
//             result.working_aggregates = {
//                 agr1: Math.floor(Math.random() * 10),
//                 agr2: Math.floor(Math.random() * 10)
//             };
//             if (Math.random() > 0.7) {
//                 result.working_aggregates.agr3 = Math.floor(Math.random() * 10);
//             }
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
//  * Обработка данных для таблицы через rowspan
//  */
// function processDataForTable(data) {
//     if (!data || data.length === 0) {
//         return { processedData: [], allElements: [], stageElements: {}, agrElements: [] };
//     }
//
//     const allElements = new Set();
//     const stageElements = {};
//     const agrKeys = new Set();
//
//     data.forEach(row => {
//         if (row.stages && Array.isArray(row.stages)) {
//             row.stages.forEach(stage => {
//                 const stageName = stage.name;
//                 if (!stageElements[stageName]) {
//                     stageElements[stageName] = new Set();
//                 }
//
//                 if (stage.aggregates && Array.isArray(stage.aggregates)) {
//                     stage.aggregates.forEach(aggregate => {
//                         const elementName = aggregate.name;
//                         allElements.add(elementName);
//                         stageElements[stageName].add(elementName);
//                     });
//                 }
//             });
//         }
//
//         if (row.working_aggregates && typeof row.working_aggregates === 'object') {
//             Object.keys(row.working_aggregates).forEach(key => {
//                 agrKeys.add(key);
//                 allElements.add(key);
//             });
//         }
//     });
//
//     const sortedAllElements = Array.from(allElements).sort();
//     const sortedAgrElements = Array.from(agrKeys).sort();
//
//     const processedData = data.map(row => {
//         const processed = {
//             date: row.date,
//             elements: {}
//         };
//
//         sortedAllElements.forEach(elementName => {
//             processed.elements[elementName] = {
//                 status: '-',
//                 work_hours: {},
//                 rowspan: 1,
//                 displayed: true
//             };
//         });
//
//         if (row.stages && Array.isArray(row.stages)) {
//             row.stages.forEach(stage => {
//                 if (stage.aggregates && Array.isArray(stage.aggregates)) {
//                     stage.aggregates.forEach(aggregate => {
//                         const elementName = aggregate.name;
//                         if (processed.elements[elementName]) {
//                             processed.elements[elementName].status = aggregate.status;
//                             processed.elements[elementName].work_hours = aggregate.work_hours || {};
//                         }
//                     });
//                 }
//             });
//         }
//
//         if (row.working_aggregates && typeof row.working_aggregates === 'object') {
//             Object.entries(row.working_aggregates).forEach(([key, value]) => {
//                 if (processed.elements[key]) {
//                     processed.elements[key].status = value;
//                     processed.elements[key].work_hours = {};
//                 }
//             });
//         }
//
//         return processed;
//     });
//
//     // Вычисление rowspan для каждого элемента
//     sortedAllElements.forEach(elementName => {
//         if (agrKeys.has(elementName)) {
//             processedData.forEach(row => {
//                 if (row.elements[elementName]) {
//                     row.elements[elementName].rowspan = 1;
//                     row.elements[elementName].displayed = true;
//                 }
//             });
//             return;
//         }
//
//         processedData.forEach(row => {
//             if (row.elements[elementName]) {
//                 row.elements[elementName].rowspan = 1;
//                 row.elements[elementName].displayed = true;
//             }
//         });
//
//         let i = 0;
//         while (i < processedData.length) {
//             const currentRow = processedData[i];
//             const currentStatus = currentRow.elements[elementName]?.status;
//
//             if (currentStatus === 'М' || currentStatus === 'Р' || currentStatus === '-' || currentStatus === undefined) {
//                 i++;
//                 continue;
//             }
//
//             let spanCount = 1;
//             let j = i + 1;
//
//             while (j < processedData.length) {
//                 const nextRow = processedData[j];
//                 const nextStatus = nextRow.elements[elementName]?.status;
//
//                 if (nextStatus === currentStatus) {
//                     spanCount++;
//                     nextRow.elements[elementName].displayed = false;
//                     j++;
//                 } else {
//                     break;
//                 }
//             }
//
//             if (spanCount > 1) {
//                 currentRow.elements[elementName].rowspan = spanCount;
//             }
//             i = j;
//         }
//     });
//
//     return { processedData, sortedAllElements, stageElements, agrElements: sortedAgrElements };
// }
//
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
//  * Виртуализированная таблица с rowspan и бесконечным скроллом
//  */
// export const Table = ({ maxWidth = '100%', maxHeight = '600px', colorTheme, scrollBatchSize = 7, debug = true }) => {
//     // Основные состояния
//     const [dates, setDates] = useState([]);
//     const [dataCache, setDataCache] = useState({});
//     const [processedCache, setProcessedCache] = useState({});
//     const [loadingBatches, setLoadingBatches] = useState(new Set());
//     const [isInitialized, setIsInitialized] = useState(false);
//
//     // Состояния для фильтров и настроек
//     const [showWorkHours, setShowWorkHours] = useState(false);
//     const [showFilters, setShowFilters] = useState(false);
//     const [groupVisibility, setGroupVisibility] = useState({});
//     const [elementVisibility, setElementVisibility] = useState({});
//     const [componentVisibility, setComponentVisibility] = useState({});
//
//     // Состояния для структуры заголовков
//     const [headerStructure, setHeaderStructure] = useState({});
//     const [groupOrder, setGroupOrder] = useState([]);
//
//     // Состояния для скролла
//     const [scrollTop, setScrollTop] = useState(0);
//     const [containerHeight, setContainerHeight] = useState(0);
//
//     // Refs
//     const containerRef = useRef(null);
//     const fetchingPromises = useRef({});
//     const scrollVelocity = useRef(0);
//     const lastScrollTime = useRef(0);
//     const lastScrollTop = useRef(0);
//     const isScrollCompensating = useRef(false);
//     const pendingRecalculation = useRef(null);
//     const stableHeaderStructure = useRef({});
//     const stableGroupOrder = useRef([]);
//     const headerUpdatePending = useRef(false);
//
//     // Константы
//     const rowHeight = 40;
//     const bufferSize = 20;
//
//     const today = useMemo(() => {
//         const date = new Date();
//         date.setUTCHours(0, 0, 0, 0);
//         return date;
//     }, []);
//
//     const defaultColorTheme = useCallback((value, isPast) => {
//         switch (value) {
//             case "М": return "#cdef8d";
//             case "О": return "#ffce42";
//             case "П": return "#86cb89";
//             case "ПР": return "#4a86e8";
//             case "Р": return "white";
//             case "BGHeader": return "#dee3f5";
//             case "DATE": return isPast ? "#acb5e3" : "white";
//             case 0: return isPast ? '#acb5e3' : 'white';
//             default: return isPast ? '#acb5e3' : 'white';
//         }
//     }, []);
//
//     const activeColorTheme = colorTheme || defaultColorTheme;
//
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
//     const updateHeaderStructure = useCallback((newDataEntries) => {
//         if (isScrollCompensating.current || scrollVelocity.current > 0.5) {
//             headerUpdatePending.current = true;
//             return;
//         }
//
//         const newStructure = {};
//         const newGroupOrder = [];
//         const allDataEntries = [...Object.values(dataCache), ...newDataEntries];
//         const uniqueAgrKeys = new Set();
//         const uniqueStageGroups = {};
//         const allComponentKeys = new Set();
//
//         allDataEntries.forEach(dayData => {
//             if (dayData.working_aggregates && typeof dayData.working_aggregates === 'object') {
//                 Object.keys(dayData.working_aggregates).forEach(key => {
//                     uniqueAgrKeys.add(key);
//                 });
//             }
//
//             if (dayData.stages && Array.isArray(dayData.stages)) {
//                 dayData.stages.forEach(stage => {
//                     const stageName = stage.name;
//                     if (!uniqueStageGroups[stageName]) {
//                         uniqueStageGroups[stageName] = new Set();
//                     }
//
//                     if (stage.aggregates && Array.isArray(stage.aggregates)) {
//                         stage.aggregates.forEach(aggregate => {
//                             uniqueStageGroups[stageName].add(aggregate.name);
//
//                             if (aggregate.work_hours && typeof aggregate.work_hours === 'object') {
//                                 Object.keys(aggregate.work_hours).forEach(componentKey => {
//                                     allComponentKeys.add(componentKey);
//                                 });
//                             }
//                         });
//                     }
//                 });
//             }
//         });
//
//         const agrElements = Array.from(uniqueAgrKeys).sort();
//         if (agrElements.length > 0) {
//             newStructure["Работающие агрегаты"] = agrElements;
//             newGroupOrder.push("Работающие агрегаты");
//         }
//
//         const sortedStageNames = Object.keys(uniqueStageGroups).sort((a, b) => {
//             const numA = parseInt(a.match(/(\d+)/)?.[0] || '0');
//             const numB = parseInt(b.match(/(\d+)/)?.[0] || '0');
//             return numA - numB;
//         });
//
//         sortedStageNames.forEach(stageName => {
//             newStructure[stageName] = Array.from(uniqueStageGroups[stageName]).sort();
//             newGroupOrder.push(stageName);
//         });
//
//         const structureChanged = JSON.stringify(stableHeaderStructure.current) !== JSON.stringify(newStructure);
//
//         if (structureChanged) {
//             stableHeaderStructure.current = newStructure;
//             stableGroupOrder.current = newGroupOrder;
//             setHeaderStructure(newStructure);
//             setGroupOrder(newGroupOrder);
//
//             setGroupVisibility(prev => {
//                 const updated = { ...prev };
//                 newGroupOrder.forEach(groupName => {
//                     if (updated[groupName] === undefined) {
//                         updated[groupName] = true;
//                     }
//                 });
//                 return updated;
//             });
//
//             setElementVisibility(prev => {
//                 const updated = { ...prev };
//                 Object.entries(newStructure).forEach(([groupName, elements]) => {
//                     elements.forEach(element => {
//                         if (updated[element] === undefined) {
//                             updated[element] = true;
//                         }
//                     });
//                 });
//                 return updated;
//             });
//
//             setComponentVisibility(prev => {
//                 const updated = { ...prev };
//                 Object.entries(newStructure).forEach(([groupName, elements]) => {
//                     if (groupName !== "Работающие агрегаты") {
//                         elements.forEach(element => {
//                             if (!updated[element]) {
//                                 const componentObj = {};
//                                 Array.from(allComponentKeys).forEach(componentKey => {
//                                     componentObj[componentKey] = true;
//                                 });
//                                 updated[element] = componentObj;
//                             } else {
//                                 Array.from(allComponentKeys).forEach(componentKey => {
//                                     if (updated[element][componentKey] === undefined) {
//                                         updated[element][componentKey] = true;
//                                     }
//                                 });
//                             }
//                         });
//                     }
//                 });
//                 return updated;
//             });
//         }
//
//         headerUpdatePending.current = false;
//     }, [dataCache]);
//
//     const processPendingHeaderUpdate = useCallback(() => {
//         if (headerUpdatePending.current && scrollVelocity.current <= 0.1 && !isScrollCompensating.current) {
//             updateHeaderStructure([]);
//         }
//     }, [updateHeaderStructure]);
//
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
//     const filteredHeaderStructure = useMemo(() => {
//         const filtered = {};
//         Object.entries(renderHeaderStructure).forEach(([groupName, elements]) => {
//             if (groupVisibility[groupName]) {
//                 filtered[groupName] = elements.filter(element => elementVisibility[element]);
//             }
//         });
//         return filtered;
//     }, [renderHeaderStructure, groupVisibility, elementVisibility]);
//
//     const filteredGroupOrder = useMemo(() => {
//         return renderGroupOrder.filter(groupName =>
//             groupVisibility[groupName] &&
//             filteredHeaderStructure[groupName] &&
//             filteredHeaderStructure[groupName].length > 0
//         );
//     }, [renderGroupOrder, groupVisibility, filteredHeaderStructure]);
//
//     const getCellValue = useCallback((processedRow, groupName, key) => {
//         if (groupName === "Работающие агрегаты") {
//             const originalData = dataCache[processedRow.date];
//             if (originalData?.working_aggregates?.[key] !== undefined) {
//                 return originalData.working_aggregates[key];
//             }
//             return '—';
//         }
//
//         if (processedRow.elements && processedRow.elements[key]) {
//             const element = processedRow.elements[key];
//             if (showWorkHours && element.work_hours && Object.keys(element.work_hours).length > 0) {
//                 const visibleComponents = Object.entries(element.work_hours)
//                     .filter(([componentKey]) => componentVisibility[key]?.[componentKey])
//                     .map(([componentKey, hours]) => `${hours}`);
//
//                 if (visibleComponents.length > 0) {
//                     return (
//                         <>
//                             {element.status}
//                             <br />
//                             <span style={{ fontSize: '10px' }}>
//                                 {visibleComponents.map((component, index) => (
//                                     <span key={index}>{component}<br/></span>
//                                 ))}
//                             </span>
//                         </>
//                     );
//                 }
//             }
//             return element.status;
//         }
//
//         return '—';
//     }, [dataCache, showWorkHours, componentVisibility]);
//
//     const getCellStatus = useCallback((processedRow, groupName, key) => {
//         if (groupName === "Работающие агрегаты") {
//             const originalData = dataCache[processedRow.date];
//             if (originalData?.working_aggregates?.[key] !== undefined) {
//                 return originalData.working_aggregates[key];
//             }
//             return '—';
//         }
//
//         if (processedRow.elements && processedRow.elements[key]) {
//             return processedRow.elements[key].status;
//         }
//
//         return '—';
//     }, [dataCache]);
//
//     const loadBatch = useCallback(async (startDate, batchSize) => {
//         const batchKey = `${startDate}+${batchSize}`;
//
//         if (fetchingPromises.current[batchKey] || loadingBatches.has(batchKey)) {
//             return fetchingPromises.current[batchKey];
//         }
//
//         setLoadingBatches(prev => new Set([...prev, batchKey]));
//
//         const promise = fetchBatchData(startDate, batchSize)
//             .then(batchData => {
//                 setDataCache(prev => {
//                     const updated = { ...prev };
//                     batchData.data.forEach(dayData => {
//                         updated[dayData.date] = dayData;
//                     });
//                     return updated;
//                 });
//
//                 updateHeaderStructure(batchData.data);
//                 return batchData;
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
//     }, [loadingBatches, updateHeaderStructure]);
//
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
//     const loadVisibleData = useCallback(async () => {
//         const { start, end } = visibleRange;
//         const visibleDates = dates.slice(start, end);
//         const missingDates = visibleDates.filter(date => !dataCache[date]);
//
//         if (missingDates.length === 0) return;
//
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
//     const extendDates = useCallback(async (direction, isPreemptive = false) => {
//         const loadPromises = [];
//
//         if (direction === 'forward') {
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
//     const handleScrollImmediate = useCallback(async () => {
//         if (!containerRef.current || isScrollCompensating.current) return;
//
//         const container = containerRef.current;
//         const newScrollTop = container.scrollTop;
//         const newContainerHeight = container.clientHeight;
//         const scrollHeight = container.scrollHeight;
//         const currentTime = Date.now();
//
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
//         if (scrollVelocity.current <= 0.5) {
//             processPendingHeaderUpdate();
//         }
//
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
//                     setTimeout(() => {
//                         if (containerRef.current) {
//                             const targetScroll = todayIndex * rowHeight - (containerHeight / 2) + (rowHeight / 2);
//                             containerRef.current.scrollTop = Math.max(0, targetScroll);
//
//                             setContainerHeight(containerHeight);
//                             setScrollTop(containerRef.current.scrollTop);
//                             setIsInitialized(true);
//
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
//     useEffect(() => {
//         if (isInitialized) {
//             loadVisibleData();
//         }
//     }, [isInitialized, loadVisibleData]);
//
//     useEffect(() => {
//         return () => {
//             if (pendingRecalculation.current) {
//                 clearTimeout(pendingRecalculation.current);
//             }
//         };
//     }, []);
//
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
//     const { start: startIndex, end: endIndex } = visibleRange;
//     const visibleDates = dates.slice(startIndex, endIndex);
//     const paddingTop = startIndex * rowHeight;
//     const paddingBottom = Math.max(0, (dates.length - endIndex) * rowHeight);
//
//     return (
//         <>
//             <div style={{
//                 display: 'flex',
//                 gap: '20px',
//                 marginBottom: '10px',
//                 alignItems: 'center'
//             }}>
//                 <div>План 1</div>
//                 <div>Отображать отклонения</div>
//                 <div>Режим редактирования</div>
//                 <button
//                     onClick={() => setShowFilters(!showFilters)}
//                     style={{
//                         padding: '8px 16px',
//                         backgroundColor: '#f0f0f0',
//                         border: '1px solid #ccc',
//                         borderRadius: '4px',
//                         cursor: 'pointer'
//                     }}
//                 >
//                     Задать фильтр
//                 </button>
//                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
//                     <input
//                         type="checkbox"
//                         checked={showWorkHours}
//                         onChange={(e) => setShowWorkHours(e.target.checked)}
//                     />
//                     Показать часы работы
//                 </label>
//             </div>
//
//             {showFilters && (
//                 <div style={{
//                     border: '1px solid #ddd',
//                     borderRadius: '8px',
//                     padding: '16px',
//                     marginBottom: '16px',
//                     backgroundColor: '#f9f9f9'
//                 }}>
//                     <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
//                         <span style={{ fontWeight: 'bold', minWidth: '200px' }}>Отображать в плане</span>
//                         <span style={{ fontWeight: 'bold', minWidth: '200px' }}>Отображать наработку</span>
//                     </div>
//
//                     {renderGroupOrder.map(groupName => (
//                         <div key={groupName} style={{ marginBottom: '12px' }}>
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
//                                 <div style={{ minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                     <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
//                                         <input
//                                             type="checkbox"
//                                             checked={groupVisibility[groupName] || false}
//                                             onChange={(e) => setGroupVisibility(prev => ({
//                                                 ...prev,
//                                                 [groupName]: e.target.checked
//                                             }))}
//                                         />
//                                         {groupName}
//                                     </label>
//                                 </div>
//
//                                 <div style={{ minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                     <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
//                                         <input
//                                             type="checkbox"
//                                             checked={showWorkHours}
//                                             onChange={(e) => setShowWorkHours(e.target.checked)}
//                                         />
//                                         Показать часы работы
//                                     </label>
//                                 </div>
//                             </div>
//
//                             {groupVisibility[groupName] && renderHeaderStructure[groupName] && (
//                                 <div style={{ marginLeft: '20px' }}>
//                                     {renderHeaderStructure[groupName].map(element => (
//                                         <div key={element} style={{ marginBottom: '8px' }}>
//                                             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
//                                                 <div style={{ minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                                     <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '14px' }}>
//                                                         <input
//                                                             type="checkbox"
//                                                             checked={elementVisibility[element] || false}
//                                                             onChange={(e) => setElementVisibility(prev => ({
//                                                                 ...prev,
//                                                                 [element]: e.target.checked
//                                                             }))}
//                                                         />
//                                                         {element}
//                                                     </label>
//                                                 </div>
//                                             </div>
//
//                                             {groupName !== "Работающие агрегаты" && elementVisibility[element] && (
//                                                 <div style={{ marginLeft: '40px', gap: '8px' }}>
//                                                     {Object.keys(componentVisibility[element] || {}).map(componentKey => (
//                                                         <label key={componentKey} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }}>
//                                                             <input
//                                                                 type="checkbox"
//                                                                 checked={componentVisibility[element]?.[componentKey] || false}
//                                                                 onChange={(e) => setComponentVisibility(prev => ({
//                                                                     ...prev,
//                                                                     [element]: {
//                                                                         ...prev[element],
//                                                                         [componentKey]: e.target.checked
//                                                                     }
//                                                                 }))}
//                                                             />
//                                                             {componentKey}
//                                                         </label>
//                                                     ))}
//                                                 </div>
//                                             )}
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                 </div>
//             )}
//
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
//                     <thead style={{
//                         position: 'sticky',
//                         top: 0,
//                         background: activeColorTheme("BGHeader"),
//                         zIndex: 10
//                     }}>
//                     <tr>
//                         <th rowSpan="1" style={{
//                             padding: '8px',
//                             minWidth: '100px',
//                             borderRight: '1px solid #ddd',
//                             fontSize: '14px',
//                             fontWeight: 'normal',
//                             whiteSpace: 'nowrap'
//                         }}>
//                             Дата
//                         </th>
//                         {filteredGroupOrder.map((groupName, index) => (
//                             <th
//                                 key={groupName}
//                                 colSpan={filteredHeaderStructure[groupName]?.length || 1}
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
//                     <tr>
//                         <td style={{
//                             padding: '8px',
//                             minWidth: '100px',
//                             borderRight: '1px solid #ddd',
//                             fontSize: '14px',
//                             fontWeight: 'normal',
//                             whiteSpace: 'nowrap'
//                         }}>
//                             <input type={'date'} placeholder={'перейти к дате'} />
//                         </td>
//                         {filteredGroupOrder.map((groupName, groupIndex) => (
//                             (filteredHeaderStructure[groupName] || []).map((key, keyIndex) => (
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
//                     <tbody>
//                     {paddingTop > 0 && (
//                         <tr style={{ height: paddingTop }}>
//                             <td colSpan={1} style={{ padding: 0, border: 'none' }} />
//                         </tr>
//                     )}
//
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
//                                 {filteredGroupOrder.map((groupName, groupIndex) => (
//                                     (filteredHeaderStructure[groupName] || []).map((key, keyIndex) => {
//                                         const cellValue = processedRow ? getCellValue(processedRow, groupName, key) : '—';
//                                         const cellStatus = processedRow ? getCellStatus(processedRow, groupName, key) : '—';
//
//                                         let shouldDisplay = true;
//                                         let rowSpan = 1;
//
//                                         if (processedRow && groupName !== "Работающие агрегаты") {
//                                             const elementData = processedRow.elements[key];
//                                             if (elementData) {
//                                                 shouldDisplay = elementData.displayed;
//                                                 rowSpan = elementData.rowspan;
//                                             }
//                                         }
//
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
//                                                         activeColorTheme(cellStatus, isPastDate),
//                                                     fontSize: '14px',
//                                                     minWidth: '50px',
//                                                     verticalAlign: 'middle',
//                                                     borderLeft: keyIndex === 0 && groupIndex > 0 ? '2px solid #fff' : 'none',
//                                                     borderRight: '1px solid #ddd',
//                                                     fontWeight: 'normal'
//                                                 }}
//                                             >
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
//                     {paddingBottom > 0 && (
//                         <tr style={{ height: paddingBottom }}>
//                             <td colSpan={1} style={{ padding: 0, border: 'none' }} />
//                         </tr>
//                     )}
//                     </tbody>
//                 </table>
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
//                 <span><strong>Показать часы работы:</strong> {showWorkHours ? 'Да' : 'Нет'}</span>
//                 <span><strong>Фильтры открыты:</strong> {showFilters ? 'Да' : 'Нет'}</span>
//                 <span><strong>Видимых групп:</strong> {filteredGroupOrder.length}</span>
//                 <span><strong>Всего групп:</strong> {renderGroupOrder.length}</span>
//                 <span><strong>Компонентных фильтров:</strong> {Object.keys(componentVisibility).length}</span>
//             </div>}
//         </>
//     );
// };

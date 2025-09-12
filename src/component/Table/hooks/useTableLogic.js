// import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { formatDate, parseDateString } from '../utils/dateUtils.js';
// import { processDataForTable, defaultDataProvider, getDataProvider } from '../utils/dataProcessing.js';
// import { smartThrottle } from '../utils/performanceUtils.js';
//
// /**
//  * Хук для управления логикой виртуализированной таблицы
//  */
// export const useTableLogic = ({
//                                   scrollBatchSize = 7,
//                                   dataProvider = null,
//                                   onDataLoad = null,
//                                   onError = null,
//                                   treeStructure
//                               }) => {
//     // Основные состояния
//     const [dates, setDates] = useState([]);
//     const [dataCache, setDataCache] = useState({});
//     const [processedCache, setProcessedCache] = useState({});
//     const [loadingBatches, setLoadingBatches] = useState(new Set());
//     const [isInitialized, setIsInitialized] = useState(false);
//
//     // Состояния viewport
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
//
//     // Константы
//     const rowHeight = 40;
//     const bufferSize = 20;
//
//     // Сегодняшняя дата
//     const today = useMemo(() => {
//         const date = new Date();
//         date.setUTCHours(0, 0, 0, 0);
//         return date;
//     }, []);
//
//     // Видимый диапазон
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
//     // Генерация начальных дат
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
//     // Загрузка батча данных
//     const loadBatch = useCallback(async (startDate, batchSize) => {
//         const batchKey = `${startDate}+${batchSize}`;
//
//         if (fetchingPromises.current[batchKey] || loadingBatches.has(batchKey)) {
//             return fetchingPromises.current[batchKey];
//         }
//
//         setLoadingBatches(prev => new Set([...prev, batchKey]));
//
//         const activeDataProvider = dataProvider || getDataProvider();
//
//         const promise = activeDataProvider(startDate, batchSize, treeStructure.leafNodes)
//             .then(batchData => {
//                 setDataCache(prev => {
//                     const updated = { ...prev };
//                     batchData.data.forEach(dayData => {
//                         updated[dayData.date] = dayData;
//                     });
//                     return updated;
//                 });
//
//                 if (onDataLoad) {
//                     onDataLoad(batchData.data, startDate, batchSize);
//                 }
//
//                 return batchData;
//             })
//             .catch(error => {
//                 console.error('[EnhancedTable] Ошибка загрузки данных:', error);
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
//     }, [loadingBatches, dataProvider, treeStructure.leafNodes, onDataLoad, onError]);
//
//     // Пересчет rowspan
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
//                     const processed = processDataForTable(dataForProcessing, treeStructure.leafNodes);
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
//     }, [dataCache, treeStructure.leafNodes]);
//
//     // Загрузка видимых данных
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
//     // Расширение дат
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
//     // Обработка скролла
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
//     }, [dates, extendDates, rowHeight, bufferSize]);
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
//     // Инициализация таблицы
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
//     return {
//         // Состояния
//         dates,
//         dataCache,
//         processedCache,
//         loadingBatches,
//         isInitialized,
//         scrollTop,
//         containerHeight,
//         visibleRange,
//         today,
//
//         // Refs
//         containerRef,
//         scrollVelocity,
//
//         // Константы
//         rowHeight,
//         bufferSize,
//
//         // Функции
//         handleScroll,
//         loadBatch,
//         scheduleRowspanRecalculation
//     };
// };

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { formatDate, parseDateString } from '../utils/dateUtils.js';
import { processDataForTable, defaultDataProvider, getDataProvider, transformDataFormat } from '../utils/dataProcessing.js';
import { smartThrottle } from '../utils/performanceUtils.js';

/**
 * Хук для управления логикой виртуализированной таблицы с новым API
 */
export const useTableLogic = ({
                                  scrollBatchSize = 7,
                                  dataProvider = null,
                                  onDataLoad = null,
                                  onError = null,
                                  treeStructure
                              }) => {
    // Основные состояния
    const [dates, setDates] = useState([]);
    const [dataCache, setDataCache] = useState({});
    const [processedCache, setProcessedCache] = useState({});
    const [loadingBatches, setLoadingBatches] = useState(new Set());
    const [isInitialized, setIsInitialized] = useState(false);

    // Состояния viewport
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    // Refs
    const containerRef = useRef(null);
    const fetchingPromises = useRef({});
    const scrollVelocity = useRef(0);
    const lastScrollTime = useRef(0);
    const lastScrollTop = useRef(0);
    const isScrollCompensating = useRef(false);
    const pendingRecalculation = useRef(null);

    // Константы
    const rowHeight = 40;
    const bufferSize = 20;

    // Сегодняшняя дата
    const today = useMemo(() => {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        return date;
    }, []);

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

    // Загрузка батча данных с новым API
    const loadBatch = useCallback(async (startDate, direction, batchSize) => {
        const batchKey = `${startDate}+${direction}+${batchSize}`;

        if (fetchingPromises.current[batchKey] || loadingBatches.has(batchKey)) {
            return fetchingPromises.current[batchKey];
        }

        setLoadingBatches(prev => new Set([...prev, batchKey]));

        // Получаем активный провайдер данных
        const activeDataProvider = dataProvider || getDataProvider();

        const promise = (async () => {
            try {
                console.log(`[useTableLogic] Загружаем батч: ${startDate}, направление: ${direction}, размер: ${batchSize}`);

                // Вызываем новый API
                let batchData;
                if (typeof activeDataProvider === 'function' && activeDataProvider.constructor.name === 'AsyncFunction') {
                    // Новый async API с направлением
                    batchData = await activeDataProvider(startDate, direction, batchSize);
                } else {
                    // Совместимость со старым API
                    console.log('[useTableLogic] Используется совместимость со старым API');
                    const oldResult = await activeDataProvider(startDate, batchSize, treeStructure.leafNodes);
                    batchData = oldResult;
                }

                // Если получили новый формат данных, преобразуем его
                if (batchData && batchData.data && Array.isArray(batchData.data) &&
                    batchData.data.length > 0 && batchData.data[0].columns) {
                    console.log('[useTableLogic] Преобразуем новый формат данных');
                    batchData = transformDataFormat(batchData);
                }

                // Обновляем кеш данных
                setDataCache(prev => {
                    const updated = { ...prev };
                    if (batchData && batchData.data) {
                        batchData.data.forEach(dayData => {
                            updated[dayData.date] = dayData;
                        });
                    }
                    return updated;
                });

                if (onDataLoad && batchData && batchData.data) {
                    onDataLoad(batchData.data, startDate, batchSize);
                }

                return batchData;
            } catch (error) {
                console.error('[useTableLogic] Ошибка загрузки данных:', error);
                if (onError) {
                    onError(error, { startDate, direction, batchSize });
                }
                throw error;
            }
        })();

        promise.finally(() => {
            setLoadingBatches(prev => {
                const updated = new Set(prev);
                updated.delete(batchKey);
                return updated;
            });
            delete fetchingPromises.current[batchKey];
        });

        fetchingPromises.current[batchKey] = promise;
        return promise;
    }, [loadingBatches, dataProvider, treeStructure.leafNodes, onDataLoad, onError]);

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
                    const processed = processDataForTable(dataForProcessing, treeStructure.leafNodes);
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
    }, [dataCache, treeStructure.leafNodes]);

    // Загрузка видимых данных
    const loadVisibleData = useCallback(async () => {
        const { start, end } = visibleRange;
        const visibleDates = dates.slice(start, end);
        const missingDates = visibleDates.filter(date => !dataCache[date]);

        if (missingDates.length === 0) return;

        // Группируем отсутствующие даты в последовательные батчи
        const batchesToLoad = [];
        if (missingDates.length > 0) {
            let currentBatchStart = missingDates[0];
            let currentBatchDates = [currentBatchStart];

            for (let i = 1; i < missingDates.length; i++) {
                const prevDate = parseDateString(missingDates[i - 1]);
                const currDate = parseDateString(missingDates[i]);
                const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

                if (daysDiff === 1 && currentBatchDates.length < scrollBatchSize) {
                    currentBatchDates.push(missingDates[i]);
                } else {
                    batchesToLoad.push({
                        startDate: currentBatchStart,
                        direction: 'forward',
                        size: currentBatchDates.length
                    });
                    currentBatchStart = missingDates[i];
                    currentBatchDates = [currentBatchStart];
                }
            }
            batchesToLoad.push({
                startDate: currentBatchStart,
                direction: 'forward',
                size: currentBatchDates.length
            });
        }

        const loadPromises = batchesToLoad.map(batch =>
            loadBatch(batch.startDate, batch.direction, batch.size)
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

            // Загружаем новые данные с новым API
            loadPromises.push(loadBatch(newDates[0], 'forward', newDates.length));

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

            // Загружаем новые данные с новым API (для backward направления)
            loadPromises.push(loadBatch(firstDate, 'backward', newDates.length));
        }

        await Promise.allSettled(loadPromises);
        scheduleRowspanRecalculation();
    }, [dates, scrollBatchSize, rowHeight, loadBatch, scheduleRowspanRecalculation]);

    // Обработка скролла остается такой же
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
    }, [dates, extendDates, rowHeight, bufferSize]);

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

    // Инициализация таблицы
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

                    // Загружаем данные для текущей даты с новым API
                    await loadBatch(todayFormatted, 'forward', initialBatchSize);
                    scheduleRowspanRecalculation();

                    setTimeout(() => {
                        if (containerRef.current) {
                            const targetScroll = todayIndex * rowHeight - (containerHeight / 2) + (rowHeight / 2);
                            containerRef.current.scrollTop = Math.max(0, targetScroll);

                            setContainerHeight(containerHeight);
                            setScrollTop(containerRef.current.scrollTop);
                            setIsInitialized(true);

                            // Предзагружаем данные в обе стороны
                            setTimeout(() => {
                                const preloadPromises = [
                                    loadBatch(todayFormatted, 'backward', bufferSize),
                                    loadBatch(formatDate(new Date(today.getTime() + bufferSize * 24 * 60 * 60 * 1000)), 'forward', bufferSize)
                                ];

                                Promise.allSettled(preloadPromises).then(() => {
                                    scheduleRowspanRecalculation();
                                });
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

    return {
        // Состояния
        dates,
        dataCache,
        processedCache,
        loadingBatches,
        isInitialized,
        scrollTop,
        containerHeight,
        visibleRange,
        today,

        // Refs
        containerRef,
        scrollVelocity,

        // Константы
        rowHeight,
        bufferSize,

        // Функции
        handleScroll,
        loadBatch,
        scheduleRowspanRecalculation
    };
};
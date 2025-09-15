import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { formatDate, parseDateString } from '../utils/dateUtils.js';
import { processDataForTable, getDataProvider, transformDataFormat } from '../utils/dataProcessing.js';
import { smartThrottle } from '../utils/performanceUtils.js';

/**
 * Хук для управления логикой виртуализированной таблицы с направлениями up/down
 */
export const useTableLogic = ({
                                  scrollBatchSize = 14,
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
    const bufferSize = 5;

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

    // Загрузка батча данных с новой логикой up/down
    // const loadBatch = useCallback(async (startDate, direction, batchSize) => {
    //     const batchKey = `${startDate}+${direction}+${batchSize}`;
    //
    //     if (fetchingPromises.current[batchKey] || loadingBatches.has(batchKey)) {
    //         return fetchingPromises.current[batchKey];
    //     }
    //
    //     setLoadingBatches(prev => new Set([...prev, batchKey]));
    //
    //     // Получаем активный провайдер данных
    //     const activeDataProvider = dataProvider || getDataProvider();
    //
    //     const promise = (async () => {
    //         try {
    //             const directionText = direction === 'up' ? 'даты раньше (вверх)' : 'даты позже (вниз)';
    //             console.log(`[useTableLogic] Загружаем батч: ${startDate}, направление: ${direction} (${directionText}), размер: ${batchSize}`);
    //
    //             // Вызываем новый async API с направлением up/down
    //             const batchData = await activeDataProvider(startDate, direction, batchSize);
    //
    //             // Проверяем формат данных
    //             if (!batchData || !batchData.data || !Array.isArray(batchData.data)) {
    //                 throw new Error('Провайдер данных вернул некорректный формат');
    //             }
    //
    //             // Проверяем формат первой записи
    //             if (batchData.data.length > 0) {
    //                 const firstRecord = batchData.data[0];
    //                 if (!firstRecord.columns || !Array.isArray(firstRecord.columns)) {
    //                     console.warn('[useTableLogic] Получены данные в старом формате, преобразуем...');
    //                 }
    //             }
    //
    //             // Преобразуем новый формат в старый для внутренней совместимости
    //             const transformedData = transformDataFormat(batchData);
    //
    //             // Обновляем кеш данных
    //             setDataCache(prev => {
    //                 const updated = { ...prev };
    //                 if (transformedData && transformedData.data) {
    //                     transformedData.data.forEach(dayData => {
    //                         updated[dayData.date] = dayData;
    //                     });
    //                 }
    //                 return updated;
    //             });
    //
    //             if (onDataLoad && transformedData && transformedData.data) {
    //                 onDataLoad(transformedData.data, startDate, batchSize);
    //             }
    //
    //             console.log(`[useTableLogic] Батч загружен: ${transformedData.data?.length || 0} записей (${directionText})`);
    //             return transformedData;
    //
    //         } catch (error) {
    //             console.error('[useTableLogic] Ошибка загрузки данных:', error);
    //             if (onError) {
    //                 onError(error, { startDate, direction, batchSize });
    //             }
    //             throw error;
    //         }
    //     })();
    //
    //     promise.finally(() => {
    //         setLoadingBatches(prev => {
    //             const updated = new Set(prev);
    //             updated.delete(batchKey);
    //             return updated;
    //         });
    //         delete fetchingPromises.current[batchKey];
    //     });
    //
    //     fetchingPromises.current[batchKey] = promise;
    //     return promise;
    // }, [loadingBatches, dataProvider, onDataLoad, onError]);

    // Загрузка батча данных с новой логикой up/down
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
                const directionText = direction === 'up' ? 'даты раньше (вверх)' : 'даты позже (вниз)';
                console.log(`[useTableLogic] Загружаем батч: ${startDate}, направление: ${direction} (${directionText}), размер: ${batchSize}`);

                // Вызываем новый async API с направлением up/down
                const batchData = await activeDataProvider(startDate, direction, batchSize);

                // Проверяем формат данных - теперь ожидаем строковый ключ "data"
                if (!batchData || !batchData["data"] || !Array.isArray(batchData["data"])) {
                    throw new Error('Провайдер данных вернул некорректный формат - ожидается {"data": [...]}');
                }

                // Проверяем формат первой записи
                if (batchData["data"].length > 0) {
                    const firstRecord = batchData["data"][0];
                    if (!firstRecord.columns || !Array.isArray(firstRecord.columns)) {
                        console.warn('[useTableLogic] Получены данные в старом формате, преобразуем...');
                    }
                }

                // Преобразуем новый формат в старый для внутренней совместимости
                // Создаем объект с обычным свойством data для transformDataFormat
                const dataForTransform = { data: batchData["data"] };
                const transformedData = transformDataFormat(dataForTransform);

                // Обновляем кеш данных
                setDataCache(prev => {
                    const updated = { ...prev };
                    if (transformedData && transformedData.data) {
                        transformedData.data.forEach(dayData => {
                            updated[dayData.date] = dayData;
                        });
                    }
                    return updated;
                });

                if (onDataLoad && transformedData && transformedData.data) {
                    onDataLoad(transformedData.data, startDate, batchSize);
                }

                console.log(`[useTableLogic] Батч загружен: ${transformedData.data?.length || 0} записей (${directionText})`);
                return transformedData;

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
    }, [loadingBatches, dataProvider, onDataLoad, onError]);

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
                        direction: 'down', // По умолчанию загружаем даты позже
                        size: currentBatchDates.length
                    });
                    currentBatchStart = missingDates[i];
                    currentBatchDates = [currentBatchStart];
                }
            }
            batchesToLoad.push({
                startDate: currentBatchStart,
                direction: 'down',
                size: currentBatchDates.length
            });
        }

        const loadPromises = batchesToLoad.map(batch =>
            loadBatch(batch.startDate, batch.direction, batch.size)
        );

        await Promise.allSettled(loadPromises);
        scheduleRowspanRecalculation();
    }, [visibleRange, dates, dataCache, loadBatch, scrollBatchSize, scheduleRowspanRecalculation]);

    // Расширение дат с новой логикой up/down
    const extendDates = useCallback(async (direction, isPreemptive = false) => {
        const loadPromises = [];

        if (direction === 'down') {
            // down = даты позже (вперед во времени, вниз по таблице)
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

            // Загружаем новые данные для down направления
            loadPromises.push(loadBatch(newDates[0], 'down', newDates.length));

        } else if (direction === 'up') {
            // up = даты раньше (назад во времени, вверх по таблице)
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

            // Загружаем новые данные для up направления
            loadPromises.push(loadBatch(firstDate, 'up', newDates.length));
        }

        await Promise.allSettled(loadPromises);
        scheduleRowspanRecalculation();
    }, [dates, scrollBatchSize, rowHeight, loadBatch, scheduleRowspanRecalculation]);

    // Обработка скролла с новой логикой направлений
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
            promises.push(extendDates('up', isHighVelocity)); // up = загружаем даты раньше (вверх)
        }

        if (needsBottomExtension) {
            promises.push(extendDates('down', isHighVelocity)); // down = загружаем даты позже (вниз)
        }

        if (isHighVelocity) {
            if (scrollDelta < 0 && newScrollTop <= preemptiveTopThreshold) {
                promises.push(extendDates('up', true)); // скролл вверх = предзагрузка более ранних дат
            } else if (scrollDelta > 0 && newScrollTop >= preemptiveBottomThreshold) {
                promises.push(extendDates('down', true)); // скролл вниз = предзагрузка более поздних дат
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

    // Инициализация таблицы с новой логикой
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

                    // Загружаем данные для текущей даты (направление down - даты позже)
                    await loadBatch(todayFormatted, 'down', initialBatchSize);
                    scheduleRowspanRecalculation();

                    setTimeout(() => {
                        if (containerRef.current) {
                            // Позиционируем сегодняшнюю дату в верх вьюпорта (первая видимая строка)
                            const targetScroll = todayIndex * rowHeight;
                            containerRef.current.scrollTop = targetScroll;

                            setContainerHeight(containerHeight);
                            setScrollTop(targetScroll);
                            setIsInitialized(true);

                            console.log(`[useTableLogic] Инициализация завершена: scroll=${targetScroll}, сегодня на позиции ${todayIndex}`);
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
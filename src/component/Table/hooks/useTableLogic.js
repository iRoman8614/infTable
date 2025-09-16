import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { formatDate, parseDateString } from '../utils/dateUtils.js';
import { smartThrottle } from '../utils/performanceUtils.js';

/**
 * Простая обработка данных без rowspan логики с поддержкой цвета
 */
const processSimpleTableData = (dataArray, leafNodes) => {
    const processedData = dataArray.map(dayData => {
        const elements = {};

        leafNodes.forEach(leafNode => {
            const columnData = dayData.columns?.find(col => col.headerId === leafNode.id);
            const value = columnData ? columnData.value : 'М';
            const color = columnData ? columnData.color : null;

            elements[leafNode.id] = {
                status: value,
                color: color,
                displayed: true,
                rowspan: 1
            };
        });

        return {
            date: dayData.date,
            elements: elements
        };
    });

    return { processedData };
};

/**
 * Хук для управления логикой виртуализированной таблицы БЕЗ КЕШЕЙ
 */
export const useTableLogic = ({
                                  scrollBatchSize = 20, // Фиксированный размер батча
                                  dataProvider = null,
                                  onDataLoad = null,
                                  onError = null,
                                  treeStructure
                              }) => {
    // Основные состояния (БЕЗ КЕШЕЙ)
    const [dates, setDates] = useState([]);
    const [visibleData, setVisibleData] = useState({}); // Только видимые данные
    const [loadingDates, setLoadingDates] = useState(new Set());
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

    // Константы
    const rowHeight = 40;
    const bufferSize = 2;               // Буфер для visibleRange
    const batchSize = 20;        // Фиксированный размер батча

    // Сегодняшняя дата
    const today = useMemo(() => {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        return date;
    }, []);

    // Видимый диапазон с учетом фиксированного размера батча
    const visibleRange = useMemo(() => {
        if (!containerHeight || dates.length === 0) {
            return { start: 0, end: Math.max(dates.length, batchSize * 2) };
        }

        const visibleStart = Math.floor(scrollTop / rowHeight);
        const visibleEnd = Math.ceil((scrollTop + containerHeight) / rowHeight);

        const start = Math.max(0, visibleStart - bufferSize);
        const end = Math.min(dates.length, visibleEnd + bufferSize);

        return { start, end };
    }, [scrollTop, containerHeight, dates.length, rowHeight, bufferSize]);

    // Генерация начальных дат с учетом фиксированного размера батча
    const generateInitialDates = useCallback(() => {
        const initialDates = [];
        const daysAround = Math.floor(batchSize * 2); // 40 дней вокруг сегодня

        for (let i = -daysAround; i <= daysAround; i++) {
            const date = new Date(today);
            date.setUTCDate(today.getUTCDate() + i);
            initialDates.push(formatDate(date));
        }

        return initialDates;
    }, [today]);

    // Загрузка батча данных БЕЗ кеширования диапазонов
    const loadBatch = useCallback(async (startDate, direction, batchSize) => {
        const batchKey = `${startDate}:${direction}:${batchSize}`;

        if (fetchingPromises.current[batchKey]) {
            return fetchingPromises.current[batchKey];
        }

        const promise = (async () => {
            try {
                console.log(`[useTableLogic] Загружаем батч: ${startDate}, направление: ${direction}, размер: ${batchSize}`);

                const jsonString = await dataProvider(startDate, direction, batchSize);

                if (typeof jsonString !== 'string') {
                    throw new Error('Провайдер данных должен возвращать JSON-строку');
                }

                let batchData;
                try {
                    batchData = JSON.parse(jsonString);
                } catch (parseError) {
                    throw new Error(`Ошибка парсинга JSON: ${parseError.message}`);
                }

                let dataArray;
                if (batchData && batchData["data"] && Array.isArray(batchData["data"])) {
                    dataArray = batchData["data"];
                } else if (batchData && batchData.data && Array.isArray(batchData.data)) {
                    dataArray = batchData.data;
                } else {
                    throw new Error('Провайдер данных вернул некорректный формат - ожидается {data: [...]} или {"data": [...]}');
                }

                // Проверяем формат данных
                if (dataArray.length > 0) {
                    const firstRecord = dataArray[0];
                    if (!firstRecord.date || !firstRecord.columns || !Array.isArray(firstRecord.columns)) {
                        throw new Error('Некорректный формат данных: ожидается {date: string, columns: [{headerId: string, value: string}]}');
                    }
                }

                // Обрабатываем данные напрямую БЕЗ кеширования
                if (dataArray.length > 0 && treeStructure.leafNodes) {
                    const processed = processSimpleTableData(dataArray, treeStructure.leafNodes);

                    setVisibleData(prev => {
                        const updated = { ...prev };
                        processed.processedData.forEach(processedRow => {
                            updated[processedRow.date] = processedRow;
                        });
                        return updated;
                    });
                }

                // Убираем даты из загружающихся
                setLoadingDates(prev => {
                    const updated = new Set(prev);
                    dataArray.forEach(dayData => updated.delete(dayData.date));
                    return updated;
                });

                if (onDataLoad) {
                    onDataLoad(dataArray, startDate, batchSize);
                }

                return { data: dataArray };

            } catch (error) {
                console.error('[useTableLogic] Ошибка загрузки данных:', error);

                // Убираем даты из загружающихся даже при ошибке
                setLoadingDates(prev => {
                    const updated = new Set(prev);
                    // Примерно вычисляем какие даты пытались загрузить
                    const startDateObj = parseDateString(startDate);
                    for (let i = 0; i < batchSize; i++) {
                        const date = new Date(startDateObj);
                        if (direction === 'up') {
                            date.setUTCDate(startDateObj.getUTCDate() - i);
                        } else {
                            date.setUTCDate(startDateObj.getUTCDate() + i);
                        }
                        updated.delete(formatDate(date));
                    }
                    return updated;
                });

                if (onError) {
                    onError(error, { startDate, direction, batchSize });
                }
                throw error;
            }
        })();

        promise.finally(() => {
            delete fetchingPromises.current[batchKey];
        });

        fetchingPromises.current[batchKey] = promise;
        return promise;
    }, [dataProvider, onDataLoad, onError, treeStructure.leafNodes]);

    // Очистка невидимых данных: viewport + 2 захлеста буфера
    const cleanupInvisibleData = useCallback(() => {
        const { start, end } = visibleRange;
        const visibleRows = Math.ceil(containerHeight / rowHeight);

        // Рассчитываем область удержания: viewport + 2*bufferSize сверху и снизу
        const keepStart = Math.max(0, start - bufferSize * 2);      // viewport - 4 строки
        const keepEnd = Math.min(dates.length, end + bufferSize * 2);   // viewport + 4 строки
        const keepDates = new Set(dates.slice(keepStart, keepEnd));

        setVisibleData(prev => {
            const cleaned = {};
            let removedCount = 0;

            Object.keys(prev).forEach(date => {
                if (keepDates.has(date)) {
                    cleaned[date] = prev[date];
                } else {
                    removedCount++;
                }
            });

            return cleaned;
        });
    }, [visibleRange, dates, containerHeight, rowHeight, bufferSize]);

    // Загрузка видимых данных с фиксированным размером батча
    const loadVisibleData = useCallback(async () => {
        const { start, end } = visibleRange;
        const visibleDates = dates.slice(start, end);
        const missingDates = visibleDates.filter(date =>
            !visibleData[date] && !loadingDates.has(date)
        );

        if (missingDates.length === 0) return;

        // Отмечаем даты как загружающиеся
        setLoadingDates(prev => new Set([...prev, ...missingDates]));

        // Загружаем ФИКСИРОВАННЫМИ батчами по 20, независимо от количества недостающих дат
        const batchesToLoad = [];
        const processedDates = new Set();

        for (const date of missingDates) {
            if (processedDates.has(date)) continue;

            // Всегда загружаем батч размером batchSize от этой даты
            batchesToLoad.push({
                startDate: date,
                direction: 'down',
                size: batchSize  // ВСЕГДА 20!
            });

            // Отмечаем все даты этого батча как обработанные
            const startDateObj = parseDateString(date);
            for (let i = 0; i < batchSize; i++) {
                const batchDate = new Date(startDateObj);
                batchDate.setUTCDate(startDateObj.getUTCDate() + i);
                processedDates.add(formatDate(batchDate));
            }
        }

        const loadPromises = batchesToLoad.map(batch =>
            loadBatch(batch.startDate, batch.direction, batch.size)
        );

        await Promise.allSettled(loadPromises);

        // Отладочная информация о размере данных в памяти
        const memorySize = Object.keys(visibleData).length;
        const viewportSize = Math.ceil(containerHeight / rowHeight);
        const targetSize = viewportSize + (bufferSize * 4); // viewport + 2*bufferSize сверху и снизу
    }, [visibleRange, dates, visibleData, loadingDates, loadBatch, containerHeight, rowHeight, bufferSize]);

    // Расширение дат
    const extendDates = useCallback(async (direction, isPreemptive = false) => {
        const loadPromises = [];

        if (direction === 'down') {
            const lastDate = dates[dates.length - 1];
            if (!lastDate) return;

            const lastDateObj = parseDateString(lastDate);
            const newDates = [];
            const extendSize = isPreemptive ? batchSize * 2 : batchSize;

            for (let i = 1; i <= extendSize; i++) {
                const date = new Date(lastDateObj);
                date.setUTCDate(lastDateObj.getUTCDate() + i);
                newDates.push(formatDate(date));
            }

            setDates(prev => [...prev, ...newDates]);

        } else if (direction === 'up') {
            const firstDate = dates[0];
            if (!firstDate) return;

            const firstDateObj = parseDateString(firstDate);
            const newDates = [];
            const extendSize = isPreemptive ? batchSize * 2 : batchSize;

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
        }

        await Promise.allSettled(loadPromises);
    }, [dates, batchSize, rowHeight]);

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

        const baseThreshold = rowHeight * bufferSize;
        const velocityMultiplier = Math.min(3, 1 + scrollVelocity.current * 2);
        const dynamicThreshold = baseThreshold * velocityMultiplier;

        const topThreshold = dynamicThreshold;
        const bottomThreshold = scrollHeight - newContainerHeight - dynamicThreshold;

        const needsTopExtension = newScrollTop <= topThreshold && dates.length > 0;
        const needsBottomExtension = newScrollTop >= bottomThreshold && dates.length > 0;

        const isHighVelocity = scrollVelocity.current > 1;

        const promises = [];

        if (needsTopExtension) {
            promises.push(extendDates('up', isHighVelocity));
        }

        if (needsBottomExtension) {
            promises.push(extendDates('down', isHighVelocity));
        }

        if (isHighVelocity) {
            const preemptiveTopThreshold = topThreshold * 2;
            const preemptiveBottomThreshold = scrollHeight - newContainerHeight - (dynamicThreshold * 2);

            if (scrollDelta < 0 && newScrollTop <= preemptiveTopThreshold) {
                promises.push(extendDates('up', true));
            } else if (scrollDelta > 0 && newScrollTop >= preemptiveBottomThreshold) {
                promises.push(extendDates('down', true));
            }
        }

        if (promises.length > 0) {
            await Promise.allSettled(promises);
        }

        // Очищаем невидимые данные только при медленном скролле
        if (scrollVelocity.current < 0.5) {
            cleanupInvisibleData();
        }
    }, [dates, extendDates, rowHeight, bufferSize, cleanupInvisibleData]);

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
                    const initialBatchSize = Math.max(batchSize * 2, totalRowsNeeded);

                    await loadBatch(todayFormatted, 'down', initialBatchSize);

                    setTimeout(() => {
                        if (containerRef.current) {
                            const targetScroll = todayIndex * rowHeight;
                            containerRef.current.scrollTop = targetScroll;

                            setContainerHeight(containerHeight);
                            setScrollTop(targetScroll);
                            setIsInitialized(true);
                        }
                    }, 100);
                }
            };

            initializeTable();
        }
    }, [isInitialized, dates.length, generateInitialDates, today, rowHeight, scrollBatchSize, loadBatch, bufferSize]);

    // Загружаем видимые данные только после инициализации
    useEffect(() => {
        if (isInitialized && dates.length > 0) {
            const timeoutId = setTimeout(() => {
                loadVisibleData();
            }, 50);

            return () => clearTimeout(timeoutId);
        }
    }, [isInitialized, visibleRange, dates.length, loadVisibleData]);

    // Создаем processedCache на лету из visibleData для совместимости
    const processedCache = useMemo(() => visibleData, [visibleData]);

    // const refreshViewport = useCallback(async () => {
    //     // 1. Получаем текущий видимый диапазон
    //     const { start, end } = visibleRange;
    //     const currentVisibleDates = dates.slice(start, end);
    //
    //     // 2. Очищаем данные viewport из памяти
    //     setVisibleData(prev => {
    //         const cleaned = { ...prev };
    //         currentVisibleDates.forEach(date => {
    //             delete cleaned[date];
    //         });
    //         return cleaned;
    //     });
    //
    //     // 3. Принудительно перезапрашиваем данные батчами по 20
    //     const batchCount = Math.ceil(currentVisibleDates.length / batchSize);
    //     for (let i = 0; i < batchCount; i++) {
    //         await loadBatch(batchStartDate, 'down', batchSize);
    //     }
    // }, [visibleRange, dates, loadBatch]);

    const refreshViewport = useCallback(async () => {
        const { start, end } = visibleRange;
        const currentVisibleDates = dates.slice(start, end);

        console.log(`[RefreshViewport] Принудительное обновление viewport: ${currentVisibleDates.length} дат`);

        // Очищаем текущие данные viewport
        setVisibleData(prev => {
            const cleaned = { ...prev };
            currentVisibleDates.forEach(date => {
                delete cleaned[date];
            });
            return cleaned;
        });

        // Очищаем состояние загрузки
        setLoadingDates(prev => {
            const updated = new Set(prev);
            currentVisibleDates.forEach(date => updated.delete(date));
            return updated;
        });

        // Принудительно перезапрашиваем данные
        if (currentVisibleDates.length > 0) {
            const firstDate = currentVisibleDates[0];
            const batchCount = Math.ceil(currentVisibleDates.length / batchSize);

            const refreshPromises = [];
            for (let i = 0; i < batchCount; i++) {
                const batchStartDate = dates[start + (i * batchSize)];
                if (batchStartDate) {
                    refreshPromises.push(loadBatch(batchStartDate, 'down', batchSize));
                }
            }

            await Promise.allSettled(refreshPromises);
            console.log(`[RefreshViewport] Viewport обновлен: ${refreshPromises.length} батчей перезагружено`);
        }
    }, [visibleRange, dates, loadBatch]);

    return {
        dates,
        processedCache, // Для обратной совместимости
        visibleData, // Новое название
        loadingDates, // Заменяет loadingBatches
        isInitialized,
        scrollTop,
        containerHeight,
        visibleRange,
        today,
        containerRef,
        scrollVelocity,
        rowHeight,
        bufferSize,
        handleScroll,
        loadBatch,
        refreshViewport
    };
};
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { formatDate, parseDateString } from '../utils/dateUtils.js';
import { smartThrottle } from '../utils/performanceUtils.js';

/**
 * Простая обработка данных с поддержкой rowspan
 */
const processSimpleTableData = (dataArray, leafNodes) => {
    const processedData = dataArray.map(dayData => {
        const elements = {};

        leafNodes.forEach(leafNode => {
            const columnData = dayData.columns?.find(col => col.headerId === leafNode.id);
            const value = columnData ? columnData.value : '-';
            const color = columnData ? columnData.color : null;
            const draggable = columnData ? (columnData.draggable === true) : false;
            const rowspan = columnData ? (columnData.rowspan || 1) : 1;

            elements[leafNode.id] = {
                status: value,
                color: color,
                draggable: draggable,
                displayed: true,
                rowspan: rowspan
            };
        });

        return {
            date: dayData.date,
            elements: elements
        };
    });

    return { processedData };
};

const calculateExtendedRange = (visibleRange, dates, visibleData) => {
    let { start, end } = visibleRange;
    let extendedStart = start;
    let extendedEnd = end;

    const searchStart = Math.max(0, start - 50);

    for (let i = searchStart; i < dates.length; i++) {
        const dateString = dates[i];
        const rowData = visibleData[dateString];
        if (!rowData) continue;

        Object.values(rowData.elements).forEach(element => {
            if (element.rowspan > 1) {
                const rowspanEnd = i + element.rowspan - 1;

                if (i <= end && rowspanEnd >= start) {
                    extendedStart = Math.min(extendedStart, i);
                    extendedEnd = Math.max(extendedEnd, rowspanEnd + 1);
                }
            }
        });
    }

    if (extendedStart !== start || extendedEnd !== end) {
        console.log(`[ExtendedRange] Диапазон расширен из-за rowspan: ${start}-${end} → ${extendedStart}-${extendedEnd}`);
    }

    return {
        start: Math.max(0, extendedStart),
        end: Math.min(dates.length, extendedEnd)
    };
};

/**
 * Хук для управления логикой виртуализированной таблицы с поддержкой rowspan
 */
export const useTableLogic = ({
                                  scrollBatchSize,
                                  dataProvider = null,
                                  onDataLoad = null,
                                  onError = null,
                                  treeStructure
                              }) => {
    // Основные состояния
    const [dates, setDates] = useState([]);
    const [visibleData, setVisibleData] = useState({});
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
    const bufferSize = 4;
    const batchSize = scrollBatchSize;

    // Сегодняшняя дата
    const today = useMemo(() => {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        return date;
    }, []);

    const baseVisibleRange = useMemo(() => {
        if (!containerHeight || dates.length === 0) {
            return { start: 0, end: Math.max(dates.length, batchSize * 2) };
        }

        const visibleStart = Math.floor(scrollTop / rowHeight);
        const visibleEnd = Math.ceil((scrollTop + containerHeight) / rowHeight);

        const start = Math.max(0, visibleStart - bufferSize);
        const end = Math.min(dates.length, visibleEnd + bufferSize);

        return { start, end };
    }, [scrollTop, containerHeight, dates.length, rowHeight, bufferSize, batchSize]);

    const visibleRange = useMemo(() => {
        return calculateExtendedRange(baseVisibleRange, dates, visibleData);
    }, [baseVisibleRange, dates, visibleData]);

    const generateInitialDates = useCallback(() => {
        const initialDates = [];
        const daysAround = Math.floor(batchSize * 2);

        for (let i = -daysAround; i <= daysAround; i++) {
            const date = new Date(today);
            date.setUTCDate(today.getUTCDate() + i);
            initialDates.push(formatDate(date));
        }

        return initialDates;
    }, [today, batchSize]);

    const loadBatch = useCallback(async (startDate, direction, batchSize) => {
        const batchKey = `${startDate}:${direction}:${batchSize}`;

        if (fetchingPromises.current[batchKey]) {
            return fetchingPromises.current[batchKey];
        }

        const promise = (async () => {
            try {
                console.log(`[useTableLogic] Загружаем батч: ${startDate}, направление: ${direction}, размер: ${batchSize}`);

                if (!dataProvider) {
                    throw new Error('dataProvider не установлен');
                }

                // ИСПРАВЛЕНИЕ: Вызываем провайдер с правильными параметрами
                let jsonString;
                if (dataProvider.constructor.name === 'AsyncFunction') {
                    jsonString = await dataProvider(startDate, direction, batchSize);
                } else {
                    jsonString = dataProvider(startDate, direction, batchSize);
                }

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
                        throw new Error('Некорректный формат данных: ожидается {date: string, columns: [{headerId: string, value: string, rowspan?: number}]}');
                    }
                }

                // Обрабатываем данные с поддержкой rowspan
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

                setLoadingDates(prev => {
                    const updated = new Set(prev);
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

    // Очистка невидимых данных с учетом rowspan
    const cleanupInvisibleData = useCallback(() => {
        const extendedRange = calculateExtendedRange(baseVisibleRange, dates, visibleData);
        const keepStart = Math.max(0, extendedRange.start - bufferSize);
        const keepEnd = Math.min(dates.length, extendedRange.end + bufferSize);
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

            if (removedCount > 0) {
                console.log(`[Cleanup] Удалено ${removedCount} записей из памяти`);
            }

            return cleaned;
        });
    }, [baseVisibleRange, dates, visibleData, bufferSize]);

    // ИСПРАВЛЕННАЯ загрузка видимых данных
    const loadVisibleData = useCallback(async () => {
        const { start, end } = visibleRange;
        const visibleDates = dates.slice(start, end);
        const missingDates = visibleDates.filter(date =>
            !visibleData[date] && !loadingDates.has(date)
        );

        if (missingDates.length === 0) return;

        console.log(`[loadVisibleData] Нужно загрузить ${missingDates.length} дат:`, missingDates);

        // Отмечаем даты как загружающиеся
        setLoadingDates(prev => new Set([...prev, ...missingDates]));

        // Группируем недостающие даты в непрерывные блоки для более эффективной загрузки
        const dateGroups = [];
        let currentGroup = [missingDates[0]];

        for (let i = 1; i < missingDates.length; i++) {
            const currentDate = parseDateString(missingDates[i]);
            const lastDate = parseDateString(currentGroup[currentGroup.length - 1]);
            const daysDiff = (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

            if (daysDiff === 1) {
                // Непрерывная дата - добавляем в текущую группу
                currentGroup.push(missingDates[i]);
            } else {
                // Разрыв - начинаем новую группу
                dateGroups.push(currentGroup);
                currentGroup = [missingDates[i]];
            }
        }
        dateGroups.push(currentGroup);

        // Загружаем каждую группу
        const loadPromises = dateGroups.map(group => {
            const startDate = group[0];
            const groupSize = Math.min(group.length, batchSize);

            console.log(`[loadVisibleData] Загружаем группу от ${startDate}, размер: ${groupSize}`);
            return loadBatch(startDate, 'down', groupSize);
        });

        await Promise.allSettled(loadPromises);
    }, [visibleRange, dates, visibleData, loadingDates, loadBatch, batchSize]);

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
            console.log('[Scroll] Расширяем даты вверх');
            promises.push(extendDates('up', isHighVelocity));
        }

        if (needsBottomExtension) {
            console.log('[Scroll] Расширяем даты вниз');
            promises.push(extendDates('down', isHighVelocity));
        }

        if (promises.length > 0) {
            await Promise.allSettled(promises);
        }

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

    // ИСПРАВЛЕННАЯ инициализация таблицы
    useEffect(() => {
        if (!isInitialized && dates.length === 0 && treeStructure.leafNodes.length > 0) {
            const initialDates = generateInitialDates();
            setDates(initialDates);

            const initializeTable = async () => {
                const todayFormatted = formatDate(today);
                const todayIndex = initialDates.findIndex(date => date === todayFormatted);

                console.log(`[Init] Сегодняшняя дата: ${todayFormatted}, индекс: ${todayIndex}`);

                if (todayIndex !== -1) {
                    // Ждем когда контейнер получит размеры
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
                    const initialBatchSize = Math.max(batchSize * 2, visibleRows + bufferSize * 2);

                    // Загружаем начальные данные
                    console.log(`[Init] Загружаем начальные данные: ${initialBatchSize} записей от ${todayFormatted}`);

                    try {
                        await loadBatch(todayFormatted, 'down', initialBatchSize);

                        // После загрузки данных устанавливаем скролл на сегодняшнюю дату
                        setTimeout(() => {
                            if (containerRef.current) {
                                const targetScroll = todayIndex * rowHeight;
                                console.log(`[Init] Устанавливаем скролл на позицию: ${targetScroll}`);

                                containerRef.current.scrollTop = targetScroll;
                                setContainerHeight(containerHeight);
                                setScrollTop(targetScroll);
                                setIsInitialized(true);

                                console.log('[Init] Инициализация завершена');
                            }
                        }, 200);
                    } catch (error) {
                        console.error('[Init] Ошибка при загрузке начальных данных:', error);
                        setIsInitialized(true); // Инициализируем даже при ошибке
                    }
                }
            };

            initializeTable();
        }
    }, [isInitialized, dates.length, generateInitialDates, today, rowHeight, batchSize, loadBatch, bufferSize, treeStructure.leafNodes.length]);

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
    }, [visibleRange, dates, loadBatch, batchSize]);

    return {
        dates,
        processedCache,
        visibleData,
        loadingDates,
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
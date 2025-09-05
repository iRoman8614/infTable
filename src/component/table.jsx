import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Имитирует асинхронную загрузку данных для диапазона дат (батч).
 */
const fetchBatchData = async (startDate, days) => {
    console.log(`Загружаем батч: ${startDate} (+${days} дней)`);
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
        if (value === "BGHeader") return '#e3f2fd';
        if (value === "DATE") return isPast ? '#f5f5f5' : '#ffffff';
        if (isPast) return '#eeeeee';

        switch (value) {
            case 'М': return '#c8e6c9';
            case 'О': return '#ffcdd2';
            case 'П': return '#fff3e0';
            case 'ПР': return '#e1bee7';
            case 'Р': return '#b3e5fc';
            default: return '#ffffff';
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

        const structureChanged = JSON.stringify(stableHeaderStructure.current) !== JSON.stringify(newStructure);

        if (structureChanged) {
            stableHeaderStructure.current = newStructure;
            stableGroupOrder.current = newGroupOrder;
            setHeaderStructure(newStructure);
            setGroupOrder(newGroupOrder);
        }

        headerUpdatePending.current = false;
    }, [dataCache]);

    // Отложенное обновление структуры заголовков после окончания скролла
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

    // ИСПРАВЛЕНИЕ: Стабильные значения для рендеринга таблицы
    const renderHeaderStructure = useMemo(() => {
        // Используем стабильную структуру во время скролла
        if (scrollVelocity.current > 0.5 && Object.keys(stableHeaderStructure.current).length > 0) {
            return stableHeaderStructure.current;
        }
        return headerStructure;
    }, [headerStructure]);

    const renderGroupOrder = useMemo(() => {
        // Используем стабильный порядок во время скролла
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

    // Отложенный пересчет rowspan с учетом скорости скролла
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

    // ИСПРАВЛЕНИЕ: Полностью переписанная функция extendDates с правильной компенсацией скролла
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

                // ИСПРАВЛЕНИЕ: Используем callback setState для получения актуального состояния
                setDates(prevDates => {
                    const updatedDates = [...newDates, ...prevDates];

                    // Компенсация скролла в том же обновлении состояния
                    requestAnimationFrame(() => {
                        if (containerRef.current && isScrollCompensating.current) {
                            // Рассчитываем новую позицию на основе актуального состояния
                            const compensatedScrollTop = (currentFirstVisibleIndex + newDates.length) * rowHeight + scrollOffset;
                            containerRef.current.scrollTop = compensatedScrollTop;
                            setScrollTop(compensatedScrollTop);

                            // Сбрасываем флаг компенсации через небольшую задержку
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

            // Отложенный пересчет rowspan после завершения компенсации
            setTimeout(() => {
                scheduleRowspanRecalculation();
            }, 150);
        }
    }, [dates, scrollBatchSize, rowHeight, loadBatch, scheduleRowspanRecalculation]);

    const handleScrollImmediate = useCallback(async () => {
        if (!containerRef.current) return;

        // ИСПРАВЛЕНИЕ: Игнорируем события скролла во время компенсации
        if (isScrollCompensating.current) return;

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

        // Обрабатываем отложенные обновления заголовков при замедлении скролла
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

                    // Пересчитываем rowspan для всех загруженных данных
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

    // Очистка таймаутов при размонтировании
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
                                                    borderRight: '1px solid #ddd',
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
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { formatDate, parseDateString } from '../utils/dateUtils.js';
import { smartThrottle } from '../utils/performanceUtils.js';

/**
 * Обработка данных таблицы с поддержкой rowspan и colspan
 */
const processTableData = (dataArray, leafNodes) => {
    const processedData = {};
    const activeRowspans = new Map();
    const activeColspans = new Map();

    dataArray.forEach((dayData, dayIndex) => {
        const elements = {};
        const leafNodeIds = leafNodes.map(node => node.id);
        const nodePositions = new Map();
        leafNodeIds.forEach((nodeId, index) => {
            nodePositions.set(nodeId, index);
        });

        leafNodeIds.forEach((leafNodeId, nodeIndex) => {
            const columnData = dayData.columns?.find(col => col.headerId === leafNodeId);

            if (columnData) {
                const value = columnData.value || '-';
                const color = columnData.color || null;
                const draggable = columnData.draggable === true;
                const rowspan = columnData.rowspan || 1;
                const colspan = columnData.colspan || 1;

                elements[leafNodeId] = {
                    status: value,
                    color: color,
                    draggable: draggable,
                    displayed: true,
                    rowspan: rowspan,
                    colspan: colspan,
                    children: columnData.children || [],
                    operating: columnData.operating || [],
                    shift: columnData.shift || [],
                    nodeId: leafNodeId,
                    headerId: leafNodeId
                };

                if (rowspan > 1) {
                    const rowspanKey = `${leafNodeId}_${dayIndex}_rowspan`;
                    activeRowspans.set(rowspanKey, {
                        nodeId: leafNodeId,
                        nodeIndex: nodeIndex,
                        startIndex: dayIndex,
                        endIndex: dayIndex + rowspan - 1,
                        value: value,
                        color: color,
                        draggable: draggable,
                        colspan: colspan,
                        children: columnData.children || [],
                        operating: columnData.operating || [],
                        shift: columnData.shift || []
                    });
                }

                if (colspan > 1) {
                    for (let i = 1; i < colspan; i++) {
                        const nextNodeIndex = nodeIndex + i;
                        if (nextNodeIndex < leafNodeIds.length) {
                            const nextNodeId = leafNodeIds[nextNodeIndex];
                                    elements[nextNodeId] = {
                                        status: value,
                                        color: color,
                                        draggable: draggable,
                                        displayed: false,
                                        rowspan: 1,
                                        colspan: 1,
                                        parentColspan: {
                                            parentNodeId: leafNodeId,
                                            parentNodeIndex: nodeIndex,
                                            colspanIndex: i
                                        },
                                        children: columnData.children || [],
                                        operating: columnData.operating || [],
                                        shift: columnData.shift || [],
                                        nodeId: nextNodeId,
                                        headerId: nextNodeId
                                    };
                        }
                    }
                }
            } else {
                let isUnderRowspan = false;

                for (const [key, rowspanInfo] of activeRowspans.entries()) {
                    if (rowspanInfo.nodeId === leafNodeId &&
                        dayIndex > rowspanInfo.startIndex &&
                        dayIndex <= rowspanInfo.endIndex) {

                        elements[leafNodeId] = {
                            status: rowspanInfo.value,
                            color: rowspanInfo.color,
                            draggable: rowspanInfo.draggable,
                            displayed: false,
                            rowspan: 1,
                            colspan: 1,
                            parentRowspan: rowspanInfo,
                            children: rowspanInfo.children || [],
                            operating: rowspanInfo.operating || [],
                            shift: rowspanInfo.shift || [],
                            nodeId: leafNodeId,
                            headerId: leafNodeId
                        };

                        if (rowspanInfo.colspan > 1) {
                            for (let i = 1; i < rowspanInfo.colspan; i++) {
                                const nextNodeIndex = rowspanInfo.nodeIndex + i;
                                if (nextNodeIndex < leafNodeIds.length) {
                                    const nextNodeId = leafNodeIds[nextNodeIndex];
                                    elements[nextNodeId] = {
                                        status: rowspanInfo.value,
                                        color: rowspanInfo.color,
                                        draggable: rowspanInfo.draggable,
                                        displayed: false,
                                        rowspan: 1,
                                        colspan: 1,
                                        parentRowspan: rowspanInfo,
                                        parentColspan: {
                                            parentNodeId: leafNodeId,
                                            parentNodeIndex: rowspanInfo.nodeIndex,
                                            colspanIndex: i
                                        },
                                        children: rowspanInfo.children || [],
                                        operating: rowspanInfo.operating || [],
                                        shift: rowspanInfo.shift || [],
                                        nodeId: nextNodeId,
                                        headerId: nextNodeId
                                    };
                                }
                            }
                        }

                        isUnderRowspan = true;
                        break;
                    }
                }

                if (!isUnderRowspan) {
                    let isUnderColspan = false;

                    for (let prevIndex = 0; prevIndex < nodeIndex; prevIndex++) {
                        const prevNodeId = leafNodeIds[prevIndex];
                        const prevColumnData = dayData.columns?.find(col => col.headerId === prevNodeId);

                        if (prevColumnData && prevColumnData.colspan > 1) {
                            const colspanEnd = prevIndex + prevColumnData.colspan - 1;
                            if (nodeIndex <= colspanEnd) {
                                elements[leafNodeId] = {
                                    status: prevColumnData.value || '-',
                                    color: prevColumnData.color || null,
                                    draggable: prevColumnData.draggable === true,
                                    displayed: false,
                                    rowspan: 1,
                                    colspan: 1,
                                    parentColspan: {
                                        parentNodeId: prevNodeId,
                                        parentNodeIndex: prevIndex,
                                        colspanIndex: nodeIndex - prevIndex
                                    },
                                    children: prevColumnData.children || [],
                                    operating: prevColumnData.operating || [],
                                    shift: prevColumnData.shift || [],
                                    nodeId: leafNodeId,
                                    headerId: leafNodeId
                                };
                                isUnderColspan = true;
                                break;
                            }
                        }
                    }

                    if (!isUnderColspan) {
                        elements[leafNodeId] = {
                            status: '-',
                            color: null,
                            draggable: false,
                            displayed: true,
                            rowspan: 1,
                            colspan: 1,
                            children: [],
                            operating: [],
                            shift: [],
                            nodeId: leafNodeId,
                            headerId: leafNodeId
                        };
                    }
                }
            }
        });

        processedData[dayData.date] = {
            date: dayData.date,
            elements: elements
        };
    });

    return { processedData, activeRowspans, activeColspans };
};

const calculateExtendedRange = (visibleRange, dates, visibleData) => {
    let { start, end } = visibleRange;
    let extendedStart = start;
    let extendedEnd = end;

    const searchStart = Math.max(0, start - 50);
    const searchEnd = Math.min(dates.length, end + 50);

    for (let i = searchStart; i < searchEnd; i++) {
        const dateString = dates[i];
        const rowData = visibleData[dateString];
        if (!rowData) continue;

        Object.values(rowData.elements).forEach(element => {
            if (element.rowspan > 1 && element.displayed) {
                const rowspanEnd = i + element.rowspan - 1;
                if (i <= end && rowspanEnd >= start) {
                    extendedStart = Math.min(extendedStart, i);
                    extendedEnd = Math.max(extendedEnd, rowspanEnd + 1);
                }
            }
        });
    }

    return {
        start: Math.max(0, extendedStart),
        end: Math.min(dates.length, extendedEnd)
    };
};

const canExcludeDate = (dateIndex, dates, visibleData, bufferRange) => {
    const dateString = dates[dateIndex];
    const rowData = visibleData[dateString];
    if (!rowData) return true;

    for (const element of Object.values(rowData.elements)) {
        if (element.rowspan > 1 && element.displayed) {
            const rowspanEnd = dateIndex + element.rowspan - 1;
            if (rowspanEnd >= bufferRange.start) {
                return false;
            }
        }
    }
    return true;
};

let globalInitialized = false;

if (typeof window !== 'undefined') {
    window.resetTableInitialization = () => {
        globalInitialized = false;
        console.log('[Debug] Глобальный флаг инициализации сброшен');
    };
}

export const useTableLogic = ({
                                  scrollBatchSize,
                                  dataProvider = null,
                                  onDataLoad = null,
                                  onError = null,
                                  treeStructure
                              }) => {
    const [dates, setDates] = useState([]);
    const [visibleData, setVisibleData] = useState({});
    const [loadingDates, setLoadingDates] = useState(new Set());
    const [isInitialized, setIsInitialized] = useState(false);
    const [activeRowspans, setActiveRowspans] = useState(new Map());
    const [activeColspans, setActiveColspans] = useState(new Map());
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    const containerRef = useRef(null);
    const fetchingPromises = useRef({});
    const scrollVelocity = useRef(0);
    const lastScrollTime = useRef(0);
    const lastScrollTop = useRef(0);
    const isScrollCompensating = useRef(false);

    const batchSize = useMemo(() => {
        const numSize = Number(scrollBatchSize);
        const finalSize = !isNaN(numSize) && numSize > 0 ? numSize : 30;

        console.log('[useTableLogic] batchSize из пропса:', finalSize);
        return finalSize;
    }, [scrollBatchSize]);

    const bufferSize = 10;

    const rowHeight = 40;

    const today = useMemo(() => {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        return date;
    }, []);

    const baseVisibleRange = useMemo(() => {
        if (!containerHeight || containerHeight === 0 || dates.length === 0) {
            const range = { start: 0, end: Math.min(dates.length, batchSize * 4) };
            return range;
        }

        const safeScroll = Number.isFinite(scrollTop) && !isNaN(scrollTop) ? scrollTop : 0;
        const visibleStart = Math.floor(safeScroll / rowHeight);
        const visibleEnd = Math.ceil((safeScroll + containerHeight) / rowHeight);
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

    // const loadBatch = useCallback(async (startDate, direction, batchSize) => {
    //     const batchKey = `${startDate}:${direction}:${batchSize}`;
    //
    //     if (fetchingPromises.current[batchKey]) {
    //         return fetchingPromises.current[batchKey];
    //     }
    //
    //     const promise = (async () => {
    //         try {
    //             const currentDataProvider = typeof window !== 'undefined' && window.VirtualizedTableState?.dataProvider
    //                 ? window.VirtualizedTableState.dataProvider
    //                 : dataProvider;
    //
    //             if (!currentDataProvider) {
    //                 throw new Error('dataProvider не установлен');
    //             }
    //
    //             let jsonString;
    //             if (currentDataProvider.constructor.name === 'AsyncFunction') {
    //                 jsonString = await currentDataProvider(startDate, direction, batchSize);
    //             } else {
    //                 jsonString = currentDataProvider(startDate, direction, batchSize);
    //             }
    //
    //             if (typeof jsonString !== 'string') {
    //                 throw new Error('Провайдер данных должен возвращать JSON-строку');
    //             }
    //
    //             let batchData;
    //             try {
    //                 batchData = JSON.parse(jsonString);
    //             } catch (parseError) {
    //                 throw new Error(`Ошибка парсинга JSON: ${parseError.message}`);
    //             }
    //
    //             let dataArray;
    //             if (batchData && batchData["data"] && Array.isArray(batchData["data"])) {
    //                 dataArray = batchData["data"];
    //             } else if (batchData && batchData.data && Array.isArray(batchData.data)) {
    //                 dataArray = batchData.data;
    //             } else {
    //                 throw new Error('Провайдер данных вернул некорректный формат');
    //             }
    //
    //             if (dataArray.length > 0 && treeStructure.leafNodes) {
    //                 const processed = processTableData(dataArray, treeStructure.leafNodes);
    //
    //                 setVisibleData(prev => {
    //                     const updated = { ...prev };
    //                     Object.keys(processed.processedData).forEach(date => {
    //                         updated[date] = processed.processedData[date];
    //                     });
    //                     return updated;
    //                 });
    //
    //                 setActiveRowspans(prev => {
    //                     const updated = new Map(prev);
    //                     processed.activeRowspans.forEach((value, key) => {
    //                         updated.set(key, value);
    //                     });
    //                     return updated;
    //                 });
    //
    //                 setActiveColspans(prev => {
    //                     const updated = new Map(prev);
    //                     processed.activeColspans?.forEach((value, key) => {
    //                         updated.set(key, value);
    //                     });
    //                     return updated;
    //                 });
    //             }
    //
    //             setLoadingDates(prev => {
    //                 const updated = new Set(prev);
    //                 dataArray.forEach(dayData => updated.delete(dayData.date));
    //                 return updated;
    //             });
    //
    //             const currentOnDataLoad = typeof window !== 'undefined' && window.VirtualizedTableState?.onDataLoad
    //                 ? window.VirtualizedTableState.onDataLoad
    //                 : onDataLoad;
    //
    //             if (currentOnDataLoad) {
    //                 currentOnDataLoad(dataArray, startDate, batchSize);
    //             }
    //
    //             return { data: dataArray };
    //
    //         } catch (error) {
    //             console.error('[loadBatch] Ошибка загрузки данных:', error);
    //
    //             setLoadingDates(prev => {
    //                 const updated = new Set(prev);
    //                 const startDateObj = parseDateString(startDate);
    //                 for (let i = 0; i < batchSize; i++) {
    //                     const date = new Date(startDateObj);
    //                     if (direction === 'up') {
    //                         date.setUTCDate(startDateObj.getUTCDate() - i);
    //                     } else {
    //                         date.setUTCDate(startDateObj.getUTCDate() + i);
    //                     }
    //                     updated.delete(formatDate(date));
    //                 }
    //                 return updated;
    //             });
    //
    //             const currentOnError = typeof window !== 'undefined' && window.VirtualizedTableState?.onError
    //                 ? window.VirtualizedTableState.onError
    //                 : onError;
    //
    //             if (currentOnError) {
    //                 currentOnError(error, { startDate, direction, batchSize });
    //             }
    //             throw error;
    //         }
    //     })();
    //
    //     promise.finally(() => {
    //         delete fetchingPromises.current[batchKey];
    //     });
    //
    //     fetchingPromises.current[batchKey] = promise;
    //     return promise;
    // }, [dataProvider, onDataLoad, onError, treeStructure.leafNodes]);

    const loadBatch = useCallback(async (startDate, direction, batchSize) => {
        let adjustedStartDate = startDate;

        if (direction === 'down') {
            const dateObj = parseDateString(startDate);
            dateObj.setUTCDate(dateObj.getUTCDate() - 1);
            adjustedStartDate = formatDate(dateObj);
        } else if (direction === 'up') {
            const dateObj = parseDateString(startDate);
            dateObj.setUTCDate(dateObj.getUTCDate() + 1);
            adjustedStartDate = formatDate(dateObj);
        }

        console.log(`[loadBatch] Скорректирован startDate: ${startDate} → ${adjustedStartDate}, направление: ${direction}`);

        const batchKey = `${adjustedStartDate}:${direction}:${batchSize}`;

        if (fetchingPromises.current[batchKey]) {
            return fetchingPromises.current[batchKey];
        }

        const promise = (async () => {
            try {
                const currentDataProvider = typeof window !== 'undefined' && window.VirtualizedTableState?.dataProvider
                    ? window.VirtualizedTableState.dataProvider
                    : dataProvider;

                if (!currentDataProvider) {
                    throw new Error('dataProvider не установлен');
                }

                let jsonString;
                if (currentDataProvider.constructor.name === 'AsyncFunction') {
                    jsonString = await currentDataProvider(adjustedStartDate, direction, batchSize);
                } else {
                    jsonString = currentDataProvider(adjustedStartDate, direction, batchSize);
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
                    throw new Error('Провайдер данных вернул некорректный формат');
                }

                if (dataArray.length > 0 && treeStructure.leafNodes) {
                    const processed = processTableData(dataArray, treeStructure.leafNodes);

                    setVisibleData(prev => {
                        const updated = { ...prev };
                        Object.keys(processed.processedData).forEach(date => {
                            updated[date] = processed.processedData[date];
                        });
                        return updated;
                    });

                    setActiveRowspans(prev => {
                        const updated = new Map(prev);
                        processed.activeRowspans.forEach((value, key) => {
                            updated.set(key, value);
                        });
                        return updated;
                    });

                    setActiveColspans(prev => {
                        const updated = new Map(prev);
                        processed.activeColspans?.forEach((value, key) => {
                            updated.set(key, value);
                        });
                        return updated;
                    });
                }

                setLoadingDates(prev => {
                    const updated = new Set(prev);
                    dataArray.forEach(dayData => updated.delete(dayData.date));
                    return updated;
                });

                const currentOnDataLoad = typeof window !== 'undefined' && window.VirtualizedTableState?.onDataLoad
                    ? window.VirtualizedTableState.onDataLoad
                    : onDataLoad;

                if (currentOnDataLoad) {
                    currentOnDataLoad(dataArray, adjustedStartDate, batchSize);
                }

                return { data: dataArray };

            } catch (error) {
                console.error('[loadBatch] Ошибка загрузки данных:', error);

                setLoadingDates(prev => {
                    const updated = new Set(prev);
                    const startDateObj = parseDateString(adjustedStartDate);
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

                const currentOnError = typeof window !== 'undefined' && window.VirtualizedTableState?.onError
                    ? window.VirtualizedTableState.onError
                    : onError;

                if (currentOnError) {
                    currentOnError(error, { startDate: adjustedStartDate, direction, batchSize });
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

    const cleanupInvisibleData = useCallback(() => {
        const extendedRange = calculateExtendedRange(baseVisibleRange, dates, visibleData);
        const keepStart = Math.max(0, extendedRange.start - bufferSize);
        const keepEnd = Math.min(dates.length, extendedRange.end + bufferSize);

        setVisibleData(prev => {
            const cleaned = {};
            let removedCount = 0;

            dates.forEach((date, index) => {
                if (index >= keepStart && index < keepEnd) {
                    if (prev[date]) {
                        cleaned[date] = prev[date];
                    }
                } else if (prev[date]) {
                    if (canExcludeDate(index, dates, prev, { start: keepStart, end: keepEnd })) {
                        removedCount++;
                    } else {
                        cleaned[date] = prev[date];
                    }
                }
            });

            if (removedCount > 0) {
                console.log(`[Cleanup] Удалено ${removedCount} записей из памяти`);
            }

            return cleaned;
        });

        setActiveRowspans(prev => {
            const cleaned = new Map();
            prev.forEach((value, key) => {
                if (value.endIndex >= keepStart - bufferSize) {
                    cleaned.set(key, value);
                }
            });
            return cleaned;
        });

        setActiveColspans(prev => {
            const cleaned = new Map();
            prev.forEach((value, key) => {
                if (value.endIndex >= keepStart - bufferSize) {
                    cleaned.set(key, value);
                }
            });
            return cleaned;
        });
    }, [baseVisibleRange, dates, visibleData, bufferSize]);

    const loadVisibleData = useCallback(async () => {
        const { start, end } = visibleRange;
        const visibleDates = dates.slice(start, end);
        const missingDates = visibleDates.filter(date =>
            !visibleData[date] && !loadingDates.has(date)
        );

        if (missingDates.length === 0) return;

        setLoadingDates(prev => new Set([...prev, ...missingDates]));

        const dateGroups = [];
        let currentGroup = [missingDates[0]];

        for (let i = 1; i < missingDates.length; i++) {
            const currentDate = parseDateString(missingDates[i]);
            const lastDate = parseDateString(currentGroup[currentGroup.length - 1]);
            const daysDiff = (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

            if (daysDiff === 1) {
                currentGroup.push(missingDates[i]);
            } else {
                dateGroups.push(currentGroup);
                currentGroup = [missingDates[i]];
            }
        }
        dateGroups.push(currentGroup);

        const loadPromises = dateGroups.map(group => {
            const startDate = group[0];
            const groupSize = Math.min(group.length, batchSize);
            return loadBatch(startDate, 'down', groupSize);
        });

        await Promise.allSettled(loadPromises);
    }, [visibleRange, dates, visibleData, loadingDates, loadBatch, batchSize]);

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

    const handleScrollImmediate = useCallback(async () => {
        if (!containerRef.current || isScrollCompensating.current) return;

        const container = containerRef.current;
        const newScrollTop = container.scrollTop;
        const newContainerHeight = container.clientHeight;

        if (!Number.isFinite(newScrollTop) || !Number.isFinite(newContainerHeight)) {
            return;
        }

        const scrollHeight = container.scrollHeight;
        const currentTime = Date.now();

        const timeDelta = currentTime - lastScrollTime.current;
        const scrollDelta = newScrollTop - lastScrollTop.current;

        if (timeDelta > 0) {
            scrollVelocity.current = Math.abs(scrollDelta / timeDelta);
        }

        lastScrollTime.current = currentTime;
        lastScrollTop.current = newScrollTop;

        setScrollTop(prev => {
            if (!Number.isFinite(newScrollTop) || isNaN(newScrollTop)) {
                return prev || 0;
            }
            return newScrollTop;
        });

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

    useEffect(() => {
        const cleanup = () => {
            console.log('[Init] Компонент размонтируется, сбрасываем глобальный флаг');
            globalInitialized = false;
        };

        if (typeof window !== 'undefined') {
            window.resetTableInitialization = cleanup;
        }

        if (globalInitialized) {
            console.log('[Init] УЖЕ инициализирован глобально, пропускаем');
            if (Object.keys(visibleData).length > 0 && !isInitialized) {
                console.log('[Init] Восстанавливаем isInitialized после ре-рендера');
                setIsInitialized(true);
            }
            return cleanup;
        }

        if (dates.length === 0) {
            if (treeStructure.leafNodes.length === 0) {
                console.log('[Init] Ожидание загрузки заголовков...');
                return;
            }

            globalInitialized = true;
            console.log('[Init] Начинаем ЕДИНСТВЕННУЮ инициализацию (globalInitialized = true)');

            const initialDates = generateInitialDates();
            setDates(initialDates);

            const initializeTable = async () => {
                const todayFormatted = formatDate(today);
                const todayIndex = initialDates.findIndex(date => date === todayFormatted);

                console.log(`[Init] Сегодняшняя дата: ${todayFormatted}, индекс: ${todayIndex}`);

                if (todayIndex !== -1) {
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

                    console.log(`[Init] Загружаем начальные данные: ${initialBatchSize} записей`);

                    try {
                        await loadBatch(todayFormatted, 'down', initialBatchSize);

                        setTimeout(() => {
                            if (containerRef.current) {
                                const targetScroll = todayIndex * rowHeight;

                                if (!Number.isFinite(targetScroll)) {
                                    console.error('[Init] targetScroll некорректен:', targetScroll);
                                    return;
                                }

                                containerRef.current.scrollTop = targetScroll;
                                setContainerHeight(containerHeight);
                                setScrollTop(targetScroll);

                                setTimeout(() => {
                                    setIsInitialized(true);

                                    if (typeof window !== 'undefined' && window.VirtualizedTableState) {
                                        window.VirtualizedTableState._initialized = true;
                                    }

                                    console.log('[Init] Инициализация завершена успешно');
                                }, 200);
                            }
                        }, 300);
                    } catch (error) {
                        console.error('[Init] Ошибка при загрузке:', error);
                        globalInitialized = false;
                        setIsInitialized(true);

                        if (typeof window !== 'undefined' && window.VirtualizedTableState) {
                            window.VirtualizedTableState._error = error.message;
                        }
                    }
                }
            };

            initializeTable();
        }

        return cleanup;
    }, [
        dates.length,
        treeStructure.leafNodes.length,
        generateInitialDates,
        today,
        rowHeight,
        batchSize,
        loadBatch,
        bufferSize,
    ]);

    useEffect(() => {
        if (isInitialized && dates.length > 0) {
            const timeoutId = setTimeout(() => {
                loadVisibleData();
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [isInitialized, visibleRange, dates.length, loadVisibleData]);

    const processedCache = useMemo(() => visibleData, [visibleData]);

    const refreshViewport = useCallback(async () => {
        const { start, end } = visibleRange;
        const currentVisibleDates = dates.slice(start, end);

        console.log(`[RefreshViewport] Обновление: ${currentVisibleDates.length} дат`);

        setVisibleData(prev => {
            const cleaned = { ...prev };
            currentVisibleDates.forEach(date => {
                delete cleaned[date];
            });
            return cleaned;
        });

        setLoadingDates(prev => {
            const updated = new Set(prev);
            currentVisibleDates.forEach(date => updated.delete(date));
            return updated;
        });

        if (currentVisibleDates.length > 0) {
            const batchCount = Math.ceil(currentVisibleDates.length / batchSize);

            const refreshPromises = [];
            for (let i = 0; i < batchCount; i++) {
                const batchStartDate = dates[start + (i * batchSize)];
                if (batchStartDate) {
                    refreshPromises.push(loadBatch(batchStartDate, 'down', batchSize));
                }
            }

            await Promise.allSettled(refreshPromises);
        }
    }, [visibleRange, dates, loadBatch, batchSize]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.VirtualizedTableState) {
            window.VirtualizedTableState._loading = loadingDates.size > 0;
        }
    }, [loadingDates.size]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.tableLogicDebug = {
                dates: dates.length,
                cacheSize: Object.keys(visibleData).length,
                visibleRange,
                isInitialized,
                batchSize,
                globalInitialized: globalInitialized,
                getCacheKeys: () => Object.keys(visibleData),
                getCache: () => visibleData
            };
        }
    }, [dates.length, visibleData, visibleRange, isInitialized, batchSize]);

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
        activeRowspans,
        activeColspans,
        handleScroll,
        loadBatch,
        refreshViewport
    };
};
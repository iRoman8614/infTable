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
                const value = columnData.value;
                const backgroundColor = columnData.backgroundColor || null;
                const fontColor = columnData.fontColor || null;
                const draggable = columnData.draggable === true;
                const locked = columnData.locked === true || columnData.pinned === true; // ← ДОБАВЛЕНО
                const rowspan = columnData.rowspan || 1;
                const colspan = columnData.colspan || 1;

                elements[leafNodeId] = {
                    status: value,
                    backgroundColor: backgroundColor,
                    fontColor: fontColor,
                    draggable: draggable,
                    locked: locked, // ← ДОБАВЛЕНО
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
                        backgroundColor: backgroundColor,
                        fontColor: fontColor,
                        draggable: draggable,
                        locked: locked, // ← ДОБАВЛЕНО
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
                                backgroundColor: backgroundColor,
                                fontColor: fontColor,
                                draggable: draggable,
                                locked: locked, // ← ДОБАВЛЕНО
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
                            backgroundColor: rowspanInfo.backgroundColor,
                            fontColor: rowspanInfo.fontColor,
                            draggable: rowspanInfo.draggable,
                            locked: rowspanInfo.locked, // ← ДОБАВЛЕНО
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
                                        backgroundColor: rowspanInfo.backgroundColor,
                                        fontColor: rowspanInfo.fontColor,
                                        draggable: rowspanInfo.draggable,
                                        locked: rowspanInfo.locked, // ← ДОБАВЛЕНО
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
                                const prevLocked = prevColumnData.locked === true || prevColumnData.pinned === true; // ← ДОБАВЛЕНО
                                elements[leafNodeId] = {
                                    status: prevColumnData.value,
                                    backgroundColor: prevColumnData.backgroundColor || null,
                                    fontColor: prevColumnData.fontColor || null,
                                    draggable: prevColumnData.draggable === true,
                                    locked: prevLocked, // ← ДОБАВЛЕНО
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
                            status: null,
                            backgroundColor: null,
                            fontColor: null,
                            draggable: false,
                            locked: false, // ← ДОБАВЛЕНО (по умолчанию не заблокирована)
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
                                  dataProvider,
                                  onDataLoad,
                                  onError,
                                  treeStructure,
                                  getVisibleCellChildren,
                                  shouldDisplayCell,
                                  dateRange = null
                              }) => {
    const [dates, setDates] = useState([]);
    const [visibleData, setVisibleData] = useState({});
    const [loadingDates, setLoadingDates] = useState(new Set());
    const [isInitialized, setIsInitialized] = useState(false);
    const [activeRowspans, setActiveRowspans] = useState(new Map());
    const [activeColspans, setActiveColspans] = useState(new Map());
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    
    // Колбек для сброса дат при изменении dateRange
    const resetDatesCallback = useCallback(() => {
        setDates([]);
        setIsInitialized(false);
    }, []);

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

    const bufferSize = 30;
    const BASE_ROW_HEIGHT = 40;
    const EXTENDED_ROW_HEIGHT = 120;

    // Функция для определения наличия children в строке
    const hasChildrenInRow = useCallback((dateString, processedRow) => {
        if (!processedRow || !processedRow.elements || !getVisibleCellChildren || !shouldDisplayCell) {
            return false;
        }

        if (!getVisibleCellChildren || !shouldDisplayCell) {
            return false;
        }

        return treeStructure.leafNodes.some(leafNode => {
            if (!shouldDisplayCell(processedRow, leafNode.id)) return false;
            const cellChildren = getVisibleCellChildren(processedRow, leafNode.id);
            return cellChildren && cellChildren.length > 0;
        });
    }, [getVisibleCellChildren, shouldDisplayCell, treeStructure.leafNodes]);

    // Функция для получения высоты строки
    const getRowHeight = useCallback((dateString) => {
        const processedRow = visibleData[dateString];
        if (!processedRow) {
            return BASE_ROW_HEIGHT;
        }

        const hasChildren = hasChildrenInRow(dateString, processedRow);
        return hasChildren ? EXTENDED_ROW_HEIGHT : BASE_ROW_HEIGHT;
    }, [visibleData, hasChildrenInRow, BASE_ROW_HEIGHT, EXTENDED_ROW_HEIGHT]);

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

        // Находим первую видимую строку с учетом динамических высот
        let visibleStart = 0;
        let accumulatedHeight = 0;
        for (let i = 0; i < dates.length; i++) {
            const rowHeight = getRowHeight(dates[i]);
            if (accumulatedHeight + rowHeight > safeScroll) {
                visibleStart = i;
                break;
            }
            accumulatedHeight += rowHeight;
        }

        // Находим последнюю видимую строку с учетом динамических высот
        let visibleEnd = visibleStart;
        accumulatedHeight = 0;
        for (let i = visibleStart; i < dates.length; i++) {
            accumulatedHeight += getRowHeight(dates[i]);
            if (accumulatedHeight >= containerHeight) {
                visibleEnd = i + 1;
                break;
            }
        }
        if (visibleEnd === visibleStart) {
            visibleEnd = dates.length;
        }

        const start = Math.max(0, visibleStart - bufferSize);
        const end = Math.min(dates.length, visibleEnd + bufferSize);

        return { start, end };
    }, [scrollTop, containerHeight, dates, getRowHeight, bufferSize, batchSize]);

    const visibleRange = useMemo(() => {
        return calculateExtendedRange(baseVisibleRange, dates, visibleData);
    }, [baseVisibleRange, dates, visibleData]);

    const generateInitialDates = useCallback(() => {
        const initialDates = [];
        const daysAround = Math.floor(batchSize * 2);

        // Определяем границы для генерации дат
        let minDate = null;
        let maxDate = null;

        if (dateRange && dateRange.length === 2) {
            // Парсим даты из dateRange
            const parseDateRange = (dateStr) => {
                if (window.TableUtils?.parseDateString) {
                    return window.TableUtils.parseDateString(dateStr);
                }
                const dateRegexDDMMYYYY = /^\d{2}\.\d{2}\.\d{4}$/;
                if (dateRegexDDMMYYYY.test(dateStr)) {
                    const [day, month, year] = dateStr.split('.').map(Number);
                    return new Date(Date.UTC(year, month - 1, day));
                }
                return new Date(dateStr + 'T00:00:00Z');
            };

            const rangeMinDate = parseDateRange(dateRange[0]);
            const rangeMaxDate = parseDateRange(dateRange[1]);
            
            // Добавляем буфер ±10 дней к границам
            const dateRangeBuffer = 10;
            minDate = new Date(rangeMinDate);
            minDate.setUTCDate(minDate.getUTCDate() - dateRangeBuffer);
            maxDate = new Date(rangeMaxDate);
            maxDate.setUTCDate(maxDate.getUTCDate() + dateRangeBuffer);
            
            console.log(`[generateInitialDates] Ограниченный режим с буфером ±${dateRangeBuffer} дней: ${formatDate(minDate)} - ${formatDate(maxDate)}`);
        } else {
            console.log('[generateInitialDates] Бесконечный режим');
        }

        for (let i = -daysAround; i <= daysAround; i++) {
            const date = new Date(today);
            date.setUTCDate(today.getUTCDate() + i);

            // Проверяем границы если они установлены
            if (minDate && maxDate) {
                if (date < minDate || date > maxDate) {
                    continue; // Пропускаем даты вне диапазона
                }
            }

            initialDates.push(formatDate(date));
        }

        console.log(`[generateInitialDates] Сгенерировано ${initialDates.length} начальных дат`);
        return initialDates;
    }, [today, batchSize, dateRange]);

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

        // Определяем границы для расширения дат
        let minDate = null;
        let maxDate = null;

        if (dateRange && dateRange.length === 2) {
            const parseDateRange = (dateStr) => {
                if (window.TableUtils?.parseDateString) {
                    return window.TableUtils.parseDateString(dateStr);
                }
                const dateRegexDDMMYYYY = /^\d{2}\.\d{2}\.\d{4}$/;
                if (dateRegexDDMMYYYY.test(dateStr)) {
                    const [day, month, year] = dateStr.split('.').map(Number);
                    return new Date(Date.UTC(year, month - 1, day));
                }
                return new Date(dateStr + 'T00:00:00Z');
            };

            const rangeMinDate = parseDateRange(dateRange[0]);
            const rangeMaxDate = parseDateRange(dateRange[1]);
            
            // Добавляем буфер ±10 дней к границам
            const dateRangeBuffer = 10;
            minDate = new Date(rangeMinDate);
            minDate.setUTCDate(minDate.getUTCDate() - dateRangeBuffer);
            maxDate = new Date(rangeMaxDate);
            maxDate.setUTCDate(maxDate.getUTCDate() + dateRangeBuffer);
            
            console.log(`[extendDates] dateRange: ${dateRange}, minDate: ${formatDate(minDate)}, maxDate: ${formatDate(maxDate)}, направление: ${direction}`);
        }

        if (direction === 'down') {
            const lastDate = dates[dates.length - 1];
            if (!lastDate) return;

            const lastDateObj = parseDateString(lastDate);
            const newDates = [];
            const extendSize = isPreemptive ? batchSize * 2 : batchSize;

            for (let i = 1; i <= extendSize; i++) {
                const date = new Date(lastDateObj);
                date.setUTCDate(lastDateObj.getUTCDate() + i);

                // Проверяем границу maxDate если она установлена
                if (maxDate && date > maxDate) {
                    console.log(`[extendDates] Достигнута верхняя граница ${formatDate(maxDate)}, остановка расширения вниз`);
                    break;
                }

                newDates.push(formatDate(date));
            }

            if (newDates.length > 0) {
                setDates(prev => [...prev, ...newDates]);
            }

        } else if (direction === 'up') {
            const firstDate = dates[0];
            if (!firstDate) return;

            const firstDateObj = parseDateString(firstDate);
            const newDates = [];
            const extendSize = isPreemptive ? batchSize * 2 : batchSize;

            for (let i = extendSize; i >= 1; i--) {
                const date = new Date(firstDateObj);
                date.setUTCDate(firstDateObj.getUTCDate() - i);

                // Проверяем границу minDate если она установлена
                if (minDate && date < minDate) {
                    console.log(`[extendDates] Достигнута нижняя граница ${formatDate(minDate)}, остановка расширения вверх`);
                    break;
                }

                newDates.push(formatDate(date));
            }

            if (newDates.length === 0) {
                // Нет дат для добавления, выходим
                return;
            }

            if (containerRef.current) {
                isScrollCompensating.current = true;

                const currentScrollTop = containerRef.current.scrollTop;

                // Находим индекс первой видимой строки с учетом динамических высот
                let currentFirstVisibleIndex = 0;
                let accumulatedHeight = 0;
                for (let i = 0; i < dates.length; i++) {
                    const rowHeight = getRowHeight(dates[i]);
                    if (accumulatedHeight + rowHeight > currentScrollTop) {
                        currentFirstVisibleIndex = i;
                        break;
                    }
                    accumulatedHeight += rowHeight;
                }
                const scrollOffset = currentScrollTop - accumulatedHeight;

                setDates(prevDates => {
                    const updatedDates = [...newDates, ...prevDates];

                    requestAnimationFrame(() => {
                        if (containerRef.current && isScrollCompensating.current) {
                            // Рассчитываем компенсированный скролл с учетом динамических высот
                            let compensatedScrollTop = 0;
                            for (let i = 0; i < currentFirstVisibleIndex + newDates.length; i++) {
                                compensatedScrollTop += getRowHeight(updatedDates[i]);
                            }
                            compensatedScrollTop += scrollOffset;

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
    }, [dates, batchSize, BASE_ROW_HEIGHT, dateRange]);

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

        const baseThreshold = BASE_ROW_HEIGHT * bufferSize;
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
    }, [dates, extendDates, BASE_ROW_HEIGHT, bufferSize, cleanupInvisibleData]);

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
            globalInitialized = false;
        };

        if (typeof window !== 'undefined') {
            // Объединяем глобальную функцию с локальным колбеком
            window.resetTableInitialization = () => {
                globalInitialized = false;
                console.log('[Debug] Глобальный флаг инициализации сброшен');
                resetDatesCallback();
            };
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
                    const visibleRows = Math.ceil(containerHeight / BASE_ROW_HEIGHT);
                    const initialBatchSize = Math.max(batchSize * 2, visibleRows + bufferSize * 2);

                    console.log(`[Init] Загружаем начальные данные: ${initialBatchSize} записей`);

                    try {
                        await loadBatch(todayFormatted, 'down', initialBatchSize);

                        setTimeout(() => {
                            if (containerRef.current) {
                                // Рассчитываем targetScroll с учетом реальных высот строк
                                let targetScroll = 0;
                                for (let i = 0; i < todayIndex; i++) {
                                    targetScroll += getRowHeight(initialDates[i]);
                                }

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
        BASE_ROW_HEIGHT,
        batchSize,
        loadBatch,
        bufferSize,
        getRowHeight,
        resetDatesCallback,
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

    const jumpToDate = useCallback(async (targetDateString) => {
        console.log(`[jumpToDate] Переход на дату: ${targetDateString}`);
        
        // Парсим дату если она в формате DD.MM.YYYY
        let parsedDate;
        if (typeof targetDateString === 'string' && window.TableUtils?.parseDateString) {
            try {
                const dateRegexDDMMYYYY = /^\d{2}\.\d{2}\.\d{4}$/;
                if (dateRegexDDMMYYYY.test(targetDateString)) {
                    parsedDate = window.TableUtils.parseDateString(targetDateString);
                } else {
                    parsedDate = new Date(targetDateString + 'T00:00:00Z');
                }
            } catch (error) {
                console.error(`[jumpToDate] Ошибка парсинга даты: ${error}`);
                return;
            }
        } else {
            console.error('[jumpToDate] targetDateString должен быть строкой в формате DD.MM.YYYY или YYYY-MM-DD');
            return;
        }
        
        const targetDateFormatted = formatDate(parsedDate);
        console.log(`[jumpToDate] Форматированная дата: ${targetDateFormatted}`);
        
        // Генерируем начальные даты с целевой датой в центре
        const initialDates = [];
        const daysAround = Math.floor(batchSize * 2);
        
        // Определяем границы для генерации дат
        let minDate = null;
        let maxDate = null;
        
        if (dateRange && dateRange.length === 2) {
            const parseDateRange = (dateStr) => {
                if (window.TableUtils?.parseDateString) {
                    return window.TableUtils.parseDateString(dateStr);
                }
                const dateRegexDDMMYYYY = /^\d{2}\.\d{2}\.\d{4}$/;
                if (dateRegexDDMMYYYY.test(dateStr)) {
                    const [day, month, year] = dateStr.split('.').map(Number);
                    return new Date(Date.UTC(year, month - 1, day));
                }
                return new Date(dateStr + 'T00:00:00Z');
            };
            
            const rangeMinDate = parseDateRange(dateRange[0]);
            const rangeMaxDate = parseDateRange(dateRange[1]);
            
            const dateRangeBuffer = 10;
            minDate = new Date(rangeMinDate);
            minDate.setUTCDate(minDate.getUTCDate() - dateRangeBuffer);
            maxDate = new Date(rangeMaxDate);
            maxDate.setUTCDate(maxDate.getUTCDate() + dateRangeBuffer);
        }
        
        for (let i = -daysAround; i <= daysAround; i++) {
            const date = new Date(parsedDate);
            date.setUTCDate(parsedDate.getUTCDate() + i);
            
            if (minDate && maxDate) {
                if (date < minDate || date > maxDate) {
                    continue;
                }
            }
            
            initialDates.push(formatDate(date));
        }
        
        console.log(`[jumpToDate] Сгенерировано ${initialDates.length} дат вокруг ${targetDateFormatted}`);
        
        // Устанавливаем новые даты
        setDates(initialDates);
        setIsInitialized(false);
        
        // Находим индекс целевой даты
        const targetIndex = initialDates.findIndex(date => date === targetDateFormatted);
        console.log(`[jumpToDate] Индекс целевой даты: ${targetIndex}`);
        
        if (targetIndex === -1) {
            console.error('[jumpToDate] Целевая дата не найдена в сгенерированном диапазоне');
            return;
        }
        
        // Ждем готовности контейнера
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
        const visibleRows = Math.ceil(containerHeight / BASE_ROW_HEIGHT);
        const initialBatchSize = Math.max(batchSize * 2, visibleRows + bufferSize * 2);
        
        console.log(`[jumpToDate] Загружаем начальные данные: ${initialBatchSize} записей`);
        
        try {
            await loadBatch(targetDateFormatted, 'down', initialBatchSize);
            
            setTimeout(() => {
                if (containerRef.current) {
                    // Рассчитываем targetScroll с учетом реальных высот строк
                    let targetScroll = 0;
                    for (let i = 0; i < targetIndex; i++) {
                        targetScroll += getRowHeight(initialDates[i]);
                    }
                    
                    if (!Number.isFinite(targetScroll)) {
                        console.error('[jumpToDate] targetScroll некорректен:', targetScroll);
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
                        
                        console.log('[jumpToDate] Переход на дату завершен успешно');
                    }, 200);
                }
            }, 300);
        } catch (error) {
            console.error('[jumpToDate] Ошибка при загрузке:', error);
            setIsInitialized(true);
            
            if (typeof window !== 'undefined' && window.VirtualizedTableState) {
                window.VirtualizedTableState._error = error.message;
            }
        }
    }, [batchSize, bufferSize, BASE_ROW_HEIGHT, dateRange, loadBatch, getRowHeight]);

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
        rowHeight: BASE_ROW_HEIGHT, // для обратной совместимости
        BASE_ROW_HEIGHT,
        EXTENDED_ROW_HEIGHT,
        getRowHeight,
        bufferSize,
        activeRowspans,
        activeColspans,
        handleScroll,
        loadBatch,
        refreshViewport,
        jumpToDate
    };
};
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * ENHANCED VIRTUALIZED TABLE COMPONENT
 *
 * Высокопроизводительная виртуализированная таблица с поддержкой:
 * - Бесконечного скролла (infinite scroll)
 * - Динамической загрузки данных батчами
 * - Иерархических заголовков через headerProvider
 * - Системы фильтрации и поиска колонок
 * - Объединения ячеек (rowspan) для одинаковых значений
 * - Кастомных цветовых тем
 * - Отладочной информации
 *
 * @version 3.0.0
 * @author Enhanced Version
 */

/**
 * Утилиты для работы с датами
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

// Экспортируем утилиты глобально
if (typeof window !== 'undefined') {
    window.TableUtils = {
        parseDateString,
        formatDate
    };
}

/**
 * Дефолтный набор заголовков для демонстрации
 */
const defaultHeaders = {
    "headers": [
        {
            "id": "factory1",
            "parentId": null,
            "type": "node",
            "name": "Завод №1 'Металлург'",
            "metadata": {
                "color": "#2196f3",
                "tooltip": "Основной производственный комплекс",
                "workCount": 150
            }
        },
        {
            "id": "workshop1",
            "parentId": "factory1",
            "type": "assembly",
            "name": "Цех сборки №1",
            "metadata": {
                "color": "#4caf50",
                "tooltip": "Основной сборочный цех",
                "workCount": 45
            }
        },
        {
            "id": "line1",
            "parentId": "workshop1",
            "type": "component",
            "name": "Линия А",
            "metadata": {
                "color": "#ff9800",
                "tooltip": "Автоматизированная линия сборки",
                "workCount": 15
            }
        },
        {
            "id": "station1",
            "parentId": "line1",
            "type": "component",
            "name": "Станция 1",
            "metadata": {
                "color": "#f44336",
                "tooltip": "Начальная станция сборки",
                "workCount": 3
            }
        },
        {
            "id": "station2",
            "parentId": "line1",
            "type": "component",
            "name": "Станция 2",
            "metadata": {
                "color": "#f44336",
                "tooltip": "Промежуточная станция",
                "workCount": 4
            }
        },
        {
            "id": "line2",
            "parentId": "workshop1",
            "type": "component",
            "name": "Линия Б",
            "metadata": {
                "color": "#ff9800",
                "tooltip": "Полуавтоматическая линия",
                "workCount": 12
            }
        },
        {
            "id": "station3",
            "parentId": "line2",
            "type": "component",
            "name": "Станция 3",
            "metadata": {
                "color": "#f44336",
                "tooltip": "Контрольная станция",
                "workCount": 2
            }
        },
        {
            "id": "workshop2",
            "parentId": "factory1",
            "type": "assembly",
            "name": "Цех механообработки",
            "metadata": {
                "color": "#4caf50",
                "tooltip": "Цех механической обработки деталей",
                "workCount": 65
            }
        },
        {
            "id": "section1",
            "parentId": "workshop2",
            "type": "component",
            "name": "Участок токарных работ",
            "metadata": {
                "color": "#9c27b0",
                "tooltip": "Участок токарной обработки",
                "workCount": 25
            }
        },
        {
            "id": "machine1",
            "parentId": "section1",
            "type": "component",
            "name": "Станок ЧПУ-1",
            "metadata": {
                "color": "#795548",
                "tooltip": "Токарный станок с ЧПУ",
                "workCount": 1
            }
        }
    ]
};

/**
 * Интерфейс для провайдера данных
 */
let customDataProvider = null;

/**
 * Дефолтный провайдер данных - заполняет все ячейки буквой "М"
 */
const defaultDataProvider = async (startDate, days, leafNodes) => {
    console.log(`[EnhancedTable] Загружаем батч: ${startDate} (+${days} дней), листовых узлов: ${leafNodes.length}`);
    await new Promise(resolve => setTimeout(resolve, 300));

    const startDateObj = parseDateString(startDate);
    const batchData = [];

    // Возможные значения статусов
    const statusValues = ["М", "О", "П", "ПР", "Р"];
    const randomStatus = () => statusValues[Math.floor(Math.random() * statusValues.length)];

    for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDateObj);
        currentDate.setUTCDate(startDateObj.getUTCDate() + i);

        const dayData = {
            date: formatDate(currentDate),
            timestamp: Date.now()
        };

        // Заполняем данные для всех листовых узлов
        leafNodes.forEach(node => {
            // По умолчанию "М", но иногда случайные статусы для разнообразия
            dayData[node.id] = Math.random() > 0.8 ? randomStatus() : 'М';
        });

        batchData.push(dayData);
    }

    return { data: batchData };
};

/**
 * Обработка данных для таблицы с вычислением rowspan
 */
function processDataForTable(data, leafNodes) {
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
                          headerProvider = null,
                          onDataLoad = null,
                          onError = null
                      }) => {
    // Основные состояния
    const [dates, setDates] = useState([]);
    const [dataCache, setDataCache] = useState({});
    const [processedCache, setProcessedCache] = useState({});
    const [loadingBatches, setLoadingBatches] = useState(new Set());
    const [isInitialized, setIsInitialized] = useState(false);

    // Состояния для фильтров
    const [showFilters, setShowFilters] = useState(false);
    const [nodeVisibility, setNodeVisibility] = useState({});
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');

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

    // Структура дерева заголовков
    const treeStructure = useMemo(() => {
        const headers = headerProvider || defaultHeaders;
        const nodesMap = new Map();
        const tree = [];

        // Создаем карту узлов
        headers.headers.forEach(header => {
            nodesMap.set(header.id, { ...header, children: [] });
        });

        // Строим дерево
        headers.headers.forEach(header => {
            if (header.parentId === null) {
                tree.push(nodesMap.get(header.id));
            } else {
                const parent = nodesMap.get(header.parentId);
                if (parent) {
                    parent.children.push(nodesMap.get(header.id));
                }
            }
        });

        // Вычисляем максимальную глубину
        const getMaxDepth = (node) => {
            if (node.children.length === 0) return 1;
            return 1 + Math.max(...node.children.map(getMaxDepth));
        };
        const maxDepth = Math.max(...tree.map(getMaxDepth));

        // Находим все листовые узлы
        const leafNodes = [];
        const findLeaves = (node) => {
            if (node.children.length === 0) {
                leafNodes.push(node);
            } else {
                node.children.forEach(findLeaves);
            }
        };
        tree.forEach(findLeaves);

        return { tree, maxDepth, leafNodes, nodesMap };
    }, [headerProvider]);

    // Инициализация видимости узлов
    useEffect(() => {
        const visibility = {};
        const addNodeAndChildren = (node) => {
            visibility[node.id] = true;
            node.children.forEach(addNodeAndChildren);
        };
        treeStructure.tree.forEach(addNodeAndChildren);
        setNodeVisibility(visibility);
    }, [treeStructure]);

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

    // Функции для работы с деревом
    const getAllDescendants = useCallback((nodeId) => {
        const node = treeStructure.nodesMap.get(nodeId);
        if (!node) return [];

        const descendants = [];
        const traverse = (n) => {
            n.children.forEach(child => {
                descendants.push(child.id);
                traverse(child);
            });
        };
        traverse(node);
        return descendants;
    }, [treeStructure.nodesMap]);

    const isNodeFullyVisible = useCallback((nodeId) => {
        let currentNodeId = nodeId;
        while (currentNodeId) {
            if (!nodeVisibility[currentNodeId]) return false;
            const node = treeStructure.nodesMap.get(currentNodeId);
            if (!node) return false;
            currentNodeId = node.parentId;
        }
        return true;
    }, [nodeVisibility, treeStructure.nodesMap]);

    const toggleNodeVisibility = useCallback((nodeId) => {
        setNodeVisibility(prev => {
            const newVisibility = { ...prev };
            const newValue = !prev[nodeId];
            newVisibility[nodeId] = newValue;

            if (!newValue) {
                const descendants = getAllDescendants(nodeId);
                descendants.forEach(id => {
                    newVisibility[id] = false;
                });
            } else {
                const node = treeStructure.nodesMap.get(nodeId);
                if (node && node.children) {
                    node.children.forEach(child => {
                        newVisibility[child.id] = true;
                        const showDescendantsRecursively = (n) => {
                            if (n.children) {
                                n.children.forEach(childNode => {
                                    const shouldShow = () => {
                                        let currentId = childNode.parentId;
                                        while (currentId && currentId !== nodeId) {
                                            if (!newVisibility[currentId]) return false;
                                            const currentNode = treeStructure.nodesMap.get(currentId);
                                            currentId = currentNode?.parentId;
                                        }
                                        return true;
                                    };

                                    if (shouldShow()) {
                                        newVisibility[childNode.id] = true;
                                        showDescendantsRecursively(childNode);
                                    }
                                });
                            }
                        };
                        showDescendantsRecursively(child);
                    });
                }
            }

            return newVisibility;
        });
    }, [getAllDescendants, treeStructure.nodesMap]);

    const toggleNodeExpansion = useCallback((nodeId) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    }, []);

    const toggleAllChildrenVisibility = useCallback((nodeId, visible) => {
        const descendants = getAllDescendants(nodeId);
        const updates = {};
        descendants.forEach(id => {
            updates[id] = visible;
        });
        setNodeVisibility(prev => ({ ...prev, ...updates }));
    }, [getAllDescendants]);

    // Видимые листовые узлы
    const visibleLeafNodes = useMemo(() => {
        return treeStructure.leafNodes.filter(node => isNodeFullyVisible(node.id));
    }, [treeStructure.leafNodes, isNodeFullyVisible]);

    // Фильтрация дерева для поиска
    const filteredTree = useMemo(() => {
        if (!searchTerm) return treeStructure.tree;

        const filterNodes = (nodes) => {
            return nodes.reduce((filtered, node) => {
                const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
                const filteredChildren = filterNodes(node.children);

                if (matchesSearch || filteredChildren.length > 0) {
                    filtered.push({ ...node, children: filteredChildren });
                }

                return filtered;
            }, []);
        };

        return filterNodes(treeStructure.tree);
    }, [treeStructure.tree, searchTerm]);

    // Загрузка батча данных
    const loadBatch = useCallback(async (startDate, batchSize) => {
        const batchKey = `${startDate}+${batchSize}`;

        if (fetchingPromises.current[batchKey] || loadingBatches.has(batchKey)) {
            return fetchingPromises.current[batchKey];
        }

        setLoadingBatches(prev => new Set([...prev, batchKey]));

        const activeDataProvider = dataProvider || customDataProvider || defaultDataProvider;

        const promise = activeDataProvider(startDate, batchSize, treeStructure.leafNodes)
            .then(batchData => {
                setDataCache(prev => {
                    const updated = { ...prev };
                    batchData.data.forEach(dayData => {
                        updated[dayData.date] = dayData;
                    });
                    return updated;
                });

                if (onDataLoad) {
                    onDataLoad(batchData.data, startDate, batchSize);
                }

                return batchData;
            })
            .catch(error => {
                console.error('[EnhancedTable] Ошибка загрузки данных:', error);
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

    // Функция расчета colspan
    const calculateColspan = useCallback((node) => {
        if (node.children.length === 0) {
            return isNodeFullyVisible(node.id) ? 1 : 0;
        }
        return node.children.reduce((sum, child) => sum + calculateColspan(child), 0);
    }, [isNodeFullyVisible]);

    // Фильтрация видимых узлов для заголовка
    const filterVisibleNodes = useCallback((nodes) => {
        return nodes.filter(node => {
            if (isNodeFullyVisible(node.id)) return true;

            const hasVisibleDescendants = (n) => {
                if (n.children.length === 0) return false;
                return n.children.some(child =>
                    isNodeFullyVisible(child.id) || hasVisibleDescendants(child)
                );
            };

            return hasVisibleDescendants(node);
        }).map(node => ({
            ...node,
            children: filterVisibleNodes(node.children)
        }));
    }, [isNodeFullyVisible]);

    // Получение значения ячейки
    const getCellValue = useCallback((processedRow, nodeId) => {
        return processedRow.elements && processedRow.elements[nodeId]
            ? processedRow.elements[nodeId].status
            : 'М';
    }, []);

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

    // Рендер заголовка
    const renderHeaderRows = () => {
        const rows = [];
        const visibleTree = filterVisibleNodes(treeStructure.tree);

        let currentLevelNodes = visibleTree;
        let depth = 1;

        while (currentLevelNodes.length > 0 && depth <= treeStructure.maxDepth) {
            rows.push(
                <tr key={`header-row-${depth}`}>
                    {depth === 1 && (
                        <th
                            rowSpan={treeStructure.maxDepth}
                            style={{
                                padding: '8px',
                                minWidth: '100px',
                                borderRight: '1px solid #ddd',
                                fontSize: '14px',
                                fontWeight: 'normal',
                                whiteSpace: 'nowrap',
                                color: "black",
                                backgroundColor: activeColorTheme("BGHeader")
                            }}
                        >
                            Дата
                        </th>
                    )}
                    {currentLevelNodes.map(node => {
                        const colspan = calculateColspan(node);
                        if (colspan === 0) return null;

                        const isVisible = isNodeFullyVisible(node.id);

                        return (
                            <th
                                key={node.id}
                                colSpan={colspan}
                                rowSpan={node.children.length === 0 ? treeStructure.maxDepth - depth + 1 : 1}
                                style={{
                                    backgroundColor: isVisible ? node.metadata.color : '#ccc',
                                    padding: '8px',
                                    fontSize: '12px',
                                    fontWeight: 'normal',
                                    textAlign: 'center',
                                    color: "black",
                                    opacity: isVisible ? 1 : 0.5
                                }}
                            >
                                {node.name}
                            </th>
                        );
                    })}
                </tr>
            );

            const nextLevelNodes = [];
            currentLevelNodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    nextLevelNodes.push(...node.children);
                }
            });

            currentLevelNodes = filterVisibleNodes(nextLevelNodes);
            depth++;
        }

        return rows;
    };

    // Рендер панели фильтров
    const renderFiltersPanel = () => {
        const renderNode = (node, level = 0) => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expandedNodes.has(node.id);
            const isVisible = nodeVisibility[node.id];

            return (
                <div key={node.id}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '120px auto 150px',
                        padding: '8px 16px',
                        alignItems: 'center',
                        borderBottom: '1px solid #f0f0f0',
                        backgroundColor: level % 2 === 0 ? 'white' : '#fafafa',
                        marginLeft: `${level * 20}px`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={() => toggleNodeVisibility(node.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    color: isVisible ? '#007bff' : '#ccc'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                </svg>
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {hasChildren && (
                                <button
                                    onClick={() => toggleNodeExpansion(node.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        color: '#666'
                                    }}
                                >
                                    <span style={{
                                        fontSize: '12px',
                                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s ease',
                                        display: 'inline-block'
                                    }}>
                                        ▶
                                    </span>
                                </button>
                            )}
                            <div
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: node.metadata.color,
                                    borderRadius: '2px',
                                    border: '1px solid #ddd'
                                }}
                            />
                            <span style={{
                                fontSize: '14px',
                                fontWeight: level === 0 ? '500' : 'normal',
                                opacity: isVisible ? 1 : 0.5
                            }}>
                                {node.name}
                            </span>
                            {node.metadata.workCount && (
                                <span style={{
                                    fontSize: '12px',
                                    color: '#666',
                                    marginLeft: '8px'
                                }}>
                                    ({node.metadata.workCount})
                                </span>
                            )}
                        </div>
                    </div>

                    {hasChildren && isExpanded && (
                        <div>
                            {node.children.map(child => renderNode(child, level + 1))}
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '16px',
                backgroundColor: 'white',
                fontFamily: 'Arial, sans-serif'
            }}>
                <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '500', color: '#666' }}>Найти по названию</span>
                        <input
                            type="text"
                            placeholder="Поиск узлов..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '6px 12px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: '#f5f5f5',
                                fontSize: '14px',
                                width: '300px'
                            }}
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                            color: '#666',
                            padding: '4px'
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {filteredTree.map(node => renderNode(node))}
                </div>
            </div>
        );
    };

    const { start: startIndex, end: endIndex } = visibleRange;
    const visibleDates = dates.slice(startIndex, endIndex);
    const paddingTop = startIndex * rowHeight;
    const paddingBottom = Math.max(0, (dates.length - endIndex) * rowHeight);

    return (
        <>
            <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '10px',
                alignItems: 'center'
            }}>
                <div>План 1</div>
                <div>Отображать отклонения</div>
                <div>Режим редактирования</div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: 'rgba(108,155,255,0.45)',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Задать фильтр
                </button>
            </div>

            {showFilters && renderFiltersPanel()}

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
                    <thead style={{
                        position: 'sticky',
                        top: 0,
                        backgroundColor: activeColorTheme("BGHeader"),
                        zIndex: 10
                    }}>
                    {renderHeaderRows()}
                    </thead>

                    <tbody>
                    {paddingTop > 0 && (
                        <tr style={{ height: paddingTop }}>
                            <td colSpan={visibleLeafNodes.length + 1} style={{ padding: 0, border: 'none' }} />
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
                                    padding: '8px',
                                    borderRight: '1px solid #ddd',
                                    fontSize: '14px',
                                    fontWeight: 'normal',
                                    whiteSpace: 'nowrap',
                                    color: isPastDate ? '#666' : 'inherit',
                                }}>
                                    {dateString}
                                </td>

                                {visibleLeafNodes.map((leafNode) => {
                                    const cellValue = processedRow ? getCellValue(processedRow, leafNode.id) : 'М';

                                    let shouldDisplay = true;
                                    let rowSpan = 1;

                                    if (processedRow) {
                                        const elementData = processedRow.elements[leafNode.id];
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
                                            key={`${dateString}-${leafNode.id}`}
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
                                })}
                            </tr>
                        );
                    })}

                    {paddingBottom > 0 && (
                        <tr style={{ height: paddingBottom }}>
                            <td colSpan={visibleLeafNodes.length + 1} style={{ padding: 0, border: 'none' }} />
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
                <span><strong>Глубина дерева:</strong> {treeStructure.maxDepth}</span>
                <span><strong>Всего листовых узлов:</strong> {treeStructure.leafNodes.length}</span>
                <span><strong>Видимых листовых узлов:</strong> {visibleLeafNodes.length}</span>
                <span><strong>Развернутых узлов:</strong> {expandedNodes.size}</span>
                <span><strong>Поисковый запрос:</strong> "{searchTerm}"</span>
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
export { formatDate, parseDateString, defaultHeaders };
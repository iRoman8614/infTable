import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const headers = {
    "headers": [
        {
            "id": "factory1",
            "parentId": null,
            "type": "node",
            "name": "Завод №1 'Металлург'",
            "metadata": {
                "color": "#2196f3",
                "tooltip": "Основной производственный комплекс",
                "link": "/factories/factory1",
                "subtype": "production_facility",
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
                "link": "/workshops/workshop1",
                "subtype": "assembly_line",
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
                "link": "/lines/line1",
                "subtype": "automated_line",
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
                "link": "/stations/station1",
                "subtype": "assembly_station",
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
                "link": "/stations/station2",
                "subtype": "assembly_station",
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
                "link": "/lines/line2",
                "subtype": "semi_automated_line",
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
                "link": "/stations/station3",
                "subtype": "control_station",
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
                "link": "/workshops/workshop2",
                "subtype": "machining_shop",
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
                "link": "/sections/section1",
                "subtype": "turning_section",
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
                "link": "/machines/machine1",
                "subtype": "cnc_lathe",
                "workCount": 1
            }
        },
        {
            "id": "warehouse1",
            "parentId": "factory1",
            "type": "node",
            "name": "Склад готовой продукции",
            "metadata": {
                "color": "#607d8b",
                "tooltip": "Основной склад готовых изделий",
                "link": "/warehouses/warehouse1",
                "subtype": "finished_goods_warehouse",
                "workCount": 8
            }
        },
        {
            "id": "factory2",
            "parentId": null,
            "type": "node",
            "name": "Завод №2 'Электрон'",
            "metadata": {
                "color": "#3f51b5",
                "tooltip": "Завод электронных компонентов",
                "link": "/factories/factory2",
                "subtype": "electronics_facility",
                "workCount": 120
            }
        },
        {
            "id": "workshop3",
            "parentId": "factory2",
            "type": "assembly",
            "name": "Цех печатных плат",
            "metadata": {
                "color": "#00bcd4",
                "tooltip": "Производство печатных плат",
                "link": "/workshops/workshop3",
                "subtype": "pcb_workshop",
                "workCount": 35
            }
        },
        {
            "id": "cleanroom1",
            "parentId": "workshop3",
            "type": "component",
            "name": "Чистая комната класса 7",
            "metadata": {
                "color": "#e91e63",
                "tooltip": "Помещение для высокоточных операций",
                "link": "/cleanrooms/cleanroom1",
                "subtype": "cleanroom",
                "workCount": 8
            }
        },
        {
            "id": "equipment1",
            "parentId": "cleanroom1",
            "type": "component",
            "name": "Установка пайки SMD",
            "metadata": {
                "color": "#ff5722",
                "tooltip": "Автоматическая установка поверхностного монтажа",
                "link": "/equipment/equipment1",
                "subtype": "smd_equipment",
                "workCount": 2
            }
        },
        {
            "id": "workshop4",
            "parentId": "factory2",
            "type": "assembly",
            "name": "Цех тестирования",
            "metadata": {
                "color": "#8bc34a",
                "tooltip": "Отдел контроля качества",
                "link": "/workshops/workshop4",
                "subtype": "testing_department",
                "workCount": 25
            }
        },
        {
            "id": "testlab1",
            "parentId": "workshop4",
            "type": "component",
            "name": "Лаборатория №1",
            "metadata": {
                "color": "#cddc39",
                "tooltip": "Лаборатория функционального тестирования",
                "link": "/labs/testlab1",
                "subtype": "functional_lab",
                "workCount": 12
            }
        },
        {
            "id": "teststand1",
            "parentId": "testlab1",
            "type": "component",
            "name": "Стенд автотестов",
            "metadata": {
                "color": "#ffc107",
                "tooltip": "Автоматизированный тестовый стенд",
                "link": "/teststands/teststand1",
                "subtype": "automated_test_stand",
                "workCount": 3
            }
        }
    ]
};

// Утилиты
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

// Имитация загрузки данных
const fetchBatchData = async (startDate, days) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const startDateObj = parseDateString(startDate);
    const batchData = [];

    for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDateObj);
        currentDate.setUTCDate(startDateObj.getUTCDate() + i);
        batchData.push({
            date: formatDate(currentDate),
            timestamp: Date.now()
        });
    }
    return { data: batchData };
};

export const Table = ({ maxWidth = '100%', maxHeight = '600px', debug = true }) => {
    // Основные состояния
    const [dates, setDates] = useState([]);
    const [rawData, setRawData] = useState({});
    const [loadingDates, setLoadingDates] = useState(new Set());
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
    const isScrollCompensating = useRef(false);

    // Константы
    const bufferSize = 20;
    const scrollBatchSize = 7;
    const dynamicRowHeight = 40;

    const today = useMemo(() => {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        return date;
    }, []);

    // Структура дерева - создается один раз
    const treeStructure = useMemo(() => {
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
    }, []);

    // Инициализация видимости узлов
    useEffect(() => {
        const visibility = {};
        headers.headers.forEach(header => {
            visibility[header.id] = true;
        });
        setNodeVisibility(visibility);
    }, []);

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
        // Проверяем видимость узла и всех его родителей
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
                // Если скрываем узел, скрываем всех потомков
                const descendants = getAllDescendants(nodeId);
                descendants.forEach(id => {
                    newVisibility[id] = false;
                });
            } else {
                // Если показываем узел, показываем всех прямых потомков
                // (но не потомков потомков, если они были скрыты отдельно)
                const node = treeStructure.nodesMap.get(nodeId);
                if (node && node.children) {
                    node.children.forEach(child => {
                        newVisibility[child.id] = true;
                        // Рекурсивно показываем всех потомков, которые не были скрыты вручную
                        const showDescendantsRecursively = (n) => {
                            if (n.children) {
                                n.children.forEach(childNode => {
                                    // Показываем потомка только если он не был скрыт вручную
                                    // (проверяем, что все его родители видимы)
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
            // Показываем узел если он видим или у него есть видимые потомки
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

    // Viewport логика
    const visibleRange = useMemo(() => {
        if (!containerHeight || dates.length === 0) {
            return { start: 0, end: Math.max(dates.length, scrollBatchSize * 2) };
        }

        const visibleStart = Math.floor(scrollTop / dynamicRowHeight);
        const visibleEnd = Math.ceil((scrollTop + containerHeight) / dynamicRowHeight);
        const start = Math.max(0, visibleStart - bufferSize);
        const end = Math.min(dates.length, visibleEnd + bufferSize);

        return { start, end };
    }, [scrollTop, containerHeight, dates.length, dynamicRowHeight, bufferSize, scrollBatchSize]);

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

    // Загрузка данных
    const loadDatesData = useCallback(async (datesToLoad) => {
        if (datesToLoad.length === 0) return;

        setLoadingDates(prev => new Set([...prev, ...datesToLoad]));

        try {
            const sortedDates = [...datesToLoad].sort((a, b) => parseDateString(a) - parseDateString(b));
            const batches = [];
            let currentBatch = [sortedDates[0]];

            for (let i = 1; i < sortedDates.length; i++) {
                const prevDate = parseDateString(sortedDates[i - 1]);
                const currDate = parseDateString(sortedDates[i]);
                const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

                if (daysDiff === 1 && currentBatch.length < scrollBatchSize) {
                    currentBatch.push(sortedDates[i]);
                } else {
                    batches.push(currentBatch);
                    currentBatch = [sortedDates[i]];
                }
            }
            batches.push(currentBatch);

            const batchPromises = batches.map(async (batch) => {
                const batchKey = `${batch[0]}_${batch.length}`;

                if (!fetchingPromises.current[batchKey]) {
                    fetchingPromises.current[batchKey] = fetchBatchData(batch[0], batch.length);
                }

                try {
                    const result = await fetchingPromises.current[batchKey];
                    return result.data;
                } finally {
                    delete fetchingPromises.current[batchKey];
                }
            });

            const results = await Promise.allSettled(batchPromises);
            const allNewData = {};

            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    result.value.forEach(dayData => {
                        allNewData[dayData.date] = dayData;
                    });
                }
            });

            setRawData(prev => ({ ...prev, ...allNewData }));

        } finally {
            setLoadingDates(prev => {
                const updated = new Set(prev);
                datesToLoad.forEach(date => updated.delete(date));
                return updated;
            });
        }
    }, [scrollBatchSize]);

    const extendDates = useCallback(async (direction) => {
        if (direction === 'forward') {
            const lastDate = dates[dates.length - 1];
            if (!lastDate) return;

            const lastDateObj = parseDateString(lastDate);
            const newDates = [];
            for (let i = 1; i <= scrollBatchSize; i++) {
                const date = new Date(lastDateObj);
                date.setUTCDate(lastDateObj.getUTCDate() + i);
                newDates.push(formatDate(date));
            }
            setDates(prev => [...prev, ...newDates]);

        } else if (direction === 'backward') {
            const firstDate = dates[0];
            if (!firstDate) return;

            const firstDateObj = parseDateString(firstDate);
            const newDates = [];
            for (let i = scrollBatchSize; i >= 1; i--) {
                const date = new Date(firstDateObj);
                date.setUTCDate(firstDateObj.getUTCDate() - i);
                newDates.push(formatDate(date));
            }

            if (containerRef.current) {
                isScrollCompensating.current = true;
                const currentScrollTop = containerRef.current.scrollTop;
                const currentFirstVisibleIndex = Math.floor(currentScrollTop / dynamicRowHeight);
                const scrollOffset = currentScrollTop % dynamicRowHeight;

                setDates(prevDates => {
                    const updatedDates = [...newDates, ...prevDates];
                    requestAnimationFrame(() => {
                        if (containerRef.current && isScrollCompensating.current) {
                            const compensatedScrollTop = (currentFirstVisibleIndex + newDates.length) * dynamicRowHeight + scrollOffset;
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
    }, [dates, scrollBatchSize, dynamicRowHeight]);

    const handleScroll = useCallback(async () => {
        if (!containerRef.current || isScrollCompensating.current) return;

        const container = containerRef.current;
        const newScrollTop = container.scrollTop;
        const newContainerHeight = container.clientHeight;
        const scrollHeight = container.scrollHeight;

        setScrollTop(newScrollTop);
        setContainerHeight(newContainerHeight);

        const baseThreshold = dynamicRowHeight * bufferSize;
        const topThreshold = baseThreshold;
        const bottomThreshold = scrollHeight - newContainerHeight - baseThreshold;

        const promises = [];
        if (newScrollTop <= topThreshold && dates.length > 0) {
            promises.push(extendDates('backward'));
        }
        if (newScrollTop >= bottomThreshold && dates.length > 0) {
            promises.push(extendDates('forward'));
        }

        if (promises.length > 0) {
            await Promise.allSettled(promises);
        }
    }, [dates, extendDates, dynamicRowHeight, bufferSize]);

    // Загрузка данных для viewport
    useEffect(() => {
        const { start, end } = visibleRange;
        const viewportDates = dates.slice(start, end);
        const datesToLoad = viewportDates.filter(date => !rawData[date] && !loadingDates.has(date));

        if (datesToLoad.length > 0) {
            loadDatesData(datesToLoad);
        }
    }, [visibleRange, dates, rawData, loadingDates, loadDatesData]);

    // Инициализация
    useEffect(() => {
        if (!isInitialized && dates.length === 0) {
            const initialDates = generateInitialDates();
            setDates(initialDates);

            setTimeout(() => {
                if (containerRef.current) {
                    const todayFormatted = formatDate(today);
                    const todayIndex = initialDates.findIndex(date => date === todayFormatted);

                    const containerHeight = containerRef.current.clientHeight;
                    setContainerHeight(containerHeight);
                    setScrollTop(0);
                    setIsInitialized(true);

                    if (todayIndex !== -1) {
                        setTimeout(() => {
                            if (containerRef.current) {
                                const targetScroll = todayIndex * dynamicRowHeight - (containerHeight / 2) + (dynamicRowHeight / 2);
                                containerRef.current.scrollTop = Math.max(0, targetScroll);
                                setScrollTop(containerRef.current.scrollTop);
                            }
                        }, 100);
                    }
                }
            }, 0);
        }
    }, [isInitialized, dates.length, generateInitialDates, today, dynamicRowHeight]);

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
                                backgroundColor: '#dee3f5'
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
                                    color: '#fff',
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '12px',
                                    fontWeight: 'normal',
                                    textAlign: 'center',
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
                            <span style={{
                                fontSize: '12px',
                                color: '#666',
                                marginLeft: '8px'
                            }}>
                                ({node.metadata.workCount})
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '4px'
                        }}>
                            {hasChildren && (
                                <>
                                    <button
                                        onClick={() => toggleAllChildrenVisibility(node.id, true)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#666',
                                            fontSize: '12px',
                                            padding: '2px 4px'
                                        }}
                                    >
                                        показать всё
                                    </button>
                                    <span style={{ color: '#ddd', fontSize: '12px' }}>/</span>
                                    <button
                                        onClick={() => toggleAllChildrenVisibility(node.id, false)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#666',
                                            fontSize: '12px',
                                            padding: '2px 4px'
                                        }}
                                    >
                                        скрыть всё
                                    </button>
                                </>
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
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '120px auto 150px',
                        padding: '8px 16px',
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #e0e0e0',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#666'
                    }}>
                        <div>Отобразить</div>
                        <div>Название узла</div>
                        <div style={{ textAlign: 'center' }}>Действия</div>
                    </div>

                    {filteredTree.map(node => renderNode(node))}
                </div>

                <div style={{
                    padding: '12px 16px',
                    borderTop: '1px solid #e0e0e0',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={() => setShowFilters(false)}
                        style={{
                            padding: '8px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Применить
                    </button>
                </div>
            </div>
        );
    };

    const { start: startIndex, end: endIndex } = visibleRange;
    const visibleDates = dates.slice(startIndex, endIndex);
    const paddingTop = startIndex * dynamicRowHeight;
    const paddingBottom = Math.max(0, (dates.length - endIndex) * dynamicRowHeight);

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
                        backgroundColor: '#dee3f5',
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
                        const data = rawData[dateString];
                        const isLoading = loadingDates.has(dateString) || !data;
                        const rowDate = parseDateString(dateString);
                        const isPastDate = rowDate.getTime() < today.getTime();

                        return (
                            <tr
                                key={`${dateString}-${startIndex + index}`}
                                style={{
                                    height: `${dynamicRowHeight}px`,
                                    backgroundColor: isPastDate ? '#f5f5f5' : 'white',
                                }}
                            >
                                <td style={{
                                    padding: '8px',
                                    borderRight: '1px solid #ddd',
                                    fontSize: '14px',
                                    fontWeight: 'normal',
                                    whiteSpace: 'nowrap',
                                    color: isPastDate ? '#666' : 'inherit'
                                }}>
                                    {dateString}
                                </td>

                                {visibleLeafNodes.map((leafNode) => (
                                    <td
                                        key={`${dateString}-${leafNode.id}`}
                                        style={{
                                            padding: '4px',
                                            textAlign: 'center',
                                            backgroundColor: isLoading ? 'transparent' : '#cdef8d',
                                            fontSize: '14px',
                                            minWidth: '50px',
                                            verticalAlign: 'middle',
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
                                            'М'
                                        )}
                                    </td>
                                ))}
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

            {debug && (
                <div style={{
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
                    <span><strong>В данных:</strong> {Object.keys(rawData).length}</span>
                    <span><strong>Загружается:</strong> {loadingDates.size}</span>
                    <span><strong>Глубина дерева:</strong> {treeStructure.maxDepth}</span>
                    <span><strong>Всего листовых узлов:</strong> {treeStructure.leafNodes.length}</span>
                    <span><strong>Видимых листовых узлов:</strong> {visibleLeafNodes.length}</span>
                    <span><strong>Развернутых узлов:</strong> {expandedNodes.size}</span>
                    <span><strong>Поисковый запрос:</strong> "{searchTerm}"</span>
                </div>
            )}
        </>
    );
};
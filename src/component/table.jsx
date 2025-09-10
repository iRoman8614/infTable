// import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
//
// const headers = {
//     "headers": [
//         {
//             "id": "factory1",
//             "parentId": null,
//             "type": "node",
//             "name": "Завод №1 'Металлург'",
//             "metadata": {
//                 "color": "#2196f3",
//                 "tooltip": "Основной производственный комплекс",
//                 "link": "/factories/factory1",
//                 "subtype": "production_facility",
//                 "workCount": 150
//             }
//         },
//         {
//             "id": "workshop1",
//             "parentId": "factory1",
//             "type": "assembly",
//             "name": "Цех сборки №1",
//             "metadata": {
//                 "color": "#4caf50",
//                 "tooltip": "Основной сборочный цех",
//                 "link": "/workshops/workshop1",
//                 "subtype": "assembly_line",
//                 "workCount": 45
//             }
//         },
//         {
//             "id": "line1",
//             "parentId": "workshop1",
//             "type": "component",
//             "name": "Линия А",
//             "metadata": {
//                 "color": "#ff9800",
//                 "tooltip": "Автоматизированная линия сборки",
//                 "link": "/lines/line1",
//                 "subtype": "automated_line",
//                 "workCount": 15
//             }
//         },
//         {
//             "id": "station1",
//             "parentId": "line1",
//             "type": "component",
//             "name": "Станция 1",
//             "metadata": {
//                 "color": "#f44336",
//                 "tooltip": "Начальная станция сборки",
//                 "link": "/stations/station1",
//                 "subtype": "assembly_station",
//                 "workCount": 3
//             }
//         },
//         {
//             "id": "station2",
//             "parentId": "line1",
//             "type": "component",
//             "name": "Станция 2",
//             "metadata": {
//                 "color": "#f44336",
//                 "tooltip": "Промежуточная станция",
//                 "link": "/stations/station2",
//                 "subtype": "assembly_station",
//                 "workCount": 4
//             }
//         },
//         {
//             "id": "line2",
//             "parentId": "workshop1",
//             "type": "component",
//             "name": "Линия Б",
//             "metadata": {
//                 "color": "#ff9800",
//                 "tooltip": "Полуавтоматическая линия",
//                 "link": "/lines/line2",
//                 "subtype": "semi_automated_line",
//                 "workCount": 12
//             }
//         },
//         {
//             "id": "station3",
//             "parentId": "line2",
//             "type": "component",
//             "name": "Станция 3",
//             "metadata": {
//                 "color": "#f44336",
//                 "tooltip": "Контрольная станция",
//                 "link": "/stations/station3",
//                 "subtype": "control_station",
//                 "workCount": 2
//             }
//         },
//         {
//             "id": "workshop2",
//             "parentId": "factory1",
//             "type": "assembly",
//             "name": "Цех механообработки",
//             "metadata": {
//                 "color": "#4caf50",
//                 "tooltip": "Цех механической обработки деталей",
//                 "link": "/workshops/workshop2",
//                 "subtype": "machining_shop",
//                 "workCount": 65
//             }
//         },
//         {
//             "id": "section1",
//             "parentId": "workshop2",
//             "type": "component",
//             "name": "Участок токарных работ",
//             "metadata": {
//                 "color": "#9c27b0",
//                 "tooltip": "Участок токарной обработки",
//                 "link": "/sections/section1",
//                 "subtype": "turning_section",
//                 "workCount": 25
//             }
//         },
//         {
//             "id": "machine1",
//             "parentId": "section1",
//             "type": "component",
//             "name": "Станок ЧПУ-1",
//             "metadata": {
//                 "color": "#795548",
//                 "tooltip": "Токарный станок с ЧПУ",
//                 "link": "/machines/machine1",
//                 "subtype": "cnc_lathe",
//                 "workCount": 1
//             }
//         },
//         {
//             "id": "warehouse1",
//             "parentId": "factory1",
//             "type": "node",
//             "name": "Склад готовой продукции",
//             "metadata": {
//                 "color": "#607d8b",
//                 "tooltip": "Основной склад готовых изделий",
//                 "link": "/warehouses/warehouse1",
//                 "subtype": "finished_goods_warehouse",
//                 "workCount": 8
//             }
//         },
//         {
//             "id": "factory2",
//             "parentId": null,
//             "type": "node",
//             "name": "Завод №2 'Электрон'",
//             "metadata": {
//                 "color": "#3f51b5",
//                 "tooltip": "Завод электронных компонентов",
//                 "link": "/factories/factory2",
//                 "subtype": "electronics_facility",
//                 "workCount": 120
//             }
//         },
//         {
//             "id": "workshop3",
//             "parentId": "factory2",
//             "type": "assembly",
//             "name": "Цех печатных плат",
//             "metadata": {
//                 "color": "#00bcd4",
//                 "tooltip": "Производство печатных плат",
//                 "link": "/workshops/workshop3",
//                 "subtype": "pcb_workshop",
//                 "workCount": 35
//             }
//         },
//         {
//             "id": "cleanroom1",
//             "parentId": "workshop3",
//             "type": "component",
//             "name": "Чистая комната класса 7",
//             "metadata": {
//                 "color": "#e91e63",
//                 "tooltip": "Помещение для высокоточных операций",
//                 "link": "/cleanrooms/cleanroom1",
//                 "subtype": "cleanroom",
//                 "workCount": 8
//             }
//         },
//         {
//             "id": "equipment1",
//             "parentId": "cleanroom1",
//             "type": "component",
//             "name": "Установка пайки SMD",
//             "metadata": {
//                 "color": "#ff5722",
//                 "tooltip": "Автоматическая установка поверхностного монтажа",
//                 "link": "/equipment/equipment1",
//                 "subtype": "smd_equipment",
//                 "workCount": 2
//             }
//         },
//         {
//             "id": "workshop4",
//             "parentId": "factory2",
//             "type": "assembly",
//             "name": "Цех тестирования",
//             "metadata": {
//                 "color": "#8bc34a",
//                 "tooltip": "Отдел контроля качества",
//                 "link": "/workshops/workshop4",
//                 "subtype": "testing_department",
//                 "workCount": 25
//             }
//         },
//         {
//             "id": "testlab1",
//             "parentId": "workshop4",
//             "type": "component",
//             "name": "Лаборатория №1",
//             "metadata": {
//                 "color": "#cddc39",
//                 "tooltip": "Лаборатория функционального тестирования",
//                 "link": "/labs/testlab1",
//                 "subtype": "functional_lab",
//                 "workCount": 12
//             }
//         },
//         {
//             "id": "teststand1",
//             "parentId": "testlab1",
//             "type": "component",
//             "name": "Стенд автотестов",
//             "metadata": {
//                 "color": "#ffc107",
//                 "tooltip": "Автоматизированный тестовый стенд",
//                 "link": "/teststands/teststand1",
//                 "subtype": "automated_test_stand",
//                 "workCount": 3
//             }
//         }
//     ],
//     "maintenances": [
//         {
//             "id": "maintenance_1",
//             "name": "ТО-1 (Еженедельное)",
//             "color": "#4caf50",
//             "description": "Еженедельное техническое обслуживание оборудования"
//         },
//         {
//             "id": "maintenance_2",
//             "name": "ТО-2 (Ежемесячное)",
//             "color": "#ff9800",
//             "description": "Ежемесячное углубленное техническое обслуживание"
//         },
//         {
//             "id": "maintenance_3",
//             "name": "ТО-3 (Квартальное)",
//             "color": "#f44336",
//             "description": "Квартальное комплексное техническое обслуживание"
//         },
//         {
//             "id": "maintenance_4",
//             "name": "ТР (Текущий ремонт)",
//             "color": "#9c27b0",
//             "description": "Текущий ремонт оборудования"
//         },
//         {
//             "id": "maintenance_5",
//             "name": "КР (Капитальный ремонт)",
//             "color": "#607d8b",
//             "description": "Капитальный ремонт с заменой основных узлов"
//         },
//         {
//             "id": "maintenance_6",
//             "name": "Диагностика",
//             "color": "#00bcd4",
//             "description": "Комплексная диагностика состояния оборудования"
//         },
//         {
//             "id": "maintenance_7",
//             "name": "Калибровка",
//             "color": "#3f51b5",
//             "description": "Калибровка измерительного оборудования"
//         },
//         {
//             "id": "maintenance_8",
//             "name": "Профилактика",
//             "color": "#8bc34a",
//             "description": "Профилактические работы по предотвращению поломок"
//         }
//     ]
// }
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
//             stages: stages,
//             timestamp: Date.now() // Добавляем временную метку для отслеживания актуальности
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
//             timestamp: row.timestamp,
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
//  * Виртуализированная таблица с актуальными данными и lazy loading
//  */
// export const Table = ({ maxWidth = '100%', maxHeight = '600px', colorTheme, scrollBatchSize = 7, debug = true, refreshInterval = 30000 }) => {
//     // Основные состояния
//     const [dates, setDates] = useState([]);
//     const [rawData, setRawData] = useState({}); // Сырые данные без кэширования
//     const [processedData, setProcessedData] = useState({}); // Обработанные данные для viewport
//     const [loadingDates, setLoadingDates] = useState(new Set());
//     const [isInitialized, setIsInitialized] = useState(false);
//
//     // Состояния viewport
//     const [viewportData, setViewportData] = useState(new Set()); // Даты в зоне видимости + буфер
//     const [needsRefresh, setNeedsRefresh] = useState(new Set()); // Даты требующие обновления
//
//     // Состояния для фильтров и настроек
//     const [showWorkHours, setShowWorkHours] = useState(false);
//     const [showFilters, setShowFilters] = useState(false);
//     const [groupVisibility, setGroupVisibility] = useState({});
//     const [elementVisibility, setElementVisibility] = useState({});
//     const [componentVisibility, setComponentVisibility] = useState({});
//
//     // Состояния для аккордеона
//     const [expandedGroups, setExpandedGroups] = useState(new Set());
//     const [expandedElements, setExpandedElements] = useState(new Set());
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
//     const refreshTimer = useRef(null);
//
//     // Константы
//     const bufferSize = 20;
//
//     const dynamicRowHeight = useMemo(() => {
//         return showWorkHours ? 100 : 40;
//     }, [showWorkHours]);
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
//     // Вычисляем viewport с буферной зоной
//     const visibleRange = useMemo(() => {
//         if (!containerHeight || dates.length === 0) {
//             return { start: 0, end: Math.max(dates.length, scrollBatchSize * 2) };
//         }
//
//         const visibleStart = Math.floor(scrollTop / dynamicRowHeight);
//         const visibleEnd = Math.ceil((scrollTop + containerHeight) / dynamicRowHeight);
//
//         const start = Math.max(0, visibleStart - bufferSize);
//         const end = Math.min(dates.length, visibleEnd + bufferSize);
//
//         return { start, end };
//     }, [scrollTop, containerHeight, dates.length, dynamicRowHeight, bufferSize, scrollBatchSize]);
//
//     // Обновляем viewport данные когда изменяется видимый диапазон
//     useEffect(() => {
//         if (dates.length === 0) return;
//
//         const { start, end } = visibleRange;
//         const newViewportDates = new Set();
//
//         for (let i = start; i < end; i++) {
//             if (dates[i]) {
//                 newViewportDates.add(dates[i]);
//             }
//         }
//
//         setViewportData(prev => {
//             const changed = prev.size !== newViewportDates.size ||
//                 [...newViewportDates].some(date => !prev.has(date));
//             return changed ? newViewportDates : prev;
//         });
//     }, [visibleRange, dates]);
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
//     // Обновляем структуру заголовков на основе всех доступных данных
//     const updateHeaderStructure = useCallback((newDataEntries = []) => {
//         const newStructure = {};
//         const newGroupOrder = [];
//         const allDataEntries = [...Object.values(rawData), ...newDataEntries];
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
//         setHeaderStructure(newStructure);
//         setGroupOrder(newGroupOrder);
//
//         // Инициализация видимости элементов
//         setGroupVisibility(prev => {
//             const updated = { ...prev };
//             newGroupOrder.forEach(groupName => {
//                 if (updated[groupName] === undefined) {
//                     updated[groupName] = true;
//                 }
//             });
//             return updated;
//         });
//
//         setElementVisibility(prev => {
//             const updated = { ...prev };
//             Object.entries(newStructure).forEach(([groupName, elements]) => {
//                 elements.forEach(element => {
//                     if (updated[element] === undefined) {
//                         updated[element] = true;
//                     }
//                 });
//             });
//             return updated;
//         });
//
//         setComponentVisibility(prev => {
//             const updated = { ...prev };
//             Object.entries(newStructure).forEach(([groupName, elements]) => {
//                 if (groupName !== "Работающие агрегаты") {
//                     elements.forEach(element => {
//                         if (!updated[element]) {
//                             const componentObj = {};
//                             Array.from(allComponentKeys).forEach(componentKey => {
//                                 componentObj[componentKey] = true;
//                             });
//                             updated[element] = componentObj;
//                         } else {
//                             Array.from(allComponentKeys).forEach(componentKey => {
//                                 if (updated[element][componentKey] === undefined) {
//                                     updated[element][componentKey] = true;
//                                 }
//                             });
//                         }
//                     });
//                 }
//             });
//             return updated;
//         });
//     }, [rawData]);
//
//     const filteredHeaderStructure = useMemo(() => {
//         const filtered = {};
//         Object.entries(headerStructure).forEach(([groupName, elements]) => {
//             if (groupVisibility[groupName]) {
//                 filtered[groupName] = elements.filter(element => elementVisibility[element]);
//             }
//         });
//         return filtered;
//     }, [headerStructure, groupVisibility, elementVisibility]);
//
//     const filteredGroupOrder = useMemo(() => {
//         return groupOrder.filter(groupName =>
//             groupVisibility[groupName] &&
//             filteredHeaderStructure[groupName] &&
//             filteredHeaderStructure[groupName].length > 0
//         );
//     }, [groupOrder, groupVisibility, filteredHeaderStructure]);
//
//     // Загрузка данных для конкретных дат
//     const loadDatesData = useCallback(async (datesToLoad) => {
//         if (datesToLoad.length === 0) return;
//
//         const newLoadingDates = new Set(datesToLoad);
//         setLoadingDates(prev => new Set([...prev, ...newLoadingDates]));
//
//         try {
//             // Группируем даты в батчи для оптимизации запросов
//             const sortedDates = [...datesToLoad].sort((a, b) => parseDateString(a) - parseDateString(b));
//             const batches = [];
//             let currentBatch = [sortedDates[0]];
//
//             for (let i = 1; i < sortedDates.length; i++) {
//                 const prevDate = parseDateString(sortedDates[i - 1]);
//                 const currDate = parseDateString(sortedDates[i]);
//                 const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
//
//                 if (daysDiff === 1 && currentBatch.length < scrollBatchSize) {
//                     currentBatch.push(sortedDates[i]);
//                 } else {
//                     batches.push(currentBatch);
//                     currentBatch = [sortedDates[i]];
//                 }
//             }
//             batches.push(currentBatch);
//
//             // Загружаем батчи параллельно
//             const batchPromises = batches.map(async (batch) => {
//                 const batchKey = `${batch[0]}_${batch.length}`;
//
//                 if (!fetchingPromises.current[batchKey]) {
//                     fetchingPromises.current[batchKey] = fetchBatchData(batch[0], batch.length);
//                 }
//
//                 try {
//                     const result = await fetchingPromises.current[batchKey];
//                     return result.data;
//                 } finally {
//                     delete fetchingPromises.current[batchKey];
//                 }
//             });
//
//             const results = await Promise.allSettled(batchPromises);
//             const allNewData = {};
//
//             results.forEach(result => {
//                 if (result.status === 'fulfilled') {
//                     result.value.forEach(dayData => {
//                         allNewData[dayData.date] = dayData;
//                     });
//                 }
//             });
//
//             // Обновляем сырые данные только для загруженных дат
//             setRawData(prev => ({
//                 ...prev,
//                 ...allNewData
//             }));
//
//             // Обновляем структуру заголовков
//             updateHeaderStructure(Object.values(allNewData));
//
//         } finally {
//             setLoadingDates(prev => {
//                 const updated = new Set(prev);
//                 newLoadingDates.forEach(date => updated.delete(date));
//                 return updated;
//             });
//         }
//     }, [scrollBatchSize, updateHeaderStructure]);
//
//     // Обрабатываем данные для viewport
//     useEffect(() => {
//         if (viewportData.size === 0) return;
//
//         const viewportDates = Array.from(viewportData).sort((a, b) => parseDateString(a) - parseDateString(b));
//         const availableData = viewportDates
//             .map(date => rawData[date])
//             .filter(Boolean);
//
//         if (availableData.length > 0) {
//             const processed = processDataForTable(availableData);
//             const newProcessedData = {};
//
//             processed.processedData.forEach(row => {
//                 newProcessedData[row.date] = row;
//             });
//
//             setProcessedData(newProcessedData);
//         }
//     }, [viewportData, rawData]);
//
//     // Определяем какие данные нужно загрузить
//     useEffect(() => {
//         if (viewportData.size === 0) return;
//
//         const datesToLoad = [];
//         const datesToRefresh = [];
//         const currentTime = Date.now();
//
//         viewportData.forEach(date => {
//             const data = rawData[date];
//             if (!data) {
//                 datesToLoad.push(date);
//             } else if (refreshInterval > 0 && (currentTime - data.timestamp) > refreshInterval) {
//                 datesToRefresh.push(date);
//             }
//         });
//
//         // Загружаем новые данные
//         if (datesToLoad.length > 0) {
//             loadDatesData(datesToLoad);
//         }
//
//         // Помечаем устаревшие данные для обновления
//         if (datesToRefresh.length > 0) {
//             setNeedsRefresh(prev => new Set([...prev, ...datesToRefresh]));
//         }
//     }, [viewportData, rawData, refreshInterval, loadDatesData]);
//
//     // Периодическое обновление данных в viewport
//     useEffect(() => {
//         if (refreshInterval <= 0) return;
//
//         const scheduleRefresh = () => {
//             if (refreshTimer.current) {
//                 clearTimeout(refreshTimer.current);
//             }
//
//             refreshTimer.current = setTimeout(async () => {
//                 if (needsRefresh.size > 0) {
//                     const datesToRefresh = Array.from(needsRefresh);
//                     setNeedsRefresh(new Set());
//                     await loadDatesData(datesToRefresh);
//                 }
//                 scheduleRefresh();
//             }, Math.min(refreshInterval / 4, 5000)); // Проверяем чаще чем interval
//         };
//
//         scheduleRefresh();
//
//         return () => {
//             if (refreshTimer.current) {
//                 clearTimeout(refreshTimer.current);
//             }
//         };
//     }, [needsRefresh, refreshInterval, loadDatesData]);
//
//     const getCellValue = useCallback((processedRow, groupName, key) => {
//         if (groupName === "Работающие агрегаты") {
//             const originalData = rawData[processedRow.date];
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
//                         <div style={{
//                             fontSize: '12px',
//                             lineHeight: '1.2',
//                             display: 'flex',
//                             flexDirection: 'column',
//                             alignItems: 'center',
//                             gap: '2px'
//                         }}>
//                             <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
//                                 {element.status}
//                             </div>
//                             <div style={{ fontSize: '10px', color: '#666' }}>
//                                 {visibleComponents.map((component, index) => (
//                                     <div key={index} style={{ margin: '0' }}>
//                                         {component}
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     );
//                 }
//             }
//             return element.status;
//         }
//
//         return '—';
//     }, [rawData, showWorkHours, componentVisibility]);
//
//     const getCellStatus = useCallback((processedRow, groupName, key) => {
//         if (groupName === "Работающие агрегаты") {
//             const originalData = rawData[processedRow.date];
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
//     }, [rawData]);
//
//     const extendDates = useCallback(async (direction, isPreemptive = false) => {
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
//                 const currentFirstVisibleIndex = Math.floor(currentScrollTop / dynamicRowHeight);
//                 const scrollOffset = currentScrollTop % dynamicRowHeight;
//
//                 setDates(prevDates => {
//                     const updatedDates = [...newDates, ...prevDates];
//
//                     requestAnimationFrame(() => {
//                         if (containerRef.current && isScrollCompensating.current) {
//                             const compensatedScrollTop = (currentFirstVisibleIndex + newDates.length) * dynamicRowHeight + scrollOffset;
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
//         }
//     }, [dates, scrollBatchSize, dynamicRowHeight]);
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
//         const baseThreshold = dynamicRowHeight * bufferSize;
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
//     }, [dates, extendDates, dynamicRowHeight, bufferSize]);
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
//     // Обработчики для аккордеона
//     const toggleGroupExpansion = useCallback((groupName) => {
//         setExpandedGroups(prev => {
//             const newSet = new Set(prev);
//             if (newSet.has(groupName)) {
//                 newSet.delete(groupName);
//             } else {
//                 newSet.add(groupName);
//             }
//             return newSet;
//         });
//     }, []);
//
//     const toggleElementExpansion = useCallback((elementName) => {
//         setExpandedElements(prev => {
//             const newSet = new Set(prev);
//             if (newSet.has(elementName)) {
//                 newSet.delete(elementName);
//             } else {
//                 newSet.add(elementName);
//             }
//             return newSet;
//         });
//     }, []);
//
//     const toggleAllElementsInGroup = useCallback((groupName, visible) => {
//         if (headerStructure[groupName]) {
//             const updates = {};
//             headerStructure[groupName].forEach(element => {
//                 updates[element] = visible;
//             });
//             setElementVisibility(prev => ({ ...prev, ...updates }));
//         }
//     }, [headerStructure]);
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
//                     setContainerHeight(containerHeight);
//                     setScrollTop(0);
//                     setIsInitialized(true);
//
//                     setTimeout(() => {
//                         if (containerRef.current) {
//                             const targetScroll = todayIndex * dynamicRowHeight - (containerHeight / 2) + (dynamicRowHeight / 2);
//                             containerRef.current.scrollTop = Math.max(0, targetScroll);
//                             setScrollTop(containerRef.current.scrollTop);
//                         }
//                     }, 100);
//                 }
//             };
//
//             initializeTable();
//         }
//     }, [isInitialized, dates.length, generateInitialDates, today, dynamicRowHeight]);
//
//     // Очистка устаревших данных вне viewport
//     useEffect(() => {
//         const cleanup = () => {
//             if (viewportData.size === 0) return;
//
//             const keepDates = new Set(viewportData);
//             const currentRawDataKeys = Object.keys(rawData);
//             const currentProcessedDataKeys = Object.keys(processedData);
//
//             // Очищаем сырые данные
//             const shouldCleanRaw = currentRawDataKeys.some(date => !keepDates.has(date));
//             if (shouldCleanRaw) {
//                 setRawData(prev => {
//                     const filtered = {};
//                     Object.keys(prev).forEach(date => {
//                         if (keepDates.has(date)) {
//                             filtered[date] = prev[date];
//                         }
//                     });
//                     return filtered;
//                 });
//             }
//
//             // Очищаем обработанные данные
//             const shouldCleanProcessed = currentProcessedDataKeys.some(date => !keepDates.has(date));
//             if (shouldCleanProcessed) {
//                 setProcessedData(prev => {
//                     const filtered = {};
//                     Object.keys(prev).forEach(date => {
//                         if (keepDates.has(date)) {
//                             filtered[date] = prev[date];
//                         }
//                     });
//                     return filtered;
//                 });
//             }
//         };
//
//         const interval = setInterval(cleanup, 3000);
//         return () => clearInterval(interval);
//     }, [viewportData, rawData, processedData]);
//
//     // Очистка при размонтировании
//     useEffect(() => {
//         return () => {
//             if (refreshTimer.current) {
//                 clearTimeout(refreshTimer.current);
//             }
//             Object.keys(fetchingPromises.current).forEach(key => {
//                 delete fetchingPromises.current[key];
//             });
//         };
//     }, []);
//
//     const { start: startIndex, end: endIndex } = visibleRange;
//     const visibleDates = dates.slice(startIndex, endIndex);
//     const paddingTop = startIndex * dynamicRowHeight;
//     const paddingBottom = Math.max(0, (dates.length - endIndex) * dynamicRowHeight);
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
//                         backgroundColor: 'rgba(108,155,255,0.45)',
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
//                     borderRadius: '4px',
//                     marginBottom: '16px',
//                     backgroundColor: 'white',
//                     fontFamily: 'Arial, sans-serif'
//                 }}>
//                     <div style={{
//                         padding: '12px 16px',
//                         borderBottom: '1px solid #e0e0e0',
//                         backgroundColor: '#f8f9fa',
//                         display: 'flex',
//                         justifyContent: 'space-between',
//                         alignItems: 'center'
//                     }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                             <span style={{ fontWeight: '500', color: '#666' }}>Найти по названию</span>
//                             <input
//                                 type="text"
//                                 placeholder=""
//                                 style={{
//                                     padding: '6px 12px',
//                                     border: '1px solid #ddd',
//                                     borderRadius: '4px',
//                                     backgroundColor: '#f5f5f5',
//                                     fontSize: '14px',
//                                     width: '300px'
//                                 }}
//                             />
//                         </div>
//                         <button
//                             onClick={() => setShowFilters(false)}
//                             style={{
//                                 background: 'none',
//                                 border: 'none',
//                                 fontSize: '18px',
//                                 cursor: 'pointer',
//                                 color: '#666',
//                                 padding: '4px'
//                             }}
//                         >
//                             ✕
//                         </button>
//                     </div>
//
//                     <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//                         <div style={{
//                             display: 'grid',
//                             gridTemplateColumns: '120px 140px auto 150px',
//                             padding: '8px 16px',
//                             backgroundColor: '#f8f9fa',
//                             borderBottom: '1px solid #e0e0e0',
//                             fontSize: '14px',
//                             fontWeight: '500',
//                             color: '#666'
//                         }}>
//                             <div>Отобразить в плане</div>
//                             <div>Отобразить наработку</div>
//                             <div></div>
//                             <div style={{ textAlign: 'center' }}>раскрыть всё / свернуть всё</div>
//                         </div>
//
//                         {groupOrder.map(groupName => (
//                             <div key={groupName}>
//                                 <div style={{
//                                     display: 'grid',
//                                     gridTemplateColumns: '120px 140px auto 150px',
//                                     padding: '8px 16px',
//                                     alignItems: 'center',
//                                     borderBottom: '1px solid #f0f0f0',
//                                     backgroundColor: 'white'
//                                 }}>
//                                     <div style={{ display: 'flex', justifyContent: 'center' }}>
//                                         <button
//                                             onClick={() => setGroupVisibility(prev => ({
//                                                 ...prev,
//                                                 [groupName]: !prev[groupName]
//                                             }))}
//                                             style={{
//                                                 background: 'none',
//                                                 border: 'none',
//                                                 cursor: 'pointer',
//                                                 padding: '4px',
//                                                 color: groupVisibility[groupName] ? '#007bff' : '#ccc'
//                                             }}
//                                         >
//                                             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                                                 <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
//                                             </svg>
//                                         </button>
//                                     </div>
//
//                                     <div style={{ display: 'flex', justifyContent: 'center' }}>
//                                         <button
//                                             style={{
//                                                 background: 'none',
//                                                 border: 'none',
//                                                 cursor: 'pointer',
//                                                 padding: '4px',
//                                                 color: '#ccc'
//                                             }}
//                                         >
//                                             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                                                 <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
//                                             </svg>
//                                         </button>
//                                     </div>
//
//                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                         <button
//                                             onClick={() => toggleGroupExpansion(groupName)}
//                                             style={{
//                                                 background: 'none',
//                                                 border: 'none',
//                                                 cursor: 'pointer',
//                                                 padding: '2px',
//                                                 color: '#666'
//                                             }}
//                                         >
//                                             <span style={{
//                                                 fontSize: '12px',
//                                                 transform: expandedGroups.has(groupName) ? 'rotate(90deg)' : 'rotate(0deg)',
//                                                 transition: 'transform 0.2s ease',
//                                                 display: 'inline-block'
//                                             }}>
//                                                 ▶
//                                             </span>
//                                         </button>
//                                         <span style={{ fontSize: '14px', fontWeight: '500' }}>
//                                             {groupName}
//                                         </span>
//                                     </div>
//
//                                     <div style={{
//                                         display: 'flex',
//                                         justifyContent: 'center',
//                                         gap: '4px'
//                                     }}>
//                                         <button
//                                             onClick={() => toggleAllElementsInGroup(groupName, true)}
//                                             style={{
//                                                 background: 'none',
//                                                 border: 'none',
//                                                 cursor: 'pointer',
//                                                 color: '#666',
//                                                 fontSize: '12px',
//                                                 padding: '2px 4px'
//                                             }}
//                                         >
//                                             раскрыть всё
//                                         </button>
//                                         <span style={{ color: '#ddd', fontSize: '12px' }}>/</span>
//                                         <button
//                                             onClick={() => toggleAllElementsInGroup(groupName, false)}
//                                             style={{
//                                                 background: 'none',
//                                                 border: 'none',
//                                                 cursor: 'pointer',
//                                                 color: '#666',
//                                                 fontSize: '12px',
//                                                 padding: '2px 4px'
//                                             }}
//                                         >
//                                             свернуть всё
//                                         </button>
//                                     </div>
//                                 </div>
//
//                                 {expandedGroups.has(groupName) && headerStructure[groupName] && (
//                                     <div>
//                                         {headerStructure[groupName].map(element => (
//                                             <div key={element}>
//                                                 <div style={{
//                                                     display: 'grid',
//                                                     gridTemplateColumns: '120px 140px auto 150px',
//                                                     padding: '6px 16px',
//                                                     alignItems: 'center',
//                                                     borderBottom: '1px solid #f8f8f8',
//                                                     backgroundColor: '#fafafa',
//                                                     marginLeft: '20px'
//                                                 }}>
//                                                     <div style={{ display: 'flex', justifyContent: 'center' }}>
//                                                         <button
//                                                             onClick={() => setElementVisibility(prev => ({
//                                                                 ...prev,
//                                                                 [element]: !prev[element]
//                                                             }))}
//                                                             style={{
//                                                                 background: 'none',
//                                                                 border: 'none',
//                                                                 cursor: 'pointer',
//                                                                 padding: '4px',
//                                                                 color: elementVisibility[element] ? '#007bff' : '#ccc'
//                                                             }}
//                                                         >
//                                                             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
//                                                                 <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
//                                                             </svg>
//                                                         </button>
//                                                     </div>
//                                                     <div style={{ display: 'flex', justifyContent: 'center' }}>
//                                                         <button
//                                                             style={{
//                                                                 background: 'none',
//                                                                 border: 'none',
//                                                                 cursor: 'pointer',
//                                                                 padding: '4px',
//                                                                 color: '#ccc'
//                                                             }}
//                                                         >
//                                                             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
//                                                                 <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
//                                                             </svg>
//                                                         </button>
//                                                     </div>
//                                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                                         {groupName !== "Работающие агрегаты" && (
//                                                             <button
//                                                                 onClick={() => toggleElementExpansion(element)}
//                                                                 style={{
//                                                                     background: 'none',
//                                                                     border: 'none',
//                                                                     cursor: 'pointer',
//                                                                     padding: '2px',
//                                                                     color: '#666'
//                                                                 }}
//                                                             >
//                                                                 <span style={{
//                                                                     fontSize: '10px',
//                                                                     transform: expandedElements.has(element) ? 'rotate(90deg)' : 'rotate(0deg)',
//                                                                     transition: 'transform 0.2s ease',
//                                                                     display: 'inline-block'
//                                                                 }}>
//                                                                     ▶
//                                                                 </span>
//                                                             </button>
//                                                         )}
//                                                         <span style={{ fontSize: '13px' }}>
//                                                             {element}
//                                                         </span>
//                                                     </div>
//
//                                                     <div></div>
//                                                 </div>
//                                                 {groupName !== "Работающие агрегаты" &&
//                                                     expandedElements.has(element) &&
//                                                     elementVisibility[element] &&
//                                                     componentVisibility[element] && (
//                                                         <div>
//                                                             {Object.entries(componentVisibility[element]).map(([componentKey, isVisible]) => (
//                                                                 <div key={componentKey} style={{
//                                                                     display: 'grid',
//                                                                     gridTemplateColumns: '120px 140px auto 150px',
//                                                                     padding: '4px 16px',
//                                                                     alignItems: 'center',
//                                                                     borderBottom: '1px solid #f8f8f8',
//                                                                     backgroundColor: '#f8f8f8',
//                                                                     marginLeft: '40px'
//                                                                 }}>
//                                                                     <div style={{ display: 'flex', justifyContent: 'center' }}>
//                                                                         <button
//                                                                             onClick={() => setComponentVisibility(prev => ({
//                                                                                 ...prev,
//                                                                                 [element]: {
//                                                                                     ...prev[element],
//                                                                                     [componentKey]: !isVisible
//                                                                                 }
//                                                                             }))}
//                                                                             style={{
//                                                                                 background: 'none',
//                                                                                 border: 'none',
//                                                                                 cursor: 'pointer',
//                                                                                 padding: '4px',
//                                                                                 color: isVisible ? '#007bff' : '#ccc'
//                                                                             }}
//                                                                         >
//                                                                             <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
//                                                                                 <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
//                                                                             </svg>
//                                                                         </button>
//                                                                     </div>
//                                                                     <div style={{ display: 'flex', justifyContent: 'center' }}>
//                                                                         <button
//                                                                             style={{
//                                                                                 background: 'none',
//                                                                                 border: 'none',
//                                                                                 cursor: 'pointer',
//                                                                                 padding: '4px',
//                                                                                 color: '#ccc'
//                                                                             }}
//                                                                         >
//                                                                             <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
//                                                                                 <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
//                                                                             </svg>
//                                                                         </button>
//                                                                     </div>
//                                                                     <div style={{
//                                                                         paddingLeft: '24px',
//                                                                         fontSize: '12px',
//                                                                         color: '#666'
//                                                                     }}>
//                                                                         {componentKey}
//                                                                     </div>
//                                                                     <div></div>
//                                                                 </div>
//                                                             ))}
//                                                         </div>
//                                                     )}
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         ))}
//                     </div>
//                     <div style={{
//                         padding: '12px 16px',
//                         borderTop: '1px solid #e0e0e0',
//                         backgroundColor: '#f8f9fa',
//                         display: 'flex',
//                         justifyContent: 'flex-end'
//                     }}>
//                         <button
//                             onClick={() => setShowFilters(false)}
//                             style={{
//                                 padding: '8px 20px',
//                                 backgroundColor: '#007bff',
//                                 color: 'white',
//                                 border: 'none',
//                                 borderRadius: '4px',
//                                 cursor: 'pointer',
//                                 fontSize: '14px'
//                             }}
//                         >
//                             Применить
//                         </button>
//                     </div>
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
//                         const processedRow = processedData[dateString];
//                         const isLoading = loadingDates.has(dateString) || !processedRow;
//                         const rowDate = parseDateString(dateString);
//                         const isPastDate = rowDate.getTime() < today.getTime();
//                         const isStale = needsRefresh.has(dateString);
//
//                         return (
//                             <tr
//                                 key={`${dateString}-${startIndex + index}`}
//                                 style={{
//                                     height: `${dynamicRowHeight}px`,
//                                     backgroundColor: isLoading ? 'transparent' : activeColorTheme("DATE", isPastDate),
//                                     opacity: isStale ? 0.7 : 1,
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
//                                     position: 'relative'
//                                 }}>
//                                     {dateString}
//                                     {isStale && (
//                                         <div style={{
//                                             position: 'absolute',
//                                             top: '2px',
//                                             right: '2px',
//                                             width: '6px',
//                                             height: '6px',
//                                             borderRadius: '50%',
//                                             backgroundColor: '#ff9800',
//                                             opacity: 0.7
//                                         }} />
//                                     )}
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
//                                                     fontWeight: 'normal',
//                                                     position: 'relative'
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
//                                                     <>
//                                                         {cellValue}
//                                                         {isStale && (
//                                                             <div style={{
//                                                                 position: 'absolute',
//                                                                 top: '2px',
//                                                                 right: '2px',
//                                                                 width: '4px',
//                                                                 height: '4px',
//                                                                 borderRadius: '50%',
//                                                                 backgroundColor: '#ff9800',
//                                                                 opacity: 0.6
//                                                             }} />
//                                                         )}
//                                                     </>
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
//                 <span><strong>В сырых данных:</strong> {Object.keys(rawData).length}</span>
//                 <span><strong>В обработанных данных:</strong> {Object.keys(processedData).length}</span>
//                 <span><strong>В viewport:</strong> {viewportData.size}</span>
//                 <span><strong>Загружается:</strong> {loadingDates.size}</span>
//                 <span><strong>Требует обновления:</strong> {needsRefresh.size}</span>
//                 <span><strong>Размер батча:</strong> {scrollBatchSize} дней</span>
//                 <span><strong>Интервал обновления:</strong> {refreshInterval / 1000}s</span>
//                 <span><strong>Скорость скролла:</strong> {scrollVelocity.current.toFixed(2)}</span>
//                 <span><strong>Компенсация скролла:</strong> {isScrollCompensating.current ? 'Да' : 'Нет'}</span>
//                 <span><strong>Показать часы работы:</strong> {showWorkHours ? 'Да' : 'Нет'}</span>
//                 <span><strong>Фильтры открыты:</strong> {showFilters ? 'Да' : 'Нет'}</span>
//                 <span><strong>Видимых групп:</strong> {filteredGroupOrder.length}</span>
//                 <span><strong>Всего групп:</strong> {groupOrder.length}</span>
//                 <span><strong>Развернутых групп:</strong> {expandedGroups.size}</span>
//                 <span><strong>Развернутых элементов:</strong> {expandedElements.size}</span>
//                 <span><strong>Активных запросов:</strong> {Object.keys(fetchingPromises.current).length}</span>
//             </div>}
//         </>
//     );
// };

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
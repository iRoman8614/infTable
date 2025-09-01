import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @typedef {Object} AggregatesData
 * @property {Array<Object>} Работающие_агрегаты - Данные о работающих агрегатах.
 * @property {Array<Object>} 1_Ступень - Данные для первой ступени.
 * @property {Array<Object>} 2_Ступень - Данные для второй ступени.
 */

/**
 * Имитирует асинхронную загрузку данных для определенной даты.
 * Задерживается на 500 мс и возвращает случайные значения.
 *
 * @param {string} date - Дата в формате строки.
 * @returns {Promise<AggregatesData>} Промис, который разрешается объектом с данными по агрегатам.
 */
const fetchDateData = async (date) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('fetching date', date);
    const stagesValues = ["М", "О", "П", "ПР", "Р"];
    const randomStageValue = () => stagesValues[Math.floor(Math.random() * stagesValues.length)];

    //вероятность получить отличающийся ответ
    const sometimesNewAggregate = Math.random() >= 0.98;
    const sometimesNewStageGroup = Math.random() >= 0.99;


    const data = {
        "Работающие агрегаты": [
            {"проверка количества": Math.floor(Math.random()*10)},
            {"проверка кол-во": Math.floor(Math.random()*10)}
        ],
        "1 Ступень": [
            {"20ГПА-2-1": randomStageValue()},
            {"20ГПА-2-2": randomStageValue()},
            {"20ГПА-2-3": randomStageValue()},
        ],
        "2 Ступень": [
            {"20ГПА-2-12": randomStageValue()},
            {"20ГПА-2-13": randomStageValue()},
        ],
    };

    const data2 = {
        "Работающие агрегаты": [
            {"проверка количества": Math.floor(Math.random()*10)},
            {"проверка кол-во": Math.floor(Math.random()*10)}
        ],
        "1 Ступень": [
            {"20ГПА-2-2": randomStageValue()},
            {"20ГПА-2-3": randomStageValue()},
            {"20ГПА-2-4": randomStageValue()},
        ],
        "2 Ступень": [
            {"20ГПА-2-10": randomStageValue()},
            {"20ГПА-2-12": randomStageValue()},
            {"20ГПА-2-13": randomStageValue()},
            {"20ГПА-2-14": randomStageValue()},
        ],
    };

    const data3 = {
        "Работающие агрегаты": [
            {"проверка количества": Math.floor(Math.random()*10)},
            {"проверка кол-во": Math.floor(Math.random()*10)}
        ],
        "1 Ступень": [
            {"20ГПА-2-4": randomStageValue()},
            {"20ГПА-2-5": randomStageValue()},
        ],
        "2 Ступень": [
            {"20ГПА-2-11": randomStageValue()},
        ],
        "3 Ступень": [
            {"20ГПА-3-10": randomStageValue()},
            {"20ГПА-3-12": randomStageValue()},
            {"20ГПА-4-13": randomStageValue()},
        ],
    };

    //вероятность получить отличающийся ответ
    if(sometimesNewAggregate) {
        return data2
    } else if(sometimesNewStageGroup) {
        return data3
    } else {
        return data
    }
};

/**
 * Форматирует объект Date в строку формата 'ДД.ММ.ГГГГ'.
 *
 * @param {Date} date - Объект даты.
 * @returns {string} Отформатированная строка даты.
 */
const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Парсит строку даты формата 'ДД.ММ.ГГГГ' в объект Date.
 *
 * @param {string} dateString - Строка даты.
 * @returns {Date} Объект даты.
 */
const parseDateString = (dateString) => {
    const [day, month, year] = dateString.split('.').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Генерирует массив отформатированных строк дат, включая дни до и после текущей даты.
 *
 * @param {number} [daysBefore=15] - Количество дней до текущей даты для генерации.
 * @param {number} [daysAfter=15] - Количество дней после текущей даты для генерации.
 * @returns {string[]} Массив отформатированных строк дат.
 */
const generateInitialDates = (daysBefore = 15, daysAfter = 15) => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = daysBefore; i > 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(formatDate(date));
    }
    dates.push(formatDate(today));
    for (let i = 1; i <= daysAfter; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(formatDate(date));
    }
    return dates;
};

/**
 * Возвращает цвет фона для ячейки таблицы в зависимости от значения стадии.
 *
 * @param {string | number} stageValue - Значение стадии (напр., "М", "О", "П") или число.
 * @param {boolean} isPastDate - Флаг, указывающий, является ли дата прошедшей.
 * @returns {string} Строка с HEX-кодом цвета.
 */
const getStageColor = (stageValue, isPastDate) => {
    switch (stageValue) {
        case "М": return "#C8E6C9"; // Светло-зеленый
        case "О": return "#fde182"; // Желтоватый
        case "П": return "#56bc5b"; // Зеленый
        case "ПР": return "#1f68f3"; // Синий
        case "Р": return "white";   // Белый
        case 0: return isPastDate ? '#bbdefb' : 'white'; // Светло-синий для прошедших дат, иначе белый
        default: return isPastDate ? '#bbdefb' : 'white'; // Светло-синий для прошедших дат, иначе белый
    }
};

/**
 * Извлекает значение стадии для конкретного ключа из данных группы.
 * Если ключ отсутствует, возвращает значение по умолчанию.
 *
 * @param {Array<Object>} stageGroupData - Массив объектов агрегатов для данной группы.
 * @param {string} key - Ключ (название агрегата).
 * @returns {string | number} Значение стадии или значение по умолчанию ('—' или 0).
 */
const getStageValue = (stageGroupData, key) => {
    if (!stageGroupData) return '—';

    const item = stageGroupData.find(item => Object.prototype.hasOwnProperty.call(item, key));
    const value = item ? item[key] : undefined;

    if (value === undefined) {
        return '—';
    }
    return value;
};


/**
 * React компонент, отображающий виртуализированную таблицу с данными по агрегатам.
 * Позволяет лениво подгружать данные по мере прокрутки и динамически расширять диапазон дат.
 *
 * @returns {JSX.Element} Элемент React таблицы.
 */
export const Table = () => {
    // Состояние для хранения списка дат, отображаемых в таблице.
    const [dates, setDates] = useState(() => generateInitialDates());
    // Состояние для хранения данных, которые в данный момент видимы или находятся в буфере.
    const [visibleData, setVisibleData] = useState({});
    // Состояние для отслеживания дат, для которых в данный момент идет загрузка данных.
    const [loadingDates, setLoadingDates] = useState(new Set());
    // Состояние для хранения всех возможных групп стадий и их ключей, извлекаемых из данных.
    const [allStageGroups, setAllStageGroups] = useState({});
    // Референс на элемент секции, содержащей таблицу, для управления прокруткой.
    const sectionRef = useRef(null);
    // Фиксированная высота каждой строки таблицы.
    const rowHeight = 40;

    // Смещения дней для определения диапазона загружаемых дат (в прошлое и будущее).
    const [startDayOffset, setStartDayOffset] = useState(15);
    const [endDayOffset, setEndDayOffset] = useState(15);

    // Количество строк (дат) в буфере, которые будут предзагружены до того, как они станут видимыми.
    const preloadBuffer = 30;

    // Кэш для хранения уже загруженных данных, чтобы избежать повторных запросов.
    const dataCache = useRef({});
    // Хранит промисы для текущих запросов на загрузку данных, чтобы избежать дублирования запросов.
    const fetchingPromises = useRef({});
    // Объект Date для сегодняшнего дня, используется для определения прошедших дат.
    const today = useRef(new Date());
    today.current.setHours(0, 0, 0, 0); // Обнуляем время для сравнения только по дате.

    // ***************************************************************
    // ДОБАВЛЕНО: Предпочтительный порядок групп
    const preferredGroupOrder = ["Работающие агрегаты", "1 Ступень", "2 Ступень", "3 Ступень"];
    // ***************************************************************

    /**
     * Обновляет `allStageGroups` на основе новых загруженных данных.
     * Это гарантирует, что заголовки столбцов всегда включают все известные агрегаты.
     *
     * @param {AggregatesData} newData - Только что загруженные данные.
     */
    const updateAllStageGroups = useCallback((newData) => {
        setAllStageGroups(prevAllStageGroups => {
            let changed = false;
            const newStageGroups = { ...prevAllStageGroups };

            for (const groupName in newData) {
                if (Array.isArray(newData[groupName]) && newData[groupName].length > 0) {
                    const currentKeys = new Set(newStageGroups[groupName] || []);
                    const newKeys = newData[groupName].map(item => Object.keys(item)[0]);

                    newKeys.forEach(key => {
                        if (!currentKeys.has(key)) {
                            currentKeys.add(key);
                            changed = true;
                        }
                    });

                    // Сортировка ключей для стабильного порядка столбцов
                    const sortedKeys = Array.from(currentKeys).sort();
                    if (JSON.stringify(newStageGroups[groupName]) !== JSON.stringify(sortedKeys)) {
                        newStageGroups[groupName] = sortedKeys;
                        changed = true;
                    }
                }
            }

            return changed ? newStageGroups : prevAllStageGroups;
        });
    }, []);

    /**
     * Проверяет, является ли строка с заданным индексом видимой в области прокрутки,
     * включая буфер предзагрузки.
     *
     * @param {number} rowIndex - Индекс строки для проверки.
     * @returns {boolean} True, если строка видима или находится в буфере, иначе False.
     */
    const isRowVisible = useCallback((rowIndex) => {
        if (!sectionRef.current) return false;

        const section = sectionRef.current;
        const scrollTop = section.scrollTop;
        const clientHeight = section.clientHeight;

        const rowTop = rowIndex * rowHeight;
        const rowBottom = rowTop + rowHeight;

        const bufferPx = preloadBuffer * rowHeight;
        // Строка видима, если ее нижняя граница выше нижней границы буфера
        // и ее верхняя граница ниже верхней границы буфера.
        return rowBottom >= (scrollTop - bufferPx) && rowTop <= (scrollTop + clientHeight + bufferPx);
    }, [preloadBuffer, rowHeight]);

    /**
     * Асинхронно загружает данные для видимых и буферных строк.
     * Проверяет, какие даты нуждаются в загрузке, инициирует запросы и обновляет состояние.
     */
    const loadVisibleAndBufferData = useCallback(async () => {
        if (!sectionRef.current) return;

        const datesToLoad = new Set();
        const currentlyLoading = new Set(loadingDates); // Использование set для loadingDates

        // Определяем даты, которые должны быть загружены.
        dates.forEach((date, index) => {
            if (isRowVisible(index) && !visibleData[date] && !dataCache.current[date] && !currentlyLoading.has(date)) {
                datesToLoad.add(date);
            }
        });

        if (datesToLoad.size === 0) return;

        setLoadingDates(prev => new Set([...prev, ...datesToLoad]));

        // Создаем промисы для загрузки данных. Используем `fetchingPromises` для предотвращения дублирования.
        const loadPromises = Array.from(datesToLoad).map(async (date) => {
            if (fetchingPromises.current[date]) {
                return fetchingPromises.current[date];
            }

            const promise = (async () => {
                try {
                    const data = await fetchDateData(date);
                    dataCache.current[date] = data;
                    updateAllStageGroups(data);
                    return { date, data };
                } catch (error) {
                    console.error(`Ошибка загрузки данных для ${date}:`, error);
                    return { date, data: null };
                } finally {
                    delete fetchingPromises.current[date];
                }
            })();
            fetchingPromises.current[date] = promise;
            return promise;
        });

        const results = await Promise.all(loadPromises);

        // Обновляем `visibleData` на основе загруженных результатов.
        setVisibleData(prev => {
            const newData = {...prev};
            results.forEach(result => {
                if (result.data) {
                    newData[result.date] = result.data;
                }
            });
            return newData;
        });

        // Удаляем загруженные даты из `loadingDates`.
        setLoadingDates(prev => {
            const newLoading = new Set(prev);
            datesToLoad.forEach(date => newLoading.delete(date));
            return newLoading;
        });
    }, [dates, visibleData, loadingDates, isRowVisible, updateAllStageGroups]); // Добавил loadingDates в зависимости

    /**
     * Обработчик события прокрутки таблицы.
     * Запускает `loadVisibleAndBufferData` и управляет динамическим расширением диапазона дат
     * при достижении верхней или нижней границы прокрутки.
     */
    const handleScroll = useCallback(() => {
        loadVisibleAndBufferData();

        if (!sectionRef.current) return;

        const section = sectionRef.current;
        const scrollTop = section.scrollTop;
        const scrollHeight = section.scrollHeight;
        const clientHeight = section.clientHeight;

        // Если прокрутка достигла нижней части буфера, добавляем новые даты в конец.
        if (scrollTop + clientHeight >= scrollHeight - (preloadBuffer * rowHeight)) {
            const newEndDateOffset = endDayOffset + 10;
            const newDates = [];
            const lastDate = parseDateString(dates[dates.length - 1]);
            for (let i = 1; i <= (newEndDateOffset - endDayOffset); i++) {
                const date = new Date(lastDate);
                date.setDate(lastDate.getDate() + i);
                newDates.push(formatDate(date));
            }

            if (newDates.length > 0) {
                setDates(prev => [...prev, ...newDates]);
                setEndDayOffset(newEndDateOffset);
            }
        }

        // Если прокрутка достигла верхней части буфера, добавляем новые даты в начало.
        if (scrollTop <= (preloadBuffer * rowHeight) && dates.length > 0) {
            const newStartDateOffset = startDayOffset + 10;
            const newDates = [];
            const firstDate = parseDateString(dates[0]);
            for (let i = 1; i <= (newStartDateOffset - startDayOffset); i++) {
                const date = new Date(firstDate);
                date.setDate(firstDate.getDate() - i);
                newDates.unshift(formatDate(date));
            }

            if (newDates.length > 0) {
                const oldScrollHeight = section.scrollHeight;
                setDates(prev => [...newDates, ...prev]);
                setStartDayOffset(newStartDateOffset);
                // Корректируем положение прокрутки, чтобы визуально не "прыгало" при добавлении элементов сверху.
                requestAnimationFrame(() => {
                    const newScrollHeight = section.scrollHeight;
                    section.scrollTop += (newScrollHeight - oldScrollHeight);
                });
            }
        }
    }, [loadVisibleAndBufferData, endDayOffset, startDayOffset, preloadBuffer, rowHeight, dates]);

    /**
     * Эффект для установки начального положения прокрутки на "сегодня"
     * и для начальной загрузки видимых данных.
     */
    useEffect(() => {
        // Устанавливаем начальное положение прокрутки только один раз.
        if (sectionRef.current && !sectionRef.current.dataset.initialScrollSet) {
            const todayFormatted = formatDate(today.current);
            const todayIndex = dates.findIndex(date => date === todayFormatted);
            if (todayIndex !== -1) {
                // Прокручиваем к сегодняшней дате, центрируя ее, если возможно.
                sectionRef.current.scrollTop = (todayIndex * rowHeight) - (sectionRef.current.clientHeight / 2) + (rowHeight / 2);
                sectionRef.current.dataset.initialScrollSet = 'true';
            }
        }
        loadVisibleAndBufferData();
    }, [loadVisibleAndBufferData, dates]);

    /**
     * Эффект для инициализации `allStageGroups` на основе первых доступных данных.
     * Это необходимо для рендеринга заголовков столбцов.
     * Теперь он вызывает `updateAllStageGroups` для обработки первого набора данных.
     */
    useEffect(() => {
        if (Object.keys(allStageGroups).length === 0 && dates.length > 0 && !loadingDates.has(dates[0]) && !visibleData[dates[0]] && !dataCache.current[dates[0]]) {
            const loadInitialStageGroups = async () => {
                setLoadingDates(prev => new Set([...prev, dates[0]]));
                try {
                    const result = await (fetchingPromises.current[dates[0]] || (async () => {
                        const promise = fetchDateData(dates[0]);
                        fetchingPromises.current[dates[0]] = promise.then(data => ({ date: dates[0], data }));
                        return fetchingPromises.current[dates[0]];
                    })());

                    if (result.data) {
                        dataCache.current[result.date] = result.data;
                        updateAllStageGroups(result.data); // Используем новую функцию
                        setVisibleData(prev => ({ ...prev, [result.date]: result.data }));
                    }
                } catch (error) {
                    console.error("Failed to load initial data for stage groups:", error);
                } finally {
                    setLoadingDates(prev => {
                        const newLoading = new Set(prev);
                        newLoading.delete(dates[0]);
                        return newLoading;
                    });
                    delete fetchingPromises.current[dates[0]];
                }
            };
            loadInitialStageGroups();
        }
    }, [dates, loadingDates, visibleData, allStageGroups, updateAllStageGroups]);

    // Определяем порядок групп, используя preferredGroupOrder
    const sortedGroupNames = Object.keys(allStageGroups).sort((a, b) => {
        const indexA = preferredGroupOrder.indexOf(a);
        const indexB = preferredGroupOrder.indexOf(b);
        // Если обе группы есть в preferredGroupOrder, сортируем по их индексу
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        // Если только одна группа есть в preferredGroupOrder, она идет первой
        if (indexA !== -1) {
            return -1;
        }
        if (indexB !== -1) {
            return 1;
        }
        // Если ни одной нет, или обе отсутствуют, используем обычную лексикографическую сортировку
        return a.localeCompare(b);
    });

    return (
        <section
            ref={sectionRef}
            style={{
                width: '50%',
                height: '600px',
                overflow: 'auto',
                border: '1px solid #ccc',
                position: 'relative',
            }}
            onScroll={handleScroll}
        >
            <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'lightblue', zIndex: 10 }}>
                <tr>
                    <th rowSpan="2" style={{ borderRight: '2px solid #ccc', padding: '0px' }}>Дата</th>
                    {/* Рендеринг заголовков групп (например, "1 Ступень", "2 Ступень") */}
                    {sortedGroupNames.map((groupName, index) => (
                        <th
                            key={groupName}
                            colSpan={allStageGroups[groupName].length}
                            style={{
                                borderLeft: index > 0 ? '2px solid #ccc' : 'none',
                                borderRight: '2px solid #ccc',
                                padding: '0px',
                            }}
                        >
                            {groupName}
                        </th>
                    ))}
                </tr>
                <tr>
                    {/* Рендеринг подзаголовков агрегатов внутри каждой группы */}
                    {sortedGroupNames.map((groupName, groupIndex) => (
                        allStageGroups[groupName].map((key, keyIndex) => (
                            <th
                                key={`${groupName}-${key}`}
                                style={{
                                    borderLeft: keyIndex === 0 && groupIndex > 0 ? '2px solid #ccc' : 'none',
                                    padding: '2px'
                                }}
                            >
                                {key}
                            </th>
                        ))
                    ))}
                </tr>
                </thead>
                <tbody>
                {/* Рендеринг строк данных для каждой даты */}
                {dates.map((dateString, index) => {
                    const data = dataCache.current[dateString] || visibleData[dateString];
                    const isLoading = loadingDates.has(dateString);
                    const rowDate = parseDateString(dateString);
                    const isPastDate = rowDate.getTime() < today.current.getTime();

                    return (
                        <tr
                            key={dateString}
                            style={{
                                height: `${rowHeight}px`,
                                backgroundColor: isPastDate ? '#bbdefb' : 'inherit' // Фон для прошедших дат
                            }}
                        >
                            <th style={{ borderRight: 'none', padding: '8px', color: isPastDate ? '#424242' : 'inherit' }}>
                                {dateString}
                            </th>
                            {/* Рендеринг ячеек данных для каждой стадии агрегата */}
                            {sortedGroupNames.map((groupName, groupIndex) => (
                                allStageGroups[groupName].map((key, keyIndex) => {
                                    const stageGroupData = data ? data[groupName] : [];
                                    const stageValue = getStageValue(stageGroupData, key);
                                    return (
                                        <td
                                            key={`${dateString}-${groupName}-${key}`}
                                            style={{
                                                borderLeft: keyIndex === 0 && groupIndex > 0 ? '2px solid #ccc' : 'none',
                                                borderRight: keyIndex === allStageGroups[groupName].length - 1 ? '4px solid #fff' : 'none', // Правая граница для последней ячейки группы
                                                padding: '0px',
                                                textAlign: 'center',
                                                backgroundColor: isLoading ? 'transparent' : getStageColor(stageValue, isPastDate) // Цвет в зависимости от стадии и даты
                                            }}
                                        >
                                            {/* Отображение спиннера загрузки или значения стадии */}
                                            {isLoading ? (
                                                <div
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        border: '2px solid #ccc',
                                                        borderTop: '2px solid #007bff',
                                                        animation: 'spin 1s linear infinite',
                                                        margin: 'auto',
                                                        backgroundColor: isPastDate ? '#bbdefb' : 'inherit'
                                                    }}
                                                />
                                            ) : (
                                                stageValue
                                            )}
                                        </td>
                                    );
                                })
                            ))}
                        </tr>
                    );
                })}
                </tbody>
            </table>
            {/* CSS анимация для спиннера загрузки */}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </section>
    );
};
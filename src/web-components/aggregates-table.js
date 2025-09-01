import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';

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


class AggregatesTable extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 50%;
            height: 600px;
            overflow: auto;
            border: 1px solid #ccc;
            position: relative;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            border: none;
        }

        thead {
            position: sticky;
            top: 0;
            background: lightblue;
            z-index: 10;
        }

        th {
            border-right: 2px solid #ccc;
            padding: 0px;
        }

        th[colspan] {
            border-left: 2px solid #ccc;
        }

        th:first-child {
            border-left: none;
        }

        td {
            padding: 0px;
            text-align: center;
            height: 40px; /* rowHeight */
        }

        td[data-group-start="true"] {
            border-left: 2px solid #ccc;
        }

        td[data-group-end="true"] {
            border-right: 4px solid #fff;
        }

        .past-date {
            background-color: #bbdefb;
            color: #424242;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .spinner {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid #ccc;
            border-top: 2px solid #007bff;
            animation: spin 1s linear infinite;
            margin: auto;
        }
    `;

    @state()
    dates = generateInitialDates();

    @state()
    visibleData = {};

    @state()
    loadingDates = new Set();

    @state()
    allStageGroups = {};

    sectionRef = null;
    rowHeight = 40;
    startDayOffset = 15;
    endDayOffset = 15;
    preloadBuffer = 30;
    dataCache = {};
    fetchingPromises = {};
    today = new Date();
    preferredGroupOrder = ["Работающие агрегаты", "1 Ступень", "2 Ступень", "3 Ступень"];

    constructor() {
        super();
        this.today.setHours(0, 0, 0, 0);
        this.handleScroll = this.handleScroll.bind(this);
    }

    firstUpdated() {
        this.sectionRef = this.shadowRoot.host;
        this.sectionRef.addEventListener('scroll', this.handleScroll);
        this.initializeScrollAndData();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.sectionRef) {
            this.sectionRef.removeEventListener('scroll', this.handleScroll);
        }
    }

    async initializeScrollAndData() {
        // Устанавливаем начальное положение прокрутки только один раз.
        if (this.sectionRef && !this.sectionRef.dataset.initialScrollSet) {
            const todayFormatted = formatDate(this.today);
            const todayIndex = this.dates.findIndex(date => date === todayFormatted);
            if (todayIndex !== -1) {
                this.sectionRef.scrollTop = (todayIndex * this.rowHeight) - (this.sectionRef.clientHeight / 2) + (this.rowHeight / 2);
                this.sectionRef.dataset.initialScrollSet = 'true';
            }
        }
        await this.loadVisibleAndBufferData();

        // Инициализация allStageGroups на основе первых доступных данных
        if (Object.keys(this.allStageGroups).length === 0 && this.dates.length > 0 && !this.loadingDates.has(this.dates[0]) && !this.visibleData[this.dates[0]] && !this.dataCache[this.dates[0]]) {
            await this.loadInitialStageGroups();
        }
    }

    async loadInitialStageGroups() {
        this.loadingDates = new Set([...this.loadingDates, this.dates[0]]);
        try {
            const result = await (this.fetchingPromises[this.dates[0]] || (async () => {
                const promise = fetchDateData(this.dates[0]);
                this.fetchingPromises[this.dates[0]] = promise.then(data => ({ date: this.dates[0], data }));
                return this.fetchingPromises[this.dates[0]];
            })());

            if (result.data) {
                this.dataCache[result.date] = result.data;
                this.updateAllStageGroups(result.data);
                this.visibleData = { ...this.visibleData, [result.date]: result.data };
            }
        } catch (error) {
            console.error("Failed to load initial data for stage groups:", error);
        } finally {
            const newLoading = new Set(this.loadingDates);
            newLoading.delete(this.dates[0]);
            this.loadingDates = newLoading;
            delete this.fetchingPromises[this.dates[0]];
        }
    }

    updateAllStageGroups(newData) {
        let changed = false;
        const newStageGroups = { ...this.allStageGroups };

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

                const sortedKeys = Array.from(currentKeys).sort();
                if (JSON.stringify(newStageGroups[groupName]) !== JSON.stringify(sortedKeys)) {
                    newStageGroups[groupName] = sortedKeys;
                    changed = true;
                }
            }
        }

        if (changed) {
            this.allStageGroups = newStageGroups;
        }
    }

    isRowVisible(rowIndex) {
        if (!this.sectionRef) return false;

        const section = this.sectionRef;
        const scrollTop = section.scrollTop;
        const clientHeight = section.clientHeight;

        const rowTop = rowIndex * this.rowHeight;
        const rowBottom = rowTop + this.rowHeight;

        const bufferPx = this.preloadBuffer * this.rowHeight;
        return rowBottom >= (scrollTop - bufferPx) && rowTop <= (scrollTop + clientHeight + bufferPx);
    }

    async loadVisibleAndBufferData() {
        if (!this.sectionRef) return;

        const datesToLoad = new Set();
        const currentlyLoading = new Set(this.loadingDates);

        this.dates.forEach((date, index) => {
            if (this.isRowVisible(index) && !this.visibleData[date] && !this.dataCache[date] && !currentlyLoading.has(date)) {
                datesToLoad.add(date);
            }
        });

        if (datesToLoad.size === 0) return;

        this.loadingDates = new Set([...this.loadingDates, ...datesToLoad]);

        const loadPromises = Array.from(datesToLoad).map(async (date) => {
            if (this.fetchingPromises[date]) {
                return this.fetchingPromises[date];
            }

            const promise = (async () => {
                try {
                    const data = await fetchDateData(date);
                    this.dataCache[date] = data;
                    this.updateAllStageGroups(data);
                    return { date, data };
                } catch (error) {
                    console.error(`Ошибка загрузки данных для ${date}:`, error);
                    return { date, data: null };
                } finally {
                    delete this.fetchingPromises[date];
                }
            })();
            this.fetchingPromises[date] = promise;
            return promise;
        });

        const results = await Promise.all(loadPromises);

        const newData = {...this.visibleData};
        results.forEach(result => {
            if (result.data) {
                newData[result.date] = result.data;
            }
        });
        this.visibleData = newData;

        const newLoading = new Set(this.loadingDates);
        datesToLoad.forEach(date => newLoading.delete(date));
        this.loadingDates = newLoading;
    }

    handleScroll() {
        this.loadVisibleAndBufferData();

        if (!this.sectionRef) return;

        const section = this.sectionRef;
        const scrollTop = section.scrollTop;
        const scrollHeight = section.scrollHeight;
        const clientHeight = section.clientHeight;

        if (scrollTop + clientHeight >= scrollHeight - (this.preloadBuffer * this.rowHeight)) {
            const newEndDateOffset = this.endDayOffset + 10;
            const newDates = [];
            const lastDate = parseDateString(this.dates[this.dates.length - 1]);
            for (let i = 1; i <= (newEndDateOffset - this.endDayOffset); i++) {
                const date = new Date(lastDate);
                date.setDate(lastDate.getDate() + i);
                newDates.push(formatDate(date));
            }

            if (newDates.length > 0) {
                this.dates = [...this.dates, ...newDates];
                this.endDayOffset = newEndDateOffset;
            }
        }

        if (scrollTop <= (this.preloadBuffer * this.rowHeight) && this.dates.length > 0) {
            const newStartDateOffset = this.startDayOffset + 10;
            const newDates = [];
            const firstDate = parseDateString(this.dates[0]);
            for (let i = 1; i <= (newStartDateOffset - this.startDayOffset); i++) {
                const date = new Date(firstDate);
                date.setDate(firstDate.getDate() - i);
                newDates.unshift(formatDate(date));
            }

            if (newDates.length > 0) {
                const oldScrollHeight = section.scrollHeight;
                this.dates = [...newDates, ...this.dates];
                this.startDayOffset = newStartDateOffset;
                requestAnimationFrame(() => {
                    const newScrollHeight = section.scrollHeight;
                    section.scrollTop += (newScrollHeight - oldScrollHeight);
                });
            }
        }
    }

    render() {
        const sortedGroupNames = Object.keys(this.allStageGroups).sort((a, b) => {
            const indexA = this.preferredGroupOrder.indexOf(a);
            const indexB = this.preferredGroupOrder.indexOf(b);

            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }
            if (indexA !== -1) {
                return -1;
            }
            if (indexB !== -1) {
                return 1;
            }
            return a.localeCompare(b);
        });

        return html`
            <table role="table">
                <thead>
                    <tr>
                        <th rowspan="2" style="border-right: 2px solid #ccc; padding: 0px;">Дата</th>
                        ${sortedGroupNames.map((groupName, index) => html`
                            <th
                                colspan=${this.allStageGroups[groupName].length}
                                style="border-left: ${index > 0 ? '2px solid #ccc' : 'none'}; border-right: 2px solid #ccc; padding: 0px;"
                            >
                                ${groupName}
                            </th>
                        `)}
                    </tr>
                    <tr>
                        ${sortedGroupNames.map((groupName, groupIndex) =>
            this.allStageGroups[groupName].map((key, keyIndex) => html`
                                <th
                                    style="border-left: ${keyIndex === 0 && groupIndex > 0 ? '2px solid #ccc' : 'none'}; padding: 2px;"
                                >
                                    ${key}
                                </th>
                            `))
        }
                    </tr>
                </thead>
                <tbody>
                    ${this.dates.map((dateString, index) => {
            const data = this.dataCache[dateString] || this.visibleData[dateString];
            const isLoading = this.loadingDates.has(dateString);
            const rowDate = parseDateString(dateString);
            const isPastDate = rowDate.getTime() < this.today.getTime();

            return html`
                            <tr
                                style="height: ${this.rowHeight}px; ${isPastDate ? 'background-color: #bbdefb;' : ''}"
                            >
                                <th class="${isPastDate ? 'past-date' : ''}" style="border-right: none; padding: 8px;">
                                    ${dateString}
                                </th>
                                ${sortedGroupNames.map((groupName, groupIndex) =>
                this.allStageGroups[groupName].map((key, keyIndex) => {
                    const stageGroupData = data ? data[groupName] : [];
                    const stageValue = getStageValue(stageGroupData, key);
                    return html`
                                            <td
                                                data-group-start="${keyIndex === 0 && groupIndex > 0}"
                                                data-group-end="${keyIndex === this.allStageGroups[groupName].length - 1}"
                                                style="background-color: ${isLoading ? 'transparent' : getStageColor(stageValue, isPastDate)}"
                                            >
                                                ${isLoading ? html`
                                                    <div class="spinner" style="${isPastDate ? 'background-color: #bbdefb;' : ''}"></div>
                                                ` : stageValue}
                                            </td>
                                        `;
                })
            )}
                            </tr>
                        `;
        })}
                </tbody>
            </table>
        `;
    }
}

customElements.define('aggregates-table', AggregatesTable);
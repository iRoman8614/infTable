import {Table} from "./component/table";

/**
 * Возвращает цвет фона для ячейки таблицы в зависимости от значения стадии.
 *
 * @param {string | number} stageValue - Значение стадии (напр., "М", "О", "П") или число.
 * @param {boolean} isPastDate - Флаг, указывающий, является ли дата прошедшей.
 * @returns {string} Строка с HEX-кодом цвета.
 */
const getStageColor = (stageValue, isPastDate) => {
    switch (stageValue) {
        case "М": return "#cdef8d"; // Светло-зеленый
        case "О": return "#ffce42"; // Желтый
        case "П": return "#86cb89"; // Зеленый
        case "ПР": return "#4a86e8"; // Синий
        case "Р": return "white";   // Белый
        case "BGHeader":  return "#dee3f5"; // Цвет заголовка таблицы
        case "DATE": return isPastDate ?  "#acb5e3" : "white" // Цвет заполнения дат
        case 0: return isPastDate ? '#acb5e3' : 'white'; // Светло-синий для прошедших дат, иначе белый
        default: return isPastDate ? '#acb5e3' : 'white'; // Светло-синий для прошедших дат, иначе белый
    }
};

const fetchBatchData = async (startDate, days) => {
    console.log(`Загружаем батч: ${startDate} (+${days} дней)`);
    await new Promise(resolve => setTimeout(resolve, 300));

    const stagesValues = ["М", "М", "М", "М", "М", "М", "О", "П", "ПР", "Р"];
    const randomStageValue = () => stagesValues[Math.floor(Math.random() * stagesValues.length)];
    const componentKeys = ["ГТД", "ГПА", "ОГК", "ДУС", "Трансмиссия"];

    const randomWorkHours = () => {
        const hours = {};
        const availableComponents = componentKeys.filter(() => Math.random() > 0.3);
        if (availableComponents.length === 0) availableComponents.push(componentKeys[0]);

        availableComponents.forEach(component => {
            hours[component] = Math.floor(Math.random() * 1000) + 100;
        });
        return hours;
    };

    const generateDayData = (dateStr) => {
        const stages = [
            {
                name: "1 Ступень",
                aggregates: [
                    { name: "20ГПА-1-1", status: randomStageValue(), work_hours: randomWorkHours() },
                    { name: "20ГПА-1-2", status: randomStageValue(), work_hours: randomWorkHours() },
                    { name: "20ГПА-1-3", status: randomStageValue(), work_hours: randomWorkHours() },
                    { name: "20ГПА-1-4", status: randomStageValue(), work_hours: randomWorkHours() }
                ]
            },
            {
                name: "2 Ступень",
                aggregates: [
                    { name: "20ГПА-2-1", status: randomStageValue(), work_hours: randomWorkHours() },
                    { name: "20ГПА-2-2", status: randomStageValue(), work_hours: randomWorkHours() },
                    { name: "20ГПА-2-3", status: randomStageValue(), work_hours: randomWorkHours() },
                    { name: "20ГПА-2-4", status: randomStageValue(), work_hours: randomWorkHours() }
                ]
            },
            {
                name: "3 Ступень",
                aggregates: [
                    { name: "20ГПА-3-1", status: randomStageValue(), work_hours: randomWorkHours() },
                    { name: "20ГПА-3-2", status: randomStageValue(), work_hours: randomWorkHours() },
                    { name: "20ГПА-3-3", status: randomStageValue(), work_hours: randomWorkHours() },
                    { name: "20ГПА-3-4", status: randomStageValue(), work_hours: randomWorkHours() }
                ]
            }
        ];

        const result = {
            date: dateStr,
            stages: stages
        };

        if (Math.random() > 0.3) {
            result.working_aggregates = {
                agr1: Math.floor(Math.random() * 10),
                agr2: Math.floor(Math.random() * 10)
            };
            if (Math.random() > 0.7) {
                result.working_aggregates.agr3 = Math.floor(Math.random() * 10);
            }
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

function App() {
    return (
        <main style={{width: "100%"}}>
            <Table maxWidth={'1200px'} maxHeight={'600px'} colorTheme={getStageColor}  debug={false} />
        </main>
    )
}

export default App

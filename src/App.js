import {Table} from "./component/table";
import {TableTest} from "./component/test";
import {TableMergeTest} from "./component/testmerge";

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

function App() {
    return (
        <main style={{width: "100%"}}>
            <Table maxWidth={'1200px'} maxHeight={'600px'} colorTheme={getStageColor} debug={false} />
        </main>
    )
}

export default App

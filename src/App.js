import React from 'react';
import Table from './component/Table/index';
import {Headers} from  './component/Table/data/headers'

function App() {
    // Обработчик клика по ячейке
    const handleCellClick = (cellData) => {
        console.log(`Дата: ${cellData.date} ID колонки: ${cellData.nodeId} Значение: ${cellData.value} Название узла: ${cellData.node?.name}`);
    };

    return (
        <div className="App">
            <h1>Производственная таблица</h1>
            <Table
                maxHeight="600px"
                debug={true}
                scrollBatchSize={7}
                onCellClick={handleCellClick}
                headerProvider={Headers}
            />
        </div>
    );
}

export default App;

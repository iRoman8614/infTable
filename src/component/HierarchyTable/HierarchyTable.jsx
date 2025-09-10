import React from 'react';
import { useState, useEffect } from 'react';

const initialData = {
    "headers": [
        {
            "id": "factory1",
            "parentId": null,
            "type": "node",
            "name": "Завод №1 'Металлург'",
            "metadata": {
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
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
                "color": "#dee3f5",
                "tooltip": "Автоматизированный тестовый стенд",
                "link": "/teststands/teststand1",
                "subtype": "automated_test_stand",
                "workCount": 3
            }
        }
    ],
    "maintenances": [
        {
            "id": "maintenance_1",
            "name": "ТО-1 (Еженедельное)",
            "color": "#dee3f5",
            "description": "Еженедельное техническое обслуживание оборудования"
        },
        {
            "id": "maintenance_2",
            "name": "ТО-2 (Ежемесячное)",
            "color": "#dee3f5",
            "description": "Ежемесячное углубленное техническое обслуживание"
        },
        {
            "id": "maintenance_3",
            "name": "ТО-3 (Квартальное)",
            "color": "#dee3f5",
            "description": "Квартальное комплексное техническое обслуживание"
        },
        {
            "id": "maintenance_4",
            "name": "ТР (Текущий ремонт)",
            "color": "#dee3f5",
            "description": "Текущий ремонт оборудования"
        },
        {
            "id": "maintenance_5",
            "name": "КР (Капитальный ремонт)",
            "color": "#dee3f5",
            "description": "Капитальный ремонт с заменой основных узлов"
        },
        {
            "id": "maintenance_6",
            "name": "Диагностика",
            "color": "#dee3f5",
            "description": "Комплексная диагностика состояния оборудования"
        },
        {
            "id": "maintenance_7",
            "name": "Калибровка",
            "color": "#dee3f5",
            "description": "Калибровка измерительного оборудования"
        },
        {
            "id": "maintenance_8",
            "name": "Профилактика",
            "color": "#dee3f5",
            "description": "Профилактические работы по предотвращению поломок"
        }
    ]
};

// Вспомогательная функция для построения дерева
const buildTree = (headers) => {
    const nodes = {};
    const rootNodes = [];

    headers.forEach(header => {
        nodes[header.id] = { ...header, children: [] };
    });

    headers.forEach(header => {
        if (header.parentId === null) {
            rootNodes.push(nodes[header.id]);
        } else {
            if (nodes[header.parentId]) {
                nodes[header.parentId].children.push(nodes[header.id]);
            }
        }
    });
    console.log('rootNodes', rootNodes);
    return rootNodes;
};

// Вспомогательная функция для вычисления colspan
const calculateColspan = (node) => {
    if (node.children.length === 0) {
        return 1;
    }
    return node.children.reduce((sum, child) => sum + calculateColspan(child), 0);
};

// Вспомогательная функция для вычисления максимальной глубины
const getMaxDepth = (node) => {
    if (node.children.length === 0) {
        return 1;
    }
    return 1 + Math.max(...node.children.map(getMaxDepth));
};

const TableHeader = () => {
    const [headerTree, setHeaderTree] = useState([]);
    const [maxDepth, setMaxDepth] = useState(0);

    useEffect(() => {
        const tree = buildTree(initialData.headers);
        setHeaderTree(tree);

        if (tree.length > 0) {
            const depth = Math.max(...tree.map(getMaxDepth));
            setMaxDepth(depth);
        }
    }, []);

    const renderHeaderRow = (nodes, currentDepth) => {
        return (
            <>
                {nodes.map(node => (
                    <th
                        key={node.id}
                        colSpan={calculateColspan(node)}
                        rowSpan={node.children.length === 0 ? maxDepth - currentDepth + 1 : 1}
                        style={{ backgroundColor: node.metadata.color, color: '#fff', padding: '8px', border: '1px solid #ddd' }}
                    >
                        {node.name}
                    </th>
                ))}
            </>
        );
    };

    const renderTableRows = () => {
        const rows = [];
        let currentNodes = headerTree;
        let currentDepth = 1;

        while (currentNodes.length > 0) {
            rows.push(
                <tr key={`row-${currentDepth}`} style={{ backgroundColor: currentDepth % 2 === 0 ? '#f2f2f2' : '#ffffff' }}>
                    {renderHeaderRow(currentNodes, currentDepth)}
                </tr>
            );

            let nextNodes = [];
            currentNodes.forEach(node => {
                nextNodes = nextNodes.concat(node.children);
            });
            currentNodes = nextNodes;
            currentDepth++;
        }
        return rows;
    };

    const renderLeafRow = () => {
        const leafNodes = [];
        const traverse = (node) => {
            if (node.children.length === 0) {
                leafNodes.push(node);
            } else {
                node.children.forEach(traverse);
            }
        };
        headerTree.forEach(traverse);

        return (
            <tr style={{ backgroundColor: maxDepth % 2 === 0 ? '#f2f2f2' : '#ffffff' }}>
                {leafNodes.map(node => (
                    <th key={node.id} style={{ padding: '8px', border: '1px solid #ddd', minWidth: '50px' }}>
                        {node.metadata.workCount}
                    </th>
                ))}
            </tr>
        );
    };


    if (headerTree.length === 0) {
        return <div>Loading headers...</div>;
    }

    return (
        <div style={{ overflowX: 'auto', margin: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
                <thead>
                {renderTableRows()}
                {renderLeafRow()}
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
    );
};

export default TableHeader;
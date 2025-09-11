export const Headers = {
    "headers": [
        {
            "id": "factory1",
            "parentId": null,
            "type": "node",
            "name": "Завод №1 'Металлург'",
            "metadata": {
                "color": "#343434",
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
            "id": "station3",
            "parentId": "line1",
            "type": "component",
            "name": "Станция 3",
            "metadata": {
                "color": "#f44336",
                "tooltip": "Финальная станция",
                "workCount": 5
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
            "id": "station4",
            "parentId": "line2",
            "type": "component",
            "name": "Станция 4",
            "metadata": {
                "color": "#f44336",
                "tooltip": "Контрольная станция",
                "workCount": 2
            }
        },
        {
            "id": "station5",
            "parentId": "line2",
            "type": "component",
            "name": "Станция 5",
            "metadata": {
                "color": "#f44336",
                "tooltip": "Упаковочная станция",
                "workCount": 3
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
        },
        {
            "id": "machine2",
            "parentId": "section1",
            "type": "component",
            "name": "Станок ЧПУ-2",
            "metadata": {
                "color": "#795548",
                "tooltip": "Фрезерный станок с ЧПУ",
                "workCount": 1
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
                "workCount": 35
            }
        },
        {
            "id": "pcb_line1",
            "parentId": "workshop3",
            "type": "component",
            "name": "Линия ПП-1",
            "metadata": {
                "color": "#e91e63",
                "tooltip": "Линия производства печатных плат",
                "workCount": 8
            }
        },
        {
            "id": "pcb_line2",
            "parentId": "workshop3",
            "type": "component",
            "name": "Линия ПП-2",
            "metadata": {
                "color": "#e91e63",
                "tooltip": "Линия производства сложных плат",
                "workCount": 6
            }
        }
    ]
};
// import React, { useCallback } from 'react';
// import { getContrastTextColor } from '../utils/ContrastTextColor';
//
// /**
//  * Компонент заголовка таблицы
//  */
// export const TableHeader = ({
//                                 treeStructure,
//                                 nodeVisibility,
//                                 activeColorTheme
//                             }) => {
//     // Функция расчета colspan
//     const calculateColspan = useCallback((node) => {
//         if (node.children.length === 0) {
//             return isNodeFullyVisible(node.id) ? 1 : 0;
//         }
//         return node.children.reduce((sum, child) => sum + calculateColspan(child), 0);
//     }, []);
//
//     // Проверка полной видимости узла
//     const isNodeFullyVisible = useCallback((nodeId) => {
//         let currentNodeId = nodeId;
//         while (currentNodeId) {
//             if (!nodeVisibility[currentNodeId]) return false;
//             const node = treeStructure.nodesMap.get(currentNodeId);
//             if (!node) return false;
//             currentNodeId = node.parentId;
//         }
//         return true;
//     }, [nodeVisibility, treeStructure.nodesMap]);
//
//     // Фильтрация видимых узлов для заголовка
//     const filterVisibleNodes = useCallback((nodes) => {
//         return nodes.filter(node => {
//             if (isNodeFullyVisible(node.id)) return true;
//
//             const hasVisibleDescendants = (n) => {
//                 if (n.children.length === 0) return false;
//                 return n.children.some(child =>
//                     isNodeFullyVisible(child.id) || hasVisibleDescendants(child)
//                 );
//             };
//
//             return hasVisibleDescendants(node);
//         }).map(node => ({
//             ...node,
//             children: filterVisibleNodes(node.children)
//         }));
//     }, [isNodeFullyVisible]);
//
//     // Рендер строк заголовка
//     const renderHeaderRows = useCallback(() => {
//         const rows = [];
//         const visibleTree = filterVisibleNodes(treeStructure.tree);
//
//         let currentLevelNodes = visibleTree;
//         let depth = 1;
//
//         while (currentLevelNodes.length > 0 && depth <= treeStructure.maxDepth) {
//             const currentDepth = depth; // Создаем локальную копию для безопасности
//
//             rows.push(
//                 <tr key={`header-row-${currentDepth}`}>
//                     {/* Ячейка "Дата" - отображается только в первой строке */}
//                     {currentDepth === 1 && (
//                         <th
//                             rowSpan={treeStructure.maxDepth}
//                             style={{
//                                 padding: '8px',
//                                 minWidth: '100px',
//                                 borderRight: '1px solid #ddd',
//                                 fontSize: '14px',
//                                 fontWeight: 'normal',
//                                 whiteSpace: 'nowrap',
//                                 color: getContrastTextColor(activeColorTheme("BGHeader")),
//                                 backgroundColor: activeColorTheme("BGHeader")
//                             }}
//                         >
//                             Дата
//                         </th>
//                     )}
//
//                     {/* Ячейки для узлов дерева */}
//                     {currentLevelNodes.map(node => {
//                         const colspan = calculateColspan(node);
//                         if (colspan === 0) return null;
//
//                         const isVisible = isNodeFullyVisible(node.id);
//                         const backgroundColor = isVisible ? node.metadata.color : '#ccc';
//
//                         return (
//                             <th
//                                 key={node.id}
//                                 colSpan={colspan}
//                                 rowSpan={node.children.length === 0 ? treeStructure.maxDepth - currentDepth + 1 : 1}
//                                 style={{
//                                     backgroundColor: backgroundColor,
//                                     padding: '8px',
//                                     fontSize: '12px',
//                                     fontWeight: 'normal',
//                                     textAlign: 'center',
//                                     // ЗДЕСЬ ИСПОЛЬЗУЕТСЯ ФУНКЦИЯ КОНТРАСТНОГО ЦВЕТА
//                                     color: getContrastTextColor(backgroundColor),
//                                     opacity: isVisible ? 1 : 0.5,
//                                     border: '1px solid #ddd'
//                                 }}
//                             >
//                                 {node.name}
//                             </th>
//                         );
//                     })}
//                 </tr>
//             );
//
//             // Переходим к следующему уровню
//             const nextLevelNodes = [];
//             currentLevelNodes.forEach(node => {
//                 if (node.children && node.children.length > 0) {
//                     nextLevelNodes.push(...node.children);
//                 }
//             });
//
//             currentLevelNodes = filterVisibleNodes(nextLevelNodes);
//             depth++;
//         }
//
//         return rows;
//     }, [treeStructure, filterVisibleNodes, calculateColspan, isNodeFullyVisible, activeColorTheme]);
//
//     return (
//         <thead style={{
//             position: 'sticky',
//             top: 0,
//             backgroundColor: activeColorTheme("BGHeader"),
//             zIndex: 10
//         }}>
//         {renderHeaderRows()}
//         </thead>
//     );
// };

import React, { useCallback } from 'react';

// Встроенная функция контрастного цвета
const getContrastTextColor = (backgroundColor) => {
    if (!backgroundColor || backgroundColor === 'transparent') return '#000';

    const hex = backgroundColor.replace('#', '');
    if (hex.length !== 6) return '#000';

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000' : '#fff';
};

/**
 * Компонент заголовка таблицы с отладкой
 */
export const TableHeader = ({
                                treeStructure,
                                nodeVisibility,
                                activeColorTheme
                            }) => {

    // ОТЛАДОЧНАЯ ИНФОРМАЦИЯ
    React.useEffect(() => {
        console.log('[TableHeader] Инициализация с данными:');
        console.log('- treeStructure:', treeStructure);
        console.log('- treeStructure.tree:', treeStructure?.tree);
        console.log('- treeStructure.maxDepth:', treeStructure?.maxDepth);
        console.log('- nodeVisibility:', nodeVisibility);
        console.log('- activeColorTheme:', typeof activeColorTheme);
    }, [treeStructure, nodeVisibility, activeColorTheme]);

    // Проверка полной видимости узла
    const isNodeFullyVisible = useCallback((nodeId) => {
        if (!nodeVisibility || typeof nodeVisibility !== 'object') {
            console.log('[TableHeader] nodeVisibility не определен, считаем узел видимым:', nodeId);
            return true; // По умолчанию считаем видимым
        }

        let currentNodeId = nodeId;
        while (currentNodeId) {
            if (!nodeVisibility[currentNodeId]) {
                console.log('[TableHeader] Узел невидим:', currentNodeId);
                return false;
            }
            const node = treeStructure.nodesMap?.get(currentNodeId);
            if (!node) {
                console.log('[TableHeader] Узел не найден в nodesMap:', currentNodeId);
                return false;
            }
            currentNodeId = node.parentId;
        }
        return true;
    }, [nodeVisibility, treeStructure.nodesMap]);

    // Функция расчета colspan
    const calculateColspan = useCallback((node) => {
        if (!node) {
            console.log('[TableHeader] calculateColspan: node не определен');
            return 0;
        }

        if (!node.children || node.children.length === 0) {
            const isVisible = isNodeFullyVisible(node.id);
            console.log(`[TableHeader] Листовой узел "${node.name}": видимость=${isVisible}`);
            return isVisible ? 1 : 0;
        }

        const colspan = node.children.reduce((sum, child) => sum + calculateColspan(child), 0);
        console.log(`[TableHeader] Узел "${node.name}": colspan=${colspan}`);
        return colspan;
    }, [isNodeFullyVisible]);

    // Фильтрация видимых узлов для заголовка
    const filterVisibleNodes = useCallback((nodes) => {
        if (!Array.isArray(nodes)) {
            console.log('[TableHeader] filterVisibleNodes: nodes не является массивом:', nodes);
            return [];
        }

        const filtered = nodes.filter(node => {
            if (isNodeFullyVisible(node.id)) {
                console.log(`[TableHeader] Узел "${node.name}" полностью видим`);
                return true;
            }

            const hasVisibleDescendants = (n) => {
                if (!n.children || n.children.length === 0) return false;
                return n.children.some(child =>
                    isNodeFullyVisible(child.id) || hasVisibleDescendants(child)
                );
            };

            const hasVisible = hasVisibleDescendants(node);
            console.log(`[TableHeader] Узел "${node.name}" имеет видимых потомков: ${hasVisible}`);
            return hasVisible;
        }).map(node => ({
            ...node,
            children: filterVisibleNodes(node.children || [])
        }));

        console.log(`[TableHeader] Отфильтровано узлов: ${filtered.length} из ${nodes.length}`);
        return filtered;
    }, [isNodeFullyVisible]);

    // Рендер строк заголовка с отладкой
    const renderHeaderRows = useCallback(() => {
        console.log('[TableHeader] Начинаем рендер заголовков...');
        console.log('[TableHeader] treeStructure.tree:', treeStructure?.tree);

        if (!treeStructure || !treeStructure.tree || !Array.isArray(treeStructure.tree)) {
            console.error('[TableHeader] treeStructure.tree недоступен или не является массивом');
            return [];
        }

        const rows = [];
        const visibleTree = filterVisibleNodes(treeStructure.tree);

        console.log('[TableHeader] Видимое дерево:', visibleTree);
        console.log('[TableHeader] Максимальная глубина:', treeStructure.maxDepth);

        let currentLevelNodes = visibleTree;
        let depth = 1;

        while (currentLevelNodes.length > 0 && depth <= treeStructure.maxDepth) {
            console.log(`[TableHeader] Обрабатываем уровень ${depth}, узлов: ${currentLevelNodes.length}`);

            const currentDepth = depth;
            const rowCells = [];

            // Ячейка "Дата" - отображается только в первой строке
            if (currentDepth === 1) {
                console.log('[TableHeader] Добавляем ячейку "Дата"');
                rowCells.push(
                    <th
                        key="date-header"
                        rowSpan={treeStructure.maxDepth}
                        style={{
                            padding: '8px',
                            minWidth: '100px',
                            borderRight: '1px solid #ddd',
                            fontSize: '14px',
                            fontWeight: 'normal',
                            whiteSpace: 'nowrap',
                            color: getContrastTextColor(activeColorTheme("BGHeader")),
                            backgroundColor: activeColorTheme("BGHeader")
                        }}
                    >
                        Дата
                    </th>
                );
            }

            // Ячейки для узлов дерева
            currentLevelNodes.forEach(node => {
                const colspan = calculateColspan(node);
                console.log(`[TableHeader] Узел "${node.name}": colspan=${colspan}`);

                if (colspan === 0) {
                    console.log(`[TableHeader] Пропускаем узел "${node.name}" (colspan=0)`);
                    return;
                }

                const isVisible = isNodeFullyVisible(node.id);
                const backgroundColor = isVisible && node.metadata?.color ? node.metadata.color : '#ccc';
                const rowSpan = (!node.children || node.children.length === 0) ?
                    treeStructure.maxDepth - currentDepth + 1 : 1;

                console.log(`[TableHeader] Добавляем ячейку "${node.name}": colspan=${colspan}, rowSpan=${rowSpan}, bg=${backgroundColor}`);

                rowCells.push(
                    <th
                        key={node.id}
                        colSpan={colspan}
                        rowSpan={rowSpan}
                        style={{
                            backgroundColor: backgroundColor,
                            padding: '8px',
                            fontSize: '12px',
                            fontWeight: 'normal',
                            textAlign: 'center',
                            color: getContrastTextColor(backgroundColor),
                            opacity: isVisible ? 1 : 0.5,
                            border: '1px solid #ddd'
                        }}
                    >
                        {node.name}
                    </th>
                );
            });

            console.log(`[TableHeader] Строка ${depth} содержит ${rowCells.length} ячеек`);

            rows.push(
                <tr key={`header-row-${currentDepth}`}>
                    {rowCells}
                </tr>
            );

            // Переходим к следующему уровню
            const nextLevelNodes = [];
            currentLevelNodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    nextLevelNodes.push(...node.children);
                }
            });

            currentLevelNodes = filterVisibleNodes(nextLevelNodes);
            depth++;

            console.log(`[TableHeader] Следующий уровень: ${nextLevelNodes.length} узлов, после фильтрации: ${currentLevelNodes.length}`);
        }

        console.log(`[TableHeader] Сгенерировано ${rows.length} строк заголовка`);
        return rows;
    }, [treeStructure, filterVisibleNodes, calculateColspan, isNodeFullyVisible, activeColorTheme]);

    const headerRows = renderHeaderRows();

    console.log('[TableHeader] Финальный рендер, строк:', headerRows.length);

    return (
        <thead style={{
            position: 'sticky',
            top: 0,
            backgroundColor: activeColorTheme("BGHeader"),
            zIndex: 10
        }}>
        {headerRows}
        </thead>
    );
};
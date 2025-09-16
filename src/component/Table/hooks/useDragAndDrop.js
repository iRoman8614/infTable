import { useState, useCallback } from 'react';

/**
 * Хук для управления drag & drop функциональностью в таблице
 */
export const useDragAndDrop = (editMode, onCellMove) => {
    const [draggedData, setDraggedData] = useState(null);
    const [dragOverCell, setDragOverCell] = useState(null);

    const handleDragStart = useCallback((e, date, nodeId, cellValue) => {
        if (!editMode) {
            e.preventDefault();
            return;
        }

        const dragData = { date, nodeId, cellValue };
        setDraggedData(dragData);

        e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.5';

    }, [editMode]);

    const handleDragEnd = useCallback((e) => {
        e.target.style.opacity = '1';
        setDraggedData(null);
        setDragOverCell(null);
    }, []);

    const handleDragOver = useCallback((e, targetDate, targetNodeId) => {
        if (!editMode || !draggedData) return;

        // Разрешаем drop только в пределах того же столбца
        if (draggedData.nodeId !== targetNodeId || draggedData.date === targetDate) return;

        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        setDragOverCell({ date: targetDate, nodeId: targetNodeId });
    }, [editMode, draggedData]);

    const handleDragLeave = useCallback((e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOverCell(null);
        }
    }, []);

    const handleDrop = useCallback((e, targetDate, targetNodeId) => {
        e.preventDefault();

        if (!editMode || !draggedData) return;

        if (draggedData.nodeId !== targetNodeId || draggedData.date === targetDate) {
            console.warn('[DragDrop] Некорректная попытка drop');
            return;
        }

        const moveData = {
            source: { date: draggedData.date, nodeId: draggedData.nodeId },
            target: { date: targetDate, nodeId: targetNodeId },
        };

        console.log('[DragDrop] Перемещение:', JSON.stringify(moveData));

        // Локальный callback
        if (onCellMove) {
            onCellMove(moveData);
        }

        // Глобальный обработчик
        if (typeof window !== 'undefined' && window.onTableCellMove) {
            const jsonString = JSON.stringify(moveData);

            if (window.onTableCellMove.constructor.name === 'AsyncFunction') {
                window.onTableCellMove(jsonString).catch(error => {
                    console.error('[DragDrop] Ошибка в глобальном обработчике:', error);
                });
            } else {
                try {
                    window.onTableCellMove(jsonString);
                } catch (error) {
                    console.error('[DragDrop] Ошибка в глобальном обработчике:', error);
                }
            }
        }

        setDraggedData(null);
        setDragOverCell(null);
    }, [editMode, draggedData, onCellMove]);

    const isDragOver = useCallback((date, nodeId) => {
        return dragOverCell &&
            dragOverCell.date === date &&
            dragOverCell.nodeId === nodeId;
    }, [dragOverCell]);

    const isDragSource = useCallback((date, nodeId) => {
        return draggedData &&
            draggedData.date === date &&
            draggedData.nodeId === nodeId;
    }, [draggedData]);

    const canDropHere = useCallback((date, nodeId) => {
        if (!editMode || !draggedData) return false;

        return draggedData.nodeId === nodeId &&
            draggedData.date !== date;
    }, [editMode, draggedData]);

    const getCellDragStyles = useCallback((date, nodeId, defaultColor) => {
        const isSource = isDragSource(date, nodeId);
        const isOver = isDragOver(date, nodeId);
        const canDrop = canDropHere(date, nodeId);

        return {
            backgroundColor: isOver && canDrop
                ? '#e3f2fd'
                : isSource
                    ? '#fff3e0'
                    : defaultColor,
            border: isOver && canDrop ? '2px dashed #2196f3' : undefined,
            cursor: editMode
                ? (canDrop ? 'move' : 'grab')
                : undefined,
            transition: 'background-color 0.2s, border 0.2s'
        };
    }, [editMode, isDragSource, isDragOver, canDropHere]);

    const resetDragState = useCallback(() => {
        setDraggedData(null);
        setDragOverCell(null);
    }, []);

    return {
        draggedData,
        dragOverCell,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        isDragOver,
        isDragSource,
        canDropHere,
        getCellDragStyles,
        resetDragState
    };
};
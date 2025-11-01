import { useCallback, useRef, useEffect } from 'react';

/**
 * Хук для управления блокировкой ячеек
 */
export const useCellLocking = (lockMode, refreshViewport) => {
    const isMouseDown = useRef(false);
    const mouseButton = useRef(null);
    const currentBatch = useRef([]);

    // Сброс состояния при отключении lockMode
    useEffect(() => {
        if (!lockMode) {
            isMouseDown.current = false;
            mouseButton.current = null;
            currentBatch.current = [];

            document.documentElement.classList.remove('lock-cursor', 'unlock-cursor');
        }
    }, [lockMode]);

    // Глобальный обработчик mouseup для завершения операции
    useEffect(() => {
        if (!lockMode) return;

        const handleGlobalMouseUp = async () => {
            if (isMouseDown.current && currentBatch.current.length > 0) {
                await sendLockBatch();
            }

            isMouseDown.current = false;
            mouseButton.current = null;
            currentBatch.current = [];

            document.documentElement.classList.remove('lock-cursor', 'unlock-cursor');
        };

        const handleContextMenu = (e) => {
            if (lockMode) {
                e.preventDefault();
            }
        };

        document.addEventListener('mouseup', handleGlobalMouseUp);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [lockMode, refreshViewport]);

    const sendLockBatch = useCallback(async () => {
        if (currentBatch.current.length === 0) return;

        const lockData = {
            cells: [...currentBatch.current],
            button: mouseButton.current,
            state: mouseButton.current === 0 ? 'true' : 'false'
        };

        const jsonString = JSON.stringify(lockData);

        console.log('[useCellLocking] Отправка batch блокировки:', lockData);

        // // 1. Вызываем проп-обработчик (если есть)
        // if (onCellLock) {
        //     try {
        //         await onCellLock(lockData);
        //     } catch (error) {
        //         console.error('[useCellLocking] Ошибка при вызове onCellLock:', error);
        //     }
        // }

        // 2. Проверяем наличие lockProvider
        const lockProvider = typeof window !== 'undefined' && window.VirtualizedTableState?.lockProvider
            ? window.VirtualizedTableState.lockProvider
            : null;

        if (lockProvider) {
            try {
                console.log('[useCellLocking] Вызываем lockProvider');

                // Вызываем провайдер (может быть async)
                if (lockProvider.constructor.name === 'AsyncFunction') {
                    await lockProvider(jsonString);
                } else {
                    lockProvider(jsonString);
                }

            } catch (error) {
                console.error('[useCellLocking] Ошибка в lockProvider:', error);
            }
        }
        // 3. Если нет lockProvider, вызываем старый onCellLock handler
        // else if (typeof window !== 'undefined' && window.VirtualizedTableState?.onCellLock) {
        //     try {
        //         console.log('[useCellLocking] Вызываем глобальный onCellLock handler');
        //         window.VirtualizedTableState.onCellLock(jsonString);
        //     } catch (error) {
        //         console.error('[useCellLocking] Ошибка в VirtualizedTableState.onCellLock:', error);
        //     }
        // }

        // 4. Диспатчим кастомное событие
        const customEvent = new CustomEvent('table-cell-lock', {
            detail: lockData,
            bubbles: true
        });
        window.dispatchEvent(customEvent);

        currentBatch.current = [];
    }, [refreshViewport]);

    const handleMouseDown = useCallback((e, date, nodeId, isLocked) => {
        if (!lockMode) return;

        e.preventDefault();
        e.stopPropagation();

        isMouseDown.current = true;
        mouseButton.current = e.button;
        currentBatch.current = [];

        if (e.button === 0) {
            document.documentElement.classList.add('lock-cursor');
            document.documentElement.classList.remove('unlock-cursor');
        } else if (e.button === 2) {
            document.documentElement.classList.add('unlock-cursor');
            document.documentElement.classList.remove('lock-cursor');
        }

        const action = e.button === 0 ? 'lock' : 'unlock';

        currentBatch.current.push({
            date,
            nodeId,
            state
        });

        console.log('[useCellLocking] MouseDown на ячейке:', { date, nodeId, state });
    }, [lockMode]);

    const handleMouseOver = useCallback((date, nodeId, isLocked) => {
        if (!lockMode || !isMouseDown.current) return;

        const state = mouseButton.current === 0 ? 'true' : 'false';

        const alreadyInBatch = currentBatch.current.some(
            cell => cell.date === date && cell.nodeId === nodeId
        );

        if (!alreadyInBatch) {
            currentBatch.current.push({
                date,
                nodeId,
                state
            });

            console.log('[useCellLocking] MouseOver на ячейке:', { date, nodeId, state });
        }
    }, [lockMode]);

    // ← ИЗМЕНЕНО: Теперь возвращает классы независимо от lockMode
    const getCellLockClass = useCallback((isLocked, isInLockMode) => {
        const classes = [];

        // Класс pinned-cell показывает иконку замка ВСЕГДА, если ячейка заблокирована
        if (isLocked) {
            classes.push('pinned-cell');
        }

        // Класс may-be-locked добавляется ТОЛЬКО в режиме блокировки
        if (isInLockMode) {
            classes.push('may-be-locked');
        }

        return classes.join(' ');
    }, []);

    return {
        handleMouseDown,
        handleMouseOver,
        getCellLockClass,
        isLockMode: lockMode
    };
};
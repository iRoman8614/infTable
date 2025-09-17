// import { useState, useEffect, useRef, useCallback } from 'react';
//
// /**
//  * Хук для управления загрузкой заголовков с мемоизацией
//  */
// export const useHeadersLoader = (headerProvider) => {
//     const [headersData, setHeadersData] = useState();
//     const [headersError, setHeadersError] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const loadedRef = useRef(false);
//     const lastProviderRef = useRef(null);
//
//     const loadHeaders = useCallback(async () => {
//         if (loadedRef.current && lastProviderRef.current === headerProvider) {
//             return;
//         }
//
//         setIsLoading(true);
//         setHeadersError(null);
//
//         try {
//             let structure = null;
//
//             if (headerProvider && typeof headerProvider === 'function') {
//
//                 if (headerProvider.constructor.name === 'AsyncFunction') {
//                     structure = await headerProvider();
//                 } else {
//                     structure = headerProvider();
//                 }
//
//                 if (structure && structure.headers && Array.isArray(structure.headers)) {
//                     setHeadersData(structure);
//                     loadedRef.current = true;
//                     lastProviderRef.current = headerProvider;
//                     return;
//                 }
//             }
//
//             if (!headerProvider && typeof window !== 'undefined') {
//                 if (window.HeadersProvider && typeof window.HeadersProvider === 'function') {
//                     if (window.HeadersProvider.constructor.name === 'AsyncFunction') {
//                         structure = await window.HeadersProvider();
//                     } else {
//                         structure = window.HeadersProvider();
//                     }
//
//                     if (structure && structure.headers && Array.isArray(structure.headers)) {
//                         setHeadersData(structure);
//                         loadedRef.current = true;
//                         lastProviderRef.current = null;
//                         return;
//                     }
//                 }
//
//                 if (window.hp && typeof window.hp === 'function') {
//                     if (window.hp.constructor.name === 'AsyncFunction') {
//                         structure = await window.hp();
//                     } else {
//                         structure = window.hp();
//                     }
//
//                     if (structure && structure.headers && Array.isArray(structure.headers)) {
//                         setHeadersData(structure);
//                         loadedRef.current = true;
//                         lastProviderRef.current = null;
//                         return;
//                     }
//                 }
//             }
//
//             setHeadersData();
//             loadedRef.current = true;
//             lastProviderRef.current = headerProvider;
//
//         } catch (error) {
//             console.error('[HeadersLoader] Ошибка при загрузке заголовков:', error);
//             setHeadersError(error.message);
//             setHeadersData();
//             loadedRef.current = false;
//         } finally {
//             setIsLoading(false);
//         }
//     }, [headerProvider]);
//
//     useEffect(() => {
//         if (!loadedRef.current || lastProviderRef.current !== headerProvider) {
//             loadHeaders();
//         }
//     }, [loadHeaders]);
//
//     const reloadHeaders = useCallback(() => {
//         loadedRef.current = false;
//         lastProviderRef.current = null;
//         loadHeaders();
//     }, [loadHeaders]);
//
//     return {
//         headersData,
//         headersError,
//         isLoading,
//         reloadHeaders
//     };
// };
//
// /**
//  * Хук для отслеживания доступности глобальных обработчиков
//  */
// export const useGlobalClickHandlers = () => {
//     const [hasGlobalHandlers, setHasGlobalHandlers] = useState(false);
//
//     useEffect(() => {
//         const checkHandlers = () => {
//             const hasWindowHandler = typeof window !== 'undefined' &&
//                 typeof window.onTableCellClick === 'function';
//             setHasGlobalHandlers(hasWindowHandler);
//         };
//
//         checkHandlers();
//         const interval = setInterval(checkHandlers, 500);
//
//         const handleWindowChange = () => {
//             setTimeout(checkHandlers, 100);
//         };
//
//         if (typeof window !== 'undefined') {
//             window.addEventListener('load', handleWindowChange);
//             document.addEventListener('DOMContentLoaded', handleWindowChange);
//
//             return () => {
//                 clearInterval(interval);
//                 window.removeEventListener('load', handleWindowChange);
//                 document.removeEventListener('DOMContentLoaded', handleWindowChange);
//             };
//         }
//
//         return () => clearInterval(interval);
//     }, []);
//
//     return hasGlobalHandlers;
// };

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Проверка корректности структуры заголовков
 */
const validateHeadersData = (data) => {
    if (!data) return false;
    if (!data.headers) return false;
    if (!Array.isArray(data.headers)) return false;
    if (data.headers.length === 0) return false;

    return data.headers.every(header =>
        header.id &&
        typeof header.name === 'string' &&
        (header.parentId === null || header.parentId === undefined || typeof header.parentId === 'string')
    );
};

/**
 * Хук для управления загрузкой заголовков
 */
export const useHeadersLoader = (headerProvider) => {
    const [headersData, setHeadersData] = useState(null);
    const [headersError, setHeadersError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const loadedRef = useRef(false);
    const lastProviderRef = useRef(null);
    const retryCountRef = useRef(0);
    const maxRetries = 5;
    const retryDelay = 1000;

    const loadHeaders = useCallback(async () => {
        if (loadedRef.current && lastProviderRef.current === headerProvider) {
            return;
        }

        setIsLoading(true);
        setHeadersError(null);
        retryCountRef.current = 0;

        const attemptLoad = async () => {
            try {
                let structure = null;
                let source = 'unknown';

                if (headerProvider && typeof headerProvider === 'function') {
                    source = 'props';
                    if (headerProvider.constructor.name === 'AsyncFunction') {
                        structure = await headerProvider();
                    } else {
                        structure = headerProvider();
                    }

                    if (validateHeadersData(structure)) {
                        console.log(`[HeadersLoader] Заголовки успешно загружены из ${source}:`, structure);
                        setHeadersData(structure);
                        loadedRef.current = true;
                        lastProviderRef.current = headerProvider;
                        setIsLoading(false);
                        return;
                    }
                }

                if (typeof window !== 'undefined') {
                    const globalProviders = [
                        { name: 'HeadersProvider', fn: window.HeadersProvider },
                        { name: 'hp', fn: window.hp }
                    ];

                    for (const provider of globalProviders) {
                        if (provider.fn && typeof provider.fn === 'function') {
                            try {
                                source = `window.${provider.name}`;
                                console.log(`[HeadersLoader] Пробуем загрузить заголовки из ${source}`);

                                if (provider.fn.constructor.name === 'AsyncFunction') {
                                    structure = await provider.fn();
                                } else {
                                    structure = provider.fn();
                                }

                                if (validateHeadersData(structure)) {
                                    console.log(`[HeadersLoader] Заголовки успешно загружены из ${source}:`, structure);
                                    setHeadersData(structure);
                                    loadedRef.current = true;
                                    lastProviderRef.current = null;
                                    setIsLoading(false);
                                    return;
                                }
                                console.warn(`[HeadersLoader] ${source} вернул некорректные данные:`, structure);
                            } catch (providerError) {
                                console.error(`[HeadersLoader] Ошибка в ${source}:`, providerError);
                            }
                        }
                    }
                }

                if (retryCountRef.current < maxRetries) {
                    retryCountRef.current++;
                    console.log(`[HeadersLoader] Попытка ${retryCountRef.current}/${maxRetries} через ${retryDelay}мс`);

                    setTimeout(() => {
                        attemptLoad();
                    }, retryDelay * retryCountRef.current);
                    return;
                }
                loadedRef.current = true;
                lastProviderRef.current = headerProvider;
                setIsLoading(false);

            } catch (error) {
                console.error('[HeadersLoader] Критическая ошибка при загрузке заголовков:', error);

                if (retryCountRef.current < maxRetries) {
                    retryCountRef.current++;
                    console.log(`[HeadersLoader] Повтор после ошибки ${retryCountRef.current}/${maxRetries} через ${retryDelay}мс`);

                    setTimeout(() => {
                        attemptLoad();
                    }, retryDelay * retryCountRef.current);
                    return;
                }
                loadedRef.current = false;
                setIsLoading(false);
            }
        };

        await attemptLoad();
    }, [headerProvider]);

    useEffect(() => {
        if (!loadedRef.current || lastProviderRef.current !== headerProvider) {
            loadHeaders();
        }
    }, [loadHeaders]);

    // Периодическая проверка доступности провайдеров
    useEffect(() => {
        if (!loadedRef.current && typeof window !== 'undefined') {
            const checkInterval = setInterval(() => {
                const hasGlobalProvider = (window.HeadersProvider && typeof window.HeadersProvider === 'function') ||
                    (window.hp && typeof window.hp === 'function');

                if (hasGlobalProvider) {
                    console.log('[HeadersLoader] Обнаружен глобальный провайдер заголовков, попытка загрузки...');
                    loadHeaders();
                }
            }, 2000);

            return () => clearInterval(checkInterval);
        }
    }, [loadHeaders, loadedRef.current]);

    const reloadHeaders = useCallback(() => {
        loadedRef.current = false;
        lastProviderRef.current = null;
        retryCountRef.current = 0;
        setHeadersData(null);
        setHeadersError(null);
        loadHeaders();
    }, [loadHeaders]);

    return {
        headersData,
        headersError,
        isLoading,
        reloadHeaders
    };
};

/**
 * Хук для отслеживания доступности глобальных обработчиков с улучшенной диагностикой
 */
export const useGlobalClickHandlers = () => {
    const [hasGlobalHandlers, setHasGlobalHandlers] = useState(false);

    useEffect(() => {
        const checkHandlers = () => {
            const hasWindowHandler = typeof window !== 'undefined' &&
                typeof window.onTableCellClick === 'function';

            const hasEventHandler = typeof window !== 'undefined' &&
                typeof window.addEventListener === 'function';

            const newHasGlobalHandlers = hasWindowHandler || hasEventHandler;

            if (newHasGlobalHandlers !== hasGlobalHandlers) {
                console.log('[GlobalClickHandlers] Статус обработчиков изменен:', {
                    onTableCellClick: hasWindowHandler,
                    eventListener: hasEventHandler,
                    overall: newHasGlobalHandlers
                });
                setHasGlobalHandlers(newHasGlobalHandlers);
            }
        };

        checkHandlers();

        const intervals = [
            setTimeout(() => checkHandlers(), 100),
            setTimeout(() => checkHandlers(), 500),
            setTimeout(() => checkHandlers(), 1000),
            setTimeout(() => checkHandlers(), 2000)
        ];

        const regularInterval = setInterval(checkHandlers, 5000);

        const handleWindowChange = () => {
            setTimeout(checkHandlers, 100);
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('load', handleWindowChange);
            document.addEventListener('DOMContentLoaded', handleWindowChange);

            const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'onTableCellClick');

            Object.defineProperty(window, '_onTableCellClick', {
                value: window.onTableCellClick,
                writable: true,
                configurable: true
            });

            Object.defineProperty(window, 'onTableCellClick', {
                get() {
                    return this._onTableCellClick;
                },
                set(value) {
                    this._onTableCellClick = value;
                    checkHandlers();
                },
                configurable: true
            });

            return () => {
                intervals.forEach(clearTimeout);
                clearInterval(regularInterval);
                window.removeEventListener('load', handleWindowChange);
                document.removeEventListener('DOMContentLoaded', handleWindowChange);

                // Восстанавливаем оригинальный дескриптор
                if (originalDescriptor) {
                    Object.defineProperty(window, 'onTableCellClick', originalDescriptor);
                } else {
                    delete window.onTableCellClick;
                    if (window._onTableCellClick) {
                        window.onTableCellClick = window._onTableCellClick;
                    }
                }
                delete window._onTableCellClick;
            };
        }

        return () => {
            intervals.forEach(clearTimeout);
            clearInterval(regularInterval);
        };
    }, [hasGlobalHandlers]);

    return hasGlobalHandlers;
};
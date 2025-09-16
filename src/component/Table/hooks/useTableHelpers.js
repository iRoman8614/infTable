import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Хук для управления загрузкой заголовков с мемоизацией
 */
export const useHeadersLoader = (headerProvider) => {
    const [headersData, setHeadersData] = useState();
    const [headersError, setHeadersError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const loadedRef = useRef(false);
    const lastProviderRef = useRef(null);

    const loadHeaders = useCallback(async () => {
        if (loadedRef.current && lastProviderRef.current === headerProvider) {
            return;
        }

        setIsLoading(true);
        setHeadersError(null);

        try {
            let structure = null;

            if (headerProvider && typeof headerProvider === 'function') {

                if (headerProvider.constructor.name === 'AsyncFunction') {
                    structure = await headerProvider();
                } else {
                    structure = headerProvider();
                }

                if (structure && structure.headers && Array.isArray(structure.headers)) {
                    setHeadersData(structure);
                    loadedRef.current = true;
                    lastProviderRef.current = headerProvider;
                    return;
                }
            }

            if (!headerProvider && typeof window !== 'undefined') {
                if (window.HeadersProvider && typeof window.HeadersProvider === 'function') {
                    if (window.HeadersProvider.constructor.name === 'AsyncFunction') {
                        structure = await window.HeadersProvider();
                    } else {
                        structure = window.HeadersProvider();
                    }

                    if (structure && structure.headers && Array.isArray(structure.headers)) {
                        setHeadersData(structure);
                        loadedRef.current = true;
                        lastProviderRef.current = null;
                        return;
                    }
                }

                if (window.hp && typeof window.hp === 'function') {
                    if (window.hp.constructor.name === 'AsyncFunction') {
                        structure = await window.hp();
                    } else {
                        structure = window.hp();
                    }

                    if (structure && structure.headers && Array.isArray(structure.headers)) {
                        setHeadersData(structure);
                        loadedRef.current = true;
                        lastProviderRef.current = null;
                        return;
                    }
                }
            }

            setHeadersData();
            loadedRef.current = true;
            lastProviderRef.current = headerProvider;

        } catch (error) {
            console.error('[HeadersLoader] Ошибка при загрузке заголовков:', error);
            setHeadersError(error.message);
            setHeadersData();
            loadedRef.current = false;
        } finally {
            setIsLoading(false);
        }
    }, [headerProvider]);

    useEffect(() => {
        if (!loadedRef.current || lastProviderRef.current !== headerProvider) {
            loadHeaders();
        }
    }, [loadHeaders]);

    const reloadHeaders = useCallback(() => {
        loadedRef.current = false;
        lastProviderRef.current = null;
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
 * Хук для отслеживания доступности глобальных обработчиков
 */
export const useGlobalClickHandlers = () => {
    const [hasGlobalHandlers, setHasGlobalHandlers] = useState(false);

    useEffect(() => {
        const checkHandlers = () => {
            const hasWindowHandler = typeof window !== 'undefined' &&
                typeof window.onTableCellClick === 'function';
            setHasGlobalHandlers(hasWindowHandler);
        };

        checkHandlers();
        const interval = setInterval(checkHandlers, 500);

        const handleWindowChange = () => {
            setTimeout(checkHandlers, 100);
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('load', handleWindowChange);
            document.addEventListener('DOMContentLoaded', handleWindowChange);

            return () => {
                clearInterval(interval);
                window.removeEventListener('load', handleWindowChange);
                document.removeEventListener('DOMContentLoaded', handleWindowChange);
            };
        }

        return () => clearInterval(interval);
    }, []);

    return hasGlobalHandlers;
};
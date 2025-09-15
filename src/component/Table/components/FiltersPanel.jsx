import React, { useCallback, useMemo } from 'react';

/**
 * Оптимизированный компонент панели фильтров
 */
export const FiltersPanel = React.memo(({
                                            filteredTree,
                                            nodeVisibility,
                                            expandedNodes,
                                            searchTerm,
                                            setSearchTerm,
                                            setShowFilters,
                                            toggleNodeVisibility,
                                            toggleNodeExpansion
                                        }) => {
    // Мемоизированный компонент узла
    const NodeComponent = React.memo(({ node, level = 0 }) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(node.id);
        const isVisible = nodeVisibility[node.id];

        // Безопасное получение метаданных
        const metadata = node.metadata || {};
        const nodeColor = metadata.color || '#ccc';
        const workCount = metadata.workCount;

        // Мемоизированные обработчики
        const handleVisibilityToggle = useCallback(() => {
            toggleNodeVisibility(node.id);
        }, [node.id]);

        const handleExpansionToggle = useCallback(() => {
            toggleNodeExpansion(node.id);
        }, [node.id]);

        // Мемоизированные стили
        const containerStyle = useMemo(() => ({
            display: 'grid',
            gridTemplateColumns: '120px auto 150px',
            padding: '8px 16px',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: level % 2 === 0 ? 'white' : '#fafafa',
            marginLeft: `${level * 20}px`
        }), [level]);

        const visibilityButtonStyle = useMemo(() => ({
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: isVisible ? '#007bff' : '#ccc'
        }), [isVisible]);

        const expansionButtonStyle = useMemo(() => ({
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: '#666'
        }), []);

        const arrowStyle = useMemo(() => ({
            fontSize: '12px',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            display: 'inline-block'
        }), [isExpanded]);

        const colorIndicatorStyle = useMemo(() => ({
            width: '12px',
            height: '12px',
            backgroundColor: nodeColor,
            borderRadius: '2px',
            border: '1px solid #ddd'
        }), [nodeColor]);

        const nameStyle = useMemo(() => ({
            fontSize: '14px',
            fontWeight: level === 0 ? '500' : 'normal',
            opacity: isVisible ? 1 : 0.5
        }), [level, isVisible]);

        return (
            <div key={node.id}>
                <div style={containerStyle}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            onClick={handleVisibilityToggle}
                            style={visibilityButtonStyle}
                            type="button"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {hasChildren && (
                            <button
                                onClick={handleExpansionToggle}
                                style={expansionButtonStyle}
                                type="button"
                            >
                                <span style={arrowStyle}>
                                    ▶
                                </span>
                            </button>
                        )}
                        <div style={colorIndicatorStyle} />
                        <span style={nameStyle}>
                            {node.name || 'Без названия'}
                        </span>
                        {workCount && (
                            <span style={{
                                fontSize: '12px',
                                color: '#666',
                                marginLeft: '8px'
                            }}>
                                ({workCount})
                            </span>
                        )}
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div>
                        {node.children.map(child => (
                            <NodeComponent
                                key={child.id}
                                node={child}
                                level={level + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    });

    // Мемоизированные обработчики
    const handleSearchChange = useCallback((e) => {
        if (setSearchTerm) {
            setSearchTerm(e.target.value);
        }
    }, [setSearchTerm]);

    const handleClose = useCallback(() => {
        if (setShowFilters) {
            setShowFilters(false);
        }
    }, [setShowFilters]);

    // Мемоизированные стили
    const containerStyle = useMemo(() => ({
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '16px',
        backgroundColor: 'white',
        fontFamily: 'Arial, sans-serif'
    }), []);

    const headerStyle = useMemo(() => ({
        padding: '12px 16px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }), []);

    const searchInputStyle = useMemo(() => ({
        padding: '6px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#f5f5f5',
        fontSize: '14px',
        width: '300px'
    }), []);

    const closeButtonStyle = useMemo(() => ({
        background: 'none',
        border: 'none',
        fontSize: '18px',
        cursor: 'pointer',
        color: '#666',
        padding: '4px'
    }), []);

    const contentStyle = useMemo(() => ({
        maxHeight: '400px',
        overflowY: 'auto'
    }), []);

    // Безопасная проверка filteredTree
    if (!filteredTree || !Array.isArray(filteredTree)) {
        return (
            <div style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '16px',
                backgroundColor: 'white',
                padding: '20px',
                textAlign: 'center',
                color: '#666'
            }}>
                Нет данных для фильтрации
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: '500', color: '#666' }}>Найти по названию</span>
                    <input
                        type="text"
                        placeholder="Поиск узлов..."
                        value={searchTerm || ''}
                        onChange={handleSearchChange}
                        style={searchInputStyle}
                    />
                </div>
                <button
                    onClick={handleClose}
                    style={closeButtonStyle}
                    type="button"
                >
                    ✕
                </button>
            </div>

            <div style={contentStyle}>
                {filteredTree.map(node => (
                    <NodeComponent
                        key={node.id}
                        node={node}
                        level={0}
                    />
                ))}
            </div>
        </div>
    );
});
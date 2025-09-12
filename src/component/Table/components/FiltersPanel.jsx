import React from 'react';

/**
 * Компонент панели фильтров
 */
export const FiltersPanel = ({
                                 filteredTree,
                                 nodeVisibility,
                                 expandedNodes,
                                 searchTerm,
                                 setSearchTerm,
                                 setShowFilters,
                                 toggleNodeVisibility,
                                 toggleNodeExpansion
                             }) => {
    const renderNode = (node, level = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(node.id);
        const isVisible = nodeVisibility[node.id];

        return (
            <div key={node.id}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '120px auto 150px',
                    padding: '8px 16px',
                    alignItems: 'center',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: level % 2 === 0 ? 'white' : '#fafafa',
                    marginLeft: `${level * 20}px`
                }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            onClick={() => toggleNodeVisibility(node.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                color: isVisible ? '#007bff' : '#ccc'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {hasChildren && (
                            <button
                                onClick={() => toggleNodeExpansion(node.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    color: '#666'
                                }}
                            >
                                <span style={{
                                    fontSize: '12px',
                                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease',
                                    display: 'inline-block'
                                }}>
                                    ▶
                                </span>
                            </button>
                        )}
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: node.metadata.color,
                                borderRadius: '2px',
                                border: '1px solid #ddd'
                            }}
                        />
                        <span style={{
                            fontSize: '14px',
                            fontWeight: level === 0 ? '500' : 'normal',
                            opacity: isVisible ? 1 : 0.5
                        }}>
                            {node.name}
                        </span>
                        {node.metadata.workCount && (
                            <span style={{
                                fontSize: '12px',
                                color: '#666',
                                marginLeft: '8px'
                            }}>
                                ({node.metadata.workCount})
                            </span>
                        )}
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div>
                        {node.children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginBottom: '16px',
            backgroundColor: 'white',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: '500', color: '#666' }}>Найти по названию</span>
                    <input
                        type="text"
                        placeholder="Поиск узлов..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '6px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: '#f5f5f5',
                            fontSize: '14px',
                            width: '300px'
                        }}
                    />
                </div>
                <button
                    onClick={() => setShowFilters(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                        color: '#666',
                        padding: '4px'
                    }}
                >
                    ✕
                </button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredTree.map(node => renderNode(node))}
            </div>
        </div>
    );
};
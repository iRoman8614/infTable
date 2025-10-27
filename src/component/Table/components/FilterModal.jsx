import React, { useCallback } from 'react';
import '../../../styles/table.css';
import { FiltersPanel } from './FiltersPanel.jsx';

export const FilterModal = React.memo(({
    isOpen,
    onClose,
    filteredTree,
    nodeVisibility,
    expandedNodes,
    searchTerm,
    setSearchTerm,
    toggleNodeVisibility,
    toggleNodeExpansion,
    childrenVisibility,
    toggleChildrenVisibility
}) => {
    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget && onClose) onClose();
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="vt-modal-backdrop" onClick={handleBackdropClick}>
            <div className="vt-modal">
                <div className="vt-modal__header">
                    <div className="vt-modal__title">Фильтры</div>
                    <button type="button" className="vt-modal__close" onClick={onClose}>✕</button>
                </div>
                <div className="vt-modal__content">
                    <FiltersPanel
                        filteredTree={filteredTree}
                        nodeVisibility={nodeVisibility}
                        expandedNodes={expandedNodes}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        setShowFilters={onClose}
                        toggleNodeVisibility={toggleNodeVisibility}
                        toggleNodeExpansion={toggleNodeExpansion}
                        childrenVisibility={childrenVisibility}
                        toggleChildrenVisibility={toggleChildrenVisibility}
                    />
                </div>
            </div>
        </div>
    );
});

export default FilterModal;



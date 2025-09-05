import React, { useCallback } from 'react';
import r2wc from '@r2wc/react-to-web-component';
import { Table } from './table';

const TableWrapper = ({ maxWidth, maxHeight, scrollBatchSize, debug, colorThemeName }) => {
    const colorTheme = useCallback((value, isPast) => {
        if (value === "BGHeader") return '#dee3f5';
        if (value === "DATE") return isPast ? '#acb5e3' : '#white';

        switch (value) {
            case 'М': return '#cdef8d';
            case 'О': return '#ffce42';
            case 'П': return '#86cb89';
            case 'ПР': return '#4a86e8';
            case 'Р': return 'white';
            case 0: return isPast ? '#acb5e3' : 'white';
            default: return isPast ? '#acb5e3' : 'white';
        }
    }, [colorThemeName]);

    return (
        <Table
            maxWidth={maxWidth}
            maxHeight={maxHeight}
            scrollBatchSize={parseInt(scrollBatchSize) || 7}
            debug={debug === 'true' || debug === true}
            colorTheme={colorTheme}
        />
    );
};

const TableWebComponent = r2wc(TableWrapper, {
    props: {
        maxWidth: 'string',
        maxHeight: 'string',
        scrollBatchSize: 'string',
        debug: 'string',
        colorThemeName: 'string',
    },
    shadow: 'open'
});

customElements.define('virtualized-table', TableWebComponent);

export default TableWebComponent;
import React from 'react';
import ReactDOM from 'react-dom/client';
import r2wc from 'react-to-webcomponent';
import { Table } from "./component/table";

const WebTable = r2wc(Table, React, ReactDOM, {
    props: {
        maxWidth: "string",
        maxHeight: "string",
        scrollBatchSize: "number",
        debug: "boolean",
    }
});

customElements.define('web-table', WebTable);
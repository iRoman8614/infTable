import React from 'react';
import ReactDOM from 'react-dom/client';
import r2wc from 'react-to-webcomponent';
import { Table } from './table';

const WebTable = r2wc(Table, React, ReactDOM);

customElements.define('web-table', WebTable);
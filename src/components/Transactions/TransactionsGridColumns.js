import { formatNumber, formatDate } from '../Common/Util';

export const columnDefinitions = {
    date: {
        headerName: 'Date',
        field: 'date',
        sortable: true,
        filter: true,
        checkboxSelection: true,
        valueFormatter: formatDate,
        colSpan: (params) => (
            params.node.rowPinned ? params.columnApi.getAllDisplayedColumns().length : 1
        ),
        pinnedRowCellRenderer: 'footerRenderer',
    },
    amount: {
        headerName: 'Amount',
        field: 'amount',
        sortable: true,
        valueFormatter: formatNumber,
    },
    balance: {
        headerName: 'Balance',
        field: 'balance',
        sortable: true,
        valueFormatter: formatNumber,
    },
    remarks: {
        headerName: 'Remarks',
        field: 'remarks',
        sortable: true,
        filter: true,
        flex: 1,
    },
    tag: {
        headerName: 'Tag',
        field: 'tag',
    },
};

export const defaultColDef = {
    resizable: true,
};

export const getColumnsForType = (assetClass) => {
    const c = columnDefinitions;
    switch (assetClass) {
        case 'Cash':
            return [ c.date, c.amount, c.balance, c.remarks, c.tag ];
        default: return [];
    }
};

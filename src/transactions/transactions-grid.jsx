import { DataGrid } from '@mui/x-data-grid';
import { HorizontalLoader } from '../core/loader';
import { useEffect } from 'react';
import api from '../core/api';
import dayjs from 'dayjs';
import state from '../core/state';

const TransactionsGrid = () => {
    const { listTransactions } = api();
    const selectedAccount = state.useState('selectedAccount')[0];
    const [ transactions, setTransactions ] = state.useState('transactions');
    const [ transactionsAccountId, setTansactionsAccountId ] = state.useState('transactionsAccountId');
    const setSelectedRows = state.useState('selectedRows')[1];

    useEffect(() => {
        if (!selectedAccount) {
            return;
        }
        if (selectedAccount.id !== transactionsAccountId) {
            listTransactions(selectedAccount.id, (response) => {
                setTransactions(response);
                setTansactionsAccountId(selectedAccount.id);
            });
        }
    }, [ selectedAccount ]);

    const getColumns = () => {
        const columns = [
            { flex: 1, field: 'id', headerName: 'ID' },
            { flex: 2, field: 'date', headerName: 'Date', valueGetter: (params) => dayjs(params.row.date).format('YYYY-MM-DD') },
            { flex: 2, field: 'credit', headerName: 'Credit', valueGetter: (params) => params.row.amount > 0 ? params.row.amount : '' },
            { flex: 2, field: 'debit', headerName: 'Debit', valueGetter: (params) => params.row.amount < 0 ? -params.row.amount : ''  },
            { flex: 2, field: 'balance', headerName: 'Balance' },
            { flex: 2, field: 'category', headerName: 'Category' },
            { flex: 4, field: 'remarks', headerName: 'Remarks' },
        ];
        if (selectedAccount.type === 'Credit') {
            columns.splice(1, 0, { flex: 2, field: 'billingMonth', headerName: 'Bill', valueGetter: (params) => dayjs(params.row.billingMonth).format('YYYY-MM') });
        }
        return columns;
    };

    const handleDoubleClick = (params, event, details) => {
        // todo: handle
    };

    return !transactions ? <HorizontalLoader /> : (
        <DataGrid
            density="compact"
            rows={transactions}
            columns={getColumns()}
            onSelectionModelChange={(m) => setSelectedRows(m)}
            onRowDoubleClick={handleDoubleClick}
            autoHeight
            disableColumnMenu
            showColumnRightBorder
        />
    );
};
export default TransactionsGrid;

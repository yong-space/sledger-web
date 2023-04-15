import { DataGrid } from '@mui/x-data-grid';
import { HorizontalLoader } from '../core/loader';
import { useEffect, useState } from 'react';
import api from '../core/api';
import dayjs from 'dayjs';
import state from '../core/state';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const TransactionsGrid = ({ setShowAddDialog, setTransactionToEdit }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { listTransactions } = api();
    const selectedAccount = state.useState(state.selectedAccount)[0];
    const [ transactions, setTransactions ] = state.useState(state.transactions);
    const [ visibleColumns, setVisibleColumns ] = useState({});
    const [ transactionsAccountId, setTansactionsAccountId ] = state.useState(state.transactionsAccountId);
    const [ selectedRows, setSelectedRows ] = state.useState(state.selectedRows);

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

    useEffect(() => {
        const vColumns = !isMobile ? { amount: false } :
            { id: false, credit: false, debit: false, remarks: false, fx: false };
        setVisibleColumns(vColumns);
    }, [ isMobile ]);

    const getAmount = ({ field, row }) => (field === 'credit') ?
        (row.amount > 0 ? row.amount : 0) :
        (row.amount < 0 ? -row.amount : 0);
    const formatNumber = ({ value }) => value === 0 ? '' : parseFloat(value).toFixed(2).toLocaleString();
    const getDate = ({ row }) => new Date(row.date);
    const formatDate = ({ value }) => dayjs(value).format('YYYY-MM-DD');

    const getColumns = () => {
        const columns = [
            { flex: 1, field: 'id', headerName: 'ID' },
            { flex: 2, field: 'date', headerName: 'Date', type: 'date', valueGetter: getDate, valueFormatter: formatDate },
            { flex: 2, field: 'credit', headerName: 'Credit', type: 'number', valueGetter: getAmount, valueFormatter: formatNumber },
            { flex: 2, field: 'debit', headerName: 'Debit', type: 'number', valueGetter: getAmount, valueFormatter: formatNumber },
            { flex: 2, field: 'amount', headerName: 'Amount', type: 'number', valueFormatter: formatNumber },
            { flex: 2, field: 'balance', headerName: 'Balance', type: 'number', valueFormatter: formatNumber },
            { flex: 2, field: 'category', headerName: 'Category' },
            { flex: 4, field: 'remarks', headerName: 'Remarks' },
        ];
        if (selectedAccount.type === 'Credit') {
            columns.splice(1, 0, { flex: 2, field: 'billingMonth', headerName: 'Bill', valueGetter: ({ row }) => dayjs(row.billingMonth).format('YYYY-MM') });
        }
        if (selectedAccount.multiCurrency) {
            columns.splice(4, 0, { flex: 2, field: 'originalAmount', type: 'number', headerName: 'Original', valueFormatter: formatNumber });
            columns.splice(5, 0, { flex: 2, field: 'fx', headerName: 'FX', type: 'number', valueGetter: ({ row }) => Math.abs(row.amount / row.originalAmount).toFixed(5) });
        }
        return columns;
    };

    const handleDoubleClick = (params) => {
        setTransactionToEdit(params.row);
        setShowAddDialog(true);
    };

    return !transactions ? <HorizontalLoader /> : (
        <DataGrid
            autoHeight
            disableColumnMenu
            showColumnRightBorder
            density="compact"
            rows={transactions}
            columns={getColumns()}
            onRowSelectionModelChange={(m) => setSelectedRows(m)}
            rowSelectionModel={selectedRows}
            onRowDoubleClick={handleDoubleClick}
            columnVisibilityModel={visibleColumns}
        />
    );
};
export default TransactionsGrid;

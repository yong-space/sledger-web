import { DataGrid } from '@mui/x-data-grid';
import { HorizontalLoader } from '../core/loader';
import { useEffect, useState } from 'react';
import api from '../core/api';
import dayjs from 'dayjs';
import state from '../core/state';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const TransactionsGrid = () => {
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
            { id: false, credit: false, debit: false, remarks: false };
        setVisibleColumns(vColumns);
    }, [ isMobile ]);

    const getColumns = () => {
        const columns = [
            { flex: 1, field: 'id', headerName: 'ID' },
            { flex: 2, field: 'date', headerName: 'Date', valueGetter: (params) => dayjs(params.row.date).format('YYYY-MM-DD') },
            { flex: 2, field: 'credit', headerName: 'Credit', valueGetter: (params) => params.row.amount > 0 ? params.row.amount : '' },
            { flex: 2, field: 'debit', headerName: 'Debit', valueGetter: (params) => params.row.amount < 0 ? -params.row.amount : ''  },
            { flex: 2, field: 'amount', headerName: 'Amount' },
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

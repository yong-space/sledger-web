import { DataGrid } from '@mui/x-data-grid';
import { HorizontalLoader } from '../core/loader';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import api from '../core/api';
import dayjs from 'dayjs';
import state from '../core/state';
import styled from 'styled-components';
import useMediaQuery from '@mui/material/useMediaQuery';

const GridBox = styled.div`
    flex: 1 1 1px;
    height: 10vh;
    width: calc(100vw - 3rem);
    padding-bottom: 1rem;
`;

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
            setTransactions(undefined);
            listTransactions(selectedAccount.id, (response) => {
                setTransactions(response);
                setTansactionsAccountId(selectedAccount.id);
            });
        }
    }, [ selectedAccount ]);

    useEffect(() => {
        const vColumns = !isMobile ? { amount: false } :
            { id: false, credit: false, debit: false, remarks: false, fx: false, code: false, forMonth: false, ordinaryAmount: false, specialAmount: false, medisaveAmount: false };
        setVisibleColumns(vColumns);
    }, [ isMobile ]);

    const getAmount = ({ field, row }) => (field === 'credit') ?
        (row.amount > 0 ? row.amount : 0) :
        (row.amount < 0 ? -row.amount : 0);
    const decimalFomat = new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatNumber = ({ value }) => value === 0 ? '' : decimalFomat.format(value);
    const getDate = ({ row }) => new Date(row.date);
    const formatDate = ({ value }) => dayjs(value).format('YYYY-MM-DD');

    const columns = {
        id: { flex: 1, field: 'id', headerName: 'ID' },
        date: { flex: 2, field: 'date', headerName: 'Date', type: 'date', valueGetter: getDate, valueFormatter: formatDate },
        billingMonth: { flex: 2, field: 'billingMonth', headerName: 'Bill', valueGetter: ({ row }) => dayjs(row.billingMonth).format('YYYY-MM') },
        forMonth: { flex: 2, field: 'forMonth', headerName: 'Month', valueGetter: ({ row }) => dayjs(row.forMonth).format('YYYY-MM') },
        credit: { flex: 2, field: 'credit', headerName: 'Credit', type: 'number', valueGetter: getAmount, valueFormatter: formatNumber },
        debit: { flex: 2, field: 'debit', headerName: 'Debit', type: 'number', valueGetter: getAmount, valueFormatter: formatNumber },
        amount: { flex: 2, field: 'amount', headerName: 'Amount', type: 'number', valueFormatter: formatNumber },
        originalAmount: { flex: 2, field: 'originalAmount', type: 'number', headerName: 'Original', valueFormatter: formatNumber },
        fx: { flex: 2, field: 'fx', headerName: 'FX', type: 'number', valueGetter: ({ row }) => Math.abs(row.amount / row.originalAmount).toFixed(5) },
        balance: { flex: 2, field: 'balance', headerName: 'Balance', type: 'number', valueFormatter: formatNumber },
        remarks: { flex: 4, field: 'remarks', headerName: 'Remarks' },
        category: { flex: 2, field: 'category', headerName: 'Category' },
        code: { flex: 2, field: 'code', headerName: 'Code' },
        company: { flex: 2, field: 'company', headerName: 'Company' },
        ordinaryAmount: { flex: 2, field: 'ordinaryAmount', headerName: 'Ordinary', type: 'number', valueFormatter: formatNumber },
        specialAmount: { flex: 2, field: 'specialAmount', headerName: 'Special', type: 'number', valueFormatter: formatNumber },
        medisaveAmount: { flex: 2, field: 'medisaveAmount', headerName: 'Medisave', type: 'number', alueFormatter: formatNumber },
    };

    const columnMap = {
        Cash: [ columns.id, columns.date, columns.credit, columns.debit, columns.amount, columns.balance, columns.remarks, columns.category ],
        CashFX: [ columns.id, columns.date, columns.credit, columns.debit, columns.amount, columns.originalAmount, columns.fx, columns.balance, columns.remarks, columns.category ],
        Credit: [ columns.id, columns.date, columns.billingMonth, columns.credit, columns.debit, columns.amount, columns.balance, columns.remarks, columns.category ],
        Retirement: [ columns.id, columns.date, columns.forMonth, columns.code, columns.company, columns.amount, columns.ordinaryAmount, columns.specialAmount, columns.medisaveAmount ]
    };

    const getColumns = () => columnMap[selectedAccount.type + (selectedAccount.multiCurrency ? 'FX' : '')];

    const handleDoubleClick = (params) => {
        setTransactionToEdit(params.row);
        setShowAddDialog(true);
    };

    return !transactions ? <HorizontalLoader /> : (
        <GridBox>
            <DataGrid
                disableColumnMenu
                density="compact"
                rows={transactions}
                columns={getColumns()}
                onRowSelectionModelChange={(m) => setSelectedRows((o) => (m[0] === o[0]) ? [] : m)}
                rowSelectionModel={selectedRows}
                onRowDoubleClick={handleDoubleClick}
                columnVisibilityModel={visibleColumns}
            />
        </GridBox>
    );
};
export default TransactionsGrid;

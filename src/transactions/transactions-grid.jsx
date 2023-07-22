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
    display: flex;
    flex: 1 1 1px;
    margin-bottom: ${props => props.isMobile ? '.5rem' : '1rem' };
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
    const [ paginationModel, setPaginationModel ] = useState();

    useEffect(() => {
        if (!selectedAccount) {
            return;
        }
        if (selectedAccount.id !== transactionsAccountId) {
            setTransactions(undefined);
            setPaginationModel(undefined);
            listTransactions(selectedAccount.id, (response) => {
                setTransactions(response);
                setTansactionsAccountId(selectedAccount.id);
            });
        }
    }, [ selectedAccount ]);

    useEffect(() => {
        const vColumns = !isMobile ? { amount: false } : {
            id: false, credit: false, debit: false, category: false, balance: false,
            fx: false, originalAmount: false, code: false, forMonth: false, billingMonth: false,
            ordinaryAmount: false, specialAmount: false, medisaveAmount: false
        };
        setVisibleColumns(vColumns);
    }, [ isMobile ]);

    const getAmount = ({ field, row }) => (field === 'credit') ?
        (row.amount > 0 ? row.amount : 0) :
        (row.amount < 0 ? -row.amount : 0);
    const decimalFomat = new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatNumber = ({ value }) => value === 0 ? '' : decimalFomat.format(value);
    const getDate = ({ row }) => new Date(row.date);
    const formatDate = ({ value }) => dayjs(value).format('YYYY-MM-DD');
    const formatMonth = ({ value }) => dayjs(value).format('YYYY MMM');
    const getFx = ({ row }) => Math.abs(row.amount / row.originalAmount).toFixed(5);

    const columns = {
        id: { flex: 1, field: 'id', headerName: 'ID' },
        date: { flex: 2.5, field: 'date', headerName: 'Date', type: 'date', valueGetter: getDate, valueFormatter: formatDate },
        billingMonth: { flex: 2, field: 'billingMonth', headerName: 'Bill', valueFormatter: formatMonth },
        forMonth: { flex: 2, field: 'forMonth', headerName: 'Month', valueFormatter: formatMonth },
        credit: { flex: 2, field: 'credit', headerName: 'Credit', type: 'number', valueGetter: getAmount, valueFormatter: formatNumber },
        debit: { flex: 2, field: 'debit', headerName: 'Debit', type: 'number', valueGetter: getAmount, valueFormatter: formatNumber },
        amount: { flex: 2.5, field: 'amount', headerName: 'Amount', type: 'number', valueFormatter: formatNumber },
        originalAmount: { flex: 2, field: 'originalAmount', type: 'number', headerName: 'Original', valueFormatter: formatNumber },
        fx: { flex: 2, field: 'fx', headerName: 'FX', type: 'number', valueGetter: getFx },
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

    const handlePagination = (n) => setPaginationModel(
        paginationModel ? n : { ...n, page: Math.floor(transactions.length / n.pageSize) }
    );

    const maxGridSize = {
        maxWidth: `calc(100vw - ${isMobile ? 1 : 3}rem)`,
        maxHeight: `calc(100vh - ${isMobile ? 13.2 : 14}rem)`,
    };

    return !transactions ? <HorizontalLoader /> : (
        <GridBox isMobile={isMobile}>
            <DataGrid
                checkboxSelection={!isMobile}
                density="compact"
                rows={transactions}
                columns={getColumns()}
                onRowSelectionModelChange={(m) => setSelectedRows(m)}
                rowSelectionModel={selectedRows}
                onRowDoubleClick={handleDoubleClick}
                columnVisibilityModel={visibleColumns}
                autoPageSize
                paginationModel={paginationModel}
                onPaginationModelChange={handlePagination}
                sx={maxGridSize}
            />
        </GridBox>
    );
};
export default TransactionsGrid;

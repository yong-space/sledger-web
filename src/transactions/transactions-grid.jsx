import {
    DataGrid,
    useGridApiRef,
    gridFilteredSortedRowEntriesSelector,
} from '@mui/x-data-grid';
import { GridPagination } from '@mui/x-data-grid';
import { HorizontalLoader } from '../core/loader';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import api from '../core/api';
import Box from '@mui/system/Box';
import state from '../core/state';
import styled from 'styled-components';
import useMediaQuery from '@mui/material/useMediaQuery';
import { formatNumber, formatDecimal, formatDate, formatMonth } from '../util/formatters';

const GridBox = styled.div`
    display: flex;
    flex: 1 1 1px;
    margin-bottom: ${props => props.isMobile ? '.5rem' : '1rem' };
`;

const FooterRoot = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: rgb(81, 81, 81) 1px solid;
    min-height: 3.25rem;
    .MuiTablePagination-root { overflow: hidden }
    .MuiTablePagination-actions { margin-left: .5rem }
    .MuiButtonBase-root { padding: .2rem }
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
    const [ paginationModel, setPaginationModel ] = state.useState(state.paginationModel);

    useEffect(() => {
        if (!selectedAccount) {
            return;
        }
        if (selectedAccount.id !== transactionsAccountId) {
            setTransactions(undefined);
            setPaginationModel(undefined);
            setSelectedRows([]);
            listTransactions(selectedAccount.id, (response) => {
                setTransactions(response);
                setTansactionsAccountId(selectedAccount.id);
            });
        }
    }, [ selectedAccount ]);

    useEffect(() => {
        const vColumns = !isMobile ? { amount: false } : {
            id: false, credit: false, debit: false, category: false, balance: false,
            fx: false, originalAmount: false, company: false, forMonth: false, billingMonth: false,
            ordinaryAmount: false, specialAmount: false, medisaveAmount: false
        };
        setVisibleColumns(vColumns);
    }, [ isMobile ]);

    const getAmount = ({ field, row }) => (field === 'credit') ?
        (row.amount > 0 ? row.amount : 0) :
        (row.amount < 0 ? -row.amount : 0);
    const getDate = ({ row }) => new Date(row.date);
    const getFx = ({ row }) => Math.abs(row.amount / row.originalAmount).toFixed(5);

    const columns = {
        id: { flex: 1, field: 'id', headerName: 'ID' },
        date: { flex: 2.5, field: 'date', headerName: 'Date', type: 'date', valueGetter: getDate, valueFormatter: formatDate },
        billingMonth: { flex: 2, field: 'billingMonth', headerName: 'Bill', valueFormatter: formatMonth },
        forMonth: { flex: 2, field: 'forMonth', headerName: 'Month', valueFormatter: formatMonth },
        credit: { flex: 2, field: 'credit', headerName: 'Credit', type: 'number', valueGetter: getAmount, valueFormatter: formatDecimal },
        debit: { flex: 2, field: 'debit', headerName: 'Debit', type: 'number', valueGetter: getAmount, valueFormatter: formatDecimal },
        amount: { flex: 2.5, field: 'amount', headerName: 'Amount', type: 'number', valueFormatter: formatDecimal },
        originalAmount: { flex: 2, field: 'originalAmount', type: 'number', headerName: 'Original', valueFormatter: formatDecimal },
        fx: { flex: 2, field: 'fx', headerName: 'FX', type: 'number', valueGetter: getFx },
        balance: { flex: 2, field: 'balance', headerName: 'Balance', type: 'number', valueFormatter: formatDecimal },
        remarks: { flex: 4, field: 'remarks', headerName: 'Remarks' },
        category: { flex: 2, field: 'category', headerName: 'Category' },
        code: { flex: 2, field: 'code', headerName: 'Code' },
        company: { flex: 2, field: 'company', headerName: 'Company' },
        ordinaryAmount: { flex: 2, field: 'ordinaryAmount', headerName: 'Ordinary', type: 'number', valueFormatter: formatDecimal },
        specialAmount: { flex: 2, field: 'specialAmount', headerName: 'Special', type: 'number', valueFormatter: formatDecimal },
        medisaveAmount: { flex: 2, field: 'medisaveAmount', headerName: 'Medisave', type: 'number', alueFormatter: formatDecimal },
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

    const apiRef = useGridApiRef();
    useEffect(() => {
        // Weird MUI-X bug
        if (apiRef.current === null) {
            apiRef.current = {};
        }
    }, [ apiRef.current ]);

    const Summary = () => {
        const data = (selectedRows.length > 0) ?
            transactions.filter(({ id }) => selectedRows.indexOf(id) > -1) :
            gridFilteredSortedRowEntriesSelector(apiRef).map(({ model }) => model);
        const length = data.length;
        const plural = length > 1 ? 's' : '';
        const amountSum = { value: data.reduce((acc, obj) => acc + obj.amount, 0) };

        return (
            <Box sx={{ marginLeft: '1rem' }}>
                {formatNumber(length, false)} row{plural}: {formatDecimal(amountSum, false)}
            </Box>
        );
    };

    const PageLabel = () => {
        const totalPages = Math.ceil(gridFilteredSortedRowEntriesSelector(apiRef)?.length/paginationModel?.pageSize);
        return <>p{paginationModel?.page+1}{!isMobile && ` / ${totalPages}`}</>;
    };

    const TransactionsGridFooter = () => {
        if (gridFilteredSortedRowEntriesSelector(apiRef).length === 0) {
            return <></>;
        }
        return (
            <FooterRoot>
                <Summary />
                <GridPagination
                    showFirstButton
                    showLastButton
                    labelDisplayedRows={PageLabel}
                />
            </FooterRoot>
        );
    };

    return !transactions ? <HorizontalLoader /> : (
        <GridBox isMobile={isMobile}>
            <DataGrid
                autoPageSize
                checkboxSelection
                disableColumnSelector
                density="compact"
                apiRef={apiRef}
                rows={transactions}
                columns={getColumns()}
                rowSelectionModel={selectedRows}
                onRowSelectionModelChange={(m) => setSelectedRows(m)}
                onRowDoubleClick={handleDoubleClick}
                columnVisibilityModel={visibleColumns}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePagination}
                sx={maxGridSize}
                slots={{ footer: TransactionsGridFooter }}
            />
        </GridBox>
    );
};
export default TransactionsGrid;

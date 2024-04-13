import {
    DataGrid,
    GridToolbar,
    gridFilteredSortedRowEntriesSelector,
    gridPaginatedVisibleSortedGridRowIdsSelector,
    gridPageSelector,
    gridPageCountSelector,
    gridPageSizeSelector,
} from '@mui/x-data-grid';
import {
    formatNumber, formatDecimal, formatDecimalHideZero, formatDecimalAbs, formatDate, formatMonth,
} from '../util/formatters';
import { cpfCodes } from '../util/cpf-codes';
import { GridPagination } from '@mui/x-data-grid';
import { HorizontalLoader } from '../core/loader';
import { pink, lightGreen } from '@mui/material/colors';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import api from '../core/api';
import Box from '@mui/system/Box';
import state from '../core/state';
import styled from 'styled-components';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';

const GridBox = styled.div`
    display: flex;
    flex: 1 1 1px;
    .red { color: ${pink[300]} }
    .green { color: ${lightGreen[300]} }
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

const TransactionsGrid = ({ accounts, setShowAddDialog, setTransactionToEdit, apiRef }) => {
    const theme = useTheme();
    const isSmallHeight = useMediaQuery('(max-height:600px)');
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { listTransactions } = api();
    const selectedAccount = state.useState(state.selectedAccount)[0];
    const [ transactions, setTransactions ] = state.useState(state.transactions);
    const [ visibleColumns, setVisibleColumns ] = useState({});
    const [ transactionsAccountId, setTansactionsAccountId ] = state.useState(state.transactionsAccountId);
    const [ selectedRows, setSelectedRows ] = state.useState(state.selectedRows);
    const [ paginationModel, setPaginationModel ] = useState();
    const [ filterModel, setFilterModel ] = state.useState(state.filterModel);
    const [ visibleTransactionId, setVisibleTransactionId ] = state.useState(state.visibleTransactionId);

    useEffect(() => {
        if (!selectedAccount) {
            console.debug('No selected account')
            return;
        }
        if (selectedAccount.id !== transactionsAccountId) {
            console.debug(`Selected account ${selectedAccount.id} is not transactions account ${transactionsAccountId}`);
            apiRef.current = {};
            setTransactions([]);
            setPaginationModel(undefined);
            setSelectedRows([]);
            listTransactions(selectedAccount.id, (response) => {
                console.debug(`Loaded transactions for ${selectedAccount.id}`)
                const processedResponse = response.map((o) => {
                    const category = o.subCategory && o.subCategory !== o.category ? `${o.category}: ${o.subCategory}` : o.category;
                    return { ...o, category };
                });
                setTransactions(processedResponse);
                setTansactionsAccountId(selectedAccount.id);
            });
        }
    }, [ selectedAccount ]);

    useEffect(() => {
        const vColumns = !isMobile ? { amount: false } : {
            credit: false, debit: false, category: false, balance: false,
            fx: false, originalAmount: false, company: false, forMonth: false, billingMonth: false,
            ordinaryAmount: false, specialAmount: false, medisaveAmount: false, subCategory: false,
        };
        if (selectedAccount.type === 'Retirement' && !isMobile) {
            delete vColumns.amount;
        }
        setVisibleColumns(vColumns);
    }, [ isMobile, isSmallHeight ]);

    const getAmount = (_, row, column) => (column.field === 'credit') ?
        (row.amount > 0 ? row.amount : 0) :
        (row.amount < 0 ? -row.amount : 0);

    const getFx = (_, row) => {
        if (row.currency === 'SGD') {
            return '';
        }
        return row.currency + ' @ ' + Math.abs(row.amount / row.originalAmount).toFixed(5);
    };

    const getAccountName = (_, row) => accounts.find(({ id }) => id === row.accountId).name;

    const getColourClassForValue = ({ value }) => !value ? '' : value > 0 ? 'green' : 'red';

    const CpfCode = ({ value }) => {
        const title = cpfCodes.find((c) => c.code === value)?.description || 'No description available';
        return <Tooltip title={title}><span>{value}</span></Tooltip>;
    };

    const columns = {
        account: { flex : 2, field: 'accountId', headerName: 'Account', valueGetter: getAccountName },
        date: { flex: 2.5, field: 'date', headerName: 'Date', type: 'date', valueFormatter: formatDate },
        billingMonth: { flex: 2, field: 'billingMonth', headerName: 'Bill', type: 'date', valueFormatter: formatMonth },
        forMonth: { flex: 2, field: 'forMonth', headerName: 'Month', type: 'date', valueFormatter: formatMonth },
        credit: { flex: 2, field: 'credit', headerName: 'Credit', type: 'number', valueGetter: getAmount, valueFormatter: formatDecimalHideZero, cellClassName: 'green' },
        debit: { flex: 2, field: 'debit', headerName: 'Debit', type: 'number', valueGetter: getAmount, valueFormatter: formatDecimalHideZero, cellClassName: 'red' },
        amount: { flex: 2.5, field: 'amount', headerName: 'Amount', type: 'number', valueFormatter: formatDecimal, cellClassName: getColourClassForValue },
        originalAmount: { flex: 2, field: 'originalAmount', type: 'number', headerName: 'Original', valueFormatter: formatDecimalAbs },
        fx: { flex: 2, field: 'fx', headerName: 'FX', type: 'number', valueGetter: getFx },
        balance: { flex: 2, field: 'balance', headerName: 'Balance', type: 'number', valueFormatter: formatDecimal },
        remarks: { flex: 4, field: 'remarks', headerName: 'Remarks' },
        category: { flex: 2, field: 'category', headerName: 'Category' },
        code: { flex: 2, field: 'code', headerName: 'Code', renderCell: CpfCode },
        company: { flex: 2, field: 'company', headerName: 'Company' },
        ordinaryAmount: { flex: 2, field: 'ordinaryAmount', headerName: 'Ordinary', type: 'number', valueFormatter: formatDecimalHideZero, cellClassName: getColourClassForValue },
        specialAmount: { flex: 2, field: 'specialAmount', headerName: 'Special', type: 'number', valueFormatter: formatDecimalHideZero, cellClassName: getColourClassForValue },
        medisaveAmount: { flex: 2, field: 'medisaveAmount', headerName: 'Medisave', type: 'number', valueFormatter: formatDecimalHideZero, cellClassName: getColourClassForValue },
    };

    const cashFields = [ columns.date, columns.credit, columns.debit, columns.amount, columns.balance, columns.remarks, columns.category ];
    const cpfFields = [ columns.date, columns.forMonth, columns.code, columns.company, columns.amount, columns.ordinaryAmount, columns.specialAmount, columns.medisaveAmount ];

    const getColumns = () => {
        if (selectedAccount.type === 'Retirement') {
            return cpfFields;
        }
        const fields = [ ...cashFields ];
        if (!selectedAccount.type) {
            fields.splice(0, 0, columns.account);
        } else {
            if (selectedAccount.multiCurrency) {
                fields.splice(4, 0, columns.fx);
            }
            if (selectedAccount.type === 'Credit') {
                fields.splice(1, 0, columns.billingMonth);
            }
        }
        return fields;
    };

    const handleDoubleClick = (params) => {
        setSelectedRows([ params.id ]);
        setTransactionToEdit(params.row);
        setShowAddDialog(true);
    };

    const handleFilterModelChange = (model) => {
        setFilterModel(model);
        setSelectedRows([]);
    };

    const handlePagination = (n) => {
        const pages = gridPageCountSelector(apiRef);
        if (pages === 0) {
            return n;
        }
        if (paginationModel) {
            setPaginationModel(n);
            return n;
        }
        const config = { page: pages - 1, pageSize: n.pageSize };
        setPaginationModel(config);
        return config;
    };

    const maxGridSize = {
        maxWidth: `calc(100vw - ${isMobile || isSmallHeight ? 1 : 3}rem)`,
        maxHeight: `calc(100vh - ${isSmallHeight ? 5.5 : isMobile ? 12.1 : 13}rem)`,
    };

    useEffect(() => {
        if (!visibleTransactionId) {
            return;
        }
        console.debug(`Visible transaction ID is ${visibleTransactionId}`);
        const visibleRows = gridPaginatedVisibleSortedGridRowIdsSelector(apiRef);
        if (visibleRows.indexOf(visibleTransactionId) === -1) {
            const index = gridFilteredSortedRowEntriesSelector(apiRef)
                .map(({ id }) => id)
                .indexOf(visibleTransactionId) + 1;
            const pageSize = gridPageSizeSelector(apiRef);
            setTimeout(() => api.current?.setPage(Math.floor(index / pageSize)), 100);
        }
        setVisibleTransactionId(undefined);
    }, [ visibleTransactionId ]);

    const Summary = () => {
        const data = (selectedRows.length > 0) ?
            transactions.filter(({ id }) => selectedRows.indexOf(id) > -1) :
            gridFilteredSortedRowEntriesSelector(apiRef).map(({ model }) => model);
        const length = data.length;
        const plural = length > 1 ? 's' : '';
        const amountSum = data.reduce((acc, obj) => acc + obj.amount, 0);

        return (
            <Box sx={{ marginLeft: '1rem' }}>
                {formatNumber(length, false)} row{plural}: {formatDecimal(amountSum)}
            </Box>
        );
    };

    const PageLabel = () => {
        const page = gridPageSelector(apiRef) + 1;
        const pages = gridPageCountSelector(apiRef);
        return <>Page {page}{!isMobile && ` / ${pages}`}</>;
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

    const slots = {
        toolbar: GridToolbar,
        footer: TransactionsGridFooter,
    };

    const slotProps = {
        toolbar: {
            showQuickFilter: true,
            printOptions: { disableToolbarButton: true },
            csvOptions: { disableToolbarButton: isMobile || isSmallHeight },
        },
    };

    return !transactions ? <HorizontalLoader /> : (
        <GridBox isMobile={isMobile || isSmallHeight}>
            <DataGrid
                autoPageSize
                checkboxSelection
                disableColumnSelector
                disableDensitySelector
                disableColumnMenu
                apiRef={apiRef}
                rows={transactions}
                columns={getColumns()}
                columnVisibilityModel={visibleColumns}
                rowSelectionModel={selectedRows}
                onRowSelectionModelChange={(m) => setSelectedRows(m)}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePagination}
                onRowDoubleClick={handleDoubleClick}
                filterModel={filterModel}
                onFilterModelChange={handleFilterModelChange}
                sx={maxGridSize}
                slots={slots}
                slotProps={slotProps}
                initialState={{
                    density: 'compact',
                    sorting: {
                        sortModel: [{ field: 'date', sort: 'asc' }],
                    },
                }}
            />
        </GridBox>
    );
};
export default TransactionsGrid;

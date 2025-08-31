import { DataGrid, GridColDef } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AccountSelector from '../core/account-selector';
import api from '../core/api';
import state from '../core/state';
import { HorizontalLoader, Title } from '../core/utils';
import { formatDecimal, formatMonth, formatNumber } from '../util/formatters';

const FlexDataGrid = styled(DataGrid)`
    display: flex;
    flex: 1 1 1px;
    height: calc(100vh - 12rem);
`;

const CreditCardBills = ({ setRoute }) => {
    const uri = '/dash/credit-card-bills';
    const location = useLocation();
    const navigate = useNavigate();
    const accounts = state.useState(state.accounts)[0];
    const { getCreditCardBills } = api();
    const [ bills, setBills ] = useState(null);
    const [ selectedAccount, setSelectedAccount ] = state.useState(state.selectedAccount);
    const setFilterModel = state.useState(state.filterModel)[1];

    const getCreditAccounts = () => accounts.filter((a) => a.visible && a.type === 'Credit');

    useEffect(() => {
        if (getCreditAccounts().length === 0) {
            navigate('/settings/accounts');
            return;
        }
        const match = location.pathname.match(/\d+/);
        if (match) {
            const account = getCreditAccounts().find(a => a.id === parseInt(match[0]));
            if (account) {
                setRoute(`credit-card-bills/${match[0]}`);
                setSelectedAccount(account);
                return;
            }
        } else if (selectedAccount && getCreditAccounts().find(a => a.id === selectedAccount.id)) {
            navigate(`${uri}/${selectedAccount.id}`);
            return;
        }
        navigate(`${uri}/${getCreditAccounts()[0].id}`);
    }, [ accounts, location.pathname ]);

    useEffect(() => {
        if (selectedAccount && getCreditAccounts().find(({ id }) => id === selectedAccount.id)) {
            getCreditCardBills(selectedAccount.id, (response) => setBills(response));
        }
    }, [ selectedAccount ]);

    const BillGrid = () => {
        const [ paginationModel, setPaginationModel ] = useState();

        const columns : GridColDef[] = [
            { flex: 1, field: 'month', valueFormatter: formatMonth, headerName: 'Month' },
            { flex: 1, field: 'transactions', type: 'number', valueFormatter: formatNumber, headerName: 'Transactions' },
            { flex: 1, field: 'amount', type: 'number', valueFormatter: formatDecimal, headerName: 'Amount' },
            { flex: 1, field: 'net', type: 'number', valueFormatter: formatDecimal, headerName: 'Net' },
            { flex: 1, field: 'balance', type: 'number', valueFormatter: formatDecimal, headerName: 'Balance' },
        ];

        const handlePagination = (n) => setPaginationModel(
            paginationModel ? n : { ...n, page: Math.floor(bills.length / n.pageSize) }
        );

        const handleDoubleClick = ({ row }) => {
            const filter = {
                items: [
                    {
                        field: "billingMonth",
                        id: 1,
                        operator: "is",
                        value: dayjs.utc(row.month).format('YYYY-MM-DD'),
                    },
                ],
                operator: "and"
            };
            setFilterModel(filter);
            navigate('/tx/' + selectedAccount.id);
        };

        return (
            <FlexDataGrid
                autoPageSize
                disableColumnMenu
                hideFooterSelectedRowCount
                initialState={{ density: 'compact' }}
                rows={bills}
                columns={columns}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePagination}
                getRowId={({ month }) =>  month}
                onRowDoubleClick={handleDoubleClick}
            />
        );
    };

    return (
        <>
            <Title>Credit Card Bills</Title>
            <AccountSelector
                accountFilter={({ type }) => type === 'Credit' }
                handleChange={({ target }) => navigate(`${uri}/${target.value}`)}
            />
            { !bills ? <HorizontalLoader /> : <BillGrid /> }
        </>
    );
};
export default CreditCardBills;

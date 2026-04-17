import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AccountSelector from '../core/account-selector';
import api from '../core/api';
import state from '../core/state';
import { HorizontalLoader, Title } from '../core/utils';
import { formatDecimal, formatMonth, formatNumber } from '../util/formatters';
import { CreditAccount } from '../core/types';
import { GridApiCommunity } from '@mui/x-data-grid/models/api/gridApiCommunity';
import { RefObject } from 'react';

interface BillGridProps {
    selectedAccount: CreditAccount;
    getCreditAccounts: () => CreditAccount[];
}

const Root = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 1px;
    gap: 1rem;
`;

const FlexDataGrid = styled(DataGrid)`
    display: flex;
    flex: 1 1 1px;
`;

const columns: GridColDef[] = [
    { flex: 1, field: 'month', valueFormatter: formatMonth, headerName: 'Month' },
    { flex: 1, field: 'transactions', type: 'number', valueFormatter: formatNumber, headerName: 'Count' },
    { flex: 1, field: 'amount', type: 'number', valueFormatter: formatDecimal, headerName: 'Amount' },
    { flex: 1, field: 'outstanding', type: 'number', valueFormatter: formatDecimal, headerName: 'Outstanding' },
    { flex: 1, field: 'paid', type: 'number', valueFormatter: formatDecimal, headerName: 'Paid' },
    { flex: 1, field: 'balance', type: 'number', valueFormatter: formatDecimal, headerName: 'Balance' },
];

const BillGrid = ({ getCreditAccounts, selectedAccount }: BillGridProps) => {
    const navigate = useNavigate();
    const [ bills, setBills ] = useState(null);
    const setFilterModel = state.useState(state.filterModel)[1];
    const apiRef : RefObject<GridApiCommunity> = useGridApiRef();
    const { getCreditCardBills } = api();

    useEffect(() => {
        if (selectedAccount && getCreditAccounts().find(({ id }) => id === selectedAccount.id)) {
            getCreditCardBills(selectedAccount.id, (response) => {
                setBills(response);
                gotoLastPage(response.length);
            });
        }
    }, [ selectedAccount ]);

    const gotoLastPage = (rows = bills?.length) => setTimeout(() => {
        const pageSize = apiRef.current.state.pagination.paginationModel.pageSize;
        const lastPage = Math.ceil(rows / pageSize) - 1;
        apiRef.current.setPage(lastPage);
    }, 100);

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

    return !bills ? <HorizontalLoader /> : (
        <FlexDataGrid
            apiRef={apiRef}
            autoPageSize
            disableColumnMenu
            hideFooterSelectedRowCount
            initialState={{ density: 'compact' }}
            rows={bills}
            columns={columns}
            getRowId={({ month }) =>  month}
            onRowDoubleClick={handleDoubleClick}
        />
    );
};

const CreditCardBills = ({ setRoute }) => {
    const uri = '/dash/credit-card-bills';
    const location = useLocation();
    const navigate = useNavigate();
    const accounts = state.useState(state.accounts)[0];


    const [ selectedAccount, setSelectedAccount ] = state.useState(state.selectedAccount);
    const getCreditAccounts = (): CreditAccount[] =>
        accounts.filter((a): a is CreditAccount => a.visible && a.type === 'Credit');

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

    return (
        <Root>
            <Title>Credit Card Bills</Title>
            <AccountSelector
                accountFilter={({ type }) => type === 'Credit' }
                handleChange={({ target }) => navigate(`${uri}/${target.value}`)}
            />
            <BillGrid getCreditAccounts={getCreditAccounts} selectedAccount={selectedAccount as CreditAccount} />
        </Root>
    );
};
export default CreditCardBills;

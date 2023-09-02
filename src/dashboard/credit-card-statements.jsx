import { DataGrid } from '@mui/x-data-grid';
import { formatDecimal, formatNumber, formatMonth } from '../util/formatters';
import { HorizontalLoader } from '../core/loader';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import AccountSelector from '../core/account-selector';
import api from '../core/api';
import state from '../core/state';
import styled from 'styled-components';
import Title from '../core/title';
import useMediaQuery from '@mui/material/useMediaQuery';

const Root = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1 1 1px;
`;

const GridBox = styled.div`
    display: flex;
    flex: 1 1 1px;
    height: calc(100vh - 12rem);
    margin-bottom: ${props => props.isMobile ? '.5rem' : '1rem' };
`;

const CreditCardStatements = () => {
    const uri = '/dash/credit-card-statements';
    const location = useLocation();
    const navigate = useNavigate();
    const accounts = state.useState(state.accounts)[0];
    const { getCreditCardStatements } = api();
    const [ statements, setStatements ] = useState();
    const [ selectedAccount, setSelectedAccount ] = state.useState(state.selectedAccount);

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
        if (selectedAccount) {
            getCreditCardStatements(selectedAccount.id, (response) => setStatements(response));
        }
    }, [ selectedAccount ]);

    const StatementGrid = () => {
        const theme = useTheme();
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
        const [ paginationModel, setPaginationModel ] = useState();

        const maxGridSize = {
            maxWidth: `calc(100vw - ${isMobile ? 1 : 3}rem)`,
            maxHeight: `calc(100vh - ${isMobile ? 11.5 : 12.5}rem)`,
        };

        const columns = [
            { flex: 1, field: 'month', valueFormatter: formatMonth, headerName: 'Month' },
            { flex: 1, field: 'transactions', type: 'number', valueFormatter: formatNumber, headerName: 'Transactions' },
            { flex: 1, field: 'amount', type: 'number', valueFormatter: formatDecimal, headerName: 'Amount' },
        ];

        const handlePagination = (n) => setPaginationModel(
            paginationModel ? n : { ...n, page: Math.floor(statements.length / n.pageSize) }
        );

        return (
            <GridBox isMobile={isMobile}>
                <DataGrid
                    autoPageSize
                    disableColumnMenu
                    hideFooterSelectedRowCount
                    density="compact"
                    rows={statements}
                    columns={columns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={handlePagination}
                    sx={maxGridSize}
                    getRowId={({ month }) =>  month}
                />
            </GridBox>
        );
    };

    return (
        <Root spacing={3} pb={3}>
            <Title mb={-1}>Credit Card Statements</Title>
            <AccountSelector
                accountFilter={({ type }) => type === 'Credit' }
                handleChange={({ target }) => navigate(`${uri}/${target.value}`)}
            />
            { !statements ? <HorizontalLoader /> : <StatementGrid /> }
        </Root>
    );
};
export default CreditCardStatements;
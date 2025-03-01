import { HorizontalLoader } from '../core/utils';
import { RefObject, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import AccountSelector from '../core/account-selector';
import TransactionsActionButtons from './transactions-action-buttons';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import styled from 'styled-components';
import { Title } from '../core/utils';
import TransactionsGrid from './transactions-grid';
import TransactionsImport from './transactions-import';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useGridApiRef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/models/api/gridApiCommunity';

const TransactionsRoot = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1 1 1px;
`;

const Transactions = () => {
    dayjs.extend(minMax);
    const [ accounts, setAccounts ] = state.useState(state.accounts);
    const issuers = state.useState(state.issuers)[0];
    const [ loading, setLoading ] = useState(true);
    const [ showAddDialog, setShowAddDialog ] = useState(false);
    const [ canImport, setCanImport ] = useState(false);
    const [ transactionToEdit, setTransactionToEdit ] = useState();
    const [ query, setQuery ] = useState(null);
    const [ selectedAccount, setSelectedAccount ] = state.useState(state.selectedAccount);
    const [ transactions, setTransactions ] = state.useState(state.transactions);
    const setTansactionsAccountId = state.useState(state.transactionsAccountId)[1];
    const [ importMode, setImportMode ] = useState(false);
    const theme = useTheme();
    const isSmallHeight = useMediaQuery('(max-height:600px)');
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const location = useLocation();
    const navigate = useNavigate();
    const getVisibleAccounts = () => accounts?.filter((a) => a.visible);
    const apiRef : RefObject<GridApiCommunity> = useGridApiRef();

    useEffect(() => {
        if (!accounts) {
            return;
        }
        if (getVisibleAccounts().length === 0) {
            navigate('/settings/accounts');
            return;
        }
        const matchId = location.pathname.match(/\d+/);
        if (matchId) {
            const newQuery = (new URLSearchParams(location.search)).get('q');
            if (query !== newQuery) {
                setQuery(newQuery);
                setTansactionsAccountId(-1);
            }
            const id = parseInt(matchId[0]);
            const account = (id === 0) ? { id: 0 } : getVisibleAccounts().find(a => a.id === id);
            if (account) {
                setSelectedAccount(account);
                return;
            }
        } else if (selectedAccount && (selectedAccount.id === 0 || getVisibleAccounts().find(a => a.id === selectedAccount.id))) {
            navigate(`/tx/${selectedAccount.id}`);
            return;
        }
        navigate(`/tx/${getVisibleAccounts()[0].id}`);
    }, [ accounts, location.pathname ]);

    useEffect(() => {
        if (!accounts) {
            return;
        }
        if (selectedAccount && (selectedAccount.id === 0 || getVisibleAccounts().find(a => a.id === selectedAccount.id))) {
            setLoading(false);
        }
        setCanImport(issuers.find(({ id }) => id === selectedAccount?.issuerId)?.canImport);
    }, [ accounts, selectedAccount ]);

    const actionProps = {
        transactions, setTransactions, setAccounts, showAddDialog, setShowAddDialog,
        transactionToEdit, setTransactionToEdit, setImportMode, canImport,
    };

    return loading ? <HorizontalLoader /> : (
        <TransactionsRoot>
            { !isSmallHeight && (
                <>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Title>
                            Transactions
                            { importMode && ' Import'}
                            { query && `: ${query}` }
                        </Title>
                        { isMobile && <TransactionsActionButtons {...actionProps} apiRef={apiRef} />}
                    </Stack>
                    <Stack direction="row" spacing={1} justifyContent="space-between">
                        <AccountSelector
                            sx={{ flex: 4 }}
                            disabled={importMode}
                            handleChange={({ target }) => navigate(`/tx/${target.value}`)}
                            showCashCredit
                        />
                        { !isMobile && !importMode && <TransactionsActionButtons {...actionProps} apiRef={apiRef} /> }
                    </Stack>
                </>
            )}
            { importMode ? (
                    <TransactionsImport
                        setImportMode={setImportMode}
                        selectedAccount={selectedAccount}
                    />
                ) : (
                    <TransactionsGrid
                        accounts={accounts}
                        query={query}
                        selectedAccount={selectedAccount}
                        setShowAddDialog={setShowAddDialog}
                        setTransactionToEdit={setTransactionToEdit}
                        apiRef={apiRef}
                    />
                )
            }
        </TransactionsRoot>
    )
};
export default Transactions;

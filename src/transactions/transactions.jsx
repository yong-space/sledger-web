import { HorizontalLoader } from '../core/loader';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import AccountSelector from './account-selector';
import ActionButtons from './action-buttons';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import Title from '../core/title';
import TransactionsGrid from './transactions-grid';
import TransactionsImport from './transactions-import';
import useMediaQuery from '@mui/material/useMediaQuery';

const Transactions = () => {
    dayjs.extend(minMax);
    const [ accounts, setAccounts ] = state.useState(state.accounts);
    const issuers = state.useState(state.issuers)[0];
    const [ loading, setLoading ] = useState(true);
    const [ showAddDialog, setShowAddDialog ] = useState(false);
    const [ canImport, setCanImport ] = useState(false);
    const [ transactionToEdit, setTransactionToEdit ] = useState();
    const [ selectedAccount, setSelectedAccount ] = state.useState(state.selectedAccount);
    const [ transactions, setTransactions ] = state.useState(state.transactions);
    const [ importMode, setImportMode ] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const location = useLocation();
    const navigate = useNavigate();
    const getVisibleAccounts = () => accounts.filter((a) => a.visible);

    useEffect(() => {
        if (!accounts) {
            return;
        }
        if (getVisibleAccounts().length === 0) {
            navigate('/settings/accounts');
            return;
        }
        const match = location.pathname.match(/\d+/);
        if (match) {
            const account = getVisibleAccounts().find(a => a.id === parseInt(match[0]));
            if (account) {
                setSelectedAccount(account);
                return;
            }
        } else if (selectedAccount && getVisibleAccounts().find(a => a.id === selectedAccount.id)) {
            navigate(`/tx/${selectedAccount.id}`);
            return;
        }
        navigate(`/tx/${getVisibleAccounts()[0].id}`);
    }, [ accounts, location.pathname ]);

    useEffect(() => {
        if (!accounts) {
            return;
        }
        if (selectedAccount && getVisibleAccounts().find(a => a.id === selectedAccount.id)) {
            setLoading(false);
        }
        setCanImport(issuers.find(({ id }) => id === selectedAccount?.issuerId)?.canImport);
    }, [ accounts, selectedAccount ]);

    const actionProps = {
        isMobile, transactions, setTransactions, setAccounts, showAddDialog,
        setShowAddDialog, transactionToEdit, setTransactionToEdit, setImportMode, canImport,
    };

    return loading ? <HorizontalLoader /> : (
        <>
            <Stack direction="row" justifyContent="space-between">
                <Title>Transactions { importMode && 'Import'}</Title>
                { isMobile && <ActionButtons {...actionProps} />}
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="space-between">
                <AccountSelector disabled={importMode} handleChange={({ target }) => navigate(`/tx/${target.value}`)} />
                { !isMobile && !importMode && <ActionButtons {...actionProps} /> }
            </Stack>
            { importMode ?
                <TransactionsImport {...{ setImportMode, selectedAccount }} /> :
                <TransactionsGrid {...{ setShowAddDialog, setTransactionToEdit }} />
            }
        </>
    )
};
export default Transactions;

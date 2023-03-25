import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AccountSelector from './account-selector';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AddTransactionDialog from './add-transaction-form';
import api from '../core/api';
import Button from '@mui/material/Button';
import ConfirmDialog from '../core/confirm-dialog';
import dayjs from 'dayjs';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import minMax from 'dayjs/plugin/minMax';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import Title from '../core/title';
import TransactionsGrid from './transactions-grid';

const Transactions = () => {
    dayjs.extend(minMax);
    const accounts = state.useState(state.accounts)[0];
    const [ showAddDialog, setShowAddDialog ] = useState(false);
    const [ transactionToEdit, setTransactionToEdit ] = useState();
    const [ showConfirmDelete, setShowConfirmDelete ] = useState(false);
    const [ selectedAccount, setSelectedAccount ] = state.useState(state.selectedAccount);
    const selectedRows = state.useState(state.selectedRows)[0];
    const [ transactions, setTransactions ] = state.useState(state.transactions);
    const location = useLocation();
    const navigate = useNavigate();
    const { deleteTransaction, listTransactions, showStatus } = api();

    useEffect(() => {
        if (!accounts) {
            return;
        }
        const match = location.pathname.match(/\d+/);
        if (match) {
            setSelectedAccount(accounts.filter(a => a.id === parseInt(match[0]))[0]);
        } else if (!selectedAccount) {
            navigate(`/tx/${accounts[0].id}`);
        }
    }, [ accounts, location.pathname ]);

    const submitDelete = () => {
        const maxDate = dayjs.max(transactions.map(t => dayjs(t.date)));
        const txDate = dayjs(transactions.filter((t) => t.id === selectedRows[0])[0].date);

        deleteTransaction(selectedRows[0], () => {
            setShowConfirmDelete(false);
            if (txDate.isSame(maxDate)) {
                setTransactions((t) => t.filter((r) => r.id !== selectedRows[0]));
                showStatus('success', 'Transaction deleted');
            } else {
                listTransactions(selectedAccount.id, (response) => {
                    setTransactions(response);
                    showStatus('success', 'Transaction deleted');
                });
            }
        });
    };

    const AddDeleteButtons = ({ sx }) => (
        <>
            <Button
                color="success"
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => setShowAddDialog(true)}
                sx={sx}
            >
                Add
            </Button>
            <Button
                color="error"
                variant="contained"
                startIcon={<DeleteForeverIcon />}
                onClick={() => setShowConfirmDelete(true)}
                disabled={selectedRows.length === 0}
                sx={sx}
            >
                Delete
            </Button>
        </>
    );

    return (
        <Stack spacing={1} height="98%">
            <Stack direction="row" justifyContent="space-between">
                <Title>Transactions</Title>
                <Stack direction="row" spacing={1} sx={{ display: 'inline' }}>
                    <AddDeleteButtons sx={{ display: { sm: 'none' } }} />
                </Stack>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
                <Stack direction="row" spacing={2} sx={{ width: { sm: '60%' } }}>
                    <AccountSelector handleChange={({ target }) => navigate(`/tx/${target.value}`)} />
                    <AddDeleteButtons sx={{ display: { xs: 'none', sm: 'flex' } }} />
                </Stack>
                <TextField placeholder="Search.." size="small" sx={{ justifySelf: 'flex-end' }} />
            </Stack>
            <TransactionsGrid {...{ setShowAddDialog, setTransactionToEdit }} />
            <AddTransactionDialog {...{ showAddDialog, setShowAddDialog, transactionToEdit, setTransactionToEdit }} />
            <ConfirmDialog
                title="Confirm delete transaction?"
                message="This is a permanent change"
                open={showConfirmDelete}
                setOpen={setShowConfirmDelete}
                confirm={submitDelete}
            />
        </Stack>
    )
};
export default Transactions;

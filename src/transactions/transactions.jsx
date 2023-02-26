import { atoms } from '../core/atoms';
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
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
import Title from '../core/title';
import TransactionsGrid from './transactions-grid';

const Transactions = () => {
    dayjs.extend(minMax);
    const accounts = useRecoilState(atoms.accounts)[0];
    const [ showAddForm, setShowAddForm ] = useState(false);
    const [ showConfirmDelete, setShowConfirmDelete ] = useState(false);
    const [ selectedAccount, setSelectedAccount ] = useRecoilState(atoms.selectedAccount);
    const selectedRows = useRecoilState(atoms.selectedRows)[0];
    const [ transactions, setTransactions ] = useRecoilState(atoms.transactions);
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
    }

    return (
        <Stack spacing={2} height="98%">
            <Title>Transactions</Title>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                <Stack direction="row" spacing={2}>
                    <AccountSelector handleChange={({ target }) => navigate(`/tx/${target.value}`)} />
                    <Button
                        variant="contained"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => setShowAddForm(true)}
                    >
                        Add
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteForeverIcon />}
                        onClick={() => setShowConfirmDelete(true)}
                    >
                        Delete
                    </Button>
                </Stack>
                <TextField placeholder="Search.." size="small" sx={{ justifySelf: 'flex-end' }} />
            </Stack>
            <TransactionsGrid />
            <AddTransactionDialog
                open={showAddForm}
                setOpen={setShowAddForm}
            />
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

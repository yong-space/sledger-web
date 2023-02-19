import { atoms } from '../core/atoms';
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import AccountSelector from './account-selector';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AddTransactionForm from './add-transaction-form';
import api from '../core/api';
import Button from '@mui/material/Button';
import ConfirmDialog from '../core/confirm-dialog';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Stack from '@mui/material/Stack';
import Title from '../core/title';
import TransactionsGrid from './transactions-grid';

const Transactions = () => {
    const accounts = useRecoilState(atoms.accounts)[0];
    const [ showAddForm, setShowAddForm ] = useState(false);
    const [ showConfirmDelete, setShowConfirmDelete ] = useState(false);
    const [ selectedAccount, setSelectedAccount ] = useRecoilState(atoms.selectedAccount);
    const selectedRows = useRecoilState(atoms.selectedRows)[0];
    const setTransactions = useRecoilState(atoms.transactions)[1];
    const location = useLocation();
    const navigate = useNavigate();
    const { deleteTransaction, showStatus } = api();

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

    const submitDelete = () => deleteTransaction(selectedRows[0], () => {
        setShowConfirmDelete(false);
        setTransactions((t) => t.filter((r) => r.id !== selectedRows[0]));
        showStatus('success', 'Transaction deleted');
    });

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
            <AddTransactionForm
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

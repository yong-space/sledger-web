import { AddButton, EditButton, DeleteButton, ImportButton } from '../core/buttons';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import AddTransactionDialog from './add-transaction-form';
import api from '../core/api';
import ConfirmDialog from '../core/confirm-dialog';
import dayjs from 'dayjs';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import useMediaQuery from '@mui/material/useMediaQuery';

const TransactionsActionButtons = ({
    transactions, setTransactions, setAccounts, showAddDialog, setShowAddDialog,
    transactionToEdit, setTransactionToEdit, setImportMode, canImport,
}) => {
    const theme = useTheme();
    const setLoading = state.useState(state.loading)[1];
    const [ selectedRows, setSelectedRows ] = state.useState(state.selectedRows);
    const setPaginationModel = state.useState(state.paginationModel)[1];
    const selectedAccount = state.useState(state.selectedAccount)[0];
    const { deleteTransaction, listTransactions, showStatus, listAccounts } = api();
    const [ showConfirmDelete, setShowConfirmDelete ] = useState(false);

    const submitDelete = () => {
        setLoading(true);
        const maxDate = dayjs.max(transactions.map(t => dayjs(t.date)));
        const txDate = dayjs(transactions.filter((t) => t.id === selectedRows[0])[0].date);

        deleteTransaction(selectedRows, () => {
            if (selectedRows.length === 1 && txDate.isSame(maxDate)) {
                setTransactions((t) => t.filter((r) => r.id !== selectedRows[0]));
                showStatus('success', 'Transaction deleted');
                setLoading(false);
                setShowConfirmDelete(false);
            } else {
                listTransactions(selectedAccount.id, (response) => {
                    setTransactions(response);
                    showStatus('success', 'Transaction deleted');
                    setLoading(false);
                    setShowConfirmDelete(false);
                });
            }
            listAccounts((data) => setAccounts(data));
        });
    };

    const editTransaction = () => {
        setTransactionToEdit(transactions.find(({ id }) => id === selectedRows[0]));
        setShowAddDialog(true);
    };

    return (
        <Stack direction="row" spacing={1}>
            { selectedRows.length === 0 && <AddButton onClick={() => setShowAddDialog(true)} />}
            { selectedRows.length === 1 && <EditButton onClick={editTransaction} />}
            { selectedRows.length > 0 && <DeleteButton onClick={() => setShowConfirmDelete(true)} />}

            { useMediaQuery(theme.breakpoints.up('md')) && canImport && (
                <ImportButton onClick={() => setImportMode(true)} />
            )}

            { showAddDialog && (
                <AddTransactionDialog {...{
                    setShowAddDialog,
                    transactionToEdit,
                    setTransactionToEdit,
                    setSelectedRows,
                    setPaginationModel,
                }} />
            )}

            { showConfirmDelete && (
                <ConfirmDialog
                    open
                    title="Confirm delete transaction?"
                    message="This is a permanent change"
                    setOpen={setShowConfirmDelete}
                    confirm={submitDelete}
                />
            )}
        </Stack>
    );
};
export default TransactionsActionButtons;

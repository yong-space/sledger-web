import { AddButton, EditButton, DeleteButton, ImportButton } from '../core/buttons';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import AddTransactionDialog from './add-transaction-dialog';
import api from '../core/api';
import BulkTransactionDialog from './bulk-transaction-dialog';
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
    const [ showBulkDialog, setShowBulkDialog ] = useState(false);
    const [ selectedRows, setSelectedRows ] = state.useState(state.selectedRows);
    const selectedLength = selectedRows?.length;
    const selectedAccount = state.useState(state.selectedAccount)[0];
    const { deleteTransaction, listTransactions, showStatus, listAccounts } = api();
    const [ showConfirmDelete, setShowConfirmDelete ] = useState(false);

    const submitDelete = () => {
        setLoading(true);
        const maxDate = dayjs.max(transactions.map(t => dayjs(t.date)));
        const txDate = dayjs(transactions.filter((t) => t.id === selectedRows[0])[0].date);

        deleteTransaction(selectedRows, () => {
            if (selectedLength === 1 && txDate.isSame(maxDate)) {
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
        if (selectedLength === 1) {
            setTransactionToEdit(transactions.find(({ id }) => id === selectedRows[0]));
            setShowAddDialog(true);
        } else {
            setTransactionToEdit(selectedRows);
            setShowBulkDialog(true);
        }
    };

    return (
        <Stack direction="row" spacing={1}>
            { selectedLength === 0 && <AddButton onClick={() => setShowAddDialog(true)} />}
            { selectedLength > 0 && <EditButton onClick={editTransaction} />}
            { selectedLength > 0 && <DeleteButton onClick={() => setShowConfirmDelete(true)} />}

            { useMediaQuery(theme.breakpoints.up('md')) && canImport && (
                <ImportButton onClick={() => setImportMode(true)} />
            )}

            { showAddDialog && (
                <AddTransactionDialog {...{
                    setShowAddDialog,
                    transactionToEdit,
                    setTransactionToEdit,
                    setSelectedRows,
                }} />
            )}

            { showBulkDialog && (
                <BulkTransactionDialog {...{
                    setShowBulkDialog,
                    transactionToEdit,
                    setTransactionToEdit,
                }} />
            )}

            { showConfirmDelete && (
                <ConfirmDialog
                    open
                    title="Confirm Deletion"
                    message={`This will permanently delete ${selectedLength} transaction${selectedLength > 1 ? 's' : ''}`}
                    setOpen={setShowConfirmDelete}
                    confirm={submitDelete}
                />
            )}
        </Stack>
    );
};
export default TransactionsActionButtons;

import { AddButton, EditButton, DeleteButton, ImportButton } from '../core/buttons';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import api from '../core/api';
import BulkTransactionDialog from './bulk-transaction-dialog';
import ConfirmDialog from '../core/confirm-dialog';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import useMediaQuery from '@mui/material/useMediaQuery';
import { GridRowId } from '@mui/x-data-grid';

const TransactionsActionButtons = ({
    transactions, setAccounts, setShowAddDialog,
    transactionToEdit, setTransactionToEdit, setImportMode, canImport, apiRef,
}) => {
    const theme = useTheme();
    const setLoading = state.useState(state.loading)[1];
    const [ showBulkDialog, setShowBulkDialog ] = useState(false);
    const [ selectedRows, setSelectedRows ] = state.useState(state.selectedRows);
    const selectedLength = selectedRows?.ids.size;
    const selectedAccount = state.useState(state.selectedAccount)[0];
    const { deleteTransaction, listTransactions, showStatus, listAccounts } = api();
    const [ showConfirmDelete, setShowConfirmDelete ] = useState(false);

    const submitDelete = () => {
        setLoading(true);

        deleteTransaction([...selectedRows.ids], () =>
            listTransactions(selectedAccount.id, (response) => {
                selectedRows.ids.forEach((id) => apiRef.current.updateRows([{ id, _action: 'delete' }]));
                response
                    .filter((updatedRow) => updatedRow.balance !== apiRef.current.getRow(updatedRow.id).balance)
                    .forEach((updatedRow) => apiRef.current.updateRows([{ id: updatedRow.id, balance: updatedRow.balance }]));
                const plural = selectedLength > 1 ? 's' : '';
                showStatus('success', selectedLength + ` transaction${plural} deleted`);
                setLoading(false);
                setShowConfirmDelete(false);
                listAccounts((data) => setAccounts(data));
            })
        );
    };

    const addTransaction = () => {
        setSelectedRows({ type: 'include', ids: new Set<GridRowId>() });
        setShowAddDialog(true);
    };

    const editTransaction = () => {
        if (selectedLength === 1) {
            setTransactionToEdit(transactions.find(({ id }) => id === selectedRows[0]));
            setShowAddDialog(true);
        } else {
            setTransactionToEdit([...selectedRows.ids]);
            setShowBulkDialog(true);
        }
    };

    const isMobile = useMediaQuery(theme.breakpoints.up('md'));

    if (selectedAccount.id === 0 && selectedLength === 0) {
        return <></>;
    }
    return (
        <Stack direction="row" spacing={1}>
            { selectedAccount.id > 0 && <AddButton onClick={addTransaction} solo={selectedLength === 0} /> }
            { selectedLength > 0 && <EditButton onClick={editTransaction} />}
            { selectedLength > 0 && <DeleteButton onClick={() => setShowConfirmDelete(true)} />}

            { isMobile && canImport && (
                <ImportButton onClick={() => setImportMode(true)} />
            )}

            { showBulkDialog && (
                <BulkTransactionDialog {...{
                    setShowBulkDialog,
                    transactionToEdit,
                    setTransactionToEdit,
                    apiRef,
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

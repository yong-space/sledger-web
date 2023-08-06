import { AddButton, EditButton, DeleteButton } from '../core/buttons';
import { useState } from 'react';
import AccountsForm from './accounts-form';
import api from '../core/api';
import ConfirmDialog from '../core/confirm-dialog';
import Stack from '@mui/material/Stack';

const AccountsActionButtons = ({ issuers, accounts, setAccounts, accountToEdit, setAccountToEdit, selectedAccount, showAddDialog, setShowAddDialog }) => {
    const [ showConfirmDelete, setShowConfirmDelete ] = useState(false);
    const { deleteAccount, showStatus } = api();

    const submitDelete = () => deleteAccount(selectedAccount[0], () => {
        setAccounts((accounts) => accounts.filter(i => i.id !== selectedAccount[0]));
        showStatus('success', 'Account deleted');
        setShowConfirmDelete(false);
    });

    const editAccount = () => {
        setAccountToEdit(accounts.find(({ id }) => id === selectedAccount[0]));
        setShowAddDialog(true);
    };

    return (
        <>
            <Stack direction="row" spacing={1}>
                { selectedAccount.length === 0 && <AddButton onClick={() => setShowAddDialog(true)} />}
                { selectedAccount.length === 1 && <EditButton onClick={editAccount} />}
                { selectedAccount.length === 1 && <DeleteButton onClick={() => setShowConfirmDelete(true)} />}
            </Stack>
            { showConfirmDelete && (
                <ConfirmDialog
                    title="Confirm delete account?"
                    message="All transactions under this account will be permanently deleted"
                    open
                    setOpen={setShowConfirmDelete}
                    confirm={submitDelete}
                />
            )}
            { showAddDialog && (
                <AccountsForm {...{ issuers, accounts, setAccounts, setShowAddDialog, accountToEdit, setAccountToEdit }} />
            )}
        </>
    );
};
export default AccountsActionButtons;

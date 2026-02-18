import { AddButton, EditButton, DeleteButton } from '../core/buttons';
import { useState } from 'react';
import AccountsForm from './accounts-form';
import api from '../core/api';
import ConfirmDialog from '../core/confirm-dialog';
import Stack from '@mui/material/Stack';

const AccountsActionButtons = ({
    issuers, accounts, setAccounts, accountToEdit, setAccountToEdit,
    selectedAccount, showAddDialog, setShowAddDialog, setSelectedAccount,
}) => {
    const [ showConfirmDelete, setShowConfirmDelete ] = useState(false);
    const { deleteAccount, showStatus } = api();

    const submitDelete = () => {
        const id = selectedAccount?.ids ? Array.from(selectedAccount.ids)[0] : undefined;
        return deleteAccount(id, () => {
            setAccounts((accounts) => accounts.filter(i => i.id !== id));
            showStatus('success', 'Account deleted');
            setShowConfirmDelete(false);
            setSelectedAccount({ type: 'include', ids: new Set() });
        });
    };

    const editAccount = () => {
        const id = selectedAccount?.ids ? Array.from(selectedAccount.ids)[0] : undefined;
        setAccountToEdit(accounts.find(({ id: aid }) => aid === id));
        setShowAddDialog(true);
    };

    return (
        <>
            <Stack direction="row" spacing={1}>
                { (selectedAccount?.ids?.size ?? 0) === 0 && <AddButton onClick={() => setShowAddDialog(true)} />}
                { (selectedAccount?.ids?.size ?? 0) === 1 && <EditButton onClick={editAccount} />}
                { (selectedAccount?.ids?.size ?? 0) === 1 && <DeleteButton onClick={() => setShowConfirmDelete(true)} />}
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

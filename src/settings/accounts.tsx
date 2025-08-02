import { useState, useEffect } from 'react';
import AccountsGrid from './accounts-grid';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import { Title } from '../core/utils';
import AccountsActionButtons from './accounts-action-buttons';
import { GridRowId, GridRowSelectionModel } from '@mui/x-data-grid/models';

const Accounts = ({ isMobile, setRoute }) => {
    const issuers = state.useState(state.issuers)[0];
    const [ accounts, setAccounts ] = state.useState(state.accounts);
    const [ accountToEdit, setAccountToEdit ] = useState();
    const [ selectedAccount, setSelectedAccount ] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set<GridRowId>() });
    const [ showAddDialog, setShowAddDialog ] = useState(false);

    useEffect(() => setRoute('accounts'), []);

    return (
        <>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Title>Accounts</Title>
                <AccountsActionButtons {...{
                    issuers, accounts, setAccounts, accountToEdit, setAccountToEdit,
                    selectedAccount, showAddDialog, setShowAddDialog, setSelectedAccount,
                }} />
            </Stack>
            <AccountsGrid
                isMobile={isMobile}
                {...{
                    issuers, accounts, setAccounts, selectedAccount,
                    setSelectedAccount, setAccountToEdit, setShowAddDialog,
                }}
            />
        </>
    );
};
export default Accounts;

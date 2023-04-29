import { useState } from 'react';
import AccountsForm from './accounts-form';
import AccountsGrid from './accounts-grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import Title from '../core/title';

const Accounts = () => {
    const issuers = state.useState(state.issuers)[0];
    const [ accounts, setAccounts ] = state.useState(state.accounts);
    const [ showForm, setShowForm ] = useState(false);

    return (
        <>
            <Title>Accounts</Title>
            <Stack spacing={4} pb={3}>
                <AccountsGrid {...{ issuers, accounts, setAccounts }} />
                { showForm && <AccountsForm {...{ issuers, accounts, setAccounts, setShowForm }} /> }
                { !showForm && (
                    <Stack direction="row">
                        <Button
                            variant="contained"
                            onClick={() => setShowForm(true)}
                            sx={{ display: 'flex' }}
                        >
                            Add Account
                        </Button>
                    </Stack>
                )}
            </Stack>
        </>
    );
};
export default Accounts;

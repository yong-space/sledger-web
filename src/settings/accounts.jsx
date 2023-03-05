import { DataGrid } from '@mui/x-data-grid';
import { HorizontalLoader } from '../core/loader';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import api from '../core/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ConfirmDialog from '../core/confirm-dialog';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import TextField from '@mui/material/TextField';
import Title from '../core/title';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

const AccountsGrid = ({ accounts, setAccounts }) => {
    const { deleteAccount, showStatus } = api();
    const [ showConfirm, setShowConfirm ] = useState(false);
    const [ accountId, setAccountId ] = useState();

    const columns = [
        {
            flex: 1,
            field: 'issuer',
            headerName: 'Issuer',
            valueGetter: (params) => params.row.issuer.name,
        },
        {
            flex: 1,
            field: 'type',
            headerName: 'Type',
        },
        {
            flex: 2,
            field: 'name',
            headerName: 'Name',
        },
        {
            flex: 1,
            field: 'transactions',
            headerName: 'Transactions',
        },
        {
            flex: 1,
            field: 'delete', headerName: 'Delete',
            sortable: false,
            renderCell: ({ id }) => {
                const confirm = (e) => {
                    e.stopPropagation();
                    setAccountId(id);
                    setShowConfirm(true);
                };
                return <Button size="small" variant="outlined" color="error" onClick={confirm}>Delete</Button>;
            }
        },
    ];

    const submitDelete = () => deleteAccount(accountId, () => {
        setAccounts(accounts.filter(i => i.id !== accountId));
        showStatus('success', 'Account deleted');
        setShowConfirm(false);
    });

    const AccountsDataGrid = () => accounts.length === 0 ?
        <Alert severity="info" variant="outlined">No accounts added yet</Alert> :
        (
            <>
                <DataGrid
                    rows={accounts}
                    columns={columns}
                    autoHeight
                    disableColumnMenu
                    showColumnRightBorder
                    hideFooter
                />
                <ConfirmDialog
                    title="Confirm delete account?"
                    message="All transactions under this account will be permanently deleted"
                    open={showConfirm}
                    setOpen={setShowConfirm}
                    confirm={submitDelete}
                />
            </>
        );
    return <Box><AccountsDataGrid /></Box>;
};

const AccountsForm = ({ setAccounts }) => {
    const [ issuers, setIssuers ] = state.useState('issuers');
    const [ issuerId, setIssuerId ] = useState();
    const [ type, setType ] = useState('Cash');
    const [ loading, setLoading ] = state.useState('loading');
    const { addAccount, listIssuers, showStatus } = api();

    useEffect(() => {
        if (!issuers) {
            listIssuers((data) => setIssuers(data));
        }
    }, []);

    useEffect(() => {
        if (issuers) {
            setIssuerId(issuers[0].id);
        }
    }, [ issuers ]);

    const submit = (event) => {
        event.preventDefault();
        const newAccount = {
            ...Object.fromEntries(new FormData(event.target).entries()),
            type, issuerId,
        };
        if (newAccount.type === 'Credit' && (newAccount.billingCycle < 1 || newAccount.billingCycle > 30)) {
            showStatus('error', 'Billing cycle should be between 1 and 30');
            return;
        }

        setLoading(true);
        addAccount(newAccount, (response) => {
            setLoading(false);
            setAccounts((existing) => [ ...existing, response ]);
            showStatus('success', 'New account added');
            document.querySelector('#manage-accounts').reset();
        });
    };

    return !(issuers && issuerId) ? <HorizontalLoader /> : (
        <form id="manage-accounts" onSubmit={submit} autoComplete="off">
            <Grid container item xs={12} md={5} direction="column" gap={2}>
                <Typography variant="h6">
                    Add New Account
                </Typography>

                <ToggleButtonGroup
                    color="info"
                    value={type}
                    exclusive
                    fullWidth
                    onChange={(event, type) => setType(type)}
                    aria-label="account-type"
                >
                    <ToggleButton value="Cash" aria-label="Cash">
                        Cash
                    </ToggleButton>
                    <ToggleButton value="Credit" aria-label="Credit">
                        Credit
                    </ToggleButton>
                </ToggleButtonGroup>

                <FormControl fullWidth>
                    <InputLabel id="issuer-label">Issuer</InputLabel>
                    <Select
                        labelId="issuer-label"
                        label="Issuer"
                        defaultValue={issuers[0].id}
                        value={issuerId}
                        onChange={({ target }) => setIssuerId(target.value)}
                    >
                        { issuers.map(({ id, name }) => <MenuItem key={id} value={id}>{name}</MenuItem>) }
                    </Select>
                </FormControl>
                <TextField required name="name" label="Account name" inputProps={{ minLength: 3 }} />
                { type === 'Credit' && <TextField required name="billingCycle" label="Billing Cycle Start Date" defaultValue={1} inputProps={{ inputMode: 'numeric', pattern: '[0-9]+' }} /> }
                <LoadingButton
                    type="submit"
                    loading={loading}
                    loadingPosition="center"
                    variant="contained"
                >
                    Add Account
                </LoadingButton>
            </Grid>
        </form>
    );
};

const Accounts = () => {
    const [ accounts, setAccounts ] = state.useState('accounts');
    const { listAccounts } = api();

    useEffect(() => {
        if (!accounts) {
            listAccounts((data) => setAccounts(data));
        }
    }, []);

    return (
        <>
            <Title>Accounts</Title>
            { !accounts ? <HorizontalLoader /> : (
                <Stack spacing={4}>
                    <AccountsGrid {...{ accounts, setAccounts }} />
                    <AccountsForm {...{ setAccounts }} />
                </Stack>
            )}
        </>
    );
};
export default Accounts;

import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import api from '../core/api';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CpfSlider from './cpf-slider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

const AccountsForm = ({ issuers, accounts, setAccounts, setShowForm, accountToEdit, setAccountToEdit }) => {
    const [ issuerId, setIssuerId ] = useState(accountToEdit?.issuerId);
    const [ paymentAccount, setPaymentAccount ] = useState(accountToEdit?.paymentAccountId || 0);
    const [ type, setType ] = useState(accountToEdit?.type || 'Cash');
    const [ loading, setLoading ] = state.useState(state.loading);
    const [ cpfRatio, setCpfRatio ] = useState(!!accountToEdit ? {
        ordinaryRatio: accountToEdit.ordinaryRatio,
        specialRatio: accountToEdit.specialRatio,
        medisaveRatio: accountToEdit.medisaveRatio,
    } : {
        ordinaryRatio: 0.5677,
        specialRatio: 0.1891,
        medisaveRatio: 0.2432,
    });
    const { addAccount, editAccount, showStatus, listAccounts } = api();

    useEffect(() => {
        const defaultId = getIssuers()[0]?.id;
        if (!accountToEdit && defaultId) {
            setIssuerId(defaultId);
        }
    }, [ type ]);

    const postProcess = () => listAccounts((data) => {
        setShowForm(false);
        setAccounts(data);
        setLoading(false);
        setAccountToEdit(undefined);
        showStatus('success', accountToEdit ? 'Account edited' : 'New account added');
    });

    const submit = (event) => {
        event.preventDefault();
        let newAccount = {
            ...Object.fromEntries(new FormData(event.target).entries()),
            type, issuerId,
        };
        if (newAccount.multiCurrency) {
            newAccount.multiCurrency = true;
        }
        if (newAccount.type === 'Credit' && (newAccount.billingCycle < 1 || newAccount.billingCycle > 30)) {
            showStatus('error', 'Billing cycle should be between 1 and 30');
            return;
        }
        if (newAccount.type === 'Retirement') {
            newAccount = {
                ...newAccount,
                ...cpfRatio
            };
        }

        setLoading(true);
        if (!accountToEdit) {
            addAccount(newAccount, postProcess);
        } else {
            editAccount(accountToEdit.id, newAccount, postProcess);
        }
    };

    const getIssuers = () => issuers.filter(i => i.types.indexOf(type) > -1)
        .sort((a, b) => a.name > b.name);

    const hasCpfAccount = () => !accountToEdit && !!accounts.find(a => a.type === 'Retirement');

    const cpfAllocationInvalid = () =>
        cpfRatio.ordinaryRatio < 0.08 || cpfRatio.specialRatio < 0.08 || cpfRatio.medisaveRatio < 0.2162 ||
        Math.abs(1 - (cpfRatio.ordinaryRatio + cpfRatio.specialRatio + cpfRatio.medisaveRatio)) > 0.01;

    const submitDisabled = () => type === 'Retirement' &&
        ((!accountToEdit && !!accounts.find(a => a.type === 'Retirement')) || cpfAllocationInvalid());

    const fields = {
        name: (
            <TextField
                required
                key="name"
                name="name"
                label={`${type === 'Credit' ? 'Card' : 'Account'} name`}
                defaultValue={accountToEdit?.name}
                inputProps={{ minLength: 3 }}
            />
        ),
        billingCycle: (
            <TextField
                required
                key="billingCycle"
                name="billingCycle"
                label="Billing Cycle Start Date"
                defaultValue={accountToEdit?.billingCycle || 1}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]{1,2}' }}
            />
        ),
        multiCurrency: (
            <FormControlLabel
                key="multiCurrency"
                control={<Checkbox name="multiCurrency" defaultChecked={accountToEdit?.multiCurrency} />}
                label="Multi Currency"
            />
        ),
        paymentAccount: (
            <Tooltip
                key="paymentAccount"
                arrow
                placement="right"
                title="Cash account used to pay the bills for this card"
            >
                <FormControl fullWidth>
                    <InputLabel id="payment-account-label">
                        Payment Account
                    </InputLabel>
                    <Select
                        name="paymentAccount"
                        label="Payment Account"
                        labelId="payment-account-label"
                        value={paymentAccount}
                        onChange={({ target }) => setPaymentAccount(target.value)}
                    >
                        <MenuItem value={0}>None</MenuItem>
                        { accounts.filter(a => a.type === 'Cash').map(({ id, name }) => (
                            <MenuItem key={id} value={id}>{name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Tooltip>
        ),
        paymentRemarks: paymentAccount > 0 && (
            <Tooltip
                key="paymentRemarks"
                arrow
                placement="right"
                title="Match transactions from payment account above with these remarks"
            >
                <TextField
                    required
                    name="paymentRemarks"
                    label="Payment Remarks"
                    defaultValue={accountToEdit?.paymentRemarks}
                    inputProps={{ minLength: 3 }}
                />
            </Tooltip>
        ),
        issuer: getIssuers().map(i => i.id).indexOf(issuerId) > -1 && (
            <FormControl key="issuer" fullWidth>
                <InputLabel id="issuer-label">
                    { type === 'Cash' ? 'Bank' : 'Issuer' }
                </InputLabel>
                <Select
                    label={ type === 'Cash' ? 'Bank' : 'Issuer' }
                    labelId="issuer-label"
                    value={issuerId}
                    onChange={({ target }) => setIssuerId(target.value)}
                >
                    { getIssuers().map(({ id, name }) => <MenuItem key={id} value={id}>{name}</MenuItem>) }
                </Select>
            </FormControl>
        ),
        singleAccountInfo: hasCpfAccount() && (
            <Alert key="singleAccountInfo" severity="info" variant="outlined">
                You can only have 1 retirement account
            </Alert>
        ),
        cpfSlider: !hasCpfAccount() && <CpfSlider key="cpfSlider" {...{ cpfRatio, setCpfRatio, cpfAllocationInvalid }} />,
    };

    const fieldMap = {
        Cash: [ fields.issuer, fields.name, fields.multiCurrency ],
        Credit: [ fields.issuer, fields.name, fields.billingCycle, fields.paymentAccount, fields.paymentRemarks ],
        Retirement: [ fields.singleAccountInfo, fields.cpfSlider ],
    };

    const AccountTypeToggle = () => (
        <ToggleButtonGroup
            color="info"
            value={type}
            exclusive
            fullWidth
            onChange={(e, type) => setType(type)}
            aria-label="account-type"
        >
            {[ 'Cash', 'Credit', 'Retirement' ].map((accountType) => (
                <ToggleButton key={accountType} value={accountType} aria-label={accountType}>
                    {accountType}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );

    return (
        <form onSubmit={submit} autoComplete="off">
            <Grid container item xs={12} md={5} direction="column" gap={2}>
                <Typography variant="h6">
                    { !!accountToEdit ? 'Edit' : 'Add New' } Account
                </Typography>

                { !accountToEdit && <AccountTypeToggle /> }

                { fieldMap[type] }

                <Stack direction="row" gap={2}>
                    <LoadingButton
                        type="submit"
                        loading={loading}
                        loadingPosition="center"
                        variant="contained"
                        disabled={submitDisabled()}
                    >
                        { !!accountToEdit ? 'Edit' : 'Add' } Account
                    </LoadingButton>
                    <Button
                        color="info"
                        variant="outlined"
                        onClick={() => {
                            setAccountToEdit(undefined);
                            setShowForm(false);
                        }}
                    >
                        Cancel
                    </Button>
                </Stack>
            </Grid>
        </form>
    );
};
export default AccountsForm;

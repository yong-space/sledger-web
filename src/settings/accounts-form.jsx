import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import api from '../core/api';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

const AccountsForm = ({ issuers, accounts, setAccounts, setShowForm }) => {
    const [ issuerId, setIssuerId ] = useState();
    const [ paymentAccount, setPaymentAccount ] = useState(0);
    const [ type, setType ] = useState('Cash');
    const [ loading, setLoading ] = state.useState(state.loading);
    const { addAccount, showStatus, listAccounts } = api();
    const [ cpfRatio, setCpfRatio ] = useState({
        ordinaryRatio: 0.5677,
        specialRatio: 0.1891,
        medisaveRatio: 0.2432,
    });
    const getCpfSliderValue = () => [
        cpfRatio.ordinaryRatio,
        (cpfRatio.ordinaryRatio + cpfRatio.specialRatio)
    ];
    const updateCpfSlider = (event, newValue) => setCpfRatio({
        ordinaryRatio: newValue[0],
        specialRatio: parseFloat((newValue[1] - newValue[0]).toFixed(4)),
        medisaveRatio: parseFloat((1 - newValue[1]).toFixed(4)),
    });

    const updateCpfRatio = ({ target }) => {
        if (isNaN(parseFloat(target.value))) {
            return;
        }
        const newRatio = {
            ...cpfRatio,
            [target.name]: parseFloat(target.value)
        };
        if (target.name === 'ordinaryRatio') {
            newRatio.specialRatio = parseFloat((1 - newRatio.ordinaryRatio - newRatio.medisaveRatio).toFixed(4));
        } else if (target.name === 'specialRatio') {
            newRatio.medisaveRatio = parseFloat((1 - newRatio.ordinaryRatio - newRatio.specialRatio).toFixed(4));
        } else {
            newRatio.specialRatio = parseFloat((1 - newRatio.ordinaryRatio - newRatio.medisaveRatio).toFixed(4));
        }
        setCpfRatio(newRatio);
    };

    const cpfAllocationInvalid = () =>
        cpfRatio.ordinaryRatio < 0.08 || cpfRatio.specialRatio < 0.08 || cpfRatio.medisaveRatio < 0.2162 ||
        Math.abs(1 - (cpfRatio.ordinaryRatio + cpfRatio.specialRatio + cpfRatio.medisaveRatio)) > 0.01;

    useEffect(() => {
        const defaultId = getIssuers()[0]?.id;
        if (defaultId) {
            setIssuerId(defaultId);
        }
    }, [ type ]);

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
        addAccount(newAccount, () => {
            listAccounts((data) => {
                setAccounts(data);
                setLoading(false);
                showStatus('success', 'New account added');
                document.querySelector('#manage-accounts').reset();
            });
        });
    };

    const getIssuers = () => issuers.filter(i => i.types.indexOf(type) > -1)
        .sort((a, b) => a.name > b.name);

    const hasCpfAccount = () => !!accounts.find(a => a.type === 'Retirement');

    const numericProps = { inputMode: 'numeric', pattern: '0.[0-9]{1,4}' };

    const fields = {
        name: (
            <TextField
                required
                key="name"
                name="name"
                label={`${type === 'Credit' ? 'Card' : 'Account'} name`}
                inputProps={{ minLength: 3 }}
            />
        ),
        billingCycle: (
            <TextField
                required
                key="billingCycle"
                name="billingCycle"
                label="Billing Cycle Start Date"
                defaultValue={1}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]{1,2}' }}
            />
        ),
        multiCurrency: (
            <FormControlLabel
                key="multiCurrency"
                control={<Checkbox name="multiCurrency" />}
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
        cpfSlider: !hasCpfAccount() && (
            <Slider
                key="allocationSlider"
                value={getCpfSliderValue()}
                onChange={updateCpfSlider}
                track={false}
                color="secondary"
                disableSwap
                min={0}
                max={1}
                step={0.0001}
            />
        ),
        ordinaryRatio: !hasCpfAccount() && (
            <TextField
                required
                name="ordinaryRatio"
                key="ordinaryRatio"
                label="Ordinary Ratio"
                value={cpfRatio.ordinaryRatio}
                onChange={updateCpfRatio}
                inputProps={numericProps}
            />
        ),
        specialRatio: !hasCpfAccount() && (
            <TextField
                required
                name="specialRatio"
                key="specialRatio"
                label="Special Ratio"
                value={cpfRatio.specialRatio}
                onChange={updateCpfRatio}
                inputProps={numericProps}
            />
        ),
        medisaveRatio: !hasCpfAccount() && (
            <TextField
                required
                name="medisaveRatio"
                key="medisaveRatio"
                label="Medisave Ratio"
                value={cpfRatio.medisaveRatio}
                onChange={updateCpfRatio}
                inputProps={numericProps}
            />
        ),
        cpfRatioError: cpfAllocationInvalid() && (
            <Alert key="cpfRatioError" severity="error" variant="outlined">
                Account allocation ratio is invalid
            </Alert>
        ),
    };

    const fieldMap = {
        Cash: [ fields.issuer, fields.name, fields.multiCurrency ],
        Credit: [ fields.issuer, fields.name, fields.billingCycle, fields.paymentAccount, fields.paymentRemarks ],
        Retirement: [ fields.singleAccountInfo, fields.cpfSlider, fields.ordinaryRatio, fields.specialRatio, fields.medisaveRatio, fields.cpfRatioError ],
    };

    const submitDisabled = () => type === 'Retirement' &&
        (!!accounts.find(a => a.type === 'Retirement') || cpfAllocationInvalid());

    return (
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
                    onChange={(e, type) => setType(type)}
                    aria-label="account-type"
                >
                    {[ 'Cash', 'Credit', 'Retirement' ].map((accountType) => (
                        <ToggleButton key={accountType} value={accountType} aria-label={accountType}>
                            {accountType}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>

                { fieldMap[type] }
                <Stack direction="row" gap={2}>
                    <LoadingButton
                        type="submit"
                        loading={loading}
                        loadingPosition="center"
                        variant="contained"
                        disabled={submitDisabled()}
                    >
                        Add Account
                    </LoadingButton>
                    <Button
                        variant="outlined"
                        onClick={() => setShowForm(false)}
                    >
                        Cancel
                    </Button>
                </Stack>
            </Grid>
        </form>
    );
};
export default AccountsForm;

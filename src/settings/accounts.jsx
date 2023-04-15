import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import api from '../core/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import ConfirmDialog from '../core/confirm-dialog';
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
import styled from 'styled-components';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Title from '../core/title';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/Visibility';

const IssuerChip = styled(Chip)`
    border-radius: .5rem;
    color: #${props => props.colour};
    border-color: #${props => props.colour};
`;

const FxRoot = styled.sup`
    font-size: .8rem;
    position: relative;
    top: -.3rem;
    left: .1rem;
`;
const Fx = () => <FxRoot>Fx</FxRoot>;

const AccountsGrid = ({ issuers, accounts, setAccounts }) => {
    const { deleteAccount, editAccountVisibility, showStatus } = api();
    const [ showConfirm, setShowConfirm ] = useState(false);
    const [ accountId, setAccountId ] = useState();
    const colors = {
        'Cash': 'success',
        'Credit': 'warning',
        'Retirement': 'info',
    };

    const getIssuer = (id) => issuers.find(i => i.id === id);

    const updateVisibility = (event, id) => editAccountVisibility(id, event.target.checked, () => {
        showStatus('success', 'Updated visibility');
        setAccounts((accounts) => accounts.map(account =>
            (account.id !== id) ? account : { ...account, visible: event.target.checked }));
    });

    const columns = [
        {
            field: 'visible',
            renderHeader: () => <VisibilityIcon sx={{ ml: '1rem' }} />,
            renderCell: ({ id, row }) => <Switch defaultChecked={row.visible} onChange={(e) => updateVisibility(e, id)} />,
        },
        {
            field: 'type',
            headerName: 'Type',
            width: '109',
            renderCell: ({ value }) => <Chip sx={{ borderRadius: '.5rem' }} label={value} color={colors[value]} />
        },
        {
            field: 'issuer',
            headerName: 'Issuer',
            valueGetter: ({ row }) => getIssuer(row.issuerId).name,
            renderCell: ({ row }) => <IssuerChip colour={getIssuer(row.issuerId).colour} label={getIssuer(row.issuerId).name} variant="outlined" />
        },
        {
            field: 'name',
            headerName: 'Name',
            renderCell: ({ row }) => (
                <>
                    {row.name}
                    {row.multiCurrency && <Fx />}
                </>
            )
        },
        {
            field: 'transactions',
            headerName: 'Transactions',
            type: 'number',
            width: '103',
            valueGetter: ({ row }) => row.transactions || 0,
        },
        {
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

    const Empty = () => (
        <Alert severity="info" variant="outlined">
            No accounts added yet. Add your first account below.
        </Alert>
    );

    const NoVisible = () => (
        <Alert severity="warning" variant="outlined" sx={{ marginBottom: '2rem' }}>
            No accounts are visible. Please enable visibility on at least one account.
        </Alert>
    );

    const AccountsDataGrid = () =>
        accounts.length === 0 ? <Empty /> : (
            <>
                { accounts.filter(a => a.visible).length === 0 && <NoVisible /> }
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

const AccountsForm = ({ issuers, accounts, setAccounts }) => {
    const [ issuerId, setIssuerId ] = useState();
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

    const fields = {
        name: <TextField key="name" required name="name" label={`${type === 'Credit' ? 'Card' : 'Account'} name`} inputProps={{ minLength: 3 }} />,
        billingCycle: <TextField key="billingCycle" required name="billingCycle" label="Billing Cycle Start Date" defaultValue={1} inputProps={{ inputMode: 'numeric', pattern: '[0-9]+' }} />,
        multiCurrency: <FormControlLabel key="multiCurrency" control={<Checkbox name="multiCurrency" />} label="Multi Currency" />,
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
        singleAccountInfo: accounts.find(a => a.type === 'Retirement') && (
            <Alert key="singleAccountInfo" severity="info" variant="outlined">
                You can only have 1 retirement account
            </Alert>
        ),
        cpfSlider: (
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
        ordinaryRatio: <TextField name="ordinaryRatio" key="ordinaryRatio" required label="Ordinary Ratio" inputProps={{ inputMode: 'numeric', pattern: '0.[0-9]{1,4}' }} value={cpfRatio.ordinaryRatio} onChange={updateCpfRatio} />,
        specialRatio: <TextField name="specialRatio" key="specialRatio" required label="Special Ratio" inputProps={{ inputMode: 'numeric', pattern: '0.[0-9]{1,4}' }} value={cpfRatio.specialRatio} onChange={updateCpfRatio} />,
        medisaveRatio: <TextField name="medisaveRatio" key="medisaveRatio" required label="Medisave Ratio" inputProps={{ inputMode: 'numeric', pattern: '0.[0-9]{1,4}' }} value={cpfRatio.medisaveRatio} onChange={updateCpfRatio} />,
        cpfRatioError: cpfAllocationInvalid() && (
            <Alert key="cpfRatioError" severity="error" variant="outlined">
                Account allocation ratio is invalid
            </Alert>
        ),
    };

    const fieldMap = {
        Cash: [ fields.issuer, fields.name, fields.multiCurrency ],
        Credit: [ fields.issuer, fields.name, fields.billingCycle ],
        Retirement: [ fields.singleAccountInfo, fields.cpfSlider, fields.ordinaryRatio, fields.specialRatio, fields.medisaveRatio, fields.cpfRatioError ],
    };

    const submitDisabled = () =>
        type === 'Retirement' && (
            !!accounts.find(a => a.type === 'Retirement') ||
            cpfAllocationInvalid()
        );

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

                <LoadingButton
                    type="submit"
                    loading={loading}
                    loadingPosition="center"
                    variant="contained"
                    disabled={submitDisabled()}
                >
                    Add Account
                </LoadingButton>
            </Grid>
        </form>
    );
};

const Accounts = () => {
    const issuers = state.useState(state.issuers)[0];
    const [ accounts, setAccounts ] = state.useState(state.accounts);
    return (
        <>
            <Title>Accounts</Title>
            <Stack spacing={4} pb={3}>
                <AccountsGrid {...{ issuers, accounts, setAccounts }} />
                <AccountsForm {...{ issuers, accounts, setAccounts }} />
            </Stack>
        </>
    );
};
export default Accounts;

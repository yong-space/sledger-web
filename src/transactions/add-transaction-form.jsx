import 'dayjs/locale/en-sg';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import api from '../core/api';
import Autocomplete from '@mui/material/Autocomplete';
import AutoFill from './auto-fill';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import minMax from 'dayjs/plugin/minMax';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import useMediaQuery from '@mui/material/useMediaQuery';
import utc from 'dayjs/plugin/utc';

const ForeignCurrencyBar = styled.div`
    display: flex;
    gap: 1rem;
    & :first-child { width: 8rem }
`;

const AddTransactionDialog = ({ showAddDialog, setShowAddDialog, transactionToEdit, setTransactionToEdit }) => {
    dayjs.extend(utc);
    dayjs.extend(minMax);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [ side, setSide ] = useState();
    const [ date, setDate ] = useState('');
    const [ month, setMonth ] = useState('');
    const [ inputCurrency, setInputCurrency ] = useState(transactionToEdit?.currency || '');
    const [ currency, setCurrency ] = useState('');
    const [ ordinaryAmount, setOrdinaryAmount ] = useState(transactionToEdit?.ordinaryAmount || '');
    const [ specialAmount, setSpecialAmount ] = useState(transactionToEdit?.specialAmount || '');
    const [ medisaveAmount, setMedisaveAmount ] = useState(transactionToEdit?.medisaveAmount || '');
    const [ loading, setLoading ] = state.useState(state.loading);
    const selectedAccount = state.useState(state.selectedAccount)[0];
    const [ transactions, setTransactions ] = state.useState(state.transactions);
    const setAccounts = state.useState(state.accounts)[1];
    const {
        listAccounts, addTransaction, editTransaction, listTransactions,
        showStatus, suggestRemarks, suggestCategory, suggestCode, suggestCompany,
    } = api();

    useEffect(() => {
        if (!transactionToEdit) {
            const defaultDate = dayjs().utc().startOf('day');
            setDate(defaultDate);
            if (selectedAccount?.type === 'Credit') {
                if (defaultDate.get('date') < selectedAccount.billingCycle) {
                    setMonth(defaultDate.subtract(1, 'month').startOf('month'));
                } else {
                    setMonth(defaultDate.startOf('month'));
                }
            } else if (selectedAccount?.type === 'Retirement') {
                setMonth(defaultDate.startOf('month'));
            }
            setSide(-1);
            return;
        }
        setSide(transactionToEdit.amount > 0 ? 1 : -1);
        setDate(dayjs(transactionToEdit.date));
        if (selectedAccount?.type === 'Credit') {
            setMonth(dayjs(transactionToEdit.billingMonth));
        } else if (selectedAccount?.type === 'Retirement') {
            setMonth(dayjs(transactionToEdit.forMonth));
        }
    }, [ selectedAccount, transactionToEdit ]);

    const submit = (event) => {
        event.preventDefault();
        const tx = {
            date: date.toISOString(),
            account: { id: selectedAccount.id },
            ...Object.fromEntries(new FormData(event.target).entries()),
        };
        if (selectedAccount.type !== 'Retirement') {
            tx.amount *= side;
        }
        if (tx.originalAmount) {
            tx.originalAmount *= side;
        }
        tx['@type'] = selectedAccount.multiCurrency ? 'fx' : selectedAccount.type.toLowerCase();
        if (selectedAccount.type === 'Credit') {
            tx.billingMonth = month.toISOString();
        } else if (selectedAccount.type === 'Retirement') {
            tx.forMonth = month.toISOString();
        }
        if (transactionToEdit) {
            tx.id = transactionToEdit.id;
        }
        const maxDate = dayjs.max(transactions.map(t => dayjs(t.date)));

        setLoading(true);
        const endpoint = transactionToEdit ? editTransaction : addTransaction;
        const verb = transactionToEdit ? 'edited' : 'added';
        endpoint(tx, (response) => {
            if (dayjs(response.date).isAfter(maxDate)) {
                setTransactions((t) => [ ...t, response ]);
                setShowAddDialog(false);
                showStatus('success', 'Transaction ' + verb);
                setTimeout(() => setLoading(false), 500);
            } else {
                listTransactions(selectedAccount.id, (response) => {
                    setTransactions(response);
                    setShowAddDialog(false);
                    showStatus('success', 'Transaction ' + verb);
                    setTransactionToEdit(undefined);
                    setTimeout(() => setLoading(false), 500);
                });
            }
            listAccounts((data) => setAccounts(data));
        });
    };

    const dismiss = () => {
        setShowAddDialog(false);
        setTransactionToEdit(undefined);
    };

    const updateAmount = ({ target }) => {
        if (selectedAccount?.type === 'Retirement') {
            const amount = target.value;
            setOrdinaryAmount((amount * parseFloat(selectedAccount.ordinaryRatio)).toFixed(2));
            setSpecialAmount((amount * parseFloat(selectedAccount.specialRatio)).toFixed(2));
            setMedisaveAmount((amount * parseFloat(selectedAccount.medisaveRatio)).toFixed(2));
        }
    };

    const fields = {
        date: (
            <DatePicker
                key="date"
                label="Date"
                value={date}
                onChange={(newValue) => setDate(newValue)}
                slotProps={{ textField: { variant: 'outlined' } }}
            />
        ),
        month: (
            <DatePicker
                key="month"
                views={[ 'year', 'month' ]}
                label={`${selectedAccount.type === 'Credit' ? 'Billing' : 'For'} Month`}
                value={month}
                onChange={(newValue) => setMonth(newValue)}
                slotProps={{ textField: { variant: 'outlined' } }}
            />
        ),
        creditDebit: (
            <ToggleButtonGroup
                key="creditDebit"
                color="info"
                value={side}
                exclusive
                fullWidth
                onChange={(event, s) => setSide(s)}
            >
                <ToggleButton value={1} aria-label="Credit">
                    Credit
                </ToggleButton>
                <ToggleButton value={-1} aria-label="Debit">
                    Debit
                </ToggleButton>
            </ToggleButtonGroup>
        ),
        amount: (
            <TextField
                key="amount"
                id="amount"
                required
                defaultValue={transactionToEdit && Math.abs(transactionToEdit.amount)}
                name="amount"
                label="Amount"
                onChange={updateAmount}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]+\.?[0-9]*' }}
            />
        ),
        fx: (
            <ForeignCurrencyBar key="fx">
                <Autocomplete
                    disableClearable
                    freeSolo
                    inputValue={inputCurrency}
                    onInputChange={(e, v) => setInputCurrency(v)}
                    value={currency}
                    onChange={(e, v) => setCurrency(v)}
                    options={[ 'USD', 'SGD', 'EUR', 'GBP', 'JPY', 'KRW' ]}
                    renderInput={(params) => <TextField required name="currency" label="Currency" inputProps={{ minLength: 3, maxLength: 3 }} {...params} />}
                />
                <TextField fullWidth required defaultValue={transactionToEdit && Math.abs(transactionToEdit.originalAmount)} name="originalAmount" label="Original Amount" inputProps={{ inputMode: 'numeric', pattern: '[0-9]+\.?[0-9]*' }} />
            </ForeignCurrencyBar>
        ),
        remarks: (
            <AutoFill
                key="remarks"
                promise={suggestRemarks}
                initValue={transactionToEdit?.remarks}
                fieldProps={{
                    required: true,
                    inputProps: { minLength: 2 },
                    name: 'remarks',
                    label: 'Remarks'
                }}
            />
        ),
        category: (
            <AutoFill
                key="category"
                promise={suggestCategory}
                initValue={transactionToEdit?.category}
                fieldProps={{
                    required: true,
                    inputProps: { minLength: 2 },
                    name: 'category',
                    label: 'Category'
                }}
            />
        ),
        code: (
            <AutoFill
                key="code"
                promise={suggestCode}
                initValue={transactionToEdit?.code}
                fieldProps={{
                    required: true,
                    inputProps: { minLength: 2 },
                    name: 'code',
                    label: 'Code'
                }}
            />
        ),
        company: (
            <AutoFill
                key="company"
                promise={suggestCompany}
                initValue={transactionToEdit?.company}
                fieldProps={{
                    required: true,
                    inputProps: { minLength: 2 },
                    name: 'company',
                    label: 'Company'
                }}
            />
        ),
        ordinaryAmount: <TextField key="ordinaryAmount" required value={ordinaryAmount} onChange={({ target }) => setOrdinaryAmount(target.value)} name="ordinaryAmount" label="Ordinary Amount" inputProps={{ inputMode: 'numeric', pattern: '[0-9]+\.?[0-9]*' }} />,
        specialAmount: <TextField key="specialAmount" required value={specialAmount} onChange={({ target }) => setSpecialAmount(target.value)} name="specialAmount" label="Special Amount" inputProps={{ inputMode: 'numeric', pattern: '[0-9]+\.?[0-9]*' }} />,
        medisaveAmount: <TextField key="medisaveAmount" required value={medisaveAmount} onChange={({ target }) => setMedisaveAmount(target.value)} name="medisaveAmount" label="Medisave Amount" inputProps={{ inputMode: 'numeric', pattern: '[0-9]+\.?[0-9]*' }} />,
    };

    const fieldMap = {
        Cash: [ fields.date, fields.creditDebit, fields.amount, fields.remarks, fields.category ],
        CashFX: [ fields.date, fields.creditDebit, fields.amount, fields.fx, fields.remarks, fields.category ],
        Credit: [ fields.date, fields.month, fields.creditDebit, fields.amount, fields.remarks, fields.category ],
        Retirement: [ fields.date, fields.month, fields.code, fields.company, fields.amount, fields.ordinaryAmount, fields.specialAmount, fields.medisaveAmount ],
    };

    const addTransactionForm = (
        <form onSubmit={submit} autoComplete="off">
            <Stack spacing={2} mt={1}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-sg">
                    { fieldMap[selectedAccount.type + (selectedAccount.multiCurrency ? 'FX' : '')] }
                </LocalizationProvider>

                <Stack direction="row" spacing={2}>
                    <LoadingButton
                        type="submit"
                        loading={loading}
                        loadingPosition="center"
                        variant="contained"
                        color={transactionToEdit ? "warning" : "success"}
                    >
                        { transactionToEdit ? 'Edit' : 'Add' } Transaction
                    </LoadingButton>
                    <Button variant="contained" onClick={dismiss} autoFocus>
                        Cancel
                    </Button>
                </Stack>
            </Stack>
        </form>
    );

    return (
        <Dialog
            fullWidth
            fullScreen={isMobile}
            open={showAddDialog}
            aria-labelledby="add-transaction-dialog-title"
            aria-describedby="add-transaction-dialog-description"
        >
            <DialogTitle id="add-transaction-dialog-title">
                Add Transaction
            </DialogTitle>
            <DialogContent>
                { addTransactionForm }
            </DialogContent>
        </Dialog>
    );
};
export default AddTransactionDialog;

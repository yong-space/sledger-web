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

const AddTransactionDialog = ({ setShowAddDialog, transactionToEdit, setTransactionToEdit }) => {
    dayjs.extend(utc);
    dayjs.extend(minMax);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [ side, setSide ] = useState();
    const [ date, setDate ] = useState('');
    const [ month, setMonth ] = useState('');
    const [ inputCurrency, setInputCurrency ] = useState(transactionToEdit?.currency || '');
    const [ currency, setCurrency ] = useState('');
    const [ amountValue, setAmountValue ] = useState(Math.abs(transactionToEdit?.amount) || '');
    const [ cpfAmounts, setCpfAmounts ] = useState({
        ordinaryAmount: transactionToEdit?.ordinaryAmount || '',
        specialAmount: transactionToEdit?.specialAmount || '',
        medisaveAmount: transactionToEdit?.medisaveAmount || '',
    });
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

    const updateCpfAmounts = ({ target }) => {
        setAmountValue(target.value);

        if (selectedAccount?.type === 'Retirement') {
            const code = target.closest('form').code.value;
            if (code === 'CON') {
                setCpfAmounts({
                    ordinaryAmount: (target.value * parseFloat(selectedAccount.ordinaryRatio)).toFixed(2),
                    specialAmount: (target.value * parseFloat(selectedAccount.specialRatio)).toFixed(2),
                    medisaveAmount: (target.value * parseFloat(selectedAccount.medisaveRatio)).toFixed(2)
                });
            } else {
                setCpfAmounts({
                    ordinaryAmount: target.value,
                    specialAmount: 0,
                    medisaveAmount: 0
                });
            }
        }
    };

    const updateAmount = ({ target }) => {
        const newCpfAmounts = { ...cpfAmounts, [target.name]: target.value };
        setCpfAmounts(newCpfAmounts);
        setAmountValue(Object.values(newCpfAmounts).reduce((a, i) => a + (parseFloat(i) || 0), 0).toFixed(2));
    };

    const numericProps = {
        inputMode: 'numeric',
        pattern: '\-?[0-9]+\.?[0-9]{0,2}',
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
                name="amount"
                label="Amount"
                value={amountValue}
                onChange={updateCpfAmounts}
                inputProps={numericProps}
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
                    renderInput={(params) => (
                        <TextField
                            required
                            name="currency"
                            label="Currency"
                            inputProps={{ minLength: 3, maxLength: 3 }}
                            {...params}
                        />
                    )}
                />
                <TextField
                    fullWidth
                    required
                    defaultValue={transactionToEdit && Math.abs(transactionToEdit.originalAmount)}
                    name="originalAmount"
                    label="Original Amount"
                    inputProps={numericProps}
                />
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
                    name: 'company',
                    label: 'Company'
                }}
            />
        ),
        ordinaryAmount: (
            <TextField
                required
                key="ordinaryAmount"
                name="ordinaryAmount"
                label="Ordinary Amount"
                value={cpfAmounts.ordinaryAmount}
                onChange={updateAmount}
                inputProps={numericProps}
            />
        ),
        specialAmount: (
            <TextField
                required
                key="specialAmount"
                name="specialAmount"
                label="Special Amount"
                value={cpfAmounts.specialAmount}
                onChange={updateAmount}
                inputProps={numericProps}
            />
        ),
        medisaveAmount: (
            <TextField
                required
                key="medisaveAmount"
                name="medisaveAmount"
                label="Medisave Amount"
                value={cpfAmounts.medisaveAmount}
                onChange={updateAmount}
                inputProps={numericProps}
            />
        ),
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
                        color={transactionToEdit ? 'warning' : 'success'}
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
            open
            fullWidth
            fullScreen={isMobile}
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

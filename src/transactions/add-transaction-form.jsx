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
    const [ date, setDate ] = useState();
    const [ billingMonth, setBillingMonth ] = useState();
    const [ editAmount, setEditAmount ] = useState();
    const [ editOriginalAmount, setEditOriginalAmount ] = useState();
    const [ editCurrency, setEditCurrency ] = useState();
    const [ editCategory, setEditCategory ] = useState();
    const [ editRemarks, setEditRemarks ] = useState('');
    const [ inputCurrency, setInputCurrency ] = useState(editCurrency || '');
    const [ currency, setCurrency ] = useState();
    const [ loading, setLoading ] = state.useState(state.loading);
    const selectedAccount = state.useState(state.selectedAccount)[0];
    const [ transactions, setTransactions ] = state.useState(state.transactions);
    const setAccounts = state.useState(state.accounts)[1];
    const {
        addTransaction, editTransaction, listTransactions,
        showStatus, suggestRemarks, suggestCategory, listAccounts,
    } = api();

    useEffect(() => {
        if (!transactionToEdit) {
            const defaultDate = dayjs().utc().startOf('day');
            setDate(defaultDate);
            if (selectedAccount?.type === 'Credit') {
                if (defaultDate.get('date') < selectedAccount.billingCycle) {
                    setBillingMonth(defaultDate.subtract(1, 'month').startOf('month'));
                } else {
                    setBillingMonth(defaultDate.startOf('month'));
                }
            }
            setSide(-1);
            setEditAmount(undefined);
            setEditOriginalAmount(undefined);
            setEditCurrency(undefined);
            setEditCategory(undefined);
            setEditRemarks('');
            return;
        }
        setSide(transactionToEdit.amount > 0 ? 1 : -1);
        setDate(dayjs(transactionToEdit.date));
        setBillingMonth(dayjs(transactionToEdit.billingMonth));
        setEditAmount(Math.abs(transactionToEdit.amount));
        setEditCategory(transactionToEdit.category);
        setEditRemarks(transactionToEdit.remarks);
    }, [ selectedAccount, transactionToEdit ]);

    const submit = (event) => {
        event.preventDefault();
        const tx = {
            date: date.toISOString(),
            account: { id: selectedAccount.id },
            ...Object.fromEntries(new FormData(event.target).entries()),
        };
        tx.amount *= side;
        tx['@type'] = selectedAccount.multiCurrency ? 'fx' : selectedAccount.type.toLowerCase();
        if (selectedAccount.type === 'Credit') {
            tx.billingMonth = billingMonth.toISOString();
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

    const AddTransactionForm = () => !selectedAccount ? <></> : (
        <form onSubmit={submit} autoComplete="off">
            <Stack spacing={2} mt={1}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-sg">
                    <DatePicker
                        label="Date"
                        value={date}
                        onChange={(newValue) => setDate(newValue)}
                        slotProps={{ textField: { variant: 'outlined' } }}
                    />
                    { selectedAccount.type === 'Credit' && (
                        <DatePicker
                            views={[ 'year', 'month' ]}
                            label="Billing Month"
                            value={billingMonth}
                            onChange={(newValue) => setBillingMonth(newValue)}
                            slotProps={{ textField: { variant: 'outlined' } }}
                        />
                    )}
                </LocalizationProvider>
                <ToggleButtonGroup
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

                <TextField required defaultValue={editAmount} name="amount" label="Amount" inputProps={{ inputMode: 'numeric', pattern: '[0-9]+\.?[0-9]*' }} />

                { selectedAccount.multiCurrency && (
                    <ForeignCurrencyBar>
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
                        <TextField fullWidth required defaultValue={editOriginalAmount} name="originalAmount" label="Foreign Amount" inputProps={{ inputMode: 'numeric', pattern: '[0-9]+\.?[0-9]*' }} />
                    </ForeignCurrencyBar>
                )}
                <AutoFill
                    promise={suggestRemarks}
                    initValue={editRemarks}
                    fieldProps={{
                        required: true,
                        inputProps: { minLength: 2 },
                        name: 'remarks',
                        label: 'Remarks'
                    }}
                />
                <AutoFill
                    promise={suggestCategory}
                    initValue={editCategory}
                    fieldProps={{
                        required: true,
                        inputProps: { minLength: 2 },
                        name: 'category',
                        label: 'Category'
                    }}
                />
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
                <AddTransactionForm />
            </DialogContent>
        </Dialog>
    );
};
export default AddTransactionDialog;

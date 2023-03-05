import 'dayjs/locale/en-sg';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useState, useEffect } from 'react';
import api from '../core/api';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import minMax from 'dayjs/plugin/minMax';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import utc from 'dayjs/plugin/utc';

const AddTransactionDialog = ({ showAddDialog, setShowAddDialog, editTransaction }) => {
    dayjs.extend(utc);
    dayjs.extend(minMax);
    const [ side, setSide ] = useState(-1);
    const [ date, setDate ] = useState();
    const [ billingMonth, setBillingMonth ] = useState();
    const [ loading, setLoading ] = state.useState('loading');
    const selectedAccount = state.useState('selectedAccount')[0];
    const [ transactions, setTransactions ] = state.useState('transactions');
    const { addTransaction, listTransactions, showStatus } = api();

    useEffect(() => {
        setDate(dayjs().utc().startOf('day'));
    }, []);

    useEffect(() => {
        if (selectedAccount?.type !== 'Credit' || !date) {
            return;
        }
        if (date.get('date') < selectedAccount.billingCycle) {
            setBillingMonth(date.subtract(1, 'month').startOf('month'));
        } else {
            setBillingMonth(date.startOf('month'));
        }
    }, [ selectedAccount, date ]);

    const submit = (event) => {
        event.preventDefault();
        const tx = {
            date: date.toISOString(),
            account: { id: selectedAccount.id },
            ...Object.fromEntries(new FormData(event.target).entries()),
        };
        tx.amount *= side;
        tx['@type'] = selectedAccount.type.toLowerCase();
        if (selectedAccount.type === 'Credit') {
            tx.billingMonth = billingMonth.toISOString()
        }
        const maxDate = dayjs.max(transactions.map(t => dayjs(t.date)));

        setLoading(true);
        addTransaction(tx, (response) => {
            setLoading(false);
            if (dayjs(response.date).isAfter(maxDate)) {
                setTransactions((t) => [ ...t, response ]);
                setShowAddDialog(false);
                showStatus('success', 'Transaction added');
            } else {
                listTransactions(selectedAccount.id, (response) => {
                    setTransactions(response);
                    setShowAddDialog(false);
                    showStatus('success', 'Transaction added');
                });
            }
        });
    };

    const AddTransactionForm = () => {
        return !selectedAccount ? <></> : (
            <Stack spacing={2} mt={1}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-sg">
                    <DatePicker
                        label="Date"
                        value={date}
                        onChange={(newValue) => setDate(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    { selectedAccount.type === 'Credit' && (
                        <DatePicker
                            views={[ 'year', 'month' ]}
                            label="Billing Month"
                            value={billingMonth}
                            onChange={(newValue) => setBillingMonth(newValue)}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    ) }
                </LocalizationProvider>
                <ToggleButtonGroup
                    color="info"
                    value={side}
                    exclusive
                    fullWidth
                    onChange={(event, s) => setSide(s)}
                    aria-label="account-type"
                >
                    <ToggleButton value={1} aria-label="Credit">
                        Credit
                    </ToggleButton>
                    <ToggleButton value={-1} aria-label="Debit">
                        Debit
                    </ToggleButton>
                </ToggleButtonGroup>
                <TextField required name="amount" label="Amount" inputProps={{ inputMode: 'numeric', pattern: '[0-9]+\.?[0-9]*' }} />
                <TextField required name="category" label="Category" inputProps={{ minLength: 2 }} />
                <TextField required name="remarks" label="Remarks" inputProps={{ minLength: 2 }} />
            </Stack>
        );
    };

    return (
        <Dialog
            open={showAddDialog}
            aria-labelledby="add-transaction-dialog-title"
            aria-describedby="add-transaction-dialog-description"
        >
            <form onSubmit={submit} autoComplete="off">
                <DialogTitle id="add-transaction-dialog-title">
                    Add Transaction
                </DialogTitle>
                <DialogContent>
                    <AddTransactionForm />
                </DialogContent>
                <DialogActions>
                    <LoadingButton
                        type="submit"
                        loading={loading}
                        loadingPosition="center"
                        variant="contained"
                        color="success"
                    >
                        Add Transaction
                    </LoadingButton>
                    <Button variant="contained" onClick={() => setShowAddDialog(false)} autoFocus>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
export default AddTransactionDialog;

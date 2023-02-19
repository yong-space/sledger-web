import 'dayjs/locale/en-sg';
import utc from 'dayjs/plugin/utc';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { atoms } from '../core/atoms';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import api from '../core/api';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

const AddTransactionForm = ({ open, setOpen }) => {
    dayjs.extend(utc);
    const [ side, setSide ] = useState(-1);
    const [ date, setDate ] = useState(dayjs().utc().startOf('day'));
    const [ loading, setLoading ] = useRecoilState(atoms.loading);
    const selectedAccount = useRecoilState(atoms.selectedAccount)[0];
    const setTransactions = useRecoilState(atoms.transactions)[1];
    const { addTransaction, showStatus } = api();

    const submit = (event) => {
        event.preventDefault();
        const tx = {
            date,
            account: { id: selectedAccount.id },
            ...Object.fromEntries(new FormData(event.target).entries()),
        };
        tx.amount *= side;
        tx['@type'] = selectedAccount.type.toLowerCase();
        setLoading(true);

        addTransaction(tx, (response) => {
            setLoading(false);
            setTransactions((t) => [ ...t, response ]);
            setOpen(false);
            showStatus('success', 'Transaction added');
        });
    };

    return (
        <Dialog
            open={open}
            aria-labelledby="add-transaction-dialog-title"
            aria-describedby="add-transaction-dialog-description"
        >
            <form onSubmit={submit} autoComplete="off">
                <DialogTitle id="add-transaction-dialog-title">
                    Add Transaction
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-sg">
                            <DatePicker
                                label="Date"
                                value={date}
                                onChange={(newValue) => setDate(newValue)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider>
                        <ToggleButtonGroup
                            color="primary"
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
                    <Button variant="outlined" onClick={() => setOpen(false)} autoFocus>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
export default AddTransactionForm;

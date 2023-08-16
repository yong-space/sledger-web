import 'dayjs/locale/en-sg';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import api from '../core/api';
import AutoFill from './auto-fill';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import useMediaQuery from '@mui/material/useMediaQuery';
import utc from 'dayjs/plugin/utc';

const BulkTransactionDialog = ({
    setShowBulkDialog, transactionToEdit, setTransactionToEdit,
 }) => {
    dayjs.extend(utc);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [ loading, setLoading ] = state.useState(state.loading);
    const selectedAccount = state.useState(state.selectedAccount)[0];
    const [ transactions, setTransactions ] = state.useState(state.transactions);
    const [ month, setMonth ] = useState();

    const {
        bulkEditTransactions, suggestRemarks, suggestCategory, showStatus,
    } = api();

    const submit = (event) => {
        event.preventDefault();
        const { category, remarks } = Object.fromEntries(new FormData(event.target).entries());
        const values = {
            ids: transactionToEdit,
            category: category.trim().length === 0 ? null : category.trim(),
            remarks: remarks.trim().length === 0 ? null : remarks.trim(),
        };
        if (selectedAccount?.type === 'Credit') {
            values.billingMonth = month?.utc().startOf('month').toISOString();
        }
        setLoading(true);
        bulkEditTransactions(values, () => {
            const revised = [ ...transactions ].map((t) =>
                (transactionToEdit.indexOf(t.id) === -1) ? t : ({
                    ...t,
                    billingMonth: values.billingMonth || t.billingMonth,
                    category: values.category || t.category,
                    remarks: values.remarks || t.remarks,
                })
            );
            setTransactions(revised);
            setShowBulkDialog(false);
            showStatus('success', 'Transactions edited');
            setTransactionToEdit(undefined);
            setLoading(false);
        });
    };

    const dismiss = () => {
        setShowBulkDialog(false);
        setTransactionToEdit(undefined);
    };

    const bulkTransactionForm = (
        <form onSubmit={submit} autoComplete="off">
            <Stack spacing={2} mt={1}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    { selectedAccount?.type === 'Credit' && (
                        <DatePicker
                            openTo="month"
                            views={[ 'year', 'month' ]}
                            label="Billing Month"
                            format="YYYY MMM"
                            onChange={(newValue) => setMonth(newValue)}
                            slotProps={{ textField: { variant: 'outlined' } }}
                        />
                    )}
                    <AutoFill
                        promise={suggestRemarks}
                        fieldProps={{
                            inputProps: { minLength: 2 },
                            name: 'remarks',
                            label: 'Remarks'
                        }}
                    />
                    <AutoFill
                        promise={suggestCategory}
                        fieldProps={{
                            inputProps: { minLength: 2 },
                            name: 'category',
                            label: 'Category'
                        }}
                    />
                </LocalizationProvider>

                <Stack direction="row" spacing={2}>
                    <LoadingButton
                        type="submit"
                        loading={loading}
                        loadingPosition="center"
                        variant="contained"
                        color="warning"
                    >
                        Bulk Edit Transactions
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
            aria-labelledby="bulk-transaction-dialog-title"
            aria-describedby="bulk-transaction-dialog-description"
        >
            <DialogTitle id="bulk-transaction-dialog-title">
                Bulk Edit Transactions
            </DialogTitle>
            <DialogContent>
                { bulkTransactionForm }
            </DialogContent>
        </Dialog>
    );
};
export default BulkTransactionDialog;
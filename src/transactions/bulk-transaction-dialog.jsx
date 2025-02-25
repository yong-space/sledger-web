import 'dayjs/locale/en-sg';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createFilterOptions } from '@mui/material/Autocomplete';
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
import Stack from '@mui/material/Stack';
import state from '../core/state';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import utc from 'dayjs/plugin/utc';

const BulkTransactionDialog = ({
    setShowBulkDialog, transactionToEdit, setTransactionToEdit, apiRef,
 }) => {
    dayjs.extend(utc);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [ loading, setLoading ] = state.useState(state.loading);
    const selectedAccount = state.useState(state.selectedAccount)[0];
    const [ transactions, setTransactions ] = state.useState(state.transactions);
    const [ month, setMonth ] = useState();
    const [ categories, setCategories ] = state.useState(state.categories);
    const [ category, setCategory ] = useState('');

    const {
        bulkEditTransactions, suggestRemarks, showStatus, getCategories,
    } = api();

    useEffect(() => {
        if (categories.length > 0) {
            return;
        }
        getCategories((response) => {
            const processed = response.map(({ category, subCategory}) =>
                subCategory && subCategory !== category ? `${category}: ${subCategory}` : category);
            setCategories(processed);
        });
    }, []);

    const submit = (event) => {
        event.preventDefault();
        const { category, remarks } = Object.fromEntries(new FormData(event.target).entries());

        const parts = category.trim().length === 0 ? null : category.split(':');
        const processedCategory = parts ? parts.shift().trim() : null;
        const processedSubCategory = parts ? (parts.join(':').trim() || processedCategory) : null;

        const values = {
            ids: transactionToEdit,
            category: processedCategory,
            subCategory: processedSubCategory,
            remarks: remarks.trim().length === 0 ? null : remarks.trim(),
        };
        if (selectedAccount?.type === 'Credit') {
            values.billingMonth = month?.utc().startOf('month').toISOString();
        }

        if (Object.values(values).filter(i => i).length === 1) {
            showStatus('warning', 'Enter at least 1 value to edit');
            return;
        }
        setLoading(true);
        bulkEditTransactions(values, () => {
            const category = values.category && values.category.indexOf(':') === -1
                    && values.subCategory && values.subCategory !== values.category
                ? `${values.category}: ${values.subCategory}`
                : values.category;

            const changes = {};
            if (category) { changes.category = category; }
            if (values.billingMonth) { changes.billingMonth = values.billingMonth; }
            if (values.subCategory) { changes.subCategory = values.subCategory; }
            if (values.remarks) { changes.remarks = values.remarks; }

            transactionToEdit.forEach((id) => apiRef.current.updateRows([{ id, ...changes }]));

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
                    <Autocomplete
                        freeSolo
                        options={categories}
                        filterOptions={createFilterOptions({ limit: 5 })}
                        value={category}
                        onChange={(e, v) => setCategory(v)}
                        renderInput={(params) => (
                            <TextField
                                name="category"
                                label="Category"
                                {...params}
                            />
                        )}
                    />
                </LocalizationProvider>

                <Stack direction="row" spacing={2}>
                    <Button
                        type="submit"
                        loading={loading}
                        loadingPosition="center"
                        variant="contained"
                        color="warning"
                    >
                        Bulk Edit Transactions
                    </Button>
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
                These changes will apply to {transactionToEdit.length} transactions
                { bulkTransactionForm }
            </DialogContent>
        </Dialog>
    );
};
export default BulkTransactionDialog;

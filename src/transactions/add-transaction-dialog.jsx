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

const AddTransactionDialog = ({
    setShowAddDialog, transactionToEdit, setTransactionToEdit, setSelectedRows,
 }) => {
    dayjs.extend(utc);
    dayjs.extend(minMax);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [ side, setSide ] = useState(-1);
    const [ date, setDate ] = state.useState(state.date);
    const [ month, setMonth ] = useState(dayjs().utc().startOf('day'));
    const [ inputCurrency, setInputCurrency ] = useState(transactionToEdit?.currency || '');
    const [ currency, setCurrency ] = useState('');
    const [ code, setCode ] = useState(transactionToEdit?.code || '');
    const [ amountValue, setAmountValue ] = useState(Math.abs(transactionToEdit?.amount) || 0);
    const [ cpfAmounts, setCpfAmounts ] = useState({
        ordinaryAmount: transactionToEdit?.ordinaryAmount || 0,
        specialAmount: transactionToEdit?.specialAmount || 0,
        medisaveAmount: transactionToEdit?.medisaveAmount || 0,
    });
    const [ loading, setLoading ] = state.useState(state.loading);
    const selectedAccount = state.useState(state.selectedAccount)[0];
    const [ transactions, setTransactions ] = state.useState(state.transactions);
    const setAccounts = state.useState(state.accounts)[1];
    const [ categories, setCategories ] = state.useState(state.categories);
    const [ categoryOptions, setCategoryOptions ] = useState([]);
    const [ subCategoryOptions, setSubCategoryOptions ] = useState([]);
    const [ category, setCategory ] = useState('');
    const [ subCategory, setSubCategory ] = useState('');
    const [ categoryMap, setCategoryMap ] = useState({});
    const setVisibleTransactionId = state.useState(state.visibleTransactionId)[1];
    const {
        listAccounts, addTransaction, editTransaction, listTransactions,
        showStatus, suggestRemarks, suggestCode, suggestCompany, getCategories,
    } = api();

    useEffect(() => {
        if (categories.length === 0) {
            getCategories((response) => setCategories(response));
        }
    }, []);

    const prepareOptions = (array, field) => ([
        ...new Set(array.map((s) => s[field]))
    ].map((o) => ({ label: o })));

    useEffect(() => {
        setCategoryOptions(prepareOptions(categories, 'category'));
        setSubCategoryOptions(prepareOptions(categories, 'subCategory'));
        setCategoryMap(
            categories.reduce((o, c) => ({ ...o, [c.subCategory]: c.category }), {})
        );
    }, [ categories ]);

    useEffect(() => {
        if (!transactionToEdit) {
            return;
        }
        setSide(transactionToEdit.amount > 0 ? 1 : -1);
        setDate(dayjs(transactionToEdit.date));
        if (selectedAccount?.type === 'Credit') {
            setMonth(dayjs(transactionToEdit.billingMonth));
        } else if (selectedAccount?.type === 'Retirement') {
            setMonth(dayjs(transactionToEdit.forMonth));
        }
        setCategory(transactionToEdit.category || '');
        setSubCategory(transactionToEdit.subCategory || '');
    }, [ selectedAccount, transactionToEdit ]);

    useEffect(() => {
        if (selectedAccount?.type === 'Credit') {
            if (date.get('date') < selectedAccount.billingCycle) {
                setMonth(date.subtract(1, 'month').startOf('month'));
            } else {
                setMonth(date.startOf('month'));
            }
        }
    }, [ date ]);

    const submit = (event) => {
        event.preventDefault();
        const tx = {
            date: date.toISOString(),
            accountId: selectedAccount.id,
            ...Object.fromEntries(new FormData(event.target).entries()),
        };
        if (tx.remarks) {
            tx.remarks = tx.remarks.trim();
        }
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
            tx.code = tx.code.toUpperCase();
            if (code === 'CON') {
                tx.forMonth = month.toISOString();
            } else {
                delete tx.forMonth;
            }
        }
        if (transactionToEdit) {
            tx.id = transactionToEdit.id;
        }
        const maxDate = dayjs.max(transactions.map(t => dayjs(t.date)));

        setLoading(true);
        const endpoint = transactionToEdit ? editTransaction : addTransaction;

        const postProcess = (response, tx) => {
            setTransactions(tx);
            setSelectedRows(response.map(({ id }) => id));
            setShowAddDialog(false);
            showStatus('success', 'Transaction ' + (transactionToEdit ? 'edited' : 'added'));
            setTransactionToEdit(undefined);
            setVisibleTransactionId(response[0].id);
            setTimeout(() => setLoading(false), 500);
        };

        endpoint([ tx ], (response) => {
            const minDate = dayjs.min(response.map(t => dayjs(t.date)));
            if (transactionToEdit) {
                postProcess(response, transactions.map((t) => response.find((r) => r.id === t.id) || t));
            } else if (minDate.isAfter(maxDate)) {
                postProcess(response, [ ...transactions, ...response ]);
            } else {
                listTransactions(selectedAccount.id, (allTx) => postProcess(response, allTx));
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
            if (code === 'CON') {
                const value = isNaN(parseFloat(target.value)) ? 0 : target.value;
                setCpfAmounts({
                    ordinaryAmount: (value * parseFloat(selectedAccount.ordinaryRatio)).toFixed(2),
                    specialAmount: (value * parseFloat(selectedAccount.specialRatio)).toFixed(2),
                    medisaveAmount: (value * parseFloat(selectedAccount.medisaveRatio)).toFixed(2)
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

    const restrictFormat = (value, allowNegative) => {
        const pattern = allowNegative ? /[^0-9.\-]/g : /[^0-9.]/g;
        value = value.replace(pattern, '');
        const dotIndex = value.indexOf('.');
        if (dotIndex >= 0) {
            value = value.slice(0, dotIndex + 3);
        }
        return value;
    };

    const numericProps = {
        inputMode: 'numeric',
        pattern: '\-?[0-9]+\.?[0-9]{0,2}',
        onInput: (e) => e.target.value = restrictFormat(e.target.value, false),
    };

    const numericPropsNegative = {
        inputMode: 'numeric',
        pattern: '\-?[0-9]+\.?[0-9]{0,2}',
        onInput: (e) => e.target.value = restrictFormat(e.target.value, true),
    };

    const lookupCategory = (e, value) => {
        if (!value) {
            return;
        }
        const match = transactions.find((t) => t.remarks === value);
        if (match) {
            setCategory(match.category);
            setSubCategory(match.subCategory);
        }
    };

    const fields = {
        date: (
            <DatePicker
                key="date"
                label="Date"
                value={date}
                format="YYYY-MM-DD"
                onChange={(newValue) => setDate(newValue)}
                slotProps={{ textField: { variant: 'outlined' } }}
            />
        ),
        month: (
            <DatePicker
                key="month"
                openTo="month"
                views={[ 'year', 'month' ]}
                label={`${selectedAccount.type === 'Credit' ? 'Billing' : 'For'} Month`}
                value={month}
                format="YYYY MMM"
                onChange={(newValue) => setMonth(newValue)}
                slotProps={{ textField: { variant: 'outlined' } }}
                sx={{ display: (selectedAccount.type === 'Credit' || code === 'CON') ? 'flex' : 'none' }}
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
                onChange={lookupCategory}
            />
        ),
        category: (
            <Autocomplete
                key="category"
                freeSolo
                options={categoryOptions}
                filterOptions={createFilterOptions({ limit: 5 })}
                value={category}
                onChange={(e, v) => setCategory(v)}
                renderInput={(params) => (
                    <TextField
                        required
                        inputProps={{ minLength: 2 }}
                        name="category"
                        label="Category"
                        {...params}
                    />
                )}
            />
        ),
        subCategory: (
            <Autocomplete
                key="subCategory"
                freeSolo
                defaultValue={transactionToEdit?.subCategory}
                options={subCategoryOptions}
                filterOptions={createFilterOptions({ limit: 5 })}
                value={subCategory}
                onChange={(e, v) => setSubCategory(v)}
                onInputChange={(e, value) => setCategory((old) => categoryMap[value] || old)}
                renderInput={(params) => (
                    <TextField
                        name="subCategory"
                        label="Sub-category"
                        {...params}
                    />
                )}
            />
        ),
        code: (
            <AutoFill
                key="code"
                promise={suggestCode}
                value={code}
                onChange={(e, v) => setCode(v.toUpperCase())}
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
                inputProps={numericPropsNegative}
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
                inputProps={numericPropsNegative}
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
                inputProps={numericPropsNegative}
            />
        ),
    };

    const cashFields = [
        fields.date,
        fields.creditDebit,
        fields.amount,
        fields.remarks,
        fields.category,
        fields.subCategory,
    ];
    const cpfFields = [
        fields.date,
        fields.code,
        fields.month,
        fields.company,
        fields.amount,
        fields.ordinaryAmount,
        fields.specialAmount,
        fields.medisaveAmount,
    ];

    const getFields = () => {
        if (selectedAccount.type === 'Retirement') {
            return cpfFields;
        }
        const result = [ ...cashFields ];
        if (selectedAccount.multiCurrency) {
            result.splice(3, 0, fields.fx);
        }
        if (selectedAccount.type === 'Credit') {
            result.splice(1, 0, fields.month);
        }
        return result;
    };

    const addTransactionForm = (
        <form onSubmit={submit} autoComplete="off">
            <Stack spacing={2} mt={1}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    { getFields() }
                </LocalizationProvider>

                <Stack direction="row" justifyContent="space-between">
                    <LoadingButton
                        type="submit"
                        loading={loading}
                        loadingPosition="center"
                        variant="contained"
                        color={transactionToEdit ? 'warning' : 'success'}
                    >
                        { transactionToEdit ? 'Save Changes' : 'Add Transaction' }
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
                { transactionToEdit ? 'Edit' : 'Add' } Transaction
            </DialogTitle>
            <DialogContent>
                { addTransactionForm }
            </DialogContent>
        </Dialog>
    );
};
export default AddTransactionDialog;

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/en-sg';
import minMax from 'dayjs/plugin/minMax';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../core/api';
import state from '../core/state';
import { cpfCodes } from '../util/cpf-codes';
import { numericProps, numericPropsNegative } from '../util/formatters';
import AutoFill from './auto-fill';
import FxField from './fx-field';
import { isMultiCurrency, Transaction } from '../core/types';

const DateBar = styled.div`
    display: flex;
    justify-content: space-between;
    gap: .7rem;
`;

const DateButton = styled(IconButton)`
    height: fit-content;
    align-self: center;
`

const AddTransactionDialog = ({
    setShowAddDialog, transactionToEdit, setTransactionToEdit, setSelectedRows, apiRef,
 }) => {
    dayjs.extend(utc);
    dayjs.extend(minMax);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [ side, setSide ] = useState(-1);
    const [ date, setDate ] = state.useState(state.date);
    const [ month, setMonth ] = useState(dayjs.utc().startOf('day'));

    const [ currency, setCurrency ] = state.useState(state.currency);
    const [ code, setCode ] = useState(transactionToEdit?.code || '');
    const [ amountValue, setAmountValue ] = useState(Math.abs(transactionToEdit?.amount) || 0);
    const [ originalAmount, setOriginalAmount ] = useState(Math.abs(transactionToEdit?.originalAmount) || 0);
    const [ cpfAmounts, setCpfAmounts ] = useState({
        ordinaryAmount: transactionToEdit?.ordinaryAmount || 0,
        specialAmount: transactionToEdit?.specialAmount || 0,
        medisaveAmount: transactionToEdit?.medisaveAmount || 0,
    });
    const [ loading, setLoading ] = state.useState(state.loading);
    const [ accounts, setAccounts ] = state.useState(state.accounts);
    const selectedAccount = !transactionToEdit ? state.useState(state.selectedAccount)[0]
        : accounts.find(({ id }) => id === transactionToEdit.accountId);
    const [ categories, setCategories ] = state.useState(state.categories);
    const [ category, setCategory ] = useState('');
    const setVisibleTransactionId = state.useState(state.visibleTransactionId)[1];
    const {
        listAccounts, addTransaction, editTransaction, listTransactions,
        showStatus, suggestRemarks, suggestCompany, getCategories,
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

    useEffect(() => {
        if (!transactionToEdit) {
            return;
        }
        setSide(transactionToEdit.amount > 0 ? 1 : -1);
        setDate(dayjs.utc(transactionToEdit.date));
        if (selectedAccount?.type === 'Credit') {
            setMonth(dayjs.utc(transactionToEdit.billingMonth));
        } else if (selectedAccount?.type === 'Retirement') {
            setMonth(dayjs.utc(transactionToEdit.forMonth));
        }
        if (transactionToEdit.category) {
            setCategory(transactionToEdit.category);
        }
        if (transactionToEdit.currency) {
            setCurrency(transactionToEdit.currency);
        }
    }, [ selectedAccount, transactionToEdit ]);

    useEffect(() => {
        if (selectedAccount?.type === 'Credit') {
            if (transactionToEdit && date.isSame(dayjs.utc(transactionToEdit.date))) {
                setMonth(dayjs.utc(transactionToEdit.billingMonth));
                return;
            }
            let offset = selectedAccount.billingMonthOffset || 0;
            if (date.get('date') < selectedAccount?.billingCycle) {
                offset -= 1;
            }
            if (category && category.toLowerCase() === 'credit card bill') {
                offset -= 1;
            }
            setMonth(date.add(offset, 'month').startOf('month'));

        } else if (selectedAccount?.type === 'Retirement') {
            setMonth(date.subtract(1, 'month').startOf('month'));
        }
    }, [ transactionToEdit, date, category ]);

    const submit = (event) => {
        event.preventDefault();
        const tx : Transaction = {
            date: (transactionToEdit ? date : date.second(0)).toISOString(),
            accountId: selectedAccount?.id,
            ...Object.fromEntries(new FormData(event.target).entries()),
        };

        if (tx.category) {
            const parts = tx.category.split(':');
            tx.category = parts.shift().trim();
            tx.subCategory = parts.join(':').trim() || tx.category;
        }
        if (tx.remarks) {
            tx.remarks = tx.remarks.trim();
        }
        if (selectedAccount?.type !== 'Retirement') {
            tx.amount *= side;
        }
        if (tx.originalAmount) {
            tx.originalAmount *= side;
        }
        if (tx.code && tx.code.indexOf(':') > -1) {
            tx.code = tx.code.split(':').shift();
        }
        const fxPrefix = isMultiCurrency(selectedAccount) ? 'fx-' : '';
        tx['@type'] = fxPrefix + selectedAccount.type.toLowerCase();
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
        const currentTransactions : Transaction[] = Array.from(apiRef.current.getRowModels().values());
        const maxDate = dayjs.max(currentTransactions.map(({ date }) => dayjs.utc(date)));

        setLoading(true);
        const endpoint = transactionToEdit ? editTransaction : addTransaction;

        const postProcess = (response, tx) => {
            const processedTx = tx.map((o) => {
                const category = o.category && o.category.indexOf(':') === -1 && o.subCategory && o.subCategory !== o.category
                    ? `${o.category}: ${o.subCategory}`
                    : o.category;
                return { ...o, category };
            });

            processedTx
                .filter((row) => response.map(({ id }) => id).indexOf(row.id) > -1 || !apiRef.current.getRow(row.id) || row.balance !== apiRef.current.getRow(row.id).balance)
                .forEach((row) => apiRef.current.updateRows([ row ]));

            setSelectedRows(response.map(({ id }) => id));
            setShowAddDialog(false);
            showStatus('success', 'Transaction ' + (transactionToEdit ? 'edited' : 'added'));
            setTransactionToEdit(undefined);
            setVisibleTransactionId(response[0].id);
            setTimeout(() => setLoading(false), 500);
        };

        endpoint([ tx ], (response) => {
            const minDate = dayjs.min(response.map(t => dayjs.utc(t.date)));
            if (transactionToEdit) {
                const existing = apiRef.current.getRow(tx.id);
                if (existing.amount === tx.amount) {
                    postProcess(response, currentTransactions.map((t) => response.find((r) => r.id === t.id) || t));
                } else {
                    listTransactions(selectedAccount?.id, (allTx) => postProcess(response, allTx));
                }
            } else if (minDate.isAfter(maxDate)) {
                postProcess(response, [ ...currentTransactions, ...response ]);
            } else {
                listTransactions(selectedAccount?.id, (allTx) => postProcess(response, allTx));
            }
            listAccounts((data) => setAccounts(data));
        });
    };

    const dismiss = () => {
        setShowAddDialog(false);
        setTransactionToEdit(undefined);
    };

    const handleAmountChange = ({ target }) => {
        setAmountValue(target.value);
        if (selectedAccount?.type === 'Retirement') {
            updateCpfAmounts({ target });
        } else if (isMultiCurrency(selectedAccount) && currency === 'SGD') {
            setOriginalAmount(target.value);
        }
    };

    const handleFocus = ({ target }) => target.select();

    const updateCpfAmounts = ({ target }) => {
        if (selectedAccount.type === 'Retirement' && code === 'CON') {
            const value = isNaN(parseFloat(target.value)) ? 0 : target.value;
            setCpfAmounts({
                ordinaryAmount: (value * parseFloat(selectedAccount?.ordinaryRatio)).toFixed(2),
                specialAmount: (value * parseFloat(selectedAccount?.specialRatio)).toFixed(2),
                medisaveAmount: (value * parseFloat(selectedAccount?.medisaveRatio)).toFixed(2)
            });
        } else {
            setCpfAmounts({
                ordinaryAmount: target.value,
                specialAmount: 0,
                medisaveAmount: 0
            });
        }
    };

    const updateAmount = ({ target }) => {
        const newCpfAmounts = { ...cpfAmounts, [target.name]: target.value };
        setCpfAmounts(newCpfAmounts);
        setAmountValue(Object.values(newCpfAmounts).reduce((a, i) => a + (parseFloat(i) || 0), 0).toFixed(2));
    };

    const lookupCategory = (_, value) => {
        if (!value) {
            return;
        }
        const currentTransactions : Transaction[] = Array.from(apiRef.current.getRowModels().values());
        const match = currentTransactions.find((t) => t.remarks === value);
        if (match) {
            setCategory(match.category);
        }
    };

    const shiftDate = (amount, unit) => setDate(date.add(amount, unit).startOf('day'));

    const fields = {
        date: (
            <DateBar key="date">
                <DateButton onClick={() => shiftDate(-1, 'month')}>
                    <KeyboardDoubleArrowLeftIcon />
                </DateButton>
                <DateButton onClick={() => shiftDate(-1, 'day')}>
                    <KeyboardArrowLeftIcon />
                </DateButton>
                <DatePicker
                    label="Date"
                    value={date}
                    format="YYYY-MM-DD"
                    onChange={(newValue) => setDate(newValue)}
                    slotProps={{ textField: { variant: 'outlined' } }}
                    sx={{ flexGrow: 1 }}
                />
                <DateButton onClick={() => shiftDate(1, 'day')}>
                    <KeyboardArrowRightIcon />
                </DateButton>
                <DateButton onClick={() => shiftDate(1, 'month')}>
                    <KeyboardDoubleArrowRightIcon />
                </DateButton>
            </DateBar>
        ),
        month: (
            <DatePicker
                key="month"
                openTo="month"
                views={[ 'year', 'month' ]}
                label={`${selectedAccount?.type === 'Credit' ? 'Billing' : 'For'} Month`}
                value={month}
                format="YYYY MMM"
                onChange={(newValue) => setMonth(newValue)}
                slotProps={{ textField: { variant: 'outlined' } }}
                sx={{ display: (selectedAccount?.type === 'Credit' || code === 'CON') ? 'flex' : 'none' }}
            />
        ),
        creditDebit: (
            <ToggleButtonGroup
                key="creditDebit"
                color="info"
                value={side}
                exclusive
                fullWidth
                onChange={(_, s) => s && setSide(s)}
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
                onChange={handleAmountChange}
                slotProps={{ htmlInput: numericProps}}
                onFocus={handleFocus}
            />
        ),
        fx: (
            <FxField
                key="fx"
                transactionToEdit={transactionToEdit}
                originalAmount={originalAmount}
                setOriginalAmount={setOriginalAmount}
                currency={currency}
                setCurrency={setCurrency}
                amountValue={amountValue}
            />
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
                options={categories}
                filterOptions={createFilterOptions({ limit: 5 })}
                value={category}
                onChange={(_, v) => setCategory(v)}
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
        code: (
            <Autocomplete
                key="code"
                freeSolo
                autoComplete
                options={cpfCodes.map((c) => c.code)}
                filterOptions={createFilterOptions({ limit: 5 })}
                getOptionLabel={(o) => cpfCodes.find(({ code }) => code === o) ? (o + ': ' + cpfCodes.find(({ code }) => code === o).description) : o}
                renderInput={(params) => (
                    <TextField
                        required
                        inputProps={{ minLength: 3, maxLength: 3 }}
                        name="code"
                        label="Code"
                        {...params}
                    />
                )}
                value={code}
                onChange={(_, v) => setCode(v?.toUpperCase() || '')}
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
                sx={{ display: (code === 'CON') ? 'flex' : 'none' }}
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
                slotProps={{ htmlInput: numericPropsNegative }}
                onFocus={handleFocus}
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
                slotProps={{ htmlInput: numericPropsNegative }}
                onFocus={handleFocus}
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
                slotProps={{ htmlInput: numericPropsNegative }}
                onFocus={handleFocus}
            />
        ),
    };

    const cashFields = [
        fields.date,
        fields.creditDebit,
        fields.amount,
        fields.remarks,
        fields.category,
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
        if (isMultiCurrency(selectedAccount)) {
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
                    <Button
                        type="submit"
                        loading={loading}
                        loadingPosition="center"
                        variant="contained"
                        color={transactionToEdit ? 'warning' : 'success'}
                    >
                        { transactionToEdit ? 'Save Changes' : 'Add Transaction' }
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
            aria-labelledby="add-transaction-dialog-title"
            aria-describedby="add-transaction-dialog-description"
            onClose={() => setShowAddDialog(false)}
        >
            <DialogTitle id="add-transaction-dialog-title">
                { transactionToEdit ? 'Edit' : 'Add' } Transaction
            </DialogTitle>
            <DialogContent>
                { selectedAccount && addTransactionForm }
            </DialogContent>
        </Dialog>
    );
};
export default AddTransactionDialog;

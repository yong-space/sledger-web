import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CircularLoader } from '../core/loader';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { DataGrid, useGridApiContext } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { formatDate, formatMonth, formatDecimal } from '../util/formatters';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { red, green, blue, grey } from '@mui/material/colors';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import api from '../core/api';
import Autocomplete from '@mui/material/Autocomplete';
import AutoFill from './auto-fill';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import Dropzone from 'react-dropzone';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';

const ImportRoot = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 1px;
    gap: 1rem;
    padding-bottom: 1rem;
`;

const ImportGridRoot = styled.div`
    height: calc(100vh - 17rem);
`;

const ImportZone = styled.div`
    display: flex;
    flex: 1 1 1px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-width: 2px;
    border-style: dashed;
    border-radius: .3rem;
    color: ${props => props.isDragAccept ? green[400] : props.isDragReject ? red[400] : props.isFocused ? blue[400] : grey[400] };
    border-color: ${props => props.isDragAccept ? green[400] : props.isDragReject ? red[400] : props.isFocused ? blue[400] : grey[400] };
`;

const TransactionsImport = ({ setImportMode, selectedAccount }) => {
    const [ loading, setLoading ] = state.useState(state.loading);
    const [ importTransactions, setImportTransactions ] = useState();
    const [ transactions, setTransactions ] = state.useState(state.transactions);
    const [ categories, setCategories ] = state.useState(state.categories);
    const [ selectedRows, setSelectedRows ] = useState([]);
    const [ paginationModel, setPaginationModel ] = useState();
    const setParentSelectedRows = state.useState(state.selectedRows)[1];
    const setVisibleTransactionId = state.useState(state.visibleTransactionId)[1];
    const { uploadImport, addTransaction, showStatus, getCategories, suggestRemarks } = api();

    useEffect(() => {
        if (categories.length > 0) {
            return;
        }
        getCategories((response) => {
            const processed = response.map(({ category, subCategory }) =>
                subCategory && subCategory !== category ? `${category}: ${subCategory}` : category);
            setCategories(processed);
        });
    }, []);

    const maxGridSize = {
        maxWidth: `calc(100vw - 1rem)`,
        maxHeight: `calc(100vh - 14rem)`,
    };

    const onDrop = (acceptedFiles) => {
        const data = new FormData();
        data.append('file', acceptedFiles[0]);
        data.append('accountId', selectedAccount.id);
        setLoading(true);

        uploadImport(data, (response) => {
            const processedResponse = response.map((r) => ({
                ...r,
                category: r.subCategory && r.subCategory !== r.category
                    ? `${r.category}: ${r.subCategory}`
                    : r.category,
            }))
            setImportTransactions(processedResponse);
            setSelectedRows(response.map(({ id }) => id ));
            setLoading(false);
        });
    };

    const submitTransactions = () => {
        setLoading(true);
        const selectedTransactions = importTransactions
            .filter(({ id }) => selectedRows.indexOf(id) > -1)
            .map((r) => {
                const parts = r.category.split(':');
                const category = parts.shift().trim();
                const subCategory = parts.join(':').trim() || category;
                return { ...r, category, subCategory };
            });

        addTransaction(selectedTransactions, (response) => {
            const tx = [ ...transactions, ...response ].sort((a, b) => new Date(a.date) - new Date(b.date));
            setTransactions(tx);
            setParentSelectedRows(response.map(({ id }) => id));
            setVisibleTransactionId(response[0].id);
            setLoading(false);
            setImportMode(false);
            showStatus('success', selectedTransactions.length + ' Transactions imported');
        });
    };

    const DropZone = () => (
        <Dropzone
            accept={{
                'application/vnd.ms-excel': [ '.csv' ],
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [ '.xlsx' ],
            }}
            multiple={false}
            onDropAccepted={onDrop}
        >
            {({ getRootProps, getInputProps, isFocused, isDragAccept, isDragReject }) => (
                <ImportZone {...getRootProps()} {...{ isFocused, isDragAccept, isDragReject }}>
                    <input {...getInputProps()} />
                    Click to select exported file or drag file here
                </ImportZone>
            )}
        </Dropzone>
    );

    const DateEditor = (props) => {
        const { id, value, field } = props;
        const apiRef = useGridApiContext();

        return (
            <DatePicker
                label="Date"
                value={dayjs.utc(value)}
                format="YYYY-MM-DD"
                onChange={(v) => apiRef.current.setEditCellValue({ id, field, value: v.toISOString() })}
                slotProps={{ textField: { variant: 'outlined' } }}
            />
        );
    };

    const MonthEditor = (props) => {
        const { id, value, field } = props;
        const apiRef = useGridApiContext();

        return (
            <DatePicker
                openTo="month"
                views={[ 'year', 'month' ]}
                label={`${selectedAccount.type === 'Credit' ? 'Billing' : 'For'} Month`}
                value={dayjs.utc(value)}
                format="YYYY MMM"
                onChange={(v) => apiRef.current.setEditCellValue({ id, field, value: v.toISOString() })}
                slotProps={{ textField: { variant: 'outlined' } }}
            />
        );
    };

    const RemarksEditor = (props) => {
        const { id, value, field, hasFocus } = props;
        const apiRef = useGridApiContext();
        const ref = useRef();

        useLayoutEffect(() => {
          if (hasFocus) {
            ref.current.focus();
          }
        }, [ hasFocus ]);

        const handleChange = (e, v) => {
            apiRef.current.setEditCellValue({ id, field, value: v?.label || v });
            const match = transactions.find((t) => t.remarks === v);
            if (match) {
                apiRef.current.setEditCellValue({ id, field: 'category', value: match.category });
                apiRef.current.setEditCellValue({ id, field: 'subCategory', value: match.subCategory });
            }
        };

        return (
            <AutoFill
                promise={suggestRemarks}
                initValue={value || ""}
                onChange={handleChange}
                onBlur={(e) => handleChange(e, e.target.value)}
                disableClearable
                sx={{ flex: 1 }}
                fieldProps={{
                    inputRef: ref,
                    inputProps: { minLength: 2 },
                    name: 'remarks',
                    label: 'Remarks'
                }}
            />
        );
    }

    const CategoryEditor = (props) => {
        const { id, value, field, hasFocus } = props;
        const apiRef = useGridApiContext();
        const ref = useRef();

        useLayoutEffect(() => {
          if (hasFocus) {
            ref.current.focus();
          }
        }, [ hasFocus ]);

        const handleChange = (e, v) => {
            apiRef.current.setEditCellValue({ id, field, value: v?.label || v });
        };

        return (
            <Autocomplete
                freeSolo
                options={categories}
                filterOptions={createFilterOptions({ limit: 5 })}
                value={value || ""}
                onChange={handleChange}
                onBlur={(e) => handleChange(e, e.target.value)}
                disableClearable
                sx={{ flex: 1 }}
                renderInput={(params) => (
                    <TextField
                        inputRef={ref}
                        name="category"
                        label="Category"
                        {...params}
                    />
                )}
            />
        );
    };

    const ImportGrid = () => {
        const columns = {
            date: { editable: true, width: 100, field: 'date', headerName: 'Date', type: 'date', valueFormatter: formatDate, renderEditCell: (p) => <DateEditor {...p} /> },
            billingMonth: { editable: true, width: 100, field: 'billingMonth', headerName: 'Bill', type: 'date', valueFormatter: formatMonth, renderEditCell: (p) => <MonthEditor {...p} /> },
            forMonth: { editable: true, field: 'forMonth', headerName: 'Month' },
            amount: { editable: true, field: 'amount', headerName: 'Amount', type: 'number', valueFormatter: formatDecimal },
            originalAmount: { editable: true, field: 'originalAmount', type: 'number', headerName: 'Original', valueFormatter: formatDecimal },
            remarks: { editable: true, flex: 1, field: 'remarks', headerName: 'Remarks', renderEditCell: (p) => <RemarksEditor {...p} /> },
            category: { editable: true, width: 200, field: 'category', headerName: 'Category', renderEditCell: (p) => <CategoryEditor {...p} /> },
            code: { editable: true, field: 'code', headerName: 'Code' },
            company: { editable: true, field: 'company', headerName: 'Company' },
            ordinaryAmount: { editable: true, field: 'ordinaryAmount', headerName: 'Ordinary', type: 'number', valueFormatter: formatDecimal },
            specialAmount: { editable: true, field: 'specialAmount', headerName: 'Special', type: 'number', valueFormatter: formatDecimal },
            medisaveAmount: { editable: true, field: 'medisaveAmount', headerName: 'Medisave', type: 'number', valueFormatter: formatDecimal },
        };

        const cashFields = [ columns.date, columns.amount, columns.remarks, columns.category ];
        const creditFields = [ ...cashFields ];
        creditFields.splice(1, 0, columns.billingMonth);
        const retirementFields = [ columns.selector, columns.date, columns.forMonth, columns.code, columns.company, columns.amount, columns.ordinaryAmount, columns.specialAmount, columns.medisaveAmount ];

        const columnMap = {
            Cash: cashFields,
            Credit: creditFields,
            Retirement: retirementFields,
        };

        const processRowUpdate = (newRow) => {
            setImportTransactions((existing) => existing.map((row) => (row.id === newRow.id ? newRow : row)));
            return newRow;
        };

        const handleRowClick = (params, event) => {
            if (!event.shiftKey || selectedRows.length === 0) {
                return;
            }
            const selection = [ ...selectedRows, params.id ];
            const first = Math.min.apply(Math, selection);
            const last = Math.max.apply(Math, selection);
            const length = last - first + 1;
            setSelectedRows(Array.from({ length }, (e, i) => first + i));
        };

        return (
            <ImportGridRoot>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DataGrid
                        checkboxSelection
                        disableRowSelectionOnClick
                        autoPageSize
                        disableColumnMenu
                        showColumnRightBorder
                        density="compact"
                        rows={importTransactions}
                        columns={columnMap[selectedAccount.type]}
                        editMode="row"
                        processRowUpdate={processRowUpdate}
                        rowSelectionModel={selectedRows}
                        onRowSelectionModelChange={(m) => setSelectedRows(m)}
                        onRowClick={handleRowClick}
                        paginationModel={paginationModel}
                        onPaginationModelChange={(n) => setPaginationModel(n)}
                        sx={maxGridSize}
                    />
                </LocalizationProvider>
            </ImportGridRoot>
        );
    };

    const importDisabled = !importTransactions
        || selectedRows.length === 0
        || loading;

    return (
        <ImportRoot>
            {
                loading ? <CircularLoader /> :
                    !importTransactions ? <DropZone /> : <ImportGrid />
            }
            <Stack direction="row" spacing={2}>
                <Button
                    color="info"
                    variant="contained"
                    onClick={submitTransactions}
                    disabled={importDisabled}
                >
                    Import Transactions
                </Button>
                <Button
                    variant="contained"
                    onClick={() => setImportMode(false)}
                    disabled={loading}
                >
                    Cancel
                </Button>
            </Stack>
        </ImportRoot>
    );
};
export default TransactionsImport;

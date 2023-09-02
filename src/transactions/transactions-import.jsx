import { CircularLoader } from '../core/loader';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { DataGrid, useGridApiContext } from '@mui/x-data-grid';
import { formatDate, formatNumber, formatDecimal } from '../util/formatters';
import { red, green, blue, grey } from '@mui/material/colors';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import api from '../core/api';
import Autocomplete from '@mui/material/Autocomplete';
import AutoFill from './auto-fill';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
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
    const setPaginationModel = state.useState(state.paginationModel)[1];
    const [ transactions, setTransactions ] = state.useState(state.transactions);
    const [ checkHeader, setCheckHeader ] = useState({ checked: true, indeterminate: false });
    const [ categories, setCategories ] = state.useState(state.categories);
    const [ categoryOptions, setCategoryOptions ] = useState([]);
    const [ subCategoryOptions, setSubCategoryOptions ] = useState([]);
    const [ categoryMap, setCategoryMap ] = useState();
    const setSelectedRows = state.useState(state.selectedRows)[1];
    const { uploadImport, addTransaction, showStatus, getCategories, suggestRemarks } = api();

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

    const maxGridSize = {
        maxWidth: `calc(100vw - 3rem)`,
        maxHeight: `calc(100vh - 14rem)`,
    };

    const onDrop = (acceptedFiles) => {
        const data = new FormData();
        data.append('file', acceptedFiles[0]);
        data.append('accountId', selectedAccount.id);
        setLoading(true);

        uploadImport(data, (response) => {
            setImportTransactions(response.map((e) => ({ ...e, selected: true })));
            setLoading(false);
        });
    };

    const submitTransactions = () => {
        setLoading(true);
        const selectedTransactions = importTransactions.filter(({ selected }) => selected);

        addTransaction(selectedTransactions, (response) => {
            const tx = [ ...transactions, ...response ].sort((a, b) => new Date(a.date) - new Date(b.date));
            setTransactions(tx);
            setSelectedRows(response.map(({ id }) => id));
            const index = tx.map(({ id }) => id).indexOf(response[0].id) + 1;
            setPaginationModel((old) => ({ ...old, page: Math.floor(index / old.pageSize) }));
            setLoading(false);
            setImportMode(false);
            showStatus('success', 'Transactions imported');
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

    const isAllSelected = () => {
        const total = importTransactions.length;
        const selected = importTransactions.filter(({ selected }) => selected).length;
        return total === selected;
    };

    const toggleSelection = (row) => {
        row.selected = !row.selected;
        const allSelected = isAllSelected();
        setCheckHeader({
            checked: allSelected,
            indeterminate: !allSelected && importTransactions.filter(({ selected }) => selected).length > 0,
        });
    };

    const toggleMassSelection = () => {
        const allSelected = isAllSelected();
        setImportTransactions((old) => old.map((e) => ({ ...e, selected: !allSelected })));
        setCheckHeader({
            checked: !allSelected,
            indeterminate: false,
        });
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
        };

        return (
            <AutoFill
                promise={suggestRemarks}
                initValue={value || ""}
                onChange={handleChange}
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

        const handleInputChange = (e, v) => {
            if (!props.sub) {
                return;
            }
            const lookupCategory = categoryMap[v];
            if (lookupCategory) {
                apiRef.current.setEditCellValue({ id, field: 'category', value: lookupCategory });
            }
        };

        return (
            <Autocomplete
                freeSolo
                options={props.sub ? subCategoryOptions : categoryOptions}
                filterOptions={createFilterOptions({ limit: 5 })}
                value={value || ""}
                onChange={handleChange}
                onInputChange={handleInputChange}
                disableClearable
                sx={{ flex: 1 }}
                renderInput={(params) => (
                    <TextField
                        inputRef={ref}
                        name={props.sub ? "subCategory" : "category"}
                        label={props.sub ? "Sub-category" : "Category"}
                        {...params}
                    />
                )}
            />
        );
    };

    const ImportGrid = () => {
        const columns = {
            selector: {
                field: 'selected',
                headerName: 'Import?',
                renderHeader: (x) => <Checkbox checked={checkHeader.checked} indeterminate={checkHeader.indeterminate} onClick={toggleMassSelection} />,
                renderCell: ({ id, row }) => <Checkbox checked={row.selected} onClick={() => toggleSelection(row)} />,
                width: 70,
                sortable: false,
                type: 'boolean',
            },
            date: { editable: true, width: '100', field: 'date', headerName: 'Date', type: 'date', valueFormatter: formatDate },
            billingMonth: { editable: true, width: '100', field: 'billingMonth', headerName: 'Bill', type: 'date', valueFormatter: formatDate },
            forMonth: { editable: true, field: 'forMonth', headerName: 'Month' },
            amount: { editable: true, field: 'amount', headerName: 'Amount', type: 'number', valueFormatter: formatDecimal },
            originalAmount: { editable: true, field: 'originalAmount', type: 'number', headerName: 'Original', valueFormatter: formatDecimal },
            remarks: { editable: true, flex: 1, field: 'remarks', headerName: 'Remarks', renderEditCell: (p) => <RemarksEditor {...p} /> },
            category: { editable: true, field: 'category', headerName: 'Category', renderEditCell: (p) => <CategoryEditor {...p} /> },
            subCategory: { editable: true, field: 'subCategory', headerName: 'Sub-category', renderEditCell: (p) => <CategoryEditor sub {...p} /> },
            code: { editable: true, field: 'code', headerName: 'Code' },
            company: { editable: true, field: 'company', headerName: 'Company' },
            ordinaryAmount: { editable: true, field: 'ordinaryAmount', headerName: 'Ordinary', type: 'number', valueFormatter: formatDecimal },
            specialAmount: { editable: true, field: 'specialAmount', headerName: 'Special', type: 'number', valueFormatter: formatDecimal },
            medisaveAmount: { editable: true, field: 'medisaveAmount', headerName: 'Medisave', type: 'number', alueFormatter: formatDecimal },
        };

        const cashFields = [ columns.selector, columns.date, columns.amount, columns.remarks, columns.category, columns.subCategory ];
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

        return (
            <ImportGridRoot>
                <DataGrid
                    autoPageSize
                    disableColumnMenu
                    showColumnRightBorder
                    density="compact"
                    rows={importTransactions}
                    columns={columnMap[selectedAccount.type]}
                    editMode="row"
                    processRowUpdate={processRowUpdate}
                    sx={maxGridSize}
                />
            </ImportGridRoot>
        );
    };

    const importDisabled = !importTransactions
        || importTransactions.filter(({ selected }) => selected).length === 0
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

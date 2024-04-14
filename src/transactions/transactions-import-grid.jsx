import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { DataGrid, useGridApiContext } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { formatDate, formatMonth, formatDecimal } from '../util/formatters';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import api from '../core/api';
import Autocomplete from '@mui/material/Autocomplete';
import AutoFill from './auto-fill';
import ContextMenu from './context-menu';
import dayjs from 'dayjs';
import state from '../core/state';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';

const ImportGridRoot = styled.div`
    height: calc(100vh - 16rem);
`;

const CompactTextField = styled(TextField)`
    .MuiInputBase-input { padding: .4rem .7rem; font-size: 14px; }
`;

const CompactDatePicker = styled(DatePicker)`
    .MuiInputBase-input { padding: .4rem .7rem; font-size: 14px; }
`;

const CompactAutoFill = styled(AutoFill)`
    .MuiAutocomplete-inputRoot {
        padding: 0 .4rem; font-size: 14px;
        input.MuiAutocomplete-input { padding: .4rem }
    }
`;

const CompactAutocomplete = styled(Autocomplete)`
    .MuiAutocomplete-inputRoot {
        padding: 0 .4rem; font-size: 14px;
        input.MuiAutocomplete-input { padding: .4rem }
    }
`;

const NumberEditor = (props) => {
    const { id, value, field } = props;
    const apiRef = useGridApiContext();

    return (
        <CompactTextField
            size="small"
            type="number"
            defaultValue={value}
            onChange={({ target }) => apiRef.current.setEditCellValue({ id, field, value: target.value })}
        />
    );
};

const DateEditor = (props) => {
    const { id, value, field } = props;
    const apiRef = useGridApiContext();

    return (
        <CompactDatePicker
            value={dayjs.utc(value)}
            format="YYYY-MM-DD"
            onChange={(v) => apiRef.current.setEditCellValue({ id, field, value: v.toISOString() })}
            slotProps={{ textField: { size: 'small' } }}
        />
    );
};

const MonthEditor = (props) => {
    const { id, value, field } = props;
    const apiRef = useGridApiContext();

    return (
        <CompactDatePicker
            openTo="month"
            views={[ 'year', 'month' ]}
            value={dayjs.utc(value)}
            format="YYYY MMM"
            onChange={(v) => apiRef.current.setEditCellValue({ id, field, value: v.toISOString() })}
            slotProps={{ textField: { size: 'small' } }}
        />
    );
};

const RemarksEditor = (props) => {
    const { id, value, field, hasFocus } = props;
    const apiRef = useGridApiContext();
    const ref = useRef();
    const { suggestRemarks } = api();
    const transactions = state.useState(state.transactions)[0];

    useLayoutEffect(() => {
      if (hasFocus) {
        ref.current.focus();
      }
    }, [ hasFocus ]);

    const handleChange = (_, v) => {
        apiRef.current.setEditCellValue({ id, field, value: v?.label || v });
        const match = transactions.find((t) => t.remarks === v);
        if (match) {
            apiRef.current.setEditCellValue({ id, field: 'category', value: match.category });
            apiRef.current.setEditCellValue({ id, field: 'subCategory', value: match.subCategory });
        }
    };

    return (
        <CompactAutoFill
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
                size: 'small',
            }}
        />
    );
};

const CategoryEditor = (props) => {
    const [ categories, setCategories ] = state.useState(state.categories);
    const { id, value, field, hasFocus } = props;
    const apiRef = useGridApiContext();
    const ref = useRef();
    const { getCategories } = api();

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

    useLayoutEffect(() => {
      if (hasFocus) {
        ref.current.focus();
      }
    }, [ hasFocus ]);

    const handleChange = (e, v) => {
        apiRef.current.setEditCellValue({ id, field, value: v?.label || v });
    };

    return (
        <CompactAutocomplete
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
                    size="small"
                    {...params}
                />
            )}
        />
    );
};

const ImportGrid = ({ apiRef, transactions, accountType }) => {
    const columns = {
        date: { editable: true, width: 150, field: 'date', headerName: 'Date', type: 'date', valueFormatter: formatDate, renderEditCell: (p) => <DateEditor {...p} /> },
        billingMonth: { editable: true, width: 150, field: 'billingMonth', headerName: 'Bill', type: 'date', valueFormatter: formatMonth, renderEditCell: (p) => <MonthEditor {...p} /> },
        forMonth: { editable: true, field: 'forMonth', headerName: 'Month' },
        amount: { editable: true, field: 'amount', headerName: 'Amount', type: 'number', valueFormatter: formatDecimal, renderEditCell: (p) => <NumberEditor {...p} /> },
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

    const maxGridSize = {
        maxWidth: `calc(100vw - 1rem)`,
        maxHeight: `calc(100vh - 14rem)`,
    };

    const [ selectionModel, setSelectionModel ] = useState(transactions.map(({ id }) => id ));

    const [ contextMenuPosition, setContextMenuPosition ] = useState(null);

    const handleContextMenu = (event) => {
        event.preventDefault();
        setContextMenuPosition((old) => old === null ? { left: event.clientX - 2, top: event.clientY - 4 } : null);
    };

    const selectedRowSize = apiRef.current?.getSelectedRows ? apiRef.current.getSelectedRows().size : 0;

    return (
        <ImportGridRoot>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DataGrid
                    apiRef={apiRef}
                    checkboxSelection
                    disableRowSelectionOnClick
                    autoPageSize
                    disableColumnMenu
                    initialState={{ density: 'compact' }}
                    rows={transactions}
                    columns={columnMap[accountType]}
                    editMode="row"
                    sx={maxGridSize}
                    rowSelectionModel={selectionModel}
                    onRowSelectionModelChange={(n) => setSelectionModel(n)}
                    slotProps={{
                        row: {
                            onContextMenu: handleContextMenu,
                            style: { cursor: 'context-menu' },
                        },
                    }}
                />
                <ContextMenu
                    contextMenuPosition={contextMenuPosition}
                    setContextMenuPosition={setContextMenuPosition}
                    selectedRowSize={selectedRowSize}
                    apiRef={apiRef}
                />
            </LocalizationProvider>
        </ImportGridRoot>
    );
};
export default ImportGrid;

import { createFilterOptions } from '@mui/material/Autocomplete';
import { DataGrid, useGridApiRef, useGridApiContext, gridPageCountSelector } from '@mui/x-data-grid';
import { HorizontalLoader } from '../core/loader';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import api from '../core/api';
import Autocomplete from '@mui/material/Autocomplete';
import AutoFill from '../transactions/auto-fill';
import Button from '@mui/material/Button';
import ConfirmDialog from '../core/confirm-dialog';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import Title from '../core/title';

const GridBox = styled.div`
    flex: 1 1 1px;
    padding-bottom: ${props => props.isMobile ? '.5rem' : '1rem'};
`;

const Templates = ({ isMobile }) => {
    const apiRef = useGridApiRef();
    const [ originalData, setOriginalData ] = state.useState(state.templates);
    const [ categories, setCategories ] = state.useState(state.categories);
    const [ data, setData ] = useState();
    const [ selectedRows, setSelectedRows ] = useState([]);
    const [ showConfirmDelete, setShowConfirmDelete ] = useState(false);
    const { listTemplates, addTemplates, editTemplates, deleteTemplate, showStatus, getCategories, suggestRemarks } = api();

    const maxGridSize = {
        marginTop: '1rem',
        maxWidth: `calc(100vw - ${isMobile ? 1 : 3}rem)`,
        maxHeight: `calc(100vh - ${isMobile ? 8.1 : 9.5}rem)`,
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

    const columns = [
        { editable: true, flex: 1, field: 'reference', headerName: 'Reference',  },
        { editable: true, flex: 1, field: 'remarks', headerName: 'Remarks', renderEditCell: (p) => <RemarksEditor {...p} /> },
        { editable: true, flex: 1, field: 'category', headerName: 'Category', renderEditCell: (p) => <CategoryEditor {...p} /> },
    ];

    useEffect(() => {
        if (!originalData) {
            listTemplates((response) => {
                const processedResponse = response.map((r) => ({
                    ...r,
                    category: r.subCategory && r.subCategory !== r.category
                        ? `${r.category}: ${r.subCategory}`
                        : r.category,
                }))
                setOriginalData(processedResponse);
            });
        }
        if (categories.length > 0) {
            return;
        }
        getCategories((response) => {
            const processed = response.map(({ category, subCategory}) =>
                subCategory && subCategory !== category ? `${category}: ${subCategory}` : category);
            setCategories(processed);
        });
    }, []);

    useEffect(() => setData(originalData), [ originalData ]);

    const postProcess = (row, newRows, verb) => {
        const newRow = newRows[0];
        newRow.category = newRow.subCategory && newRow.subCategory !== newRow.category
            ? `${newRow.category}: ${newRow.subCategory}`
            : newRow.category,

        setOriginalData(data.map((o) => o.id !== row.id ? o : newRow));
        showStatus('success', 'Template ' + verb);
    };

    const editRow = (row) => {
        const fields = [ 'reference', 'remarks', 'category', 'subCategory' ];
        let error = false;
        fields.forEach((field) => {
            if (!row[field] || row[field].length < 3) {
                showStatus('warning', `Field ${field} cannot be less than 3 characters`);
                error = true;
                return;
            }
        });
        if (error) {
            return;
        }

        delete row.owner;
        const parts = row.category.split(':');
        row.category = parts.shift().trim();
        row.subCategory = parts.join(':').trim() || row.category;

        const existing = originalData.find(t => t.id === row.id);
        if (existing) {
            let match = true;
            fields.forEach((field) => {
                if (existing[field] !== row[field]) {
                    match = false;
                }
            });
            if (!match) {
                editTemplates([ row ], (newRows) => postProcess(row, newRows, 'edited'));
            } else {
                showStatus('warning', 'No change to template');
            }
        } else {
            addTemplates([ row ], (newRows) => postProcess(row, newRows, 'added'));
        }
        return row;
    };

    const submitDelete = () => {
        if (originalData.find(t => t.id === selectedRows[0])) {
            deleteTemplate(selectedRows[0], () => {
                setOriginalData((old) => old.filter((o) => o.id !== selectedRows[0]));
                setShowConfirmDelete(false);
                showStatus('success', 'Template deleted');
            });
        } else {
            setData((old) => old.filter((o) => o.id !== selectedRows[0]));
            setShowConfirmDelete(false);
            showStatus('success', 'Template deleted');
        }
    };

    const addTemplateRow = () => {
        setData((old) => ([ ...old, { id: new Date().getTime() } ]));
        apiRef.current.setPage(gridPageCountSelector(apiRef));
    };

    return (
        <GridBox isMobile={isMobile}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Title>Templates</Title>
                <Stack spacing={2} direction="row">
                    <Button
                        color="success"
                        variant="contained"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={addTemplateRow}
                        sx={{ height: '2.5rem' }}
                    >
                        Add
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        startIcon={<DeleteForeverIcon />}
                        onClick={() => setShowConfirmDelete(true)}
                        sx={{ height: '2.5rem' }}
                        disabled={selectedRows.length === 0}
                    >
                        Delete
                    </Button>
                </Stack>
            </Stack>
            { !data ? <HorizontalLoader /> : (
                <DataGrid
                    apiRef={apiRef}
                    autoPageSize
                    density="compact"
                    rows={data}
                    columns={columns}
                    editMode="row"
                    processRowUpdate={editRow}
                    onRowSelectionModelChange={(m) => setSelectedRows((o) => (m[0] === o[0]) ? [] : m)}
                    rowSelectionModel={selectedRows}
                    sx={maxGridSize}
                />
            )}
            <ConfirmDialog
                title="Confirm delete template?"
                message="This is a permanent change"
                open={showConfirmDelete}
                setOpen={setShowConfirmDelete}
                confirm={submitDelete}
            />
        </GridBox>
    );
};
export default Templates;

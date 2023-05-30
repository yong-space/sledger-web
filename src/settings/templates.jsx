import { DataGrid } from '@mui/x-data-grid';
import { HorizontalLoader } from '../core/loader';
import { useState, useEffect } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import api from '../core/api';
import Button from '@mui/material/Button';
import ConfirmDialog from '../core/confirm-dialog';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import styled from 'styled-components';
import Title from '../core/title';

const GridBox = styled.div`
    flex: 1 1 1px;
    width: calc(100vw - 3rem);
    padding-bottom: 1rem;
`;

const Templates = () => {
    const [ originalData, setOriginalData ] = state.useState(state.templates);
    const [ data, setData ] = useState();
    const [ selectedRows, setSelectedRows ] = useState([]);
    const [ showConfirmDelete, setShowConfirmDelete ] = useState(false);
    const { listTemplates, addTemplates, editTemplates, deleteTemplate, showStatus } = api();

    const columns = [
        { field: 'id', headerName: 'ID' },
        { field: 'reference', headerName: 'Reference', editable: true },
        { field: 'remarks', headerName: 'Remarks', editable: true },
        { field: 'category', headerName: 'Category', editable: true },
    ];

    useEffect(() => {
        if (!originalData) {
            listTemplates((response) => setOriginalData(response));
        }
    }, []);
    useEffect(() => setData(originalData), [ originalData ]);

    const postProcess = (oldRow, newRows, verb) => {
        setOriginalData((old) => ([
            ...old.filter(o => o.id !== oldRow.id),
            newRows[0],
        ]));
        showStatus('success', 'Template ' + verb);
    };

    const editRow = (row) => {
        delete row.owner;
        if (originalData.find(t => t.id === row.id)) {
            editTemplates([ row ], (newRows) => postProcess(row, newRows, 'edited'));
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

    return (
        <Stack spacing={1} sx={{ flex: '1 1 1px' }}>
            <Stack direction="row" justifyContent="space-between">
                <Title>Templates</Title>
                <Stack spacing={2} direction="row">
                    <Button
                        color="success"
                        variant="contained"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => setData((old) => ([ ...old, { id: new Date().getTime() } ]))}
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
                <GridBox>
                    <DataGrid
                        disableColumnMenu
                        density="compact"
                        rows={data}
                        columns={columns}
                        editMode="row"
                        processRowUpdate={editRow}
                        onRowSelectionModelChange={(m) => setSelectedRows((o) => (m[0] === o[0]) ? [] : m)}
                        rowSelectionModel={selectedRows}
                    />
                </GridBox>
            )}
            <ConfirmDialog
                title="Confirm delete template?"
                message="This is a permanent change"
                open={showConfirmDelete}
                setOpen={setShowConfirmDelete}
                confirm={submitDelete}
            />
        </Stack>
    );
};
export default Templates;

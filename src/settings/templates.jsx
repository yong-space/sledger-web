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
    padding-bottom: ${props => props.isMobile ? '.5rem' : '1rem'};
`;

const Templates = ({ isMobile }) => {
    const [ originalData, setOriginalData ] = state.useState(state.templates);
    const [ data, setData ] = useState();
    const [ selectedRows, setSelectedRows ] = useState([]);
    const [ showConfirmDelete, setShowConfirmDelete ] = useState(false);
    const { listTemplates, addTemplates, editTemplates, deleteTemplate, showStatus } = api();

    const maxGridSize = {
        maxWidth: `calc(100vw - ${isMobile ? 1 : 3}rem)`,
        maxHeight: `calc(100vh - ${isMobile ? 13.2 : 9.5}rem)`,
    };

    const columns = [
        { flex: 1, field: 'reference', headerName: 'Reference', editable: true },
        { flex: 1, field: 'remarks', headerName: 'Remarks', editable: true },
        { flex: 1, field: 'category', headerName: 'Category', editable: true },
        { flex: 1, field: 'subCategory', headerName: 'Sub-category', editable: true },
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
        <GridBox isMobile={isMobile}>
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
                <DataGrid
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

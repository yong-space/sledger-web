import { DataGrid } from '@mui/x-data-grid';
import { HorizontalLoader } from '../core/loader';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import api from '../core/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ConfirmDialog from '../core/confirm-dialog';
import Grid from '@mui/material/Grid';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const IssuersGrid = ({ issuers, setIssuers }) => {
    const { deleteIssuer, showStatus } = api();
    const [ showConfirm, setShowConfirm ] = useState(false);
    const [ issuerId, setIssuerId ] = useState();

    const columns = [
        { field: 'id', headerName: 'ID' },
        { field: 'name', headerName: 'Name' },
        {
            field: 'delete', headerName: 'Delete',
            sortable: false,
            renderCell: ({ id }) => {
                const confirm = (e) => {
                    e.stopPropagation();
                    setIssuerId(id);
                    setShowConfirm(true);
                };
                return <Button size="small" variant="outlined" color="error" onClick={confirm}>Delete</Button>;
            }
        },
    ];

    const submitDelete = () => deleteIssuer(issuerId, () => {
        setIssuers(issuers.filter(i => i.id !== issuerId));
        showStatus('success', 'Issuer deleted');
        setShowConfirm(false);
    });

    const IssuersDataGrid = () => issuers.length === 0 ?
        <Alert severity="info" variant="outlined">No issuers added yet</Alert> :
        (
            <>
                <DataGrid
                    rows={issuers}
                    columns={columns}
                    autoHeight
                    disableColumnMenu
                    showColumnRightBorder
                    hideFooter

                />
                <ConfirmDialog
                    title="Confirm delete issuer?"
                    message="This is a permanent change"
                    open={showConfirm}
                    setOpen={setShowConfirm}
                    confirm={submitDelete}
                />
            </>
        );
    return <Box><IssuersDataGrid /></Box>;
};

const IssuersForm = ({ setIssuers }) => {
    const [ loading, setLoading ] = state.useState('loading');
    const { addIssuer, showStatus } = api();

    const submitAddIssuer = (event) => {
        event.preventDefault();
        setLoading(true);
        const newIssuer = Object.fromEntries(new FormData(event.target).entries());

        addIssuer(newIssuer, (response) => {
            setLoading(false);
            setIssuers((existing) => [ ...existing, response ]);
            showStatus('success', 'New issuer added');
            document.querySelector('#manage-issuers').reset();
        });
    };

    return (
        <form id="manage-issuers" onSubmit={submitAddIssuer} autoComplete="off">
            <Grid container item xs={12} md={5} direction="column" gap={2}>
                <Typography variant="h6">
                    Add New Issuer
                </Typography>
                <TextField required name="name" label="Issuer name" inputProps={{ minLength: 3 }} />
                <LoadingButton
                    type="submit"
                    loading={loading}
                    loadingPosition="center"
                    variant="contained"
                >
                    Add Issuer
                </LoadingButton>
            </Grid>
        </form>
    )
};

const ManageIssuers = () => {
    const [ issuers, setIssuers ] = useState();
    const { listIssuers } = api();

    useEffect(() => listIssuers((data) => setIssuers(data)), []);

    return !issuers ? <HorizontalLoader /> : (
        <Stack spacing={4}>
            <IssuersGrid {...{ issuers, setIssuers }} />
            <IssuersForm {...{ setIssuers }} />
        </Stack>
    )
};
export default ManageIssuers;

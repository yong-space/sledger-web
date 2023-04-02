import { DataGrid } from '@mui/x-data-grid';
import { HorizontalLoader } from '../core/loader';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import api from '../core/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import ConfirmDialog from '../core/confirm-dialog';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
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
        { field: 'types', headerName: 'Types', valueGetter: (params) => params.row.types?.join(', ') },
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
    const [ loading, setLoading ] = state.useState(state.loading);
    const { addIssuer, showStatus } = api();
    const [ types, setTypes ] = useState({ Cash: true, Credit: false, Wallet: false });

    const submitAddIssuer = (event) => {
        event.preventDefault();

        if (noAccountTypes) {
            showStatus('error', 'At least one account type needs to be selected');
            return;
        }

        setLoading(true);
        const newIssuer = Object.fromEntries(new FormData(event.target).entries());
        newIssuer.types = Object.keys(types).filter(k => types[k]);

        addIssuer(newIssuer, (response) => {
            setLoading(false);
            setIssuers((existing) => [ ...existing, response ]);
            showStatus('success', 'New issuer added');
            document.querySelector('#manage-issuers').reset();
            setTypes({ Cash: true, Credit: false, Wallet: false });
        });
    };

    const handleCheck = (event) => {
        setTypes((old) => ({ ...old, [event.target.name]: event.target.checked }));
    };

    const noAccountTypes = Object.values(types).filter(v => v).length === 0;

    return (
        <form id="manage-issuers" onSubmit={submitAddIssuer} autoComplete="off">
            <Grid container item xs={12} md={5} direction="column" gap={2}>
                <Typography variant="h6">
                    Add New Issuer
                </Typography>
                <TextField required name="name" label="Issuer name" inputProps={{ minLength: 3 }} />
                <FormControl
                    required
                    error={noAccountTypes}
                    component="fieldset"
                    variant="standard"
                >
                    <FormLabel component="legend">Account Types</FormLabel>
                    <FormGroup>
                        {[ 'Cash', 'Credit', 'Wallet' ].map((type) => (
                            <FormControlLabel
                                key={type} label={type}
                                control={<Checkbox checked={types[type]} onChange={handleCheck} name={type} />}
                            />
                        ))}
                    </FormGroup>
                </FormControl>
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
    const [ issuers, setIssuers ] = state.useState(state.issuers);
    const { listIssuers } = api();

    useEffect(() => {
        if (!issuers) {
            listIssuers((data) => setIssuers(data));
        }
    }, []);

    return !issuers ? <HorizontalLoader /> : (
        <Stack spacing={4}>
            <IssuersGrid {...{ issuers, setIssuers }} />
            <IssuersForm {...{ setIssuers }} />
        </Stack>
    )
};
export default ManageIssuers;

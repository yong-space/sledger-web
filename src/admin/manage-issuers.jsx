import { atoms } from '../core/atoms';
import { DataGrid } from '@mui/x-data-grid';
import { HorizontalLoader } from '../core/loader';
import { useRecoilState } from 'recoil';
import { useState, useEffect } from 'react';
import api from '../core/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const IssuersGrid = ({ issuers, setIssuers }) => {
    const { deleteIssuer, showStatus } = api();

    const columns = [
        { field: 'id', headerName: 'ID' },
        { field: 'name', headerName: 'Name' },
        {
            field: 'delete', headerName: 'Delete',
            sortable: false,
            renderCell: ({ id }) => {
                const onClick = (e) => {
                    e.stopPropagation();
                    deleteIssuer(id, () => {
                        setIssuers(issuers.filter(i => i.id !== id));
                        showStatus("Issuer deleted");
                    });
                };
                return <Button variant="outlined" color="error" onClick={onClick}>Delete</Button>;
            }
        },
    ];
    const IssuersDataGrid = () => {
        return issuers.length === 0 ? 'No issuers added yet' : (
            <Box height="20rem">
                <DataGrid
                    rows={issuers}
                    columns={columns}
                />
            </Box>
        );
    }
    return <Box><IssuersDataGrid /></Box>;
};

const IssuersForm = ({ setIssuers }) => {
    const [ loading, setLoading ] = useRecoilState(atoms.loading);
    const { addIssuer, showStatus } = api();

    const submitAddIssuer = (event) => {
        event.preventDefault();
        setLoading(true);
        const newIssuer = Object.fromEntries(new FormData(event.target).entries());

        addIssuer(newIssuer, (response) => {
            setLoading(false);
            setIssuers((existing) => [ ...existing, response ]);
            showStatus('success', 'New issuer added');
        });
    };

    return (
        <form id="login" onSubmit={submitAddIssuer} autoComplete="off">
            <Grid container item xs={12} md={5} direction="column" gap={2}>
                <Typography variant="h6">
                    Add New Issuer
                </Typography>
                <TextField required name="name" label="Name" inputProps={{ minLength: 3 }} />
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

import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import api from '../core/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import ConfirmDialog from '../core/confirm-dialog';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import LoadingButton from '@mui/lab/LoadingButton';
import state from '../core/state';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 1px;
    gap: 1rem;
    padding-bottom: 2rem;
`;

const GridBox = styled.div`
    flex: 1 1 1px;
    width: calc(100vw - 3rem);
    padding-bottom: 1rem;
`;

const ColourTextField = styled(TextField)`
    & * { color: #${props => props.colour} !important }
    & fieldset { border-color: #${props => props.colour} !important }
`;

const IssuersGrid = ({ issuers, setIssuers }) => {
    const { deleteIssuer, showStatus } = api();
    const [ showConfirm, setShowConfirm ] = useState(false);
    const [ issuerId, setIssuerId ] = useState();

    const columns = [
        { field: 'id', headerName: 'ID' },
        {
            field: 'name',
            headerName: 'Name',
            renderCell: ({ row }) => <Chip sx={{ color: `#${row.colour}`, borderColor: `#${row.colour}`, borderRadius: '.5rem' }} label={row.name} variant="outlined" />
        },
        { field: 'types', headerName: 'Types', valueGetter: (_, row) => row.types?.join(', ') },
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
                    disableColumnMenu
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
    const [ name, setName ] = useState('');
    const [ types, setTypes ] = useState({ Cash: true, Credit: false, Retirement: false });
    const [ colour, setColour ] = useState('889900');

    const submitAddIssuer = (event) => {
        event.preventDefault();

        if (noAccountTypes) {
            showStatus('error', 'At least one account type needs to be selected');
            return;
        }

        setLoading(true);
        const newIssuer = {
            name, colour, types: Object.keys(types).filter(k => types[k]),
        };
        addIssuer(newIssuer, (response) => {
            setLoading(false);
            setIssuers((existing) => [ ...existing, response ]);
            showStatus('success', 'New issuer added');
            setName('');
            setColour('889900');
            setTypes({ Cash: true, Credit: false, Retirement: false });
        });
    };

    const handleCheck = (event) => {
        setTypes((old) => ({ ...old, [event.target.name]: event.target.checked }));
    };

    const noAccountTypes = Object.values(types).filter(v => v).length === 0;

    return (
        <form onSubmit={submitAddIssuer} autoComplete="off">
            <Grid container item xs={12} md={5} direction="column" gap={2}>
                <Typography variant="h6">
                    Add New Issuer
                </Typography>
                <TextField
                    required
                    label="Issuer name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    inputProps={{ minLength: 3 }}
                />
                <ColourTextField
                    required
                    label="Colour"
                    value={colour}
                    onChange={(e) => setColour(e.target.value)}
                    inputProps={{ minLength: 6, maxLength: 6 }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">#</InputAdornment>,
                    }}
                    colour={colour}
                />
                <FormControl
                    required
                    error={noAccountTypes}
                    component="fieldset"
                    variant="standard"
                >
                    <FormLabel component="legend">Account Types</FormLabel>
                    <FormGroup>
                        {[ 'Cash', 'Credit', 'Retirement' ].map((type) => (
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
    return (
        <Wrapper>
            <IssuersGrid {...{ issuers, setIssuers }} />
            <IssuersForm {...{ setIssuers }} />
        </Wrapper>
    )
};
export default ManageIssuers;

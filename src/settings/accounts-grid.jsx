import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import api from '../core/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ConfirmDialog from '../core/confirm-dialog';
import styled from 'styled-components';
import Switch from '@mui/material/Switch';
import VisibilityIcon from '@mui/icons-material/Visibility';

const IssuerChip = styled(Chip)`
    border-radius: .5rem;
    color: #${props => props.colour};
    border-color: #${props => props.colour};
`;

const FxRoot = styled.sup`
    font-size: .8rem;
    position: relative;
    top: -.3rem;
    left: .1rem;
`;
const Fx = () => <FxRoot>FX</FxRoot>;

const AccountsGrid = ({ issuers, accounts, setAccounts, accountToEdit, setAccountToEdit }) => {
    const { deleteAccount, editAccountVisibility, showStatus } = api();
    const [ showConfirmDelete, setShowConfirmDelete ] = useState(false);
    const [ accountId, setAccountId ] = useState();
    const colors = {
        'Cash': 'success',
        'Credit': 'warning',
        'Retirement': 'info',
    };

    const getIssuer = (id) => issuers.find(i => i.id === id);

    const updateVisibility = (event, id) => editAccountVisibility(id, event.target.checked, () => {
        showStatus('success', 'Updated visibility');
        setAccounts((accounts) => accounts.map(account =>
            (account.id !== id) ? account : { ...account, visible: event.target.checked }));
    });

    const setEditAccountId = (eid) => setAccountToEdit(accounts.find(({ id }) => id === eid));

    const columns = [
        {
            field: 'visible',
            renderHeader: () => <VisibilityIcon sx={{ ml: '1rem' }} />,
            renderCell: ({ id, row }) => <Switch defaultChecked={row.visible} disabled={!!accountToEdit} onChange={(e) => updateVisibility(e, id)} />,
        },
        {
            field: 'type',
            headerName: 'Type',
            width: '109',
            renderCell: ({ value }) => <Chip sx={{ borderRadius: '.5rem' }} label={value} color={colors[value]} />
        },
        {
            field: 'issuer',
            headerName: 'Issuer',
            valueGetter: ({ row }) => getIssuer(row.issuerId).name,
            renderCell: ({ row }) => <IssuerChip colour={getIssuer(row.issuerId).colour} label={getIssuer(row.issuerId).name} variant="outlined" />
        },
        {
            field: 'name',
            headerName: 'Name',
            renderCell: ({ row }) => (
                <>
                    {row.name}
                    {row.multiCurrency && <Fx />}
                </>
            )
        },
        {
            field: 'transactions',
            headerName: 'Transactions',
            type: 'number',
            width: '103',
            valueGetter: ({ row }) => row.transactions || 0,
        },
        {
            field: 'edit', headerName: 'Edit',
            sortable: false,
            renderCell: ({ id }) => (
                <Button size="small" variant="outlined" color="warning" disabled={!!accountToEdit} onClick={() => setEditAccountId(id)}>Edit</Button>
            )
        },
        {
            field: 'delete', headerName: 'Delete',
            sortable: false,
            renderCell: ({ id }) => {
                const confirm = (e) => {
                    e.stopPropagation();
                    setAccountId(id);
                    setShowConfirmDelete(true);
                };
                return <Button size="small" variant="outlined" color="error" disabled={!!accountToEdit} onClick={confirm}>Delete</Button>;
            }
        },
    ];

    const submitDelete = () => deleteAccount(accountId, () => {
        setAccounts(accounts.filter(i => i.id !== accountId));
        showStatus('success', 'Account deleted');
        setShowConfirmDelete(false);
    });

    const Empty = () => (
        <Alert severity="info" variant="outlined">
            No accounts added yet. Add your first account below.
        </Alert>
    );

    const NoVisible = () => (
        <Alert severity="warning" variant="outlined" sx={{ marginBottom: '2rem' }}>
            No accounts are visible. Please enable visibility on at least one account.
        </Alert>
    );

    const AccountsDataGrid = () =>
        accounts.length === 0 ? <Empty /> : (
            <>
                { accounts.filter(a => a.visible).length === 0 && <NoVisible /> }
                <DataGrid
                    rows={accounts}
                    columns={columns}
                    autoHeight
                    disableColumnMenu
                    showColumnRightBorder
                    hideFooter
                />
                <ConfirmDialog
                    title="Confirm delete account?"
                    message="All transactions under this account will be permanently deleted"
                    open={showConfirmDelete}
                    setOpen={setShowConfirmDelete}
                    confirm={submitDelete}
                />
            </>
        );
    return <Box><AccountsDataGrid /></Box>;
};
export default AccountsGrid;

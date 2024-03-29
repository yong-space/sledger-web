import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import api from '../core/api';
import Chip from '@mui/material/Chip';
import styled from 'styled-components';
import Switch from '@mui/material/Switch';
import VisibilityIcon from '@mui/icons-material/Visibility';

const GridBox = styled.div`
    display: flex;
    flex: 1 1 1px;
    margin-bottom: ${props => props.isMobile ? '.5rem' : '1rem' };
`;

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

const AccountsGrid = ({
    issuers, accounts, setAccounts, isMobile, selectedAccount, setSelectedAccount, setAccountToEdit, setShowAddDialog,
}) => {
    const [ visibleColumns, setVisibleColumns ] = useState({});
    const { editAccountVisibility, showStatus } = api();
    const colors = {
        'Cash': 'success',
        'Credit': 'warning',
        'Retirement': 'info',
    };

    const maxGridSize = {
        maxWidth: `calc(100vw - ${isMobile ? 1 : 3}rem)`,
        maxHeight: `calc(100vh - ${isMobile ? 1 : 9.4}rem)`,
    };

    const getIssuer = (id) => issuers.find(i => i.id === id);

    const updateVisibility = (event, id) => editAccountVisibility(id, event.target.checked, ({ visible }) => {
        showStatus('success', 'Updated visibility');
        setAccounts((accounts) => accounts.map(account =>
            (account.id !== id) ? account : { ...account, visible }));
    });

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 50,
            sortable: false,
        },
        {
            field: 'visible',
            renderHeader: () => <VisibilityIcon sx={{ ml: '1rem' }} />,
            renderCell: ({ id, row }) => <Switch checked={row.visible} onChange={(e) => updateVisibility(e, id)} />,
            width: 70,
            sortable: false,
        },
        {
            field: 'type',
            headerName: 'Type',
            width: 109,
            renderCell: ({ value }) => <Chip sx={{ borderRadius: '.5rem' }} label={value} color={colors[value]} />
        },
        {
            field: 'issuer',
            headerName: 'Issuer',
            valueGetter: (_, row) => getIssuer(row.issuerId),
            renderCell: ({ value }) => <IssuerChip colour={value.colour} label={value.name} variant="outlined" />
        },
        {
            field: 'typeAndIssuer',
            headerName: 'Type + Issuer',
            valueGetter: (_, row) => ({ type: row.type, issuer: getIssuer(row.issuerId) }),
            renderCell: ({ value }) => (
                <div style={{ display: 'flex', gap: '.5rem' }}>
                    <Chip sx={{ borderRadius: '.5rem' }} label={value.type} color={colors[value.type]} />
                    <IssuerChip colour={value.issuer.colour} label={value.issuer.name} variant="outlined" />
                </div>
            ),
            width: 165,
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
            valueGetter: (_, row) => row.transactions || 0,
            sortable: false,
        },
    ];

    useEffect(() => {
        const vColumns = isMobile ? { id: false, type: false, issuer: false } :
            { typeAndIssuer: false };
        setVisibleColumns(vColumns);
    }, [ isMobile ]);

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

    const updateRowSelection = (newRows) => {
        if (newRows.length === 0) {
            return;
        }
        setSelectedAccount(newRows);
    };

    const handleDoubleClick = (params) => {
        setAccountToEdit(params.row);
        setShowAddDialog(true);
    };

    const handleClick = ({ id }) => {
        const selection = (id === selectedAccount[0]) ? [] : [ id ];
        setSelectedAccount(selection);
    };

    return accounts.length === 0 ? <Empty /> : (
        <GridBox isMobile={isMobile}>
            { accounts.filter(a => a.visible).length === 0 && <NoVisible /> }
            <DataGrid
                hideFooter
                disableColumnMenu
                disableRowSelectionOnClick
                rows={accounts}
                columns={columns}
                columnVisibilityModel={visibleColumns}
                rowSelectionModel={selectedAccount}
                onRowSelectionModelChange={updateRowSelection}
                onRowDoubleClick={handleDoubleClick}
                onRowClick={handleClick}
                sx={maxGridSize}
            />
        </GridBox>
    );
};
export default AccountsGrid;

import VisibilityIcon from '@mui/icons-material/Visibility';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../core/api';
import { HorizontalLoader } from '../core/utils';

const FlexDataGrid = styled(DataGrid)`
    display: flex;
    flex: 1 1 1px;
    .no-ellipsis { text-overflow: clip }
`;
type ChipProps = { colour?: string }
const ChipInternal = styled(Chip)<ChipProps>`
    border-radius: .5rem;
    height: fit-content;
    font-size: .875rem;
    line-height: initial;
    margin: .6rem 0;
    padding: .4rem 0;
    color: #${props => props.colour};
    border-color: #${props => props.colour};
`;

const IssuerChip = ({ issuer }) => (
    <ChipInternal
        colour={issuer.colour}
        label={issuer.name}
        variant="outlined"
    />
);

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
    const { editAccountVisibility, showStatus, editAccountSort } = api();
    const colors = {
        'Cash': 'success',
        'Credit': 'warning',
        'Retirement': 'info',
    };
    const getIssuer = (id) => issuers.find(i => i.id === id);

    const updateVisibility = (event, id) => editAccountVisibility(id, event.target.checked, ({ visible }) => {
        showStatus('success', 'Updated visibility');
        setAccounts((accounts) => accounts.map(account =>
            (account.id !== id) ? account : { ...account, visible }));
    });

    const columns : GridColDef[] = [
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
            cellClassName: 'no-ellipsis',
        },
        {
            field: 'type',
            headerName: 'Type',
            width: 109,
            renderCell: ({ value }) => <Chip sx={{ borderRadius: '.5rem' }} label={value} color={colors[value]} />
        },
        {
            field: 'issuerId',
            headerName: 'Issuer',
            valueGetter: (value) => getIssuer(value).name,
            renderCell: ({ row }) => <IssuerChip issuer={getIssuer(row.issuerId)} />,
        },
        {
            field: 'typeAndIssuer',
            headerName: 'Type + Issuer',
            valueGetter: (_, row) => row.type + getIssuer(row.issuerId).name,
            renderCell: ({ row }) => (
                <div style={{ display: 'flex', gap: '.5rem' }}>
                    <ChipInternal label={row.type} color={colors[row.type]} />
                    <IssuerChip issuer={getIssuer(row.issuerId)} />
                </div>
            ),
            width: 165,
        },
        {
            field: 'name',
            headerName: 'Name',
            width: isMobile ? 0 : 150,
            flex: isMobile ? 1 : 0,
            renderCell: ({ row }) => (
                <>
                    {row.name}
                    {row.multiCurrency && <Fx />}
                </>
            )
        },
        {
            field: 'transactions',
            headerName: isMobile ? 'Tx' : 'Transactions',
            type: 'number',
            width: isMobile ? 60 : 110,
            valueGetter: (_, row) => row.transactions || 0,
            sortable: false,
        },
        {
            field: "sortOrder",
            headerName: "Sort",
            width: 200,
            sortable: false,
            renderCell: (params) => {
                const reviseSort = (e, direction) => {
                    e.stopPropagation();
                    editAccountSort(params.row.id, direction, (newSortOrder) =>
                        setAccounts((accounts) => accounts
                            .map(account => ({ ...account, sortOrder: newSortOrder[account.id] ?? account.sortOrder}))
                            .sort((a, b) =>
                                a.type.localeCompare(b.type) ||
                                a.sortOrder - b.sortOrder ||
                                getIssuer(a.issuerId).name.localeCompare(getIssuer(b.issuerId).name) ||
                                a.name.localeCompare(b.name)
                            )
                    ));
                };
                return (
                    <>
                        <Button
                            variant="contained"
                            onClick={(e) => reviseSort(e, 'up')}
                            sx={{ margin: 'auto .8rem auto 0' }}
                            disabled={params.row.sortOrder === 0}
                        >
                            Up
                        </Button>
                        <Button
                            variant="contained"
                            onClick={(e) => reviseSort(e, 'down')}
                            sx={{ margin: 'auto 0' }}
                            disabled={accounts.filter(a => a.type === params.row.type).slice(-1)[0].id === params.row.id}
                        >
                            Down
                        </Button>
                    </>
                );
            }
        }
    ];

    useEffect(() => {
        const vColumns = isMobile ? { id: false, type: false, issuerId: false } :
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

    if (!accounts) {
        return <HorizontalLoader />;
    }

    return accounts.length === 0 ? <Empty /> : (
        <>
            { accounts.filter(a => a.visible).length === 0 && <NoVisible /> }
            <FlexDataGrid
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
            />
        </>
    );
};
export default AccountsGrid;

import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AddTransactionDialog from './add-transaction-form';
import api from '../core/api';
import Button from '@mui/material/Button';
import ConfirmDialog from '../core/confirm-dialog';
import dayjs from 'dayjs';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import IconButton from '@mui/material/IconButton';
import PublishIcon from '@mui/icons-material/Publish';
import SearchIcon from '@mui/icons-material/Search';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import styled from 'styled-components';
import useMediaQuery from '@mui/material/useMediaQuery';

const ActionButton = styled(Button)`
    height: 2.5rem;
`;

const ActionIconButton = styled(IconButton)`
    height: 2.5rem;
`;

const ActionButtons = ({
    isMobile, transactions, setTransactions, setAccounts, showAddDialog,
    setShowAddDialog, transactionToEdit, setTransactionToEdit, setImportMode, canImport,
}) => {
    const theme = useTheme();
    const setLoading = state.useState(state.loading)[1];
    const selectedRows = state.useState(state.selectedRows)[0];
    const selectedAccount = state.useState(state.selectedAccount)[0];
    const { deleteTransaction, listTransactions, showStatus, listAccounts } = api();
    const [ showConfirmDelete, setShowConfirmDelete ] = useState(false);
    const ButtonComponent = isMobile ? ActionIconButton : ActionButton;
    const startIcon = (startIcon) => isMobile ? {} : { startIcon };

    const submitDelete = () => {
        setLoading(true);
        const maxDate = dayjs.max(transactions.map(t => dayjs(t.date)));
        const txDate = dayjs(transactions.filter((t) => t.id === selectedRows[0])[0].date);

        deleteTransaction(selectedRows[0], () => {
            if (txDate.isSame(maxDate)) {
                setTransactions((t) => t.filter((r) => r.id !== selectedRows[0]));
                showStatus('success', 'Transaction deleted');
                setLoading(false);
                setShowConfirmDelete(false);
            } else {
                listTransactions(selectedAccount.id, (response) => {
                    setTransactions(response);
                    showStatus('success', 'Transaction deleted');
                    setLoading(false);
                    setShowConfirmDelete(false);
                });
            }
            listAccounts((data) => setAccounts(data));
        });
    };

    return (
        <Stack direction="row" spacing={1}>
            <ButtonComponent
                color="success"
                variant="contained"
                onClick={() => setShowAddDialog(true)}
                {...startIcon(<AddCircleOutlineIcon />)}
            >
                { isMobile ? <AddCircleOutlineIcon /> : 'Add' }
            </ButtonComponent>

            { selectedRows.length > 0 && (
                <ButtonComponent
                    color="error"
                    variant="contained"
                    onClick={() => setShowConfirmDelete(true)}
                    {...startIcon(<DeleteForeverIcon />)}
                >
                    { isMobile ? <DeleteForeverIcon /> : 'Delete' }
                </ButtonComponent>
            )}

            { useMediaQuery(theme.breakpoints.up('md')) && canImport && (
                <ButtonComponent
                    color="info"
                    variant="contained"
                    onClick={() => setImportMode(true)}
                    {...startIcon(<PublishIcon />)}
                >
                    Import
                </ButtonComponent>
            )}

            <ButtonComponent
                variant="contained"
                {...startIcon(<SearchIcon />)}
                disabled
            >
                { isMobile ? <SearchIcon /> : 'Search' }
            </ButtonComponent>

            { showAddDialog && (
                <AddTransactionDialog {...{ setShowAddDialog, transactionToEdit, setTransactionToEdit }} />
            )}

            { showConfirmDelete && (
                <ConfirmDialog
                    open
                    title="Confirm delete transaction?"
                    message="This is a permanent change"
                    setOpen={setShowConfirmDelete}
                    confirm={submitDelete}
                />
            )}
        </Stack>
    );
};
export default ActionButtons;

import { CircularLoader } from '../core/utils';
import { GridRowId, GridRowSelectionModel, useGridApiRef } from '@mui/x-data-grid';
import { useState } from 'react';
import api from '../core/api';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import styled from 'styled-components';
import ImportGrid from './transactions-import-grid';
import DropZone from './dropzone';

const ImportRoot = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 1px;
    gap: 1rem;
    padding-bottom: 1rem;
`;

const TransactionsImport = ({ setImportMode, selectedAccount }) => {
    const [ loading, setLoading ] = state.useState(state.loading);
    const [ importTransactions, setImportTransactions ] = useState();
    const setTransactions = state.useState(state.transactions)[1];
    const setParentSelectedRows = state.useState(state.selectedRows)[1];
    const setVisibleTransactionId = state.useState(state.visibleTransactionId)[1];
    const { addTransaction, showStatus, listTransactions } = api();
    const [ selectionModel, setSelectionModel ] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set<GridRowId>() });
    const [ paginationModel, setPaginationModel ] = useState();

    const apiRef = useGridApiRef();

    const submitTransactions = () => {
        const tx = Array.from(apiRef.current.getSelectedRows().values());
        if (tx.length === 0) {
            showStatus('warning', 'No transactions selected for import');
            return;
        }

        setLoading(true);
        const selectedTransactions = tx.map((r) => {
            const parts = r.category.split(':');
            const category = parts.shift().trim();
            const subCategory = parts.join(':').trim() || category;
            return { ...r, category, subCategory };
        });

        addTransaction(selectedTransactions, (response) => {
            listTransactions(selectedAccount?.id, (allTx) => {
                const processedTx = allTx.map((o) => {
                    const category = o.category && o.category.indexOf(':') === -1 && o.subCategory && o.subCategory !== o.category
                        ? `${o.category}: ${o.subCategory}`
                        : o.category;
                    return { ...o, category };
                });
                setTransactions(processedTx);
                setParentSelectedRows({ type: 'include', ids: new Set(response.map(({ id }) => id))});
                setVisibleTransactionId(response[0].id);
                setLoading(false);
                setImportMode(false);
                showStatus('success', selectedTransactions.length + ' Transactions imported');
            });
        });
    };

    const MainElement = () => !importTransactions ? (
        <DropZone
            selectedAccountId={selectedAccount.id}
            setLoading={setLoading}
            setImportTransactions={setImportTransactions}
            setSelectionModel={setSelectionModel}
        />
    ) : (
        <ImportGrid
            transactions={importTransactions}
            setTransactions={setImportTransactions}
            apiRef={apiRef}
            accountType={selectedAccount.type}
            selectionModel={selectionModel}
            setSelectionModel={setSelectionModel}
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
        />
    );

    return (
        <ImportRoot>
            { loading ? <CircularLoader /> : <MainElement /> }
            <Stack direction="row" spacing={2}>
                <Button
                    color="info"
                    variant="contained"
                    onClick={submitTransactions}
                    disabled={loading || !importTransactions}
                >
                    Import Transactions
                </Button>
                <Button
                    variant="contained"
                    onClick={() => setImportMode(false)}
                    disabled={loading}
                >
                    Cancel
                </Button>
            </Stack>
        </ImportRoot>
    );
};
export default TransactionsImport;

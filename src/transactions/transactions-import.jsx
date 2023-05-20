import { CircularLoader } from '../core/loader';
import { DataGrid } from '@mui/x-data-grid';
import { red, green, blue, grey } from '@mui/material/colors';
import { useState } from 'react';
import api from '../core/api';
import Button from '@mui/material/Button';
import Dropzone from 'react-dropzone';
import Stack from '@mui/material/Stack';
import styled from 'styled-components';
import dayjs from 'dayjs';
import state from '../core/state';

const ImportRoot = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 1px;
    gap: 1rem;
`;

const ImportGridRoot = styled.div`
    height: calc(100vh - 15.6rem);
`;

const ImportZone = styled.div`
    display: flex;
    flex: 1 1 1px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-width: 2px;
    border-style: dashed;
    border-radius: .3rem;
    color: ${props => props.isDragAccept ? green[400] : props.isDragReject ? red[400] : props.isFocused ? blue[400] : grey[400] };
    border-color: ${props => props.isDragAccept ? green[400] : props.isDragReject ? red[400] : props.isFocused ? blue[400] : grey[400] };
`;

const TransactionsImport = ({ setImportMode, selectedAccount }) => {
    const [ loading, setLoading ] = state.useState(state.loading);
    const [ importTransactions, setImportTransactions ] = useState();
    const setTransactions = state.useState(state.transactions)[1];
    const { uploadImport, addTransactions, showStatus } = api();

    const onDrop = (acceptedFiles) => {
        const data = new FormData();
        data.append('file', acceptedFiles[0]);
        data.append('accountId', selectedAccount.id);
        setLoading(true);

        uploadImport(data, (response) => {
            setLoading(false);
            setImportTransactions(response);
        });
    };

    const submitTransactions = () => {
        setLoading(true);
        addTransactions(selectedAccount.id, importTransactions, (response) => {
            setTransactions((existing) => [ ...existing, ...response ].sort((a, b) => new Date(a.date) - new Date(b.date)));
            setLoading(false);
            setImportMode(false);
            showStatus('success', 'Transactions imported');
        });
    };

    const DropZone = () => (
        <Dropzone
            accept={{
                'application/vnd.ms-excel': [ '.csv' ],
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [ '.xlsx' ],
            }}
            multiple={false}
            onDropAccepted={onDrop}
        >
            {({ getRootProps, getInputProps, isFocused, isDragAccept, isDragReject }) => (
                <ImportZone {...getRootProps()} {...{ isFocused, isDragAccept, isDragReject }}>
                    <input {...getInputProps()} />
                    Click to select exported file or drag file here
                </ImportZone>
            )}
        </Dropzone>
    );

    const ImportGrid = () => {
        const [ selectedRows, setSelectedRows ] = useState([]);
        const decimalFomat = new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formatNumber = ({ value }) => value === 0 ? '' : decimalFomat.format(value);
        const formatDate = ({ value }) => dayjs(value).format('YYYY-MM-DD');

        const columns = {
            date: { editable: true, width: '100', field: 'date', headerName: 'Date', type: 'date', valueFormatter: formatDate },
            billingMonth: { editable: true, width: '100', field: 'billingMonth', headerName: 'Bill', type: 'date', valueFormatter: formatDate },
            forMonth: { editable: true, field: 'forMonth', headerName: 'Month' },
            amount: { editable: true, field: 'amount', headerName: 'Amount', type: 'number', valueFormatter: formatNumber },
            originalAmount: { editable: true, field: 'originalAmount', type: 'number', headerName: 'Original', valueFormatter: formatNumber },
            remarks: { editable: true, flex: 1, field: 'remarks', headerName: 'Remarks' },
            category: { editable: true, field: 'category', headerName: 'Category' },
            code: { editable: true, field: 'code', headerName: 'Code' },
            company: { editable: true, field: 'company', headerName: 'Company' },
            ordinaryAmount: { editable: true, field: 'ordinaryAmount', headerName: 'Ordinary', type: 'number', valueFormatter: formatNumber },
            specialAmount: { editable: true, field: 'specialAmount', headerName: 'Special', type: 'number', valueFormatter: formatNumber },
            medisaveAmount: { editable: true, field: 'medisaveAmount', headerName: 'Medisave', type: 'number', alueFormatter: formatNumber },
        };

        const columnMap = {
            Cash: [ columns.date, columns.amount, columns.remarks, columns.category ],
            Credit: [ columns.date, columns.billingMonth, columns.amount, columns.remarks, columns.category ],
            Retirement: [ columns.date, columns.forMonth, columns.code, columns.company, columns.amount, columns.ordinaryAmount, columns.specialAmount, columns.medisaveAmount ]
        };

        return (
            <ImportGridRoot>
                <DataGrid
                    hideFooter
                    disableColumnMenu
                    showColumnRightBorder
                    density="compact"
                    rows={importTransactions}
                    columns={columnMap[selectedAccount.type]}
                    editMode="row"
                    onRowSelectionModelChange={(m) => setSelectedRows((o) => (m[0] === o[0]) ? [] : m)}
                    rowSelectionModel={selectedRows}
                />
            </ImportGridRoot>
        );
    };

    return (
        <ImportRoot>
            { loading && <CircularLoader /> }
            { !loading && !importTransactions && <DropZone /> }
            { !loading && importTransactions && <ImportGrid /> }
            <Stack direction="row" spacing={2}>
                <Button
                    color="info"
                    variant="contained"
                    onClick={submitTransactions}
                    disabled={!importTransactions}
                >
                    Import Transactions
                </Button>
                <Button
                    variant="contained"
                    onClick={() => setImportMode(false)}
                >
                    Cancel
                </Button>
            </Stack>
        </ImportRoot>
    );
};
export default TransactionsImport;

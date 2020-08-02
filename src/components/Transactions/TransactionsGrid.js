import React, { useLayoutEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css';
import 'ag-grid-enterprise';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import { Tag } from 'antd';
import { getColumnsForType, defaultColDef } from './TransactionsGridColumns';
import API from '../Common/API';
import Notification from '../Common/Notification';
import LoadingSpinner from '../Common/LoadingSpinner';
import Atom from '../Common/Atom';
import { formatNumber } from '../Common/Util';

const Wrapper = styled.div`
    width: 100%;
    height: ${({ height }) => height}px;
    margin-top: 1rem;

    .ag-body-viewport, .ag-row:not(.ag-row-pinned) .ag-cell, .ag-header, .ag-header-cell {
        transform: rotate(180deg);
    }
    .ag-menu, .ag-header-cell, .ag-cell { direction: ltr; text-align: left }
    .ag-row-pinned .ag-cell { display: flex }
    .ag-selection-checkbox { margin: 0 12px 0 0 }
    .ag-cell-focus { border: none !important }
`;

export default ({ selectedAccount, setFormMode }) => {
    const [ data, setData ] = useRecoilState(Atom.gridData);
    const [ totalRows, setTotalRows ] = useState();
    const [ viewportHeight, setViewportHeight ] = useState();
    const { getTransactions } = API();
    const [ selectedRowKeys, setSelectedRowKeys ] = useRecoilState(Atom.gridSelection);

    const datasource = {
        getRows: ({ startRow, endRow, successCallback, failCallback }) => {
            const pageSize = endRow - startRow;
            const page = Math.floor(startRow / pageSize);
            getTransactions(selectedAccount.id, page, pageSize)
                .then((response) => {
                    setTotalRows(response.totalElements);
                    setData((oldData) => [ ...response.content, ...oldData ]);
                    successCallback(response.content, response.totalElements);
                })
                .catch((e) => {
                    Notification.showError('Unable to load transactions', e.message);
                    failCallback();
                });
        },
    };

    useLayoutEffect(() => {
        const setHeight = () => {
            const docElem = document.documentElement;
            const vw = Math.max(docElem.clientWidth || 0, window.innerWidth || 0);
            const vh = Math.max(docElem.clientHeight || 0, window.innerHeight || 0) - 135;
            let offset = 0;
            if (vw < 550) {
                offset = 40;
            } else if (vw < 768) {
                offset = 44;
            }
            setViewportHeight(vh - offset);
        };
        setHeight();
        window.addEventListener('resize', setHeight);
        return () => window.removeEventListener('resize', setHeight);
        // eslint-disable-next-line
    }, []);

    const onSelectionChanged = ({ api }) => {
        setSelectedRowKeys(api.getSelectedRows().map((row) => row.id));
    };

    const onRowDoubleClicked = (row) => {
        if (row.rowPinned) {
            return;
        }
        setSelectedRowKeys([ row.data.id ]);
        setFormMode('edit');
    };

    const footerRenderer = (props) => {
        const selectedRows = props.api.getSelectedRows();
        if (selectedRows.length === 0) {
            return (
                <Tag>
                    {props.data.loadedRows} / {props.data.totalRows} Record
                    {props.data.totalRows > 1 ? 's' : ''} Loaded
                </Tag>
            );
        }

        let totalCredit = 0;
        let totalDebit = 0;
        selectedRows.forEach(({ amount }) => {
            totalCredit += (amount > 0 ? amount : 0);
            totalDebit += (amount < 0 ? -amount : 0);
        });

        return (
            <>
                <Tag>{selectedRows.length} Record{selectedRows.length > 1 ? 's' : ''} Selected</Tag>
                <Tag>Credit: {formatNumber({ value: totalCredit })}</Tag>
                <Tag>Debit: {formatNumber({ value: totalDebit })}</Tag>
            </>
        );
    };

    return !selectedAccount ? <LoadingSpinner /> : (
        <Wrapper
            className="ag-theme-alpine-dark"
            height={viewportHeight}
        >
            <AgGridReact
                rowModelType="infinite"
                datasource={datasource}
                columnDefs={getColumnsForType(selectedAccount.accountType.accountTypeClass)}
                defaultColDef={defaultColDef}
                rowSelection="multiple"
                onSelectionChanged={onSelectionChanged}
                onRowDoubleClicked={onRowDoubleClicked}
                animateRows
                pinnedBottomRowData={[{
                    selectedRows: selectedRowKeys.length,
                    loadedRows: data.length,
                    totalRows,
                }]}
                frameworkComponents={{ footerRenderer }}
                onGridReady={({ columnApi }) => columnApi.getColumn('date').setSort('asc')}
                enableRtl
            />
        </Wrapper>
    );
};

import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { useRecoilState } from 'recoil';
import Atom from '../Common/Atom';
import styled from 'styled-components';
import API from '../Common/API';
import Notification from '../Common/Notification';
import { getColumnsForType } from './TransactionsGridColumns';

const Styled = styled.div`
    height: 100%;
    margin-top: .8rem;
    .ant-table-cell {
        white-space: nowrap;
        overflow-x: hidden;
        text-overflow: ellipsis;
    }
    .ant-table-summary { font-weight: bold }
    .right { text-align: right }

    @media (max-width: 549px) {
        .desktop { display: none }
    }
    @media (min-width: 550px) {
        .mobile { display: none }
    }
`;

export default ({ selectedAccount }) => {
    const [ loading, setLoading ] = useState(true);
    const [ sortOrder, setSortOrder ] = useState({ columnKey: 'date', order: 'ascend' });
    const [ columns, setColumns ] = useRecoilState(Atom.gridColumns);
    const [ data, setData ] = useRecoilState(Atom.gridData);
    const [ selectedRowKeys, setSelectedRowKeys ] = useRecoilState(Atom.gridSelection);
    const { getTransactions } = API();

    const refreshTransactions = async (accountId) => {
        try {
            const transactions = await getTransactions(accountId);
            setData(transactions.map(transaction => ({ ...transaction, key: transaction.id })));
        } catch(e) {
            Notification.showError('Unable to load transactions', e.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!selectedAccount) {
            return;
        }
        setLoading(true);

        const columnDefs = getColumnsForType(selectedAccount.accountType.accountTypeClass)
            .map(colDef => {
                if (!colDef.sorter) {
                    return colDef;
                }
                return {
                    ...colDef,
                    sortOrder: sortOrder.columnKey === colDef.key && sortOrder.order,
                    sortDirections: [ 'ascend', 'descend', 'ascend' ],
                }
            });
        setColumns(columnDefs);
        refreshTransactions(selectedAccount.id);
        // eslint-disable-next-line
    }, [ selectedAccount, sortOrder ]);

    const generateSummary = (pageData) => {
        let balance = 0;
        let totalCredit = 0;
        let totalDebit = 0;

        pageData.forEach(({ amount }) => {
            totalCredit += (amount > 0 ? amount : 0);
            totalDebit += (amount < 0 ? -amount : 0);;
            balance += amount;
        });

        return (
            <Table.Summary.Row>
                <Table.Summary.Cell colSpan={2}>{pageData.length} Records</Table.Summary.Cell>
                <Table.Summary.Cell className="desktop right">{totalCredit.toFixed(2)}</Table.Summary.Cell>
                <Table.Summary.Cell className="desktop right">{totalDebit.toFixed(2)}</Table.Summary.Cell>
                <Table.Summary.Cell className="mobile right">{balance.toFixed(2)}</Table.Summary.Cell>
                <Table.Summary.Cell className="desktop" colSpan={3}></Table.Summary.Cell>
                <Table.Summary.Cell className="mobile" colSpan={1}></Table.Summary.Cell>
            </Table.Summary.Row>
        );
    };

    const selectRow = (record) => {
        const selection = [ ...selectedRowKeys ];
        if (selection.indexOf(record.key) >= 0) {
            selection.splice(selection.indexOf(record.key), 1);
        } else {
            selection.push(record.key);
        }
        setSelectedRowKeys(selection);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (selection) => setSelectedRowKeys(selection)
    };

    const handleChange = (pagination, filters, sorter) => {
        setSortOrder(sorter);
    };

    return (
        <Styled>
            <Table
                bordered
                columns={columns}
                dataSource={data}
                size="small"
                loading={loading}
                summary={generateSummary}
                rowSelection={rowSelection}
                onRow={(record) => ({
                    onClick: () => selectRow(record),
                })}
                onChange={handleChange}
                showSorterTooltip={false}
            />
        </Styled>
    );
}

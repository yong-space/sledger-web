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

    @media (max-width: 549px) {
        .desktop { display: none }
    }
    @media (min-width: 550px) {
        .mobile { display: none }
    }
`;

export default ({ selectedAccount }) => {
    const [ loading, setLoading ] = useState(true);
    const [ columns, setColumns ] = useRecoilState(Atom.gridColumns);
    const [ data, setData ] = useRecoilState(Atom.gridData);
    const [ selectedRowKeys, setSelectedRowKeys ] = useRecoilState(Atom.gridSelection);
    const { getTransactions } = API();

    const refreshTransactions = async (accountId) => {
        try {
            setData(await getTransactions(accountId));
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
        setColumns(getColumnsForType(selectedAccount.accountType.accountTypeClass));
        refreshTransactions(selectedAccount.accountId);
        // eslint-disable-next-line
    }, [ selectedAccount ]);

    const generateSummary = (pageData) => {
        let totalCredit = 0;
        let totalDebit = 0;

        pageData.forEach(({ amount }) => {
            totalCredit += (amount > 0 ? amount : 0);
            totalDebit += (amount < 0 ? -amount : 0);;
        });

        return (
            <Table.Summary.Row>
                <Table.Summary.Cell colSpan={2}>{pageData.length} Records</Table.Summary.Cell>
                <Table.Summary.Cell className="desktop">{totalCredit.toFixed(2)}</Table.Summary.Cell>
                <Table.Summary.Cell className="desktop">{totalDebit.toFixed(2)}</Table.Summary.Cell>
                <Table.Summary.Cell colSpan={3}></Table.Summary.Cell>
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
            />
        </Styled>
    );
}

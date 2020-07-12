import React, { useEffect } from 'react';
import { Table } from 'antd';
import LoadingSpinner from '../Common/LoadingSpinner';
import dayjs from 'dayjs';
import { useRecoilState } from 'recoil';
import Atom from '../Common/Atom';
import styled from 'styled-components';

const Styled = styled.div`
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
    const [ columns, setColumns ] = useRecoilState(Atom.gridColumns);
    const [ data, setData ] = useRecoilState(Atom.gridData);
    const [ selectedRowKeys, setSelectedRowKeys ] = useRecoilState(Atom.gridSelection);

    useEffect(() => {
        if (!selectedAccount) {
            return;
        }
        setColumns([
            {
                title: 'Date',
                dataIndex: 'date',
                key: 'date',
                render: (text, record) => dayjs(record.date).format('MMM D YYYY'),
                sorter: (a, b) => a.date > b.date,
                defaultSortOrder: 'ascend',
            },
            {
                title: 'Credit',
                dataIndex: 'credit',
                key: 'credit',
                align: 'right',
                className: 'desktop',
                render: (text, record) => record.amount > 0 ? record.amount : '',
                sorter: (a, b) => a.amount > b.amount,
            },
            {
                title: 'Debit',
                dataIndex: 'debit',
                key: 'debit',
                align: 'right',
                className: 'desktop',
                render: (text, record) => record.amount < 0 ? -record.amount : '',
                sorter: (a, b) => a.amount > b.amount,
            },
            {
                title: 'Amount',
                dataIndex: 'amount',
                key: 'amount',
                align: 'right',
                className: 'mobile',
                sorter: (a, b) => a.amount > b.amount,
            },
            {
                title: 'Balance',
                dataIndex: 'balance',
                key: 'balance',
                align: 'right',
            },
            {
                title: 'Remarks',
                dataIndex: 'remarks',
                key: 'remarks',
                ellipsis: true,
                sorter: (a, b) => a.remarks > b.remarks,
            },
            {
                title: 'Tags',
                dataIndex: 'tags',
                key: 'tags',
                className: 'desktop',
            },
        ]);

        const dataSource = [];

        for (let i=0; i<7; i++) {
            dataSource.push({
                key: i,
                date: new Date(1584538794873 + (i * 360000000)),
                amount: (Math.floor(Math.random() * 1377) - Math.floor(Math.random() * 1777)) / 100,
                balance: Math.floor(Math.random() * 1377) / 100,
                remarks: 'Hello Okay ' + i,
                tags: 'Home ' + i
            })
        }
        setData(dataSource);
    }, [ selectedAccount, setColumns, setData ]);

    const generateSummary = (pageData) => {
        let totalCredit = 0;
        let totalDebit = 0;

        pageData.forEach(({ amount }) => {
            totalCredit += (amount > 0 ? amount : 0);
            totalDebit += (amount < 0 ? -amount : 0);;
        });

        return (
            <Table.Summary.Row>
                <Table.Summary.Cell>{pageData.length} Records</Table.Summary.Cell>
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
        !selectedAccount ? <LoadingSpinner /> :
        <Styled>
            <Table
                bordered
                columns={columns}
                dataSource={data}
                size="small"
                summary={generateSummary}
                rowSelection={rowSelection}
                onRow={(record) => ({
                    onClick: () => {
                        selectRow(record);
                    },
                })}
            />
        </Styled>
    );
}

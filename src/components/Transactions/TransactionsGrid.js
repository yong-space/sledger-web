import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { useVT } from 'virtualizedtableforantd4';
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
    .ant-table-footer { font-weight: bold }
    .right { text-align: right }

    @media (max-width: 549px) {
        .desktop { display: none }
    }
    @media (min-width: 550px) {
        .mobile { display: none }
    }
`;

export default ({ selectedAccount, setFormMode }) => {
    const [ loading, setLoading ] = useState(true);
    const [ loadedId, setLoadedId ] = useState();
    const [ noMoreData, setNoMoreData ] = useState(false);
    const [ viewportHeight, setViewportHeight ] = useState();
    const [ totalRecords, setTotalRecords ] = useState(0);
    const [ sortOrder, setSortOrder ] = useState({ columnKey: 'date', order: 'ascend' });
    const [ columns, setColumns ] = useRecoilState(Atom.gridColumns);
    const [ data, setData ] = useRecoilState(Atom.gridData);
    const [ selectedRowKeys, setSelectedRowKeys ] = useRecoilState(Atom.gridSelection);
    const { getTransactions } = API();

    useEffect(() => {
        if (!selectedAccount) {
            return;
        }

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
        handleFetch(selectedAccount.id);
        // eslint-disable-next-line
    }, [ selectedAccount, sortOrder ]);

    useEffect(() => {
        const setHeight = () => {
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) - 210;
            const offset = vw < 550 ? 40 : vw < 768 ? 44 : 0;
            setViewportHeight(vh - offset);
        };
        setHeight();
        window.addEventListener('resize', setHeight);
        return () => window.removeEventListener('resize', setHeight);
        // eslint-disable-next-line
    }, []);

    const pageSize = 50;
    const handleFetch = async (id) => {
        setLoading(true);

        if (id !== loadedId) {
            setLoadedId(id);
            setData([]);
        }

        try {
            const page = Math.floor(data.length / pageSize);
            const response = await getTransactions(id, page, pageSize);
            setData(existing => existing.concat(response.content));
            setNoMoreData(response.last);
            setTotalRecords(response.totalElements);

            if (response.totalElements > 0) {
                const offset = (36 * pageSize) + (viewportHeight * 0.5);
                const body = document.querySelector('.ant-table-body');
                setTimeout(() => body && body.scrollBy(0, offset), 100);
            }
        } catch(e) {
            Notification.showError('Unable to load transactions', e.message);
        }
        setLoading(false);
    };

    const generateSummary = (pageData) => {
        let totalCredit = 0;
        let totalDebit = 0;

        pageData.forEach(({ amount }) => {
            totalCredit += (amount > 0 ? amount : 0);
            totalDebit += (amount < 0 ? -amount : 0);
        });
        return `${totalRecords} Records, Credit: ${totalCredit.toFixed(2)}, Debit: ${totalDebit.toFixed(2)}`;
    };

    const selectRow = (record) => {
        const selection = [ ...selectedRowKeys ];
        if (selection.indexOf(record.id) >= 0) {
            selection.splice(selection.indexOf(record.id), 1);
        } else {
            selection.push(record.id);
        }
        setSelectedRowKeys(selection);
    };

    const handleEvents = (record) => ({
        onClick: () => selectRow(record),
        onDoubleClick: () => {
            setSelectedRowKeys([ record.id ]);
            setFormMode('edit');
        }
    });

    const rowSelection = {
        selectedRowKeys,
        onChange: (selection) => setSelectedRowKeys(selection)
    };

    const handleChange = (pagination, filters, sorter) => {
        setSortOrder(sorter);
    };

    const handleScroll = ({ top }) => {
        if (top < 300 && !loading && !noMoreData) {
            handleFetch(selectedAccount.id);
        }
    };

    const getScrollHeight = () => {
        return ({ y: viewportHeight });
    };

    const [ vt ] = useVT(() => ({
        overscanRowCount: 10,
        scroll: getScrollHeight(),
        onScroll: handleScroll,
        initTop: 36 * pageSize
    }), [ selectedAccount, loading, noMoreData, getScrollHeight ]);

    return (
        <Styled>
            <Table
                scroll={getScrollHeight()}
                components={vt}
                pagination={false}
                bordered
                size='small'
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey='id'
                rowSelection={rowSelection}
                footer={generateSummary}
                onRow={handleEvents}
                onChange={handleChange}
                showSorterTooltip={false}
            />
        </Styled>
    );
}

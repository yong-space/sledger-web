import React, { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';
import { useVT } from 'virtualizedtableforantd4';
import { useRecoilState } from 'recoil';
import Atom from '../Common/Atom';
import styled from 'styled-components';
import API from '../Common/API';
import Notification from '../Common/Notification';
import { getColumnsForType } from './TransactionsGridColumns';
import { Resizable } from 'react-resizable';
import { formatNumber } from '../Common/Util';

const Styled = styled.div`
    height: 100%;
    margin-top: .8rem;

    .ant-table-body .ant-table-cell {
        white-space: nowrap;
        overflow-x: hidden;
        text-overflow: ellipsis;
    }
    .ant-table-thead .ant-table-cell {
        overflow: visible;
    }
    .ant-table-footer { font-weight: bold }
    .right { text-align: right }

    .react-resizable-handle {
        z-index: 99;
        position: absolute;
        bottom: 0;
        right: -0.25rem;
        height: 100%;
        width: 0.5rem;
        &:hover { cursor: ew-resize }
    }
`;

const ResizableTitle = ({ onResize, width, onClick, ...restProps }) => {
    if (!width) {
        return <th {...restProps} />;
    }

    return (
        <Resizable
            width={width}
            height={0}
            onResize={onResize}
            axis='x'
        >
            <th {...restProps} onClick={onClick} />
        </Resizable>
    );
};

const TableWrapper = ({ columns, data, vt, sortOrder, ...restProps }) => {
    const [ intColumns, setIntColumns ] = useState([]);

    useEffect(() => {
        const columnDefs = columns
            .map((column, index) => ({
                ...column,
                onHeaderCell: column => ({
                    width: column.width,
                    onResize: handleResize(index)
                })
            }))
            .map((column) => {
                if (!column.sorter) {
                    return column;
                }
                return {
                    ...column,
                    sortOrder: sortOrder.columnKey === column.key && sortOrder.order,
                    sortDirections: [ 'ascend', 'descend', 'ascend' ],
                }
            });
        setIntColumns(columnDefs);
    }, [ columns, sortOrder ]);

    const tableComponents = {
        ...vt,
        header: {
            cell: ResizableTitle,
        }
    }

    const handleResize = (index) => (e, { size }) => {
        e.stopImmediatePropagation();

        setIntColumns(oldColumns => {
            const newColumns = [ ...oldColumns ];
            newColumns[index] = {
                ...newColumns[index],
                width: size.width,
            };
            return newColumns;
        });
    };

    return (
        <Table
            bordered
            size='small'
            components={tableComponents}
            columns={intColumns}
            dataSource={data}
            pagination={false}
            rowKey='id'
            showSorterTooltip={false}
            {...restProps}
        />
    );
};

export default ({ selectedAccount, setFormMode }) => {
    const [ loading, setLoading ] = useState(true);
    const [ loadedId, setLoadedId ] = useState();
    const [ noMoreData, setNoMoreData ] = useState(false);
    const [ viewportHeight, setViewportHeight ] = useState();
    const [ totalRecords, setTotalRecords ] = useState(0);
    const [ sortOrder, setSortOrder ] = useState({ columnKey: 'date', order: 'ascend' });
    const [ columns, setColumns ] = useState([]);
    const [ data, setData ] = useRecoilState(Atom.gridData);
    const [ selectedRowKeys, setSelectedRowKeys ] = useRecoilState(Atom.gridSelection);
    const { getTransactions } = API();

    useEffect(() => {
        if (!selectedAccount) {
            return;
        }
        setColumns(getColumnsForType(selectedAccount.accountType.accountTypeClass));
        handleFetch(selectedAccount.id);
        // eslint-disable-next-line
    }, [ selectedAccount ]);

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

            const body = document.querySelector('.ant-table-body');
            if (response.totalElements > 0 && body.scrollTop > 0) {
                const offset = (36 * pageSize) + (viewportHeight * 0.5);
                setTimeout(() => body && body.scrollBy(0, offset), 100);
            }
        } catch(e) {
            Notification.showError('Unable to load transactions', e.message);
        }
        setLoading(false);
    };

    const generateSummary = () => {
        if (selectedRowKeys.length === 0) {
            return <Tag>{formatNumber(totalRecords, 0)} Records</Tag>;
        } else {
            const selectedTransactions = data.filter(t => selectedRowKeys.indexOf(t.id) > -1);
            let totalCredit = 0;
            let totalDebit = 0;
            selectedTransactions.forEach(({ amount }) => {
                totalCredit += (amount > 0 ? amount : 0);
                totalDebit += (amount < 0 ? -amount : 0);
            });
            return (
                <>
                    <Tag>{formatNumber(selectedTransactions.length, 0)} Selected</Tag>
                    <Tag>Credit: {formatNumber(totalCredit)}</Tag>
                    <Tag>Debit: {formatNumber(totalDebit)}</Tag>
                </>
            );
        }
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
        overscanRowCount: 20,
        scroll: getScrollHeight(),
        onScroll: handleScroll,
        initTop: 36 * pageSize
    }), [ selectedAccount, loading, noMoreData, getScrollHeight ]);

    return (
        <Styled>
            <TableWrapper
                vt={vt}
                columns={columns}
                data={data}
                scroll={getScrollHeight()}
                loading={loading}
                rowSelection={rowSelection}
                footer={generateSummary}
                onRow={handleEvents}
                onChange={handleChange}
                sortOrder={sortOrder}
            />
        </Styled>
    );
}

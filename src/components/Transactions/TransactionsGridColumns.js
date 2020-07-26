import { formatNumber, formatDate, sortDate } from '../Common/Util';

export const columnDefinitions = {
    date: {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        width: 110,
        render: (text, record) => formatDate(record.date),
        sorter: sortDate,
    },
    amount: {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        width: 100,
        align: 'right',
        render: (text, record) => formatNumber(record.amount),
        sorter: (a, b) => b.amount - a.amount,
    },
    balance: {
        title: 'Balance',
        dataIndex: 'balance',
        key: 'balance',
        width: 150,
        align: 'right',
        responsive: ['md'],
        render: (text, record) => formatNumber(record.balance),
    },
    remarks: {
        title: 'Remarks',
        dataIndex: 'remarks',
        key: 'remarks',
        width: 150,
        ellipsis: true,
        sorter: (a, b) => a.remarks > b.remarks,
    },
    tag: {
        title: 'Tag',
        dataIndex: 'tag',
        key: 'tag',
        width: 200,
        responsive: ['md'],
    },
};

export const getColumnsForType = (assetClass) => {
    const c = columnDefinitions;
    switch (assetClass) {
        case 'Cash':
            return [ c.date, c.amount, c.balance, c.remarks, c.tag ];
        default: return [];
    }
};

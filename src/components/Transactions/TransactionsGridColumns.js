import dayjs from 'dayjs';

export const columnDefinitions = {
    date: {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: (text, record) => dayjs(record.date).format('MMM D YYYY'),
        sorter: (a, b) => dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1,
    },
    credit: {
        title: 'Credit',
        dataIndex: 'credit',
        key: 'credit',
        align: 'right',
        className: 'desktop',
        render: (text, record) => record.amount > 0 ? record.amount.toFixed(2) : '',
        sorter: (a, b) => a.amount - b.amount,
    },
    debit: {
        title: 'Debit',
        dataIndex: 'debit',
        key: 'debit',
        align: 'right',
        className: 'desktop',
        render: (text, record) => record.amount < 0 ? (-record.amount).toFixed(2) : '',
        sorter: (a, b) => b.amount - a.amount,
    },
    amount: {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        align: 'right',
        className: 'mobile',
        render: (text, record) => record.amount.toFixed(2),
        sorter: (a, b) => b.amount - a.amount,
    },
    balance: {
        title: 'Balance',
        dataIndex: 'balance',
        key: 'balance',
        align: 'right',
        className: 'desktop',
    },
    remarks: {
        title: 'Remarks',
        dataIndex: 'remarks',
        key: 'remarks',
        ellipsis: true,
        sorter: (a, b) => a.remarks > b.remarks,
    },
    tags: {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
        className: 'desktop',
    },
};

export const getColumnsForType = (assetClass) => {
    const c = columnDefinitions;
    switch (assetClass) {
        case 'Cash':
            return [ c.date, c.credit, c.debit, c.amount, c.balance, c.remarks, c.tags ];
        default: return [];
    }
};

import dayjs from 'dayjs';

export const columnDefinitions = {
    date: {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        width: 150,
        render: (text, record) => dayjs(record.date).format('MMM D YYYY'),
        sorter: (a, b) => dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1,
    },
    credit: {
        title: 'Credit',
        dataIndex: 'credit',
        key: 'credit',
        width: 120,
        align: 'right',
        className: 'desktop',
        render: (text, record) => record.amount > 0 ? record.amount.toFixed(2) : '',
        sorter: (a, b) => a.amount - b.amount,
    },
    debit: {
        title: 'Debit',
        dataIndex: 'debit',
        key: 'debit',
        width: 120,
        align: 'right',
        className: 'desktop',
        render: (text, record) => record.amount < 0 ? (-record.amount).toFixed(2) : '',
        sorter: (a, b) => b.amount - a.amount,
    },
    amount: {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        width: 120,
        align: 'right',
        className: 'mobile',
        render: (text, record) => record.amount.toFixed(2),
        sorter: (a, b) => b.amount - a.amount,
    },
    balance: {
        title: 'Balance',
        dataIndex: 'balance',
        key: 'balance',
        width: 150,
        align: 'right',
        className: 'desktop',
    },
    remarks: {
        title: 'Remarks',
        dataIndex: 'remarks',
        key: 'remarks',
        width: 200,
        ellipsis: true,
        sorter: (a, b) => a.remarks > b.remarks,
    },
    tag: {
        title: 'Tag',
        dataIndex: 'tag',
        key: 'tag',
        width: 200,
        className: 'desktop',
    },
};

export const getColumnsForType = (assetClass) => {
    const c = columnDefinitions;
    switch (assetClass) {
        case 'Cash':
            return [ c.date, c.credit, c.debit, c.amount, c.balance, c.remarks, c.tag ];
        default: return [];
    }
};

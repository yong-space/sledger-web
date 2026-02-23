export const issuers = [
    { id: 1, name: 'DBS', colour: '0072aa', canImport: false, types: ['Cash', 'Credit', 'Retirement'] },
];

export const accounts = [
    {
        id: 1, name: 'Checking', type: 'Cash', issuerId: 1,
        balance: 1234.56, visible: true, multiCurrency: false,
    },
    {
        id: 2, name: 'Visa', type: 'Credit', issuerId: 1,
        balance: -500.00, visible: true, multiCurrency: false,
        billingCycle: 15, billingMonthOffset: 0,
    },
];

export const transactions = [
    {
        id: 1, accountId: 1, date: '2024-01-15T00:00:00Z',
        amount: 1000.00, balance: 1000.00, remarks: 'Salary', category: 'Income', company: '',
    },
    {
        id: 2, accountId: 1, date: '2024-01-16T00:00:00Z',
        amount: -50.00, balance: 950.00, remarks: 'Groceries', category: 'Food', company: 'NTUC',
    },
    {
        id: 3, accountId: 1, date: '2024-01-17T00:00:00Z',
        amount: -100.00, balance: 850.00, remarks: 'Electricity', category: 'Utilities', company: 'SP Group',
    },
];

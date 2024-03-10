import { atom, useRecoilState } from 'recoil';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const state = () => ({
    useState: (atom) => useRecoilState(atom),
    dashRoute: atom({ key: 'dashRoute', default: 'summary' }),
    settingsRoute: atom({ key: 'settingsRoute', default: 'accounts' }),
    loading: atom({ key: 'loading', default: false }),
    status: atom({ key: 'status', default: { open: false }}),
    session: atom({ key: 'session', default: undefined }),
    accounts: atom({ key: 'accounts', default: undefined }),
    selectedAccount: atom({ key: 'selectedAccount', default: undefined }),
    issuers: atom({ key: 'issuers', default: undefined }),
    transactions: atom({ key: 'transactions', default: undefined }),
    templates: atom({ key: 'templates', default: undefined }),
    transactionsAccountId: atom({ key: 'transactionsAccountId', default: undefined }),
    selectedRows: atom({ key: 'selectedRows', default: [] }),
    paginationModel: atom({ key: 'paginationModel', default: undefined }),
    filterModel: atom({ key: 'filterModel', default: undefined }),
    categories: atom({ key: 'categories', default: [] }),
    date: atom({ key: 'date', default: dayjs.utc().startOf('day') }),
    visibleTransactionId: atom({ key: 'visibleTransactionId', default: undefined }),
    currency: atom({ key: 'currency', default: 'SGD' }),
});

export default state();

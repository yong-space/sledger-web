import { atom, useAtom } from 'jotai';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const state = () => ({
    useState: (atomObj) => useAtom(atomObj),
    dashRoute: atom('summary'),
    settingsRoute: atom('accounts'),
    loading: atom(false),
    status: atom({ open: false }),
    session: atom(),
    accounts: atom(),
    selectedAccount: atom(),
    issuers: atom(),
    transactions: atom(),
    templates: atom(),
    transactionsAccountId: atom(),
    selectedRows: atom([]),
    filterModel: atom(),
    categories: atom([]),
    date: atom(dayjs.utc().startOf('day')),
    visibleTransactionId: atom(),
    currency: atom('SGD'),
});

export default state();

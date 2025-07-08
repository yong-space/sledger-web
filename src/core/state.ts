import { atom, useAtom } from 'jotai';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { AnyAccount, AccountIssuer, Transaction, Template } from './types';
import { GridFilterModel, GridRowSelectionModel } from '@mui/x-data-grid/models';

dayjs.extend(utc);

const state = () => ({
    useState: useAtom,
    dashRoute: atom('summary'),
    settingsRoute: atom('accounts'),
    loading: atom(false),
    status: atom({ open: false }),
    session: atom(),
    accounts: atom<AnyAccount[]>(),
    selectedAccount: atom<AnyAccount>(),
    issuers: atom<AccountIssuer[]>(),
    transactions: atom<Transaction[]>(),
    templates: atom<Template[]>(),
    transactionsAccountId: atom(),
    selectedRows: atom<GridRowSelectionModel>(),
    filterModel: atom<GridFilterModel>(),
    categories: atom([]),
    date: atom(dayjs.utc().startOf('day')),
    visibleTransactionId: atom(-1),
    currency: atom('SGD'),
});

export default state();

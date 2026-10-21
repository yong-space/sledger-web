import { atom, useAtom } from 'jotai';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { AnyAccount, AccountIssuer, Transaction, Template } from './types';
import { GridFilterModel, GridRowId, GridRowSelectionModel } from '@mui/x-data-grid/models';

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
    selectedRows: atom<GridRowSelectionModel>({ type: 'include', ids: new Set<GridRowId>() }),
    filterModel: atom<GridFilterModel>(),
    categories: atom([]),
    visibleTransactionId: atom(-1),
    lastTx: atom<{ date: Dayjs | null, currency: string }>({ date: dayjs.utc().startOf('day'), currency: 'SGD' }),
});

export default state();

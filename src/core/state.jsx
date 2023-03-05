import { atom, useRecoilState } from 'recoil';

const atoms = {
    loading: atom({ key: 'loading', default: false }),
    status: atom({ key: 'status', default: { open: false }}),
    session: atom({ key: 'session', default: undefined }),
    accounts: atom({ key: 'accounts', default: undefined }),
    selectedAccount: atom({ key: 'selectedAccount', default: undefined }),
    issuers: atom({ key: 'issuers', default: undefined }),
    transactions: atom({ key: 'transactions', default: undefined }),
    transactionsAccountId: atom({ key: 'transactionsAccountId', default: undefined }),
    selectedRows: atom({ key: 'selectedRows', default: undefined }),
};

const state = () => {
    return {
        useState: (key) => useRecoilState(atoms[key])
    };
};

export default state();

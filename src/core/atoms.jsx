import { atom } from 'recoil';

export const atoms = {
    loading: atom({ key: 'loading', default: false }),
    status: atom({ key: 'status', default: { open: false }}),
    session: atom({ key: 'session', default: undefined }),
    accounts: atom({ key: 'accounts', default: undefined }),
    accountId: atom({ key: 'accountId', default: undefined }),
    issuers: atom({ key: 'issuers', default: undefined }),
};

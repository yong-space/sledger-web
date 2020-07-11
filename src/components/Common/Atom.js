import { atom } from 'recoil';

export default {
    login: atom({ key: 'login', default: {} }),
    accountTypes: atom({ key: 'accountTypes', default: [] }),
    accounts: atom({ key: 'accounts', default: [] }),
    selectedNavItems: atom({ key: 'selectedNavItems', default: [] }),
};

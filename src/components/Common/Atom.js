import { atom } from 'recoil';

export default {
    login: atom({ key: 'login', default: {} }),
    accountTypes: atom({ key: 'accountTypes', default: [] }),
};

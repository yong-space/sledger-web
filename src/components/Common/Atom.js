import { atom } from 'recoil';

export default {
    login: atom({ key: 'login', default: {} }),
    apiCache: atom({ key: 'apiCache', default: {} }),
    selectedNavItems: atom({ key: 'selectedNavItems', default: [] }),
    gridColumns: atom({ key: 'gridColumns', default: [] }),
    gridData: atom({ key: 'gridData', default: [] }),
    gridSelection: atom({ key: 'gridSelection', default: [] }),
};

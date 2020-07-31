import authServices from '../Login/AuthServices';
import { useRecoilState } from 'recoil';
import Atom from '../Common/Atom';

export default () => {
    const { getJwt } = authServices();
    const baseUrl = process.env.REACT_APP_BASE_URL || window.location.origin;
    const [ GET, POST, PUT, DELETE ] = [ 'GET', 'POST', 'PUT', 'DELETE' ];
    const [ apiCache, setApiCache ] = useRecoilState(Atom.apiCache);
    const cacheableEndpoints = [
        'account-type',
        'account',
    ];

    const apiCall = (method, path, body, id) => {
        const token = getJwt();
        if (token === undefined) {
            window.location.reload();
        }
        const genericPath = path.replace(/\/\d+$/g, '');
        if (method === GET && cacheableEndpoints.indexOf(genericPath) > -1 && apiCache[path]) {
            return new Promise((resolve) => resolve(apiCache[path]));
        }

        const config = {
            method: method,
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        };
        if ([ POST, PUT, DELETE ].indexOf(method) > -1 && body) {
            if (typeof body == 'object') {
                config['body'] = JSON.stringify(body);
            } else {
                config['body'] = body;
            }
        }
        return fetch(`${baseUrl}/api/${path}`, config)
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error((await res.json()).message);
                }
                const mimeType = res.headers.get('content-type');
                return mimeType === 'application/json' ? res.json() : {};
            })
            .then(json => json)
            .then(obj => {
                if (cacheableEndpoints.indexOf(genericPath) > -1) {
                    if (method === GET) {
                        const newState = ({ ...apiCache });
                        newState[path] = obj;
                        setApiCache(newState);
                    } else if (method === POST) {
                        const newState = { ...apiCache };
                        newState[path] = [ ...newState[path], obj ];
                        setApiCache(newState)
                    } else if (method === PUT) {
                        if (genericPath === 'account/sort/') {
                            setApiCache(previous => ({
                                ...previous,
                                account: setSortCachedAccounts(apiCache.account, id),
                            }));
                        }
                    } else if (method === DELETE) {
                        if (path.indexOf('account/') === 0) {
                            setApiCache(previous => ({
                                ...previous,
                                account: autoSortCachedAccounts(apiCache.account, id),
                            }));
                        }
                    }
                }
                return obj;
            })
            .catch(err => { throw new Error(err.message) });
    }

    const autoSortCachedAccounts = (accounts, deletedId) => {
        const accountTypeClass = accounts
            .filter(a => a.id === deletedId)[0].accountType.accountTypeClass;
        const workingAccounts = accounts
            .filter(a => a.accountType.accountTypeClass === accountTypeClass && a.id !== deletedId)
            .sort((a, b) => a.sortIndex > b.sortIndex ? 1 : -1)
            .map((account, index) => ({ ...account, sortIndex: index }));
        return [
            ...accounts.filter(a => a.accountType.accountTypeClass !== accountTypeClass),
            ...workingAccounts
        ];
    };

    const setSortCachedAccounts = (accounts, sortOrder) => {
        const sortedIds = sortOrder.split(',').map(id => parseInt(id));
        const workingAccounts = sortedIds
            .map(id => accounts.filter(a => a.id === id)[0])
            .map((account, index) => ({ ...account, sortIndex: index }));
        return [
            ...accounts.filter(a => sortedIds.indexOf(a.id) === -1),
            ...workingAccounts
        ];
    };

    return {
        updateProfile: (user) => apiCall(PUT, `profile`, user),
        updatePassword: (password) => apiCall(PUT, `profile/password`, password),
        getAccountTypes: () => apiCall(GET, `account-type`),
        addAccountType: (accountType) => apiCall(POST, `admin/account-type`, accountType),
        deleteAccountType: (id) => apiCall(DELETE, `admin/account-type/${id}`, null, id),
        getAccounts: () => apiCall(GET, `account`),
        addAccount: (account) => apiCall(POST, `account`, account),
        updateAccount: (account) => apiCall(PUT, `account`, account, account.id),
        deleteAccount: (id) => apiCall(DELETE, `account/${id}`, null, id),
        sortAccounts: (ids) => apiCall(PUT, `account/sort/${ids}`, null, ids),
        getTransactions: (accountId, page, size) => apiCall(GET, `transaction/account/${accountId}?page=${page}&size=${size}`),
        addTransaction: (transaction) => apiCall(POST, `transaction`, transaction),
        updateTransaction: (transaction) => apiCall(PUT, `transaction`, transaction),
        deleteTransactions: (transactionIds) => apiCall(DELETE, `transaction`, transactionIds),
    };
};

import authServices from '../Login/AuthServices';
import { useRecoilState } from 'recoil';
import Atom from '../Common/Atom';

export default () => {
    const { getJwt } = authServices();
    const baseUrl = process.env.REACT_APP_BASE_URL || window.location.origin;
    const GET = 'GET';
    const POST = 'POST';
    const PUT = 'PUT';
    const DELETE = 'DELETE';
    const [ accountTypes, setAccountTypes ] = useRecoilState(Atom.accountTypes);

    const apiCall = async (method, path, body) => {
        const token = getJwt();
        if (token === undefined) {
            window.location.reload();
        }
        const config = {
            method: method,
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        };
        if ([ POST, PUT ].indexOf(method) > -1 && body) {
            if (typeof body == 'object') {
                body = JSON.stringify(body);
            }
            config['body'] = body;
        }
        return fetch(`${baseUrl}/api/${path}`, config)
            .then(async res => {
                if (!res.ok) {
                    throw new Error((await res.json()).message);
                }
                const mimeType = res.headers.get('content-type');
                return mimeType === 'application/json' ? res.json() : {};
            })
            .then(json => json)
            .catch(err => { throw new Error(err.message) });
    }

    return {
        updateProfile: (user) => apiCall(PUT, 'profile', user),
        updatePassword: (password) => apiCall(PUT, 'profile/password', password),
        getAccountTypes: async () => {
            if (accountTypes.length === 0) {
                const results = await apiCall(GET, 'account-type');
                setAccountTypes(results);
                return results;
            }
            return accountTypes;
        },
        addAccountType: async (accountType) => {
            const response = await apiCall(POST, 'admin/account-type', accountType);
            setAccountTypes(existing => [ ...existing, response ]);
            return response;
        },
        deleteAccountType: async (id) => {
            await apiCall(DELETE, `admin/account-type/${id}`);
            setAccountTypes(existing => existing.filter(a => a.accountTypeId !== id));
            return;
        },
        getAccounts: () => apiCall(GET, 'account'),
        addAccount: (account) => apiCall(POST, 'account', account),
        updateAccount: (account) => apiCall(PUT, 'account', account),
        deleteAccount: (id) => apiCall(DELETE, `account/${id}`),
    };
};

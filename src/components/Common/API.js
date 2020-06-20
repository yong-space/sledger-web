const baseUrl = process.env.REACT_APP_BASE_URL || window.location.origin;
const GET = 'GET';
const POST = 'POST';
const PUT = 'PUT';
const DELETE = 'DELETE';

const apiCall = (method, path, body) => {
    const jwt = JSON.parse(window.localStorage.login || "{}").jwt;
    if (jwt === undefined) {
        throw new Error("Invalid session. Please refresh this page.");
    }
    const config = {
        method: method,
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
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

export default {
    updateProfile: (user) => apiCall(PUT, 'profile', user),
    updatePassword: (password) => apiCall(PUT, 'profile/password', password),
    getAccountTypes: () => apiCall(GET, 'account-type'),
    addAccountType: (accountType) => apiCall(POST, 'admin/account-type', accountType),
    deleteAccountType: (id) => apiCall(DELETE, `admin/account-type/${id}`),
    getAccounts: () => apiCall(GET, 'account'),
    addAccount: (account) => apiCall(POST, 'account', account),
    updateAccount: (account) => apiCall(PUT, 'account', account),
    deleteAccount: (id) => apiCall(DELETE, `account/${id}`),
}

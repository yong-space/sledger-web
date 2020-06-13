const baseUrl = process.env.REACT_APP_BASE_URL || window.location.origin;
const GET = 'GET';
const POST = 'POST';
const PUT = 'PUT';
const DELETE = 'DELETE';

const apiCall = (method, path, body) => {
    const jwt = JSON.parse(window.localStorage.login).jwt;
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
            const mimeType = res.headers.get("content-type")
            return mimeType === 'application/json' ? res.json() : {};
        })
        .then(json => json)
        .catch(err => { throw new Error(err.message) });
}

const updateProfile = (user) => {
    return apiCall(PUT, 'profile', user);
}

const updatePassword = (password) => {
    return apiCall(PUT, 'profile/password', password);
}

const getAccountTypes = () => {
    return apiCall(GET, 'account-type');
}

const addAccountType = (accountType) => {
    return apiCall(POST, 'admin/account-type', accountType);
}

const deleteAccountType = (accountTypeId) => {
    return apiCall(DELETE, 'admin/account-type/' + accountTypeId);
}

export default {
    updateProfile,
    updatePassword,
    getAccountTypes,
    addAccountType,
    deleteAccountType
}

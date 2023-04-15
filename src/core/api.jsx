import { useNavigate } from 'react-router-dom';
import state from './state';

const parseJwt = (token) => {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = window.atob(base64).split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('');
    return JSON.parse(decodeURIComponent(payload));
};

const api = () => {
    let navigate = useNavigate();
    const apiRoot = window.location.hostname === 'localhost' ? '//localhost:8080' : '';

    const setStatus = state.useState(state.status)[1];
    const setLoading = state.useState(state.loading)[1];
    const [ session, setSession ] = state.useState(state.session);
    const showStatus = (severity, msg) => setStatus({ open: true, severity, msg });

    const process = async (response) => {
        if (response.ok) {
            if (response.headers.get('Content-Length') === '0') {
                return new Promise((r) => r(""));
            }
            const contentType = response.headers.get('Content-type').split(';')[0];
            return contentType === 'text/plain' ? response.text() : response.json();
        } else {
            if (response.status === 401) {
                setSession(undefined);
                window.localStorage.clear();
                if (!response.url.endsWith('api/authenticate')) {
                    navigate('/login', { replace: true });
                    throw new Error('Your session has expired. Please login again.');
                }
            }
            throw new Error((await response.json()).detail);
        }
    };

    const handleError = ({ message }) => {
        setLoading(false);
        const msg = message.startsWith('NetworkError') || message.startsWith('Failed to fetch')
            ? 'Unable to establish connectivity' : message;
        showStatus('error', msg);
    };

    const apiCall = (method, uri, callback, body) => {
        const headers = { 'Content-Type': 'application/json' };
        if (session?.token && [ 'register', 'authenticate' ].indexOf(uri) === -1) {
            headers.Authorization = 'Bearer ' + session.token;
        }
        const config = { method, headers };
        if (body) {
            config.body = JSON.stringify(body);
        }
        fetch(`${apiRoot}/api/${uri}`, config)
            .then(process).then(callback).catch(handleError);
    };

    const [ GET, POST, PUT, DELETE ] = [ 'GET', 'POST', 'PUT', 'DELETE' ];

    return {
        showStatus,
        parseJwt,
        register: (payload, callback) => apiCall(POST, 'register', callback, payload),
        authenticate: (payload, callback) => apiCall(POST, 'authenticate', callback, payload),
        refreshToken: (callback) => apiCall(GET, 'refresh-token', callback),
        listIssuers: (callback) => apiCall(GET, 'account-issuer', callback),
        addIssuer: (payload, callback) => apiCall(POST, 'admin/account-issuer', callback, payload),
        editIssuer: (payload, callback) => apiCall(PUT, 'admin/account-issuer', callback, payload),
        deleteIssuer: (id, callback) => apiCall(DELETE, `admin/account-issuer/${id}`, callback),
        updateProfile: (payload, callback) => apiCall(PUT, 'profile', callback, payload),
        listAccounts: (callback) => apiCall(GET, 'account', callback),
        addAccount: (payload, callback) => apiCall(POST, 'account', callback, payload),
        editAccount: (payload, callback) => apiCall(PUT, 'account', callback, payload),
        editAccountVisibility: (accountId, visible, callback) => apiCall(PUT, `account/${accountId}/${visible}`, callback),
        deleteAccount: (id, callback) => apiCall(DELETE, `account/${id}`, callback),
        listTransactions: (id, callback) => apiCall(GET, `transaction/${id}`, callback),
        addTransaction: (payload, callback) => apiCall(POST, 'transaction', callback, payload),
        editTransaction: (payload, callback) => apiCall(PUT, 'transaction', callback, payload),
        deleteTransaction: (id, callback) => apiCall(DELETE, `transaction/${id}`, callback),
        suggestRemarks: (input, callback) => apiCall(GET, `data/suggest-remarks?q=${input}`, callback),
        suggestCategory: (input, callback) => apiCall(GET, `data/suggest-category?q=${input}`, callback),
        suggestCode: (input, callback) => apiCall(GET, `data/suggest-code?q=${input}`, callback),
        suggestCompany: (input, callback) => apiCall(GET, `data/suggest-company?q=${input}`, callback),
    };
};
export default api;

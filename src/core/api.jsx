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
            const error = await response.json();
            const message = error.detail || error.error || error.status;
            throw new Error(`Error: ${message}`);
        }
    };

    const handleError = ({ message }) => {
        setLoading(false);
        const msg = message.startsWith('NetworkError') || message.startsWith('Failed to fetch')
            ? 'Unable to establish connectivity' : message;
        showStatus('error', msg);
    };

    const apiCall = (method, uri, callback, body) => {
        const headers = {};
        if (!(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        if (session?.token && [ 'register', 'authenticate' ].indexOf(uri) === -1) {
            headers['Authorization'] = 'Bearer ' + session.token;
        }
        const config = { method, headers };
        if (body) {
            config.body = body instanceof FormData ? body : JSON.stringify(body);
        }
        fetch(`${apiRoot}/api/${uri}`, config)
            .then(process).then(callback).catch(handleError);
    };

    const [ GET, POST, PUT, DELETE ] = [ 'GET', 'POST', 'PUT', 'DELETE' ];

    const clean = (input) => encodeURIComponent(input).trim();

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
        editAccount: (id, payload, callback) => apiCall(PUT, `account/${id}`, callback, payload),
        editAccountVisibility: (accountId, visible, callback) => apiCall(PUT, `account/${accountId}/${visible}`, callback),
        deleteAccount: (id, callback) => apiCall(DELETE, `account/${id}`, callback),
        listTransactions: (id, callback) => apiCall(GET, `transaction/${id}`, callback),
        addTransaction: (payload, callback) => apiCall(POST, 'transaction', callback, payload),
        editTransaction: (payload, callback) => apiCall(PUT, 'transaction', callback, payload),
        bulkEditTransactions: (payload, callback) => apiCall(PUT, 'transaction/bulk', callback, payload),
        deleteTransaction: (id, callback) => apiCall(DELETE, `transaction/${id}`, callback),
        suggestRemarks: (input, callback) => apiCall(GET, `suggest/remarks?q=${clean(input)}`, callback),
        suggestCode: (input, callback) => apiCall(GET, `suggest/code?q=${clean(input)}`, callback),
        suggestCompany: (input, callback) => apiCall(GET, `suggest/company?q=${clean(input)}`, callback),
        getCategories: (callback) => apiCall(GET, 'suggest/categories', callback),
        listTemplates: (callback) => apiCall(GET, 'template', callback),
        addTemplates: (payload, callback) => apiCall(POST, 'template', callback, payload),
        editTemplates: (payload, callback) => apiCall(PUT, 'template', callback, payload),
        deleteTemplate: (id, callback) => apiCall(DELETE, `template/${id}`, callback),
        uploadImport: (payload, callback) => apiCall(POST, 'import', callback, payload),
        getInsights: (callback) => apiCall(GET, 'dash/insights', callback),
        getCreditCardBills: (id, callback) => apiCall(GET, `dash/credit-card-bills/${id}`, callback),
        getBalanceHistory: (callback) => apiCall(GET, 'dash/balance-history', callback),
        challenge: (callback) => apiCall(GET, 'profile/challenge', callback),
    };
};
export default api;

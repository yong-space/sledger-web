import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { atoms } from './atoms';

const parseJwt = (token) => {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = window.atob(base64).split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('');
    return JSON.parse(decodeURIComponent(payload));
};

const api = () => {
    let navigate = useNavigate();
    const apiRoot = window.location.hostname === 'localhost' ? '//localhost:8080' : '';
    const setStatus = useRecoilState(atoms.status)[1];
    const setLoading = useRecoilState(atoms.loading)[1];
    const [ session, setSession ] = useRecoilState(atoms.session);
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
                if (!response.url.endsWith('api/public/authenticate')) {
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

    const apiCall = (method, uri, body, callback) => {
        const headers = { 'Content-Type': 'application/json' };
        if (session?.token && uri.indexOf('api/public') === -1) {
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
        register: (payload, callback) => apiCall(POST, 'public/register', payload, callback),
        authenticate: (payload, callback) => apiCall(POST, 'public/authenticate', payload, callback),
        listIssuers: (callback) => apiCall(GET, 'account-issuer', null, callback),
        addIssuer: (payload, callback) => apiCall(POST, 'admin/account-issuer', payload, callback),
        editIssuer: (payload, callback) => apiCall(PUT, 'admin/account-issuer', payload, callback),
        deleteIssuer: (id, callback) => apiCall(DELETE, `admin/account-issuer/${id}`, null, callback),
        getProfile: (callback) => apiCall(GET, 'profile', null, callback),
        updateProfile: (payload, callback) => apiCall(PUT, 'profile', payload, callback),
    };
};
export default api;

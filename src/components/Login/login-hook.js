import { useContext } from 'react';
import { LoginContext } from './login-context';

export default () => {
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const [ state, setState ] = useContext(LoginContext);

    const login = async (username, password) => {
        let formData = new FormData();
        formData.append('username', username.trim());
        formData.append('password', password.trim());

        return await fetch(`${baseUrl}/api/authenticate`, {
            method: 'POST',
            cache: 'no-cache',
            body: formData
        })
        .then(res => {
            if (!res.ok)
                throw Error(res.statusText);
            return res.text();
        })
        .then(jwt => {
            const newState = { jwt, jwtObj: parseJwt(jwt) };
            setState(newState);
            return newState;
        })
        .catch(() => {
            const newState = { error: 'Authentication Failed' };
            setState(newState);
            return newState;
        });
    };

    const isLoginValid = () => !!(state.jwtObj && (state.jwtObj.exp * 1000) > Date.now());

    const getUsername = () => (state.jwtObj && state.jwtObj.sub) || undefined;

    const logout = () => {
        setState({});
        setTimeout(() => localStorage.clear(), 300);
        window.location.replace('/');
    };

    const parseJwt = (token) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
    };

    return {
        login,
        logout,
        isLoginValid,
        getUsername,
    }
};
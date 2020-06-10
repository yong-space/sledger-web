import { useContext } from 'react';
import createPersistedState from 'use-persisted-state';
import { LoginContext } from './LoginContext';

export default () => {
    const baseUrl = process.env.REACT_APP_BASE_URL || window.location.origin;
    const [ state, setState ] = useContext(LoginContext);
    const [ profile, setProfile ] = createPersistedState('profile')({});

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
            setProfile({
                username: newState.jwtObj.sub,
                fullName: newState.jwtObj.name,
                email: newState.jwtObj.email
            })
            return newState;
        })
        .catch(() => {
            const newState = { error: 'Authentication Failed' };
            setState(newState);
            return newState;
        });
    };

    const isLoginValid = () => !!(state.jwtObj && (state.jwtObj.exp * 1000) > Date.now());

    const getProfile = () => profile;

    const getJwt = () => state.jwt;

    const logout = () => {
        window.localStorage.clear();
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
        getProfile,
        setProfile,
        getJwt
    }
};

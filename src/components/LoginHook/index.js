import { useContext } from 'react';
import { LoginContext } from "../LoginContext";

export default () => {
    const [ state, setState ] = useContext(LoginContext);

    const setLoginSuccess = (jwt) => {
        setState({ jwt: parseJwt(jwt), error: undefined });
    };

    const setLoginError = (error) => {
        setState({ error, jwt: undefined });
    };

    const isLoginValid = () => {
        return !(!state.jwt || Date.now() >= state.jwt.exp * 1000);
    };

    const getUsername = () => (state.jwt && state.jwt.sub) || undefined;

    const logout = () => {
        setState({});
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
        setLoginSuccess,
        setLoginError,
        isLoginValid,
        getUsername,
        logout,
    }
};

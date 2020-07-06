import { useRecoilState } from 'recoil';
import Atom from '../Common/Atom';

export default () => {
    const [ loginState, setLoginState ] = useRecoilState(Atom.login);
    const baseUrl = process.env.REACT_APP_BASE_URL || window.location.origin;

    const parseJwt = (token) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = atob(base64).split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('');
        return JSON.parse(decodeURIComponent(jsonPayload));
    };

    const parseLoginState = (token) => {
        const jwtObj = parseJwt(token);
        const { sub, name, email } = jwtObj;
        const profile = { username: sub, fullName: name, email };
        return { jwt: token, jwtObj, profile };
    };

    const setProfile = (profile) => {
        if (loginState?.profile) {
            setLoginState({ ...loginState, profile });
        }
    };

    const login = async (username, password) => {
        let formData = new FormData();
        formData.append('username', username.trim());
        formData.append('password', password.trim());

        const config = {
            method: 'POST',
            cache: 'no-cache',
            body: formData
        };

        const state = fetch(`${baseUrl}/api/authenticate`, config)
            .then(res => {
                if (!res.ok)
                    throw Error(res.statusText);
                return res.text();
            })
            .then(token => {
                const loginState = parseLoginState(token);
                localStorage.setItem('jwt', token);
                return loginState;
            })
            .catch(() => ({ error: 'Authentication Failed' }));
        setLoginState(state);
        return state;
    };

    const isLoginValidForToken = (token) => (token.exp * 1000) > Date.now();

    const getAuthToken = () => {
        if (!loginState.jwtObj) {
            const storedJwt = localStorage.getItem("jwt");
            if (!!storedJwt) {
                if (isLoginValidForToken(parseJwt(storedJwt))) {
                    return parseLoginState(storedJwt);
                }
                localStorage.clear();
            }
            return null;
        }
        return isLoginValidForToken(loginState.jwtObj) ? {} : null;
    };

    const setTokenState = (token) => setLoginState(token);

    const isAdmin = () => {
        let jwtObj = loginState?.jwtObj;
        if (!jwtObj) {
            const jwtString = localStorage.getItem("jwt");
            if (jwtString === null) {
                return false;
            }
            return parseJwt(jwtString);
        }
        return jwtObj.roles.indexOf("ADMIN") > -1;
    }

    const getProfile = () => loginState.profile || parseLoginState(localStorage.getItem("jwt")).profile;

    const getJwt = () => (loginState && loginState.jwt) || localStorage.getItem("jwt");

    const logout = () => {
        localStorage.clear();
        window.location.replace('/');
    };

    return {
        login,
        logout,
        getAuthToken,
        setTokenState,
        isAdmin,
        getProfile,
        setProfile,
        getJwt
    }
};

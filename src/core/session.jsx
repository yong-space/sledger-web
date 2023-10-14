import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from './api';
import App from './app';
import Public from '../public/public';
import state from './state';

const Session = () => {
    let navigate = useNavigate();
    const location = useLocation();
    const [ loading, setLoading ] = useState(true);
    const [ session, setSession ] = state.useState(state.session);
    const { parseJwt, refreshToken, challenge, showStatus } = api();

    const isPublicEndpoint = () => [ '/login', '/register' ].indexOf(location.pathname) > -1;

    useEffect(() => {
        if (session !== undefined) {
            return;
        }
        const token = window.localStorage.getItem('token');
        if (!token) {
            if (!isPublicEndpoint()) {
                navigate('/login', { replace: true });
            }
            setLoading(false);
            return;
        }
        let jwt = parseJwt(token);
        if (new Date().getTime() >= (jwt.exp * 1000)) {
            window.localStorage.clear();
            setSession(undefined);
            if (!isPublicEndpoint()) {
                navigate('/login', { replace: true });
            }
        } else {
            const biometrics = window.localStorage.getItem('biometrics');
            if (!biometrics) {
                setSession({ token, name: jwt.name, email: jwt.sub, admin: jwt.admin });
                setLoading(false);
                return;
            }
            challenge((response) => {
                const publicKey = {
                    challenge: Uint8Array.from(response.token, c => c.charCodeAt(0)).buffer,
                    timeout: 50000
                };
                navigator.credentials.get({ publicKey }).then(
                    () => {
                        setSession({ token, name: jwt.name, email: jwt.sub, admin: jwt.admin });
                        showStatus('success', 'Session unlocked');
                        setLoading(false);
                    },
                    (err) => {
                        console.error(err);
                        window.localStorage.clear();
                        setSession(undefined);
                        navigate('/login', { replace: true });
                        showStatus('error', 'Invalid biometric credentials');
                        setLoading(false);
                    }
                );
            });
        }
    }, []);

    useEffect(() => {
        if (!session) {
            console.debug('UE2 session does not exist')
            return;
        }
        const milisecondsToExpiry = (parseJwt(session.token).exp * 1000) - (new Date()).getTime();
        if (milisecondsToExpiry > 3600000) {
            return;
        }
        refreshToken(({ token }) => {
            window.localStorage.setItem('token', token);
            const jwt = parseJwt(token);
            setSession({ token: token, name: jwt.name, email: jwt.sub, admin: jwt.admin });
        });
    }, [ session ]);

    return loading ? <></> : !session ? <Public /> : <App />;
}

export default Session;

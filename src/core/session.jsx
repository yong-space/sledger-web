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
            console.debug('UE1: Session exists');
            return;
        }
        console.debug('UE1: Session does not exist');
        const token = window.localStorage.getItem('token');
        if (!token) {
            console.debug('UE1: No stored token');
            if (!isPublicEndpoint()) {
                navigate('/login', { replace: true });
            }
            setLoading(false);
            return;
        }
        let jwt = parseJwt(token);
        console.debug('UE1: Stored token', jwt);
        if (new Date().getTime() >= (jwt.exp * 1000)) {
            console.debug('UE1: Stored token has expired');
            window.localStorage.clear();
            setSession(undefined);
            if (!isPublicEndpoint()) {
                navigate('/login', { replace: true });
            }
            setLoading(false);
        } else {
            console.debug('UE1: Stored token still valid');
            const biometrics = window.localStorage.getItem('biometrics');
            if (!biometrics) {
                console.debug('UE1: Biometrics not enabled');
                setSession({ token, name: jwt.name, email: jwt.sub, admin: jwt.admin });
                setLoading(false);
                return;
            }
            console.debug('UE1: Biometrics enabled');
            challenge((response) => {
                const { id } = JSON.parse(biometrics);
                let originalId = new Uint8Array(atob(id).split('').map((c) => c.charCodeAt(0)));

                const publicKey = {
                    challenge: Uint8Array.from(response.token, c => c.charCodeAt(0)),
                    allowCredentials: [{
                        id: originalId.buffer,
                        type: 'public-key',
                    }],
                    timeout: 50000
                };
                navigator.credentials.get({ publicKey }).then(
                    () => {
                        console.debug('UE1: Biometrics challenge successful');
                        setSession({ token, name: jwt.name, email: jwt.sub, admin: jwt.admin });
                        showStatus('success', 'Session unlocked');
                        setLoading(false);
                    },
                    (err) => {
                        console.debug('UE1: Biometrics challenge failed');
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
            console.debug('UE2: No session exists');
            return;
        }
        console.debug('UE2: Session exists');
        const milisecondsToExpiry = (parseJwt(session.token).exp * 1000) - (new Date()).getTime();
        if (milisecondsToExpiry > 518400000) {
            console.debug('UE2: Session still fresh');
            return;
        }
        console.debug('UE2: Session not fresh');
        refreshToken(({ token }) => {
            console.debug(`UE2: Obtained new token: ${token}`);
            window.localStorage.setItem('token', token);
            const jwt = parseJwt(token);
            setSession({ token: token, name: jwt.name, email: jwt.sub, admin: jwt.admin });
            console.debug('UE2: Session replaced');
        });
    }, [ session ]);

    return loading ? <></> : !session ? <Public /> : <App />;
}

export default Session;

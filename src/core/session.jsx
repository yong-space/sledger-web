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

    const isPublicEndpoint = () => [ '/login', '/register', '/no-connectivity' ].indexOf(location.pathname) > -1;

    useEffect(() => {
        const token = window.localStorage.getItem('token');
        if (!token) {
            console.debug('UE1: No stored token exists');
            if (!isPublicEndpoint()) {
                navigate('/login', { replace: true });
            }
            setLoading(false);
            return;
        }
        let jwt = parseJwt(token);
        console.debug('UE1: Stored token exists:', jwt);
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
            const biometrics = JSON.parse(window.localStorage.getItem('biometrics'));

            if (!biometrics) {
                console.debug('UE1: Biometrics is not enabled');
                setSession({ token, name: jwt.name, email: jwt.sub, admin: jwt.admin });
                setLoading(false);
                return;
            }
            console.debug('UE1: Biometrics is enabled');
            if (new Date() < new Date(biometrics?.expiry)) {
                console.debug('UE1: Biometrics not expired yet, skip challenge');
                setSession({ token, name: jwt.name, email: jwt.sub, admin: jwt.admin });
                setLoading(false);
                return;
            }
            console.debug('UE1: Biometrics expired, initiating challenge');
            challenge((response) => {
                let originalId = new Uint8Array(atob(biometrics.id).split('').map((c) => c.charCodeAt(0)));

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
                        console.debug('UE1: Biometrics challenge successful, unlocking session');
                        setSession({ token, name: jwt.name, email: jwt.sub, admin: jwt.admin });
                        showStatus('success', 'Session unlocked');
                        setLoading(false);
                        window.localStorage.setItem('biometrics', JSON.stringify({
                            ...biometrics,
                            expiry: new Date((new Date()).getTime() + (5 * 60 * 1000)).toISOString(),
                        }));
                    },
                    (err) => {
                        console.debug('UE1: Biometrics challenge failed');
                        console.error(err);
                        window.localStorage.clear();
                        setSession(undefined);
                        navigate('/login', { replace: true });
                        showStatus('error', 'Invalid biometric credentials');
                        setLoading(false);
                        console.debug('UE1: Biometrics challenge failed, logging');
                    }
                );
            });
        }
    }, []);

    useEffect(() => {
        if (!session) {
            return;
        }
        console.debug('UE2: Session exists');
        const milisecondsToExpiry = (parseJwt(session.token).exp * 1000) - (new Date()).getTime();
        if (milisecondsToExpiry > 518400000) {
            console.debug('UE2: Session still fresh');
            return;
        }
        console.debug('UE2: Session near expiry, initiating refresh');
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

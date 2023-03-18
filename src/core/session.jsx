import { lazy, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from './api';
import state from './state';

const App = lazy(() => import('./app'));
const Public = lazy(() => import('../public/public'));

const Session = () => {
    let navigate = useNavigate();
    const location = useLocation();
    const [ loading, setLoading ] = useState(true);
    const [ session, setSession ] = state.useState(state.session);
    const { parseJwt, refreshToken } = api();

    const isPublicEndpoint = () => [ '/login', '/register' ].indexOf(location.pathname) > -1;

    useEffect(() => {
        if (session !== undefined) {
            return;
        }
        const token = window.localStorage.getItem('token');
        if (token === null) {
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
            setSession({ token, name: jwt.name, email: jwt.sub, admin: jwt.admin });

        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!session) {
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

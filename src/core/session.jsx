import { atoms } from './atoms';
import { lazy, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import api from './api';

const App = lazy(() => import('./app'));
const Public = lazy(() => import('../public/public'));

const Session = () => {
    let navigate = useNavigate();
    const location = useLocation();
    const [ loading, setLoading ] = useState(true);
    const [ session, setSession ] = useRecoilState(atoms.session);
    const { parseJwt, getProfile, showStatus } = api();

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
        const jwt = parseJwt(token);
        if (new Date().getTime() >= (jwt.exp * 1000)) {
            window.localStorage.clear();
            setSession(undefined);
            if (location.pathname !== '/') {
                showStatus("warning", "Your session has expired. Please login again.");
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
        const expiryDelta = (parseJwt(session.token).exp * 1000) - (new Date()).getTime();
        if (expiryDelta > 86340000) {
            return;
        }
        getProfile(({ token }) => {
            window.localStorage.setItem('token', token);
            const jwt = parseJwt(token);
            setSession({ token: token, name: jwt.name, email: jwt.sub, admin: jwt.admin });
        });
    }, [ session ]);

    return loading ? <></> : !session ? <Public /> : <App />;
}

export default Session;

import { atoms } from './atoms';
import { lazy, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import api from './api';

const App = lazy(() => import('./app'));
const Public = lazy(() => import('../public/public'));

const Session = () => {
    let navigate = useNavigate();
    const location = useLocation();
    const [ session, setSession ] = useRecoilState(atoms.session);
    const { parseJwt } = api();

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
        } else {
            const jwt = parseJwt(token);
            const expiry = jwt.exp * 1000;
            if (new Date() > expiry) {
                window.localStorage.clear();
                setSession(undefined);
                navigate("/login", { replace: true });
                showStatus("warning", "Your session has expired. Please login again.");
            } else {
                setSession({ session: token, name: jwt.name, admin: jwt.admin });

                // TODO: if more than an hour from last login
                // TODO: call refresh token
                // TODO: write to localStorage
            }
        }
    }, []);

    return (!session || isPublicEndpoint()) ? <Public /> : <App />;
}

export default Session;

import { lazy, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { atoms } from './atoms';

const App = lazy(() => import('./app'));
const Public = lazy(() => import('../public/public'));

const Session = () => {
    let navigate = useNavigate();
    const location = useLocation();
    const [ session, setSession ] = useRecoilState(atoms.session);

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
            // TODO: validate ok
            setSession({ session: token });
            // TODO: validate fail
            // TODO: window.localStorage.clear();
        }
    }, []);

    return (!session || isPublicEndpoint()) ? <Public /> : <App />;
}

export default Session;

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { atoms } from './atoms';

const Session = ({ children }) => {
    let navigate = useNavigate();
    const [ session, setSession ] = useRecoilState(atoms.session);

    useEffect(() => {
        if (session !== undefined) {
            return;
        }
        const storedSession = window.localStorage.getItem('session');
        if (storedSession === null) {
            navigate('login', { replace: true });
        } else {
            // validate ok
            setSession(storedSession);
            //validate fail
            window.localStorage.clear();
        }
    }, []);

    return children;
}

export default Session;

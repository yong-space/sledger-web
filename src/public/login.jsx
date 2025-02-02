import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../core/api';
import Button from '@mui/material/Button';
import LoginIcon from '@mui/icons-material/Login';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import TextField from '@mui/material/TextField';
import { Title } from '../core/utils';

const Login = () => {
    let navigate = useNavigate();
    const location = useLocation();
    const { authenticate, showStatus, parseJwt } = api();
    const setSession = state.useState(state.session)[1];
    const [ loading, setLoading ] = state.useState(state.loading);

    useEffect(() => {
        if (location.hash === '#activated') {
            navigate('/login', { replace: true });
            showStatus('success', 'Activation successful');
        }
    }, []);

    const submit = (event) => {
        event.preventDefault();
        setLoading(true);
        const credentials = Object.fromEntries(new FormData(event.target).entries());

        authenticate(credentials, ({ token }) => {
            setLoading(false);
            window.localStorage.setItem('token', token);
            const jwt = parseJwt(token);
            setSession({ token, name: jwt.name, email: jwt.sub, admin: jwt.admin });
            navigate('/dash', { replace: true });
            showStatus('success', 'Logged in successfully');
        });
    };

    return (
        <form onSubmit={submit} autoComplete="off">
            <Stack spacing={2}>
                <Title>Login</Title>
                <TextField required name="username" type="email" label="Email" inputProps={{ minLength: 7, autoComplete: 'username' }} />
                <TextField required name="password" type="password" label="Password" inputProps={{ minLength: 8, autoComplete: 'password' }} />
                <Button
                    type="submit"
                    endIcon={<LoginIcon />}
                    loading={loading}
                    loadingPosition="center"
                    variant="contained"
                >
                    Login
                </Button>
                <Link to="/register">Get an account</Link>
            </Stack>
        </form>
    );
};

export default Login;

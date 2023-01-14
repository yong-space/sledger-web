import { atoms } from '../core/atoms';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import api from '../core/api';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';
import LoginIcon from '@mui/icons-material/Login';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const Login = () => {
    let navigate = useNavigate();
    const { authenticate, showStatus } = api();
    const setSession = useRecoilState(atoms.session)[1];
    const [ loading, setLoading ] = useRecoilState(atoms.loading);

    const login = (event) => {
        event.preventDefault();
        setLoading(true);
        const credentials = Object.fromEntries(new FormData(event.target).entries());

        authenticate(credentials, ({ token }) => {
            setLoading(false);
            window.localStorage.setItem('token', token);
            setSession({ session: token });
            navigate('/dash', { replace: true });
            showStatus('success', 'Logged in successfully');
        });
    };

    return (
        <>
            <Typography variant="h5" mb={4}>
                Login
            </Typography>
            <form id="login" onSubmit={login} autoComplete="off">
                <Stack spacing={2}>
                    <TextField required name="username" type="email" label="Email" minLength="7" />
                    <TextField required name="password" type="password" label="Password" minLength="8" />
                    <LoadingButton
                        type="submit"
                        endIcon={<LoginIcon />}
                        loading={loading}
                        loadingPosition="center"
                        variant="contained"
                    >
                        Login
                    </LoadingButton>
                </Stack>
            </form>
            <Link to="/register">Get an account</Link>
        </>
    );
};

export default Login;

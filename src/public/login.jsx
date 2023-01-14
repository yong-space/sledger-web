import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { atoms } from '../core/atoms';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import api from '../core/api';

const Login = () => {
    let navigate = useNavigate();
    const { authenticate, showStatus } = api();
    const setSession = useRecoilState(atoms.session)[1];

    const login = (event) => {
        event.preventDefault();
        const credentials = Object.fromEntries(new FormData(event.target).entries());

        authenticate(credentials, ({ token }) => {
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
                <Grid
                    container item
                    direction="column"
                    sx={{ gap: '.8rem' }}
                    xs={12}
                >
                    <TextField required name="username" type="email" label="Email" minLength="7" />
                    <TextField required name="password" type="password" label="Password" minLength="8" />
                    <Button variant="contained" type="submit">
                        Login
                    </Button>
                </Grid>
            </form>
            <Link to="/register">Get an account</Link>
        </>
    );
};

export default Login;

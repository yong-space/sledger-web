import { useNavigate, Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import api from '../core/api';

const Register = () => {
    let navigate = useNavigate();
    const { register, showStatus } = api();

    const login = (event) => {
        event.preventDefault();
        const registration = Object.fromEntries(new FormData(event.target).entries());

        register(registration, () => {
            showStatus(false, 'Registration successful');
            navigate('/login', { replace: true });
        });
    };

    return (
        <>
            <Typography variant="h5" mb={4}>
                Register
            </Typography>
            <form id="login" onSubmit={login} autoComplete="off">
                <Grid
                    container item
                    direction="column"
                    sx={{ gap: '.8rem' }}
                    xs={12}
                >
                    <TextField required name="displayName" label="Name" minLength="3" />
                    <TextField required name="username" type="email" label="Email" minLength="7" />
                    <TextField required name="password" type="password" label="Password" minLength="8" />
                    <TextField required name="password2" type="password" label="Repeat Password" minLength="8" />
                    <Button variant="contained" type="submit">
                        Register
                    </Button>
                </Grid>
            </form>
            <Link to="/login">Have an account?</Link>
        </>
    );
};

export default Register;

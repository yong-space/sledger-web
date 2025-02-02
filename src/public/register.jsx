import { useNavigate, Link } from 'react-router-dom';
import api from '../core/api';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import TextField from '@mui/material/TextField';
import { Title } from '../core/utils';

const Register = () => {
    let navigate = useNavigate();
    const { register, showStatus } = api();
    const [ loading, setLoading ] = state.useState(state.loading);

    const submit = (event) => {
        event.preventDefault();
        setLoading(true);
        const registration = Object.fromEntries(new FormData(event.target).entries());

        if (registration.password !== registration.password2) {
            showStatus('error', 'Passwords do not match');
            return;
        }
        delete registration.password2;

        register(registration, () => {
            setLoading(false);
            showStatus('success', 'Please check your email and visit the activation link');
            navigate('/login', { replace: true });
        });
    };

    return (
        <form onSubmit={submit} autoComplete="off">
            <Stack spacing={2}>
                <Title>Register</Title>
                <TextField required name="displayName" label="Name" inputProps={{ minLength: 3 }}/>
                <TextField required name="username" type="email" label="Email" inputProps={{ minLength: 7 }} />
                <TextField required name="password" type="password" label="Password" inputProps={{ minLength: 8 }} autoComplete="new-password" />
                <TextField required name="password2" type="password" label="Repeat Password" inputProps={{ minLength: 8 }} autoComplete="new-password" />
                <Button
                    type="submit"
                    endIcon={<HowToRegIcon />}
                    loading={loading}
                    loadingPosition="center"
                    variant="contained"
                >
                    Register
                </Button>
                <Link to="/login">Have an account?</Link>
            </Stack>
        </form>
    );
};

export default Register;

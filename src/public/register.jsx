import { atoms } from '../core/atoms';
import { useNavigate, Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import api from '../core/api';
import LoadingButton from '@mui/lab/LoadingButton';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const Register = () => {
    let navigate = useNavigate();
    const { register, showStatus } = api();
    const [ loading, setLoading ] = useRecoilState(atoms.loading);

    const login = (event) => {
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
        <form id="login" onSubmit={login} autoComplete="off">
            <Stack spacing={2}>
                <Typography variant="h5" mb={4}>
                    Register
                </Typography>
                <TextField required name="displayName" label="Name" minLength="3" />
                <TextField required name="username" type="email" label="Email" minLength="7" />
                <TextField required name="password" type="password" label="Password" minLength="8" autoComplete="new-password" />
                <TextField required name="password2" type="password" label="Repeat Password" minLength="8"  autoComplete="new-password" />
                <LoadingButton
                    type="submit"
                    endIcon={<HowToRegIcon />}
                    loading={loading}
                    loadingPosition="center"
                    variant="contained"
                >
                    Register
                </LoadingButton>
                <Link to="/login">Have an account?</Link>
            </Stack>
        </form>
    );
};

export default Register;

import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { atoms } from './atoms';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const Login = () => {
    let navigate = useNavigate();
    const [ session, setSession ] = useRecoilState(atoms.session);

    const login = () => {
        setSession({ session: 'abc' });
        navigate('/', { replace: true });
    };

    return (
        <>
            <Typography variant="h5" mb={4}>
                Login
            </Typography>
            <Grid
                container item
                direction="column"
                sx={{ gap: '.8rem' }}
                xs={12} sm={8} lg={5}
            >
                <TextField label="Email" />
                <TextField label="Password" />
                <Button variant="contained" onClick={login}>
                    Login
                </Button>
            </Grid>
        </>
    );
};

export default Login;

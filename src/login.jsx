import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { atoms } from './atoms';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Login = () => {
    let navigate = useNavigate();
    const [ , setSession ] = useRecoilState(atoms.session);

    const login = () => {
        setSession({ session: 'abc' });
        navigate('/', { replace: true });
    };

    return (
        <>
            <Typography variant="h5" mb={4}>
                Login
            </Typography>
            <TextField label="Email" />
            <TextField label="Password" />
            <Button variant="contained" onClick={login}>
                Login
            </Button>
        </>
    );
};

export default Login;

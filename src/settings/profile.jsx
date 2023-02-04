import { atoms } from '../core/atoms';
import { useRecoilState } from 'recoil';
import api from '../core/api';
import Box from '@mui/material/Box';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Title from '../core/title';

const Profile = () => {
    const { showStatus } = api();
    const [ loading, setLoading ] = useRecoilState(atoms.loading);
    const [ session, setSession ] = useRecoilState(atoms.session);

    const submitRegistration = (event) => {
        event.preventDefault();
        setLoading(true);
        const registration = Object.fromEntries(new FormData(event.target).entries());

        if (registration.password !== registration.password2) {
            showStatus('error', 'Passwords do not match');
            return;
        }
        delete registration.password2;

        // register(registration, () => {
        //     setLoading(false);
        //     showStatus('success', 'Please check your email and visit the activation link');
        //     navigate('/login', { replace: true });
        // });
    };

    return (
        <>
            <Title>Profile</Title>
            <form onSubmit={submitRegistration} autoComplete="off">
                <Box sx={{ display: 'flex' }}>
                    <Stack spacing={2}>
                        <TextField required name="displayName" label="Name" inputProps={{ minLength: 3 }} defaultValue={session.name} />
                        <TextField required name="username" type="email" label="Email" inputProps={{ minLength: 7 }} defaultValue={session.email} />
                        <TextField name="password" type="password" label="Password" inputProps={{ minLength: 8 }} autoComplete="new-password" />
                        <TextField name="password2" type="password" label="Repeat Password" inputProps={{ minLength: 8 }}  autoComplete="new-password" />
                        <LoadingButton
                            type="submit"
                            endIcon={<HowToRegIcon />}
                            loading={loading}
                            loadingPosition="center"
                            variant="contained"
                        >
                            Update
                        </LoadingButton>
                    </Stack>
                </Box>
            </form>
        </>
    );
};
export default Profile;

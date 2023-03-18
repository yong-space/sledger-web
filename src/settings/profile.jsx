import api from '../core/api';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import state from '../core/state';
import TextField from '@mui/material/TextField';
import Title from '../core/title';
import Tooltip from '@mui/material/Tooltip';

const Profile = () => {
    const { parseJwt, showStatus, updateProfile } = api();
    const [ loading, setLoading ] = state.useState(state.loading);
    const [ session, setSession ] = state.useState(state.session);

    const submit = (event) => {
        event.preventDefault();
        const profile = Object.fromEntries(new FormData(event.target).entries());

        if (!profile.password && profile.newPassword) {
            showStatus('error', 'Current password is required to change password');
            return;
        }
        if (profile.password && (!profile.newPassword || !profile.newPassword2)) {
            showStatus('error', 'Enter new password to change or remove the current password');
            return;
        }
        if (profile.newPassword && profile.newPassword !== profile.newPassword2) {
            showStatus('error', 'Passwords do not match');
            return;
        }
        if (!profile.password && !profile.newPassword) {
            delete profile.password;
            delete profile.newPassword;
        }
        delete profile.newPassword2;

        setLoading(true);
        updateProfile(profile, ({ token }) => {
            setLoading(false);
            showStatus('success', 'Profile updated');
            window.localStorage.setItem('token', token);
            const jwt = parseJwt(token);
            setSession({ token, name: jwt.name, email: jwt.sub, admin: jwt.admin });
        });
    };

    return (
        <>
            <Title>Profile</Title>
            <form onSubmit={submit} autoComplete="off">
                <Grid container item xs={12} md={5} direction="column" gap={2}>
                    <TextField required name="displayName" label="Name" inputProps={{ minLength: 3 }} defaultValue={session.name} />
                    <TextField required name="username" type="email" label="Email" inputProps={{ minLength: 7 }} defaultValue={session.email} />
                    <Tooltip title="Enter only if you wish to change your password">
                        <TextField name="password" type="password" label="Current Password" inputProps={{ minLength: 8 }} autoComplete="new-password" />
                    </Tooltip>
                    <TextField name="newPassword" type="password" label="New Password" inputProps={{ minLength: 8 }} autoComplete="new-password" />
                    <TextField name="newPassword2" type="password" label="Repeat New Password" inputProps={{ minLength: 8 }} autoComplete="new-password" />
                    <LoadingButton
                        type="submit"
                        endIcon={<HowToRegIcon />}
                        loading={loading}
                        loadingPosition="center"
                        variant="contained"
                    >
                        Update
                    </LoadingButton>
                </Grid>
            </form>
        </>
    );
};
export default Profile;

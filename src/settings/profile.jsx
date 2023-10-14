import api from '../core/api';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import state from '../core/state';
import TextField from '@mui/material/TextField';
import Title from '../core/title';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import { BiometricButton } from '../core/buttons';

const Profile = () => {
    const { parseJwt, showStatus, updateProfile, challenge } = api();
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

    const stringToArrayBuffer = (str) => Uint8Array.from(str, c => c.charCodeAt(0)).buffer;

    const base64encode = (arrayBuffer) => {
        if (!arrayBuffer || arrayBuffer.length == 0) {
            return undefined;
        }
        return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
    };

    const arrayBufferToString = (arrayBuffer) => String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));

    const isBiometricsSupported = () => PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';

    const registerBiometric = () => {
        challenge(({ token }) => {
            const type = 'public-key';
            const publicKey = {
                rp: {
                    name: 'Sledger',
                    icon: 'https://beta.sledger.tech/192.png'
                },
                user: {
                    id: stringToArrayBuffer(session.email),
                    name: session.email,
                    displayName: session.name,
                },
                pubKeyCredParams: [{ type, alg: -7 }, { type, alg: -257 }],
                authenticatorSelection: {
                    requireResidentKey: true,
                    userVerification: 'required',
                    authenticatorSelection: 'platform'
                },
                timeout: 50000,
                challenge: stringToArrayBuffer(token),
                excludeCredentials: [],
                attestation: 'none',
            };
            return navigator.credentials.create({ publicKey }).then((rawAttestation) => {
                const attestation = {
                    id: base64encode(rawAttestation.rawId),
                    clientDataJSON: arrayBufferToString(rawAttestation.response.clientDataJSON),
                    attestationObject: base64encode(rawAttestation.response.attestationObject)
                };
                localStorage.setItem("biometrics", JSON.stringify(attestation));
                showStatus('success', 'Biometrics registered successfully')
            });
        });
    };

    return (
        <form onSubmit={submit} autoComplete="off">
            <Grid container item xs={12} md={5} pb={3} direction="column" gap={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Title>Profile</Title>
                    <BiometricButton
                        onClick={registerBiometric}
                        disabled={!isBiometricsSupported}
                        color={localStorage.getItem("biometrics") ? 'success' : 'info'}
                    />
                </Stack>
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
    );
};
export default Profile;

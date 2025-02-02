import { BiometricButton } from '../core/buttons';
import api from '../core/api';
import CBOR from 'cbor-js';
import Grid from '@mui/material/Grid';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import TextField from '@mui/material/TextField';
import { Title } from '../core/utils';
import Tooltip from '@mui/material/Tooltip';

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
                    id: window.location.hostname,
                    icon: '/192.png'
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
            return navigator.credentials.create({ publicKey }).then((credential) => {
                const { authData } = CBOR.decode(credential.response.attestationObject);
                const dataView = new DataView(new ArrayBuffer(2));
                const idLenBytes = authData.slice(53, 55);
                idLenBytes.forEach((value, index) => dataView.setUint8(index, value));
                const credentialId = authData.slice(55, 55 + dataView.getUint16());
                const credentialIdBase64 = btoa(String.fromCharCode.apply(null, credentialId));

                const attestation = {
                    id: credentialIdBase64,
                    clientDataJSON: arrayBufferToString(credential.response.clientDataJSON),
                    attestationObject: base64encode(credential.response.attestationObject),
                    expiry: new Date().toISOString(),
                };
                localStorage.setItem('biometrics', JSON.stringify(attestation));
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
                <TextField required name="displayName" label="Name" inputProps={{ minLength: 3, autoComplete: 'off' }} defaultValue={session.name} />
                <TextField required name="username" type="email" label="Email" inputProps={{ minLength: 7, autoComplete: 'off' }} defaultValue={session.email} />
                <Tooltip title="Enter only if you wish to change your password">
                    <TextField name="password" type="password" label="Current Password" inputProps={{ minLength: 8 }} autoComplete="new-password" />
                </Tooltip>
                <TextField name="newPassword" type="password" label="New Password" inputProps={{ minLength: 8 }} autoComplete="new-password" />
                <TextField name="newPassword2" type="password" label="Repeat New Password" inputProps={{ minLength: 8 }} autoComplete="new-password" />
                <Button
                    type="submit"
                    endIcon={<HowToRegIcon />}
                    loading={loading}
                    loadingPosition="center"
                    variant="contained"
                >
                    Update
                </Button>
            </Grid>
        </form>
    );
};
export default Profile;

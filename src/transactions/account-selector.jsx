import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import state from '../core/state';

const AccountSelector = ({ handleChange }) => {
    const issuers = state.useState(state.issuers)[0];
    const accounts = state.useState(state.accounts)[0];
    const selectedAccount = state.useState(state.selectedAccount)[0];
    const getVisibleAccounts = () => accounts.filter((a) => a.visible);
    const getIssuer = (id) => issuers.find(i => i.id === id);

    const colors = {
        'Cash': 'success',
        'Credit': 'warning',
        'Retirement': 'info',
    };

    const AccountEntry = ({ type, issuer, name }) => (
        <>
            <Chip sx={{ borderRadius: '.5rem' }} label={type} color={colors[type]} size="small" />
            <Chip sx={{ borderRadius: '.5rem', color: `#${issuer.colour}`, borderColor: `#${issuer.colour}` }} label={issuer.name} variant="outlined" size="small" />
            {name}
        </>
    );

    return !(accounts && selectedAccount) ? <></> : (
        <FormControl size="small" sx={{ flex: 4 }}>
            <InputLabel id="account-label">Account</InputLabel>
            <Select
                labelId="account-label"
                label="Account"
                value={selectedAccount.id}
                onChange={handleChange}
                renderValue={(selectedId) => {
                    const { id, name, type, issuerId } = getVisibleAccounts().find((a) => a.id === selectedId);
                    return (
                        <div style={{ display: 'flex', gap: '.4rem' }}>
                            <AccountEntry {...{ type, issuer: getIssuer(issuerId), name }} />
                        </div>
                    )
                }}
            >
                { getVisibleAccounts().map(({ id, name, type, issuerId }) => (
                    <MenuItem key={id} value={id} sx={{ gap: '.4rem' }}>
                        <AccountEntry {...{ type, issuer: getIssuer(issuerId), name }} />
                    </MenuItem>
                )) }
            </Select>
        </FormControl>
    );
};
export default AccountSelector;

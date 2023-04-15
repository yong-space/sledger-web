import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import state from '../core/state';
import styled from 'styled-components';

const FxRoot = styled.sup`
    font-size: .8rem;
    position: relative;
    top: -.3rem;
`;
const Fx = () => <FxRoot>FX</FxRoot>;

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

    const AccountEntry = ({ type, issuer, name, multiCurrency }) => (
        <>
            <Chip sx={{ borderRadius: '.5rem' }} label={type} color={colors[type]} size="small" />
            <Chip sx={{ borderRadius: '.5rem', color: `#${issuer.colour}`, borderColor: `#${issuer.colour}` }} label={issuer.name} variant="outlined" size="small" />
            {name}
            {multiCurrency && <Fx />}
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
                    const { name, type, issuerId, multiCurrency } = getVisibleAccounts().find((a) => a.id === selectedId);
                    return (
                        <div style={{ display: 'flex', gap: '.4rem' }}>
                            <AccountEntry {...{ type, issuer: getIssuer(issuerId), name, multiCurrency }} />
                        </div>
                    )
                }}
            >
                { getVisibleAccounts().map(({ id, name, type, issuerId, multiCurrency }) => (
                    <MenuItem key={id} value={id} sx={{ gap: '.4rem' }}>
                        <AccountEntry {...{ type, issuer: getIssuer(issuerId), name, multiCurrency }} />
                    </MenuItem>
                )) }
            </Select>
        </FormControl>
    );
};
export default AccountSelector;

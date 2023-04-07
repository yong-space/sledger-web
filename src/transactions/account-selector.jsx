import { useEffect } from 'react';
import api from '../core/api';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import state from '../core/state';

const AccountSelector = ({ handleChange }) => {
    const [ accounts, setAccounts ] = state.useState(state.accounts);
    const selectedAccount = state.useState(state.selectedAccount)[0];
    const { listAccounts } = api();

    useEffect(() => {
        if (!accounts) {
            listAccounts((data) => setAccounts(data));
        }
    }, []);

    const colors = {
        'Cash': 'success',
        'Credit': 'info',
        'Wallet': 'warning',
    };

    const AccountEntry = ({ type, issuerName, name }) => (
        <>
            <Chip sx={{ borderRadius: '.5rem' }} label={type} color={colors[type]} size="small" />
            <Chip sx={{ borderRadius: '.5rem' }} label={issuerName} variant="outlined" size="small" />
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
                    const { id, name, issuer, type } = accounts.find((a) => a.id === selectedId);
                    return (
                        <div style={{ display: 'flex', gap: '.4rem' }}>
                            <AccountEntry type={type} issuerName={issuer.name} name={name} />
                        </div>
                    )
                }}
            >
                { accounts.map(({ id, name, issuer, type }) => (
                    <MenuItem key={id} value={id} sx={{ gap: '.4rem' }}>
                        <AccountEntry type={type} issuerName={issuer.name} name={name} />
                    </MenuItem>
                )) }
            </Select>
        </FormControl>
    );
};
export default AccountSelector;

import { useEffect } from 'react';
import api from '../core/api';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
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

    return !(accounts && selectedAccount) ? <></> : (
        <FormControl size="small" sx={{ width: { sm: 200, md: 300 } }}>
            <InputLabel id="account-label">Account</InputLabel>
            <Select
                labelId="account-label"
                label="Account"
                value={selectedAccount.id}
                onChange={handleChange}
            >
                { accounts.map(({ id, name, issuer, type }) => <MenuItem key={id} value={id}>{issuer.name}: {type}: {name}</MenuItem>) }
            </Select>
        </FormControl>
    );
};
export default AccountSelector;

import { atoms } from '../core/atoms';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import api from '../core/api';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const AccountSelector = ({ handleChange }) => {
    const [ accounts, setAccounts ] = useRecoilState(atoms.accounts);
    const selectedAccount = useRecoilState(atoms.selectedAccount)[0];
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

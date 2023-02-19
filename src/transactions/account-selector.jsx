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
    const accountId = useRecoilState(atoms.accountId)[0];
    const { listAccounts } = api();

    useEffect(() => {
        if (!accounts) {
            listAccounts((data) => setAccounts(data));
        }
    }, []);

    return !accounts ? <></> : (
        <FormControl>
            <InputLabel id="account-label">Account</InputLabel>
            <Select
                labelId="account-label"
                label="Account"
                value={accountId}
                onChange={handleChange}
            >
                { accounts.map(({ id, name, issuer, type }) => <MenuItem key={id} value={id}>{issuer.name}: {type}: {name}</MenuItem>) }
            </Select>
        </FormControl>
    );
};
export default AccountSelector;

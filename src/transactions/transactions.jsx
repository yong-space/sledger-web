import { atoms } from '../core/atoms';
import { HorizontalLoader } from '../core/loader';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useEffect } from 'react';
import api from '../core/api';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Title from '../core/title';

const Transactions = () => {
    const [ accounts, setAccounts ] = useRecoilState(atoms.accounts);
    const [ accountId, setAccountId ] = useRecoilState(atoms.accountId);
    const { listAccounts } = api();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!accounts) {
            listAccounts((data) => setAccounts(data));
        }
    }, []);

    useEffect(() => {
        if (accounts) {
            const navId = accountId ? accountId : accounts[0].id;
            navigate(`/tx/${navId}`);
        }
    }, [ accounts ]);

    useEffect(() => {
        const match = location.pathname.match(/\d+/);
        if (match) {
            setAccountId(match[0]);
        }
    }, [ location.pathname ]);

    useEffect(() => {
        if (!accountId) {
            return;
        }
        console.log('Account ID is now: ', accountId)
    }, [ accountId ]);

    const TransactionsGrid = () => {
        return !accountId ? <HorizontalLoader /> : (
            <Box>
                Transactions Grid for {accountId}
            </Box>
        );
    };

    const Main = () => (
        <>
            <FormControl>
                <InputLabel id="account-label">Account</InputLabel>
                <Select
                    labelId="account-label"
                    label="Account"
                    value={accountId}
                    onChange={({ target }) => navigate(`/tx/${target.value}`)}
                >
                    { accounts.map(({ id, name, issuer, type }) => <MenuItem key={id} value={id}>{issuer.name}: {type}: {name}</MenuItem>) }
                </Select>
            </FormControl>
            <TransactionsGrid />
        </>
    );

    return (
        <>
            <Title>Transactions</Title>
            { !(accounts && accountId) ? <HorizontalLoader /> : <Main /> }
        </>
    )
};
export default Transactions;

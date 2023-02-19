import { atoms } from '../core/atoms';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useEffect } from 'react';
import Title from '../core/title';
import AccountSelector from './account-selector';
import TransactionsGrid from './transactions-grid';

const Transactions = () => {
    const accounts = useRecoilState(atoms.accounts)[0];
    const [ accountId, setAccountId ] = useRecoilState(atoms.accountId);
    const location = useLocation();
    const navigate = useNavigate();

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

    return (
        <>
            <Title>Transactions</Title>
            <AccountSelector handleChange={({ target }) => navigate(`/tx/${target.value}`)} />
            <TransactionsGrid />
        </>
    )
};
export default Transactions;

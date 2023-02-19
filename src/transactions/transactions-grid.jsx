import { atoms } from '../core/atoms';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import api from '../core/api';
import Box from '@mui/material/Box';

const TransactionsGrid = () => {
    const accountId = useRecoilState(atoms.accountId)[0];
    const { listTransactions } = api();
    const [ transactions, setTransactions ] = useState([]);

    useEffect(() => {
        if (!accountId) {
            return;
        }
        listTransactions(accountId, (response) => setTransactions(response));
    }, [ accountId ]);

    return (
        <Box>
            Transactions Grid for {accountId}
        </Box>
    );
};
export default TransactionsGrid;

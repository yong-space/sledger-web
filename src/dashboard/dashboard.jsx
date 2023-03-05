import { useEffect, useState } from 'react';
import api from '../core/api';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import SubTitle from '../core/sub-title';
import Title from '../core/title';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
`;

const Table = styled.div`
    display: grid;
    grid-template-columns: repeat(3, auto);
    background: #222;
    border-radius: .5rem;
    padding: .3rem;
    max-width: 100%;
    overflow: scroll;
`;

const Cell = styled.div`
    padding: .8rem;
    :nth-child(3n+1) { width: 6rem }
    :nth-child(3n+2) { width: 15rem }
    :nth-child(3n+3) { width: 10rem }
    border-top: 1px solid #666;
    :nth-child(-n+3) {
        font-weight: 800;
        border-top: none;
    }
`;

const Dashboard = () => {
    const [ accounts, setAccounts ] = state.useState('accounts');
    const [ cashAccounts, setCashAccounts ] = useState();
    const [ creditAccounts, setCreditAccounts ] = useState();
    const { listAccounts } = api();

    useEffect(() => {
        if (!accounts) {
            listAccounts((data) => setAccounts(data));
        }
    }, []);

    useEffect(() => {
        if (!accounts) {
            return;
        }
        setCashAccounts(accounts.filter((a) => a.type === 'Cash'));
        setCreditAccounts(accounts.filter((a) => a.type === 'Credit'));
    }, [ accounts ]);

    const columns = [
        {
            field: 'issuer',
            subField: 'name',
            headerName: 'Issuer',
        },
        {
            field: 'name',
            headerName: 'Account',
        },
        {
            field: 'balance',
            headerName: 'Balance',
        },
    ];

    const SummaryGrid = ({ label, data }) => {
        return (
            <Box>
                <SubTitle>{label}</SubTitle>
                <Wrapper>
                    <Table>
                        { columns.map((column) => <Cell key={column.field}>{column.headerName}</Cell>)}
                        { data.map((row) => columns.map((column) => (
                            <Cell key={column.field}>
                                { column.subField ? row[column.field][column.subField] : row[column.field] }
                            </Cell>
                        )))}
                    </Table>
                </Wrapper>
            </Box>
        );
    };

    return (
        <>
            <Title>Dashboard</Title>
            <Stack spacing={3}>
                { cashAccounts && <SummaryGrid label="Cash Accounts" data={cashAccounts} /> }
                { creditAccounts && <SummaryGrid label="Credit Accounts" data={creditAccounts} /> }
            </Stack>
        </>
    )
};
export default Dashboard;

import { HorizontalLoader } from '../core/loader';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import api from '../core/api';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import styled from 'styled-components';
import SubTitle from '../core/sub-title';
import Title from '../core/title';

const Wrapper = styled.div`
    display: flex;
`;

const Table = styled.div`
    display: grid;
    grid-template-columns: repeat(3, auto);
    background: #222;
    border-radius: .5rem;
    padding: .3rem;
    overflow: hidden;
`;

const Cell = styled.div`
    padding: .8rem;
    border-top: 1px solid #666;
    :nth-child(3n+1) { width: 10vw }
    :nth-child(3n+2) { width: 25vw }
    :nth-child(3n+3) { width: 10vw; text-align: right }
    :nth-child(-n+3) {
        font-weight: 800;
        border-top: none;
    }
    ${props => props.theme.breakpoints.down("md")} {
        :nth-child(3n+1) { width: 20vw }
        :nth-child(3n+2) { width: 50vw }
        :nth-child(3n+3) { width: 20vw }
    }
`;

const SummaryCell = styled(Cell)`
    :nth-child(1) { width: 35vw }
    :nth-child(2) { width: 10vw; text-align: right }
    ${props => props.theme.breakpoints.down("md")} {
        :nth-child(1) { width: 70vw }
        :nth-child(2) { width: 20vw }
    }
`;

const Dashboard = () => {
    const [ accounts, setAccounts ] = state.useState(state.accounts);
    const [ cashAccounts, setCashAccounts ] = useState();
    const [ creditAccounts, setCreditAccounts ] = useState();
    const [ netWorth, setNetWorth ] = useState();
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
        setNetWorth(accounts.reduce((i, account) => i + account.balance, 0));
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

    const formatNumber = (num) => parseFloat(num).toFixed(2).toLocaleString();

    const getValue = (column, row) => {
        const value = column.subField ? row[column.field][column.subField] : row[column.field];
        switch (column.field) {
            case 'balance': return formatNumber(value);
            case 'name': return <Link to={`/tx/${row.id}`}>{value}</Link>;
            default: return value;
        }
    };

    const SummaryGrid = ({ label, data }) => {
        const theme = useTheme();
        return (
            <Box>
                <SubTitle>{label}</SubTitle>
                <Wrapper>
                    <Table>
                        { columns.map((column) => <Cell key={column.field}>{column.headerName}</Cell>)}
                        { data.map((row) => columns.map((column) => (
                            <Cell key={column.field} theme={theme}>
                                { getValue(column, row) }
                            </Cell>
                        )))}
                    </Table>
                </Wrapper>
            </Box>
        );
    };

    const TotalNetWorth = () => {
        return (
            <Box>
                <Wrapper>
                    <Table>
                        <SummaryCell>
                            Total Net Worth
                        </SummaryCell>
                        <SummaryCell>
                            { formatNumber(netWorth) }
                        </SummaryCell>
                    </Table>
                </Wrapper>
            </Box>
        );
    };

    return !accounts ? <HorizontalLoader /> : (
        <>
            <Title>Dashboard</Title>
            <Stack spacing={3}>
                { cashAccounts && <SummaryGrid label="Cash Accounts" data={cashAccounts} /> }
                { creditAccounts && <SummaryGrid label="Credit Accounts" data={creditAccounts} /> }
                { netWorth && <TotalNetWorth /> }
            </Stack>
        </>
    );
};
export default Dashboard;

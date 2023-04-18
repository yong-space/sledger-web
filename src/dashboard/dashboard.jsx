import { HorizontalLoader } from '../core/loader';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import state from '../core/state';
import styled from 'styled-components';
import SubTitle from '../core/sub-title';
import Title from '../core/title';

const DashRoot = styled(Stack)`
    width: 45vw;
    ${props => props.theme.breakpoints.down("md")} {
        width: 100%;
    }
`;

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
    :nth-child(3n+1) { width: 15vw; text-overflow: ellipsis; overflow: hidden }
    :nth-child(3n+2) { width: 20vw }
    :nth-child(3n+3) { width: 10vw; text-align: right; padding-right: 1.5rem; }
    :nth-child(-n+3) {
        font-weight: 800;
        border-top: none;
    }
    :not(:nth-child(-n+3)) {
        cursor: pointer;
    }
    ${props => props.theme.breakpoints.down("md")} {
        :nth-child(3n+1) { width: 25vw }
        :nth-child(3n+2) { width: 40vw }
        :nth-child(3n+3) { width: 26vw; padding-right: 1rem; }
    }
`;

const SummaryCell = styled(Cell)`
    :nth-child(1) { width: 35vw }
    :nth-child(2) { width: 10vw; text-align: right; padding-right: 1.5rem; }
    ${props => props.theme.breakpoints.down("md")} {
        :nth-child(1) { width: 70vw }
        :nth-child(2) { width: 21vw; padding-right: 1rem; }
    }
`;

const Dashboard = () => {
    const theme = useTheme();
    let navigate = useNavigate();
    const accounts = state.useState(state.accounts)[0];
    const issuers = state.useState(state.issuers)[0];
    const [ netWorth, setNetWorth ] = useState();
    const getVisibleAccounts = () => accounts.filter((a) => a.visible);

    useEffect(() => {
        if (!accounts) {
            return;
        }
        if (getVisibleAccounts().length === 0) {
            navigate('/settings/accounts');
        }
        setNetWorth(getVisibleAccounts().reduce((i, account) => i + parseFloat(account.balance || 0), 0));
    }, [ accounts ]);

    const getAccounts = (type) => accounts.filter((a) => a.visible && a.type === type);

    const columns = [
        { field: 'issuer', headerName: 'Issuer' },
        { field: 'name', headerName: 'Account' },
        { field: 'balance', headerName: 'Balance' },
    ];

    const decimalFomat = new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatNumber = (num) => !num ? '0.00' : decimalFomat.format(parseFloat(num));

    const getValue = (column, row) => {
        switch (column.field) {
            case 'issuer': return issuers.find(i => i.id === row.issuerId).name;
            case 'balance': return formatNumber(row[column.field]);
            default: return row[column.field];
        }
    };

    const getHeaderLabel = (type, header) =>
        (type === 'Cash' && header === 'Issuer') ? 'Bank' :
        (type === 'Credit' && header === 'Account') ? 'Card' : header;

    const SummaryGrid = ({ label, data }) => data.length > 0 && (
        <Box>
            <SubTitle>{label}</SubTitle>
            <Wrapper>
                <Table>
                    { columns.map(({ field, headerName }) => (
                        <Cell key={field}>{getHeaderLabel(data[0].type, headerName)}</Cell>
                    ))}
                    { data.map((row) => columns.map((column) => (
                        <Cell key={column.field} theme={theme} onClick={() => navigate(`/tx/${row.id}`)}>
                            { getValue(column, row) }
                            { column.field === 'name' && row.multiCurrency && <sup>FX</sup> }
                        </Cell>
                    )))}
                </Table>
            </Wrapper>
        </Box>
    );

    const CpfSummaryGrid = () => {
        const cpfAccount = getAccounts('Retirement');
        const [ cpfAccounts, setCpfAccounts ] = useState();

        useEffect(() => {
            if (cpfAccount.length === 0) {
                return;
            }
            const { id, issuerId } = cpfAccount[0];
            /*
            setCpfAccounts([
                { id, issuerId, name: 'Ordinary', balance: 2000 },
                { id, issuerId, name: 'Special', balance: 2000 },
                { id, issuerId, name: 'Medisave', balance: 2000 },
            ]);
            */
            setCpfAccounts(cpfAccount);
        }, []);

        return cpfAccount.length > 0 && (
            !cpfAccounts ? <HorizontalLoader /> :
            <SummaryGrid label="Retirement Accounts" data={cpfAccounts} />
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

    const Empty = () => (
        <Alert
            severity="info"
            variant="outlined"
            onClick={() => navigate('/settings/accounts')}
        >
            No accounts added yet. Click here to add your first account.
        </Alert>
    );

    return !accounts.find((a) => a.visible) ? <Empty /> : (
        <DashRoot spacing={3} pb={3}>
            <Title mb={-1}>Dashboard</Title>
            <SummaryGrid label="Cash Accounts" data={getAccounts('Cash')} />
            <SummaryGrid label="Credit Accounts" data={getAccounts('Credit')} />
            <CpfSummaryGrid />
            <TotalNetWorth />
        </DashRoot>
    );
};
export default Dashboard;

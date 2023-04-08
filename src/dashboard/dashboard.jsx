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
    :nth-child(3n+3) { width: 10vw; text-align: right }
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
        :nth-child(3n+3) { width: 25vw; min-width: 5rem }
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
    const theme = useTheme();
    let navigate = useNavigate();
    const accounts = state.useState(state.accounts)[0];
    const [ netWorth, setNetWorth ] = useState();
    const getVisibleAccounts = () => accounts.filter((a) => a.visible);

    useEffect(() => {
        if (!accounts) {
            return;
        }
        if (getVisibleAccounts().length === 0) {
            navigate('/settings/accounts');
        }
        setNetWorth(getVisibleAccounts().reduce((i, account) => i + account.balance, 0));
    }, [ accounts ]);

    const getAccounts = (type) => accounts.filter((a) => a.visible && a.type === type);

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

    const formatNumber = (num) => !num ? '0.00' : parseFloat(num).toFixed(2).toLocaleString();

    const getValue = (column, row) => {
        const value = column.subField ? row[column.field][column.subField] : row[column.field];
        switch (column.field) {
            case 'balance': return formatNumber(value);
            default: return value;
        }
    };

    const getHeaderLabel = (type, header) => {
        if (type === 'Cash' && header === 'Issuer') {
            return 'Bank';
        }
        if (type === 'Credit' && header === 'Account') {
            return 'Card';
        }
        return header;
    };

    const SummaryGrid = ({ label, data }) => (
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
                        </Cell>
                    )))}
                </Table>
            </Wrapper>
        </Box>
    );

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

    return !accounts ? <HorizontalLoader /> : !accounts.find((a) => a.visible) ? <Empty /> : (
        <>
            <Title>Dashboard</Title>
            <Stack spacing={3} pb={3}>
                {[ 'Cash', 'Credit', 'Wallet' ].map((type) => {
                    const thisAccounts = getAccounts(type);
                    if (thisAccounts?.length === 0) {
                        return;
                    }
                    return <SummaryGrid key={type} label={`${type} Accounts`} data={thisAccounts} />;
                })}
                <TotalNetWorth />
            </Stack>
        </>
    );
};
export default Dashboard;

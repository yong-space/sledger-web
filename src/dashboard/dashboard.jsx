import { HorizontalLoader } from '../core/loader';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
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
    flex-direction: column;
`;

const Table = styled.table`
    background: #222;
    border-radius: .5rem;
    margin: 0;
    border-collapse: collapse;
    thead tr, tbody tr:not(:last-child) {
        border-bottom: 1px solid #666;
    }
    tbody tr { cursor: pointer }
    th, td {
        text-align: left;
        padding: .8rem 1.2rem;
    }
    td:first-child { font-weight: 800 }
    th:last-child, td:last-child {
        text-align: right;
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

    const getValue = (column, row, rowIndex) => {
        switch (column.field) {
            case 'issuer':
                const issuer = issuers.find(i => i.id === row.issuerId).name;
                return (issuer !== 'CPF' || rowIndex === 0) ? issuer : '';
            case 'balance': return formatNumber(row[column.field]);
            default: return row[column.field];
        }
    };

    const getHeaderLabel = (type, header) =>
        (type === 'Cash' && header === 'Issuer') ? 'Bank' :
        (type === 'Credit' && header === 'Account') ? 'Card' : header;

    const SummaryGrid = ({ label, data }) => data.length > 0 && (
        <Wrapper>
            <SubTitle mb={5}>{label}</SubTitle>
            <Table>
                <thead>
                    <tr>
                        { columns.map(({ field, headerName }) => (
                            <th key={field}>{getHeaderLabel(data[0].type, headerName)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    { data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            { columns.map((column) => (
                                <td key={column.field} theme={theme} onClick={() => navigate(`/tx/${row.id}`)}>
                                    { getValue(column, row, rowIndex) }
                                    { column.field === 'name' && row.multiCurrency && <sup>FX</sup> }
                                </td>
                            )) }
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Wrapper>
    );

    const CpfSummaryGrid = () => {
        const cpfAccount = getAccounts('Retirement');
        const [ cpfAccounts, setCpfAccounts ] = useState();

        useEffect(() => {
            if (cpfAccount.length === 0) {
                return;
            }
            const {
                id, issuerId, ordinaryBalance, specialBalance, medisaveBalance,
            } = cpfAccount[0];

            setCpfAccounts([
                { id, issuerId, name: 'Ordinary', balance: ordinaryBalance },
                { id, issuerId, name: 'Special', balance: specialBalance },
                { id, issuerId, name: 'Medisave', balance: medisaveBalance },
            ]);
        }, []);

        return cpfAccount.length > 0 && (
            !cpfAccounts ? <HorizontalLoader /> :
            <SummaryGrid label="Retirement Accounts" data={cpfAccounts} />
        );
    };

    const TotalNetWorth = () => {
        return (
            <Wrapper>
                <Table>
                    <tr>
                        <td>Total Net Worth</td>
                        <td>{ formatNumber(netWorth) }</td>
                    </tr>
                </Table>
            </Wrapper>
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

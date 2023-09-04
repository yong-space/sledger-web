import { formatDecimal } from '../util/formatters';
import { HorizontalLoader } from '../core/loader';
import { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import state from '../core/state';
import styled from 'styled-components';
import SubTitle from '../core/sub-title';
import Title from '../core/title';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const Root = styled(Wrapper)`
    flex: 1 1 1px;
    gap: 1rem;
    padding-bottom: 6rem;

    width: 35rem;
    ${props => props.theme.breakpoints.down("md")} {
        width: calc(100vw - 5rem);
        align-self: center;
    }
    ${props => props.theme.breakpoints.down("sm")} {
        width: calc(100vw - 3rem);
        align-self: center;
    }
`;

const FloatingFooter = styled(Wrapper)`
    position: fixed;
    bottom: 1rem;
    flex: 1 1 1px;
    width: 35rem;
    border-radius: .5rem;

    ${props => props.theme.breakpoints.down("md")} {
        width: calc(100vw - 5rem);
        align-self: center;
    }

    ${props => props.theme.breakpoints.down("sm")} {
        width: calc(100vw - 3rem);
        align-self: center;
    }

    box-shadow:
        1rem -1.5rem 1rem var(--bg),
        -1rem -1.5rem 1rem var(--bg),
        1rem 2rem 1rem var(--bg),
        -1rem 2rem 1rem var(--bg);

    table { background: #2c4866 }
`;

const IssuerChip = ({ color, label }) => (
    <Chip
        label={label}
        variant="outlined"
        sx={{ borderRadius: '.5rem', color: `#${color}`, borderColor: `#${color}` }}
    />
);

const Table = styled.table`
    background: #222;
    border-radius: .5rem;
    margin: 0;
    border-collapse: collapse;

    tr:not(tfoot *) {
        border-bottom: 1px solid #666;
    }
    tbody tr { cursor: pointer }
    th, td {
        padding: .8rem;
        text-align: left;
        &:first-child {
            --width: 6rem;
            width: var(--width);
            min-width: var(--width);
            max-width: var(--width);
            font-weight: 800;
        }
        &:last-child { text-align: right }
    }
    tfoot {
        border-radius: .5rem;
        font-weight: 800;
        white-space: nowrap;
    }
    tfoot:not(:only-child) {
        td:first-child { border-bottom-left-radius: .5rem }
        td:last-child { border-bottom-right-radius: .5rem }
        td { background: #333 }
    }
`;

const Summary = () => {
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

    const getValue = (column, row, rowIndex) => {
        const props = {
            key: column.field,
            onClick: () => navigate(`/tx/${row.id}`),
        };
        let value = undefined;
        switch (column.field) {
            case 'issuer':
                const issuer = issuers.find(i => i.id === row.issuerId);
                if (issuer.name === 'CPF') {
                    if (rowIndex > 0) {
                        break;
                    }
                    props.rowSpan = 3;
                }
                value = <IssuerChip label={issuer.name} color={issuer.colour} />;
                break;
            case 'balance':
                value = formatDecimal(row[column.field], false);
                break;
            case 'name':
                if (row.multiCurrency) {
                    value = <>{row[column.field]} <sup>FX</sup></>;
                    break;
                }
            default: value = row[column.field];
        }
        return !value ? <Fragment key={column.field} /> : (
            <td {...props}>
                {value}
            </td>
        );
    };

    const getHeaderLabel = (type, header) =>
        (type === 'Cash' && header === 'Issuer') ? 'Bank' :
        (type === 'Credit' && header === 'Account') ? 'Card' : header;

    const getSubtotal = (data) => {
        const sum = data.map((row) => Number(row.balance)).reduce((a, b) => a + b, 0);
        return formatDecimal(sum);
    };

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
                            { columns.map((column) => getValue(column, row, rowIndex)) }
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="2">Sub-Total</td>
                        <td>{ getSubtotal(data) }</td>
                    </tr>
                </tfoot>
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

    const TotalNetWorth = () => (
        <FloatingFooter>
            <Table>
                <tfoot>
                    <tr>
                        <td colSpan={2}>Total Net Worth</td>
                        <td>{ formatDecimal(netWorth, false) }</td>
                    </tr>
                </tfoot>
            </Table>
        </FloatingFooter>
    );

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
        <Root theme={theme}>
            <Title mb={-1}>Summary</Title>
            <SummaryGrid label="Cash Accounts" data={getAccounts('Cash')} />
            <SummaryGrid label="Credit Accounts" data={getAccounts('Credit')} />
            <CpfSummaryGrid />
            <TotalNetWorth />
        </Root>
    );
};
export default Summary;

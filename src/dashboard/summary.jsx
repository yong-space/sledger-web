import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../core/api';
import state from '../core/state';
import { HorizontalLoader, SubTitle, Title } from '../core/utils';
import { formatDateRelative, formatDecimal } from '../util/formatters';
import { Typography } from '@mui/material';

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
    tbody tr:not(.no-pointer) { cursor: pointer }
    th, td {
        padding: .8rem;
        text-align: left;
        &:is([data-issuer]) {
            --width: 6rem;
            width: var(--width);
            min-width: var(--width);
            max-width: var(--width);
            font-weight: 800;
        }
        &:last-child, &.right { text-align: right }
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

const Summary = ({ setRoute }) => {
    const theme = useTheme();
    let navigate = useNavigate();
    const accounts = state.useState(state.accounts)[0];
    const issuers = state.useState(state.issuers)[0];
    const [ netWorth, setNetWorth ] = useState();
    const getVisibleAccounts = () => accounts.filter((a) => a.visible);
    const { getPortfolio, refreshPortfolio } = api();
    const [ portfolio, setPortfolio ] = useState(null);
    const [ portFolioLoading, setPortfolioLoading ] = useState(false);

    useEffect(() => {
        setRoute('summary');

        if (!accounts) {
            return;
        }
        if (getVisibleAccounts().length === 0) {
            navigate('/settings/accounts');
        } else {
            const accountTotal = getVisibleAccounts().reduce((i, account) => i + parseFloat(account.balance || 0), 0);
            setNetWorth(accountTotal);

            getPortfolio((response) => {
                if (response) {
                    setPortfolio(response);
                    const tradingTotal = (response.holdings + response.cash) * response.fx;
                    setNetWorth(accountTotal + tradingTotal);
                }
            });
        }
    }, [ accounts ]);

    const getAccounts = (type) => accounts.filter((a) => a.visible && a.type === type);

    const columns = [
        { field: 'issuer', headerName: 'Issuer' },
        { field: 'name', headerName: 'Account' },
        { field: 'balance', headerName: 'Balance' },
    ];

    const getValue = (column, row, rowIndex) => {
        const props = {
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
                props['data-issuer'] = issuer.name;
                value = <IssuerChip label={issuer.name} color={issuer.colour} />;
                break;
            case 'balance':
                value = formatDecimal(row.balance);
                break;
            case 'name':
                if (row.multiCurrency) {
                    value = <>{row[column.field]} <sup>FX</sup></>;
                    break;
                }
            default: value = row[column.field];
        }
        return !value ? <Fragment key={column.field} /> : (
            <td key={column.field} {...props}>
                {value}
            </td>
        );
    };

    const getHeaderLabel = (type, header) =>
        (type === 'Cash' && header === 'Issuer') ? 'Bank' :
        (type === 'Credit' && header === 'Account') ? 'Card' : header;

    const getSubtotal = (data) => {
        const sum = data.map((row) => Number(row.balance)).reduce((a, b) => a + b || 0, 0);
        return formatDecimal(sum);
    };

    const SummaryGrid = ({ label, data }) => data.length > 0 && (
        <Wrapper>
            <SubTitle>{label}</SubTitle>
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
                        <td colSpan={2}>Sub-Total</td>
                        <td>{ getSubtotal(data) }</td>
                    </tr>
                </tfoot>
            </Table>
        </Wrapper>
    );

    const CpfSummaryGrid = () => {
        const cpfAccount = getAccounts('Retirement');
        const [ cpfAccounts, setCpfAccounts ] = useState(null);

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

    const doRefreshPortfolio = () => {
        setPortfolioLoading(true);
        refreshPortfolio((response) => {
            setPortfolio(response);
            const tradingTotal = (response.holdings + response.cash) * response.fx;
            const accountTotal = getVisibleAccounts().reduce((i, account) => i + parseFloat(account.balance || 0), 0);
            setNetWorth(accountTotal + tradingTotal);
            setPortfolioLoading(false);
        });
    };

    const Portfolio = ({ refresh, holdings, cash, broker, fx, time, brokerColour }) => (
        <Wrapper>
            <Stack direction="row" justifyContent="space-between">
                <SubTitle>Trading Account</SubTitle>
                <Stack direction="row" alignItems="center">
                    <Typography color="textDisabled">
                        as of { formatDateRelative(time) }
                    </Typography>
                    <IconButton color="info" disabled={portFolioLoading} onClick={refresh}>
                        <RefreshIcon />
                    </IconButton>
                </Stack>
            </Stack>
            <Table>
                <thead>
                    <tr>
                        <th>Broker</th>
                        <th>Allocation</th>
                        <th className="right">USD</th>
                        <th className="right">SGD</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="no-pointer">
                        <td rowSpan={2} data-issuer={broker}>
                            <IssuerChip label={broker} color={brokerColour} />
                        </td>
                        <td>Holdings</td>
                        <td className="right">{formatDecimal(holdings)}</td>
                        <td className="right">{formatDecimal(holdings * fx)}</td>
                    </tr>
                    <tr className="no-pointer">
                        <td>Cash</td>
                        <td className="right">{formatDecimal(cash)}</td>
                        <td className="right">{formatDecimal(cash * fx)}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={3}>Sub-Total</td>
                        <td>{formatDecimal((cash + holdings) * fx)}</td>
                    </tr>
                </tfoot>
            </Table>
        </Wrapper>
    );

    const TotalNetWorth = () => (
        <FloatingFooter>
            <Table>
                <tfoot>
                    <tr>
                        <td colSpan={2}>Total Net Worth</td>
                        <td>{ formatDecimal(netWorth) }</td>
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

    if (!accounts) {
        return <HorizontalLoader />;
    }

    return !accounts.find((a) => a.visible) ? <Empty /> : (
        <Root theme={theme}>
            <Title>Summary</Title>
            <SummaryGrid label="Cash Accounts" data={getAccounts('Cash')} />
            <SummaryGrid label="Credit Accounts" data={getAccounts('Credit')} />
            <CpfSummaryGrid />
            { portfolio && <Portfolio refresh={doRefreshPortfolio} {...portfolio} /> }
            <TotalNetWorth />
        </Root>
    );
};
export default Summary;

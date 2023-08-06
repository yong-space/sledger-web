import { formatDecimal, formatNumber } from '../util/formatters';
import { useEffect, useState } from 'react';
import api from '../core/api';
import Stack from '@mui/material/Stack';
import styled from 'styled-components';
import Title from '../core/title';

const Root = styled(Stack)`
    width: 35vw;
    ${props => props.theme.breakpoints.down("lg")} {
        width: 45vw;
    }
    ${props => props.theme.breakpoints.down("md")} {
        width: 92vw;
        align-self: center;
    }
    th { text-align: left }
    th:not(:first-child), td:not(:first-child) { text-align: right }
`;

const Insights = () => {
    const { getInsights } = api();
    const [ insights, setInsights ] = useState();

    useEffect(() => getInsights((response) => setInsights(response)), []);

    const SummaryTable = () => (
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Total</th>
                    <th>Transactions</th>
                </tr>
            </thead>
            <tbody>
                { insights.summary.map((insight, i) => (
                    <tr key={i}>
                        <td>{insight.category || "<No Category>"}</td>
                        <td>{formatDecimal(insight.total)}</td>
                        <td>{formatNumber(insight.transactions)}</td>
                    </tr>
                )) }
            </tbody>
        </table>
    );

    const DataTable = () => (
        <table>
            <thead>
                <tr>
                    <th>Year</th>
                    <th>Month</th>
                    <th>Category</th>
                    <th>Transactions</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                { insights.data.map((insight, i) => (
                    <tr key={i}>
                        <td>{insight.year}</td>
                        <td>{insight.month}</td>
                        <td>{insight.category}</td>
                        <td>{insight.transactions}</td>
                        <td>{insight.total}</td>
                    </tr>
                )) }
            </tbody>
        </table>
    );

    return (
        <Root spacing={3} pb={3}>
            <Title mb={-1}>Insights</Title>
            { insights && <SummaryTable /> }
        </Root>
    );
};
export default Insights;

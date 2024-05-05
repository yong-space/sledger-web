import {
    BarPlot, ChartsGrid, ChartsTooltip, ChartsXAxis, ChartsYAxis, LinePlot,
    MarkPlot, ResponsiveChartContainer, lineElementClasses, markElementClasses,
} from '@mui/x-charts';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import api from '../core/api';
import { HorizontalLoader, Title } from '../core/utils';

const BalanceHistory = ({ setRoute }) => {
    const [ balanceHistory, setBalanceHistory ] = useState(null);
    const { getBalanceHistory } = api();

    useEffect(() => {
        setRoute('balance-history');
        getBalanceHistory((response) => setBalanceHistory(response));
    }, []);

    const BalanceChart = () => (
        <ResponsiveChartContainer
            series={balanceHistory.series}
            xAxis={[{
                data: balanceHistory.xaxis.map((str) => dayjs.utc(str).format('MMM YY')),
                scaleType: 'band',
            }]}
            margin={{ top: 10, left: 53, right: 0, bottom: 40 }}
            sx={{
                [`.${lineElementClasses.root}, .${markElementClasses.root}`]: {
                  strokeWidth: 4,
                },
            }}
        >
            <ChartsGrid horizontal vertical />
            <ChartsXAxis />
            <ChartsYAxis />
            <BarPlot />
            <LinePlot />
            <MarkPlot />
            <ChartsTooltip trigger="item" />
        </ResponsiveChartContainer>
    );

    return (
        <>
            <Title>Balance History</Title>
            { !balanceHistory ? <HorizontalLoader /> : <BalanceChart /> }
        </>
    )
};
export default BalanceHistory;

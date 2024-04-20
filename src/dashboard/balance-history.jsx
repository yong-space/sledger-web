import { BarChart } from '@mui/x-charts';
import { HorizontalLoader } from '../core/utils';
import { useEffect, useState } from 'react';
import api from '../core/api';
import dayjs from 'dayjs';
import { Title } from '../core/utils';

const BalanceHistory = ({ setRoute }) => {
    const [ balanceHistory, setBalanceHistory ] = useState();
    const { getBalanceHistory } = api();

    useEffect(() => {
        setRoute('balance-history');
        getBalanceHistory((response) => setBalanceHistory(response));
    }, []);

    const BalanceChart = () => (
        <BarChart
            series={balanceHistory.series}
            xAxis={[{
                data: balanceHistory.xaxis.map((str) => dayjs.utc(str).format('MMM YY')),
                scaleType: 'band',
            }]}
            sx={{ ['.MuiChartsLegend-root'] : { 'display': 'none' } }}
            margin={{ top: 10, left: 53, right: 0, bottom: 40 }}
            tooltip={{ trigger: 'item' }}
        />
    );

    return (
        <>
            <Title>Balance History</Title>
            { !balanceHistory ? <HorizontalLoader /> : <BalanceChart /> }
        </>
    )
};
export default BalanceHistory;

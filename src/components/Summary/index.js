import React from 'react';
import { Typography } from 'antd';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import unicaTheme from './unica-theme'

export default () => {
    const { Title } = Typography;
    Highcharts.setOptions(unicaTheme);
    const options = {
        chart: {
            type: 'pie'
        },
        plotOptions: {
            pie: {
                dataLabels: { style: { textOutline: false } }
            }
        },
        series: [
            {
                name: 'Total Balance',
                data: [
                    { name: 'Cash', y: 7000 },
                    { name: 'Investments', y: 3000 },
                    { name: 'Retirement', y: 2000 }
                ],
                size: '70%',
                dataLabels: {
                    distance: -50,
                    formatter: function () {
                        return this.y > 0 ? this.point.name : null;
                    }
                }
            }, {
                name: 'Balance',
                data: [
                    { name: 'Bank A', y: 3000 },
                    { name: 'Bank B', y: 4000 },
                    { name: 'Broker C', y: 2000 },
                    { name: 'Broker D', y: 1000 },
                    { name: 'CPF', y: 2000 },
                ],
                size: '100%',
                innerSize: '70%',
                dataLabels: {
                    distance: 0
                }
            }
        ]
    };

    return (
        <>
            <Title level={4}>Dashboard</Title>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
            />
        </>
    );
}

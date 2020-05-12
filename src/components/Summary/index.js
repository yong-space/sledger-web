import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import './summary.css';

export default () => {
    const options = {
        credits: false,
        title: { text: '' },
        chart: {
            type: 'pie'
        },
        exporting: {
            enabled: false
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
            <h1>Dashboard</h1>

            <HighchartsReact
                highcharts={Highcharts}
                options={options}
            />
        </>
    );
}

import React from 'react';
import { Typography } from 'antd';
import {
    Chart, Interval, Tooltip, Legend, View, Axis, Coordinate
} from 'bizcharts';
import { DataView } from '@antv/data-set';

export default () => {
    const { Title } = Typography;

    const data = [
        { type: 'Cash', name: 'Bank A', value: 3163.23 },
        { type: 'Cash', name: 'Bank B', value: 1234.56 },
        { type: 'Cash', name: 'Bank C', value: 234.78 },
        { type: 'Investments', name: 'Broker A', value: 32163.23 },
        { type: 'Investments', name: 'Broker B', value: 11163.23 },
        { type: 'Retirement', name: 'CPF', value: 78163.23 }
    ];

    const colours = ['#BAE7FF', '#7FC9FE', '#71E3E3', '#ABF5F5', '#8EE0A1', '#BAF5C4'];

    const innerRing = new DataView();
    innerRing.source(data).transform({
        type: 'percent',
        field: 'value',
        dimension: 'type',
        as: 'percent',
    });

    const outerRing = new DataView();
    outerRing.source(data).transform({
        type: 'percent',
        field: 'value',
        dimension: 'name',
        as: 'percent',
    });

    return (
        <>
            <Title level={4}>Dashboard</Title>
            <Chart
                height="40vh"
                data={innerRing.rows}
                autoFit
            >
                <Coordinate type="theta" radius={0.5} />
                <Axis visible={false} />
                <Legend visible={false} />
                <Tooltip showTitle={false} />
                <Interval
                    position="percent"
                    adjust="stack"
                    color="type"
                    element-highlight
                    style={{ stroke: '#fff' }}
                    label={[ 'type', { offset: -15 } ]}
                />
                <View data={outerRing.rows}>
                    <Coordinate type="theta" radius={0.75} innerRadius={0.5 / 0.75} />
                    <Interval
                        position="percent"
                        adjust="stack"
                        color={[ 'name', colours ]}
                        element-highlight
                        style={{ stroke: '#fff' }}
                        label={[ 'name', { offset: 20 } ]}
                    />
                </View>
            </Chart>
        </>
    );
}

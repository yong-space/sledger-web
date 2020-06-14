import React from 'react';
import {
    PieChartOutlined, DesktopOutlined
} from '@ant-design/icons';
import SiderLayout from '../Common/SiderLayout';
import Summary from './Summary';

export default () => {
    const menuItems = [
        {
            label: 'Summary', icon: <PieChartOutlined />,
            route: '/dash/summary', component: Summary
        },
        {
            label: 'Balance History', icon: <DesktopOutlined />,
            route: '/dash/balance-history', component: Summary
        }
    ];

    return <SiderLayout menuItems={menuItems} />;
}

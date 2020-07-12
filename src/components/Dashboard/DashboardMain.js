import React from 'react';
import { AiOutlinePieChart, AiOutlineBarChart } from 'react-icons/ai';
import SiderLayout from '../Common/SiderLayout';
import Summary from './Summary';
import BalanceHistory from './BalanceHistory';

export default () => {
    const menuItems = [
        {
            label: 'Summary', icon: AiOutlinePieChart,
            route: '/dash/summary', component: Summary
        },
        {
            label: 'Balance History', icon: AiOutlineBarChart,
            route: '/dash/balance-history', component: BalanceHistory
        }
    ];

    return <SiderLayout menuItems={menuItems} />;
}

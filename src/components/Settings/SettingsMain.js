import React from 'react';
import {
    UserOutlined, SwapOutlined
} from '@ant-design/icons';
import { FaRegCreditCard, FaMoneyBillAlt } from 'react-icons/fa';
import AntIcon from '../Common/AntIcon';
import SiderLayout from '../Common/SiderLayout';
import Profile from './Profile';
import CashAccounts from './CashAccounts';
import CreditCards from './CreditCards';
import Backup from './Backup';

export default () => {
    const menuItems = [
        {
            label: 'Profile', icon: <UserOutlined />,
            route: '/settings/profile', component: Profile
        },
        {
            label: 'Cash Accounts', icon: <AntIcon i={FaMoneyBillAlt} />,
            route: '/settings/cash-accounts', component: CashAccounts
        },
        {
            label: 'Credit Cards', icon: <AntIcon i={FaRegCreditCard} />,
            route: '/settings/credit-cards', component: CreditCards
        },
        {
            label: 'Backup', icon: <SwapOutlined />,
            route: '/settings/backup', component: Backup
        }
    ];

    return <SiderLayout menuItems={menuItems} />;
}

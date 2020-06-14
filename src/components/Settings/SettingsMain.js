import React from 'react';
import {
    BankOutlined, UserOutlined, SwapOutlined
} from '@ant-design/icons';
import SiderLayout from '../Common/SiderLayout';
import Profile from './Profile';

export default () => {
    const menuItems = [
        {
            label: 'Profile', icon: <UserOutlined />,
            route: '/settings/profile', component: Profile
        },
        {
            label: 'Accounts', icon: <BankOutlined />,
            route: '/settings/accounts', component: Profile
        },
        {
            label: 'Backup', icon: <SwapOutlined />,
            route: '/settings/backup', component: Profile
        }
    ];

    return <SiderLayout menuItems={menuItems} />;
}

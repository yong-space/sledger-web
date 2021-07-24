import React from 'react';
import { AiOutlineAccountBook } from 'react-icons/ai';
import SiderLayout from '../Common/SiderLayout';
import AccountTypes from './AccountTypes';

export default () => {
    const menuItems = [
        {
            label: 'Account Types',
            icon: AiOutlineAccountBook,
            route: '/admin/account-types',
            component: AccountTypes,
        },
    ];

    return <SiderLayout menuItems={menuItems} />;
};

import React from 'react';
import SiderLayout from '../Common/SiderLayout';
import { AiOutlineAccountBook } from 'react-icons/ai';
import AccountTypes from './AccountTypes';
import AntIcon from '../Common/AntIcon';

export default () => {
    const menuItems = [
        {
            label: 'Account Types', icon: <AntIcon i={AiOutlineAccountBook} />,
            route: '/admin/account-types', component: AccountTypes
        }
    ];

    return <SiderLayout menuItems={menuItems} />;
}

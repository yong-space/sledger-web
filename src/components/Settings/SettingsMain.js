import React from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { FaRegCreditCard, FaMoneyBillAlt } from 'react-icons/fa';
import { MdBackup } from 'react-icons/md';
import AntIcon from '../Common/AntIcon';
import SiderLayout from '../Common/SiderLayout';
import Profile from './Profile';
import CashAccounts from './CashAccounts';
import CreditCards from './CreditCards';
import Backup from './Backup';

export default () => {
    const menuItems = [
        {
            label: 'Profile', icon: <AntIcon i={AiOutlineUser} />,
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
            label: 'Backup', icon: <AntIcon i={MdBackup} />,
            route: '/settings/backup', component: Backup
        }
    ];

    return <SiderLayout menuItems={menuItems} />;
}

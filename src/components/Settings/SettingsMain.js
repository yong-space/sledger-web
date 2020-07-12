import React from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { FaRegCreditCard, FaMoneyBillAlt } from 'react-icons/fa';
import { MdBackup } from 'react-icons/md';
import SiderLayout from '../Common/SiderLayout';
import Profile from './Profile';
import ManageCashAccounts from './ManageCashAccounts';
import ManageCreditCards from './ManageCreditCards';
import Backup from './Backup';

export default () => {
    const menuItems = [
        {
            label: 'Profile', icon: AiOutlineUser,
            route: '/settings/profile', component: Profile
        },
        {
            label: 'Cash Accounts', icon: FaMoneyBillAlt,
            route: '/settings/cash-accounts', component: ManageCashAccounts
        },
        {
            label: 'Credit Cards', icon: FaRegCreditCard,
            route: '/settings/credit-cards', component: ManageCreditCards
        },
        {
            label: 'Backup', icon: MdBackup,
            route: '/settings/backup', component: Backup
        }
    ];

    return <SiderLayout menuItems={menuItems} />;
}

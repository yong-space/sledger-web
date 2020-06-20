import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom';
import { Avatar, Button, Layout, Menu, Drawer, Divider } from 'antd';
import { AiOutlineDashboard, AiOutlineUser, AiOutlineLogout, AiOutlineMenu } from 'react-icons/ai';
import { IoIosSettings } from 'react-icons/io';
import { BsLightning } from 'react-icons/bs';
import { TiDocumentText } from 'react-icons/ti';
import { FaRegCreditCard, FaMoneyBillAlt } from 'react-icons/fa';
import { MdBackup } from 'react-icons/md';
import AntIcon from '../Common/AntIcon';
import useLogin from '../Login/LoginHook';
import logoWhite from '../../assets/logo-white.svg';
import './NavBar.less'

export default () => {
    let location = useLocation();
    const [ drawerVisible, setDrawerVisible ] = useState(false);
    const { isLoginValid, isAdmin, getProfile, logout } = useLogin();
    const getMenuItems = () => {
        const menuItems = [
            { label: 'Dashboard', icon: AiOutlineDashboard, route: '/dash/summary' },
            { label: 'Transactions', icon: TiDocumentText, route: '/transactions' },
            {
                label: 'Settings',
                route: '/settings/profile',
                icon: IoIosSettings,
                children: [
                    { label: 'Profile', icon: AiOutlineUser, route: '/settings/profile' },
                    { label: 'Cash Accounts', icon: FaMoneyBillAlt, route: '/settings/cash-accounts' },
                    { label: 'Credit Cards', icon: FaRegCreditCard, route: '/settings/credit-cards' },
                    { label: 'Backup', icon: MdBackup, route: '/settings/backup' }
                ]
            }
        ];
        if (isAdmin()) {
            menuItems.push({ label: 'Admin', icon: BsLightning, route: '/admin/account-types' });
        }
        return menuItems;
    }
    const menuLinks = (desktop) => getMenuItems().map((menuItem, index) => {
        if (desktop && menuItem.children) {
            const childMenus = menuItem.children.map(child =>
                <Menu.Item key={child.route}>
                    <Link to={child.route} onClick={() => setDrawerVisible(false)}>
                        <AntIcon i={child.icon} /> {child.label}
                    </Link>
                </Menu.Item>
            )
            return (
                <Menu.SubMenu key={menuItem.route} title={menuItem.label} icon={<AntIcon i={menuItem.icon} />}>
                    {childMenus}
                </Menu.SubMenu>
            )
        }
        return (
            <Menu.Item key={index} icon={<AntIcon i={menuItem.icon} />}>
                <Link to={menuItem.route} onClick={() => setDrawerVisible(false)}>
                    {menuItem.label}
                </Link>
            </Menu.Item>
        );
    });

    const closeDrawer = () => setDrawerVisible(false);

    useEffect(() => {
        window.addEventListener('resize', closeDrawer);
        return () => window.removeEventListener('resize', closeDrawer);
    }, []);

    const getSelectedMenuItem = () => {
        const route = getMenuItems().map(i => i.route)
            .filter(r => location.pathname.startsWith(r.match(/\/[\w-]+/)[0]))[0];
        const index = getMenuItems().map(i => i.route)
            .indexOf(route);
        return [ index.toString() ];
    };

    const getLoginStatus = () => {
        if (!isLoginValid()) {
            return <></>
        }
        return (
            <>
                <div className="login-description">
                    <Avatar icon={<AntIcon i={AiOutlineUser} />} />
                    {getProfile().fullName}
                </div>
                <Button
                    type="danger"
                    icon={<AntIcon i={AiOutlineLogout} />}
                    onClick={logout}
                    className="logout-button">
                    Logout
                </Button>
            </>
        );
    };

    return (
        <Layout.Header className="header-container">
            <div>
                <a href="/">
                    <img src={logoWhite} alt='Sledger' className="logo" />
                </a>

                <Menu
                    className="desktop"
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={getSelectedMenuItem()}
                >
                    {menuLinks(true)}
                </Menu>
            </div>
            <div className="login-status desktop">
                {getLoginStatus()}
            </div>
            <Button
                className="mobile hamburger"
                onClick={() => setDrawerVisible(!drawerVisible) }
            >
                <AntIcon i={AiOutlineMenu} />
            </Button>
            <Drawer
                placement="top"
                visible={drawerVisible}
                closable={false}
                key="top"
                mask="false"
                drawerStyle={{ marginTop: '3rem' }}
                height="auto"
            >
                <Menu
                    theme="dark"
                    mode="vertical"
                    defaultSelectedKeys={getSelectedMenuItem()}
                >
                    {menuLinks(false)}
                </Menu>
                <Divider />
                {getLoginStatus()}
            </Drawer>
        </Layout.Header>
    );
}

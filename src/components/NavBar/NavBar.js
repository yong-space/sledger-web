import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom'
import { Avatar, Button, Layout, Menu, Drawer, Divider, Dropdown } from 'antd';
import { AiOutlineDashboard, AiOutlineUser, AiOutlineLogout, AiOutlineMenu } from 'react-icons/ai';
import { IoIosSettings } from 'react-icons/io';
import { BsLightning } from 'react-icons/bs';
import { TiDocumentText } from 'react-icons/ti';
import { FaRegCreditCard, FaMoneyBillAlt } from 'react-icons/fa';
import { MdBackup } from 'react-icons/md';
import AntIcon from '../Common/AntIcon';
import authServices from '../Login/AuthServices';
import logoWhite from '../../assets/logo-white.svg';
import './NavBar.less'

export default (props) => {
    let history = useHistory();
    let location = useLocation();
    const [ selectedItems, setSelectedItems ] = useState([ location.pathname ]);
    const [ drawerVisible, setDrawerVisible ] = useState(false);
    const { isAdmin, getProfile, logout } = authServices();

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
                    <AntIcon i={child.icon} /> {child.label}
                </Menu.Item>
            )
            return (
                <Menu.SubMenu
                    key={menuItem.route}
                    title={menuItem.label}
                    icon={<AntIcon i={menuItem.icon} />}
                    onTitleClick={handleMenuClick}
                >
                    {childMenus}
                </Menu.SubMenu>
            )
        }
        return (
            <Menu.Item key={menuItem.route} icon={<AntIcon i={menuItem.icon} />}>
                {menuItem.label}
            </Menu.Item>
        );
    });

    const closeDrawer = () => setDrawerVisible(false);

    useEffect(() => {
        window.addEventListener('resize', closeDrawer);
        return () => window.removeEventListener('resize', closeDrawer);
    }, []);

    const handleMenuClick = (event) => {
        closeDrawer();
        setSelectedItems([ event.key ]);
        history.push(event.key);
    };

    const gotoProfile = () => handleMenuClick({ key: '/settings/profile' });

    const avatar = (
        <div className="login-description" onClick={gotoProfile}>
            <Avatar icon={<AntIcon i={AiOutlineUser} />} />
            {getProfile()?.fullName || ''}
        </div>
    );

    const logoutButton = (
        <Button
            type="danger"
            icon={<AntIcon i={AiOutlineLogout} />}
            onClick={logout}
            className="logout-button"
        >
            Logout
        </Button>
    );

    const logoutMenu = (
        <Menu>
            <Menu.Item>
                {logoutButton}
            </Menu.Item>
        </Menu>
    );

    const avatarDesktop = (
        <Dropdown overlay={logoutMenu} overlayClassName="logout-menu">
            {avatar}
        </Dropdown>
    );

    const avatarMobile = (
        <>
            {avatar}
            {logoutButton}
        </>
    );

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
                    onClick={handleMenuClick}
                    selectedKeys={selectedItems}
                >
                    {menuLinks(true)}
                </Menu>
            </div>
            <div className="login-status desktop">
                {avatarDesktop}
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
                    onClick={handleMenuClick}
                    selectedKeys={selectedItems}

                >
                    {menuLinks(false)}
                </Menu>
                <Divider />
                {avatarMobile}
            </Drawer>
        </Layout.Header>
    );
}

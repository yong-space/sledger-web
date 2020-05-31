import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom';
import { Button, Layout, Menu, Drawer, Divider } from 'antd';
import { LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import useLogin from '../Login/login-hook';
import logoWhite from '../../assets/logo-white.svg';
import './NavBar.less'

export default () => {
    let location = useLocation();
    const [ drawerVisible, setDrawerVisible ] = useState(false);
    const { isLoginValid, getUsername, logout } = useLogin();
    const menuItems = [
        { label: 'Dashboard', route: '/dash' },
        { label: 'Transactions', route: '/transactions' },
        { label: 'Settings', route: '/settings' }
    ];
    const menuLinks = menuItems.map((menuItem, index) =>
        <Menu.Item key={index}>
            <Link to={menuItem.route} onClick={() => setDrawerVisible(false)}>
                {menuItem.label}
            </Link>
        </Menu.Item>
    );

    const closeDrawer = () => setDrawerVisible(false);

    useEffect(() => {
        window.addEventListener('resize', closeDrawer);
        return () => window.removeEventListener('resize', closeDrawer);
    }, []);

    const selectedMenuItem = [
        menuItems.map(i => i.route).indexOf(location.pathname).toString()
    ]

    const getLoginStatus = () => {
        if (!isLoginValid()) {
            return <></>
        }
        return (
            <>
                <div className="login-description">
                    Logged in as {getUsername()}
                </div>
                <Button
                    type="danger"
                    icon={<LogoutOutlined />}
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
                    defaultSelectedKeys={selectedMenuItem}
                >
                    {menuLinks}
                </Menu>
            </div>
            <div className="login-status desktop">
                {getLoginStatus()}
            </div>
            <Button
                className="mobile hamburger"
                onClick={() => setDrawerVisible(!drawerVisible) }
            >
                <MenuOutlined />
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
                    defaultSelectedKeys={selectedMenuItem}
                >
                    {menuLinks}
                </Menu>
                <Divider />
                {getLoginStatus()}
            </Drawer>
        </Layout.Header>
    );
}

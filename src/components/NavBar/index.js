import React from 'react';
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom';
import { Button, Layout, Menu } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import useLogin from '../LoginHook';
import logoWhite from '../../assets/logo-white.svg';
import './NavBar.css'

export default () => {
    let location = useLocation();
    const { isLoginValid, getUsername, logout } = useLogin();
    const menuItems = [
        { label: 'Dashboard', route: '/dash' },
        { label: 'Transactions', route: '/transactions' },
        { label: 'Settings', route: '/settings' }
    ];

    const getMenuItems = () => menuItems.map((menuItem, index) =>
        <Menu.Item key={index}>
            <Link to={menuItem.route}>
                {menuItem.label}
            </Link>
        </Menu.Item>
    );

    const selectedMenuItem = [
        menuItems.map(i => i.route).indexOf(location.pathname).toString()
    ]

    const getLoginStatus = () => {
        if (isLoginValid()) {
            return (
                <>
                    Logged in as {getUsername()}
                    <Button type="danger" icon={<LogoutOutlined />} onClick={logout} style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                        Logout
                    </Button>
                </>
            );
        } else {
            return <div style={{ margin: '0 10px' }}>Not Logged In</div>;
        }
    };

    return (
        <Layout.Header>
            <a href="/">
                <img src={logoWhite} alt='Sledger' className="logo" />
            </a>
            <div style={{
                margin: '6px',
                lineHeight: '32px',
                float: 'right',
                color: 'white'
            }}>
                {getLoginStatus()}
            </div>
            <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={selectedMenuItem}
            >
                {getMenuItems()}
            </Menu>
        </Layout.Header>
    );
}

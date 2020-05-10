import React from 'react';
import {Button, Layout, Menu} from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import useLogin from '../LoginHook';
import logoWhite from '../../assets/logo-white.svg';
import './NavBar.css'
//import logoBlack from '../../assets/logo-black.svg';

export default () => {
    const { isLoginValid, getUsername, logout } = useLogin();
    const menuItems = [ 'Dashboard', 'Transactions', 'Settings' ];
    const getMenuItems = () => menuItems.map((menuItem, index) =>
        <Menu.Item
            key={index}
            onClick={e => changeMenu(e)}
        >
            {menuItem}
        </Menu.Item>
    );
    const changeMenu = e => {
        console.log(menuItems[e.key]);
    };

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
            <img src={logoWhite} alt='Sledger Logo' className="logo" />
            <div style={{
                margin: '6px',
                lineHeight: '32px',
                float: 'right',
                color: 'white'
            }}>
                { getLoginStatus() }
            </div>
            <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={['0']}
            >
                { getMenuItems() }
            </Menu>
        </Layout.Header>
    );
}

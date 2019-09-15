import React from 'react';
import {Button, Layout, Menu} from 'antd';
import useLogin from '../LoginHook';
import logoWhite from '../../assets/logo-white.svg';
import logoBlack from '../../assets/logo-black.svg';

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
                    <Button icon="logout" type="danger" onClick={logout} style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                        Logout
                    </Button>
                </>
            );
        } else {
            return <div style={{ margin: '0 10px' }}>Not Logged In</div>;
        }
    };

    return (
        <Layout.Header style={{ height: '46px', padding: 0 }}>
            {/*
            <div style={{
                width: '120px',
                height: '31px',
                background: 'rgba(255, 255, 255, 0.2)',
                float: 'left',
                margin: '7px 20px'
            }} />
            */}
            <img
                src={logoWhite} alt='Sledger Logo'
                style={{
                    float: 'left',
                    height: '24px',
                    margin: '14px 25px'
                }}
            />
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

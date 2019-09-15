import React from 'react';
import {Button, Layout, Menu} from 'antd';
import useLogin from '../LoginHook';

export default () => {
    const { Header, Content, Sider } = Layout;
    const { isLoginValid, getUsername, logout } = useLogin();

    const getLoginStatus = () => {
        if (isLoginValid()) {
            return (
                <Header style={{ height: '46px', padding: 0 }}>
                    <div style={{
                        width: '120px',
                        height: '31px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        float: 'left',
                        margin: '7px 20px'
                    }} />
                    <div style={{
                        margin: '6px',
                        lineHeight: '32px',
                        float: 'right',
                        color: 'white'
                    }}>
                        Logged in as {getUsername()}
                        <Button icon="logout" type="danger" onClick={logout} style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                            Logout
                        </Button>
                    </div>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={['1']}
                    >
                        <Menu.Item key="1">Dashboard</Menu.Item>
                        <Menu.Item key="2">Transactions</Menu.Item>
                        <Menu.Item key="3">Settings</Menu.Item>
                    </Menu>
                </Header>
            );
        } else {
            return <div>Not Logged In</div>;
        }
    };

    return (
        <div>
            { getLoginStatus() }
        </div>
    );
}

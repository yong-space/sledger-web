import React, { useState } from 'react';
import { withRouter } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
    BankOutlined, UserOutlined, SwapOutlined
} from '@ant-design/icons';
import Profile from './Profile';

export default () => {
    const { Content, Sider } = Layout;
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                breakpoint="sm"
                collapsedWidth="0"
            >
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                    <Menu.Item key="1">
                        <UserOutlined />
                        <span>Profile</span>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <BankOutlined />
                        <span>Accounts</span>
                    </Menu.Item>
                    <Menu.Item key="3">
                        <SwapOutlined />
                        <span>Backup</span>
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout style={{ padding: '0 24px 24px' }}>
                <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
                    <Switch>
                        <Route path="/settings" exact component={withRouter(Profile)} />
                        <Route render={() => <><br/>Settings route not Found</>} />
                    </Switch>
                </Content>
            </Layout>
        </>
    );
}

import React, { useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Breadcrumb, Layout, Menu } from 'antd';
import {
    PieChartOutlined, DesktopOutlined, UserOutlined, TeamOutlined, FileOutlined
} from '@ant-design/icons';
import NavBar from '../NavBar';
import Summary from '../Summary';
import './main-layout.css';

export default () => {
    const { Content, Sider } = Layout;
    const { SubMenu } = Menu;
    const [collapsed, setCollapsed] = useState(false);

    if (window.location.pathname.endsWith('/dash')) {
        window.history.pushState({}, "", "/dash/summary")
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <NavBar />
            <Layout>
                <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
                    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                        <Menu.Item key="1">
                            <PieChartOutlined />
                            <span>Option 1</span>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <DesktopOutlined />
                            <span>Option 2</span>
                        </Menu.Item>
                        <SubMenu
                            key="sub1"
                            title={<span><UserOutlined /> <span>User</span></span>}
                        >
                            <Menu.Item key="3">Tom</Menu.Item>
                            <Menu.Item key="4">Bill</Menu.Item>
                            <Menu.Item key="5">Alex</Menu.Item>
                        </SubMenu>
                        <SubMenu
                            key="sub2"
                            title={<span><TeamOutlined /> <span>Team</span></span>}
                        >
                            <Menu.Item key="6">Team 1</Menu.Item>
                            <Menu.Item key="8">Team 2</Menu.Item>
                        </SubMenu>
                        <Menu.Item key="9">
                            <FileOutlined />
                            <span>File</span>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout style={{ padding: '0 24px 24px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item>Home</Breadcrumb.Item>
                        <Breadcrumb.Item>List</Breadcrumb.Item>
                        <Breadcrumb.Item>App</Breadcrumb.Item>
                    </Breadcrumb>
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                        }}
                    >
                        <BrowserRouter>
                            <Switch>
                                <Route path="/dash/summary" exact={true} component={Summary} />
                                <Route path="*" render={() => <><br/>Route not Found</>} />
                            </Switch>
                        </BrowserRouter>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    )
}

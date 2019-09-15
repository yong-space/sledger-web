import React, { useState } from 'react';
import {Breadcrumb, Icon, Layout, Menu} from 'antd';
import NavBar from '../NavBar';
import {LoginProvider} from '../LoginContext';
import Routes from '../Routes';
import {useRoutes} from 'hookrouter';
import './App.css';

export default () => {
    const { Content, Sider } = Layout;
    const { SubMenu } = Menu;
    const [ collapsed, setCollapsed ] = useState(false);

    return (
        <div className="App">
            <LoginProvider>
                <Layout style={{ minHeight: '100vh' }}>
                    <NavBar />
                    <Layout>
                        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
                            <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                                <Menu.Item key="1">
                                    <Icon type="pie-chart" />
                                    <span>Option 1</span>
                                </Menu.Item>
                                <Menu.Item key="2">
                                    <Icon type="desktop" />
                                    <span>Option 2</span>
                                </Menu.Item>
                                <SubMenu
                                    key="sub1"
                                    title={<span><Icon type="user" /> <span>User</span></span>}
                                >
                                    <Menu.Item key="3">Tom</Menu.Item>
                                    <Menu.Item key="4">Bill</Menu.Item>
                                    <Menu.Item key="5">Alex</Menu.Item>
                                </SubMenu>
                                <SubMenu
                                    key="sub2"
                                    title={<span><Icon type="team" /> <span>Team</span></span>}
                                >
                                    <Menu.Item key="6">Team 1</Menu.Item>
                                    <Menu.Item key="8">Team 2</Menu.Item>
                                </SubMenu>
                                <Menu.Item key="9">
                                    <Icon type="file" />
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
                                    background: '#fff',
                                    padding: 24,
                                    margin: 0,
                                    minHeight: 280,
                                }}
                            >
                                { useRoutes(Routes) || <h2>Page Not Found</h2> }
                            </Content>
                        </Layout>
                    </Layout>
                </Layout>
            </LoginProvider>
        </div>
    );
}

import React, { useState } from 'react';
import { withRouter } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
    PieChartOutlined, DesktopOutlined, UserOutlined, TeamOutlined, FileOutlined
} from '@ant-design/icons';
import Summary from './Summary';

export default () => {
    const { Content, Sider } = Layout;
    const { SubMenu } = Menu;
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
                        <PieChartOutlined />
                        <span>Summary</span>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <DesktopOutlined />
                        <span>Balance History</span>
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
                <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
                    <Switch>
                        <Route path="/dash" exact component={withRouter(Summary)} />
                        <Route render={() => <><br/>Dashboard route not Found</>} />
                    </Switch>
                </Content>
            </Layout>
        </>
    );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Switch, Route, useLocation, useHistory } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
    BankOutlined
} from '@ant-design/icons';
import AccountTypes from './AccountTypes';

export default () => {
    const { Content, Sider } = Layout;
    const [ collapsed, setCollapsed ] = useState(false);
    const menuItems = [
        { label: 'Account Types', icon: <BankOutlined />, route: '/admin/account-types' }
    ];
    const menuLinks = menuItems.map((menuItem, index) =>
        <Menu.Item key={index}>
            <Link to={menuItem.route}>
                {menuItem.icon} {menuItem.label}
            </Link>
        </Menu.Item>
    );
    const routes = menuItems.map((menuItem, index) =>
        <Route exact key={index}
            path={menuItem.route} component={AccountTypes} />
    );
    let location = useLocation();
    const selectedMenuItem = () => [
        Math.max(0, menuItems.map(i => i.route).indexOf(location.pathname)).toString()
    ]

    const history = useHistory();
    useEffect(() => {
        if (menuItems.map(i => i.route).indexOf(location.pathname) === -1) {
            history.push(menuItems[0].route);
        }
    }, [ menuItems, history, location.pathname ]);

    return (
        <>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                breakpoint="sm"
                collapsedWidth="0"
            >
                <Menu theme="dark" defaultSelectedKeys={selectedMenuItem()} mode="inline">
                    {menuLinks}
                </Menu>
            </Sider>
            <Layout style={{ padding: '0 24px 24px' }}>
                <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
                    <Switch>
                        {routes}
                        <Route component={AccountTypes} />
                    </Switch>
                </Content>
            </Layout>
        </>
    );
}

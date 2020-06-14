import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { Switch, Route, useLocation, useHistory } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { useSwipeable } from 'react-swipeable'
import {
    BankOutlined, UserOutlined, SwapOutlined
} from '@ant-design/icons';
import Profile from './Profile';
import SiderButton from '../Common/SiderButton';

export default () => {
    const { Content, Sider } = Layout;
    const [ collapsed, setCollapsed ] = useState(false);
    const swipeProps = useSwipeable({
        onSwiped: (event) => {
            console.log(event.dir);
            if (event.dir === 'Left' && !collapsed) {
                setCollapsed(true);
            } else if (event.dir === 'Right' && collapsed) {
                setCollapsed(false);
            }
        }
    });
    const menuItems = [
        { label: 'Profile', icon: <UserOutlined />, route: '/settings/profile' },
        { label: 'Accounts', icon: <BankOutlined />, route: '/settings/accounts' },
        { label: 'Backup', icon: <SwapOutlined />, route: '/settings/backup' }
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
            path={menuItem.route} component={withRouter(Profile)} />
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
        <div {...swipeProps}>
            <Layout>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    breakpoint="sm"
                    collapsedWidth="1"
                    trigger={<SiderButton collapsed={collapsed} />}
                    width="12rem"
                    style={{
                        position: 'fixed',
                        height: '100vh',
                        zIndex: 2
                    }}
                >
                    <Menu theme="dark" defaultSelectedKeys={selectedMenuItem()} mode="inline">
                        {menuLinks}
                    </Menu>
                </Sider>
                <Layout style={{
                    padding: '0 24px 24px',
                    marginLeft: collapsed ? 0 : '12rem'
                }}>
                    <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
                        <Switch>
                            {routes}
                            <Route component={withRouter(Profile)} />
                        </Switch>
                    </Content>
                </Layout>
            </Layout>
        </div>
    );
}

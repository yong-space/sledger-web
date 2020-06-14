import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { Switch, Route, useLocation, useHistory } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { useSwipeable } from 'react-swipeable'
import SiderButton from '../Common/SiderButton';

export default (props) => {
    const { Content, Sider } = Layout;
    const [ collapsed, setCollapsed ] = useState(false);
    const swipeProps = useSwipeable({
        onSwiped: (event) => {
            if (event.dir === 'Left' && !collapsed) {
                setCollapsed(true);
            } else if (event.dir === 'Right' && collapsed) {
                setCollapsed(false);
            }
        }
    });

    const menuLinks = props.menuItems.map((menuItem, index) =>
        <Menu.Item key={index}>
            <Link to={menuItem.route}>
                {menuItem.icon} {menuItem.label}
            </Link>
        </Menu.Item>
    );

    const routes = props.menuItems.map((menuItem, index) =>
        <Route exact
            key={index}
            path={menuItem.route}
            component={withRouter(menuItem.component)} />
    );

    let location = useLocation();
    const selectedMenuItem = () => [
        Math.max(0, props.menuItems.map(i => i.route).indexOf(location.pathname)).toString()
    ]

    const history = useHistory();
    useEffect(() => {
        if (props.menuItems.map(i => i.route).indexOf(location.pathname) === -1) {
            history.push(props.menuItems[0].route);
        }
    }, [ props.menuItems, history, location.pathname ]);

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
                            <Route component={withRouter(props.menuItems[0].component)} />
                        </Switch>
                    </Content>
                </Layout>
            </Layout>
        </div>
    );
}

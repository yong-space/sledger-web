import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import Atom from '../Common/Atom';
import { useHistory } from 'react-router-dom';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { useSwipeable } from 'react-swipeable'
import SiderButton from '../Common/SiderButton';

export default (props) => {
    let history = useHistory();
    const [ selectedItems, setSelectedItems ] = useRecoilState(Atom.selectedNavItems);
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

    const menuLinks = props.menuItems.map((menuItem) =>
        <Menu.Item key={menuItem.route}>
            {menuItem.icon} {menuItem.label}
        </Menu.Item>
    );

    const routes = props.menuItems.map((menuItem, index) =>
        <Route exact
            key={index}
            path={menuItem.route}
            component={menuItem.component} />
    );

    const handleMenuClick = (event) => {
        setSelectedItems([ event.key ]);
        history.push(event.key);
    };

    return (
        <div {...swipeProps} style={{ height: '100%' }}>
            <Layout style={{ height: '100%' }}>
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
                    <Menu
                        theme="dark"
                        selectedKeys={selectedItems}
                        mode="inline"
                        onClick={handleMenuClick}
                    >
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
                            <Route render={() => <Redirect to={props.menuItems[0].route} />} />
                        </Switch>
                    </Content>
                </Layout>
            </Layout>
        </div>
    );
}

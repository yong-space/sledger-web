import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import Atom from '../Common/Atom';
import { useHistory } from 'react-router-dom';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Layout, Menu, Drawer } from 'antd';
import { useSwipeable } from 'react-swipeable'
import SiderButton from '../Common/SiderButton';

export default (props) => {
    let history = useHistory();
    const [ selectedItems, setSelectedItems ] = useRecoilState(Atom.selectedNavItems);
    const { Content, Sider } = Layout;
    const [ siderCollapsed, setSiderCollapsed ] = useState(false);
    const [ drawerCollapsed, setDrawerCollapsed ] = useState(true);
    const swipeProps = useSwipeable({
        onSwiped: (event) => {
            if (event.dir === 'Left' && !drawerCollapsed) {
                setDrawerCollapsed(true);
            } else if (event.dir === 'Right' && drawerCollapsed) {
                setDrawerCollapsed(false);
            }
        }
    });

    const closeDrawer = (event) => {
        if (event.target.className === 'ant-drawer-mask') {
            setDrawerCollapsed(true);
        }
    };

    useEffect(() => {
        document.querySelector('.drawerWrapper').addEventListener('touchend', closeDrawer);
        return () => document.querySelector('.drawerWrapper').removeEventListener('touchend', closeDrawer);
        // eslint-disable-next-line
    }, []);

    const menuLinks = props.menuItems.map((menuItem) =>
        <Menu.Item key={menuItem.route}>
            {menuItem.icon} <span className="label">{menuItem.label}</span>
        </Menu.Item>
    );

    const routes = props.menuItems.map((menuItem, index) =>
        <Route exact
            key={index}
            path={menuItem.route}
            component={menuItem.component} />
    );

    const handleMenuClick = (event) => {
        if (!drawerCollapsed) {
            setDrawerCollapsed(true);
        }
        const parentKey = event.key.substr(0, event.key.lastIndexOf('/'));
        setSelectedItems([ parentKey, event.key ]);
        history.push(event.key);
    };

    return (
        <div {...swipeProps} style={{ height: '100%' }}>
            <Layout style={{ height: '100%' }}>
                <Sider
                    collapsible
                    collapsed={siderCollapsed}
                    onCollapse={setSiderCollapsed}
                    collapsedWidth="60"
                    breakpoint="sm"
                    width="12rem"
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
                    padding: '0 24px 24px'
                }}>
                    <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
                        <Switch>
                            {routes}
                            <Route render={() => <Redirect to={props.menuItems[0].route} />} />
                        </Switch>
                    </Content>
                </Layout>
            </Layout>

            <div className="drawerWrapper"></div>

            <Drawer
                placement="left"
                visible={!drawerCollapsed}
                closable={false}
                key="left"
                mask="true"
                width="200"
                style={{ paddingTop: '3rem' }}
                bodyStyle={{ padding: 0 }}
                getContainer=".drawerWrapper"
            >
                <Menu
                    theme="dark"
                    selectedKeys={selectedItems}
                    mode="inline"
                    onClick={handleMenuClick}
                >
                    {menuLinks}
                </Menu>
            </Drawer>

            <SiderButton
                collapsed={drawerCollapsed}
                handleClick={() => setDrawerCollapsed(!drawerCollapsed)}
            />
        </div>
    );
}

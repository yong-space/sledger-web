import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import {
    useHistory, Switch, Route, Redirect,
} from 'react-router-dom';

import {
    Layout, Menu, Drawer,
} from 'antd';
import { useSwipeable } from 'react-swipeable';
import styled from 'styled-components';
import SiderButton from './SiderButton';
import Atom from './Atom';
import AntIcon from './AntIcon';

const Styled = styled.div`
    height: 100%;
    .drawerWrapper .ant-menu-item {
        height: 3.5rem;
        display: flex;
        align-items: center;
        .label { font-size: 1.1rem }
    }
    .ant-layout-content {
        @media only screen and (max-width: 549px) {
            padding: 0.7rem !important
        }
    }
    .ant-layout-sider {
        overflow: auto;
        height: 100vh;
        position: fixed;
        left: 0;
    }
    .ant-layout { transition: all 0.2s }
`;

export default (props) => {
    const history = useHistory();
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
        },
    });

    const closeDrawer = (event) => {
        if (event.target.className === 'ant-drawer-mask') {
            setDrawerCollapsed(true);
        }
    };

    useEffect(() => {
        document.querySelector('.drawerWrapper')?.addEventListener('touchend', closeDrawer);
        return () => document.querySelector('.drawerWrapper')?.removeEventListener('touchend', closeDrawer);
        // eslint-disable-next-line
    }, []);

    const menuLinks = (size = 16) => props.menuItems.map((menuItem) => (
        <Menu.Item key={menuItem.route}>
            <AntIcon i={menuItem.icon} size={size} /> <span className="label">{menuItem.label}</span>
        </Menu.Item>
    ));

    const { menuItems } = props;
    const routes = menuItems.map((menuItem) => (
        <Route
            exact
            key={menuItem.route}
            path={menuItem.route}
            component={menuItem.component}
        />
    ));

    const handleMenuClick = (event) => {
        if (!drawerCollapsed) {
            setDrawerCollapsed(true);
        }
        const parentKey = event.key.substr(0, event.key.lastIndexOf('/'));
        setSelectedItems([ parentKey, event.key ]);
        history.push(event.key);
    };

    return (
        <Styled {...swipeProps}>
            <Layout>
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
                        {menuLinks()}
                    </Menu>
                </Sider>
                <Layout style={{ marginLeft: siderCollapsed ? '4rem' : '12rem' }}>
                    <Content>
                        <Switch>
                            {routes}
                            <Route render={() => <Redirect to={props.menuItems[0].route} />} />
                        </Switch>
                    </Content>
                </Layout>

                <div className="drawerWrapper" />

                <Drawer
                    placement="left"
                    visible={!drawerCollapsed}
                    closable={false}
                    key="left"
                    mask="true"
                    width="300"
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
                        {menuLinks(18)}
                    </Menu>
                </Drawer>

                <SiderButton
                    collapsed={drawerCollapsed}
                    handleClick={() => setDrawerCollapsed(!drawerCollapsed)}
                />
            </Layout>
        </Styled>
    );
};

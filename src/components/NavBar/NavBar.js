import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
    Avatar, Button, Menu, Drawer, Divider, Dropdown,
} from 'antd';
import {
    AiOutlineDashboard, AiOutlineUser, AiOutlineLogout, AiOutlineMenu, AiOutlinePieChart,
    AiOutlineBarChart, AiOutlineAccountBook,
} from 'react-icons/ai';
import { IoIosSettings } from 'react-icons/io';
import { BsLightning } from 'react-icons/bs';
import { TiDocumentText } from 'react-icons/ti';
import { FaRegCreditCard, FaMoneyBillAlt } from 'react-icons/fa';
import { MdBackup } from 'react-icons/md';
import authServices from '../Login/AuthServices';
import Atom from '../Common/Atom';
import AntIcon from '../Common/AntIcon';
import logoWhite from '../../assets/logo-white.svg';
import {
    LoginDescription, LoginStatus, Logo, Styled,
} from './NavBar.styles';

export default () => {
    const history = useHistory();
    const location = useLocation();
    const [ selectedItems, setSelectedItems ] = useRecoilState(Atom.selectedNavItems);
    const [ drawerVisible, setDrawerVisible ] = useState(false);
    const { isAdmin, getProfile, logout } = authServices();

    const getMenuItems = () => {
        const menuItems = [
            {
                label: 'Dashboard',
                icon: AiOutlineDashboard,
                route: '/dash',
                children: [
                    { label: 'Summary', icon: AiOutlinePieChart, route: '/dash/summary' },
                    { label: 'Balance History', icon: AiOutlineBarChart, route: '/dash/balance-history' },
                ],
            },
            { label: 'Transactions', icon: TiDocumentText, route: '/transactions' },
            {
                label: 'Settings',
                icon: IoIosSettings,
                route: '/settings',
                children: [
                    { label: 'Profile', icon: AiOutlineUser, route: '/settings/profile' },
                    { label: 'Cash Accounts', icon: FaMoneyBillAlt, route: '/settings/cash-accounts' },
                    { label: 'Credit Cards', icon: FaRegCreditCard, route: '/settings/credit-cards' },
                    { label: 'Backup', icon: MdBackup, route: '/settings/backup' },
                ],
            },
        ];
        if (isAdmin()) {
            menuItems.push(
                {
                    label: 'Admin',
                    icon: BsLightning,
                    route: '/admin',
                    children: [
                        { label: 'Account Types', icon: AiOutlineAccountBook, route: '/admin/account-types' },
                    ],
                },
            );
        }
        return menuItems;
    };

    const closeDrawer = () => setDrawerVisible(false);

    const handleMenuClick = (event) => {
        closeDrawer();
        if (event.keyPath && event.keyPath.length > 1) {
            setSelectedItems(event.keyPath);
        } else {
            const topLevel = getMenuItems().filter((i) => i.route === event.key)[0];
            if (topLevel.children) {
                setSelectedItems([ event.key, topLevel.children[0].route ]);
            } else {
                setSelectedItems([ event.key ]);
            }
        }
        history.push(event.key);
    };

    const menuLinks = (desktop) => getMenuItems().map((menuItem) => {
        if (desktop && menuItem.children) {
            const childMenus = menuItem.children.map((child) => (
                <Menu.Item key={child.route}>
                    <AntIcon i={child.icon} /> {child.label}
                </Menu.Item>
            ));
            return (
                <Menu.SubMenu
                    key={menuItem.route}
                    title={menuItem.label}
                    icon={<AntIcon i={menuItem.icon} />}
                    onTitleClick={handleMenuClick}
                    popupClassName="x"
                >
                    {childMenus}
                </Menu.SubMenu>
            );
        }
        return (
            <Menu.Item key={menuItem.route} icon={<AntIcon i={menuItem.icon} />}>
                {menuItem.label}
            </Menu.Item>
        );
    });

    useEffect(() => {
        const menuItems = getMenuItems();
        const menuMap = [
            ...menuItems.map((i) => [ i.route ]),
            ...menuItems.filter((i) => i.children).map((i) => (
                i.children.map((c) => [ c.route, i.route ])
            ).flat()),
        ].reduce((obj, item) => {
            obj[item[0]] = item;
            return obj;
        }, {});

        if (Object.keys(menuMap).indexOf(location.pathname) > -1) {
            setSelectedItems(menuMap[location.pathname]);
        }

        window.addEventListener('resize', closeDrawer);
        return () => window.removeEventListener('resize', closeDrawer);
        // eslint-disable-next-line
    }, [ location.pathname ]);

    const avatar = (
        <LoginDescription>
            <Avatar icon={<AntIcon i={AiOutlineUser} />} />
            {getProfile()?.fullName || ''}
        </LoginDescription>
    );

    const logoutButton = (
        <Button
            type="danger"
            icon={<AntIcon i={AiOutlineLogout} />}
            onClick={logout}
            className="logout-button"
        >
            Logout
        </Button>
    );

    const logoutMenu = (
        <Menu>
            <Menu.Item style={{ color: 'grey' }}>
                v{process.env.REACT_APP_VERSION}
            </Menu.Item>
            <Menu.Item>
                {logoutButton}
            </Menu.Item>
        </Menu>
    );

    const avatarDesktop = (
        <Dropdown overlay={logoutMenu} overlayClassName="logout-menu">
            {avatar}
        </Dropdown>
    );

    const avatarMobile = (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {avatar}
                {logoutButton}
            </div>
            <span style={{ color: 'grey' }}>
                v{process.env.REACT_APP_VERSION}
            </span>
        </>
    );

    return (
        <Styled>
            <div>
                <Logo href="/">
                    <img src={logoWhite} alt="Sledger" />
                </Logo>

                <Menu
                    className="desktop"
                    theme="dark"
                    mode="horizontal"
                    onClick={handleMenuClick}
                    selectedKeys={selectedItems}
                    style={{ width: '80vw' }}
                    getPopupContainer={(item) => item.parentElement}
                >
                    {menuLinks(true)}
                </Menu>
            </div>
            <LoginStatus className="desktop">
                {avatarDesktop}
            </LoginStatus>
            <Button
                style={{ margin: '.5rem' }}
                className="mobile"
                onClick={() => setDrawerVisible(!drawerVisible)}
            >
                <AntIcon i={AiOutlineMenu} />
            </Button>
            <Drawer
                placement="top"
                visible={drawerVisible}
                closable={false}
                key="top"
                mask="false"
                drawerStyle={{ marginTop: '3rem' }}
                height="auto"
            >
                <Menu
                    theme="dark"
                    mode="vertical"
                    onClick={handleMenuClick}
                    selectedKeys={selectedItems}
                >
                    {menuLinks(false)}
                </Menu>
                <Divider />
                {avatarMobile}
            </Drawer>
        </Styled>
    );
};

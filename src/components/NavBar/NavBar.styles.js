import { Layout } from 'antd';
import styled from 'styled-components';

const Styled = styled(Layout.Header)`
    display: flex;
    justify-content: space-between;
    height: 3rem;
    padding: 0;
    position: fixed;
    width: 100vw;
    z-index: 999999;

    .main { width: 100% }

    @media (max-width: 767px) {
        .desktop { display: none }
    }
    @media (min-width: 768px) {
        .mobile { display: none }
    }

    .logout-menu {
        top: 3rem !important;
        left: auto !important;
        right: 0 !important;

        .logout-button {
            font-weight: bold
        }

        .ant-dropdown-menu-item {
            cursor: default;
        }

        .ant-dropdown-menu-item-active:hover {
            background-color: transparent;
        }
    }

    .ant-menu-dark.ant-menu-horizontal {
        &>.ant-menu-submenu-horizontal, &.ant-menu-horizontal, li.ant-menu-item {
            height: 3rem;
            vertical-align: top;
            line-height: 3rem;
        }

        .ant-menu-submenu-selected {
            background-color: #177ddc !important
        }

        .ant-menu-submenu-open {
            color: #fff !important
        }
    }

    .ant-menu-submenu-popup {
        top: 3rem !important;
        left: 0 !important;
    }
`;

const Logo = styled.a`
    img {
        float: left;
        width: 5.3rem;
        height: 1.5rem;
        margin: 0.75rem 2rem
    }
`;

const LoginStatus = styled.div`
    margin: .5rem;
    margin-right: 1rem;
    line-height: 2rem;
`;

const LoginDescription = styled.div`
    color: #fff;
    cursor: pointer;
    white-space: nowrap;
    @media (max-width: 767px) { margin: 1rem 0 }
    @media (min-width: 768px) { display: inline }
    .ant-avatar {
        margin-top: -.2rem;
        margin-right: .5rem;
    }
`;

export { Styled, Logo, LoginStatus, LoginDescription };

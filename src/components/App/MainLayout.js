import React, { useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import authServices from '../Login/AuthServices';
import { Layout } from 'antd';
import NavBar from '../NavBar/NavBar';
import DashboardMain from '../Dashboard/DashboardMain';
import TransactionsMain from '../Transactions/TransactionsMain';
import SettingsMain from '../Settings/SettingsMain';
import AdminMain from '../Admin/AdminMain';
import './MainLayout.css';

export default () => {
    let history = useHistory();
    const { isLoginValid } = authServices();

    useEffect(() => {
        if (!isLoginValid()) {
            history.push('/login');
        }
        // eslint-disable-next-line
    }, []);

    const routes = [
        { path: '/dash', component: DashboardMain },
        { path: '/transactions', component: TransactionsMain },
        { path: '/settings', component: SettingsMain },
        { path: '/admin', component: AdminMain },
    ].map((route, index) =>
        <Route key={index} path={route.path} component={route.component} />
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <NavBar />
            <Layout style={{ marginTop: '3rem' }}>
                <Switch>
                    {routes}
                    <Route component={DashboardMain} />
                </Switch>
            </Layout>
        </Layout>
    );
};

import React, { useEffect, useState } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { Layout } from 'antd';
import authServices from '../Login/AuthServices';
import LoadingSpinner from '../Common/LoadingSpinner';
import NavBar from '../NavBar/NavBar';
import DashboardMain from '../Dashboard/DashboardMain';
import TransactionsMain from '../Transactions/TransactionsMain';
import SettingsMain from '../Settings/SettingsMain';
import AdminMain from '../Admin/AdminMain';
import './MainLayout.css';

export default () => {
    let history = useHistory();
    const { getAuthToken, setTokenState } = authServices();
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        const token = getAuthToken();
        if (token === null) {
            history.push('/login');
        } else {
            if (token.jwt) {
                setTokenState(token);
            }
            setLoading(false);
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
        loading ? <LoadingSpinner /> :
        <Layout style={{ height: '100%' }}>
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

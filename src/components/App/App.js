import React, {
    lazy, useEffect, useState,
} from 'react';
import {
    Switch, Route, useHistory,
} from 'react-router-dom';
import { Layout } from 'antd';
import authServices from '../Login/AuthServices';

const NavBar = lazy(() => import('../NavBar/NavBar'));
const DashboardMain = lazy(() => import('../Dashboard/DashboardMain'));
const TransactionsMain = lazy(() => import('../Transactions/TransactionsMain'));
const SettingsMain = lazy(() => import('../Settings/SettingsMain'));
const AdminMain = lazy(() => import('../Admin/AdminMain'));

export default () => {
    const [ loading, setLoading ] = useState(true);
    const history = useHistory();
    const { getAuthToken } = authServices();

    useEffect(() => {
        if (!getAuthToken()) {
            history.push('/login');
        }
        setLoading(false);
        // eslint-disable-next-line
    }, []);

    return !loading && (
        <Layout id="app">
            <NavBar />
            <Layout id="main">
                <Switch>
                    <Route key="transactions" path="/transactions" component={TransactionsMain} />
                    <Route key="settings" path="/settings" component={SettingsMain} />
                    <Route key="admin" path="/admin" component={AdminMain} />
                    <Route key="dash" component={DashboardMain} />
                </Switch>
            </Layout>
        </Layout>
    );
};

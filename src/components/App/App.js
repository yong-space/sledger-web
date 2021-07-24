import React, { useEffect, useState } from 'react';
import {
    Switch, Route, useHistory,
} from 'react-router-dom';
import { Layout } from 'antd';
import authServices from '../Login/AuthServices';
import NavBar from '../NavBar/NavBar';
import DashboardMain from '../Dashboard/DashboardMain';
import TransactionsMain from '../Transactions/TransactionsMain';
import SettingsMain from '../Settings/SettingsMain';
import AdminMain from '../Admin/AdminMain';

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
        <Layout style={{ minHeight: '100%' }}>
            <NavBar />
            <Layout style={{ marginTop: '3rem' }}>
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

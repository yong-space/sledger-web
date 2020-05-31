import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { Layout } from 'antd';
import NavBar from '../NavBar/NavBar';
import DashboardMain from '../Dashboard/DashboardMain';
import TransactionsMain from '../Transactions/TransactionsMain';
import SettingsMain from '../Settings/SettingsMain';
import './MainLayout.css';

export default () => {
    const routes = [
        { path: '/dash', component: DashboardMain },
        { path: '/transactions', component: TransactionsMain },
        { path: '/settings', component: SettingsMain },
    ].map((route, index) =>
        <Route key={index} path={route.path} component={withRouter(route.component)} />
    )

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <NavBar />
            <Layout>
                <Switch>
                    {routes}
                    <Route render={() => <><br />MainLayout route not Found</>} />
                </Switch>
            </Layout>
        </Layout>
    )
}

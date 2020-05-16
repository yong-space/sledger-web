import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { Layout } from 'antd';
import NavBar from '../NavBar';
import Dashboard from '../Dashboard';
import Transactions from '../Transactions';
import Settings from '../Settings';
import './main-layout.css';

export default () => {
    const routes = [
        { path: '/dash', component: Dashboard },
        { path: '/transactions', component: Transactions },
        { path: '/settings', component: Settings },
    ].map(route => <Route path={route.path} component={withRouter(route.component)} />)

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

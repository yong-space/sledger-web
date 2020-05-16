import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { Layout } from 'antd';
import NavBar from '../NavBar';
import Dashboard from '../Dashboard';
import Transactions from '../Transactions';
import './main-layout.css';

export default () => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <NavBar />
            <Layout>
                <Switch>
                    <Route path="/dash" component={withRouter(Dashboard)} />
                    <Route path="/transactions" component={withRouter(Transactions)} />
                    <Route render={() => <><br />MainLayout route not Found</>} />
                </Switch>
            </Layout>
        </Layout>
    )
}

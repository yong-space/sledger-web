import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import MainLayout from './MainLayout';
import LoginPage from '../Login/LoginPage';

export default () => (
    <BrowserRouter>
        <Switch>
            <Route path="/login" component={LoginPage} />
            <Route component={MainLayout} />
        </Switch>
    </BrowserRouter>
);

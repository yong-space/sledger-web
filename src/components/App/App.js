import React from 'react';
import { LoginProvider, IsLoggedIn } from '../Login/LoginContext';
import { BrowserRouter, Route, Switch, withRouter } from 'react-router-dom';
import MainLayout from './MainLayout'
import LoginPage from '../Login/LoginPage'

export default () => {
    if (!window.location.pathname.endsWith('/login') && !IsLoggedIn()) {
        window.location.assign('/login');
        return <i></i>;
    } else if (window.location.pathname === '/') {
        window.history.pushState({}, "", "/dash")
    }

    const mainPaths = [ "/dash", "/transactions", "/settings" ];

    return (
        <div className="App">
            <LoginProvider>
                <BrowserRouter>
                    <Switch>
                        <Route path="/login" component={withRouter(LoginPage)} />
                        <Route path={mainPaths} component={withRouter(MainLayout)} />
                        <Route render={() => <><br />Index route not Found</>} />
                    </Switch>
                </BrowserRouter>
            </LoginProvider>
        </div>
    );
}

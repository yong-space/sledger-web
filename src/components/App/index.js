import React from 'react';
import { LoginProvider, IsLoggedIn } from '../LoginContext';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import MainLayout from '../MainLayout'
import Login from '../Login'

export default () => {
    if (!window.location.pathname.endsWith('/login') && !IsLoggedIn()) {
        window.location.assign('/login');
        return <i></i>;
    } else if (window.location.pathname === '/') {
        window.history.pushState({}, "", "/dash")
    }

    return (
        <div className="App">
            <LoginProvider>
                <BrowserRouter>
                    <Switch>
                        <Route path="/login" component={Login} />
                        <Route path="/dash" component={MainLayout} />
                        <Route path="*" render={() => <><br/>Route not Found</>} />
                    </Switch>
                </BrowserRouter>
            </LoginProvider>
        </div>
    );
}

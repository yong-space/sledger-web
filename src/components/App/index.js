import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom'
import { Row, Col } from 'antd';
import Dashboard from '../Dashboard'
import Login from '../Login';
import NavBar from '../NavBar';
import { LoginProvider } from '../LoginContext';
import './App.css';

export default () => {
    const routing = (
        <BrowserRouter>
            <div>
                <Switch>
                    <Route exact path="/" component={Login} />
                    <Route path="/dashboard" component={Dashboard} />
                    <Route component={() => <h1>Not Found</h1>} />
                </Switch>
            </div>
        </BrowserRouter>
    );

    return (
        <div className="App">
            <LoginProvider>
                <Row>
                    <Col xs={10} md={6} offset={2}>
                        <NavBar />
                    </Col>
                </Row>
                <Row>
                    <Col xs={10} md={6} offset={2}>
                        { routing }
                    </Col>
                </Row>
            </LoginProvider>
        </div>
    );
}

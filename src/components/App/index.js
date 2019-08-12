import React from 'react';
import { Row, Col } from 'antd';
import NavBar from '../NavBar';
import { LoginProvider } from '../LoginContext';
import Routes from '../Routes';
import { useRoutes } from 'hookrouter';
import './App.css';

export default () => {
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
                        { useRoutes(Routes) || <h2>Page Not Found</h2> }
                    </Col>
                </Row>
            </LoginProvider>
        </div>
    );
}

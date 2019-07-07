import React from 'react';
import { Row, Col, Input, Button, Icon } from 'antd';
import './App.css';

function App() {
    return (
        <div className="App">
            <Row>
                <Col xs={10} md={6} offset={2}>
                    <Input
                        placeholder="Enter your username"
                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    />
                    <Input.Password
                        placeholder="Enter your password"
                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    />
                    <Button icon="login" type="primary">Login</Button>
                </Col>
            </Row>
        </div>
    );
}

export default App;

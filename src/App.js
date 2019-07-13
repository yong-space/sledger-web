import React from 'react';
import { Row, Col } from 'antd';
import Login from './Login';
import './App.css';

function App() {
    return (
        <div className="App">
            <Row>
                <Col xs={10} md={6} offset={2}>
                    <Login />
                </Col>
            </Row>
        </div>
    );
}

export default App;

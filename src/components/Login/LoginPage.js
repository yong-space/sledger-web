import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
    Layout, Button, Input, Row, Col, Form, Alert,
} from 'antd';
import {
    AiOutlineUser, AiOutlineLogin, AiOutlineLock,
} from 'react-icons/ai';
import authServices from './AuthServices';
import AntIcon from '../Common/AntIcon';
import logoWhite from '../../assets/logo-white.svg';

export default () => {
    const history = useHistory();
    const { login, getAuthToken } = authServices();
    const [ errors, setErrors ] = useState();
    const [ loading, setLoading ] = useState(false);

    useEffect(() => {
        if (!loading && getAuthToken() !== null) {
            history.push('/dash/summary');
        } else if (!getAuthToken()) {
            history.push('/login');
        }
        // eslint-disable-next-line
    }, []);

    const submitLogin = async (credentials) => {
        setErrors(undefined);

        setLoading(true);
        const state = await login(credentials);
        if (state.jwt && !state.error) {
            history.push('/dash/summary');
        } else {
            setErrors(state.error);
            setLoading(false);
        }
    };

    const handleEnter = (event) => {
        if (event.keyCode === 13) {
            submitLogin();
        }
    };

    return (
        <Layout style={{ height: '100vh', paddingTop: '20vh' }}>
            <Row justify="space-around" align="middle" gutter={[ 0, 48 ]}>
                <img src={logoWhite} alt="Sledger" style={{ height: '2.2rem' }} />
            </Row>
            <Row justify="space-around" align="middle">
                <Col xs={20} sm={16} md={12} lg={8} xl={6}>
                    <Form onFinish={submitLogin}>
                        <Form.Item
                            label="Username"
                            name="username"
                            rules={[{ required: true }]}
                        >
                            <Input
                                addonBefore={<AntIcon i={AiOutlineUser} />}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true }]}
                        >
                            <Input.Password
                                addonBefore={<AntIcon i={AiOutlineLock} />}
                                onKeyDown={handleEnter}
                            />
                        </Form.Item>

                        <Form.Item
                            wrapperCol={{
                                xs: { offset: 0 },
                                sm: { offset: 6, span: 12 },
                            }}
                        >
                            <Button
                                block
                                size="large"
                                shape="round"
                                type="primary"
                                htmlType="submit"
                                icon={<AntIcon i={AiOutlineLogin} />}
                                loading={loading}
                                aria-label="Login"
                            >
                                Login
                            </Button>
                        </Form.Item>

                        {errors && <Alert message={errors} type="error" showIcon />}
                    </Form>
                </Col>
            </Row>
        </Layout>
    );
};

import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { Layout, Button, Input, Row, Col, Form, Alert } from 'antd';
import authServices from './AuthServices';
import { AiOutlineUser, AiOutlineLogin, AiOutlineLock } from 'react-icons/ai';
import AntIcon from '../Common/AntIcon';
import logoWhite from '../../assets/logo-white.svg';

export default () => {
    let history = useHistory();
    const { login, getAuthToken } = authServices();
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ errors, setErrors ] = useState();
    const [ loading, setLoading ] = useState(false);

    useEffect(() => {
        if (!loading && getAuthToken() !== null) {
            history.push('/dash/summary');
        }
        // eslint-disable-next-line
    }, []);

    const submitLogin = async () => {
        setErrors(undefined);
        if (username.trim().length === 0 || password.trim().length === 0) {
            setErrors('Please enter both username and password');
            return;
        }
        setLoading(true);
        const state = await login(username, password);
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
    }

    return (
        <Layout style={{ height: '100vh', paddingTop: '20vh' }}>
            <Row justify="space-around" align="middle" gutter={[0, 48]}>
                <img src={logoWhite} alt='Sledger' style={{ height: '2.2rem' }} />
            </Row>
            <Row justify="space-around" align="middle">
                <Col xs={20} sm={16} md={12} lg={8} xl={6}>
                    <Form>
                        <Form.Item>
                            <Input
                                placeholder='Username'
                                onChange={e => setUsername(e.target.value)}
                                addonBefore={<AntIcon i={AiOutlineUser} />}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Input.Password
                                placeholder='Password'
                                onChange={e => setPassword(e.target.value)}
                                addonBefore={<AntIcon i={AiOutlineLock} />}
                                onKeyDown={handleEnter}
                            />
                        </Form.Item>

                        <Form.Item
                            wrapperCol={{
                                xs: { offset: 0 },
                                sm: { offset: 6, span: 12 }
                            }}
                        >
                            <Button
                                block={true}
                                size="large"
                                shape="round"
                                type="primary"
                                icon={<AntIcon i={AiOutlineLogin} />}
                                onClick={submitLogin}
                                loading={loading}
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

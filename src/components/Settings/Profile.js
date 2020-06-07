import React, { useState } from 'react';
import { Button, Form, Input, Row, Col } from 'antd';
import { Typography } from 'antd';
import {
    UserOutlined, LockOutlined
} from '@ant-design/icons';
import { lime, volcano } from '@ant-design/colors';
import API from '../Common/API';
import Notification from '../Common/Notification';
import useLogin from '../Login/LoginHook';

export default () => {
    const { Title } = Typography;
    const { getProfile, setProfile } = useLogin();
    const [ savingProfile, setSavingProfile ] = useState(false);
    const [ savingPassword, setSavingPassword ] = useState(false);
    const { updateProfile, updatePassword } = API();
    const { showSuccess, showError } = Notification();
    const [ passwordForm ] = Form.useForm();

    const layoutProps = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
        hideRequiredMark: true
    };

    const tailLayout = {
        wrapperCol: {
            xs: { offset: 0 },
            sm: { offset: 8, span: 16 }
        }
    };

    const submitUpdateProfile = async (values) => {
        setSavingProfile(true);
        try {
            const response = await updateProfile(values);
            setProfile(response);
            showSuccess('Profile Updated');
        } catch(e) {
            showError('Unable to Update Profile', e.message);
        }
        setSavingProfile(false);
    };

    const submitUpdatePassword = async (values) => {
        setSavingPassword(true);

        if (values.newPassword1 !== values.newPassword2) {
            showError('Unable to Update Password', 'Passwords do not match');
            setSavingPassword(false);
            return;
        }

        try {
            const passwordRequest = {
                oldPassword: values.oldPassword,
                newPassword: values.newPassword1
            };
            await updatePassword(passwordRequest);
            passwordForm.resetFields();
            showSuccess('Password Updated');
        } catch(e) {
            showError('Unable to Update Password', e.message);
        }
        setSavingPassword(false);
    }

    const profileFormProps = {
        ...layoutProps,
        initialValues: getProfile(),
        onFinish: submitUpdateProfile
    };

    const passwordFormProps = {
        ...layoutProps,
        form: passwordForm,
        onFinish: submitUpdatePassword
    };

    const emailRegex = /[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[A-Z0-9-]+\.)+[A-Z]{2,6}/i
    const emailRule = { pattern: emailRegex, message: 'Invalid Email' };
    const requiredRule = { required: true, message: 'Required Field' };
    const min3Rule = { type: 'string', min: 3, message: 'Minimum 3 characters' };
    const min8Rule = { type: 'string', min: 8, message: 'Minimum 8 characters' };
    const passwordsMatchRule = ({ getFieldValue }) => ({
        validator(rule, value) {
            if (!value || getFieldValue('newPassword1') === value) {
                return Promise.resolve();
            }
            return Promise.reject('Passwords do not match');
        }
    });

    return (
        <>
            <Title level={4}>Profile</Title>
            <Row>
                <Col xs={24} md={18} lg={12} xl={10}>
                    <Form {...profileFormProps}>
                        <Form.Item
                            label="Username"
                            name="username"
                            rules={[requiredRule]}
                        >
                            <Input placeholder="Username" />
                        </Form.Item>
                        <Form.Item
                            label="Full Name"
                            name="fullName"
                            rules={[requiredRule, min3Rule]}
                        >
                            <Input placeholder="Full Name" />
                        </Form.Item>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[requiredRule, emailRule]}
                        >
                            <Input placeholder="Email" />
                        </Form.Item>
                        <Form.Item {...tailLayout}>
                            <Button
                                shape="round"
                                type="primary"
                                icon={<UserOutlined />}
                                htmlType="submit"
                                loading={savingProfile}
                                style={{ background: lime[8], borderColor: lime[7] }}
                            >
                                Update Profile
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
            <Title level={4}>Password</Title>
            <Row>
                <Col xs={24} md={18} lg={12} xl={10}>
                    <Form {...passwordFormProps}>
                        <Form.Item
                            label="Current Password"
                            name="oldPassword"
                            rules={[requiredRule]}
                        >
                            <Input.Password placeholder="Current Password" />
                        </Form.Item>
                        <Form.Item
                            label="New Password"
                            name="newPassword1"
                            rules={[requiredRule, min8Rule]}
                        >
                            <Input.Password placeholder="New Password" />
                        </Form.Item>
                        <Form.Item
                            label="Repeat Password"
                            name="newPassword2"
                            rules={[requiredRule, min8Rule, passwordsMatchRule]}
                        >
                            <Input.Password placeholder="Repeat Password" />
                        </Form.Item>
                        <Form.Item {...tailLayout}>
                            <Button
                                shape="round"
                                type="primary"
                                icon={<LockOutlined />}
                                htmlType="submit"
                                loading={savingPassword}
                                style={{ background: volcano[8], borderColor: volcano[7] }}
                            >
                                Update Password
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </>
    );
}

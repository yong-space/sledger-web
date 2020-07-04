import React, { useState } from 'react';
import { Button, Form, Input, Row, Col } from 'antd';
import { Typography } from 'antd';
import { AiOutlineUser, AiOutlineLock } from 'react-icons/ai';
import AntIcon from '../Common/AntIcon';
import { lime, volcano } from '@ant-design/colors';
import API from '../Common/API';
import Notification from '../Common/Notification';
import authServices from '../Login/AuthServices';
import { baseProps, rules, TailFormItem } from '../Common/FormProps';

export default () => {
    const { Title } = Typography;
    const { getProfile, setProfile } = authServices();
    const [ savingProfile, setSavingProfile ] = useState(false);
    const [ savingPassword, setSavingPassword ] = useState(false);
    const [ passwordForm ] = Form.useForm();
    const { updateProfile, updatePassword } = API();

    const submitUpdateProfile = async (values) => {
        setSavingProfile(true);
        try {
            setProfile(await updateProfile(values));
            Notification.showSuccess('Profile Updated');
        } catch(e) {
            Notification.showError('Unable to Update Profile', e.message);
        }
        setSavingProfile(false);
    };

    const submitUpdatePassword = async (values) => {
        setSavingPassword(true);

        if (values.newPassword1 !== values.newPassword2) {
            Notification.showError('Unable to Update Password', 'Passwords do not match');
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
            Notification.showSuccess('Password Updated');
        } catch(e) {
            Notification.showError('Unable to Update Password', e.message);
        }
        setSavingPassword(false);
    }

    const profileFormProps = {
        ...baseProps,
        initialValues: getProfile(),
        onFinish: submitUpdateProfile
    };

    const passwordFormProps = {
        ...baseProps,
        form: passwordForm,
        onFinish: submitUpdatePassword
    };

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
                            rules={[ rules.requiredRule ]}
                        >
                            <Input placeholder="Username" />
                        </Form.Item>
                        <Form.Item
                            label="Full Name"
                            name="fullName"
                            rules={[ rules.requiredRule, rules.min3Rule ]}
                        >
                            <Input placeholder="Full Name" />
                        </Form.Item>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[ rules.requiredRule, rules.emailRule ]}
                        >
                            <Input placeholder="Email" />
                        </Form.Item>
                        <TailFormItem>
                            <Button
                                shape="round"
                                type="primary"
                                icon={<AntIcon i={AiOutlineUser} />}
                                htmlType="submit"
                                loading={savingProfile}
                                style={{ background: lime[8], borderColor: lime[7] }}
                            >
                                Update Profile
                            </Button>
                        </TailFormItem>
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
                            rules={[ rules.requiredRule ]}
                        >
                            <Input.Password placeholder="Current Password" />
                        </Form.Item>
                        <Form.Item
                            label="New Password"
                            name="newPassword1"
                            rules={[ rules.requiredRule, rules.min8Rule ]}
                        >
                            <Input.Password placeholder="New Password" />
                        </Form.Item>
                        <Form.Item
                            label="Repeat Password"
                            name="newPassword2"
                            rules={[ rules.requiredRule, rules.min8Rule, passwordsMatchRule ]}
                        >
                            <Input.Password placeholder="Repeat Password" />
                        </Form.Item>
                        <TailFormItem>
                            <Button
                                shape="round"
                                type="primary"
                                icon={<AntIcon i={AiOutlineLock} />}
                                htmlType="submit"
                                loading={savingPassword}
                                style={{ background: volcano[8], borderColor: volcano[7] }}
                            >
                                Update Password
                            </Button>
                        </TailFormItem>
                    </Form>
                </Col>
            </Row>
        </>
    );
}

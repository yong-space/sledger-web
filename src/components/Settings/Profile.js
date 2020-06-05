import React, { useState } from 'react';
import { Button, Form, Input, Row, Col } from 'antd';
import { Typography } from 'antd';
import {
    SaveOutlined
} from '@ant-design/icons';
import API from '../Common/API';

export default () => {
    const { Title } = Typography;
    const [ saving, setSaving ] = useState(false);
    const { saveProfile } = API();

    const initialValues = {
        name: 'John Doe',
        email: 'john@doe.com'
    }

    const onFinish = async (values) => {
        setSaving(true);

        const user = {};
        if (values.name) { user.fullName = values.name }
        if (values.email) { user.email = values.email }
        if (values.oldPassword && (values.newPassword1 || values.newPassword2)) {
            if (values.newPassword1 !== values.newPassword2) {
                console.log('Passwords do not match');
                setSaving(false);
                return false;
            }
            user.oldPassword = values.oldPassword;
            user.newPassword = values.newPassword1;
        }

        const response = await saveProfile(user);
        if (!response.success) {
            console.log('Failed!')
        } else {
            console.log('Success!')
        }
        setSaving(false);
    };

    const formProps = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
        initialValues,
        onFinish
    };

    return (
        <>
            <Title level={4}>Profile</Title>
            <Row>
                <Col xs={24} md={18} lg={12} xl={10}>
                    <Form {...formProps}>
                        <Form.Item label="Name" name="name">
                            <Input placeholder="Name" />
                        </Form.Item>
                        <Form.Item label="Email" name="email">
                            <Input placeholder="Email" />
                        </Form.Item>
                        <Form.Item label="Current Password" name="oldPassword">
                            <Input.Password placeholder="Current Password" />
                        </Form.Item>
                        <Form.Item label="New Password" name="newPassword1">
                            <Input.Password placeholder="New Password" />
                        </Form.Item>
                        <Form.Item label="Repeat New Password" name="newPassword2">
                            <Input.Password placeholder="Repeat New Password" />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                shape="round"
                                type="primary"
                                icon={<SaveOutlined />}
                                htmlType="submit"
                                loading={saving}
                            >
                                Save
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </>
    );
}

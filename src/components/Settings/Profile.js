import React, { useState } from 'react';
import { Button, Form, Input, Row, Col } from 'antd';
import { Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import API from '../Common/API';

export default () => {
    const { Title } = Typography;
    const [ saving, setSaving ] = useState(false);
    const [ firstName, setFirstName ] = useState('John');
    const [ lastName, setLastName ] = useState('Doe');
    const { getX, getY } = API()
    const saveProfile = async () => {
        setSaving(true);
        const x = await getX();
        const y = await getY();
        setFirstName(x.x);
        setLastName(y.x);
        setSaving(false);
    };

    return (
        <>
            <Title level={4}>Profile</Title>
            <Row>
                <Col xs={24} md={18} lg={12} xl={10}>
                    <Form>
                        <Form.Item label="First Name">
                            <Input placeholder="First Name" value={firstName} />
                        </Form.Item>
                        <Form.Item label="Last Name">
                            <Input placeholder="Last Name" value={lastName} />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                shape="round"
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={() => saveProfile()}
                                loading={saving}>
                                Save
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </>
    );
}

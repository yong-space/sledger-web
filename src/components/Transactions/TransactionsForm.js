import React, { useEffect, useState } from 'react';
import { Drawer, Button, Typography, Form, Input } from 'antd';
import { baseProps, rules, TailFormItem } from '../Common/FormProps';
import AntIcon from '../Common/AntIcon';
import { TiDocumentText } from 'react-icons/ti';

export default ({ mode, setMode }) => {
    const { Title } = Typography;
    const [ label, setLabel ] = useState();
    const [ loading, setLoading ] = useState(false);

    useEffect(() => {
        if (!mode) {
            return;
        }
        setLabel(mode.substr(0, 1).toUpperCase() + mode.substr(1));
    }, [ mode ]);

    const formProps = () => ({
        ...baseProps,
        initialValues: {
        },
        onFinish: () => {
            setLoading(true);
            setMode(false);
            setLoading(false);
        }
    });

    return (
        <Drawer
            placement="right"
            visible={mode}
            closable={false}
            mask={true}
            width="500"
            style={{ paddingTop: '3rem' }}
        >
            <Title level={4}>{label} Transaction</Title>

            <Form {...formProps()}>
                <Form.Item
                    label="Bank"
                    name="accountTypeId"
                >
                    <Input placeholder="Account" />
                </Form.Item>
                <Form.Item
                    label="Name"
                    name="accountName"
                    rules={[rules.requiredRule]}
                >
                    <Input placeholder="Account Name" />
                </Form.Item>
                <TailFormItem>
                    <Button
                        type="primary"
                        icon={<AntIcon i={TiDocumentText} />}
                        htmlType="submit"
                        loading={loading}
                    >
                        Add Account
                    </Button>
                </TailFormItem>
            </Form>
        </Drawer>
    );
};

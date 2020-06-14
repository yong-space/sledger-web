import React, { useEffect, useState } from 'react';
import {
    Typography, Table, Button, Form, Input, Select, Row, Col, Switch, Modal
} from 'antd';
import { AiOutlineAccountBook, AiFillWarning } from 'react-icons/ai';
import Notification from '../Common/Notification';
import API from '../Common/API';
import Icon from '../Common/Icon';

export default () => {
    const { Title } = Typography;
    const [ accountTypes, setAccountTypes ] = useState();
    const [ loading, setLoading ] = useState(true);
    const [ savingAccountType, setSavingAccountType ] = useState(false);
    const [ addAccountTypeForm ] = Form.useForm();

    const submitAddAccountType = async (values) => {
        setSavingAccountType(true);
        try {
            const accountType = await API.addAccountType(values);
            setAccountTypes(existing => [
                ...existing, { ...accountType, key: existing.length + 1 }
            ]);
            addAccountTypeForm.resetFields();
            Notification.showSuccess('Account Type Added');
        } catch(e) {
            Notification.showError('Unable to add account type', e.message);
        }
        setSavingAccountType(false);
    };

    const submitDeleteAccountType = async (accountTypeId) => {
        try {
            await API.deleteAccountType(accountTypeId);
            setAccountTypes(existing =>
                existing.filter(a => a.accountTypeId !== accountTypeId));
            Notification.showSuccess('Account Type Deleted');
        } catch(e) {
            Notification.showError('Unable to delete account type', e.message);
        }
    };

    const refreshAccountTypes = async () => {
        setLoading(true);
        try {
            const response = await API.getAccountTypes();
            setAccountTypes(response.map((entry, index) => ({ ...entry, key: index })));
        } catch(e) {
            Notification.showError('Unable to load account types', e.message);
        }
        setLoading(false);
    }

    useEffect(() => {
        refreshAccountTypes();
    }, []);

    const checkboxRenderer = (text, record) =>
        <Switch checked={record.importEnabled} disabled={true} />;

    const confirmDelete = (record) => Modal.confirm({
        title: `Confirm deletion of ${record.accountTypeName}?`,
        icon: <Icon i={<AiFillWarning style={{ color: 'red' }} />} />,
        onOk: () => new Promise((resolve) => {
            submitDeleteAccountType(record.accountTypeId).then(() => resolve());
        })
    });

    const deleteButton = (text, record) =>
        <Button danger onClick={() => confirmDelete(record)}>Delete</Button>;

    const columns = [
        { dataIndex: 'accountTypeId', title: 'ID' },
        { dataIndex: 'accountTypeClass', title: 'Class' },
        { dataIndex: 'accountTypeName', title: 'Name' },
        {
            dataIndex: 'importEnabled',
            title: 'Import Enabled',
            render: checkboxRenderer,
            width: 50
        },
        {
            title: 'Delete',
            width: 50,
            render: deleteButton
        }
    ];

    const tailLayout = {
        wrapperCol: {
            xs: { offset: 0 },
            sm: { offset: 8, span: 16 }
        }
    };

    const addAccountTypeFormProps = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
        hideRequiredMark: true,
        form: addAccountTypeForm,
        initialValues: {
            accountTypeClass: "Cash",
            importEnabled: false
        },
        onFinish: submitAddAccountType
    };

    const requiredRule = { required: true, message: 'Required Field' };

    return (
        <>
            <Title level={4}>Manage Account Types</Title>
            <Row gutter={[20, 20]}>
                <Col xs={24} md={18} xl={14}>
                    <Table
                        columns={columns}
                        dataSource={accountTypes}
                        size="small"
                        pagination={false}
                        loading={loading}
                    />
                </Col>
            </Row>

            <Title level={4}>Add Account Type</Title>
            <Row>
                <Col xs={24} md={18} lg={12} xl={10}>
                    <Form {...addAccountTypeFormProps}>
                        <Form.Item
                            label="Type"
                            name="accountTypeClass"
                        >
                            <Select>
                                <Select.Option value="Cash">
                                    Cash
                                </Select.Option>
                                <Select.Option value="CreditCard">
                                    Credit Card
                                </Select.Option>
                                <Select.Option value="Custom">
                                    Custom
                                </Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Name"
                            name="accountTypeName"
                            rules={[requiredRule]}
                        >
                            <Input placeholder="Account Type Name" />
                        </Form.Item>
                        <Form.Item
                            label="Import Enabled"
                            name="importEnabled"
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item {...tailLayout}>
                            <Button
                                shape="round"
                                type="primary"
                                icon={<Icon i={<AiOutlineAccountBook />} />}
                                htmlType="submit"
                                loading={savingAccountType}
                            >
                                Add Account Type
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </>
    );
};

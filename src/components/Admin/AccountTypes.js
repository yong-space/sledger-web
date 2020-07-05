import React, { useEffect, useState } from 'react';
import {
    Typography, Table, Button, Form, Input, Select, Row, Col, Switch, Modal, Tag
} from 'antd';
import { AiOutlineAccountBook, AiFillWarning } from 'react-icons/ai';
import Notification from '../Common/Notification';
import API from '../Common/API';
import AntIcon from '../Common/AntIcon';
import { baseProps, rules, TailFormItem } from '../Common/FormProps';

export default () => {
    const [ accountTypes, setAccountTypes ] = useState([]);
    const { Title } = Typography;
    const [ loading, setLoading ] = useState(true);
    const [ savingAccountType, setSavingAccountType ] = useState(false);
    const [ addAccountTypeForm ] = Form.useForm();
    const { getAccountTypes, addAccountType, deleteAccountType } = API();

    const submitAddAccountType = async (values) => {
        setSavingAccountType(true);
        try {
            const accountType = await addAccountType(values);
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
            await deleteAccountType(accountTypeId);
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
            const response = await getAccountTypes();
            setAccountTypes(response.map((entry, index) => ({ ...entry, key: index })));
        } catch(e) {
            Notification.showError('Unable to load account types', e.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        refreshAccountTypes();
        // eslint-disable-next-line
    }, []);

    const checkboxRenderer = (text, record) =>
        <Switch checked={record.importEnabled} disabled={true} />;

    const confirmDelete = (record) => Modal.confirm({
        title: `Confirm deletion of ${record.accountTypeName}?`,
        icon: <AntIcon i={AiFillWarning} style={{ color: 'red' }} />,
        onOk: () => new Promise((resolve) => {
            submitDeleteAccountType(record.accountTypeId).then(() => resolve());
        })
    });

    const deleteButton = (text, record) =>
        <Button danger onClick={() => confirmDelete(record)}>Delete</Button>;

    const colourTag = (text) => <Tag color={text}>{text}</Tag>;

    const columns = [
        {
            dataIndex: 'accountTypeClass',
            title: 'Type',
            sorter: {
                compare: (a, b) => a.accountTypeClass.localeCompare(b.accountTypeClass),
                multiple: 2
            },
            defaultSortOrder: 'ascend'
        },
        {
            dataIndex: 'accountTypeName',
            title: 'Bank',
            sorter: {
                compare: (a, b) => a.accountTypeName.localeCompare(b.accountTypeName),
                multiple: 1
            },
            defaultSortOrder: 'ascend'
        },
        {
            dataIndex: 'colour',
            title: 'Colour',
            render: colourTag
        },
        {
            dataIndex: 'importEnabled',
            title: 'Importable',
            render: checkboxRenderer,
            width: 50
        },
        {
            title: 'Delete',
            width: 50,
            render: deleteButton
        }
    ];

    const tagColours = [
        'magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'
    ];

    const addAccountTypeFormProps = {
        ...baseProps,
        form: addAccountTypeForm,
        initialValues: {
            accountTypeClass: "Cash",
            importEnabled: false,
            colour: tagColours[0]
        },
        onFinish: submitAddAccountType
    };

    const colourOptions = tagColours.map(colour =>
        <Select.Option value={colour} key={colour}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                    {colour.substr(0, 1).toUpperCase()}{colour.substr(1)}
                </span>
                <Tag color={colour} style={{ height: '2em', margin: 'auto 0' }}>
                    Example
                </Tag>
            </div>
        </Select.Option>
    );

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
                            label="Bank"
                            name="accountTypeName"
                            rules={[ rules.requiredRule ]}
                        >
                            <Input placeholder="Bank or issuer name.." />
                        </Form.Item>
                        <Form.Item
                            label="Colour"
                            name="colour"
                        >
                            <Select>
                                { colourOptions }
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Import Enabled"
                            name="importEnabled"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                        <TailFormItem>
                            <Button
                                shape="round"
                                type="primary"
                                icon={<AntIcon i={AiOutlineAccountBook} />}
                                htmlType="submit"
                                loading={savingAccountType}
                            >
                                Add Account Type
                            </Button>
                        </TailFormItem>
                    </Form>
                </Col>
            </Row>
        </>
    );
};

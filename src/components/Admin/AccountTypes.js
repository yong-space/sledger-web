import React, { useEffect, useState } from 'react';
import {
    Typography, Table, Button, Form, Input, Select, Row, Col, Switch, Modal, Tag
} from 'antd';
import { AiOutlineAccountBook, AiFillWarning } from 'react-icons/ai';
import styled from 'styled-components';
import Notification from '../Common/Notification';
import API from '../Common/API';
import AntIcon from '../Common/AntIcon';
import {
    baseProps, rules, TailFormItem,
} from '../Common/FormProps';

const ColouredTag = styled(Tag)`
    width: 100%;
    justify-content: center;
    text-transform: capitalize;
`;

const ColourSample = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    .ant-tag { height: 2em; margin: auto 0; }
`;

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
            setAccountTypes((existing) => [
                ...existing, { ...accountType, key: existing.length + 1 },
            ]);
            addAccountTypeForm.resetFields();
            Notification.showSuccess('Account Type Added');
        } catch (e) {
            Notification.showError('Unable to add account type', e.message);
        }
        setSavingAccountType(false);
    };

    const submitDeleteAccountType = async (id) => {
        try {
            await deleteAccountType(id);
            setAccountTypes((existing) => existing.filter((a) => a.id !== id));
            Notification.showSuccess('Account Type Deleted');
        } catch (e) {
            Notification.showError('Unable to delete account type', e.message);
        }
    };

    const refreshAccountTypes = async () => {
        setLoading(true);
        try {
            const response = await getAccountTypes();
            setAccountTypes(response.map((entry, index) => ({ ...entry, key: index })));
        } catch (e) {
            Notification.showError('Unable to load account types', e.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        refreshAccountTypes();
        // eslint-disable-next-line
    }, []);

    const checkboxRenderer = (text, record) => <Switch checked={record.importEnabled} disabled />;

    const confirmDelete = (record) => Modal.confirm({
        title: `Confirm deletion of ${record.accountTypeName}?`,
        icon: <AntIcon i={AiFillWarning} red />,
        onOk: () => new Promise((resolve) => {
            submitDeleteAccountType(record.id).then(() => resolve());
        }),
    });

    const deleteButton = (text, record) => (
        <Button danger onClick={() => confirmDelete(record)}>Delete</Button>
    );

    const columns = [
        {
            dataIndex: 'accountTypeClass',
            title: 'Type',
            sorter: {
                compare: (a, b) => a.accountTypeClass.localeCompare(b.accountTypeClass),
                multiple: 2,
            },
            defaultSortOrder: 'ascend',
        },
        {
            dataIndex: 'accountTypeName',
            title: 'Bank',
            sorter: {
                compare: (a, b) => a.accountTypeName.localeCompare(b.accountTypeName),
                multiple: 1,
            },
            defaultSortOrder: 'ascend',
        },
        {
            dataIndex: 'colour',
            title: 'Colour',
            render: (text) => <ColouredTag color={text}>{text}</ColouredTag>,
        },
        {
            dataIndex: 'importEnabled',
            title: 'Importable',
            render: checkboxRenderer,
            width: 50,
        },
        {
            title: 'Delete',
            width: 50,
            render: deleteButton,
        },
    ];

    const tagColours = [
        'Magenta',
        'Red',
        'Volcano',
        'Orange',
        'Gold',
        'Lime',
        'Green',
        'Cyan',
        'Blue',
        'Geekblue',
        'Purple',
    ];

    const addAccountTypeFormProps = {
        ...baseProps,
        form: addAccountTypeForm,
        initialValues: {
            accountTypeClass: 'Cash',
            importEnabled: false,
            colour: tagColours[0],
        },
        onFinish: submitAddAccountType,
    };

    const colourOptions = tagColours.map((colour) => (
        <Select.Option value={colour} key={colour}>
            <ColourSample>
                <span>{colour}</span>
                <Tag color={colour.toLowerCase()}>
                    Example
                </Tag>
            </ColourSample>
        </Select.Option>
    ));

    return (
        <>
            <Title level={4}>Manage Account Types</Title>
            <Row gutter={[ 20, 20 ]}>
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
                                type="primary"
                                icon={<AntIcon i={AiOutlineAccountBook} />}
                                htmlType="submit"
                                loading={savingAccountType}
                                className="success"
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

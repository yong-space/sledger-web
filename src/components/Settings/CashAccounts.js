import React, { useState, useEffect } from 'react';
import { Typography, Collapse, Form, Select, Input, Switch, Button, Tag, Row, Col } from 'antd';
import { FaMoneyBillAlt } from 'react-icons/fa';
import { AiFillCaretUp, AiFillCaretDown } from 'react-icons/ai';
import AntIcon from '../Common/AntIcon';
import Notification from '../Common/Notification';
import API from '../Common/API';
import LoadingSpinner from '../Common/LoadingSpinner';
import { baseProps, inlineProps, rules, TailFormItem } from '../Common/FormProps';

export default () => {
    const [ loading, setLoading ] = useState(true);
    const [ addFormLoading, setAddFormLoading ] = useState(false);
    const [ editFormLoading, setEditFormLoading ] = useState(false);
    const [ accounts, setAccounts ] = useState([]);
    const [ accountTypes, setAccountTypes ] = useState([]);
    const { Title } = Typography;
    const { Panel } = Collapse;
    const { getAccountTypes } = API();
    const [ addForm ] = Form.useForm();

    const refreshAccountTypes = () => new Promise(async resolve => {
        try {
            const response = (await getAccountTypes())
                .filter(entry => entry.accountTypeClass === 'Cash')
                .map((entry, index) => ({ ...entry, key: index }))
                .sort((a, b) => a.accountTypeName > b.accountTypeName ? 1 : -1);
            setAccountTypes(response);
        } catch(e) {
            Notification.showError('Unable to load account types', e.message);
        }
        resolve();
    });

    const refreshAccounts = () => new Promise(async resolve => {
        try {
            const response = [
                { sortOrder: 3, accountId: 12, accountTypeId: 34, accountName: '360', hidden: false },
                { sortOrder: 2, accountId: 44, accountTypeId: 41, accountName: 'StarSaver', hidden: true },
                { sortOrder: 1, accountId: 7, accountTypeId: 38, accountName: 'One', hidden: false },
                { sortOrder: 0, accountId: 9, accountTypeId: 36, accountName: 'GrabPay', hidden: false },
            ].sort((a, b) => (a.sortOrder > b.sortOrder) ? 1 : -1);
            setAccounts(response);
        } catch(e) {
            Notification.showError('Unable to load account types', e.message);
        }
        resolve();
    });

    useEffect(() => {
        setLoading(true);
        Promise.all([ refreshAccountTypes(), refreshAccounts() ])
            .then(() => setLoading(false));
        // eslint-disable-next-line
    }, []);

    const getAccountType = (id) => accountTypes.filter(a => a.accountTypeId === id)[0];

    const getHeader = ({ color, accountTypeId, accountName, hidden }) => {
        const accountType = getAccountType(accountTypeId);
        return (
            <>
                <Tag color={accountType.colour}>{accountType.accountTypeName}</Tag> <b>{accountName}</b>
                { hidden && <Tag style={{ marginLeft: '1em' }}>Hidden</Tag> }
            </>
        );
    };

    const moveSort = (index, newIndex) => {
        const workingAccounts = [ ...accounts ];
        workingAccounts.filter(a => a.sortOrder === index)[0].sortOrder = -1;
        workingAccounts.filter(a => a.sortOrder === newIndex)[0].sortOrder = index;
        workingAccounts.filter(a => a.sortOrder === -1)[0].sortOrder = newIndex;
        workingAccounts.sort((a, b) => (a.sortOrder > b.sortOrder) ? 1 : -1);
        setAccounts(workingAccounts);
    };

    const sortUp = (event, index) => {
        event.stopPropagation();
        moveSort(index, index - 1);
    };

    const sortDown = (event, index) => {
        event.stopPropagation();
        moveSort(index, index + 1);
    };

    const getReorderButtons = (index) => (
        <>
            <Button
                shape="round"
                type="primary"
                size="small"
                icon={<AntIcon i={AiFillCaretUp} />}
                style={{ marginRight: '0.5em' }}
                onClick={event => sortUp(event, index)}
                disabled={index === 0}
            />
            <Button
                shape="round"
                type="primary"
                size="small"
                icon={<AntIcon i={AiFillCaretDown} />}
                onClick={event => sortDown(event, index)}
                disabled={index === accounts.length - 1}
            />
        </>
    );

    const AccountSelector = ({ selectedId }) => {
        const options = accountTypes.map(accountType => (
            <Select.Option
                key={accountType.accountTypeId}
                value={accountType.accountTypeId}
            >
                {accountType.accountTypeName}
            </Select.Option>
        ));
        return (
            <Select defaultValue={selectedId || accountTypes[0].accountTypeId}>
                {options}
            </Select>
        );
    };

    const getPanels = () => accounts.map((account, index) => (
        <Panel header={getHeader(account)} key={index} extra={getReorderButtons(index)}>
            <Form {...editFormProps} initialValues={account}>
                <Form.Item
                    label="Bank"
                    name="accountType"
                >
                    <AccountSelector selectedId={account.accountType} />
                </Form.Item>
                <Form.Item
                    label="Name"
                    name="accountName"
                    rules={[rules.requiredRule]}
                >
                    <Input placeholder="Account Name" />
                </Form.Item>
                <Form.Item
                    label="Hidden"
                    name="hidden"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
                <Form.Item>
                    <Button
                        shape="round"
                        type="primary"
                        icon={<AntIcon i={FaMoneyBillAlt} />}
                        htmlType="submit"
                        loading={editFormLoading}
                    >
                        Save Account
                    </Button>
                </Form.Item>
            </Form>
        </Panel>
    ));

    const submitEditAccount = (values) => {
        setEditFormLoading(true);
        console.log(values);
        setEditFormLoading(false);
    };

    const editFormProps = {
        ...inlineProps,
        onFinish: submitEditAccount
    };

    const submitAddAccount = (values) => {
        setAddFormLoading(true);
        console.log(values);
        setAddFormLoading(false);
    };

    const addFormProps = {
        ...baseProps,
        form: addForm,
        initialValues: {
        },
        onFinish: submitAddAccount
    };

    return (
        loading ? <LoadingSpinner /> :
        <>
            <Title level={4}>Manage Cash Accounts</Title>
            <Row style={{ width: '100%', marginBottom: '2em' }}>
                <Collapse accordion style={{ width: '100%' }}>
                    {getPanels()}
                </Collapse>
            </Row>

            <Title level={4}>Add Cash Account</Title>
            <Row>
                <Col xs={24} md={18} lg={12} xl={10}>
                    <Form {...addFormProps}>
                        <Form.Item
                            label="Bank"
                            name="accountType"
                        >
                            <AccountSelector />
                        </Form.Item>
                        <Form.Item
                            label="Name"
                            name="accountName"
                            rules={[rules.requiredRule]}
                        >
                            <Input placeholder="Account Type Name" />
                        </Form.Item>
                        <TailFormItem>
                            <Button
                                shape="round"
                                type="primary"
                                icon={<AntIcon i={FaMoneyBillAlt} />}
                                htmlType="submit"
                                loading={addFormLoading}
                            >
                                Add Cash Account
                            </Button>
                        </TailFormItem>
                    </Form>
                </Col>
            </Row>
        </>
    );
};

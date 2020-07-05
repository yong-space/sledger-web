import React, { useState, useEffect } from 'react';
import { Typography, Collapse, Form, Select, Input, Switch, Button, Tag, Row, Col, Empty, Modal } from 'antd';
import { FaMoneyBillAlt } from 'react-icons/fa';
import { AiFillCaretUp, AiFillCaretDown, AiFillWarning } from 'react-icons/ai';
import { RiDeleteBinLine } from 'react-icons/ri';
import AntIcon from '../Common/AntIcon';
import Notification from '../Common/Notification';
import API from '../Common/API';
import LoadingSpinner from '../Common/LoadingSpinner';
import { baseProps, inlineProps, rules, TailFormItem } from '../Common/FormProps';
import styled from 'styled-components';

const EmptyBox = styled.div`
    display: flex;
    align-items: left;
    margin: 4em 0;
`;

export default () => {
    const [ loading, setLoading ] = useState(true);
    const [ sorting, setSorting ] = useState(false);
    const [ addFormLoading, setAddFormLoading ] = useState(false);
    const [ editFormLoading, setEditFormLoading ] = useState(false);
    const [ accounts, setAccounts ] = useState([]);
    const [ accountTypes, setAccountTypes ] = useState([]);
    const { Title } = Typography;
    const { Panel } = Collapse;
    const { getAccountTypes, getAccounts, addAccount, deleteAccount, updateAccount, sortAccounts } = API();
    const [ addForm ] = Form.useForm();

    const submitEditAccount = async (values) => {
        console.log(values);
        setEditFormLoading(true);
        const newAccount = {
            ...values,
            assetClass: 'cash'
        };
        try {
            const account = await updateAccount(newAccount);
            const workingAccounts = accounts.filter(a => a.accountId !== newAccount.accountId);
            workingAccounts.push(account);
            workingAccounts.sort((a, b) => (a.sortIndex > b.sortIndex) ? 1 : -1);
            setAccounts(workingAccounts);
            Notification.showSuccess('Account Edited');
        } catch(e) {
            Notification.showError('Unable to edit account', e.message);
        }
        setEditFormLoading(false);
    };

    const editFormProps = {
        ...inlineProps,
        onFinish: submitEditAccount
    };

    const submitAddAccount = async (values) => {
        setAddFormLoading(true);
        const newAccount = {
            ...values,
            assetClass: 'cash'
        };
        try {
            const account = await addAccount(newAccount);
            setAccounts(existing => [ ...existing, account ]);
            addForm.resetFields();
            Notification.showSuccess('Account Added');
        } catch(e) {
            Notification.showError('Unable to add account', e.message);
        }
        setAddFormLoading(false);
    };

    const addFormProps = () => ({
        ...baseProps,
        form: addForm,
        initialValues: {
            accountTypeId: accountTypes && accountTypes[0]?.accountTypeId
        },
        onFinish: submitAddAccount
    });

    const submitSortAccounts = async (sortedAccounts) => {
        setSorting(true);
        const accountIds = sortedAccounts.map(a => a.accountId).join();
        try {
            await sortAccounts(accountIds);
            setAccounts(sortedAccounts);
            Notification.showSuccess('Sort order saved');
        } catch(e) {
            Notification.showError('Unable to save sort order', e.message);
        }
        setSorting(false);
    };

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
            const response = (await getAccounts())
                .sort((a, b) => (a.sortIndex > b.sortIndex) ? 1 : -1);
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
        workingAccounts.filter(a => a.sortIndex === index)[0].sortIndex = -1;
        workingAccounts.filter(a => a.sortIndex === newIndex)[0].sortIndex = index;
        workingAccounts.filter(a => a.sortIndex === -1)[0].sortIndex = newIndex;
        workingAccounts.sort((a, b) => (a.sortIndex > b.sortIndex) ? 1 : -1);
        submitSortAccounts(workingAccounts);
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
                loading={sorting}
            />
            <Button
                shape="round"
                type="primary"
                size="small"
                icon={<AntIcon i={AiFillCaretDown} />}
                onClick={event => sortDown(event, index)}
                disabled={index === accounts.length - 1}
                loading={sorting}
            />
        </>
    );

    const submitDeleteAccount = async (accountId) => {
        try {
            await deleteAccount(accountId);
            const newAccounts = accounts.filter(account => account.accountId !== accountId);
            newAccounts.forEach((account, index) => account.sortIndex = index);
            setAccounts(newAccounts);
            Notification.showSuccess('Account Deleted');
        } catch(e) {
            Notification.showError('Unable to delete account', e.message);
        }
    };

    const confirmDelete = (account) => Modal.confirm({
        title: `Confirm deletion of account ${account.accountName}?`,
        icon: <AntIcon i={AiFillWarning} style={{ color: 'red' }} />,
        onOk: () => new Promise((resolve) => {
            submitDeleteAccount(account.accountId).then(() => resolve());
        })
    });

    const getAccountSelector = () => {
        const options = accountTypes.map(accountType => (
            <Select.Option
                key={accountType.accountTypeId}
                value={accountType.accountTypeId}
            >
                {accountType.accountTypeName}
            </Select.Option>
        ));
        return <Select>{options}</Select>;
    };

    const getPanels = () => accounts.map((account, index) => (
        <Panel header={getHeader(account)} key={account.accountId} extra={getReorderButtons(index)}>
            <Form {...editFormProps} initialValues={account}>
                <Form.Item name="accountId" hidden={true}>
                    <Input />
                </Form.Item>
                <Form.Item name="sortIndex" hidden={true}>
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Bank"
                    name="accountTypeId"
                >
                    {getAccountSelector()}
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
                    <div style={{ display: 'flex' }}>
                        <Button
                            shape="round"
                            type="primary"
                            icon={<AntIcon i={FaMoneyBillAlt} />}
                            htmlType="submit"
                            loading={editFormLoading}
                            style={{ marginRight: '1em' }}
                        >
                            Edit Account
                        </Button>
                        <Button
                            shape="round"
                            type="danger"
                            icon={<AntIcon i={RiDeleteBinLine} />}
                            onClick={() => confirmDelete(account)}
                        >
                            Delete Account
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Panel>
    ));

    return (
        loading ? <LoadingSpinner /> :
        <>
            <Title level={4}>Manage Cash Accounts</Title>
            {
                accounts.length === 0 ? <EmptyBox><Empty description="You do not have any cash accounts yet" /></EmptyBox> :
                    <Row style={{ width: '100%', marginBottom: '2em' }}>
                        <Collapse accordion style={{ width: '100%' }}>
                            {getPanels()}
                        </Collapse>
                    </Row>
            }

            <Title level={4}>Add Cash Account</Title>
            <Row>
                <Col xs={24} md={18} lg={12} xl={10}>
                    <Form {...addFormProps()}>
                        <Form.Item
                            label="Bank"
                            name="accountTypeId"
                        >
                            {getAccountSelector()}
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

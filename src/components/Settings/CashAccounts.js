import React, { useState, useEffect } from 'react';
import { Typography, Collapse, Form, Select, Input, Switch, Button, Tag, Spin } from 'antd';
import { FaMoneyBillAlt } from 'react-icons/fa';
import AntIcon from '../Common/AntIcon';
import Notification from '../Common/Notification';
import API from '../Common/API';

export default () => {
    const [ loading, setLoading ] = useState(true);
    const [ savingAccount, setSavingAccount ] = useState(false);
    const { Title } = Typography;
    const { Panel } = Collapse;
    const { getAccountTypes } = API();
    const [ accountTypes, setAccountTypes ] = useState([]);

    const refreshAccountTypes = async () => {
        setLoading(true);
        try {
            const response = (await getAccountTypes())
                .filter(entry => entry.accountTypeClass === 'Cash')
                .map((entry, index) => ({
                    key: index,
                    accountTypeId: entry.accountTypeId,
                    accountTypeName: entry.accountTypeName
                }));
            setAccountTypes(response);
        } catch(e) {
            Notification.showError('Unable to load account types', e.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        refreshAccountTypes();
        // eslint-disable-next-line
    }, []);

    const accounts = [
        { accountId: 1, color: 'red', accountType: 'OCBC', accountName: '360 Account', hidden: false },
        { accountId: 2, color: 'blue', accountType: 'UOB', accountName: 'One Account', hidden: false },
        { accountId: 3, color: 'yellow', accountType: 'CIMB', accountName: 'StarSaver Account', hidden: true },
        { accountId: 4, color: 'green', accountType: 'Wallet', accountName: 'GrabPay', hidden: false },
    ];

    const getDefaultKey = () => accounts[0].accountId;

    const submitSaveAccount = (values) => {
        setSavingAccount(true);
        console.log(values);
        setSavingAccount(false);
    };

    const saveAccountFormProps = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
        hideRequiredMark: true,
        onFinish: submitSaveAccount
    };

    const getHeader = ({ color, accountType, accountName }) =>
        <><Tag color={color}>{accountType}</Tag> {accountName}</>;

    const requiredRule = { required: true, message: 'Required Field' };

    const panels = accounts.map(account => (
        <Panel header={getHeader(account)} key={account.accountId}>
            <Form {...saveAccountFormProps} initialValues={account}>
                <Form.Item
                    label="Bank"
                    name="accountType"
                >
                    <Select>
                        { accountTypes.map(accountType => (
                            <Select.Option key={accountType.key} value={accountType.accountTypeId}>
                            {accountType.accountTypeName}
                            </Select.Option>
                        )) }
                    </Select>
                </Form.Item>
                <Form.Item
                    label="Name"
                    name="accountName"
                    rules={[requiredRule]}
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
                        loading={savingAccount}
                    >
                        Save Account
                    </Button>
                </Form.Item>
            </Form>
        </Panel>
    ));

    const LoadingSpinner = () => (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spin size="large" />
        </div>
    );

    return (
        loading ? <LoadingSpinner /> :
        <>
            <Title level={4}>Manage Cash Accounts</Title>

            <Collapse defaultActiveKey={getDefaultKey} accordion>
                {panels}
            </Collapse>
        </>
    );
};

import React, { useState } from 'react';
import { Typography, Collapse, Form, Select, Input, Switch, Button } from 'antd';
import { FaMoneyBillAlt } from 'react-icons/fa';
import AntIcon from '../Common/AntIcon';

export default () => {
    const [ savingAccount, setSavingAccount ] = useState(false);
    const { Title } = Typography;
    const { Panel } = Collapse;

    const accounts = [
        { accountId: 1, accountType: 'OCBC', accountName: '360 Account', hidden: false },
        { accountId: 2, accountType: 'UOB', accountName: 'One Account', hidden: false },
        { accountId: 3, accountType: 'CIMB', accountName: 'StarSaver Account', hidden: true },
        { accountId: 4, accountType: 'Wallet', accountName: 'GrabPay', hidden: false },
    ];

    const getDefaultKey = () => accounts[0].accountId;

    const submitSaveAccount = () => {
        setSavingAccount(true);
        setSavingAccount(false);
    };

    const saveAccountFormProps = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
        hideRequiredMark: true,
        onFinish: submitSaveAccount
    };

    const requiredRule = { required: true, message: 'Required Field' };

    const panels = accounts.map(account => (
        <Panel header={`${account.accountType}: ${account.accountName}`} key={account.accountId}>
            <Form {...saveAccountFormProps} initialValues={account}>
                <Form.Item
                    label="Bank"
                    name="accountType"
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
                    name="accountName"
                    rules={[requiredRule]}
                >
                    <Input placeholder="Account Name" />
                </Form.Item>
                <Form.Item
                    label="Hidden"
                    name="hidden"
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

    return (
        <>
            <Title level={4}>Manage Cash Accounts</Title>

            <Collapse defaultActiveKey={getDefaultKey} accordion>
                {panels}
            </Collapse>
        </>
    );
};

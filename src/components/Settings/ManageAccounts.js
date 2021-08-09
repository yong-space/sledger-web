import React, { useState, useEffect } from 'react';
import {
    Typography, Collapse, Form, Input, InputNumber, Switch, Button, Tag, Row, Col, Empty, Modal,
} from 'antd';
import { FaMoneyBillAlt } from 'react-icons/fa';
import {
    AiFillCaretUp, AiFillCaretDown, AiFillWarning,
} from 'react-icons/ai';
import { RiDeleteBinLine } from 'react-icons/ri';
import styled from 'styled-components';
import AntIcon from '../Common/AntIcon';
import Notification from '../Common/Notification';
import API from '../Common/API';
import LoadingSpinner from '../Common/LoadingSpinner';
import {
    wideBaseProps, inlineProps, rules, FlexDiv, TailFormItem,
} from '../Common/FormProps';
import { InlineAccountSelector } from '../Common/AccountSelector';
import AntAddon from '../Common/AntAddon';

const EmptyBox = styled.div`
    display: flex;
    align-items: left;
    margin: 4em 0;
`;

export default ({ assetClassLabel }) => {
    const assetClass = assetClassLabel.replace(/ /g, '');
    const [ loading, setLoading ] = useState(true);
    const [ sorting, setSorting ] = useState(false);
    const [ addFormLoading, setAddFormLoading ] = useState(false);
    const [ editFormLoading, setEditFormLoading ] = useState(false);
    const [ accounts, setAccounts ] = useState([]);
    const [ allAccounts, setAllAccounts ] = useState([]);
    const [ accountTypes, setAccountTypes ] = useState([]);
    const { Title } = Typography;
    const { Panel } = Collapse;
    const {
        getAccountTypes, getAccounts, addAccount, deleteAccount, updateAccount, sortAccounts,
    } = API();
    const [ addForm ] = Form.useForm();

    const submitEditAccount = async (values) => {
        setEditFormLoading(true);
        const newAccount = { ...values, assetClass };

        if (assetClass === 'CreditCard') {
            newAccount.paymentAccount = { id: newAccount.paymentAccount };
        }

        try {
            const account = await updateAccount(newAccount);
            const workingAccounts = accounts.filter((a) => a.id !== newAccount.id);
            workingAccounts.push(account);
            workingAccounts.sort((a, b) => ((a.sortIndex > b.sortIndex) ? 1 : -1));
            setAccounts(workingAccounts);
            Notification.showSuccess('Account Edited');
        } catch (e) {
            Notification.showError('Unable to edit account', e.message);
        }
        setEditFormLoading(false);
    };

    const editFormProps = {
        ...inlineProps,
        onFinish: submitEditAccount,
    };

    const submitAddAccount = async (values) => {
        setAddFormLoading(true);
        const newAccount = { ...values, assetClass };

        if (assetClass === 'CreditCard') {
            newAccount.paymentAccount = { id: newAccount.paymentAccount };
        }

        try {
            const account = await addAccount(newAccount);
            setAccounts((existing) => [ ...existing, account ]);
            addForm.resetFields();
            Notification.showSuccess('Account Added');
        } catch (e) {
            Notification.showError('Unable to add account', e.message);
        }
        setAddFormLoading(false);
    };

    const addFormProps = () => {
        const thisAccountTypes = accountTypes.filter((a) => a.accountTypeClass === assetClass);
        const initialValues = {
            accountTypeId: thisAccountTypes.length > 0 && thisAccountTypes[0].id,
        };

        if (assetClass === 'CreditCard') {
            const cashAccounts = allAccounts.filter((a) => a.accountType.accountTypeClass === 'Cash');
            initialValues.paymentAccount = cashAccounts[0].id;
            initialValues.billingCycleFirstDay = 1;
        }

        return {
            ...wideBaseProps,
            form: addForm,
            initialValues,
            onFinish: submitAddAccount,
        };
    };

    const submitSortAccounts = async (sortedAccounts) => {
        setSorting(true);
        const accountIds = sortedAccounts.map((a) => a.id).join();
        try {
            await sortAccounts(accountIds);
            setAccounts(sortedAccounts);
            Notification.showSuccess('Sort order saved');
        } catch (e) {
            Notification.showError('Unable to save sort order', e.message);
        }
        setSorting(false);
    };

    const refreshAccountTypes = () => new Promise((resolve) => {
        try {
            getAccountTypes().then((response) => {
                const sortedResponse = response
                    .map((entry, index) => ({ ...entry, key: index }))
                    .sort((a, b) => (a.accountTypeName > b.accountTypeName ? 1 : -1));
                setAccountTypes(sortedResponse);
            });
        } catch (e) {
            Notification.showError('Unable to load account types', e.message);
        }
        resolve();
    });

    const refreshAccounts = () => new Promise((resolve) => {
        try {
            getAccounts().then((response) => {
                const sortedResponse = [ ...response ]
                    .sort((a, b) => ((a.sortIndex > b.sortIndex) ? 1 : -1));
                setAllAccounts(sortedResponse);
                const typeAccounts = sortedResponse
                    .filter((account) => account.accountType.accountTypeClass === assetClass);
                setAccounts(typeAccounts);
            });
        } catch (e) {
            Notification.showError('Unable to load accounts', e.message);
        }
        resolve();
    });

    useEffect(() => {
        Promise.all([ refreshAccountTypes(), refreshAccounts() ]).then(() => {
            setLoading(false);
        });
        // eslint-disable-next-line
    }, []);

    const getAccountType = (id) => accountTypes.filter((a) => a.id === id)[0];

    const getHeader = ({ accountTypeId, accountName, hidden }) => {
        const accountType = getAccountType(accountTypeId);
        return accountType && (
            <>
                <Tag color={accountType.colour}>{accountType.accountTypeName}</Tag>
                {' '}
                <b>{accountName}</b>
                { hidden && <Tag style={{ marginLeft: '1em' }}>Hidden</Tag> }
            </>
        );
    };

    const moveSort = (index, newIndex) => {
        const workingAccounts = JSON.parse(JSON.stringify(accounts));
        workingAccounts.filter((a) => a.sortIndex === index)[0].sortIndex = -1;
        workingAccounts.filter((a) => a.sortIndex === newIndex)[0].sortIndex = index;
        workingAccounts.filter((a) => a.sortIndex === -1)[0].sortIndex = newIndex;
        workingAccounts.sort((a, b) => ((a.sortIndex > b.sortIndex) ? 1 : -1));
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
                onClick={(event) => sortUp(event, index)}
                disabled={index === 0}
                loading={sorting}
                aria-label="Move order up"
            />
            <Button
                shape="round"
                type="primary"
                size="small"
                icon={<AntIcon i={AiFillCaretDown} />}
                onClick={(event) => sortDown(event, index)}
                disabled={index === accounts.length - 1}
                loading={sorting}
                aria-label="Move order down"
            />
        </>
    );

    const submitDeleteAccount = async (id) => {
        try {
            await deleteAccount(id);
            const newAccounts = JSON.parse(JSON.stringify(accounts.filter((a) => a.id !== id)));
            newAccounts.forEach((account, index) => (account.sortIndex = index));
            setAccounts(newAccounts);
            Notification.showSuccess('Account Deleted');
        } catch (e) {
            Notification.showError('Unable to delete account', e.message);
        }
    };

    const confirmDelete = (account) => Modal.confirm({
        title: `Confirm deletion of account ${account.accountName}?`,
        icon: <AntIcon i={AiFillWarning} style={{ color: 'red' }} />,
        onOk: () => new Promise((resolve) => {
            submitDeleteAccount(account.id).then(() => resolve());
        }),
    });

    const getPanels = () => accounts
        .map((account) => ((assetClass !== 'CreditCard') ? account
            : { ...account, paymentAccount: account.paymentAccount.id }))
        .map((account, index) => (
            <Panel header={getHeader(account)} key={account.id} extra={getReorderButtons(index)}>
                <Form {...editFormProps} initialValues={{ ...account }}>
                    <Form.Item name="id" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name="sortIndex" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label={assetClass === 'Cash' ? 'Bank' : 'Issuer'}
                        name="accountTypeId"
                    >
                        <InlineAccountSelector
                            accountTypes
                            assetClass={assetClass}
                            data={accountTypes}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Name"
                        name="accountName"
                        rules={[ rules.requiredRule ]}
                    >
                        <Input placeholder={`${assetClass === 'Cash' ? 'Account' : 'Card'} Name`} />
                    </Form.Item>
                    { assetClass === 'CreditCard' && (
                        <>
                            <Form.Item
                                label="Payment Account"
                                name="paymentAccount"
                            >
                                <InlineAccountSelector
                                    assetClass="Cash"
                                    data={allAccounts}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Payment Remarks"
                                name="paymentRemarks"
                                rules={[ rules.requiredRule ]}
                            >
                                <Input placeholder="Payment Remarks" />
                            </Form.Item>
                            <Form.Item
                                label="Billing Cycle"
                                name="billingCycleFirstDay"
                                rules={[ rules.dayOfMonthRule ]}
                            >
                                <AntAddon behind label="Day of Month">
                                    <InputNumber type="number" style={{ width: '100%' }} />
                                </AntAddon>
                            </Form.Item>
                        </>
                    )}
                    <Form.Item
                        label="Hidden"
                        name="hidden"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                    <Form.Item>
                        <FlexDiv>
                            <Button
                                type="primary"
                                icon={<AntIcon i={FaMoneyBillAlt} />}
                                htmlType="submit"
                                loading={editFormLoading}
                                className="warning"
                                aria-label="Edit"
                            >
                                Edit {assetClassLabel === 'Cash' ? 'Account' : 'Card'}
                            </Button>
                            <Button
                                type="danger"
                                icon={<AntIcon i={RiDeleteBinLine} />}
                                onClick={() => confirmDelete(account)}
                                aria-label="Delete"
                            >
                                Delete {assetClassLabel === 'Cash' ? 'Account' : 'Card'}
                            </Button>
                        </FlexDiv>
                    </Form.Item>
                </Form>
            </Panel>
        ));

    const getEmptyBox = (message) => <EmptyBox><Empty description={message} /></EmptyBox>;

    const accountsListing = () => {
        if (accounts.length === 0) {
            return getEmptyBox(`You do not have any ${assetClassLabel.toLowerCase()} accounts yet`);
        }
        return (
            <Row style={{ width: '100%', marginBottom: '2em' }}>
                <Collapse accordion style={{ width: '100%' }}>
                    {getPanels()}
                </Collapse>
            </Row>
        );
    };

    const addAccountForm = () => (
        <>
            <Title level={4}>
                Add {assetClassLabel} {assetClassLabel === 'Cash' && 'Account'}
            </Title>
            <Row>
                <Col xs={24} md={18} lg={12} xl={10}>
                    <Form {...addFormProps()}>
                        <Form.Item
                            label={assetClass === 'Cash' ? 'Bank' : 'Issuer'}
                            name="accountTypeId"
                        >
                            <InlineAccountSelector
                                accountTypes
                                assetClass={assetClass}
                                data={accountTypes}
                            />
                        </Form.Item>

                        <Form.Item
                            label={`${assetClass === 'Cash' ? 'Account' : 'Card'} Name`}
                            name="accountName"
                            rules={[ rules.requiredRule ]}
                        >
                            <Input placeholder={`${assetClass === 'Cash' ? 'Account' : 'Card'} Name`} />
                        </Form.Item>
                        { assetClass === 'CreditCard' && (
                            <>
                                <Form.Item
                                    label="Payment Account"
                                    name="paymentAccount"
                                >
                                    <InlineAccountSelector
                                        assetClass="Cash"
                                        data={allAccounts}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Payment Remarks"
                                    name="paymentRemarks"
                                    rules={[ rules.requiredRule ]}
                                >
                                    <Input placeholder="Payment Remarks" />
                                </Form.Item>
                                <Form.Item
                                    label="Billing Cycle"
                                    name="billingCycleFirstDay"
                                    rules={[ rules.dayOfMonthRule ]}
                                >
                                    <AntAddon behind label="Day of Month">
                                        <InputNumber type="number" style={{ width: '100%' }} />
                                    </AntAddon>
                                </Form.Item>
                            </>
                        )}
                        <TailFormItem wide>
                            <Button
                                type="primary"
                                icon={<AntIcon i={FaMoneyBillAlt} />}
                                htmlType="submit"
                                loading={addFormLoading}
                                className="success"
                                aria-label="Add"
                            >
                                Add {assetClassLabel} {assetClassLabel === 'Cash' && 'Account'}
                            </Button>
                        </TailFormItem>
                    </Form>
                </Col>
            </Row>
        </>
    );

    const preCheck = () => {
        if (assetClass === 'CreditCard') {
            if (allAccounts.filter((a) => a.accountType.accountTypeClass === 'Cash').length === 0) {
                return getEmptyBox('Please create a Cash account first before managing Credit Cards');
            }
        }
        return false;
    };

    return (loading || accountTypes.length === 0) ? <LoadingSpinner /> : (
        <>
            <Title level={4}>
                Manage {assetClassLabel}{assetClassLabel === 'Cash' && ' Account'}s
            </Title>
            { preCheck() || (
                <>
                    {accountsListing()}
                    {addAccountForm()}
                </>
            ) }
        </>
    );
};

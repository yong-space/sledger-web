import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import Atom from '../Common/Atom';
import { Drawer, Button, Typography, Form, Input, InputNumber, DatePicker, Radio } from 'antd';
import { baseProps, rules, TailFormItem } from '../Common/FormProps';
import AntIcon from '../Common/AntIcon';
import { TiDocumentText, TiCancel } from 'react-icons/ti';
import styled from 'styled-components';
import { presetDarkPalettes } from '@ant-design/colors';
import moment from 'moment';
import API from '../Common/API';
import Notification from '../Common/Notification';
import { sortDate } from '../Common/Util';

const Styled = styled.div`
    .ant-drawer .ant-drawer-content-wrapper {
        max-width: 100vw;
    }
    .ant-input-number, .ant-picker { width: 100%; }

    .credit-debit-wrapper {
        .ant-radio-group {
            width: 100%;
            display: flex;
            justify-content: stretch;
        }
        .ant-radio-button-wrapper { flex-grow: 1; text-align: center }
        .ant-radio-group-solid .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
            &.credit {
                background: ${presetDarkPalettes.green[4]};
                border-color: ${presetDarkPalettes.green[5]};
            }
            &.debit {
                background: ${presetDarkPalettes.red[4]};
                border-color: ${presetDarkPalettes.red[5]};
            }
        }
        .ant-radio-button-wrapper:not(.ant-radio-button-wrapper-checked) {
            &.credit:hover { color: ${presetDarkPalettes.green[4]} }
            &.debit:hover { color: ${presetDarkPalettes.red[4]} }
        }
        .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before {
            background-color: transparent;
        }
    }
`;

export default ({ mode, setMode, account }) => {
    const { Title } = Typography;
    const [ label, setLabel ] = useState();
    const [ loading, setLoading ] = useState(false);
    const [ gridData, setGridData ] = useRecoilState(Atom.gridData);
    const selectedRowKeys = useRecoilState(Atom.gridSelection)[0];
    const { addTransaction, updateTransaction } = API();
    const [ form ] = Form.useForm();

    const getTransactions = () => gridData.filter(row => selectedRowKeys.indexOf(row.id) > -1);

    const getFormValues = () => {
        if (!mode) {
            return {};
        }
        if (mode === 'add') {
            return {
                date: moment().startOf('day'),
                creditDebit: 'debit',
            };
        }
        const transaction = getTransactions()[0];
        return {
            ...transaction,
            date: moment(transaction.date),
            creditDebit: transaction.amount > 0 ? 'credit' : 'debit',
            amount: Math.abs(transaction.amount)
        };
    };

    useEffect(() => {
        if (!mode) {
            return;
        }
        setLabel(mode.substr(0, 1).toUpperCase() + mode.substr(1));
        form.setFieldsValue(getFormValues());
        // eslint-disable-next-line
    }, [ mode ]);

    const submitForm = async (values) => {
        setLoading(true);
        const { date, creditDebit, amount, remarks, tag } = values;
        const submission = {
            id: mode === 'add' ? 0 : getTransactions()[0].id,
            assetClass: account.accountType.accountTypeClass,
            account: { id: account.id },
            date: date.toISOString(),
            amount: amount * (creditDebit === 'debit' ? -1 : 1),
            remarks,
            tag,
        };

        try {
            const endpoint = mode === 'add' ? addTransaction : updateTransaction;
            const transaction = await endpoint(submission);

            if ([ 'Cash', 'CreditCard' ].indexOf(submission.assetClass) > -1) {
                let minDate = transaction.date;
                if (mode === 'edit') {
                    const originalDate = gridData.filter(t => t.id === submission.id)[0].date;
                    if (originalDate < minDate) {
                        minDate = originalDate;
                    }
                }

                const epochTransactions = gridData.filter(record => record.date < minDate);
                const epochTransaction = epochTransactions.length === 0 ? null : epochTransactions
                    .reduce((prev, curr) => prev.date > curr.date ? prev : curr);

                let balance = epochTransaction ? epochTransaction.balance : 0;
                const rebalancedFuture = [
                        transaction,
                        ...gridData
                            .filter(t => t.date >= minDate)
                            .filter(t => t.id !== submission.id)
                    ]
                    .sort(sortDate)
                    .map(t => ({ ...t, balance: balance += t.amount }));

                setGridData(existing => [
                    ...existing.filter(t => t.date < minDate),
                    ...rebalancedFuture,
                ]);
            } else {
                setGridData(existing => [
                    ...existing.filter(t => t.id !== transaction.id),
                    transaction
                ]);
            }

            form.resetFields();
            Notification.showSuccess(`Transaction ${label}ed`);
            setLoading(false);
            setMode(false);
        } catch(e) {
            Notification.showError(`Unable to ${label.toLowerCase()} transaction`, e.message);
            setLoading(false);
        }
    };

    const hideForm = () => {
        setMode(false);
        form.resetFields();
    };

    const formProps = () => ({
        ...baseProps,
        form,
        onFinish: submitForm
    });

    return (
        <Styled>
            <div className="drawerWrapper"></div>
            <Drawer
                placement="right"
                visible={mode}
                mask={true}
                closable={false}
                width="35rem"
                style={{ paddingTop: '3rem' }}
                getContainer=".drawerWrapper"
                destroyOnClose={true}
            >
                <Title level={4}>{label} Transaction</Title>

                <Form {...formProps()}>
                    <Form.Item
                        label="Date"
                        name="date"
                    >
                        <DatePicker allowClear={false} inputReadOnly={true} />
                    </Form.Item>
                    <Form.Item
                        label="Type"
                        name="creditDebit"
                        className="credit-debit-wrapper"
                    >
                        <Radio.Group buttonStyle="solid">
                            <Radio.Button value="credit" className="credit">Credit</Radio.Button>
                            <Radio.Button value="debit" className="debit">Debit</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        label="Amount"
                        name="amount"
                        rules={[rules.requiredRule]}
                    >
                        <InputNumber placeholder="Amount" type="number" />
                    </Form.Item>
                    <Form.Item
                        label="Remarks"
                        name="remarks"
                        rules={[rules.requiredRule]}
                    >
                        <Input placeholder="Remarks" />
                    </Form.Item>
                    <Form.Item
                        label="Tag"
                        name="tag"
                    >
                        <Input placeholder="Tag" />
                    </Form.Item>
                    <TailFormItem>
                        <Button
                            type="primary"
                            icon={<AntIcon i={TiDocumentText} />}
                            htmlType="submit"
                            loading={loading}
                            className={label === 'Add' ? 'success' : 'warning'}
                        >
                            {label} Transaction
                        </Button>
                        <Button
                            type="secondary"
                            icon={<AntIcon i={TiCancel} />}
                            loading={loading}
                            onClick={hideForm}
                        >
                            Cancel
                        </Button>
                    </TailFormItem>
                </Form>
            </Drawer>
        </Styled>
    );
};

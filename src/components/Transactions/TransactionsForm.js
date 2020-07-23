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
    const setGridData = useRecoilState(Atom.gridData)[1];
    const { addTransaction } = API();
    const [ form ] = Form.useForm();

    useEffect(() => {
        if (!mode) {
            return;
        }
        setLabel(mode.substr(0, 1).toUpperCase() + mode.substr(1));
    }, [ mode ]);

    const loadInitialValues = () => {
        return {
            date: moment(),
            creditDebit: 'debit',
        };
    };

    const submitForm = async (values) => {
        setLoading(true);

        const submission = {
            assetClass: account.accountType.accountTypeClass,
            account: { accountId: account.accountId },
            date: values.date.toISOString(),
            amount: values.amount * (values.creditDebit === 'debit' ? -1 : 1),
            remarks: values.remarks,
            category: values.categories,
        };

        try {
            const transaction = await addTransaction(submission);
            setGridData(existing => [
                ...existing, { ...transaction, key: transaction.transactionId }
            ]);
            form.resetFields();
            Notification.showSuccess('Transaction Added');
            setLoading(false);
            setMode(false);
        } catch(e) {
            Notification.showError('Unable to add transaction', e.message);
            setLoading(false);
        }
    };

    const formProps = () => ({
        ...baseProps,
        form,
        initialValues: loadInitialValues(),
        onFinish: submitForm
    });

    return (
        <Styled>
            <div className="drawerWrapper"></div>
            <Drawer
                placement="right"
                visible={mode}
                closable={false}
                mask={true}
                width="35rem"
                style={{ paddingTop: '3rem' }}
                getContainer=".drawerWrapper"
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
                        label="Categories"
                        name="categories"
                    >
                        <Input placeholder="Categories" />
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
                            onClick={() => setMode(false)}
                        >
                            Cancel
                        </Button>
                    </TailFormItem>
                </Form>
            </Drawer>
        </Styled>
    );
};

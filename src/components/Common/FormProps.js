import React from 'react';
import { Form } from 'antd';

const baseProps = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    hideRequiredMark: true
};

const inlineProps = {
    labelCol: { span: 3 },
    wrapperCol: { span: 12 },
    hideRequiredMark: true
};

const rules = {
    required: { required: true, message: 'Required Field' },
    emailRule: { pattern: /[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[A-Z0-9-]+\.)+[A-Z]{2,6}/i, message: 'Invalid Email' },
    requiredRule: { required: true, message: 'Required Field' },
    min3Rule: { type: 'string', min: 3, message: 'Minimum 3 characters' },
    min8Rule: { type: 'string', min: 8, message: 'Minimum 8 characters' },
};

const tailWrapper = {
    xs: { offset: 0 },
    sm: { offset: 6, span: 18 }
};

const TailFormItem = ({ children }) => <Form.Item wrapperCol={tailWrapper}>{children}</Form.Item>;


export {
    baseProps,
    inlineProps,
    rules,
    TailFormItem
};

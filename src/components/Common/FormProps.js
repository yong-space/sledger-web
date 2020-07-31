import React from 'react';
import { Form } from 'antd';
import styled from 'styled-components';
import { presetDarkPalettes } from '@ant-design/colors';

const baseProps = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    hideRequiredMark: true,
};

const wideBaseProps = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
    hideRequiredMark: true,
};

const tailWrapper = {
    xs: { offset: 0 },
    sm: { offset: 6, span: 18 },
};

const wideTailWrapper = {
    xs: { offset: 0 },
    sm: { offset: 8, span: 16 },
};

const inlineProps = {
    labelCol: { span: 5 },
    wrapperCol: { span: 12 },
    hideRequiredMark: true,
};

const dayOfMonthRule = () => ({
    validator(rule, value) {
        if (value > 0 && value < 32) {
            return Promise.resolve();
        }
        return Promise.reject('Day must be between 1 and 31');
    },
});

const rules = {
    required: { required: true, message: 'Required Field' },
    emailRule: { pattern: /[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[A-Z0-9-]+\.)+[A-Z]{2,6}/i, message: 'Invalid Email' },
    requiredRule: { required: true, message: 'Required Field' },
    min3Rule: { type: 'string', min: 3, message: 'Minimum 3 characters' },
    min8Rule: { type: 'string', min: 8, message: 'Minimum 8 characters' },
    dayOfMonthRule,
};

const FlexDiv = styled.div`
    display: flex;
    height: 100%;
    display: flex;
    align-items: center;

    button + button { margin-left: .8rem }

    .success {
        background: ${presetDarkPalettes.green[4]};
        border-color: ${presetDarkPalettes.green[5]};
    }
    .warning {
        background: ${presetDarkPalettes.gold[4]};
        border-color: ${presetDarkPalettes.gold[5]};
    }
    .info {
        background: ${presetDarkPalettes.cyan[4]};
        border-color: ${presetDarkPalettes.cyan[5]};
    }
    .funky {
        background: ${presetDarkPalettes.purple[4]};
        border-color: ${presetDarkPalettes.purple[5]};
    }
    .danger, .ant-btn-danger {
        background: ${presetDarkPalettes.red[4]};
        border-color: ${presetDarkPalettes.red[5]};
    }
`;

const TailFormItem = ({ children, wide }) => (
    <Form.Item wrapperCol={wide ? wideTailWrapper : tailWrapper}>
        <FlexDiv>
            {children}
        </FlexDiv>
    </Form.Item>
);

export {
    baseProps,
    wideBaseProps,
    inlineProps,
    rules,
    FlexDiv,
    TailFormItem,
};

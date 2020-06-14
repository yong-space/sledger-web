import React from 'react';
import { Button } from 'antd';
import { AiFillCaretRight, AiFillCaretLeft } from 'react-icons/ai';
import AntIcon from './AntIcon';

export default (props) => {
    const icon = props.collapsed ? AiFillCaretRight : AiFillCaretLeft;
    return <Button
        size="large"
        shape="round"
        type="primary"
        icon={<AntIcon i={icon} />}
        />;
}

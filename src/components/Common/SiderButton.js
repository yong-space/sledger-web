import React from 'react';
import { Button } from 'antd';
import { AiFillCaretRight, AiFillCaretLeft } from 'react-icons/ai';
import AntIcon from './AntIcon';
import styled from 'styled-components';

const ButtonWrapper = styled.div`
    position: fixed;
    bottom: 1em;
    left: 1em;
    opacity: 0.7;
    z-index: 1001;

    &:hover { opacity: 1 }

    @media only screen and (min-width: 550px) {
        display: none;
    }
`;

export default ({ collapsed, handleClick }) => {
    const icon = collapsed ? AiFillCaretRight : AiFillCaretLeft;

    return (
        <ButtonWrapper>
            <Button
                size="large"
                shape="round"
                type="primary"
                icon={<AntIcon i={icon} />}
                onClick={handleClick}
            />
        </ButtonWrapper>
    );
};

import React from 'react';
import { Button } from 'antd';
import { AiFillCaretRight } from 'react-icons/ai';
import styled from 'styled-components';
import AntIcon from './AntIcon';

const ButtonWrapper = styled.div`
    position: fixed;
    bottom: 1.2em;
    left: 1.2em;
    opacity: 0.5;
    z-index: 1001;

    button {
        width: 3rem;
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 0.25rem;
    }

    &:hover { opacity: 1 }

    @media only screen and (min-width: 550px) {
        display: none;
    }
`;

export default ({ collapsed, handleClick }) => (
    <ButtonWrapper>
        <Button
            shape="circle"
            type="primary"
            icon={<AntIcon rotate={!collapsed} i={AiFillCaretRight} size={35} />}
            onClick={handleClick}
        />
    </ButtonWrapper>
);

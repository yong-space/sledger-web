import React from 'react';
import styled from 'styled-components';
import { Spin } from 'antd';

const SpinWrapper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export default () => (
    <SpinWrapper>
        <Spin size="large" />
    </SpinWrapper>
);

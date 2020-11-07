import React from 'react';
import styled from 'styled-components';

const IconWrapper = styled.div`
    &.no-rotate { transition: 0.3s; }
    &.rotate { transition: 0.3s; transform: rotate(180deg) }
`;

export default (props) => {
    const { i: ActualIcon, rotate, style, size, red } = props;
    const allStyles = {
        ...(style || {}),
        ...(red && { color: 'maroon' }),
    };
    return (
        <IconWrapper className={`anticon ${rotate ? 'rotate' : 'no-rotate'}`}>
            <ActualIcon style={allStyles} size={size || 16} />
        </IconWrapper>
    );
};

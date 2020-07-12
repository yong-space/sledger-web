import React from 'react';
import styled from 'styled-components';

const IconWrapper = styled.div`
    &.no-rotate { transition: 0.3s; }
    &.rotate { transition: 0.3s; transform: rotate(180deg) }
`;

export default (props) => {
    const ActualIcon = props.i;
    return (
        <IconWrapper className={`anticon ${props.rotate ? 'rotate' : 'no-rotate'}`}>
            <ActualIcon style={{ ...props.style }} size={props.size || 16} />
        </IconWrapper>
    );
};

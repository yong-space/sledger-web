import React from 'react';

export default (props) => {
    const ActualIcon = props.i;
    return (
        <span className="anticon">
            <ActualIcon style={{ ...props.style }} />
        </span>
    );
};

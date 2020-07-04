import React from 'react';

export default (props) => {
    const ActualIcon = props.i;
    return (
        <span className="anticon">
            <ActualIcon style={{ ...props.style }} size={props.size || 16} />
        </span>
    );
};

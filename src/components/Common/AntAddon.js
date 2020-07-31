import React, { cloneElement } from 'react';

export default ({ children, label, behind, value, onChange }) => {
    const labelSpan = <span className="ant-input-group-addon">{label}</span>;
    let dynamicChild = children;
    if (value && onChange) {
        dynamicChild = cloneElement(children, { value, onChange });
    }
    const layout = behind ? <>{dynamicChild} {labelSpan}</> : <>{labelSpan} {dynamicChild}</>;
    return (
        <span className="ant-input-group-wrapper ant-input-group-wrapper-lg">
            <span className="ant-input-wrapper ant-input-group">
                {layout}
            </span>
        </span>
    )
};

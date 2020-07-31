import React, { cloneElement } from 'react';

export default ({ children, label, behind, ...props }) => {
    const labelSpan = <span className="ant-input-group-addon">{label}</span>;
    const dynamicChild = cloneElement(children, { ...props });
    const layout = behind ? <>{dynamicChild} {labelSpan}</> : <>{labelSpan} {dynamicChild}</>;
    return (
        <span className="ant-input-group-wrapper ant-input-group-wrapper-lg">
            <span className="ant-input-wrapper ant-input-group">
                {layout}
            </span>
        </span>
    );
};

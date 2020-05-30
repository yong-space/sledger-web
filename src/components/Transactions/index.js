import React from 'react';
import { Layout } from 'antd';
import AccountSelector from '../AccountSelector';

export default () => {
    const { Content } = Layout;
    const selectAccount = (x) => {
        console.log(x)
    }
    return (
        <Content style={{ padding: 24 }}>
            <AccountSelector selectAccount={selectAccount} />

        </Content>
    );
}

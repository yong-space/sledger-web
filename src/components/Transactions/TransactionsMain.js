import React, { useState } from 'react';
import { Layout, Space } from 'antd';
import AccountSelector from '../AccountSelector';
import TransactionGrid from './TransactionsGrid';

export default () => {
    const { Content } = Layout;
    const [ selectedAccount, setSelectedAccount ] = useState();

    return (
        <Content style={{ padding: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
                <AccountSelector selectAccount={setSelectedAccount} />
                <TransactionGrid selectedAccount={selectedAccount} />
            </Space>
        </Content>
    );
}

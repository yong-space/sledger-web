import React from 'react';
import { Layout } from 'antd';
import { Typography } from 'antd';

export default () => {
    const { Title } = Typography;
    const { Content } = Layout;
    return (
        <Content style={{ padding: 24 }}>
            <Title level={4}>Settings</Title>
        </Content>
    );
}

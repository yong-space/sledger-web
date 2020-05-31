import React from 'react';
import { Layout, Button } from 'antd';
import { Typography } from 'antd';
import API from '../API';

export default () => {
    const { Title } = Typography;
    const { Content } = Layout;
    const { getX, getY } = API()

    return (
        <Content style={{ padding: 24 }}>
            <Title level={4}>Settings</Title>
            <Button onClick={() => getX()}>Get X</Button>
            <Button onClick={() => getY()}>Get Y</Button>
        </Content>
    );
}

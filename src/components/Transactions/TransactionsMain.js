import React, { useState } from 'react';
import { Layout, Row, Col } from 'antd';
import AccountSelector from '../Common/AccountSelector';
import TransactionGrid from './TransactionsGrid';
import styled from 'styled-components';
import TransactionsButtons from './TransactionsButtons';

const Styled = styled.div`
    height: 100%;

    .ant-layout-content {
        @media only screen and (max-width: 549px) {
            padding: 0.7rem !important
        }
    }
`;

export default () => {
    const { Content } = Layout;
    const [ selectedAccount, setSelectedAccount ] = useState();

    return (
        <Styled>
            <Content>
                <Row>
                    <Col xs={24} md={10} lg={8} xl={6}>
                        <AccountSelector setSelectedAccount={setSelectedAccount} />
                    </Col>
                    <Col xs={24} md={14} lg={8} xl={6}>
                        <TransactionsButtons selectedAccount={selectedAccount} />
                    </Col>
                </Row>
                <Row style={{ height: 'calc(100% - 1.1rem)' }}>
                    <Col xs={24}>
                        <TransactionGrid selectedAccount={selectedAccount} />
                    </Col>
                </Row>
            </Content>
        </Styled>
    );
}

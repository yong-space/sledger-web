import React, { useState } from 'react';
import { Layout, Row, Col } from 'antd';
import AccountSelector from '../Common/AccountSelector';
import TransactionGrid from './TransactionsGrid';
import styled from 'styled-components';
import TransactionsButtons from './TransactionsButtons';
import TransactionsForm from './TransactionsForm';

const Styled = styled.div`
    height: 100%;
    .ant-layout-content, .ant-col { height: 100%; }
    .ant-layout-content {
        @media only screen and (max-width: 549px) {
            padding: 0.7rem !important
        }
    }
    .gridWrapper {
        height: calc(100% - 1.9rem);
        @media only screen and (max-width: 549px) {
            height: calc(100% - 5.1rem);
        }
    }
`;

export default () => {
    const { Content } = Layout;
    const [ selectedAccount, setSelectedAccount ] = useState();
    const [ formMode, setFormMode ] = useState(null);

    return (
        <Styled>
            <Content>
                <Row style={{ alignItems: 'center' }}>
                    <Col xs={24} sm={10} lg={8} xl={6}>
                        <AccountSelector setSelectedAccount={setSelectedAccount} />
                    </Col>
                    <Col xs={24} sm={14} lg={16} xl={18} style={{ overflowX: 'hidden' }}>
                        <TransactionsButtons selectedAccount={selectedAccount} setFormMode={setFormMode} />
                    </Col>
                </Row>
                <Row className="gridWrapper">
                    <Col xs={24}>
                        <TransactionGrid selectedAccount={selectedAccount} />
                    </Col>
                </Row>
            </Content>
            <TransactionsForm
                mode={formMode}
                setMode={setFormMode}
                account={selectedAccount}
            />
        </Styled>
    );
}

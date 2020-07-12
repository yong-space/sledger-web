import React, { useState } from 'react';
import { Layout, Row, Col, Button } from 'antd';
import AccountSelector from '../Common/AccountSelector';
import TransactionGrid from './TransactionsGrid';
import AntIcon from '../Common/AntIcon';
import { AiOutlinePlusCircle, AiOutlineMinusCircle, AiOutlineCloudUpload } from 'react-icons/ai';
import { DiGitMerge } from 'react-icons/di';
import styled from 'styled-components';
import { presetDarkPalettes } from '@ant-design/colors';

const Styled = styled.div`
    height: 100%;

    .ant-layout-content {
        @media only screen and (max-width: 549px) {
            padding: 0.7rem !important
        }
    }
`;

const ButtonBar = styled.div`
    height: 100%;
    display: flex;
    align-items: center;

    button { margin-left: .5rem }

    @media only screen and (max-width: 767px) {
        margin-top: .5rem;
        button:first-child { margin-left: 0 }
        button.import { display: none }
    }
`;

export default () => {
    const { Content } = Layout;
    const [ selectedAccount, setSelectedAccount ] = useState();

    const addHandler = () => {

    };

    const deleteHandler = () => {

    };

    const mergeHandler = () => {

    };

    const importHandler = () => {

    };

    const getColourTheme = (base) => ({
        background: presetDarkPalettes[base][4],
        border: presetDarkPalettes[base][5]
    });

    const getButtons = () => ([
        {
            label: 'Add',
            icon: AiOutlinePlusCircle,
            handler: addHandler,
            ...getColourTheme('green')
        },
        {
            label: 'Delete',
            icon: AiOutlineMinusCircle,
            handler: deleteHandler,
            ...getColourTheme('red')
        },
        {
            label: 'Merge',
            icon: DiGitMerge,
            handler: mergeHandler,
            ...getColourTheme('gold')
        },
        {
            label: 'Import',
            icon: AiOutlineCloudUpload,
            handler: importHandler,
            ...getColourTheme('cyan'),
            hidden: selectedAccount && !selectedAccount.accountType.importEnabled
        }
    ]
    .filter(button => !button.hidden)
    .map(button => (
        <Button
            key={button.label}
            className={button.label.toLowerCase()}
            type="primary"
            icon={<AntIcon i={button.icon} />}
            style={{ backgroundColor: button.background, borderColor: button.border }}
        >
            {button.label}
        </Button>
    )));

    return (
        <Styled>
            <Content>
                <Row>
                    <Col xs={24} md={10} lg={8} xl={6}>
                        <AccountSelector setSelectedAccount={setSelectedAccount} />
                    </Col>
                    <Col xs={24} md={14} lg={8} xl={6}>
                        <ButtonBar>
                            {getButtons()}
                        </ButtonBar>
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

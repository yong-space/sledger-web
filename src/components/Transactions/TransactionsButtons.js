import React from 'react';
import styled from 'styled-components';
import { Button, Modal } from 'antd';
import AntIcon from '../Common/AntIcon';
import {
    AiOutlinePlusCircle, AiOutlineMinusCircle, AiOutlineCloudUpload, AiFillWarning,
} from 'react-icons/ai';
import { DiGitMerge } from 'react-icons/di';
import { presetDarkPalettes } from '@ant-design/colors';
import { useRecoilState } from 'recoil';
import Atom from '../Common/Atom';
import API from '../Common/API';
import Notification from '../Common/Notification';

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

export default ({ selectedAccount, setFormMode }) => {
    const setGridData = useRecoilState(Atom.gridData)[1];
    const [ selectedRowKeys, setSelectedRowKeys ] = useRecoilState(Atom.gridSelection);
    const { deleteTransactions } = API();

    const deleteHandler = () => Modal.confirm({
        title: `Are you sure you wish to delete these transactions?`,
        icon: <AntIcon i={AiFillWarning} style={{ color: 'red' }} />,
        onOk: () => new Promise(async (resolve) => {
            try {
                await deleteTransactions(selectedRowKeys);
                setGridData(existing => existing.filter(record => selectedRowKeys.indexOf(record.key) === -1));
                setSelectedRowKeys([]);
                Notification.showSuccess('Transactions deleted');
            } catch(e) {
                Notification.showError('Unable to delete transactions', e.message);
            }
            resolve();
        })
    });

    const mergeHandler = () => {

    };

    const importHandler = () => {

    };

    const getColourTheme = (base) => ({
        background: presetDarkPalettes[base][4],
        border: presetDarkPalettes[base][5]
    });

    const buttons = [
        {
            label: 'Add',
            icon: AiOutlinePlusCircle,
            handler: () => setFormMode('add'),
            ...getColourTheme('green')
        },
        {
            label: 'Delete',
            icon: AiOutlineMinusCircle,
            handler: deleteHandler,
            ...getColourTheme('red'),
            disabled: () => selectedRowKeys.length === 0
        },
        {
            label: 'Merge',
            icon: DiGitMerge,
            handler: mergeHandler,
            ...getColourTheme('gold'),
            disabled: () => selectedRowKeys.length === 0
        },
        {
            label: 'Import',
            icon: AiOutlineCloudUpload,
            handler: importHandler,
            ...getColourTheme('cyan'),
            hidden: selectedAccount && !selectedAccount.accountType.importEnabled
        }
    ];

    const getButtons = () => buttons
        .filter(button => !button.hidden)
        .map(button => (
            <Button
                key={button.label}
                className={button.label.toLowerCase()}
                type="primary"
                icon={<AntIcon i={button.icon} />}
                style={{ backgroundColor: button.background, borderColor: button.border }}
                onClick={button.handler}
                disabled={!button.disabled ? false : button.disabled()}
            >
                {button.label}
            </Button>
        ));

    return (
        <ButtonBar>
            {getButtons()}
        </ButtonBar>
    );
}

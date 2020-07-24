import React from 'react';
import styled from 'styled-components';
import { Button, Modal } from 'antd';
import AntIcon from '../Common/AntIcon';
import {
    AiOutlinePlusCircle, AiOutlineMinusCircle, AiOutlineEdit, AiOutlineCloudUpload, AiFillWarning,
} from 'react-icons/ai';
import { DiGitMerge } from 'react-icons/di';
import { useRecoilState } from 'recoil';
import Atom from '../Common/Atom';
import API from '../Common/API';
import Notification from '../Common/Notification';
import { FlexDiv } from '../Common/FormProps';

const Styled = styled.div`
    margin-left: .8rem;
    @media only screen and (max-width: 767px) {
        margin-left: 0;
        margin-top: .8rem;
        button.desktop { display: none }
    }
    @media only screen and (min-width: 768px) and (max-width: 938px) {
        button span { display: none }
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
                await deleteTransactions(selectedRowKeys, selectedAccount.id);
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

    const buttons = [
        {
            label: 'Add',
            tooltip: 'Add Transaction',
            icon: AiOutlinePlusCircle,
            handler: () => setFormMode('add'),
            className: 'success',
        },
        {
            label: 'Edit',
            tooltip: 'Edit Transaction',
            icon: AiOutlineEdit,
            handler: () => setFormMode('edit'),
            className: 'warning',
            disabled: () => selectedRowKeys.length !== 1,
        },
        {
            label: 'Delete',
            tooltip: 'Delete Transactions',
            icon: AiOutlineMinusCircle,
            handler: deleteHandler,
            className: 'danger',
            disabled: () => selectedRowKeys.length === 0,
        },
        {
            label: 'Merge',
            tooltip: 'Merge Transactions',
            icon: DiGitMerge,
            handler: mergeHandler,
            className: 'funky',
            disabled: () => selectedRowKeys.length < 2,
        },
        {
            label: 'Import',
            tooltip: 'Import Transactions',
            icon: AiOutlineCloudUpload,
            handler: importHandler,
            className: 'info desktop',
            hidden: selectedAccount && !selectedAccount.accountType.importEnabled
        }
    ];

    const getButtons = () => buttons
        .filter(button => !button.hidden)
        .map(button => (
            <Button
                key={button.label}
                type="primary"
                icon={<AntIcon i={button.icon} />}
                className={button.className}
                onClick={button.handler}
                disabled={!button.disabled ? false : button.disabled()}
                title={button.tooltip}
            >
                {button.label}
            </Button>
        ));

    return (
        <Styled>
            <FlexDiv>
                {getButtons()}
            </FlexDiv>
        </Styled>
    );
}

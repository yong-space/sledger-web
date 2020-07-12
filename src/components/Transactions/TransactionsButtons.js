import React from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import AntIcon from '../Common/AntIcon';
import { AiOutlinePlusCircle, AiOutlineMinusCircle, AiOutlineCloudUpload } from 'react-icons/ai';
import { DiGitMerge } from 'react-icons/di';
import { presetDarkPalettes } from '@ant-design/colors';
import { useRecoilState } from 'recoil';
import Atom from '../Common/Atom';

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

export default ({ selectedAccount }) => {
    const setGridData = useRecoilState(Atom.gridData)[1];
    const [ selectedRowKeys, setSelectedRowKeys ] = useRecoilState(Atom.gridSelection);

    const addHandler = () => {
        const newData = {
            key: Math.floor(Math.random() * 237),
            date: new Date(1584538794873 + (7 * 360000000)),
            amount: (Math.floor(Math.random() * 1377) - Math.floor(Math.random() * 1777)) / 100,
            balance: Math.floor(Math.random() * 1377) / 100,
            remarks: 'Hello Okay ' + Math.floor(Math.random() * 237),
            tags: 'Home ' + Math.floor(Math.random() * 237)
        };
        setGridData(existing => [ ...existing, newData ]);
    };

    const deleteHandler = () => {
        setGridData(existing => existing.filter(record => selectedRowKeys.indexOf(record.key) === -1));
        setSelectedRowKeys([]);
    };

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
            handler: addHandler,
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

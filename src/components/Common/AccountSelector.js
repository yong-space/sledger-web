import React, { useEffect, useState } from 'react';
import { Select, Tag } from 'antd';
import API from '../Common/API';
import Notification from '../Common/Notification';
import styled from 'styled-components';

const Styled = styled.div`
    .ant-select-selection-item { display: flex; align-items: center }
    .ant-select-selection-item > .ant-tag { height: 1.5rem }
`;

export default ({ setSelectedAccount }) => {
    const [ loading, setLoading ] = useState(true);
    const [ accounts, setAccounts ] = useState([]);
    const [ selectedItem, setSelectedItem ] = useState();
    const { Option, OptGroup } = Select;
    const { getAccounts } = API();

    const refreshAccounts = async () => {
        try {
            const response = (await getAccounts())
                .filter(account => account.hidden === false)
                .sort((a, b) => (a.accountType.accountTypeClass > b.accountType.accountTypeClass || a.sortIndex > b.sortIndex) ? 1 : -1);
            setAccounts(response);
            if (response.length > 0) {
                setSelectedItem(response[0].accountId);
                setSelectedAccount(response[0]);
            }
        } catch(e) {
            Notification.showError('Unable to load account types', e.message);
        }
    };

    const handleSelectionChanged = (accountId) => {
        setSelectedItem(accountId);
        setSelectedAccount(accounts.filter(a => a.accountId === accountId)[0]);
    };

    useEffect(() => {
        refreshAccounts();
        setLoading(false);
        // eslint-disable-next-line
    }, []);

    const getAccountOptions = () => {
        if (accounts.length === 0) {
            return [];
        }
        const accountMap = accounts.reduce((obj, item) => {
            const assetClass = item.accountType.accountTypeClass;
            obj[assetClass] = [ ...(obj[assetClass] || []), item ];
            return obj
        }, {});

        return Object.keys(accountMap).sort().map(assetClass => {
            const options = accounts
                .filter(a => a.accountType.accountTypeClass === assetClass)
                .sort((a, b) => (a.sortIndex > b.sortIndex) ? 1 : -1)
                .map(a => (
                    <Option key={a.accountId} value={a.accountId}>
                        <Tag color={a.accountType.colour}>
                            {a.accountType.accountTypeName}
                        </Tag>
                        {a.accountName}
                    </Option>
                ))
            return <OptGroup key={assetClass} label={assetClass}>{options}</OptGroup>
        });
    };

    return (
        <Styled>
            <span className="ant-input-group-wrapper ant-input-group-wrapper-lg">
                <span className="ant-input-wrapper ant-input-group">
                    <span className="ant-input-group-addon">Account</span>
                    <Select
                        size="large"
                        style={{ width: '100%' }}
                        onChange={handleSelectionChanged}
                        value={selectedItem}
                        loading={loading}
                        listHeight="500"
                    >
                        {getAccountOptions()}
                    </Select>
                </span>
            </span>
        </Styled>
    );
}

import React, { useEffect, useState } from 'react';
import { Select, Tag } from 'antd';
import { FaMoneyBillAlt, FaRegCreditCard } from 'react-icons/fa';
import API from './API';
import Notification from './Notification';
import AntIcon from './AntIcon';
import AntAddon from './AntAddon';
import './AccountSelector.less';

const getAccountOptions = (accounts, assetClass, iconClass, accountTypes) => {
    if (accounts.length === 0) {
        return [];
    }

    if (accountTypes) {
        return accounts
            .filter((accountType) => accountType.accountTypeClass === assetClass)
            .sort((a, b) => ((a.accountTypeName > b.accountTypeName) ? 1 : -1))
            .map((accountType) => (
                <Select.Option key={accountType.id} value={accountType.id}>
                    <Tag color={accountType.colour}>
                        <AntIcon i={iconClass === 'Cash' ? FaMoneyBillAlt : FaRegCreditCard} />
                    </Tag>
                    {accountType.accountTypeName}
                </Select.Option>
            ));
    }

    return accounts
        .filter((account) => account.accountType.accountTypeClass === assetClass)
        .sort((a, b) => ((a.sortIndex > b.sortIndex) ? 1 : -1))
        .map((account) => (
            <Select.Option key={account.id} value={account.id}>
                <Tag color={account.accountType.colour}>
                    {account.accountType.accountTypeName}
                </Tag>
                {account.accountName}
            </Select.Option>
        ));
};

const getAccountOptionGroups = (accounts) => {
    const accountMap = accounts.reduce((obj, item) => {
        const assetClass = item.accountType.accountTypeClass;
        obj[assetClass] = [ ...(obj[assetClass] || []), item ];
        return obj;
    }, {});

    return Object.keys(accountMap).sort().map((assetClass) => {
        const options = accounts
            .filter((a) => a.accountType.accountTypeClass === assetClass)
            .sort((a, b) => ((a.sortIndex > b.sortIndex) ? 1 : -1))
            .map((a) => (
                <Select.Option key={a.id} value={a.id}>
                    <Tag color={a.accountType.colour}>
                        {a.accountType.accountTypeName}
                    </Tag>
                    {a.accountName}
                </Select.Option>
            ));
        return (
            <Select.OptGroup key={assetClass} label={assetClass.replace(/(?<=[a-z])([A-Z])/g, ' $1')}>
                {options}
            </Select.OptGroup>
        );
    });
};

export default ({ assetClass, setSelectedAccount }) => {
    const [ loading, setLoading ] = useState(true);
    const [ accounts, setAccounts ] = useState([]);
    const [ selectedItem, setSelectedItem ] = useState();
    const { getAccounts } = API();

    const refreshAccounts = async () => {
        try {
            const response = (await getAccounts())
                .filter((account) => account.hidden === false)
                .sort((a, b) => (
                    (a.accountType.accountTypeClass > b.accountType.accountTypeClass
                        || a.sortIndex > b.sortIndex) ? 1 : -1
                ));
            setAccounts(response);
            if (!assetClass && response.length > 0) {
                setSelectedItem(response[0].id);
                setSelectedAccount(response[0]);
            }
        } catch (e) {
            Notification.showError('Unable to load accounts', e.message);
        }
    };

    useEffect(() => {
        refreshAccounts();
        setLoading(false);
        // eslint-disable-next-line
    }, []);

    const handleSelectionChanged = (id) => {
        setSelectedItem(id);
        setSelectedAccount(accounts.filter((a) => a.id === id)[0]);
    };

    return (
        <AntAddon label="Account">
            <Select
                size="large"
                style={{ width: '100%' }}
                onChange={handleSelectionChanged}
                value={selectedItem}
                loading={loading}
                listHeight="500"
            >
                {getAccountOptionGroups(accounts)}
            </Select>
        </AntAddon>
    );
};

export const InlineAccountSelector = ({
    data, assetClass, iconClass, accountTypes, value, onChange,
}) => (
    <Select value={value} onChange={onChange}>
        {getAccountOptions(data, assetClass, iconClass || assetClass, accountTypes)}
    </Select>
);

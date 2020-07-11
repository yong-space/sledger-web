import React, { useEffect, useState } from 'react';
import { Select, Row, Col, Tag } from 'antd';
import API from '../Common/API';
import Notification from '../Common/Notification';

export default (props) => {
    const [ loading, setLoading ] = useState(true);
    const [ accounts, setAccounts ] = useState([]);
    const [ selectedAccount, setSelectedAccount ] = useState('No accounts available');
    const { Option, OptGroup } = Select;
    const { getAccounts } = API();

    const refreshAccounts = async () => {
        try {
            const response = (await getAccounts())
                .filter(account => account.hidden === false)
                .sort((a, b) => (a.accountType.accountTypeClass > b.accountType.accountTypeClass || a.sortIndex > b.sortIndex) ? 1 : -1);
            setAccounts(response);
            if (response.length > 0) {
                setSelectedAccount(response[0].accountId);
            }
        } catch(e) {
            Notification.showError('Unable to load account types', e.message);
        }
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
            const options = accounts.filter(a => a.accountType.accountTypeClass === assetClass)
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
        <Row>
            <Col xs={24} sm={16} md={12} lg={8} xl={6}>
                <span className="ant-input-group-wrapper ant-input-group-wrapper-lg">
                    <span className="ant-input-wrapper ant-input-group">
                        <span className="ant-input-group-addon">Account</span>
                        <Select
                            size="large"
                            style={{ width: '100%' }}
                            onChange={props.selectAccount}
                            value={selectedAccount}
                            loading={loading}
                        >
                            {getAccountOptions()}
                        </Select>
                    </span>
                </span>
            </Col>
        </Row>
    );
}

import React, { useEffect, useState } from 'react';
import { Select, Row, Col, Tag } from 'antd';
import API from '../Common/API';

export default (props) => {
    const [ loading, setLoading ] = useState(true);
    const [ accounts, setAccounts ] = useState([]);
    const { Option, OptGroup } = Select;
    const { getAccounts } = API();

    const refreshAccounts = async () => {
        try {
            const response = (await getAccounts())
                .filter(account => account.hidden === false)
                .sort((a, b) => (a.sortIndex > b.sortIndex) ? 1 : -1);
            setAccounts(response);
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
                        { !loading && accounts.length > 0 &&
                        <Select
                            size="large"
                            style={{ width: '100%' }}
                            defaultValue={accounts[0].accountId}
                            onChange={props.selectAccount}
                        >
                            {getAccountOptions()}
                        </Select>
                        }
                    </span>
                </span>
            </Col>
        </Row>
    )
}

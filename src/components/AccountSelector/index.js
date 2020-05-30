import React from 'react';
import { Select, Row, Col } from 'antd';

export default (props) => {
    const { Option, OptGroup } = Select;

    const accounts = [
        { type: 'Cash', id: 1, label: 'POSB Savings' },
        { type: 'Cash', id: 2, label: 'OCBC 360' },
        { type: 'Credit Card', id: 3, label: 'UOB One' },
        { type: 'Investment', id: 4, label: 'POEMS' },
    ];

    const accountsMap = {}
    accounts.forEach(a => accountsMap[a.type] = [ ...(accountsMap[a.type] || []), a ])
    const accountsML = Object.keys(accountsMap).map(type => {
        const options = accounts.filter(a => a.type === type)
            .map(a => <Option key={a.id} value={a.id}>{a.label}</Option>)
        return <OptGroup key={type} label={type}>{options}</OptGroup>
    })

    return (
        <Row>
            <Col xs={24} sm={16} md={12} lg={8} xl={6}>
                <span className="ant-input-group-wrapper ant-input-group-wrapper-lg">
                    <span className="ant-input-wrapper ant-input-group">
                        <span className="ant-input-group-addon">Account</span>
                        <Select
                            size="large"
                            style={{ width: '100%' }}
                            defaultValue={accounts[0].id}
                            onChange={props.selectAccount}
                        >
                            {accountsML}
                        </Select>
                    </span>
                </span>
            </Col>
        </Row>
    )
}

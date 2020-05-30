import React from 'react';
import { Table } from 'antd';

export default (props) => {
    const selectedAccount = props.selectedAccount;

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
    ];

    const dataSource = [
        {
            key: '1',
            name: 'Mike',
            age: 32,
            address: selectedAccount + ' Downing Street',
        },
        {
            key: '2',
            name: 'John',
            age: 42,
            address: '10 Downing Street',
        },
    ];

    for (let i=0; i<10000; i++) {
        dataSource.push({
            key: i,
            name: 'John',
            age: i,
            address: '10 Downing Street',
        })
    }

    return (
        <Table
            columns={columns}
            dataSource={dataSource}
            size="small"
        />
    )
}
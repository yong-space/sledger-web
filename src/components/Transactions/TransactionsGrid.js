import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import LoadingSpinner from '../Common/LoadingSpinner';

export default ({ selectedAccount }) => {
    const [ columns, setColumns ] = useState([]);
    const [ data, setData ] = useState([]);

    useEffect(() => {
        if (!selectedAccount) {
            return;
        }
        setColumns([
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
        ]);

        const dataSource = [
            {
                key: '1',
                name: 'Mike',
                age: 32,
                address: selectedAccount.accountName + ' Downing Street',
            },
            {
                key: '2',
                name: 'John',
                age: 42,
                address: '10 Downing Street',
            },
        ];

        for (let i=0; i<7; i++) {
            dataSource.push({
                key: i,
                name: 'John',
                age: i,
                address: '10 Downing Street',
            })
        }
        setData(dataSource);
    }, [ selectedAccount ]);

    return (
        !selectedAccount ? <LoadingSpinner /> :
        <Table
            columns={columns}
            dataSource={data}
            size="small"
            style={{ marginTop: '.8rem' }}
        />
    );
}

import React, { useState } from 'react';
import { Button, Icon, Input } from 'antd';
import useLogin from '../LoginHook';

export default (props) => {
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const { setLoginSuccess, setLoginError } = useLogin();
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');

    const login = () => {
        if (username.length + password.length === 0) {
            return;
        }
        let formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        fetch(`${baseUrl}/api/authenticate`, {
            method: 'POST',
            cache: 'no-cache',
            body: formData
        })
        .then(res => {
            if (!res.ok)
                throw Error(res.statusText);
            return res.text();
        })
        .then(token => {
            setLoginSuccess(token);
            props.history.push('/dashboard');
        })
        .catch(e => {
            console.log(e);
            setLoginError('Authentication Failed');
        });
    };

    return (
        <div>
            <Input
                placeholder="Username"
                onChange={e => setUsername(e.target.value)}
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
            <Input.Password
                placeholder="Password"
                onChange={e => setPassword(e.target.value)}
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
            <Button icon="login" type="primary" onClick={login}>Login</Button>
        </div>
    );
}

import React, { useState } from 'react';
import { Button, Icon, Input } from 'antd';

export default function Login() {
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const [ jwt, setJwt ] = useState(undefined);
    const [ error, setError ] = useState(undefined);
    const [ username, setUsername ] = useState(undefined);
    const [ password, setPassword ] = useState(undefined);

    const login = () => {
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
        .then(res => setJwt(res))
        .catch(() => setError('Authentication Failed'));
    };

    const renderMessage = () => {
        if (!jwt && !error)
            return;
        const message = error ? `Error: ${error}` : `JWT: ${jwt}`;
        return <div>{message}</div>;
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

            { renderMessage() }
        </div>
    );
}

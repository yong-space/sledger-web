import React, { useState } from 'react';
import { Button, Icon, Input } from 'antd';
import useLogin from '../LoginHook';
import { navigate } from "hookrouter";

export default () => {
    const { login } = useLogin();
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ errors, setErrors ] = useState();

    const submitLogin = async () => {
        if (username.length + password.length === 0) {
            setErrors('Please enter both username and password');
            return;
        }
        const state = await login(username, password);
        if (state.jwt && !state.error) {
            navigate('/dashboard');
        } else {
            setErrors(state.error);
        }
    };

    const showErrors = () => {
        return !errors ? '' : <div>{errors}</div>;
    };

    return (
        <div>
            <form>
                <Input
                    autoComplete='username'
                    placeholder='Username'
                    onChange={e => setUsername(e.target.value)}
                    prefix={<Icon type='user' style={{ color: 'rgba(0,0,0,.25)' }} />}
                />
                <Input.Password
                    autoComplete='password'
                    placeholder='Password'
                    onChange={e => setPassword(e.target.value)}
                    prefix={<Icon type='lock' style={{ color: 'rgba(0,0,0,.25)' }} />}
                />
                <Button icon='login' type='primary' onClick={submitLogin}>Login</Button>
            </form>
            <div>{showErrors()}</div>
        </div>
    );
}

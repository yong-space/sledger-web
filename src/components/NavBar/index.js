import React from 'react';
import { Button } from 'antd';
import useLogin from '../LoginHook';

export default () => {
    const { isLoginValid, getUsername, logout } = useLogin();

    const getLoginStatus = () => {
        if (isLoginValid()) {
            return (
                <div>
                    Logged in as {getUsername()}
                    <Button icon="logout" type="danger" onClick={logout}>Logout</Button>
                </div>
            );
        } else {
            return <div>Not Logged In</div>;
        }
    };

    return (
        <div>
            { getLoginStatus() }
        </div>
    );
}

import React from 'react';
import useLogin from '../LoginHook';

export default () => {
    const { isLoginValid, getUsername } = useLogin();

    let getLoginStatus = () => {
        if (isLoginValid()) {
            return <div>Logged in as {getUsername()}</div>;
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

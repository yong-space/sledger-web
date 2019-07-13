import React from 'react';
import { Button, Icon, Input } from 'antd';

export default class Login extends React.Component {
    baseUrl = process.env.REACT_APP_BASE_URL;

    constructor(props) {
        super(props);
        this.state = {};
    }

    login = () => {
        let formData = new FormData();
        formData.append('username', this.state.username);
        formData.append('password', this.state.password);

        fetch(`${this.baseUrl}/api/authenticate`, {
            method: 'POST',
            cache: 'no-cache',
            body: formData
        })
        .then(res => {
            if (!res.ok)
                throw Error(res.statusText);
            return res.text();
        })
        .then(res => this.setState({ jwt: res, error: undefined }))
        .catch(() => this.setState({ jwt: undefined, error: 'Authentication Failed'}));
    };

    renderMessage = () => {
        if (!this.state.jwt && !this.state.error)
            return;
        const message = this.state.error ? `Error: ${this.state.error}` : `JWT: ${this.state.jwt}`;
        return <div>{message}</div>;
    };

    render() {
        return (
            <div>
                <Input
                    placeholder="Username"
                    onChange={e => this.setState({ username: e.target.value })}
                    prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                />
                <Input.Password
                    placeholder="Password"
                    onChange={e => this.setState({ password: e.target.value })}
                    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                />
                <Button icon="login" type="primary" onClick={this.login}>Login</Button>

                { this.renderMessage() }
            </div>
        );
    }
}

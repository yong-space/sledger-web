import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter, Route, Switch,
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import './index.css';
import App from './components/App/App';
import LoginPage from './components/Login/LoginPage';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import 'antd/dist/antd.dark.css';

const index = (
    <RecoilRoot>
        <BrowserRouter>
            <Switch>
                <Route path="/login" component={LoginPage} />
                <Route component={App} />
            </Switch>
        </BrowserRouter>
    </RecoilRoot>
);

ReactDOM.render(index, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorkerRegistration.register({
    onSuccess: () => {},
    onUpdate: (registration) => {
        const registrationWaiting = registration.waiting;
        if (registrationWaiting) {
            registrationWaiting.postMessage({ type: 'SKIP_WAITING' });
            registrationWaiting.addEventListener('statechange', (e) => {
                if (e.target.state === 'activated') {
                    window.location.reload();
                }
            });
        }
    },
});

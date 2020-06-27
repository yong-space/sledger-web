import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import './index.css';
import App from './components/App/App';
import * as serviceWorker from './service-worker';

ReactDOM.render(<RecoilRoot><App /></RecoilRoot>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register({
    onSuccess: () => {},
    onUpdate: registration => {
        const registrationWaiting = registration.waiting;
        if (registrationWaiting) {
            registrationWaiting.postMessage({ type: 'SKIP_WAITING' });
            registrationWaiting.addEventListener('statechange', e => {
                if (e.target.state === 'activated') {
                    window.location.reload();
                }
            });
        }
    }
});

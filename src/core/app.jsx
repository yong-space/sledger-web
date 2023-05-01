import { lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import Container from '@mui/material/Container';
import NavBar from '../nav-bar/main-menu';
import Settings from '../settings/settings';
import state from './state';
import styled from 'styled-components';
import Dashboard from '../dashboard/dashboard';
import Transactions from '../transactions/transactions';

const Profile = lazy(() => import('../settings/profile'));
const Admin = lazy(() => import('../admin/admin'));
const NotFound = lazy(() => import('./not-found'));

const Root = styled(Container)`
    height: 100%;
    padding-top: 5rem;
`;

const App = () => {
    const [ issuers, setIssuers ] = state.useState(state.issuers);
    const [ accounts, setAccounts ] = state.useState(state.accounts);
    const { listIssuers, listAccounts } = api();

    useEffect(() => {
        if (!issuers) {
            listIssuers((data) => setIssuers(data));
        }
        if (!accounts) {
            listAccounts((data) => setAccounts(data));
        }
    }, []);

    return issuers && accounts && (
        <Root>
            <NavBar />
            <Routes>
                <Route path="dash/*" element={<Dashboard />} />
                <Route path="tx/*" element={<Transactions /> } />
                <Route path="admin/*" element={<Admin /> } />
                <Route path="settings/*" element={<Settings /> } />
                <Route path="profile" element={<Profile /> } />
                <Route path="/" element={<Navigate to="/dash" />} />
                <Route path="register" element={<Navigate to="/dash" /> } />
                <Route path="login" element={<Navigate to="/dash" /> } />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Root>
    );
};

export default App;

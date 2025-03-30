import { CircularLoader, NoConnectivity, NotFound } from './utils';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Admin from '../admin/admin';
import api from './api';
import Dashboard from '../dashboard/dashboard';
import NavBar from '../nav-bar/main-menu';
import Profile from '../settings/profile';
import Settings from '../settings/settings';
import state from './state';
import styled from 'styled-components';
import Transactions from '../transactions/transactions';

const Root = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 1px;
    height: 100dvh;
    width: 100dvw;
`;

const Main = styled.main`
    display: flex;
    flex-direction: column;
    flex: 1 1 1px;
    gap: .5rem;
    padding: .5rem;
`;

const App = () => {
    const [ issuers, setIssuers ] = state.useState(state.issuers);
    const [ accounts, setAccounts ] = state.useState(state.accounts);
    const { listIssuers, listAccounts } = api();
    const location = useLocation();
    const isNoConnectivity = location.pathname === '/no-connectivity';

    useEffect(() => {
        if (!issuers) {
            listIssuers((data) => setIssuers(data));
        }
        if (!accounts) {
            listAccounts((data) => setAccounts(data));
        }
    }, []);

    if (!isNoConnectivity && (!issuers || !accounts)) {
        return <CircularLoader />;
    }

    return (
        <Root>
            <NavBar />
            <Main>
                <Routes>
                    <Route path="dash/*" element={<Dashboard />} />
                    <Route path="tx/*" element={<Transactions /> } />
                    <Route path="admin/*" element={<Admin /> } />
                    <Route path="settings/*" element={<Settings /> } />
                    <Route path="profile" element={<Profile /> } />
                    <Route path="no-connectivity" element={<NoConnectivity />} />
                    <Route path="/" element={<Navigate to="/dash" />} />
                    <Route path="register" element={<Navigate to="/dash" /> } />
                    <Route path="login" element={<Navigate to="/dash" /> } />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Main>
        </Root>
    );
};

export default App;

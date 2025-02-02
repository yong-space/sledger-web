import { CircularLoader, NoConnectivity, NotFound } from './utils';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Admin from '../admin/admin';
import api from './api';
import Dashboard from '../dashboard/dashboard';
import NavBar from '../nav-bar/main-menu';
import Profile from '../settings/profile';
import Settings from '../settings/settings';
import state from './state';
import styled from 'styled-components';
import Transactions from '../transactions/transactions';
import useMediaQuery from '@mui/material/useMediaQuery';

const Root = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 1px;
    min-height: 100%;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 1px;
    gap: .5rem;
    padding: ${props => props.isMobile ? '1rem .5rem' : '1rem 1.5rem'};
    padding-bottom: 0;
    overflow: auto;
`;

const App = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
            <Content isMobile={isMobile}>
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
            </Content>
        </Root>
    );
};

export default App;

import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import styled from 'styled-components';

const NavBar = lazy(() => import('../nav-bar/main-menu'));
const Dashboard = lazy(() => import('../dashboard/dashboard'));
const Transactions = lazy(() => import('../transactions/transactions'));
const Admin = lazy(() => import('../admin/admin'));
const NotFound = lazy(() => import('./not-found'));

const Root = styled(Container)`
    height: 100%;
    padding-top: 2rem;
`;

const App = () => (
    <Root>
        <NavBar />
        <Routes>
            <Route path="dash/*" element={<Dashboard />} />
            <Route path="tx/*" element={<Transactions /> } />
            <Route path="admin/*" element={<Admin /> } />
            <Route path="/" element={<Navigate to="/dash" />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </Root>
);

export default App;

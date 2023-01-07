import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Container from '@mui/material/Container';
import styled from 'styled-components';

const NavBar = lazy(() => import('./nav-bar'));
const Dashboard = lazy(() => import('./dashboard'));
const Transactions = lazy(() => import('./transactions'));

const Root = styled(Container)`
    height: 100%;
    margin-top: 2rem;
`;

const App = () => (
    <Root>
        <NavBar />
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="tx" element={<Transactions /> } />
        </Routes>
    </Root>
);

export default App;

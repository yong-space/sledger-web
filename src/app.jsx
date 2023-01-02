import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Container from '@mui/material/Container';

const Dashboard = lazy(() => import('./dashboard'));
const Transactions = lazy(() => import('./transactions'));
const Register = lazy(() => import('./register'));
const Login = lazy(() => import('./login'));

const App = () => (
    <Container>
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="tx" element={<Transactions /> } />
            <Route path="register" element={<Register /> } />
            <Route path="login" element={<Login /> } />
        </Routes>
    </Container>
);

export default App;

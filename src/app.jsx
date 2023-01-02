import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('./dashboard.jsx'));
const Transactions = lazy(() => import('./transactions.jsx'));

const App = () => (
    <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="tx" element={<Transactions/> } />
    </Routes>
);

export default App;

import { Routes, Route, Navigate } from 'react-router-dom';
import Summary from './summary';
import Insights from './insights';
import CreditCardStatements from './credit-card-statements';

const Dashboard = () => {
    return (
        <Routes>
            <Route path="summary" element={<Summary /> } />
            <Route path="insights/*" element={<Insights /> } />
            <Route path="credit-card-statements/*" element={<CreditCardStatements /> } />
            <Route path="" element={<Navigate to="summary" />} />
        </Routes>
    );
};
export default Dashboard;

import { Routes, Route, Navigate } from 'react-router-dom';
import Summary from './summary';
import Insights from './insights';
import CreditCardStatements from './credit-card-statements';
import state from '../core/state';

const Dashboard = () => {
    const [ route, setRoute ] = state.useState(state.dashRoute);
    return (
        <Routes>
            <Route path="summary" element={<Summary setRoute={setRoute} /> } />
            <Route path="insights/*" element={<Insights setRoute={setRoute} /> } />
            <Route path="credit-card-statements/*" element={<CreditCardStatements setRoute={setRoute} /> } />
            <Route path="" element={<Navigate to={route} />} />
        </Routes>
    );
};
export default Dashboard;

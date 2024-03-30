import { Routes, Route, Navigate } from 'react-router-dom';
import Summary from './summary';
import Insights from './insights';
import CreditCardBills from './credit-card-bills';
import BalanceHistory from './balance-history';
import state from '../core/state';

const Dashboard = () => {
    const [ route, setRoute ] = state.useState(state.dashRoute);
    return (
        <Routes>
            <Route path="summary" element={<Summary setRoute={setRoute} /> } />
            <Route path="insights/*" element={<Insights setRoute={setRoute} /> } />
            <Route path="credit-card-bills/*" element={<CreditCardBills setRoute={setRoute} /> } />
            <Route path="balance-history" element={<BalanceHistory setRoute={setRoute} />} />
            <Route path="" element={<Navigate to={route} />} />
        </Routes>
    );
};
export default Dashboard;

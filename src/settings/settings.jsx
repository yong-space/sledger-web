import { Routes, Route, Navigate } from 'react-router-dom';

import Accounts from './accounts';
import Templates from './templates';

const Settings = () => {
    return (
        <Routes>
            <Route path="accounts" element={<Accounts /> } />
            <Route path="templates" element={<Templates /> } />
            <Route path="" element={<Navigate to="accounts" />} />
        </Routes>
    );
};
export default Settings;

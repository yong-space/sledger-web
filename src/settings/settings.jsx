import { Routes, Route, Navigate } from 'react-router-dom';
import Profile from './profile';
import Accounts from './accounts';

const Settings = () => {
    return (
        <Routes>
            <Route path="profile" element={<Profile /> } />
            <Route path="accounts" element={<Accounts /> } />
            <Route path="" element={<Navigate to="profile" />} />
        </Routes>
    );
};
export default Settings;

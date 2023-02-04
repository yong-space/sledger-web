import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const Profile = lazy(() => import('./profile'));
const Accounts = lazy(() => import('./accounts'));

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

import { lazy } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Title from '../core/title';

const ManageIssuers = lazy(() => import('./manage-issuers'));
const ManageUsers = lazy(() => import('./manage-users'));

const Admin = () => {
    const location = useLocation();
    const [ tab, setTab ] = useState(location.pathname.endsWith('users') ? 1 : 0);

    return (
        <>
            <Title>Admin</Title>
            <Tabs
                value={tab}
                onChange={(event, newValue) => setTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="Select admin page"
            >
                <Tab label="Issuers" component={Link} to="issuers" />
                <Tab label="Users" component={Link} to="users" />
            </Tabs>
            <Box pt={1} pb={3}>
                <Routes>
                    <Route path="issuers" element={<ManageIssuers /> } />
                    <Route path="users" element={<ManageUsers /> } />
                    <Route path="" element={<Navigate to="issuers" />} />
                </Routes>
            </Box>
        </>
    )
};
export default Admin;

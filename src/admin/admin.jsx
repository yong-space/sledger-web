import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { lazy } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

const ManageIssuers = lazy(() => import('./manage-issuers'));
const ManageUsers = lazy(() => import('./manage-users'));

const Admin = () => {
    const [ value, setValue ] = useState(0);
    const handleChange = (event, newValue) => setValue(newValue);

    return (
        <>
            <Typography variant="h5" mb={2}>
                Admin
            </Typography>
            <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="Select admin page"
            >
                <Tab label="Issuers" component={Link} to="issuers" />
                <Tab label="Users" component={Link} to="users" />
            </Tabs>
            <Box p="1rem">
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

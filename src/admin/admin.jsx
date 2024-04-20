import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Title } from '../core/utils';
import styled from 'styled-components';
import ManageIssuers from './manage-issuers';
import ManageUsers from './manage-users';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 1px;
`;

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
            <Wrapper>
                <Routes>
                    <Route path="issuers" element={<ManageIssuers /> } />
                    <Route path="users" element={<ManageUsers /> } />
                    <Route path="" element={<Navigate to="issuers" />} />
                </Routes>
            </Wrapper>
        </>
    )
};
export default Admin;

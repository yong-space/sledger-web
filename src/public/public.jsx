import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import styled from 'styled-components';

const Register = lazy(() => import('./register'));
const Login = lazy(() => import('./login'));
const NotFound = lazy(() => import('../core/not-found'));

const Root = styled(Container)`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Public = () => (
    <Root>
        <Box>
            <Routes>
                <Route path="register" element={<Register /> } />
                <Route path="login" element={<Login /> } />
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Box>
    </Root>
);
export default Public;

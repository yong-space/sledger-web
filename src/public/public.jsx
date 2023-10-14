import { Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Login from './login';
import NotFound from '../core/not-found';
import Register from './register';
import styled from 'styled-components';

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

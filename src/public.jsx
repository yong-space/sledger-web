import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import styled from 'styled-components';

const Register = lazy(() => import('./register'));
const Login = lazy(() => import('./login'));

const Root = styled(Container)`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Public = () => (
    <Root>
        <Grid
            container item
            direction="column"
            sx={{ gap: '.8rem' }}
            xs={12} sm={8} lg={5}
        >
            <Routes>
                <Route path="register" element={<Register /> } />
                <Route path="login" element={<Login /> } />
            </Routes>
        </Grid>
    </Root>
);
export default Public;

import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Accounts from './accounts';
import Templates from './templates';

const Settings = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <Routes>
            <Route path="accounts" element={<Accounts isMobile={isMobile} /> } />
            <Route path="templates" element={<Templates isMobile={isMobile} /> } />
            <Route path="" element={<Navigate to="accounts" />} />
        </Routes>
    );
};
export default Settings;

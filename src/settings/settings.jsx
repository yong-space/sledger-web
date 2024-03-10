import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Accounts from './accounts';
import Templates from './templates';
import state from '../core/state';

const Settings = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [ route, setRoute ] = state.useState(state.settingsRoute);
    return (
        <Routes>
            <Route path="accounts" element={<Accounts isMobile={isMobile} setRoute={setRoute} /> } />
            <Route path="templates" element={<Templates isMobile={isMobile} setRoute={setRoute} /> } />
            <Route path="" element={<Navigate to={route} />} />
        </Routes>
    );
};
export default Settings;

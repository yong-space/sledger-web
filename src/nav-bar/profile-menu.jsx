import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountCircle from '@mui/icons-material/AccountCircle';
import api from '../core/api';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FaceIcon from '@mui/icons-material/Face';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LogoutIcon from '@mui/icons-material/Logout';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import state from '../core/state';
import styled from 'styled-components';

const FloatingMenu = styled(Menu)`
    pointer-events: none;
    .MuiPaper-root { pointer-events: all }
`;

const NavButton = styled(Button)`
    color: #fff;
    background-color: ${props => props.variant === 'contained' ? '#28415b' : 'transparent'};
    white-space: nowrap;
    text-overflow: hidden;
    justify-self: flex-end;
`;

const ProfileMenu = ({ currentPath }) => {
    let navigate = useNavigate();
    const { showStatus } = api();
    const [ session, setSession ] = state.useState(state.session);
    const [ open, setOpen ] = useState(false);

    const logout = () => {
        window.localStorage.clear();
        setSession(undefined);
        navigate('/login', { replace: true });
        showStatus('success', 'Logged out successfully');
    };

    const goto = (uri) => {
        setOpen(false);
        navigate(uri);
    };

    const menuItems = [
        { uri: 'profile', label: 'Profile', icon: <FaceIcon fontSize="small" /> },
    ];

    if (session.admin) {
        menuItems.push({ uri: 'admin', label: 'Admin', icon: <AccountBalanceWalletIcon fontSize="small" /> });
    }

    const ProfileMenuItem = ({ uri, label, icon }) => (
        <MenuItem onClick={() => goto(uri)}>
            <ListItemIcon>
                {icon}
            </ListItemIcon>
            <ListItemText>{label}</ListItemText>
        </MenuItem>
    );

    return (
        <>
            <NavButton
                id="avatar"
                startIcon={<AccountCircle />}
                size="large"
                aria-label="Profile Menu"
                aria-controls="profile-menu"
                aria-haspopup="true"
                onClick={() => open ? goto('profile') : setOpen(true)}
                onMouseOver={() => setOpen(true)}
                onMouseLeave={(e) => (e.relatedTarget.attributes.role?.value !== 'menu') && setOpen(false)}
                variant={currentPath.indexOf('profile') > -1 ? 'contained' : 'text'}
            >
                { session.name }
            </NavButton>
            <FloatingMenu
                id="profile-menu"
                anchorEl={() => document.querySelector('#avatar')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={open}
                MenuListProps={{
                    onMouseLeave: () => setOpen(false),
                }}
            >
                { menuItems.map((item) => <ProfileMenuItem key={item.uri} {...item} />) }
                <Divider />
                <MenuItem onClick={logout}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                </MenuItem>
            </FloatingMenu>
        </>
    );
};
export default ProfileMenu;

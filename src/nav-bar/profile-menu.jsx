import { atoms } from '../core/atoms';
import { useNavigate, Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountCircle from '@mui/icons-material/AccountCircle';
import api from '../core/api';
import Button from '@mui/material/Button';
import FaceIcon from '@mui/icons-material/Face';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LogoutIcon from '@mui/icons-material/Logout';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const ProfileMenu = ({ currentPath }) => {
    let navigate = useNavigate();
    const { showStatus } = api();
    const [ session, setSession ] = useRecoilState(atoms.session);
    const [ anchorEl, setAnchorEl ] = useState(null);
    const handleMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const logout = () => {
        window.localStorage.clear();
        setSession(undefined);
        navigate("/login", { replace: true });
        showStatus("success", "Logged out successfully");
    };

    return (
        <>
            <Button
                startIcon={<AccountCircle />}
                size="large"
                aria-label="Profile Menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                sx={{ color: "white" }}
                variant={currentPath.indexOf('/settings') === 0 ? 'contained' : 'text'}
            >
                { session.name }
            </Button>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                keepMounted
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem component={Link} to="/settings/profile" onClick={handleClose}>
                    <ListItemIcon>
                        <FaceIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem component={Link} to="/settings/accounts" onClick={handleClose} divider>
                    <ListItemIcon>
                        <AccountBalanceWalletIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Accounts</ListItemText>
                </MenuItem>
                <MenuItem onClick={logout}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};
export default ProfileMenu;

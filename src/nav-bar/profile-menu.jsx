import { atoms } from '../core/atoms';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import api from '../core/api';

const ProfileMenu = () => {
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
                color="inherit"
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
                <MenuItem onClick={logout}>Logout</MenuItem>
            </Menu>
        </>
    );
};
export default ProfileMenu;

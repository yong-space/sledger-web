import { Link } from 'react-router-dom';
import { useState, Fragment } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';

const Brand = styled(Typography)`
    margin: 1rem 2rem;
    font-weight: 200;
    letter-spacing: .15rem;
    user-select: none;
`;

const NavListItem = styled(ListItemButton)`
    border-radius: .3rem;
    &.Mui-selected { background-color: #375a7f; }
`;

const isSelected = (path, link) => path.indexOf(link) === 0;

const MobileMenu = ({ pages, currentPath }) => {
    const [ isOpen, setOpen ] = useState(false);

    const MobileListItem = ({ link, label }) => (
        <ListItem component={Link} to={link} onClick={() => setOpen(false)}>
            <NavListItem selected={isSelected(currentPath, link)}>
                <ListItemText primary={label} />
            </NavListItem>
        </ListItem>
    );

    return (
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" onClick={() => setOpen(true)} aria-label="Menu">
                <MenuIcon />
            </IconButton>
            <SwipeableDrawer
                open={isOpen}
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                PaperProps={{ sx: { width: '20rem' } }}
            >
                <Box>
                    <Brand variant="h6">Sledger</Brand>
                    <Divider />
                    <List>
                        { pages.map((item) => !item.children ?
                            <MobileListItem key={item.link} {...item} /> :
                            item.children.map((child) => <MobileListItem key={child.link} {...child} />)
                        )}
                    </List>
                </Box>
            </SwipeableDrawer>
        </Box>
    );
};
export default MobileMenu;

import { Link } from 'react-router-dom';
import { useState } from 'react';
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

const NavListItem = styled(ListItemButton)`
    background-color: ${props => props.selected ? '#375a7f' : 'transparent'};
    border-radius: .3rem;
`;

const isSelected = (path, link) => path.indexOf(link) === 0;

const MobileMenu = ({ pages, currentPath }) => {
  const [ isOpen, setOpen ] = useState(false);

  return (
    <Box sx={{ display: { xs: "flex", md: "none" } }}>
      <IconButton size="large" onClick={() => setOpen(true)} aria-label="Menu">
        <MenuIcon />
      </IconButton>
      <SwipeableDrawer
        open={isOpen}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        PaperProps={{ sx: { width: "20rem" } }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              my: 2, mx: 4,
              fontWeight: 200,
              letterSpacing: '.15rem',
              userSelect: 'none'
            }}
          >
            Sledger
          </Typography>
          <Divider />
          <List>
            {pages.map(({ label, link }) => (
              <ListItem key={link} component={Link} to={link} onClick={() => setOpen(false)}>
                <NavListItem selected={isSelected(currentPath, link)}>
                  <ListItemText primary={label} />
                </NavListItem>
              </ListItem>
            ))}
          </List>
        </Box>
      </SwipeableDrawer>
    </Box>
  );
};
export default MobileMenu;

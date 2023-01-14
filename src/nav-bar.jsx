import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Drawer from "@mui/material/Drawer";
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import { useRecoilState } from 'recoil';
import { atoms } from './atoms';

const Brand = ({ mobile, link }) => (
  <Typography
    variant="h6"
    noWrap
    sx={{
      mr: 2,
      display: mobile ? { xs: 'flex', md: 'none' } : { xs: 'none', md: 'flex' },
      fontWeight: 200,
      letterSpacing: '.1rem',
      flexGrow: mobile ? 1 : 0,
      cursor: 'pointer',
      userSelect: 'none',
    }}
    component={Link}
    to={link}
  >
    Sledger
  </Typography>
);

const MobileMenu = ({ pages }) => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((prev) => !prev);

  return (
    <Box sx={{ display: { xs: "flex", md: "none" } }}>
      <IconButton size="large" onClick={toggle}>
        <MenuIcon />
      </IconButton>
      <Drawer
        container={window?.document.body}
        variant="temporary"
        open={open}
        onClose={toggle}
        ModalProps={{ keepMounted: true }}
        sx={{ "& .MuiDrawer-paper": { boxSizing: "border-box", width: "20rem" }}}
      >
        <Box onClick={toggle}>
          <Typography variant="h6" sx={{ my: 2, mx: 4 }}>
            Sledger
          </Typography>
          <Divider />
          <List>
            {pages.map(({ label, link }) => (
              <ListItem key={link} component={Link} to={link}>
                <ListItemButton>
                  <ListItemText primary={label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

const DesktopMenu = ({ pages }) => (
  <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
    {pages.map(({ label, link}) => (
      <Button key={link} component={Link} to={link} sx={{ color: 'white' }}>
        {label}
      </Button>
    ))}
  </Box>
);

const NavBar = () => {
  const [ session ] = useRecoilState(atoms.session);
  const pages = [
    { label: 'Dashboard', link: '/' },
    { label: 'Transactions', link: 'tx' },
  ];
  if (session.isAdmin) {
    pages.push({ label: 'Admin', link: 'admin' });
  }

  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Brand mobile={false} link="/" />
          <MobileMenu pages={pages} />
          <Brand mobile={true} link="/" />
          <DesktopMenu pages={pages} />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default NavBar;

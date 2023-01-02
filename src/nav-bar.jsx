import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
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
  const [ anchor, setAnchor ] = useState(null);

  return (
    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
      <IconButton size="large" onClick={(e) => setAnchor(e.currentTarget)}>
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchor}
        keepMounted
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        {pages.map(({ label, link}) => (
          <MenuItem key={link} component={Link} to={link} onClick={() => setAnchor(null)}>
            <Typography>{label}</Typography>
          </MenuItem>
        ))}
      </Menu>
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

  const pages = session ? [
    { label: 'Dashboard', link: '/' },
    { label: 'Transactions', link: 'tx' },
  ] : [];

  const link = session ? '/' : 'login';

  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Brand mobile={false} link={link} />
          <MobileMenu {...{ pages }} />
          <Brand mobile={true} link={link} />
          <DesktopMenu {...{ pages }} />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default NavBar;

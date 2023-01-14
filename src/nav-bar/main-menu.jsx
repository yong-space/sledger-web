import { atoms } from '../atoms';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import DesktopMenu from './desktop-menu';
import MobileMenu from './mobile-menu';
import ProfileMenu from './profile-menu';
import styled from 'styled-components';

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

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
    <>
      <AppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Brand mobile={false} link="/" />
            <MobileMenu pages={pages} />
            <Brand mobile={true} link="/" />
            <DesktopMenu pages={pages} />
            <ProfileMenu />
          </Toolbar>
        </Container>
      </AppBar>
      <Offset />
    </>
  );
}
export default NavBar;

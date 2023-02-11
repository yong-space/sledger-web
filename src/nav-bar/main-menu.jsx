import { useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import DesktopMenu from './desktop-menu';
import MobileMenu from './mobile-menu';
import ProfileMenu from './profile-menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const Brand = ({ mobile }) => (
    <Typography
        variant="h6"
        noWrap
        sx={{
            mr: 2,
            display: mobile ? { xs: 'flex', md: 'none' } : { xs: 'none', md: 'flex' },
            fontWeight: 200,
            letterSpacing: '.15rem',
            flexGrow: mobile ? 1 : 0,
            userSelect: 'none'
        }}
    >
        Sledger
    </Typography>
);

const NavBar = () => {
    const location = useLocation();
    const pages = [
        { label: 'Dashboard', link: '/dash' },
        { label: 'Transactions', link: '/tx' },
        { label: 'Accounts', link: '/settings/accounts' },
    ];
    const props = { pages, currentPath: location.pathname };

    return (
        <AppBar position="fixed">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Brand mobile={false} />
                    <MobileMenu {...props} />
                    <Brand mobile={true} />
                    <DesktopMenu {...props} />
                    <ProfileMenu currentPath={location.pathname} />
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default NavBar;

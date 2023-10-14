import { useLocation } from 'react-router-dom';
import DesktopMenu from './desktop-menu';
import MobileMenu from './mobile-menu';
import ProfileMenu from './profile-menu';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';
import { useTheme } from '@mui/material/styles';

const AppBar = styled.header`
    background-color: #375a7f;
    margin: 0;
    padding: .7rem 1.5rem;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 100;

    ${props => props.theme.breakpoints.down("md")} {
        padding: .3rem;
    }
`;

const Group = styled.div`
    display: flex;
    align-items: center;
`;

const Brand = styled(Typography)`
    min-width: 5rem;
    margin-right: 1rem;
    display: flex;
    font-weight: 200;
    letter-spacing: .15rem;
    flex-grow: ${props => props.mobile ? 1 : 0};
    user-select: none;
    text-overflow: ellipsis;
    overflow: hidden;
`;

const NavBar = () => {
    const theme = useTheme();
    const location = useLocation();
    const pages = [
        {
            label: 'Dashboard',
            link: '/dash',
            children: [
                { label: 'Summary', link: '/dash/summary' },
                { label: 'Past Year Insights', link: '/dash/insights' },
                { label: 'Credit Card Statements', link: '/dash/credit-card-statements' },
            ],
        },
        {
            label: 'Transactions',
            link: '/tx',
        },
        {
            label: 'Settings',
            link: '/settings',
            children: [
                { label: 'Accounts', link: '/settings/accounts' },
                { label: 'Templates', link: '/settings/templates' },
            ],
        },
    ];
    const props = { pages, currentPath: location.pathname };

    return (
        <AppBar theme={theme}>
            <Group>
                <MobileMenu {...props} />
                <Brand variant="h6">Sledger</Brand>
            </Group>
            <DesktopMenu {...props} />
            <ProfileMenu currentPath={location.pathname} />
        </AppBar>
    );
}
export default NavBar;

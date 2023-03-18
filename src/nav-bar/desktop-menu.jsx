import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import styled from 'styled-components';

const NavButton = styled(Button)`
    color: #fff;
    background-color: ${props => props.variant === 'contained' ? '#28415b' : 'transparent'};
`;

const getVariant = (path, link) => path.indexOf(link) === 0 ? 'contained' : 'text';

const DesktopMenu = ({ pages, currentPath }) => (
  <Box sx={{ flexGrow: 1, gap: 1, display: { xs: "none", md: "flex" } }}>
    {pages.map(({ label, link }) => (
      <NavButton
        key={link}
        component={Link}
        to={link}
        variant={getVariant(currentPath, link)}
      >
        {label}
      </NavButton>
    ))}
  </Box>
);
export default DesktopMenu;

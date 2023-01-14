import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const getVariant = (path, link) => path.indexOf(link) === 0 ? 'contained' : 'text';

const DesktopMenu = ({ pages, currentPath }) => (
  <Box sx={{ flexGrow: 1, gap: 1, display: { xs: "none", md: "flex" } }}>
    {pages.map(({ label, link }) => (
      <Button
        key={link}
        component={Link}
        to={link}
        sx={{ color: "white" }}
        variant={getVariant(currentPath, link)}
      >
        {label}
      </Button>
    ))}
  </Box>
);
export default DesktopMenu;

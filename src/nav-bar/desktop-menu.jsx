import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const DesktopMenu = ({ pages }) => (
  <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
    {pages.map(({ label, link }) => (
      <Button key={link} component={Link} to={link} sx={{ color: "white" }}>
        {label}
      </Button>
    ))}
  </Box>
);
export default DesktopMenu;

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from "@mui/material/Drawer";
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';

const isSelected = (path, link) => path.indexOf(link) === 0;

const MobileMenu = ({ pages, currentPath }) => {
  let navigate = useNavigate();
  const [ isOpen, setOpen ] = useState(false);
  const goto = (link) => {
    setOpen(false);
    navigate(link, { replace: true });
  };

  return (
    <Box sx={{ display: { xs: "flex", md: "none" } }}>
      <IconButton size="large" onClick={() => setOpen(true)}>
        <MenuIcon />
      </IconButton>
      <Drawer
        container={window?.document.body}
        variant="temporary"
        open={isOpen}
        onClose={() => setOpen(false)}
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
              <ListItem key={link} onClick={() => goto(link)}>
                <ListItemButton selected={isSelected(currentPath, link)}>
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
export default MobileMenu;

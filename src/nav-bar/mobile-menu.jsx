import { Link } from 'react-router-dom';
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

const MobileMenu = ({ pages }) => {
  const [ open, setOpen ] = useState(false);
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
        sx={{
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: "20rem" },
        }}
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
export default MobileMenu;

import Grow from '@mui/material/Grow';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';

// Hover-triggered dropdown. Deliberately not a Menu: Menu is modal, so it
// aria-hides the rest of the app and traps focus, neither of which fits a
// menu the pointer merely hovers over.
const FloatingMenu = ({ id, anchorEl, open, placement, onMouseLeave, children }) => (
    <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        transition
        sx={{ zIndex: 'modal' }}
    >
        {({ TransitionProps }) => (
            <Grow
                {...TransitionProps}
                style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}
            >
                <Paper elevation={8}>
                    <MenuList onMouseLeave={onMouseLeave}>
                        {children}
                    </MenuList>
                </Paper>
            </Grow>
        )}
    </Popper>
);
export default FloatingMenu;

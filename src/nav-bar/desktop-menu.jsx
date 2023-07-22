import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState, Fragment } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import styled from 'styled-components';

const FloatingMenu = styled(Menu)`
    pointer-events: none;
    .MuiPaper-root { pointer-events: all }
`;

const NavButton = styled(Button)`
    color: #fff;
    padding: .4rem .8rem;
    background-color: ${props => props.variant === 'contained' ? '#28415b' : 'transparent'};
`;

const getVariant = (path, link) => path.indexOf(link) === 0 ? 'contained' : 'text';

const DesktopMenu = ({ pages, currentPath }) => {
    let navigate = useNavigate();
    const [ openMenu, setOpenMenu ] = useState();

    const goto = (uri) => {
        setOpenMenu(undefined);
        navigate(uri);
    };

    return (
        <Box sx={{ flexGrow: 1, gap: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map(({ label, link, children }) => {
                const buttonProps = !children ? {} : {
                    id: `${link.substring(1)}-button`,
                    'aria-label': label,
                    'aria-controls': `${link.substring(1)}-menu`,
                    'aria-haspopup': true,
                    onMouseOver: () => setOpenMenu(link),
                    onMouseLeave: (e) => (e.relatedTarget.attributes?.role?.value !== 'menu') && setOpenMenu(undefined),
                };
                return (
                    <Fragment key={link}>
                        <NavButton
                            component={Link}
                            to={link}
                            variant={getVariant(currentPath, link)}
                            {...buttonProps}
                            onClick={() => setOpenMenu(undefined)}
                        >
                            {label}
                        </NavButton>
                        { children && (
                            <FloatingMenu
                                id={`${link.substring(1)}-menu`}
                                anchorEl={() => document.querySelector(`#${link.substring(1)}-button`)}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                open={openMenu === link}
                                MenuListProps={{
                                    onMouseLeave: () => setOpenMenu(undefined),
                                }}
                            >
                                { children.map((item) => (
                                    <MenuItem key={item.link} onClick={() => goto(item.link)}>
                                        <ListItemText>{item.label}</ListItemText>
                                    </MenuItem>
                                ))}
                            </FloatingMenu>
                        )}
                    </Fragment>
                );
            })}
        </Box>
    );
};
export default DesktopMenu;

import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { useTheme } from '@mui/material/styles';
import TextField from "@mui/material/TextField";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';

const CenteredDialog = styled(Dialog)`
    .MuiDialogContent-root {
        display: flex;
        align-items: center;
        .MuiStack-root {
            flex: 1 1 1px;
            flex-wrap: wrap;
            gap: 1rem;
            flex-direction: row;
            justify-content: space-between;
        }
    }
`;

const Search = ({ setSearchOpen }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const handleSearch = () => navigate(`/tx/0?q=${inputRef.current.value}`);

    return (
        <CenteredDialog
            open
            fullWidth
            fullScreen={isMobile}
            aria-labelledby="search-dialog-title"
            aria-describedby="search-dialog-description"
        >
            <DialogTitle id="search-dialog-title">
                Search Transactions
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={() => setSearchOpen(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent>
                <Stack>
                    <TextField
                        fullWidth
                        placeholder="Search by remarks.."
                        autoFocus
                        inputRef={inputRef}
                        onKeyDown={({key}) => {
                            if (key === "Enter") {
                                handleSearch();
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleSearch}
                    >
                        Search
                    </Button>
                </Stack>
            </DialogContent>
        </CenteredDialog>
    );
};
export default Search;

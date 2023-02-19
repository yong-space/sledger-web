import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

const ConfirmDialog = ({ open, setOpen, title, message, confirm }) => (
    <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
    >
        <DialogTitle id="confirm-dialog-title">
            {title}
        </DialogTitle>
        <DialogContent>
            <DialogContentText id="confirm-dialog-description">
                {message}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant="outlined" color="error" onClick={confirm}>
                Confirm
            </Button>
            <Button variant="outlined" onClick={() => setOpen(false)} autoFocus>
                Cancel
            </Button>
        </DialogActions>
    </Dialog>
);
export default ConfirmDialog;

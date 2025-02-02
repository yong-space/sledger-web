import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import state from '../core/state';

const ConfirmDialog = ({ open, setOpen, title, message, confirm }) => {
    const loading = state.useState(state.loading)[0];
    const close = () => {
        if (!loading) {
            setOpen(false);
        }
    };
    return (
        <Dialog
            open={open}
            onClose={close}
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
                <Button variant="contained" color="error" onClick={confirm} loading={loading}>
                    Confirm
                </Button>
                <Button variant="contained" onClick={() => setOpen(false)} autoFocus disabled={loading}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default ConfirmDialog;

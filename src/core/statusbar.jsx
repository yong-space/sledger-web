import { atoms } from './atoms';
import { useRecoilState } from 'recoil';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const StatusBar = () => {
    const [ status, setStatus ] = useRecoilState(atoms.status);
    const close = (event, reason) => reason !== 'clickaway'
        && setStatus((prev) => ({ ...prev, open: false }));

    return (
        <Snackbar
            open={status.open}
            onClose={close}
            autoHideDuration={status.severity === 'error' ? 10000 : 3000}
        >
            <MuiAlert
                elevation={6}
                variant="filled"
                onClose={close}
                severity={status.severity}
                sx={{ color: '#fff', userSelect: 'none' }}
            >
                {status.msg}
            </MuiAlert>
        </Snackbar>
    );
};
export default StatusBar;

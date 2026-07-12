import MuiDialog from '@mui/material/Dialog';
import { useBlurOnOpen } from './blur-on-open';

// Dialog that avoids Chrome's "Blocked aria-hidden" warning — see
// blur-on-open.js. Use this instead of @mui/material/Dialog.
const Dialog = (props) => {
    useBlurOnOpen(props.open);
    return <MuiDialog {...props} />;
};
export default Dialog;

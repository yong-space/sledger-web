import { useRecoilState } from 'recoil';
import { atoms } from './atoms';
import { useTheme } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import styled from 'styled-components';

const StatusBar = () => {
  const theme = useTheme();
  const [ status, setStatus ] = useRecoilState(atoms.status);
  const close = () => setStatus((prev) => ({ ...prev, open: false }));

  const CustomSnackbarContent = styled(SnackbarContent)`
    background-color: ${props => theme.palette[props.severity].dark};
    color: white;
    font-weight: bold;
    cursor: pointer;
    user-select: 'none';
  `;

  return (
    <Snackbar
      open={status.open}
      onClose={close}
      onClick={close}
      autoHideDuration={status.error ? 10000 : 2000}
    >
      <CustomSnackbarContent severity={status.severity} message={status.msg} />
    </Snackbar>
  );
};
export default StatusBar;

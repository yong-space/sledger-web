import { useRecoilState } from 'recoil';
import { atoms } from './atoms';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import styled from 'styled-components';

const colors = {
  success: '#4e9a51',
  warning: 'yellow',
  error: '#d74545',
};

const CustomSnackbarContent = styled(SnackbarContent)`
  background-color: ${props => colors[props.severity]};
  color: white;
  font-weight: bold;
  cursor: pointer;
  user-select: 'none';
`;

const StatusBar = () => {
  const [ status, setStatus ] = useRecoilState(atoms.status);
  const close = () => setStatus((prev) => ({ ...prev, open: false }));

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

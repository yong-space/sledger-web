import { useRecoilState } from "recoil";
import { atoms } from "./atoms";
import { useTheme } from "@mui/material/styles";
import Snackbar from "@mui/material/Snackbar";
import SnackbarContent from "@mui/material/SnackbarContent";
import styled from "styled-components";

const CustomSnackbarContent = styled(SnackbarContent)`
    background-color: ${(props) => props.palette[props.severity].dark};
    color: white;
    font-weight: bold;
    cursor: pointer;
    user-select: "none";
`;

const StatusBar = () => {
    const theme = useTheme();
    const [status, setStatus] = useRecoilState(atoms.status);
    const close = () => setStatus((prev) => ({ ...prev, open: false }));

    return (
        <Snackbar
            open={status.open}
            onClose={close}
            onClick={close}
            autoHideDuration={status.severity === 'error' ? 10000 : 2000}
        >
            <CustomSnackbarContent
                palette={theme.palette}
                severity={status.severity}
                message={status.msg}
            />
        </Snackbar>
    );
};
export default StatusBar;

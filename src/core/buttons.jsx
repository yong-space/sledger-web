import { useTheme } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Button from '@mui/material/Button';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import IconButton from '@mui/material/IconButton';
import PublishIcon from '@mui/icons-material/Publish';
import useMediaQuery from '@mui/material/useMediaQuery';

const ActionButton = ({ color, startIcon, label, onClick, solo, disabled }) => {
    const size = '2.5rem';
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return !solo && isMobile ? (
        <IconButton
            sx={{ width: size, height: size, backgroundColor: theme.palette[color].dark }}
            onClick={onClick}
        >
            { startIcon }
        </IconButton>
    ) : (
        <Button
            variant="contained"
            color={color}
            startIcon={startIcon}
            sx={{ height: size }}
            onClick={onClick}
            disabled={!!disabled}
        >
            {label}
        </Button>
    );
};

export const AddButton = (props) => (
    <ActionButton
        label="Add"
        color="success"
        startIcon={<AddCircleOutlineIcon />}
        {...props}
    />
);

export const EditButton = (props) => (
    <ActionButton
        label="Edit"
        color="warning"
        startIcon={<EditOutlinedIcon />}
        {...props}
    />
);

export const DeleteButton = (props) => (
    <ActionButton
        label="Delete"
        color="error"
        startIcon={<DeleteForeverIcon />}
        {...props}
    />
);

export const ImportButton = (props) => (
    <ActionButton
        label="Import"
        color="info"
        startIcon={<PublishIcon />}
        {...props}
    />
);

export const BiometricButton = (props) => (
    <ActionButton
        label="Biometric"
        color={props.color || 'info'}
        startIcon={<FingerprintIcon />}
        {...props}
    />
);

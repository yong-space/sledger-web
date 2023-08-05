import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Button from '@mui/material/Button';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PublishIcon from '@mui/icons-material/Publish';

const ActionButton = (props) => (
    <Button
        variant="contained"
        sx={{ height: '2.5rem' }}
        {...props}
    >
        {props.label}
    </Button>
);

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

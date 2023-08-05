import { AddButton, EditButton, DeleteButton } from '../core/buttons';
import Stack from '@mui/material/Stack';

const AccountsActionButtons = () => {
    return (
        <Stack direction="row" spacing={1} sx={{ display: 'none' }}>
            <AddButton />
            <EditButton />
            <DeleteButton />
        </Stack>
    );
};
export default AccountsActionButtons;

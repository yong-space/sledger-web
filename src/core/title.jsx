import Typography from '@mui/material/Typography';

const Title = ({ mb, children }) => (
    <Typography variant="h5" mb={mb || 2} mr={2}>
        {children}
    </Typography>
);
export default Title;

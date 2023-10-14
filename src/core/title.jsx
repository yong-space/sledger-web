import Typography from '@mui/material/Typography';

const Title = ({ mb, children }) => (
    <Typography variant="h5" m={0} mb={mb}>
        {children}
    </Typography>
);
export default Title;

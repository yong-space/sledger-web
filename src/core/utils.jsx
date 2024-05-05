import { Divider, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import styled from 'styled-components';

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Card = styled.div`
  background: ${grey[900]};
  border-radius: .5rem;
`;

const CircularLoader = () => (
  <Root>
    <CircularProgress size="5rem" thickness={2} />
  </Root>
);

const HorizontalLoader = () => (
  <Box width="100%" height="100%">
    <Skeleton animation="wave" />
    <Skeleton animation="wave"  />
    <Skeleton animation="wave" />
    <Skeleton animation="wave" />
  </Box>
);

const Title = ({ children }) => (
  <Typography variant="h5" m={0}>
      {children}
  </Typography>
);

const SubTitle = ({ children }) => (
  <Typography variant="h6" mb={1}>
      {children}
  </Typography>
);

const Error = ({ title, message }) => (
  <Root>
    <Card>
      <Typography m={3} variant="h4">
        {title}
      </Typography>
      <Divider />
      <Typography m={3}>
        {message}
      </Typography>
    </Card>
  </Root>
);

const NotFound = () => <Error title="Not Found" message="This page does not exist" />;

const NoConnectivity = () => <Error title="No Connectivity" message="Sledger is unavailable at the moment" />;

export {
  CircularLoader,
  HorizontalLoader,
  Title,
  SubTitle,
  NotFound,
  NoConnectivity,
};

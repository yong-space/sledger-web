import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import styled from 'styled-components';

const LoaderCircularRoot = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CircularLoader = () => (
  <LoaderCircularRoot>
    <CircularProgress size="5rem" thickness={2} />
  </LoaderCircularRoot>
);

const HorizontalLoader = () => (
  <Box width="100%" height="100%">
    <Skeleton animation="wave" />
    <Skeleton animation="wave"  />
    <Skeleton animation="wave" />
    <Skeleton animation="wave" />
  </Box>
);

export { CircularLoader, HorizontalLoader }

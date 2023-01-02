import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import StatusBar from './statusbar.jsx';
import NavBar from './nav-bar';
import Loader from './loader';
import App from './app';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css';

const darkTheme = createTheme({
  palette: { mode: "dark" },
});

const Index = () => (
  <RecoilRoot>
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <NavBar />
        <Suspense fallback={<Loader />}>
          <Container>
            <App />
          </Container>
        </Suspense>
        <StatusBar />
      </ThemeProvider>
    </BrowserRouter>
  </RecoilRoot>
);

createRoot(document.querySelector("#root")).render(<Index />);

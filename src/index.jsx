import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Session from './core/session';
import StatusBar from './core/statusbar';
import { CircularLoader } from './core/loader';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css';

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#375a7f",
      dark: "#375a7f"
    },
  },
});

const Index = () => (
  <RecoilRoot>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Suspense fallback={<CircularLoader />}>
        <BrowserRouter>
          <Session />
        </BrowserRouter>
        <StatusBar />
      </Suspense>
    </ThemeProvider>
  </RecoilRoot>
);

createRoot(document.querySelector("#root")).render(<Index />);

import { Suspense, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Session from './session';
import StatusBar from './statusbar';
import NavBar from './nav-bar';
import Loader from './loader';
import App from './app';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css';

const darkTheme = createTheme({
  palette: { mode: 'dark' },
});

const Index = () => {
  const [ session, setSession ] = useState();

  return (
    <BrowserRouter>
      <RecoilRoot>
        <Session>
          <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Suspense fallback={<Loader />}>
              <NavBar />
              <App />
              <StatusBar />
            </Suspense>
          </ThemeProvider>
        </Session>
      </RecoilRoot>
    </BrowserRouter>
  );
};

createRoot(document.querySelector('#root')).render(<Index />);

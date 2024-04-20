import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter } from 'react-router-dom';
import { CircularLoader } from './core/utils';
import { createRoot } from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import { registerSW } from 'virtual:pwa-register';
import { StyleSheetManager } from "styled-components";
import { Suspense } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import isPropValid from "@emotion/is-prop-valid";
import Session from './core/session';
import StatusBar from './core/statusbar';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#5890cb',
            dark: '#5890cb',
        },
        success: {
            main: '#388e3c',
            dark: '#388e3c',
        },
        error: {
            main: '#d32f2f',
            dark: '#d32f2f',
        },
    },
});

registerSW({ immediate: true });

const shouldForwardProp = (propName, elementToBeRendered) =>
    typeof elementToBeRendered === "string"
        ? isPropValid(propName) && !["height", "width"].includes(propName)
        : true;

const Index = () => (
    <RecoilRoot>
        <StyleSheetManager shouldForwardProp={shouldForwardProp}>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <Suspense fallback={<CircularLoader />}>
                    <BrowserRouter>
                        <Session />
                    </BrowserRouter>
                    <StatusBar />
                </Suspense>
            </ThemeProvider>
        </StyleSheetManager>
    </RecoilRoot>
);

createRoot(document.querySelector('#root')).render(<Index />);

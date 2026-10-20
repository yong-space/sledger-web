import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { StyleSheetManager } from "styled-components";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import isPropValid from "@emotion/is-prop-valid";
import Session from './core/session';
import StatusBar from './core/statusbar';
import { blurActiveElement } from './core/blur-on-open';
import { registerSW } from 'virtual:pwa-register';

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
            contrastText: '#fff',
        },
        error: {
            main: '#d32f2f',
            dark: '#d32f2f',
        },
    },
    components: {
        MuiSelect: {
            defaultProps: {
                // Select opens a modal Menu; blur the trigger first so the
                // aria-hidden applied to #root never hides a focused element
                // (Chrome's "Blocked aria-hidden" warning). See blur-on-open.js.
                onOpen: blurActiveElement,
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                panelWrapper: { maxWidth: '100dvw' },
            },
        },
    },
});

const shouldForwardProp = (propName, elementToBeRendered) =>
    typeof elementToBeRendered === "string"
        ? isPropValid(propName) && !["height", "width"].includes(propName)
        : true;

registerSW({ immediate: true });

const Index = () => (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <BrowserRouter>
                <Session />
            </BrowserRouter>
            <StatusBar />
        </ThemeProvider>
    </StyleSheetManager>
);

createRoot(document.querySelector('#root')).render(<Index />);

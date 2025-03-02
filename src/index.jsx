import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { StyleSheetManager } from "styled-components";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import isPropValid from "@emotion/is-prop-valid";
import Session from './core/session';
import StatusBar from './core/statusbar';

import '@fontsource/roboto/300';
import '@fontsource/roboto/400';
import '@fontsource/roboto/500';
import '@fontsource/roboto/700';
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

const shouldForwardProp = (propName, elementToBeRendered) =>
    typeof elementToBeRendered === "string"
        ? isPropValid(propName) && !["height", "width"].includes(propName)
        : true;

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

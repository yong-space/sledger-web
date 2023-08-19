import { BarChart } from '@mui/x-charts';
import { DataGrid } from '@mui/x-data-grid';
import { formatDecimal, formatNumber } from '../util/formatters';
import { HorizontalLoader } from '../core/loader';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import api from '../core/api';
import dayjs from 'dayjs';
import styled from 'styled-components';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Title from '../core/title';
import useMediaQuery from '@mui/material/useMediaQuery';

const Root = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1 1 1px;
`;

const ContentRoot = styled.div`
    display: flex;
    flex: 1 1 1px;
    height: calc(100vh - 12rem);
`;

const GridBox = styled.div`
    display: flex;
    flex: 1 1 1px;
    margin-bottom: ${props => props.isMobile ? '.5rem' : '1rem' };
`;

const Insights = () => {
    const location = useLocation();
    const { getInsights } = api();
    const [ tab, setTab ] = useState(location.pathname.endsWith('monthly') ? 1 : 0);
    const [ insights, setInsights ] = useState();

    useEffect(() => getInsights((response) => setInsights(response)), []);

    const AverageGrid = () => {
        const theme = useTheme();
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
        const maxGridSize = {
            maxWidth: `calc(100vw - ${isMobile ? 1 : 3}rem)`,
            maxHeight: `calc(100vh - ${isMobile ? 12 : 13}rem)`,
        };
        const columns = [
            { flex: 1, field: 'category', headerName: 'Category' },
            { flex: 1, field: 'average', type: 'number', valueFormatter: formatDecimal, headerName: 'Average' },
            { flex: 1, field: 'transactions', type: 'number', valueFormatter: formatNumber, headerName: 'Transactions' },
        ];
        return (
            <GridBox isMobile={isMobile}>
                <DataGrid
                    hideFooter
                    disableColumnMenu
                    density="compact"
                    rows={insights.summary}
                    columns={columns}
                    sx={maxGridSize}
                    getRowId={({ category }) =>  category}
                />
            </GridBox>
        );
    };

    const formatAxis = ({ xaxis }) => xaxis.map((str) => dayjs(str).format('MMM'));

    const MonthlyChart = () => (
        <BarChart
            series={insights.series}
            xAxis={[{ data: formatAxis(insights), scaleType: 'band' }]}
            sx={{ ['.MuiChartsLegend-root'] : { 'display': 'none' } }}
            margin={{ top: 10, right: 0 }}
        />
    );

    return (
        <Root spacing={3} pb={3}>
            <Title mb={-1}>Insights</Title>
            { !insights ? <HorizontalLoader /> : (
                <>
                    <Tabs
                        value={tab}
                        onChange={(event, newValue) => setTab(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="Select insights page"
                    >
                        <Tab label="Average" component={Link} to="average" />
                        <Tab label="Monthly" component={Link} to="monthly" />
                    </Tabs>
                    <ContentRoot>
                        <Routes>
                            <Route path="average" element={<AverageGrid /> } />
                            <Route path="monthly" element={<MonthlyChart /> } />
                            <Route path="" element={<Navigate to="average" />} />
                        </Routes>
                    </ContentRoot>
                </>
            )}
        </Root>
    );
};
export default Insights;

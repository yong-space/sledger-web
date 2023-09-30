import { BarChart } from '@mui/x-charts';
import { DataGrid } from '@mui/x-data-grid';
import { formatDecimal, formatNumber } from '../util/formatters';
import { HorizontalLoader } from '../core/loader';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import api from '../core/api';
import dayjs from 'dayjs';
import FormControlLabel from '@mui/material/FormControlLabel';
import styled from 'styled-components';
import Switch from '@mui/material/Switch';
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
    overflow: hidden;
`;

const TabRow = styled.div`
    display: flex;
    justify-content: space-between;
`;

const GridBox = styled.div`
    display: flex;
    flex: 1 1 1px;
`;

const Insights = () => {
    const location = useLocation();
    const { getInsights } = api();
    const [ tab, setTab ] = useState(location.pathname.endsWith('monthly') ? 1 : 0);
    const [ insights, setInsights ] = useState();
    const [ categorySummary, setCategorySummary ] = useState();
    const [ breakdown, setBreakdown ] = useState(false);

    useEffect(() => getInsights((response) => {
        const keys = [ 'sum', 'transactions' ];
        const summary = response.summary
            .map((s) => ({ ...s, sum: s.average * s.transactions }))
            .reduce((acc, curr) => {
                acc[curr.category] = acc[curr.category] || Object.assign(...keys.map(k => ({ [k]: 0 })));
                keys.forEach(k => acc[curr.category][k] += curr[k]);
                return acc;
            }, Object.create(null));
        const summaryList = Object.keys(summary).map((category) => ({
            category,
            transactions: summary[category].transactions,
            average: summary[category].sum / summary[category].transactions,
        }));
        setCategorySummary(summaryList);
        setInsights(response);
    }), []);

    const AverageGrid = () => {
        const theme = useTheme();
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
        const maxGridSize = {
            maxWidth: `calc(100vw - ${isMobile ? 1 : 3}rem)`,
            maxHeight: `calc(100vh - ${isMobile ? 11.9 : 12.6}rem)`,
        };
        const columns = [
            { flex: 1, field: 'category', headerName: 'Category' },
            { flex: 1, field: 'subCategory', headerName: 'Sub-category' },
            { flex: 1, field: 'average', type: 'number', valueFormatter: formatDecimal, headerName: 'Average' },
            { flex: 1, field: 'transactions', type: 'number', valueFormatter: formatNumber, headerName: 'Transactions' },
        ];
        return (
            <GridBox isMobile={isMobile}>
                <DataGrid
                    hideFooter
                    disableColumnMenu
                    density="compact"
                    rows={breakdown ? insights.summary : categorySummary}
                    columns={breakdown ? columns : columns.filter(({ field }) => field !== 'subCategory')}
                    sx={maxGridSize}
                    getRowId={({ category, subCategory }) => category + subCategory }
                    initialState={{
                        sorting: {
                            sortModel: [{ field: 'average', sort: 'asc' }],
                        },
                    }}
                />
            </GridBox>
        );
    };

    const formatAxis = ({ xaxis }) => xaxis.map((str) => dayjs.utc(str).format('MMM'));

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
                    <TabRow>
                        <Tabs
                            value={tab}
                            onChange={(e, newValue) => setTab(newValue)}
                            variant="scrollable"
                            scrollButtons="auto"
                            aria-label="Select insights page"
                        >
                            <Tab label="Average" component={Link} to="average" />
                            <Tab label="Monthly" component={Link} to="monthly" />

                        </Tabs>
                        { tab === 0 && (<FormControlLabel
                            label="Breakdown"
                            control={<Switch
                                checked={breakdown}
                                onChange={({ target }) => setBreakdown(target.checked)}
                            />}
                        />) }
                    </TabRow>

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

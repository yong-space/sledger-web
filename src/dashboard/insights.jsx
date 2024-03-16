import { BarChart } from '@mui/x-charts';
import { DataGrid } from '@mui/x-data-grid';
import { formatDecimal, formatNumber } from '../util/formatters';
import { HorizontalLoader } from '../core/loader';
import { pink, lightGreen } from '@mui/material/colors';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import api from '../core/api';
import Box from '@mui/system/Box';
import Chip from '@mui/material/Chip';
import dayjs from 'dayjs';
import FormControlLabel from '@mui/material/FormControlLabel';
import randomColor from 'randomcolor';
import state from '../core/state';
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
    .red { color: ${pink[300]} }
    .green { color: ${lightGreen[300]} }
`;

const FooterRoot = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: rgb(81, 81, 81) 1px solid;
    min-height: 3.25rem;
    .MuiTablePagination-root { overflow: hidden }
    .MuiTablePagination-actions { margin-left: .5rem }
    .MuiButtonBase-root { padding: .2rem }
`;

const IssuerChip = styled(Chip)`
    border-radius: .5rem;
    height: fit-content;
    font-size: .875rem;
    padding: ${props => props.colour ? '.2rem .5rem' : '.2rem 0'};
    color: ${props => props.colour};
    border-color: ${props => props.colour || 'transparent'};
    .MuiChip-label { padding: 0 }
`;

const Insights = ({ setRoute }) => {
    const location = useLocation();
    const { getInsights } = api();
    const [ tab, setTab ] = useState(location.pathname.endsWith('monthly') ? 1 : 0);
    const [ insights, setInsights ] = useState();
    const [ categorySummary, setCategorySummary ] = useState();
    const [ breakdown, setBreakdown ] = useState(false);
    const [ palette, setPalette ] = useState();
    const [ paletteMap, setPaletteMap ] = useState();

    useEffect(() => getInsights((response) => {
        const keys = [ 'average', 'transactions' ];
        const summary = response.summary.reduce((acc, curr) => {
                acc[curr.category] = acc[curr.category] || Object.assign(...keys.map(k => ({ [k]: 0 })));
                keys.forEach(k => acc[curr.category][k] += curr[k]);
                return acc;
            }, Object.create(null));
        const summaryList = Object.keys(summary).map((category) => ({
            category,
            transactions: summary[category].transactions,
            average: summary[category].average,
        }));
        setCategorySummary(summaryList);

        const processedResponse = { ...response };
        processedResponse.summary = processedResponse.summary.map((o) => {
            const subCat = o.subCategory && o.subCategory !== o.category ? `${o.category}: ${o.subCategory}` : o.category;
            return { ...o, subCategory: subCat };
        });

        const workingPalette = randomColor({ luminosity: 'light', count: response.summary.length });
        setPalette(workingPalette);

        const workingPaletteMap = {};
        Object.keys(summary).forEach((item, i) => workingPaletteMap[item] = workingPalette[i]);
        setPaletteMap(workingPaletteMap);

        setInsights(processedResponse);
    }), []);

    const AverageGrid = () => {
        useEffect(() => setRoute('insights/average'), []);
        const theme = useTheme();
        const navigate = useNavigate();
        const setFilterModel = state.useState(state.filterModel)[1];
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
        const maxGridSize = {
            maxWidth: `calc(100vw - ${isMobile ? 1 : 3}rem)`,
            maxHeight: `calc(100vh - ${isMobile ? 11.9 : 12.6}rem)`,
        };
        const getColourClassForValue = ({ value }) => !value ? '' : value > 0 ? 'green' : 'red';
        const columns = [
            {
                flex: 1, field: 'category', headerName: 'Category',
                renderCell: ({ value }) => (
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                        <IssuerChip label={value} colour={paletteMap[value]} variant="outlined" />
                    </div>
                ),
            },
            {
                flex: 1, field: 'subCategory', headerName: 'Sub-category',
                renderCell: ({ row }) => (
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                        <IssuerChip label={row.category} colour={paletteMap[row.category]} variant="outlined" />
                        <IssuerChip label={row.subCategory.replace(row.category + ': ', '')} variant="outlined" />
                    </div>
                ),
            },
            { width: isMobile ? 110 : 200, field: 'average', type: 'number', valueFormatter: formatDecimal, headerName: 'Average', cellClassName: getColourClassForValue },
            { width: isMobile ? 65 : 150, field: 'transactions', type: 'number', valueFormatter: formatNumber, headerName: isMobile ? 'Tx' : 'Transactions' },
        ];

        const handleDoubleClick = ({ row }) => {
            const value = breakdown ? row.subCategory : row.category;
            const filter = {
                items: [
                    {
                        field: 'category',
                        id: 1,
                        operator: value ? (breakdown ? 'equals' : 'startsWith') : 'isEmpty',
                        value: value || undefined,
                    },
                ],
                logicOperator: "and"
            };
            setFilterModel(filter);
            navigate('/tx/0');
        };

        const GridFooter = () => {
            const rows = (breakdown ? insights.summary : categorySummary).length;
            const noun = breakdown ? 'Sub-categor' : 'Categor';
            const plural = (rows > 1) ? 'ies' : 'y';

            return (
                <FooterRoot>
                    <Box sx={{ marginLeft: '1rem' }}>
                        { rows } { noun }{ plural }
                        : { formatDecimal(categorySummary.reduce((a, b) => a + b.average, 0)) }
                    </Box>
                </FooterRoot>
            );
        };

        return (
            <GridBox isMobile={isMobile}>
                <DataGrid
                    disableColumnMenu
                    density="compact"
                    rows={breakdown ? insights.summary : categorySummary}
                    columns={columns.filter(({ field }) => field !== (breakdown ? 'category' : 'subCategory'))}
                    sx={maxGridSize}
                    getRowId={({ category, subCategory }) => category + subCategory }
                    initialState={{
                        sorting: {
                            sortModel: [{ field: 'average', sort: 'asc' }],
                        },
                    }}
                    onRowDoubleClick={handleDoubleClick}
                    slots={{ footer: GridFooter }}
                />
            </GridBox>
        );
    };

    const formatAxis = ({ xaxis }) => xaxis.map((str) => dayjs.utc(str).format('MMM'));

    const MonthlyChart = () => {
        useEffect(() => setRoute('insights/monthly'), []);
        return (
            <BarChart
                series={insights.series}
                xAxis={[{ data: formatAxis(insights), scaleType: 'band' }]}
                sx={{ ['.MuiChartsLegend-root'] : { 'display': 'none' } }}
                margin={{ top: 10, right: 0 }}
                colors={palette}
                tooltip={{ trigger: 'item' }}
            />
        );
    };

    return (
        <Root spacing={3} pb={3}>
            <Title>Past Year Insights</Title>
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

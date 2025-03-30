import { BarChart } from '@mui/x-charts';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { formatDecimal, formatNumber } from '../util/formatters';
import { HorizontalLoader } from '../core/utils';
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
import { Title } from '../core/utils';
import useMediaQuery from '@mui/material/useMediaQuery';

const Root = styled.div`
    display: flex;
    flex: 1 1 1px;
    flex-direction: column;
    height: 100dvh;
    overflow: hidden;

    details > summary {
        font-weight: 500;
        font-size: 1.1rem;
        cursor: pointer;
    }
    details > div {
        display: inline-flex;
        flex-wrap: wrap;
        flex-direction: row;
        gap: .5rem .8rem;
        padding: 1rem;
        .MuiChip-labelMedium { font-size: 1rem }
    }
`;

const TabRow = styled.div`
    display: flex;
    justify-content: space-between;
`;

const FlexDataGrid = styled(DataGrid)`
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
type IssuerChipProps = { colour?: string }
const IssuerChip = styled(Chip)<IssuerChipProps>`
    border-radius: .5rem;
    height: fit-content;
    font-size: .875rem;
    line-height: initial;
    margin: .3rem 0;
    padding: ${props => props.colour ? '.2rem .5rem' : '.2rem 0'};
    color: ${props => props.colour};
    border-color: ${props => props.colour || 'transparent'};
    .MuiChip-label { padding: 0 }
`;

type Insight = {
    category: string;
    subCategory: string;
    transactions: number;
    average: number;
};
type Series = {
    id: string;
    label: string;
    stack: 'Credit' | 'Debit';
    stackOrder: 'ascending' | 'descending';
    data: number[];
};
type Insights = {
    summary: Insight[];
    series: Series[];
    xaxis: string[];
};

const Insights = ({ setRoute }) => {
    const location = useLocation();
    const { getInsights } = api();
    const [ tab, setTab ] = useState(location.pathname.endsWith('monthly') ? 1 : 0);
    const [ insights, setInsights ] = useState<Insights>();
    const [ categorySummary, setCategorySummary ] = useState(null);
    const [ breakdown, setBreakdown ] = useState(false);
    const [ palette, setPalette ] = useState(null);
    const [ paletteMap, setPaletteMap ] = useState(null);
    const [ sortModel, setSortModel ] = useState<GridSortModel>([{ field: 'average', sort: 'asc' }]);

    useEffect(() => getInsights((response) => {
        const keys = [ 'average', 'transactions' ];
        const summary = response.summary.reduce((acc, curr) => {
                acc[curr.category] = acc[curr.category] || Object.fromEntries(keys.map(k => [k, 0]));
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
        const getColourClassForValue = (p) => !p.value ? '' : p.value > 0 ? 'green' : 'red';
        const columns : GridColDef[] = [
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
            {
                width: isMobile ? 110 : 200,
                field: 'average',
                type: 'number',
                valueFormatter: formatDecimal,
                headerName: isMobile ? 'M. Avg' : 'Monthly Average',
                cellClassName: getColourClassForValue,
            },
            {
                width: isMobile ? 65 : 150,
                field: 'transactions',
                type: 'number',
                valueFormatter: formatNumber,
                headerName: isMobile ? 'A. Tx' : 'Annual Transactions',
            },
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
                operator: "and"
            };
            setFilterModel(filter);
            navigate('/tx/0');
        };

        const GridFooter = () => {
            const rows = (breakdown ? insights && insights.summary : categorySummary).length;
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

        return insights && (
            <FlexDataGrid
                disableColumnMenu
                rows={breakdown ? insights.summary : categorySummary}
                columns={columns.filter(({ field }) => field !== (breakdown ? 'category' : 'subCategory'))}
                getRowId={({ category, subCategory }) => category + subCategory }
                initialState={{ density: 'compact' }}
                onRowDoubleClick={handleDoubleClick}
                slots={{ footer: GridFooter }}
                sortModel={sortModel}
                onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
            />
        );
    };

    const formatAxis = ({ xaxis }) => xaxis.map((str) => dayjs.utc(str).format('MMM'));

    const MonthlyChart = () => {
        useEffect(() => setRoute('insights/monthly'), []);
        const categories = [ ...new Set(insights.series.map((s) => s.id.substring(1))) ].toSorted();
        const [ selectedCategories, setSelectedCategories ] = useState(categories);

        const toggleCategory = (e) => {
            const label = e.target.textContent;
            setSelectedCategories((old) => (old.includes(label) ? old.filter((c) => c !== label) : [ ...old, label ]));
        };

        return (
            <Root>
                <BarChart
                    series={insights.series.filter((s) => selectedCategories.indexOf(s.id.substring(1)) > -1)}
                    xAxis={[{ data: formatAxis(insights), scaleType: 'band' }]}
                    margin={{ top: 10, right: 0 }}
                    colors={palette}
                    tooltip={{ trigger: 'item' }}
                    slotProps={{ legend: { hidden: true } }}
                />
                <details>
                    <summary>Filter Categories</summary>
                    <div>
                        <Chip
                            label="Select All"
                            color="success"
                            onClick={() => setSelectedCategories(categories)}
                        />
                        <Chip
                            label="Select None"
                            color="error"
                            onClick={() => setSelectedCategories([])}
                        />
                        { categories.map((category) => (
                            <Chip
                                key={category}
                                label={category}
                                variant={selectedCategories.includes(category) ? 'filled' : 'outlined'}
                                onClick={toggleCategory}
                                color={selectedCategories.includes(category) ? 'info' : 'default'}
                            />
                        ))}
                    </div>
                </details>
            </Root>
        );
    };

    const toggleBreakdown = (value) => {
        if (sortModel[0]) {
            if (value && sortModel[0].field === 'category') {
                setSortModel((old) => [{ field: 'subCategory', sort: old[0].sort }])
            } else if (!value && sortModel[0].field === 'subCategory') {
                setSortModel((old) => [{ field: 'category', sort: old[0].sort }])
            }
        }
        setBreakdown(value);
    };

    return (
        <>
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
                            <Tab label="Average" component={Link} to="../insights/average" />
                            <Tab label="Monthly" component={Link} to="../insights/monthly" />
                        </Tabs>
                        { tab === 0 && (<FormControlLabel
                            label="Breakdown"
                            control={<Switch
                                checked={breakdown}
                                onChange={({ target }) => toggleBreakdown(target.checked)}
                            />}
                        />) }
                    </TabRow>
                    <Routes>
                        <Route path="average" element={<AverageGrid /> } />
                        <Route path="monthly" element={<MonthlyChart /> } />
                        <Route path="" element={<Navigate to="average" />} />
                    </Routes>
                </>
            )}
        </>
    );
};
export default Insights;

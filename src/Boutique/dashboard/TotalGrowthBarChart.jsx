import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

// assets
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// third party
import Chart from 'react-apexcharts';

// project imports
import useConfig from 'hooks/useConfig';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// chart data
import barChartOptions from './chart-data/total-growth-bar-chart';

const status = [
  { value: 'year', label: 'This Year' },
  { value: 'month', label: 'This Month' },
  { value: 'today', label: 'Today' }
];

export default function TotalGrowthBarChart({ isLoading }) {
  const theme = useTheme();
  const { fontFamily } = useConfig();
  const [value, setValue] = useState('year');
  const [chartOptions, setChartOptions] = useState(barChartOptions);

  // Sample data for admin panel overview
  const monthlyRevenueData = [120000, 185000, 150000, 220000, 280000, 320000, 255000, 350000, 310000, 385000, 420000, 480000];
  const monthlyBookingsData = [85, 120, 95, 148, 192, 210, 175, 230, 208, 260, 285, 320];

  const series = useMemo(() => [
    {
      name: 'Revenue (₹)',
      data: monthlyRevenueData
    },
    {
      name: 'Bookings',
      data: monthlyBookingsData
    }
  ], []);

  const textPrimary = theme.palette.text.primary;
  const divider = theme.palette.divider;

  useEffect(() => {
    setChartOptions((prev) => ({
      ...prev,
      chart: { 
        ...prev.chart, 
        fontFamily: fontFamily,
        stacked: true,
        toolbar: { show: true, tools: { download: true } }
      },
      colors: ['#EA4C46', '#FF8A80'],
      xaxis: { ...prev.xaxis, labels: { style: { colors: textPrimary, fontWeight: 600 } } },
      yaxis: { 
        ...prev.yaxis, 
        labels: { 
            style: { colors: textPrimary, fontWeight: 500 },
            formatter: (val) => {
                if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
                if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
                return `₹${val}`;
            }
        } 
      },
      grid: { borderColor: divider, strokeDashArray: 4 },
      tooltip: { theme: 'light', shared: true, intersect: false },
      legend: { ...(prev.legend ?? {}), labels: { ...(prev.legend?.labels ?? {}), colors: textPrimary } }
    }));
  }, [fontFamily, textPrimary, divider, theme]);

  const totalRevenue = monthlyRevenueData.reduce((a, b) => a + b, 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  
  const displayTotal = useMemo(() => {
    if (value === 'today' || value === 'month') {
      return monthlyRevenueData[currentMonth] || 0;
    }
    return totalRevenue;
  }, [value, currentMonth, totalRevenue]);

  // Calculate percentage growth compared to last month
  const growthPercentage = useMemo(() => {
    if (currentMonth === 0) return 0;
    const lastMonthIncome = monthlyRevenueData[currentMonth - 1] || 0;
    const currentMonthIncome = monthlyRevenueData[currentMonth] || 0;
    if (lastMonthIncome === 0) return currentMonthIncome > 0 ? 100 : 0;
    return (((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100).toFixed(1);
  }, [currentMonth]);

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Stack sx={{ gap: gridSpacing }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack sx={{ gap: 0.5 }}>
                <Typography variant="subtitle2" color="textSecondary">Total Growth</Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="h3">
                        ₹{Number(displayTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                    {growthPercentage !== 0 && (
                        <Chip
                            icon={Number(growthPercentage) >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                            label={`${growthPercentage}%`}
                            size="small"
                            color={Number(growthPercentage) >= 0 ? "success" : "error"}
                            variant="outlined"
                            sx={{ fontWeight: 700, borderRadius: '6px' }}
                        />
                    )}
                </Stack>
              </Stack>
              <TextField select value={value} onChange={(e) => setValue(e.target.value)} size="small">
                {status.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            
            <Box sx={{ position: 'relative', pt: 1 }}>
              <Chart options={chartOptions} series={series} type="bar" height={420} />
            </Box>
          </Stack>
        </MainCard>
      )}
    </>
  );
}

TotalGrowthBarChart.propTypes = { 
  isLoading: PropTypes.bool
};

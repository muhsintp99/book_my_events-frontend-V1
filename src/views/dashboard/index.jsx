import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

// project imports
import EarningCard from './EarningCard';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import TotalIncomeDarkCard from '../../ui-component/cards/TotalIncomeDarkCard';
import TotalIncomeLightCard from '../../ui-component/cards/TotalIncomeLightCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import PopularCard from './PopularCard';
import Welcome from './Welcome';
import MainCard from 'ui-component/cards/MainCard';

import { gridSpacing } from 'store/constant';
import { API_BASE_URL } from '../../utils/apiImageUtils';

// assets
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// ==============================|| DEFAULT DASHBOARD ||============================== //

export default function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [moduleStats, setModuleStats] = useState({
    moduleTitle: '',
    totalEarnings: 0,
    totalOrders: 0,
    totalEnquiries: 0,
    currentMonthEnquiries: 0,
    activeVendors: 0,
    totalVendors: 0,
    totalPackages: 0,
    topVendors: [],
    growthRate: 0,
    currentMonthIncome: 0
  });
  const [overallStats, setOverallStats] = useState({
    totalBookings: 0,
    activeVendors: 0,
    totalVendors: 0,
    overallGrowth: 0,
    monthlyStats: [],
    topModules: [],
    currentMonthOrders: 0,
    currentMonthEnquiries: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const moduleDbId = localStorage.getItem('moduleDbId');
        
        // Fetch Module Specific Stats
        if (moduleDbId && moduleDbId !== 'undefined') {
          const moduleRes = await axios.get(`${API_BASE_URL}/admin/dashboard/module-stats?moduleId=${moduleDbId}`);
          if (moduleRes.data.success) {
            setModuleStats(moduleRes.data.data);
          }
        }

        // Fetch Overall Stats
        const overallRes = await axios.get(`${API_BASE_URL}/admin/dashboard/overall-stats`);
        if (overallRes.data.success) {
          setOverallStats(overallRes.data.data);
        }

        // Fetch Consolidated Report Data (New)
        const reportRes = await axios.get(`${API_BASE_URL}/reports/admin/all-around`);
        if (reportRes.data.success) {
          setReportData(reportRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cardBgColor = "#EA4C46"; // Theme Color

  return (
    <Grid container spacing={gridSpacing}>
      {/* Welcome Banner */}
      <Grid size={12}>
        <Welcome
          isLoading={isLoading}
          userName="Book my Event"
          userAvatar="/path/to/avatar.jpg"
          activeModule={
            localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined'
              ? moduleStats.moduleTitle
              : ''
          }
          totalBookings={
            localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined'
              ? (moduleStats.moduleTitle && ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => moduleStats.moduleTitle.toLowerCase().includes(m))
                  ? moduleStats.totalEnquiries 
                  : moduleStats.totalOrders)
              : overallStats.totalBookings
          }
          activeVendors={
            localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined' 
              ? moduleStats.activeVendors 
              : overallStats.activeVendors
          }
          totalVendors={
            localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined' 
              ? moduleStats.totalVendors 
              : overallStats.totalVendors
          }
          currentMonthIncome={
            localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined' 
              ? moduleStats.currentMonthIncome 
              : 0
          }
          currentMonthEnquiries={
            localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined' 
              ? moduleStats.currentMonthEnquiries 
              : 0
          }
          growthRate={
            localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined' 
              ? moduleStats.growthRate 
              : overallStats.overallGrowth
          }
          currentMonthOrders={
            localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined' 
              ? moduleStats.currentMonthOrders 
              : 0
          }
          totalPackages={moduleStats.totalPackages || 0}
        />
      </Grid>

      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          {/* Top Cards Row */}
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <EarningCard 
              isLoading={isLoading} 
              bgcolor={cardBgColor} 
              total={
                localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined'
                  ? (moduleStats.moduleTitle && ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => moduleStats.moduleTitle.toLowerCase().includes(m))
                      ? moduleStats.currentMonthEnquiries
                      : moduleStats.totalEarnings)
                  : overallStats.totalEarnings
              }
              title={
                localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined'
                  ? (moduleStats.moduleTitle && ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => moduleStats.moduleTitle.toLowerCase().includes(m))
                      ? 'ENQUIRIES THIS MONTH'
                      : 'Total Earning (₹)')
                  : 'Total Platform Earning (₹)'
              }
              isCurrency={
                !(localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined' && 
                moduleStats.moduleTitle && ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => moduleStats.moduleTitle.toLowerCase().includes(m)))
              }
            />
          </Grid>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <TotalOrderLineChartCard 
              isLoading={isLoading} 
              bgcolor={cardBgColor} 
              total={
                localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined'
                  ? (moduleStats.moduleTitle && ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => moduleStats.moduleTitle.toLowerCase().includes(m))
                      ? moduleStats.totalEnquiries
                      : moduleStats.totalOrders)
                  : overallStats.totalBookings
              }
              title={
                localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined'
                  ? (moduleStats.moduleTitle && ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => moduleStats.moduleTitle.toLowerCase().includes(m))
                      ? 'TOTAL ENQUIRIES'
                      : 'Total Order')
                  : 'Total Platform Orders'
              }
            />
          </Grid>
          <Grid size={{ lg: 4, md: 12, sm: 12, xs: 12 }}>
            <Grid container spacing={gridSpacing}>
              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalIncomeDarkCard 
                  isLoading={isLoading} 
                  bgcolor={cardBgColor} 
                  total={
                    localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined'
                      ? moduleStats.activeVendors
                      : overallStats.activeVendors
                  }
                  title="Subscribed Vendors"
                  isCurrency={false}
                />
              </Grid>
              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalIncomeLightCard
                  isLoading={isLoading}
                  total={
                    localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined'
                      ? (moduleStats.moduleTitle && ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => moduleStats.moduleTitle?.toLowerCase().includes(m))
                          ? moduleStats.currentMonthEnquiries
                          : moduleStats.currentMonthOrders)
                      : overallStats.currentMonthEnquiries
                  }
                  label={
                    localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined'
                      ? (moduleStats.moduleTitle && ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => moduleStats.moduleTitle?.toLowerCase().includes(m))
                          ? 'New Enquiries'
                          : 'New Orders')
                      : 'Platform Enquiries'
                  }
                  icon={<StorefrontTwoToneIcon fontSize="inherit" />}
                  bgcolor={cardBgColor}
                  isCurrency={false}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Reports Section */}
      <Grid size={12}>
        <MainCard title="Quick Insights & Reports" sx={{ position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ 
                position: 'absolute', 
                right: -50, 
                top: -50, 
                width: 200, 
                height: 200, 
                background: theme.palette.primary.light, 
                opacity: 0.1, 
                borderRadius: '50%' 
            }} />
            <Grid container spacing={4} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Stack spacing={0.5}>
                                <Typography variant="caption" color="textSecondary" fontWeight={600}>Revenue Portfolio</Typography>
                                <Typography variant="h3" fontWeight={700} color="primary">
                                    ₹ {reportData?.totalSubsRevenue?.toLocaleString() || '0'}
                                </Typography>
                                <Typography variant="caption" color="success.main" fontWeight={600}>Consolidated Earnings</Typography>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Stack spacing={0.5}>
                                <Typography variant="caption" color="textSecondary" fontWeight={600}>Network Scale</Typography>
                                <Typography variant="h4" fontWeight={700}>
                                    {reportData?.platform?.users?.toLocaleString() || '0'} Customers
                                </Typography>
                                <Typography variant="caption" color="secondary.main" fontWeight={600}>
                                    {reportData?.platform?.activeVendors?.toLocaleString() || '0'} Approved Vendors
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Stack spacing={0.5}>
                                <Typography variant="caption" color="textSecondary" fontWeight={600}>Platform Assets</Typography>
                                <Typography variant="h4" fontWeight={700}>
                                    {reportData?.platform?.primaryModules || 0} Modules / {reportData?.platform?.secondaryModules || 0} Sub
                                </Typography>
                                <Typography variant="caption" color="info.main" fontWeight={600}>
                                    {reportData?.platform?.platformPackages || 0} Live Packages
                                </Typography>
                            </Stack>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-end' }}>
                        <Button 
                            variant="outlined" 
                            startIcon={<AssessmentOutlinedIcon />}
                            onClick={() => navigate('/reports/admin')}
                            sx={{ borderRadius: '10px' }}
                        >
                            Admin Report
                        </Button>
                        <Button 
                            variant="contained" 
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => navigate('/reports/accounts')}
                            sx={{ bgcolor: cardBgColor, borderRadius: '10px', '&:hover': { bgcolor: theme.palette.error.dark } }}
                        >
                            Account Report
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </MainCard>
      </Grid>

      {/* Growth Bar Chart + Popular Card Row */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TotalGrowthBarChart 
              isLoading={isLoading} 
              data={overallStats.monthlyStats} 
              title={
                localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined'
                  ? (moduleStats.moduleTitle && ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => moduleStats.moduleTitle?.toLowerCase().includes(m))
                      ? `${moduleStats.moduleTitle} Enquiry Trend`
                      : `${moduleStats.moduleTitle} Growth`)
                  : "Platform-wide Growth Trend"
              }
              isCurrency={
                !(localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined' && 
                moduleStats.moduleTitle && ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => moduleStats.moduleTitle?.toLowerCase().includes(m)))
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <PopularCard 
              isLoading={isLoading} 
              data={
                localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined' 
                  ? moduleStats.topVendors 
                  : overallStats.topModules
              }
              activeVendors={
                localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined' 
                  ? moduleStats.activeVendors 
                  : overallStats.activeVendors
              }
              title={
                localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined'
                  ? (moduleStats.moduleTitle && ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => moduleStats.moduleTitle.toLowerCase().includes(m))
                      ? `Top Enquired ${moduleStats.moduleTitle}` 
                      : `Top ${moduleStats.moduleTitle || 'Booked'} Providers`)
                  : 'Top Booked Modules'
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

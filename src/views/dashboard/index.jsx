import { useEffect, useState } from 'react';
import axios from 'axios';

// material-ui
import Grid from '@mui/material/Grid';

// project imports
import EarningCard from './EarningCard';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import TotalIncomeDarkCard from '../../ui-component/cards/TotalIncomeDarkCard';
import TotalIncomeLightCard from '../../ui-component/cards/TotalIncomeLightCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import PopularCard from './PopularCard';
import Welcome from './Welcome';

import { gridSpacing } from 'store/constant';
import { API_BASE_URL } from '../../utils/apiImageUtils';

// assets
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';

// ==============================|| DEFAULT DASHBOARD ||============================== //

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  const [moduleStats, setModuleStats] = useState({
    moduleTitle: '',
    totalEarnings: 0,
    totalOrders: 0,
    totalEnquiries: 0,
    currentMonthEnquiries: 0,
    activeVendors: 0,
    topVendors: [], // Added topVendors
    growthRate: 0,
    currentMonthIncome: 0
  });
  const [overallStats, setOverallStats] = useState({
    totalBookings: 0,
    activeVendors: 0,
    overallGrowth: 0,
    monthlyStats: [],
    topModules: []
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
          growthRate={
            localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined' 
              ? moduleStats.growthRate 
              : overallStats.overallGrowth
          }
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
                moduleStats.moduleTitle && 
                ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => 
                  moduleStats.moduleTitle.toLowerCase().includes(m)
                ) ? moduleStats.currentMonthEnquiries : moduleStats.totalEarnings
              }
              title={
                moduleStats.moduleTitle && 
                ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => 
                  moduleStats.moduleTitle.toLowerCase().includes(m)
                ) ? 'ENQUIRIES THIS MONTH' : 'Total Earning'
              }
              isCurrency={
                !(moduleStats.moduleTitle && 
                ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => 
                  moduleStats.moduleTitle.toLowerCase().includes(m)
                ))
              }
            />
          </Grid>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <TotalOrderLineChartCard 
              isLoading={isLoading} 
              bgcolor={cardBgColor} 
              total={
                moduleStats.moduleTitle && 
                ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => 
                  moduleStats.moduleTitle.toLowerCase().includes(m)
                ) ? moduleStats.totalEnquiries : moduleStats.totalOrders
              }
              title={
                moduleStats.moduleTitle && 
                ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => 
                  moduleStats.moduleTitle.toLowerCase().includes(m)
                ) ? 'TOTAL ENQUIRIES' : 'Total Order'
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
                  title="Active Providers"
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
                          : moduleStats.totalOrders)
                      : overallStats.currentMonthOrders
                  }
                  label={
                    localStorage.getItem('moduleDbId') && localStorage.getItem('moduleDbId') !== 'undefined'
                      ? (moduleStats.moduleTitle && ['light', 'bouncer', 'emcee', 'event host', 'panthal', 'professional'].some(m => moduleStats.moduleTitle?.toLowerCase().includes(m))
                          ? 'New Enquiries (Month)'
                          : 'New Orders (Month)')
                      : 'Platform Orders (Month)'
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

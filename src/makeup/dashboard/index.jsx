import { useEffect, useState } from 'react';

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

// assets
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';

// ==============================|| MAKEUP DASHBOARD ||============================== //

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const cardBgColor = "#EA4C46"; 

  // Simulation of "Real" Makeup Data
  const makeupStats = {
    earning: "₹18,45,000",
    totalOrder: "1,142",
    popularData: [
      { name: 'Bridal Makeup', bookings: 450, trend: 'up', note: 'Premium Package' },
      { name: 'Hair Styling', bookings: 320, trend: 'up', note: '+15% growth' },
      { name: 'Party Makeup', bookings: 215, trend: 'up', note: 'High Demand' },
      { name: 'Guest Makeup', bookings: 110, trend: 'down', note: '-2% trend' },
      { name: 'Skin Care', bookings: 45, trend: 'up', note: 'New Service' }
    ]
  };

  return (
    <Grid container spacing={gridSpacing}>
      {/* Welcome Banner */}
      <Grid size={12}>
        <Welcome
          isLoading={false}
          userName="Book my Event"
          userAvatar="/path/to/avatar.jpg"
        />
      </Grid>

      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          {/* Top Cards Row */}
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <EarningCard isLoading={isLoading} bgcolor={cardBgColor} total={makeupStats.earning} />
          </Grid>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <TotalOrderLineChartCard isLoading={isLoading} bgcolor={cardBgColor} total={makeupStats.totalOrder} />
          </Grid>
          <Grid size={{ lg: 4, md: 12, sm: 12, xs: 12 }}>
            <Grid container spacing={gridSpacing}>
              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalIncomeDarkCard isLoading={isLoading} bgcolor={cardBgColor} />
              </Grid>
              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalIncomeLightCard
                  {...{
                    isLoading: isLoading,
                    total: 203,
                    label: 'Total Income',
                    icon: <StorefrontTwoToneIcon fontSize="inherit" />,
                    bgcolor: cardBgColor
                  }}
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
            <TotalGrowthBarChart isLoading={isLoading} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <PopularCard isLoading={isLoading} data={makeupStats.popularData} />
          </Grid>
        </Grid>
      </Grid>

      {/* Bottom Row Cards */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ sm: 6, xs: 12, md: 6, lg: 3 }}>
            <TotalIncomeDarkCard isLoading={isLoading} bgcolor={cardBgColor} />
          </Grid>
          <Grid size={{ sm: 6, xs: 12, md: 6, lg: 3 }}>
            <TotalIncomeLightCard
              {...{
                isLoading: isLoading,
                total: 203,
                label: 'Total Income',
                icon: <StorefrontTwoToneIcon fontSize="inherit" />,
                bgcolor: cardBgColor
              }}
            />
          </Grid>
          <Grid size={{ sm: 6, xs: 12, md: 6, lg: 3 }}>
            <TotalIncomeDarkCard isLoading={isLoading} bgcolor={cardBgColor} />
          </Grid>
          <Grid size={{ sm: 6, xs: 12, md: 6, lg: 3 }}>
            <TotalIncomeLightCard
              {...{
                isLoading: isLoading,
                total: 203,
                label: 'Total Income',
                icon: <StorefrontTwoToneIcon fontSize="inherit" />,
                bgcolor: cardBgColor
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

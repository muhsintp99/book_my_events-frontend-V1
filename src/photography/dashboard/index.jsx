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

// ==============================|| PHOTOGRAPHY DASHBOARD ||============================== //

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const cardBgColor = "#EA4C46"; 

  // Simulation of "Real" Photography Data
  const photoStats = {
    earning: "₹21,80,000",
    totalOrder: "842",
    popularData: [
      { name: 'Wedding Shoot', bookings: 320, trend: 'up', note: '+12% growth' },
      { name: 'Pre-Wedding', bookings: 215, trend: 'up', note: 'Popular' },
      { name: 'Event Coverage', bookings: 145, trend: 'up', note: 'Trending' },
      { name: 'Portrait Session', bookings: 98, trend: 'down', note: '-4% trend' },
      { name: 'Cinematography', bookings: 64, trend: 'up', note: 'Premium' }
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
            <EarningCard isLoading={isLoading} bgcolor={cardBgColor} total={photoStats.earning} />
          </Grid>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <TotalOrderLineChartCard isLoading={isLoading} bgcolor={cardBgColor} total={photoStats.totalOrder} />
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
            <PopularCard isLoading={isLoading} data={photoStats.popularData} />
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

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

// ==============================|| INVITATION&PRINTING DASHBOARD ||============================== //

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const cardBgColor = "#EA4C46"; 

  // Real Data from Vendor Panel Screenshot
  const invitationStats = {
    earning: "₹51,000",
    totalOrder: "20",
    income1: "₹43,000",
    income2: "₹51,000",
    growthTitle: "Invitation Growth Performance",
    popularData: [
      { name: 'Custom Invitation Service', bookings: 20, trend: 'up', note: 'Earned: ₹51,000', price: '₹15,000' }
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
            <EarningCard isLoading={isLoading} bgcolor={cardBgColor} total={invitationStats.earning} />
          </Grid>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <TotalOrderLineChartCard isLoading={isLoading} bgcolor={cardBgColor} total={invitationStats.totalOrder} />
          </Grid>
          <Grid size={{ lg: 4, md: 12, sm: 12, xs: 12 }}>
            <Grid container spacing={gridSpacing}>
              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalIncomeDarkCard isLoading={isLoading} bgcolor={cardBgColor} total={invitationStats.income1} />
              </Grid>
              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalIncomeLightCard
                  {...{
                    isLoading: isLoading,
                    total: 51,
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
            <TotalGrowthBarChart isLoading={isLoading} title={invitationStats.growthTitle} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <PopularCard isLoading={isLoading} data={invitationStats.popularData} title="Top Booked Invitations" />
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

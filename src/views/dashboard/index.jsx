import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';

// project imports
import EarningCard from './EarningCard';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import TotalIncomeDarkCard from '../../ui-component/cards/TotalIncomeDarkCard';
import TotalIncomeLightCard from '../../ui-component/cards/TotalIncomeLightCard';

import { gridSpacing } from 'store/constant';

// assets
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';
import Welcome from './Welcome';

// ==============================|| DEFAULT DASHBOARD ||============================== //

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const cardBgColor = "#31428fff"; // set your color here

  return (
    <Grid container spacing={gridSpacing}>
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          {/* Welcome Section */}
          <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
            <Welcome
              isLoading={false}
              userName="Book my Event"
              userAvatar="/path/to/avatar.jpg"
            />
          </Grid>

          {/* Top Cards */}
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <EarningCard isLoading={isLoading} bgcolor={cardBgColor} />
          </Grid>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <TotalOrderLineChartCard isLoading={isLoading} bgcolor={cardBgColor} />
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

          {/* Bottom Row Cards */}
          <Grid size={{ lg: 12 }}>
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
      </Grid>
    </Grid>
  );
}

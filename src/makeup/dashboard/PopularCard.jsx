import PropTypes from 'prop-types';
import React, { useState } from 'react';

// material-ui
import { alpha } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';

// third party
import Chart from 'react-apexcharts';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from 'store/constant';

// assets
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

// ===========================|| BAJAJ AREA CHART (INLINE) ||=========================== //

const bajajChartConfig = {
  type: 'area',
  height: 95,
  options: {
    chart: {
      id: 'admin-popular-chart',
      sparkline: { enabled: true }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#EA4C46'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: '#FF8A80', opacity: 0.8 },
          { offset: 50, color: '#EA4C46', opacity: 0.6 },
          { offset: 100, color: '#C62828', opacity: 0.3 }
        ]
      }
    },
    tooltip: {
      fixed: { enabled: false },
      x: { show: false },
      y: { title: { formatter: () => 'Vendors ' } },
      marker: { show: false }
    }
  },
  series: [{ data: [28, 70, 41, 85, 63, 110, 95] }]
};

// ===========================|| POPULAR CARD - TOP MODULES ||=========================== //

export default function PopularCard({ isLoading = false, data }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const displayModules = data || [
    { name: 'Photography', bookings: 1839, trend: 'up', note: '+10.5% growth' },
    { name: 'Catering', bookings: 1245, trend: 'up', note: '+8.2% this month' },
    { name: 'Makeup Artist', bookings: 890, trend: 'up', note: '+12.4% demand' },
    { name: 'Mehandi Artist', bookings: 456, trend: 'down', note: '-3.1% period' },
    { name: 'Venues', bookings: 320, trend: 'up', note: '+15.7% growth' }
  ];

  const initialModules = displayModules.slice(0, 5);
  const remainingModules = displayModules.slice(5);

  const ModuleItem = ({ module, index, total }) => (
    <React.Fragment>
      <Grid container direction="column">
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#364152' }}>{module.name}</Typography>
          </Grid>
          <Grid item>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {module.bookings.toLocaleString()}
              </Typography>
              <Avatar
                variant="rounded"
                sx={{
                  width: 16,
                  height: 16,
                  bgcolor: module.trend === 'up' ? alpha('#10B981', 0.1) : alpha('#EF4444', 0.1),
                  color: module.trend === 'up' ? '#10B981' : '#EF4444'
                }}
              >
                {module.trend === 'up' ? (
                  <KeyboardArrowUpOutlinedIcon fontSize="small" />
                ) : (
                  <KeyboardArrowDownOutlinedIcon fontSize="small" />
                )}
              </Avatar>
            </Stack>
          </Grid>
        </Grid>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            color: module.trend === 'up' ? '#10B981' : '#EF4444'
          }}
        >
          {module.note}
        </Typography>
      </Grid>
      {index !== total - 1 && <Divider sx={{ my: 1.5, opacity: 0.6 }} />}
    </React.Fragment>
  );

  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false} sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.05)', borderRadius: '16px' }}>
          <CardContent sx={{ p: '24px !important' }}>
            <Grid container spacing={gridSpacing}>
              {/* Header */}
              <Grid item xs={12}>
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Top Booked Modules</Typography>
                  </Grid>
                  <Grid item>
                    <IconButton size="small" onClick={handleClick} sx={{ color: '#EA4C46' }}>
                      <MoreHorizOutlinedIcon fontSize="small" />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                    >
                      <MenuItem onClick={handleClose}>Daily Report</MenuItem>
                      <MenuItem onClick={handleClose}>Monthly Growth</MenuItem>
                      <MenuItem onClick={handleClose}>Full Analytics</MenuItem>
                    </Menu>
                  </Grid>
                </Grid>
              </Grid>

              {/* Banner Chart */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #EA4C46 0%, #B91C1C 100%)',
                    border: 'none',
                    boxShadow: '0 10px 20px rgba(234, 76, 70, 0.2)',
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ p: 2, pb: 0, position: 'relative', zIndex: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
                        Live Providers
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#fff' }}>
                        2.5k+
                      </Typography>
                    </Stack>
                  </Box>
                  <Chart {...bajajChartConfig} />
                </Card>
              </Grid>

              {/* List */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                {initialModules.map((module, index) => (
                  <ModuleItem key={index} module={module} index={index} total={initialModules.length} />
                ))}

                <Collapse in={showAll}>
                    <Divider sx={{ my: 1.5, borderColor: '#EA4C46', opacity: 0.3 }} />
                    <Typography variant="caption" sx={{ display: 'block', mb: 2, fontWeight: 900, color: '#EA4C46', textTransform: 'uppercase' }}>
                        Other Modules
                    </Typography>
                    {remainingModules.map((module, index) => (
                        <ModuleItem key={index} module={module} index={index} total={remainingModules.length} />
                    ))}
                </Collapse>
              </Grid>
            </Grid>
          </CardContent>

          {/* Footer Toggle */}
          <Divider />
          <CardActions sx={{ p: 1.5, justifyContent: 'center' }}>
            <Button 
                size="small" 
                disableElevation 
                onClick={() => setShowAll(!showAll)}
                sx={{ 
                    color: '#EA4C46', 
                    fontWeight: 800,
                    textTransform: 'none',
                    '&:hover': { background: alpha('#EA4C46', 0.05) }
                }}
                endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {showAll ? 'View Less' : 'View More Modules'}
            </Button>
          </CardActions>
        </MainCard>
      )}
    </>
  );
}

PopularCard.propTypes = {
  isLoading: PropTypes.bool
};

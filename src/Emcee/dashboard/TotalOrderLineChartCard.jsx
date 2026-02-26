import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third party
import Chart from 'react-apexcharts';

// project imports
import ChartDataMonth from './chart-data/total-order-month-line-chart';
import ChartDataYear from './chart-data/total-order-year-line-chart';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonTotalOrderCard from 'ui-component/cards/Skeleton/EarningCard';

// assets
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function TotalOrderLineChartCard({ isLoading }) {
  const theme = useTheme();

  const [timeValue, setTimeValue] = React.useState(false);
  const handleChangeTime = (event, newValue) => {
    setTimeValue(newValue);
  };

  const mainColor = '#EA4C46'; // 🎨 Your brand color

  return (
    <>
      {isLoading ? (
        <SkeletonTotalOrderCard />
      ) : (
        <MainCard
          border={false}
          content={false}
          sx={{
            bgcolor: mainColor,
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
            '&>div': {
              position: 'relative',
              zIndex: 5
            },
            '&:after': {
              content: '""',
              position: 'absolute',
              width: 210,
              height: 210,
              background: 'rgba(255, 255, 255, 0.15)', // soft overlay
              borderRadius: '50%',
              top: { xs: -85 },
              right: { xs: -95 }
            },
            '&:before': {
              content: '""',
              position: 'absolute',
              width: 210,
              height: 210,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              top: { xs: -125 },
              right: { xs: -15 },
              opacity: 0.5
            }
          }}
        >
          <Box sx={{ p: 2.25 }}>
            <Grid container direction="column">
              {/* Header */}
              <Grid>
                <Grid container sx={{ justifyContent: 'space-between' }}>
                  <Grid>
                    <Avatar
                      variant="rounded"
                      sx={{
                        ...theme.typography.commonAvatar,
                        ...theme.typography.largeAvatar,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        mt: 1
                      }}
                    >
                      <LocalMallOutlinedIcon fontSize="inherit" />
                    </Avatar>
                  </Grid>
                  <Grid>
                    <Button
                      disableElevation
                      variant={timeValue ? 'contained' : 'text'}
                      size="small"
                      sx={{
                        color: '#fff',
                        bgcolor: timeValue ? 'rgba(255,255,255,0.25)' : 'transparent',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)'
                        }
                      }}
                      onClick={(e) => handleChangeTime(e, true)}
                    >
                      Month
                    </Button>
                    <Button
                      disableElevation
                      variant={!timeValue ? 'contained' : 'text'}
                      size="small"
                      sx={{
                        color: '#fff',
                        bgcolor: !timeValue ? 'rgba(255,255,255,0.25)' : 'transparent',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)'
                        }
                      }}
                      onClick={(e) => handleChangeTime(e, false)}
                    >
                      Year
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

              {/* Chart & Stats */}
              <Grid sx={{ mb: 0.75 }}>
                <Grid container sx={{ alignItems: 'center' }}>
                  {/* Left: Numbers */}
                  <Grid item xs={6}>
                    <Grid container sx={{ alignItems: 'center' }}>
                      <Grid item>
                        {timeValue ? (
                          <Typography
                            sx={{
                              fontSize: '2.125rem',
                              fontWeight: 500,
                              mr: 1,
                              mt: 1.75,
                              mb: 0.75
                            }}
                          >
                            $108
                          </Typography>
                        ) : (
                          <Typography
                            sx={{
                              fontSize: '2.125rem',
                              fontWeight: 500,
                              mr: 1,
                              mt: 1.75,
                              mb: 0.75
                            }}
                          >
                            $961
                          </Typography>
                        )}
                      </Grid>

                      <Grid item>
                        <Avatar
                          sx={{
                            ...theme.typography.smallAvatar,
                            cursor: 'pointer',
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: '#fff'
                          }}
                        >
                          <ArrowDownwardIcon
                            fontSize="inherit"
                            sx={{ transform: 'rotate3d(1, 1, 1, 45deg)' }}
                          />
                        </Avatar>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography
                          sx={{
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.8)'
                          }}
                        >
                          Total Order
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Right: Chart */}
                  <Grid
                    item
                    xs={6}
                    sx={{
                      '.apexcharts-tooltip.apexcharts-theme-light': {
                        color: '#000',
                        background: '#fff'
                      }
                    }}
                  >
                    {timeValue ? <Chart {...ChartDataMonth} /> : <Chart {...ChartDataYear} />}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </MainCard>
      )}
    </>
  );
}

TotalOrderLineChartCard.propTypes = { isLoading: PropTypes.bool };

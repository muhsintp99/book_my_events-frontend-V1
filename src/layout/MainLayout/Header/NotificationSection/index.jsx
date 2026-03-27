import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Badge } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import NotificationList from './NotificationList';
import { getNotifications } from 'api/dashboardApi';

// assets
import { IconBell } from '@tabler/icons-react';

// notification status options
const status = [
  { value: 'all', label: 'All Notification' },
  { value: 'new', label: 'New' },
  { value: 'unread', label: 'Unread' },
  { value: 'other', label: 'Other' }
];

const themeColors = {
  primary: '#2D3436',
  accent: '#EA4C46',
  accentLight: '#FFF5F6',
  gradientPrimary: 'linear-gradient(135deg, #FF6B6B 0%, #EA4C46 100%)',
};

export default function NotificationSection() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const anchorRef = useRef(null);

  const handleToggle = () => setOpen((prevOpen) => !prevOpen);
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const handleChange = (event) => {
    setValue(event?.target.value || 'all');
  };

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      if (res.success) setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(n => {
    if (value === 'unread') return n.unread;
    if (value === 'new') {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return new Date(n.createdAt) > oneHourAgo;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === false && open === true) {
      fetchNotifications();
    }
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Box sx={{ ml: 2 }}>
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              top: 5,
              right: 5,
              border: `2px solid ${theme.palette.background.paper}`,
              padding: '0 4px',
              fontWeight: 800,
              fontSize: '0.65rem'
            }
          }}
        >
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .3s ease-in-out',
              bgcolor: open ? themeColors.accent : 'secondary.light',
              color: open ? 'white' : 'secondary.dark',
              '&:hover': {
                bgcolor: themeColors.accent,
                color: 'white',
                transform: 'scale(1.1)'
              }
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
            color="inherit"
          >
            <IconBell stroke={1.5} size="20px" />
          </Avatar>
        </Badge>
      </Box>
      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [downMD ? 5 : 0, 20] } }]}
        sx={{ zIndex: 1301 }}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
              <Paper sx={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
                {open && (
                  <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                    <Grid container direction="column" spacing={2} sx={{ width: downMD ? '100vw' : 420 }}>
                      <Grid item xs={12}>
                        <Box sx={{ p: 2.5, pb: 1.5 }}>
                          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="h4" sx={{ fontWeight: 900, fontSize: '1.25rem' }}>Notifications</Typography>
                              {unreadCount > 0 && (
                                <Box 
                                  sx={{ 
                                    color: 'white', 
                                    bgcolor: themeColors.accent, 
                                    px: 1,
                                    py: 0.25,
                                    fontSize: '0.75rem',
                                    fontWeight: 900, 
                                    borderRadius: '6px' 
                                  }} 
                                >
                                  {unreadCount}
                                </Box>
                              )}
                            </Stack>
                            <Typography 
                              component={Link} 
                              to="#" 
                              variant="subtitle2" 
                              sx={{ 
                                color: themeColors.accent, 
                                textDecoration: 'none', 
                                fontWeight: 700,
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              Mark all as read
                            </Typography>
                          </Stack>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            height: '100%',
                            maxHeight: 'calc(100vh - 250px)',
                            overflowX: 'hidden',
                            '&::-webkit-scrollbar': { width: 4 },
                            '&::-webkit-scrollbar-thumb': { background: '#E0E0E0', borderRadius: 4 }
                          }}
                        >
                          <Grid container direction="column" spacing={2}>
                            <Grid item xs={12}>
                              <Box sx={{ px: 2.5, pt: 0.5, mb: 2 }}>
                                <TextField
                                  id="outlined-select-currency-native"
                                  select
                                  fullWidth
                                  value={value}
                                  onChange={handleChange}
                                  slotProps={{ select: { native: true } }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '12px',
                                      bgcolor: '#F8FAFC',
                                      border: '1px solid #E2E8F0',
                                      fontSize: '0.875rem',
                                      fontWeight: 700,
                                      '& fieldset': { border: 'none' },
                                      '&:hover': { bgcolor: '#F1F5F9' }
                                    }
                                  }}
                                >
                                  {status.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </TextField>
                              </Box>
                            </Grid>
                          </Grid>
                          <NotificationList notifications={filteredNotifications} loading={loading} />
                        </Box>
                      </Grid>
                    </Grid>
                    <Divider sx={{ mt: 1 }} />
                    <CardActions sx={{ p: 1.5, justifyContent: 'center' }}>
                      <Button 
                        size="medium" 
                        fullWidth 
                        sx={{ 
                          color: themeColors.accent, 
                          fontWeight: 800, 
                          borderRadius: '12px',
                          '&:hover': { bgcolor: themeColors.accentLight }
                        }}
                      >
                        View All Activities
                      </Button>
                    </CardActions>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
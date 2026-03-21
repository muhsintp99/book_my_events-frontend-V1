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

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import NotificationList from './NotificationList';

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
    event?.target.value && setValue(event?.target.value);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Box sx={{ ml: 2 }}>
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
                    <Grid container direction="column" spacing={2} sx={{ width: downMD ? '100vw' : 360 }}>
                      <Grid item xs={12}>
                        <Box sx={{ p: 2.5, pb: 1.5 }}>
                          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Typography variant="h4" sx={{ fontWeight: 800 }}>Notifications</Typography>
                              <Chip size="small" label="05" sx={{ color: 'white', bgcolor: themeColors.accent, fontWeight: 900, borderRadius: '8px' }} />
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
                                      bgcolor: '#F9FAFB'
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
                          <NotificationList />
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
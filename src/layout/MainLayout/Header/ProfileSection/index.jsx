import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Avatar,
  Box,
  ClickAwayListener,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  useTheme,
  Popper,
  Dialog,
  DialogContent,
  IconButton,
  Grid,
  Button,
  Chip,
  Tooltip,
  Fade,
  Badge,
  styled,
  keyframes
} from '@mui/material';

// project imports
import Transitions from 'ui-component/extended/Transitions';
import { useConfig } from 'contexts/ConfigContext';

// assets
import {
  Logout as LogoutIcon,
  Person as UserIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Shield as ShieldIcon,
  CalendarMonth as DateIcon,
  Verified as VerifiedIcon,
  Security as SecurityIcon,
  Language as GlobeIcon,
  Stars as PremiumIcon,
  Dashboard as DashIcon,
  TrendingUp as TrendIcon,
  Done as DoneIcon
} from '@mui/icons-material';

// ✅ API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const themeColors = {
  primary: '#2D3436',
  accent: '#EA4C46',
  accentSecondary: '#B12D34',
  accentLight: '#FFF5F6',
  gradientPrimary: 'linear-gradient(135deg, #FF6B6B 0%, #EA4C46 100%)',
  gradientGlass: 'rgba(255, 255, 255, 0.9)',
  textMain: '#1A1A1A',
  textSecondary: '#6B7280',
  success: '#10B981',
};

// Animations
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const ripple = keyframes`
  0% { transform: scale(.8); opacity: 1; }
  100% { transform: scale(2.4); opacity: 0; }
`;

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: `${ripple} 1.2s infinite ease-in-out`,
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));

export default function ProfileSection() {
  const theme = useTheme();
  const { borderRadius } = useConfig();
  const navigate = useNavigate();

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Get user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || user.firstName || "BookMyEvent";
  const userEmail = user.email || "admin@bookmyevent.ae";
  const userRole = user.role || "superadmin";
  const userPhone = user.phone || "+971 50 123 4567";
  const userJoined = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "March 2026";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 20) return 'Good Evening';
    return 'Good Night';
  };

  const handleToggle = () => setOpen((prevOpen) => !prevOpen);
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const handleProfileOpen = () => { setOpen(false); setProfileOpen(true); };
  const handleProfileClose = () => setProfileOpen(false);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      ['token', 'user'].forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
      setOpen(false);
      navigate('/login');
    } catch (e) {
      ['token', 'user'].forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
      setOpen(false);
      navigate('/login');
    }
  };

  const popperItemStyle = {
    borderRadius: '16px',
    mb: 1,
    p: 1.8,
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover': {
      backgroundColor: themeColors.accentLight,
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 15px rgba(225, 91, 100, 0.08)',
      '& .MuiTypography-root': { color: themeColors.accent, fontWeight: 700 },
      '& .MuiListItemIcon-root': {
        color: themeColors.accent,
        transform: 'scale(1.1) rotate(5deg)'
      }
    }
  };

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      {/* Trigger Button */}
      <Tooltip title="Account Control" placement="left" arrow>
        <Box
          ref={anchorRef}
          onClick={handleToggle}
          sx={{
            cursor: 'pointer',
            p: '4px',
            borderRadius: '50%',
            transition: 'all 0.5s ease',
            border: `3px solid ${open ? themeColors.accent : 'transparent'}`,
            '&:hover': { transform: 'rotate(5deg) scale(1.1)' }
          }}
        >
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <Avatar
              alt="Admin"
              sx={{
                width: 48,
                height: 48,
                background: themeColors.gradientPrimary,
                boxShadow: '0 8px 20px rgba(234, 76, 70, 0.3)',
                border: '2px solid white',
              }}
            >
              <UserIcon sx={{ fontSize: 26 }} />
            </Avatar>
          </StyledBadge>
        </Box>
      </Tooltip>

      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [0, 20] } }]}
        sx={{ zIndex: 1301 }}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper elevation={0} sx={{ 
                borderRadius: '35px', 
                overflow: 'hidden',
                boxShadow: '0 50px 100px rgba(0,0,0,0.15)',
                border: '1px solid #F3F4F6',
                minWidth: 350,
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)'
              }}>
                <Box sx={{ p: 3 }}>
                    <Box sx={{
                        p: 3,
                        borderRadius: '28px',
                        background: themeColors.gradientPrimary,
                        color: 'white',
                        mb: 3,
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(234, 76, 70, 0.3)'
                    }}>
                        <Box sx={{ position: 'absolute', right: -25, top: -25, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                        <Box sx={{ position: 'absolute', bottom: -15, left: -20, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

                        <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 800, letterSpacing: '2px', fontSize: '0.65rem' }}>{getGreeting().toUpperCase()}</Typography>
                                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 0.5, fontSize: '1.4rem' }}>{userName}</Typography>
                                </Box>
                                <VerifiedIcon sx={{ color: 'white', fontSize: '1.2rem', opacity: 0.9 }} />
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Chip 
                                    label={userRole.toUpperCase()} 
                                    size="small" 
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 900, fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.3)' }} 
                                />
                                <Typography variant="caption" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#44b700', animation: `${pulse} 2s infinite` }} /> Active Now
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>

                    <List sx={{ p: 0 }}>
                        <ListItemButton sx={popperItemStyle} onClick={handleProfileOpen}>
                            <ListItemIcon sx={{ minWidth: 46, color: '#374151' }}>
                                <Box sx={{ p: 1, borderRadius: '12px', bgcolor: '#F3F4F6' }}><UserIcon fontSize="small" /></Box>
                            </ListItemIcon>
                            <ListItemText 
                                primary={<Typography sx={{ fontWeight: 800, fontSize: '0.98rem' }}>Profile Overview</Typography>}
                                secondary={<Typography variant="caption">Control privacy & details</Typography>}
                            />
                        </ListItemButton>

                        <ListItemButton sx={popperItemStyle} onClick={handleLogout}>
                            <ListItemIcon sx={{ minWidth: 46, color: '#374151' }}>
                                <Box sx={{ p: 1, borderRadius: '12px', bgcolor: '#FEE2E2' }}><LogoutIcon fontSize="small" sx={{ color: '#EF4444' }} /></Box>
                            </ListItemIcon>
                            <ListItemText 
                                primary={<Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color: '#EF4444' }}>Security Logout</Typography>}
                                secondary={<Typography variant="caption">Safely end session</Typography>}
                            />
                        </ListItemButton>
                    </List>
                </Box>
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>

      {/* Extreme Premium Dialog with scrolling fixes */}
      <Dialog
        open={profileOpen}
        onClose={handleProfileClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: '35px', 
            overflow: 'hidden', 
            boxShadow: '0 40px 120px rgba(0,0,0,0.25)', 
            border: 'none',
            maxHeight: '90vh'
          }
        }}
      >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '600px', bgcolor: '#fff', overflow: 'hidden' }}>
            {/* Left Column - Fixed visual side */}
            <Box sx={{ 
                width: { xs: '100%', md: '350px' }, 
                background: themeColors.gradientPrimary, 
                p: { xs: 4, md: 5 }, 
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
            }}>
                <Box>
                    <Chip 
                        icon={<PremiumIcon sx={{ color: 'white !important', fontSize: '1rem !important' }} />}
                        label="VERIFIED OPERATOR" 
                        sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 900, mb: 4 }} 
                    />
                    <Stack spacing={3} alignItems="center">
                        <Avatar
                            sx={{
                                width: { xs: 100, md: 140 },
                                height: { xs: 100, md: 140 },
                                border: '8px solid rgba(255,255,255,0.1)',
                                background: '#FFFFFF',
                                color: themeColors.accent,
                                fontSize: '4.5rem',
                                fontWeight: 900
                            }}
                        >
                            {userName.charAt(0)}
                        </Avatar>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, fontSize: '2rem' }}>{userName}</Typography>
                            <Typography variant="h5" sx={{ opacity: 0.8, fontWeight: 400 }}>GLOBAL CONSOLE ACCESS</Typography>
                        </Box>
                    </Stack>
                </Box>

                <Box sx={{ mt: 4, p: 2, borderRadius: '24px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ fontWeight: 800 }}>MEMBER AUTH</Typography>
                        <DoneIcon sx={{ fontSize: '1.2rem', color: '#10B981' }} />
                    </Stack>
                    <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 900 }}>AUTHENTICATED</Typography>
                </Box>
            </Box>

            {/* Right Column - Scrollable details side */}
            <Box sx={{ 
                flex: 1, 
                p: { xs: 3, md: 6 }, 
                overflowY: 'auto', 
                maxHeight: { md: '90vh' },
                position: 'relative'
            }}>
                <IconButton 
                    onClick={handleProfileClose}
                    sx={{ position: 'absolute', right: 20, top: 20, bgcolor: '#F3F4F6', zIndex: 1, '&:hover': { bgcolor: themeColors.accent, color: 'white' } }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4, mt: 1 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: themeColors.accentLight, color: themeColors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DashIcon fontSize="small" />
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: themeColors.textMain, fontSize: '1.6rem' }}>Identity Protocol</Typography>
                </Stack>

                <Grid container spacing={2}>
                    {[
                        { label: 'Network Email', value: userEmail, icon: <EmailIcon />, color: '#6366F1' },
                        { label: 'Secure Mobile', value: userPhone, icon: <PhoneIcon />, color: '#10B981' },
                        { label: 'Registry Date', value: userJoined, icon: <DateIcon />, color: '#F59E0B' },
                        { label: 'Operational Zone', value: 'Dubai, UAE', icon: <GlobeIcon />, color: '#EF4444' },
                        { label: 'Access Level', value: userRole, icon: <ShieldIcon />, color: '#8B5CF6' },
                        { label: 'Activity Rate', value: 'Optimal +', icon: <TrendIcon />, color: '#06B6D4' }
                    ].map((item, idx) => (
                        <Grid item xs={12} key={idx}>
                            <Box sx={{ 
                                p: 2.5, 
                                borderRadius: '24px', 
                                border: '1px solid #F1F5F9',
                                background: '#F9FAFB',
                                transition: '0.3s',
                                '&:hover': { borderColor: item.color, background: '#FFFFFF', boxShadow: `0 8px 20px ${item.color}10` }
                            }}>
                                <Stack direction="row" spacing={2.5} alignItems="center">
                                    <Avatar sx={{ bgcolor: `${item.color}10`, color: item.color, width: 38, height: 38, borderRadius: '12px' }}>
                                        {item.icon}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 700, fontSize: '0.65rem' }}>{item.label.toUpperCase()}</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: themeColors.textMain, fontSize: '0.95rem' }}>{item.value}</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ mt: 4 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleProfileClose}
                        sx={{
                            borderRadius: '20px',
                            py: 1.8,
                            background: themeColors.gradientPrimary,
                            fontWeight: 900,
                            boxShadow: '0 10px 20px rgba(234, 76, 70, 0.2)'
                        }}
                    >
                        CONFIRM DATA
                    </Button>
                </Box>
            </Box>
          </Box>
      </Dialog>
    </Stack>
  );
}

ProfileSection.propTypes = { children: PropTypes.node };
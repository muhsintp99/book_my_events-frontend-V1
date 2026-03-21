import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import { alpha, useTheme, styled, keyframes } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

// icons
import { WbSunny as WbSunnyIcon } from '@mui/icons-material';
import { NightsStay as NightsStayIcon } from '@mui/icons-material';
import { WbTwilight as WbTwilightIcon } from '@mui/icons-material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

// ---- Animations ----
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ---- Styled Components ----
const WelcomeCardWrapper = styled(MainCard)(() => ({
  overflow: 'hidden',
  position: 'relative',
  background: 'linear-gradient(135deg, #450A0A 0%, #7B1111 50%, #A91D1D 100%)',
  color: '#fff',
  borderRadius: '20px',
  border: 'none',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 300,
    height: 300,
    background: 'radial-gradient(circle, rgba(234, 76, 70, 0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    top: -80,
    right: -80,
    animation: `${pulse} 4s ease-in-out infinite`
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 200,
    height: 200,
    background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
    borderRadius: '50%',
    bottom: -60,
    left: -40
  }
}));

const GlowOrb = styled(Box)(() => ({
  position: 'absolute',
  width: 120,
  height: 120,
  background: 'radial-gradient(circle, rgba(233,69,96,0.15) 0%, transparent 70%)',
  borderRadius: '50%',
  bottom: '10%',
  right: '25%',
  filter: 'blur(35px)',
  animation: `${float} 6s ease-in-out infinite`
}));

const StatBox = styled(Box)(() => ({
  background: 'rgba(255,255,255,0.08)',
  backdropFilter: 'blur(10px)',
  borderRadius: '14px',
  padding: '12px 18px',
  border: '1px solid rgba(255,255,255,0.1)',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  transition: 'all 0.3s ease',
  cursor: 'default',
  '&:hover': {
    background: 'rgba(255,255,255,0.14)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
  }
}));

const TimeChip = styled(Chip)(() => ({
  background: 'rgba(233, 69, 96, 0.25)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.8rem',
  padding: '4px 6px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(233, 69, 96, 0.3)',
  '& .MuiChip-icon': {
    color: '#FF8A80'
  }
}));

const DateChip = styled(Chip)(() => ({
  background: 'rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.9)',
  fontWeight: 500,
  fontSize: '0.75rem',
  border: '1px solid rgba(255,255,255,0.1)',
  '& .MuiChip-icon': {
    color: 'rgba(255,255,255,0.7)'
  }
}));

export default function Welcome({ isLoading, userName = 'Admin', userAvatar }) {
  const theme = useTheme();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [timeIcon, setTimeIcon] = useState(<WbSunnyIcon />);
  const [emoji, setEmoji] = useState('👋');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
      setTimeIcon(<WbSunnyIcon sx={{ fontSize: 28, color: '#FFD700' }} />);
      setEmoji('☀️');
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
      setTimeIcon(<WbSunnyIcon sx={{ fontSize: 28, color: '#FFA726' }} />);
      setEmoji('🌤️');
    } else if (hour < 21) {
      setGreeting('Good Evening');
      setTimeIcon(<WbTwilightIcon sx={{ fontSize: 28, color: '#CE93D8' }} />);
      setEmoji('🌆');
    } else {
      setGreeting('Good Night');
      setTimeIcon(<NightsStayIcon sx={{ fontSize: 28, color: '#90CAF9' }} />);
      setEmoji('🌙');
    }
  }, [currentTime]);

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  if (isLoading) return <TotalIncomeCard />;

  return (
    <WelcomeCardWrapper border={false} content={false}>
      <GlowOrb />
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: 3
          }}
        >
          {/* Left Content */}
          <Box sx={{ flex: 1 }}>
            {/* Greeting */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              {timeIcon}
              <Typography
                variant="h3"
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: { xs: '1.5rem', md: '1.8rem' },
                  letterSpacing: '-0.5px',
                  background: 'linear-gradient(90deg, #FFFFFF 0%, #FF8A80 100%)',
                  backgroundSize: '200% auto',
                  animation: `${shimmer} 4s linear infinite`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {greeting}, {userName.split(' ')[0]}! {emoji}
              </Typography>
            </Stack>

            {/* Date & Time Row */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
              <DateChip icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />} label={formatDate(currentTime)} size="small" />
              <TimeChip icon={<AccessTimeIcon sx={{ fontSize: 16 }} />} label={formatTime(currentTime)} size="small" />
            </Stack>

            {/* Subtitle */}
            <Typography
              variant="body1"
              sx={{
                color: alpha('#fff', 0.7),
                fontSize: '0.9rem',
                fontWeight: 400,
                mb: 2.5
              }}
            >
              Here's an overview of your platform performance today.
            </Typography>

            {/* Quick Stats */}
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
              <StatBox>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #E94560 0%, #FF6B6B 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 18, color: '#fff' }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>
                    24.5%
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.6), fontSize: '0.65rem' }}>
                    Growth Rate
                  </Typography>
                </Box>
              </StatBox>

              <StatBox>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 18, color: '#fff' }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>
                    2,540
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.6), fontSize: '0.65rem' }}>
                    Active Vendors
                  </Typography>
                </Box>
              </StatBox>

              <StatBox>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <EventIcon sx={{ fontSize: 18, color: '#fff' }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>
                    1,280
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.6), fontSize: '0.65rem' }}>
                    Total Bookings
                  </Typography>
                </Box>
              </StatBox>
            </Stack>
          </Box>

          {/* Right - Avatar */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              animation: `${float} 5s ease-in-out infinite`
            }}
          >
            <Avatar
              src={userAvatar}
              alt={userName}
              sx={{
                width: 100,
                height: 100,
                border: '3px solid rgba(233, 69, 96, 0.5)',
                boxShadow: '0 12px 40px rgba(233, 69, 96, 0.3)',
                fontSize: '2.5rem',
                fontWeight: 700,
                bgcolor: 'rgba(233, 69, 96, 0.2)',
                color: '#fff',
                backdropFilter: 'blur(10px)'
              }}
            >
              {!userAvatar && userName.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </Box>
      </CardContent>
    </WelcomeCardWrapper>
  );
}

Welcome.propTypes = {
  isLoading: PropTypes.bool,
  userName: PropTypes.string.isRequired,
  userAvatar: PropTypes.string
};

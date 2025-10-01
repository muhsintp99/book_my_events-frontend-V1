import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import { alpha, useTheme, styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';

// icons
import { WbSunny as WbSunnyIcon } from '@mui/icons-material';
import { NightsStay as NightsStayIcon } from '@mui/icons-material';
import { WbTwilight as WbTwilightIcon } from '@mui/icons-material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

// styles
const WelcomeCardWrapper = styled(MainCard)(({ theme }) => ({
  overflow: 'hidden',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 250,
    height: 250,
    background: `linear-gradient(210.04deg, ${theme.palette.warning.dark} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
    borderRadius: '50%',
    top: 65,
    right: -135
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(140.9deg, ${theme.palette.warning.dark} -14.02%, rgba(144, 202, 249, 0) 70.50%)`,
    borderRadius: '50%',
    top: -160,
    right: -130
  }
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 113,
  height: 113,
  border: `4px solid ${alpha(theme.palette.common.black, 0.2)}`,
  boxShadow: `${alpha(theme.palette.common.black, 0.1)}`,
  fontSize: '2rem',
  fontWeight: 600
}));

const TimeChip = styled(Chip)(({ theme }) => ({
  background: alpha(theme.palette.text.primary, 0.1),
  color: theme.palette.text.primary,
  fontWeight: 500,
  padding: '10px',
  backdropFilter: 'blur(10px)',
  gap: 2,
  '& .MuiChip-icon': {
    color: theme.palette.text.primary
  }
}));

export default function Welcome({ isLoading, userName = 'John Doe', userAvatar }) {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [timeIcon, setTimeIcon] = useState(<WbSunnyIcon />);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
      setTimeIcon(<WbSunnyIcon />);
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
      setTimeIcon(<WbSunnyIcon />);
    } else if (hour < 21) {
      setGreeting('Good Evening');
      setTimeIcon(<WbTwilightIcon />);
    } else {
      setGreeting('Good Night');
      setTimeIcon(<NightsStayIcon />);
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
    <Box>
      <WelcomeCardWrapper border={false} content={false}>
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              {/* Greeting */}
              <Typography
                variant="h3"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 700,
                  mb: 0.5
                }}
              >
                {greeting}, {userName.split(' ')[0]}! 👋
              </Typography>

              {/* Date */}
              <Typography
                variant="body1"
                sx={{
                  color: alpha(theme.palette.text.primary, 0.8),
                  mb: 1
                }}
              >
                {formatDate(currentTime)}
              </Typography>

              {/* Time */}
              <TimeChip icon={timeIcon} label={formatTime(currentTime)} size="small" />

              {/* Subtitle */}
              <Typography
                variant="body1"
                sx={{
                  color: alpha(theme.palette.text.primary, 0.9),
                  mt: 2,
                  letterSpacing: '0.5px'
                }}
              >
                Welcome back! Here's what's happening with your dashboard today.
              </Typography>
            </Box>

            {/* Avatar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <UserAvatar
                src={userAvatar}
                alt={userName}
                sx={{
                  bgcolor: !userAvatar
                    ? theme.palette.primary.main
                    : 'transparent',
                  color: !userAvatar
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.primary
                }}
              >
                {!userAvatar && userName.charAt(0).toUpperCase()}
              </UserAvatar>
            </Box>
          </Box>
        </CardContent>
      </WelcomeCardWrapper>
    </Box>
  );
}

Welcome.propTypes = {
  isLoading: PropTypes.bool,
  userName: PropTypes.string.isRequired,
  userAvatar: PropTypes.string
};

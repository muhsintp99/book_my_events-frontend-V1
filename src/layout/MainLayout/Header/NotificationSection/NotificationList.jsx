import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

// assets
import { 
  IconClock,
  IconUserPlus,
  IconPackage,
  IconShoppingCart,
  IconMessageCircle,
  IconChevronRight
} from '@tabler/icons-react';

const themeColors = {
  accent: '#EA4C46',
  accentLight: '#FFF5F6',
  success: '#10B981',
  indigo: '#6366F1',
  warning: '#F59E0B',
  info: '#3B82F6',
  border: '#F3F4F6',
  text: '#1F2937'
};

const timeAgo = (date) => {
  if (!date) return 'Some time ago';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " yr ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hr ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " min ago";
  if (seconds < 5) return "Just now";
  return Math.floor(seconds) + " s ago";
};

const getIcon = (type) => {
    switch (type) {
        case 'vendor': return { icon: <IconUserPlus stroke={2.5} size="20px" />, color: themeColors.success };
        case 'order': return { icon: <IconShoppingCart stroke={2.5} size="20px" />, color: themeColors.accent };
        case 'enquiry': return { icon: <IconMessageCircle stroke={2.5} size="20px" />, color: themeColors.warning };
        case 'package': return { icon: <IconPackage stroke={2.5} size="20px" />, color: themeColors.indigo };
        default: return { icon: <IconPackage stroke={2.5} size="20px" />, color: themeColors.info };
    }
}

function ListItemWrapper({ children, isUnread = false }) {
  return (
    <Box
      sx={{
        p: '14px 16px',
        borderBottom: `1.2px solid ${themeColors.border}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: isUnread ? '#FFF9F9' : 'transparent',
        '&:hover': {
          bgcolor: '#f8fafc',
          '& .MuiTypography-subtitle1': { color: themeColors.accent }
        }
      }}
    >
      {children}
    </Box>
  );
}

// ==============================|| NOTIFICATION LIST ITEM ||============================== //

export default function NotificationList({ notifications = [], loading = false }) {
  const containerSX = { pl: 6.5, pr: 1, mt: 0.25 };

  if (loading) {
      return (
          <List sx={{ width: '100%', py: 0 }}>
              {[1, 2, 3].map((i) => (
                   <ListItemWrapper key={i}>
                       <Stack direction="row" spacing={2}>
                           <Skeleton variant="circular" width={44} height={44} />
                           <Stack spacing={1} flex={1}>
                               <Skeleton variant="text" width="60%" sx={{ height: '20px' }} />
                               <Skeleton variant="text" width="95%" sx={{ height: '16px' }} />
                               <Skeleton variant="text" width="40%" sx={{ height: '16px' }} />
                           </Stack>
                       </Stack>
                   </ListItemWrapper>
              ))}
          </List>
      )
  }

  if (notifications.length === 0) {
      return (
          <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#F9FAFB', mx: 2, my: 4, borderRadius: '20px', border: '2px dashed #E5E7EB' }}>
               <IconPackage size={40} color="#D1D5DB" />
               <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 1.5, fontWeight: 600 }}>No activities found</Typography>
          </Box>
      );
  }

  return (
    <List sx={{ width: '100%', py: 0 }}>
      {notifications.map((notif) => {
          const { icon, color } = getIcon(notif.type);
          return (
            <ListItemWrapper key={notif.id} isUnread={notif.unread}>
                <ListItem alignItems="flex-start" disablePadding>
                    <ListItemAvatar sx={{ minWidth: 52 }}>
                        <Avatar
                            sx={{
                                color: color,
                                bgcolor: `${color}10`,
                                width: 42,
                                height: 42,
                                borderRadius: '12px',
                                border: `1px solid ${color}15`
                            }}
                        >
                            {icon}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                        primary={
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography 
                                    variant="subtitle1" 
                                    sx={{ 
                                        fontWeight: 800, 
                                        fontSize: '0.875rem', 
                                        color: themeColors.text
                                    }}
                                >
                                    {notif.title}
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: '#94A3B8', 
                                        fontWeight: 700, 
                                        fontSize: '0.625rem',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    {timeAgo(notif.createdAt)}
                                </Typography>
                            </Stack>
                        } 
                    />
                </ListItem>
                <Stack spacing={0.5} sx={containerSX}>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: '#4B5563', 
                            lineHeight: 1.5,
                            fontSize: '0.8rem',
                            fontWeight: 500
                        }}
                    >
                        {notif.description}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
                        <Chip 
                            label={notif.type === 'vendor' ? 'NEW VENDOR' : notif.type.toUpperCase()} 
                            size="small" 
                            sx={{ 
                                height: 18, 
                                bgcolor: `${color}12`, 
                                color: color, 
                                fontWeight: 900, 
                                fontSize: '0.6rem',
                                borderRadius: '4px'
                            }} 
                        />
                        {(notif.type === 'order' || notif.type === 'package') && (
                             <Button 
                                variant="text" 
                                size="small"
                                endIcon={<IconChevronRight size={10} />}
                                sx={{ 
                                    p: 0,
                                    height: 18,
                                    minWidth: 'auto',
                                    color: color,
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
                                }}
                            >
                                {notif.type === 'order' ? 'Review' : 'View'}
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </ListItemWrapper>
          );
      })}
    </List>
  );
}

NotificationList.propTypes = { 
    notifications: PropTypes.array,
    loading: PropTypes.bool 
};


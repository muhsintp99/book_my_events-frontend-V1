import PropTypes from 'prop-types';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// assets
import { 
  IconBrandTelegram, 
  IconBuildingStore, 
  IconMailbox, 
  IconPhoto, 
  IconCheck, 
  IconClock,
  IconRocket,
  IconAlertCircle,
  IconCircleCheck
} from '@tabler/icons-react';

const themeColors = {
  accent: '#EA4C46',
  accentLight: '#FFF5F6',
  success: '#10B981',
  indigo: '#4F46E5',
  warning: '#F59E0B',
  info: '#3B82F6'
};

function ListItemWrapper({ children, isUnread = false }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2.5,
        borderBottom: '1px solid',
        borderColor: '#F3F4F6',
        mx: 1,
        borderRadius: '16px',
        mb: 0.5,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: isUnread ? '#FFF8F8' : 'transparent',
        '&:hover': {
          bgcolor: '#F9FAFB',
          transform: 'translateX(5px)',
          '& .MuiTypography-subtitle1': { color: themeColors.accent }
        }
      }}
    >
      {children}
    </Box>
  );
}

// ==============================|| NOTIFICATION LIST ITEM ||============================== //

export default function NotificationList() {
  const containerSX = { pl: 7 };

  return (
    <List sx={{ width: '100%', py: 0 }}>
      {/* 1. SYSTEM UPDATE NOTIFICATION */}
      <ListItemWrapper isUnread={true}>
        <ListItem
          alignItems="center"
          disablePadding
          secondaryAction={
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
              <IconClock size={12} color="#9CA3AF" />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Just now</Typography>
            </Stack>
          }
        >
          <ListItemAvatar>
            <Avatar
              sx={{
                color: themeColors.accent,
                bgcolor: themeColors.accentLight,
                borderRadius: '12px',
                border: `1.5px solid ${themeColors.accent}`
              }}
            >
              <IconRocket stroke={2} size="22px" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>System Update: V2.1.1 Live</Typography>} 
          />
        </ListItem>
        <Stack spacing={1.5} sx={containerSX}>
          <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.5 }}>
            Book My Event version 2.1.1 is now active. Explore the new "Global Administration Console" and improved vendor dashboard designs.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip 
              label="System" 
              size="small" 
              sx={{ 
                height: 20, 
                bgcolor: '#FEE2E2', 
                color: '#EF4444', 
                fontWeight: 900, 
                fontSize: '0.65rem' 
              }} 
            />
            <Chip 
              label="New Features" 
              size="small" 
              sx={{ 
                height: 20, 
                bgcolor: themeColors.accentLight, 
                color: themeColors.accent, 
                fontWeight: 900, 
                fontSize: '0.65rem' 
              }} 
            />
          </Stack>
        </Stack>
      </ListItemWrapper>

      {/* 2. KYC VERIFICATION */}
      <ListItemWrapper>
        <ListItem
          alignItems="center"
          disablePadding
          secondaryAction={
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>45 min ago</Typography>
            </Stack>
          }
        >
          <ListItemAvatar>
            <Avatar
              sx={{
                color: themeColors.success,
                bgcolor: `${themeColors.success}15`,
                borderRadius: '12px'
              }}
            >
              <IconCircleCheck stroke={2.5} size="22px" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Vendor KYC Approved</Typography>} />
        </ListItem>
        <Stack spacing={1} sx={containerSX}>
          <Typography variant="body2" sx={{ color: '#4B5563' }}>
            A new vendor "Royal Floralists" has completed their KYC. Documentation verified successfully.
          </Typography>
          <Chip 
            icon={<IconCheck size={14} color={themeColors.success}/> }
            label="Verified" 
            size="small" 
            sx={{ 
              width: 'min-content', 
              bgcolor: `${themeColors.success}10`, 
              color: themeColors.success,
              fontWeight: 900
            }} 
          />
        </Stack>
      </ListItemWrapper>

      {/* 3. NEW BOOKING ACTION */}
      <ListItemWrapper isUnread={true}>
        <ListItem
          alignItems="center"
          disablePadding
          secondaryAction={
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>2 hrs ago</Typography>
            </Stack>
          }
        >
          <ListItemAvatar>
            <Avatar
              sx={{
                color: themeColors.info,
                bgcolor: `${themeColors.info}15`,
                borderRadius: '12px'
              }}
            >
              <IconBuildingStore stroke={2} size="22px" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>New Booking Received</Typography>} />
        </ListItem>
        <Stack spacing={2} sx={containerSX}>
          <Typography variant="body2" sx={{ color: '#4B5563' }}>
            Booking ID #BME-10294: Premium Stage Decoration for Kochi Wedding Event.
          </Typography>
          <Button 
            variant="contained" 
            size="small"
            sx={{ 
                width: 'min-content', 
                bgcolor: themeColors.accent, 
                borderRadius: '8px',
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(234, 76, 70, 0.2)',
                '&:hover': { bgcolor: themeColors.accent }
            }}
          >
            Review Booking
          </Button>
        </Stack>
      </ListItemWrapper>

      {/* 4. PERFORMANCE ALERT */}
      <ListItemWrapper>
        <ListItem
          alignItems="center"
          disablePadding
          secondaryAction={
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>5 hrs ago</Typography>
            </Stack>
          }
        >
          <ListItemAvatar>
            <Avatar
              sx={{
                color: themeColors.warning,
                bgcolor: `${themeColors.warning}15`,
                borderRadius: '12px'
              }}
            >
              <IconAlertCircle stroke={2.5} size="22px" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Server Alert: High Load</Typography>} />
        </ListItem>
        <Stack spacing={1} sx={containerSX}>
          <Typography variant="body2" sx={{ color: '#4B5563' }}>
            We noticed a sudden spike in traffic for the "Mehandi Artist" module. Auto-scaling is active.
          </Typography>
          <Chip 
              label="Maintenance" 
              size="small" 
              sx={{ 
                width: 'min-content', 
                bgcolor: '#FFF7ED', 
                color: themeColors.warning,
                fontWeight: 900
              }} 
            />
        </Stack>
      </ListItemWrapper>
    </List>
  );
}

NotificationList.propTypes = { children: PropTypes.node };

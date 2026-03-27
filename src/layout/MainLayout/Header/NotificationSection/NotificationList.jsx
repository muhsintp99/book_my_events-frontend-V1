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
  IconBuildingStore, 
  IconMailbox, 
  IconCheck, 
  IconClock,
  IconUserPlus,
  IconPackage,
  IconShoppingCart,
  IconMessageCircle,
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
      {/* 1. NEW VENDOR JOIN */}
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
                color: themeColors.success,
                bgcolor: `${themeColors.success}15`,
                borderRadius: '12px'
              }}
            >
              <IconUserPlus stroke={2} size="22px" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>New Vendor Join</Typography>} 
          />
        </ListItem>
        <Stack spacing={1.5} sx={containerSX}>
          <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.5 }}>
            Vendor "Glow Events" has registered for the "Mehandi Artist" module from the Dubai Zone.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip 
              label="New Registration" 
              size="small" 
              sx={{ 
                height: 20, 
                bgcolor: '#e7f9f3', 
                color: themeColors.success, 
                fontWeight: 900, 
                fontSize: '0.65rem' 
              }} 
            />
          </Stack>
        </Stack>
      </ListItemWrapper>

      {/* 2. PACKAGE CREATED */}
      <ListItemWrapper>
        <ListItem
          alignItems="center"
          disablePadding
          secondaryAction={
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>30 min ago</Typography>
            </Stack>
          }
        >
          <ListItemAvatar>
            <Avatar
              sx={{
                color: themeColors.indigo,
                bgcolor: `${themeColors.indigo}15`,
                borderRadius: '12px'
              }}
            >
              <IconPackage stroke={2.5} size="22px" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>New Package Created</Typography>} />
        </ListItem>
        <Stack spacing={1} sx={containerSX}>
          <Typography variant="body2" sx={{ color: '#4B5563' }}>
            Vendor "Perfect Catering" has created a new "Premium Wedding Lunch" package.
          </Typography>
          <Chip 
            label="Package Update" 
            size="small" 
            sx={{ 
              width: 'min-content', 
              bgcolor: `${themeColors.indigo}10`, 
              color: themeColors.indigo,
              fontWeight: 900
            }} 
          />
        </Stack>
      </ListItemWrapper>

      {/* 3. NEW ORDER RECEIVED */}
      <ListItemWrapper isUnread={true}>
        <ListItem
          alignItems="center"
          disablePadding
          secondaryAction={
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>1 hr ago</Typography>
            </Stack>
          }
        >
          <ListItemAvatar>
            <Avatar
              sx={{
                color: themeColors.accent,
                bgcolor: themeColors.accentLight,
                borderRadius: '12px'
              }}
            >
              <IconShoppingCart stroke={2} size="22px" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>New Order Notification</Typography>} />
        </ListItem>
        <Stack spacing={1.5} sx={containerSX}>
          <Typography variant="body2" sx={{ color: '#4B5563' }}>
            Order #ORD-9827: Deluxe Auditorium booking for April 15th received.
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
            Review Order
          </Button>
        </Stack>
      </ListItemWrapper>

      {/* 4. ENQUIRY NOTIFICATION */}
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
              <IconMessageCircle stroke={2.5} size="22px" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>New Enquiry Received</Typography>} />
        </ListItem>
        <Stack spacing={1} sx={containerSX}>
          <Typography variant="body2" sx={{ color: '#4B5563' }}>
            A new enquiry from "Aman" regarding 'Flower Decoration' services.
          </Typography>
          <Chip 
              icon={<IconMailbox size={12} />}
              label="Enquiry" 
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

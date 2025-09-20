import React from 'react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
// project imports
import LogoSection from '../LogoSection';
import ProfileSection from './ProfileSection';
import NotificationSection from './NotificationSection';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
// icons
import { IconMenu2, IconHome, IconBuildingSkyscraper, IconCalendarEvent, IconPlus,IconMapPin } from '@tabler/icons-react';
export default function Header() {
  const theme = useTheme();
  const navigate = useNavigate();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleAddModule = () => {
    navigate('/module/add');
    handleClose();
  };
  const handleModuleClick = (moduleLabel) => {
    console.log(`${moduleLabel} module clicked`);
    // Set the active module in localStorage to persist across page reloads
    const moduleName = moduleLabel.toLowerCase();
    localStorage.setItem('activeModule', moduleName);
    
    // Determine sidebar type based on module
    let sidebarType = 'crm'; // default
    if (moduleName === 'auditorium') {
      sidebarType = 'auditorium';
    }
    
    localStorage.setItem('sidebarType', sidebarType);
    
    // Dispatch events to update sidebar and menu with the new module
    window.dispatchEvent(new CustomEvent('moduleChanged', {
      detail: { module: moduleName, sidebarType }
    }));
    
    window.dispatchEvent(new CustomEvent('sidebarTypeChanged', {
      detail: { sidebarType }
    }));
    // Force menu to refresh with new items
    window.dispatchEvent(new CustomEvent('menuItemsChanged', {
      detail: { moduleType: moduleName }
    }));
    // Handle different module navigation
    switch (moduleName) {
      case 'rental':
        navigate('/rental/dashboard');
        break;
      case 'events':
        navigate('/events/dashboard');
        break;
      case 'auditorium':
        navigate('/auditorium/dashboard');
        break;
      default:
        console.log(`No route defined for ${moduleLabel}`);
    }
    // Force sidebar to refresh/update with new menu items
    window.dispatchEvent(new CustomEvent('refreshSidebar', {
      detail: { moduleType: moduleName }
    }));
    // Force page reload to ensure menu items are updated
    setTimeout(() => {
      window.location.reload();
    }, 100);
    handleClose();
  };
  // Menu items
  const menuItems = [
    {
      label: 'Rental',
      icon: <IconBuildingSkyscraper size={24} color="#1976d2" />,
      route: '/rental/dashboard',
      sidebarType: 'crm'
    },
    {
      label: 'Events',
      icon: <IconCalendarEvent size={24} color="#1976d2" />,
      route: '/events/dashboard',
      sidebarType: 'crm'
    },
    {
      label: 'Auditorium',
      icon: <IconHome size={24} color="#1976d2" />,
      route: '/auditorium/dashboard',
      sidebarType: 'auditorium'
    },
    // {
    //   label: 'Venue',
    //   icon: <IconMapPin size={24} color="#1976d2" />,
    //   route: '/venue/dashboard',
    //   sidebarType: 'venue'
    // },
  ];
  return (
    <>
      {/* Logo & toggler */}
      <Box sx={{ width: downMD ? 'auto' : 228, display: 'flex', alignItems: 'center' }}>
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
        <Avatar
          variant="rounded"
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            overflow: 'hidden',
            transition: 'all .2s ease-in-out',
            bgcolor: 'secondary.light',
            color: 'secondary.dark',
            '&:hover': { bgcolor: 'secondary.dark', color: 'secondary.light' },
          }}
          onClick={() => handlerDrawerOpen(!drawerOpen)}
          color="inherit"
        >
          <IconMenu2 stroke={1.5} size="20px" />
        </Avatar>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      {/* Demo Module + horizontal dropdown */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Demo Module Button */}
        <Button
          variant="contained"
          size="large"
          sx={{ textTransform: 'none', borderRadius: '50px', px: 3, py: 1.5, fontSize: '1rem' }}
          onClick={handleClick}
        >
          Demo Modules
        </Button>
        {/* Horizontal dropdown menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          sx={{ p: 1 }}
        >
          <Box sx={{ backgroundColor: '#fff' }}>
            {/* Existing modules */}
            <Box sx={{ display: 'flex', gap: 2, px: 1, py: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => handleModuleClick(item.label)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#fff',
                    color: '#1976d2',
                    borderRadius: '12px',
                    px: 3,
                    py: 2,
                    minWidth: 100,
                    fontSize: '0.95rem',
                    border: '1px solid #e0e0e0',
                    '&:hover': { bgcolor: '#f5f5f5' },
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <ListItemIcon sx={{ justifyContent: 'center', color: '#1976d2', minWidth: 0 }}>
                    {item.icon}
                  </ListItemIcon>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {item.label}
                  </Typography>
                </Button>
              ))}
            </Box>
            {/* Divider */}
            <Divider sx={{ mx: 1, my: 1 }} />
            {/* Add Module section */}
            <Box sx={{ px: 1, py: 1 }}>
              <Button
                onClick={handleAddModule}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  width: '100%',
                  bgcolor: '#fff',
                  color: '#4caf50',
                  borderRadius: '12px',
                  px: 3,
                  py: 2,
                  fontSize: '0.95rem',
                  border: '1px dashed #4caf50',
                  '&:hover': {
                    bgcolor: '#f1f8e9',
                    borderColor: '#388e3c'
                  },
                }}
              >
                <IconPlus size={20} />
                <Typography variant="body2">
                  Add Module
                </Typography>
              </Button>
            </Box>
          </Box>
        </Menu>
        <NotificationSection />
        <ProfileSection />
      </Box>
    </>
  );
}
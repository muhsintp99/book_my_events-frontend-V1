import React, { useEffect, useState } from 'react';
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
import Grid from '@mui/material/Grid';

// project imports
import LogoSection from '../LogoSection';
import ProfileSection from './ProfileSection';
import NotificationSection from './NotificationSection';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// icons
import { IconMenu2, IconPlus } from '@tabler/icons-react';

export default function Header() {
  const theme = useTheme();
  const navigate = useNavigate();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [anchorEl, setAnchorEl] = useState(null);
  const [modules, setModules] = useState([]);
  const open = Boolean(anchorEl);

  // --- Static modules ---
  const staticModules = [
    { title: 'Rental', moduleId: 'rental-001', type: 'crm', icon: '/icons/rental.svg' },
    { title: 'Events', moduleId: 'events-001', type: 'crm', icon: '/icons/events.svg' },
    { title: 'Auditorium', moduleId: 'auditorium-001', type: 'auditorium', icon: '/icons/auditorium.svg' }
  ];

  // --- Fetch & Deduplicate API modules ---
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await fetch('https://api.bookmyevent.ae/api/modules/');
        const data = await res.json();

        const formattedModules = data
          .filter((m) => m.isActive)
          .map((m) => {
            let title = m.title.trim().toLowerCase();
            switch (title) {
              case 'rental': title = 'Rental'; break;
              case 'event':
              case 'events': title = 'Events'; break;
              case 'auditorium':
              case 'venue': title = 'Auditorium'; break;
              case 'mehandi': title = 'Mehandi'; break;
              case 'photography': title = 'Photography'; break;
              case 'catering': title = 'Catering'; break;
              case 'makeup': title = 'Makeup'; break;
              case 'dj': title = 'DJ'; break;
              default: title = m.title;
            }

            return {
              _id: m._id.$oid || m._id, // use API _id
              title,
              moduleId: m.moduleId,
              type: title === 'Auditorium' ? 'auditorium' : 'crm',
              icon: m.icon
            };
          });

        // Merge static + API modules (API overrides static)
        const allModulesMap = new Map();

        // Add static modules first
        staticModules.forEach((m) => {
          allModulesMap.set(m.title.toLowerCase(), m);
        });

        // Add API modules (overrides static if same title)
        formattedModules.forEach((m) => {
          allModulesMap.set(m.title.toLowerCase(), m);
        });

        setModules(Array.from(allModulesMap.values()));
      } catch (err) {
        console.error('Error fetching modules:', err);
      }
    };

    fetchModules();
  }, []);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleAddModule = () => {
    navigate('/module/add');
    handleClose();
  };

  const handleModuleClick = (module) => {
    const moduleName = (module.title || '').toLowerCase();
    const moduleId = module.moduleId;
    const sidebarType = module.type || 'crm';
    const moduleDbId = module._id; // take API _id

    // Store all needed info in localStorage
    localStorage.setItem('activeModule', moduleName);
    localStorage.setItem('moduleId', moduleId);
    localStorage.setItem('sidebarType', sidebarType);
    localStorage.setItem('moduleDbId', moduleDbId);

    // Dispatch events for other components
    window.dispatchEvent(new CustomEvent('moduleChanged', { detail: { module: moduleName, sidebarType } }));
    window.dispatchEvent(new CustomEvent('sidebarTypeChanged', { detail: { sidebarType } }));
    window.dispatchEvent(new CustomEvent('menuItemsChanged', { detail: { moduleType: moduleName } }));

    // Navigate
    switch (moduleName) {
      case 'rental': navigate('/rental/dashboard'); break;
      case 'event':
      case 'events': navigate('/events/dashboard'); break;
      case 'venue':
      case 'auditorium': navigate('/auditorium/dashboard'); break;
      default: console.log(`No route defined for ${moduleName}`);
    }

    window.dispatchEvent(new CustomEvent('refreshSidebar', { detail: { moduleType: moduleName } }));
    setTimeout(() => window.location.reload(), 100);
    handleClose();
  };

  return (
    <>
      {/* Logo & Drawer */}
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

      {/* Modules Dropdown */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          sx={{ textTransform: 'none', borderRadius: '50px', px: 3, py: 1.5, fontSize: '1rem' }}
          onClick={handleClick}
        >
          Demo Modules
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          sx={{ p: 1 }}
        >
          <Box sx={{ backgroundColor: '#fff', p: 2 }}>
            <Grid container spacing={2} sx={{ px: 2, py: 2 }}>
              {modules.map((item) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={item._id || item.moduleId}>
                  <Box
                    onClick={() => handleModuleClick(item)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#fff',
                      color: '#1976d2',
                      borderRadius: 2,
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      aspectRatio: '1 / 1',
                      width: '100%',
                      height: '100%',
                      p: 1,
                      '&:hover': { bgcolor: '#f5f5f5', transform: 'scale(1.05)', boxShadow: 3 }
                    }}
                  >
                    <ListItemIcon sx={{ justifyContent: 'center', color: '#1976d2', minWidth: 0 }}>
                      <img
                        src={
                          item.icon
                            ? item.icon.startsWith('http')
                              ? item.icon
                              : `https://api.bookmyevent.ae/${item.icon}`
                            : '/default-icon.png'
                        }
                        alt={item.title || 'Module'}
                        style={{ width: '40%', height: '40%', objectFit: 'contain' }}
                      />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                      {item.title || 'Untitled'}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 2 }} />

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
                  '&:hover': { bgcolor: '#f1f8e9', borderColor: '#388e3c' },
                }}
              >
                <IconPlus size={20} />
                <Typography variant="body2">Add Module</Typography>
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
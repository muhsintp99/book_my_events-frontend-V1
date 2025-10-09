// import React, { useEffect, useState } from 'react';
// import { useTheme } from '@mui/material/styles';
// import { useNavigate, useLocation } from 'react-router-dom';
// import useMediaQuery from '@mui/material/useMediaQuery';
// import Avatar from '@mui/material/Avatar';
// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
// import Menu from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';
// import Typography from '@mui/material/Typography';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import Divider from '@mui/material/Divider';
// import Grid from '@mui/material/Grid';

// // project imports
// import LogoSection from '../LogoSection';
// import ProfileSection from './ProfileSection';
// import NotificationSection from './NotificationSection';
// import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// // icons
// import {
//   IconMenu2,
//   IconPlus,
//   IconSettings,
//   IconChevronDown,
//   IconMapPinFilled,
//   IconTool,
//   IconCreditCard,
//   IconUsers
// } from '@tabler/icons-react';

// export default function Header() {
//   const theme = useTheme();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const downMD = useMediaQuery(theme.breakpoints.down('md'));
//   const { menuMaster } = useGetMenuMaster();
//   const drawerOpen = menuMaster.isDashboardDrawerOpened;

//   const [anchorEl, setAnchorEl] = useState(null);
//   const [modules, setModules] = useState([]);
//   const open = Boolean(anchorEl);

//   const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
//   const settingsOpen = Boolean(settingsAnchorEl);

//   // --- Static modules ---
//   const staticModules = [
//     { title: 'Rental', moduleId: 'rental-001', type: 'crm', icon: '/icons/rental.svg' },
//     { title: 'Events', moduleId: 'events-001', type: 'crm', icon: '/icons/events.svg' },
//     { title: 'Auditorium', moduleId: 'auditorium-001', type: 'auditorium', icon: '/icons/auditorium.svg' }
//   ];

//   // --- Default module setup on entry ---
//   useEffect(() => {
//     if (
//       location.pathname === '/' ||
//       location.pathname === '/rental/dashboard' ||
//       location.pathname === '/events/dashboard' ||
//       location.pathname === '/auditorium/dashboard'
//     ) {
//       localStorage.setItem('activeModule', 'crm');
//       localStorage.setItem('sidebarType', 'crm');
//       window.dispatchEvent(new CustomEvent('moduleChanged', { detail: { module: 'crm', sidebarType: 'crm' } }));
//       window.dispatchEvent(new CustomEvent('sidebarTypeChanged', { detail: { sidebarType: 'crm' } }));
//       window.dispatchEvent(new CustomEvent('menuItemsChanged', { detail: { moduleType: 'crm' } }));
//       window.dispatchEvent(new CustomEvent('refreshSidebar', { detail: { moduleType: 'crm' } }));
//     }
//   }, [location.pathname]);

//   // --- Fetch & Deduplicate API modules ---
//   useEffect(() => {
//     const fetchModules = async () => {
//       try {
//         const res = await fetch('https://api.bookmyevent.ae/api/modules/');
//         const data = await res.json();

//         const formattedModules = data
//           .filter((m) => m.isActive)
//           .map((m) => {
//             let title = m.title.trim().toLowerCase();
//             switch (title) {
//               case 'rental': title = 'Rental'; break;
//               case 'event':
//               case 'events': title = 'Events'; break;
//               case 'auditorium':
//               case 'venue': title = 'Auditorium'; break;
//               case 'mehandi': title = 'Mehandi'; break;
//               case 'photography': title = 'Photography'; break;
//               case 'catering': title = 'Catering'; break;
//               case 'makeup': title = 'Makeup'; break;
//               case 'dj': title = 'DJ'; break;
//               default: title = m.title;
//             }

//             return {
//               _id: m._id?.$oid || m._id,
//               title,
//               moduleId: m.moduleId,
//               type: title === 'Auditorium' ? 'auditorium' : 'crm',
//               icon: m.icon
//             };
//           });

//         const allModulesMap = new Map();
//         staticModules.forEach((m) => allModulesMap.set(m.title.toLowerCase(), m));
//         formattedModules.forEach((m) => allModulesMap.set(m.title.toLowerCase(), m));

//         setModules(Array.from(allModulesMap.values()));
//       } catch (err) {
//         console.error('Error fetching modules:', err);
//       }
//     };

//     fetchModules();
//   }, []);

//   // --- Menu handlers ---
//   const handleClick = (event) => setAnchorEl(event.currentTarget);
//   const handleClose = () => setAnchorEl(null);

//   const handleSettingsClick = (event) => setSettingsAnchorEl(event.currentTarget);
//   const handleSettingsClose = () => setSettingsAnchorEl(null);

//   const handleAddModule = () => {
//     navigate('/settings/module-setup');
//     handleClose();
//   };

//   const handleSettingsNavigation = (route) => {
//     if (route.startsWith('/settings/')) {
//       localStorage.setItem('activeModule', 'setting');
//       localStorage.setItem('sidebarType', 'setting');

//       window.dispatchEvent(new CustomEvent('moduleChanged', { detail: { module: 'setting', sidebarType: 'setting' } }));
//       window.dispatchEvent(new CustomEvent('sidebarTypeChanged', { detail: { sidebarType: 'setting' } }));
//       window.dispatchEvent(new CustomEvent('menuItemsChanged', { detail: { moduleType: 'setting' } }));
//       window.dispatchEvent(new CustomEvent('refreshSidebar', { detail: { moduleType: 'setting' } }));

//       setTimeout(() => window.location.reload(), 100);
//       handleClose();
//     }
//     navigate(route);
//     handleSettingsClose();
//   };

//   const handleModuleClick = (module) => {
//     const moduleName = (module.title || '').toLowerCase();
//     const moduleId = module.moduleId;
//     const sidebarType = module.type || 'crm';
//     const moduleDbId = module._id;

//     localStorage.setItem('activeModule', moduleName);
//     localStorage.setItem('moduleId', moduleId);
//     localStorage.setItem('sidebarType', sidebarType);
//     localStorage.setItem('moduleDbId', moduleDbId);

//     window.dispatchEvent(new CustomEvent('moduleChanged', { detail: { module: moduleName, sidebarType } }));
//     window.dispatchEvent(new CustomEvent('sidebarTypeChanged', { detail: { sidebarType } }));
//     window.dispatchEvent(new CustomEvent('menuItemsChanged', { detail: { moduleType: moduleName } }));

//     switch (moduleName) {
//       case 'rental': navigate('/rental/dashboard'); break;
//       case 'event':
//       case 'events': navigate('/events/dashboard'); break;
//       case 'venue':
//       case 'auditorium': navigate('/auditorium/dashboard'); break;
//       default: console.log(`No route defined for ${moduleName}`);
//     }

//     window.dispatchEvent(new CustomEvent('refreshSidebar', { detail: { moduleType: moduleName } }));
//     setTimeout(() => window.location.reload(), 100);
//     handleClose();
//   };

//   const settingsMenuItems = [
//     { label: 'Zone Setup', icon: <IconMapPinFilled size={20} />, route: '/settings/zone-setup' },
//     { label: 'Module Setup', icon: <IconTool size={20} />, route: '/settings/module-setup' },
//     { label: 'Subscription Settings', icon: <IconCreditCard size={20} />, route: '/settings/sub/list' },
//     { label: 'Employee Management', icon: <IconUsers size={20} />, route: '/settings/employee' }
//   ];

//   return (
//     <>
//       {/* Logo & Drawer */}
//       <Box sx={{ width: downMD ? 'auto' : 228, display: 'flex', alignItems: 'center' }}>
//         <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
//           <LogoSection />
//         </Box>
//         <Avatar
//           variant="rounded"
//           sx={{
//             ...theme.typography.commonAvatar,
//             ...theme.typography.mediumAvatar,
//             overflow: 'hidden',
//             transition: 'all .2s ease-in-out',
//             bgcolor: 'secondary.light',
//             color: 'secondary.dark',
//             '&:hover': { bgcolor: 'secondary.dark', color: 'secondary.light' }
//           }}
//           onClick={() => handlerDrawerOpen(!drawerOpen)}
//           color="inherit"
//         >
//           <IconMenu2 stroke={1.5} size="20px" />
//         </Avatar>
//       </Box>

//       <Box sx={{ flexGrow: 1 }} />

//       {/* Settings Button */}
//       <Button
//         variant="outlined"
//         size="large"
//         startIcon={<IconSettings size={20} />}
//         endIcon={<IconChevronDown size={16} />}
//         sx={{
//           textTransform: 'none',
//           borderRadius: '50px',
//           px: 3,
//           py: 1.5,
//           fontSize: '1rem',
//           borderColor: '#e0e0e0',
//           color: '#666',
//           '&:hover': { borderColor: '#ccc', bgcolor: '#f5f5f5' }
//         }}
//         onClick={handleSettingsClick}
//       >
//         Settings
//       </Button>

//       {/* Settings dropdown menu */}
//       <Menu
//         anchorEl={settingsAnchorEl}
//         open={settingsOpen}
//         onClose={handleSettingsClose}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
//         transformOrigin={{ vertical: 'top', horizontal: 'left' }}
//         sx={{
//           mt: 1,
//           '& .MuiPaper-root': {
//             minWidth: 200,
//             borderRadius: 2,
//             boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
//           }
//         }}
//       >
//         {settingsMenuItems.map((item) => (
//           <MenuItem
//             key={item.label}
//             onClick={() => handleSettingsNavigation(item.route)}
//             sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: '#f5f5f5' } }}
//           >
//             <ListItemIcon sx={{ minWidth: 36, color: '#666' }}>
//               {item.icon}
//             </ListItemIcon>
//             <Typography variant="body2" sx={{ color: '#333' }}>
//               {item.label}
//             </Typography>
//           </MenuItem>
//         ))}
//       </Menu>

//       {/* Modules Dropdown */}
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//         <Button
//           variant="contained"
//           size="large"
//           sx={{ textTransform: 'none', borderRadius: '50px', px: 3, py: 1.5, fontSize: '1rem' }}
//           onClick={handleClick}
//         >
//           Demo Modules
//         </Button>

//         <Menu
//           anchorEl={anchorEl}
//           open={open}
//           onClose={handleClose}
//           anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
//           transformOrigin={{ vertical: 'top', horizontal: 'left' }}
//           sx={{ p: 1 }}
//         >
//           <Box sx={{ backgroundColor: '#fff', p: 2 }}>
//             <Grid container spacing={2} sx={{ px: 2, py: 2 }}>
//               {modules.map((item) => (
//                 <Grid item xs={6} sm={4} md={3} lg={2} key={item._id || item.moduleId}>
//                   <Box
//                     onClick={() => handleModuleClick(item)}
//                     sx={{
//                       display: 'flex',
//                       flexDirection: 'column',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       bgcolor: '#fff',
//                       color: '#1976d2',
//                       borderRadius: 2,
//                       border: '1px solid #e0e0e0',
//                       cursor: 'pointer',
//                       transition: 'all 0.3s ease',
//                       aspectRatio: '1 / 1',
//                       width: '100%',
//                       height: '100%',
//                       p: 1,
//                       '&:hover': { bgcolor: '#f5f5f5', transform: 'scale(1.05)', boxShadow: 3 }
//                     }}
//                   >
//                     <ListItemIcon sx={{ justifyContent: 'center', color: '#1976d2', minWidth: 0 }}>
//                       <img
//                         src={
//                           item.icon
//                             ? item.icon.startsWith('http')
//                               ? item.icon
//                               : `https://api.bookmyevent.ae/${item.icon}`
//                             : '/default-icon.png'
//                         }
//                         alt={item.title || 'Module'}
//                         style={{ width: '40%', height: '40%', objectFit: 'contain' }}
//                       />
//                     </ListItemIcon>
//                     <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
//                       {item.title || 'Untitled'}
//                     </Typography>
//                   </Box>
//                 </Grid>
//               ))}
//             </Grid>

//             <Divider sx={{ my: 2 }} />

//             <Box sx={{ px: 1, py: 1 }}>
//               <Button
//                 onClick={handleAddModule}
//                 sx={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: 1,
//                   width: '100%',
//                   bgcolor: '#fff',
//                   color: '#4caf50',
//                   borderRadius: '12px',
//                   px: 3,
//                   py: 2,
//                   fontSize: '0.95rem',
//                   border: '1px dashed #4caf50',
//                   '&:hover': { bgcolor: '#f1f8e9', borderColor: '#388e3c' }
//                 }}
//               >
//                 <IconPlus size={20} />
//                 <Typography variant="body2">Add Module</Typography>
//               </Button>
//             </Box>
//           </Box>
//         </Menu>

//         <NotificationSection />
//         <ProfileSection />
//       </Box>
//     </>
//   );
// }












import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
import {
  IconMenu2,
  IconPlus,
  IconSettings,
  IconChevronDown,
  IconMapPinFilled,
  IconTool,
  IconCreditCard,
  IconUsers
} from '@tabler/icons-react';

export default function Header() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [anchorEl, setAnchorEl] = useState(null);
  const [modules, setModules] = useState([]);
  const [secondaryModules, setSecondaryModules] = useState([]);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const settingsOpen = Boolean(settingsAnchorEl);

  // Utility function to dispatch module events
  const dispatchModuleEvents = (moduleName, sidebarType) => {
    localStorage.setItem('activeModule', moduleName);
    localStorage.setItem('sidebarType', sidebarType);
    
    const events = [
      { name: 'moduleChanged', detail: { module: moduleName, sidebarType } },
      { name: 'sidebarTypeChanged', detail: { sidebarType } },
      { name: 'menuItemsChanged', detail: { moduleType: moduleName } },
      { name: 'refreshSidebar', detail: { moduleType: moduleName } }
    ];
    
    events.forEach(({ name, detail }) => {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    });
  };

  // Utility function to format module titles
  const formatModuleTitle = (title) => {
    const trimmed = title.trim();
    const titleLower = trimmed.toLowerCase();
    
    const specialCases = {
      'mehandi': 'Mehandi',
      'mahandi': 'Mehandi',
      'photography': 'Photography',
      'catering': 'Catering',
      'makeup': 'Makeup',
      'dj': 'DJ',
      'music': 'Music',
      'invitation and printing': 'Invitation & Printing',
      'stage decoration': 'Stage Decoration'
    };
    
    if (specialCases[titleLower]) {
      return specialCases[titleLower];
    }
    
    return trimmed.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Default module setup on entry
  useEffect(() => {
    const path = location.pathname.split('/')[1];
    dispatchModuleEvents(path || '', path || '');
  }, [location.pathname]);

  // Fetch modules
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await fetch('https://api.bookmyevent.ae/api/modules/');
        const data = await res.json();

        const formattedApiModules = data
          .filter((m) => m.isActive)
          .map((m) => ({
            _id: m._id?.$oid || m._id,
            title: formatModuleTitle(m.title),
            moduleId: m.moduleId,
            type: 'crm',
            icon: m.icon,
            isStatic: false
          }));

        // Reorder modules to prioritize Rental, Events, Auditorium
        const priorityOrder = ['Rental', 'Events', 'Auditorium'];
        const reorderedModules = [];
        
        priorityOrder.forEach(title => {
          const module = formattedApiModules.find(m => m.title === title);
          if (module) reorderedModules.push(module);
        });
        
        formattedApiModules.forEach(m => {
          if (!reorderedModules.some(rm => rm.title === m.title)) {
            reorderedModules.push(m);
          }
        });
        
        setModules(reorderedModules);
      } catch (err) {
        console.error('Error fetching modules:', err);
      }
    };

    const fetchSecondaryModules = async () => {
      try {
        const res = await fetch('https://api.bookmyevent.ae/api/secondary-modules/');
        const data = await res.json();

        const formattedSecondaryModules = data
          .filter((m) => m.isActive)
          .map((m) => ({
            _id: m._id?.$oid || m._id,
            title: formatModuleTitle(m.title),
            moduleId: m.moduleId,
            type: 'secondary',
            icon: m.icon
          }));

        setSecondaryModules(formattedSecondaryModules);
      } catch (err) {
        console.error('Error fetching secondary modules:', err);
      }
    };

    fetchModules();
    fetchSecondaryModules();
  }, []);

  // Menu handlers
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSettingsClick = (event) => setSettingsAnchorEl(event.currentTarget);
  const handleSettingsClose = () => setSettingsAnchorEl(null);

  const handleAddModule = () => {
    dispatchModuleEvents('setting', 'setting');
    navigate('/settings/module-setup');
    handleClose();
    setTimeout(() => window.location.reload(), 100);
  };

  const handleAddSecondaryModule = () => {
    navigate('/settings/secondery-module-setup');
    handleClose();
  };

  const handleSettingsNavigation = (route) => {
    if (route.startsWith('/settings/')) {
      dispatchModuleEvents('setting', 'setting');
      setTimeout(() => window.location.reload(), 100);
    }
    navigate(route);
    handleSettingsClose();
  };

  const handleModuleClick = (module) => {
    const moduleName = (module.title || '').toLowerCase();
    const moduleId = module.moduleId;
    const sidebarType = module.type || 'crm';
    const moduleDbId = module._id;

    localStorage.setItem('moduleId', moduleId);
    if (moduleDbId && !module.isStatic) {
      localStorage.setItem('moduleDbId', moduleDbId);
    }

    dispatchModuleEvents(moduleName, sidebarType);
    navigate(`/${moduleName}/dashboard`);
    setTimeout(() => window.location.reload(), 100);
    handleClose();
  };

  const handleSecondaryModuleClick = (module) => {
    const moduleName = (module.title || '').toLowerCase();
    const moduleId = module.moduleId;
    const moduleDbId = module._id;

    localStorage.setItem('moduleId', moduleId);
    if (moduleDbId) {
      localStorage.setItem('moduleDbId', moduleDbId);
    }

    dispatchModuleEvents(moduleName, 'secondary');
    navigate(`/${moduleName}/dashboard`);
    setTimeout(() => window.location.reload(), 100);
    handleClose();
  };

  const settingsMenuItems = [
    { label: 'Zone Setup', icon: <IconMapPinFilled size={20} />, route: '/settings/zone-setup' },
    { label: 'Module Setup', icon: <IconTool size={20} />, route: '/settings/module-setup' },
    { label: 'Subscription Settings', icon: <IconCreditCard size={20} />, route: '/settings/sub/list' },
    { label: 'Employee Management', icon: <IconUsers size={20} />, route: '/settings/employee' }
  ];

  const getImageUrl = (icon, isSecondary = false) => {
    if (!icon) return '/default-icon.png';
    if (icon.startsWith('http') || icon.startsWith('/')) return icon;
    return isSecondary 
      ? `https://api.bookmyevent.ae/api/${icon}`
      : `https://api.bookmyevent.ae/${icon}`;
  };

  const renderModuleGrid = (moduleList, handleClick, isSecondary = false) => (
    <Grid container spacing={2} sx={{ px: 2, py: 2 }}>
      {moduleList.length === 0 ? (
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            No {isSecondary ? 'secondary ' : ''}modules available
          </Typography>
        </Grid>
      ) : (
        moduleList.map((item) => (
          <Grid item xs={6} sm={4} md={3} key={item.moduleId}>
            <Box
              onClick={() => handleClick(item)}
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
                p: 2,
                '&:hover': { bgcolor: '#f5f5f5', transform: 'scale(1.05)', boxShadow: 3 }
              }}
            >
              <ListItemIcon sx={{ justifyContent: 'center', color: '#1976d2', minWidth: 0 }}>
                <img
                  src={getImageUrl(item.icon, isSecondary)}
                  alt={item.title || 'Module'}
                  style={{ width: 48, height: 48, objectFit: 'contain' }}
                  onError={(e) => { e.currentTarget.src = '/default-icon.png'; }}
                />
              </ListItemIcon>
              <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', fontWeight: 500 }}>
                {item.title || 'Untitled'}
              </Typography>
            </Box>
          </Grid>
        ))
      )}
    </Grid>
  );

  const renderAddButton = (onClick, label, color) => (
    <Box sx={{ px: 1, py: 1 }}>
      <Button
        onClick={onClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          width: '100%',
          bgcolor: '#fff',
          color,
          borderRadius: '12px',
          px: 3,
          py: 2,
          fontSize: '0.95rem',
          border: `1px dashed ${color}`,
          '&:hover': { 
            bgcolor: color === '#4caf50' ? '#f1f8e9' : '#fff3e0',
            borderColor: color === '#4caf50' ? '#388e3c' : '#f57c00'
          }
        }}
      >
        <IconPlus size={20} />
        <Typography variant="body2">{label}</Typography>
      </Button>
    </Box>
  );

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
            '&:hover': { bgcolor: 'secondary.dark', color: 'secondary.light' }
          }}
          onClick={() => handlerDrawerOpen(!drawerOpen)}
          color="inherit"
        >
          <IconMenu2 stroke={1.5} size="20px" />
        </Avatar>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {/* Settings Button */}
      <Button
        variant="outlined"
        size="large"
        startIcon={<IconSettings size={20} />}
        endIcon={<IconChevronDown size={16} />}
        sx={{
          textTransform: 'none',
          borderRadius: '50px',
          px: 3,
          py: 1.5,
          fontSize: '1rem',
          borderColor: '#e0e0e0',
          color: '#666',
          '&:hover': { borderColor: '#ccc', bgcolor: '#f5f5f5' }
        }}
        onClick={handleSettingsClick}
      >
        Settings
      </Button>

      {/* Settings dropdown menu */}
      <Menu
        anchorEl={settingsAnchorEl}
        open={settingsOpen}
        onClose={handleSettingsClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{
          mt: 1,
          '& .MuiPaper-root': { minWidth: 200, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }
        }}
      >
        {settingsMenuItems.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => handleSettingsNavigation(item.route)}
            sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: '#666' }}>{item.icon}</ListItemIcon>
            <Typography variant="body2" sx={{ color: '#333' }}>{item.label}</Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Modules Dropdown and Notification */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          sx={{ textTransform: 'none', borderRadius: '50px', px: 3, py: 1.5, fontSize: '1rem' }}
          onClick={handleClick}
        >
          Demo Modules
        </Button>

        <NotificationSection />

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          sx={{ p: 1 }}
        >
          <Box sx={{ backgroundColor: '#fff', p: 2, maxWidth: 600 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'left', color: '#333' }}>
              Main Modules
            </Typography>

            {renderModuleGrid(modules, handleModuleClick)}
            {renderAddButton(handleAddModule, 'Add Module', '#4caf50')}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'left', color: '#333' }}>
              Secondary Modules
            </Typography>

            {renderModuleGrid(secondaryModules, handleSecondaryModuleClick, true)}
            {renderAddButton(handleAddSecondaryModule, 'Add Secondary Module', '#ff9800')}
          </Box>
        </Menu>
      </Box>

      <Box sx={{ ml: 2 }}>
        <ProfileSection />
      </Box>
    </>
  );
}
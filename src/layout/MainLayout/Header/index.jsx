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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { API_BASE_URL, getApiImageUrl as getStandardImageUrl } from '../../../utils/apiImageUtils';

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
  IconShieldLock,
  IconChevronDown,
  IconMapPinFilled,
  IconTool,
  IconCreditCard,
  IconUsers,
  IconUserCheck,
  IconSmartHome,
  IconEye,
  IconEyeOff
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
  const [selectedModuleName, setSelectedModuleName] = useState('Select Modules');

  // Passcode states
  const [passcodeDialogOpen, setPasscodeDialogOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [passcodeTarget, setPasscodeTarget] = useState(null);
  const [passcodeVisible, setPasscodeVisible] = useState(false);

  const open = Boolean(anchorEl);
  const settingsOpen = Boolean(settingsAnchorEl);

  // Module mapping: maps display titles to their target modules and routes
  const moduleMapping = {
    venues: { targetModule: 'auditorium', route: '/auditorium/dashboard' },
    transport: { targetModule: 'rental', route: '/rental/dashboard' },
    mehandi: { targetModule: 'mehandi', route: '/mehandi/dashboard' },
    'mehandi artist': { targetModule: 'mehandi', route: '/mehandi/dashboard' },
    'invitation & printing': { targetModule: 'invitation & printing', route: '/invitation/dashboard' },
    'invitation and printing': { targetModule: 'invitation & printing', route: '/invitation/dashboard' },
    'florist & stage': { targetModule: 'florist & stage', route: '/florist/dashboard' },
    'florist and stage': { targetModule: 'florist & stage', route: '/florist/dashboard' },
    'light & sounds': { targetModule: 'light & sounds', route: '/lights/dashboard' },
    'light and sounds': { targetModule: 'light & sounds', route: '/lights/dashboard' },
    'bouncers & security': { targetModule: 'bouncers & security', route: '/bouncers/dashboard' },
    'bouncers and security': { targetModule: 'bouncers & security', route: '/bouncers/dashboard' },
    'emcee': { targetModule: 'emcee', route: '/emcee/dashboard' },
    'event host / emcee': { targetModule: 'emcee', route: '/emcee/dashboard' },
    'event host/emcee': { targetModule: 'emcee', route: '/emcee/dashboard' },
    'event host and emcee': { targetModule: 'emcee', route: '/emcee/dashboard' },
    'panthal & decorations': { targetModule: 'panthal & decorations', route: '/panthal/dashboard' },
    'panthal and decorations': { targetModule: 'panthal & decorations', route: '/panthal/dashboard' },
    'event professionals': { targetModule: 'event professionals', route: '/eventprofessionals/dashboard' }
  };

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
      mehandi: 'Mehandi',
      mahandi: 'Mehandi',
      photography: 'Photography',
      catering: 'Catering',

      // Makeup variations
      makeup: 'Makeup',
      'makeup artist': 'Makeup',
      makeupartist: 'Makeup',
      'makeup_artist': 'Makeup',
      'makeup-artist': 'Makeup',

      dj: 'DJ',
      music: 'Music',
      'invitation and printing': 'Invitation & Printing',
      'stage decoration': 'Stage Decoration'
    };

    if (specialCases[titleLower]) {
      return specialCases[titleLower];
    }

    return trimmed
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Fetch modules
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/modules/`);
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

        priorityOrder.forEach((title) => {
          const module = formattedApiModules.find((m) => m.title === title);
          if (module) reorderedModules.push(module);
        });

        formattedApiModules.forEach((m) => {
          if (!reorderedModules.some((rm) => rm.title === m.title)) {
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
        const res = await fetch(`${API_BASE_URL}/secondary-modules/`);
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
  const handleSettingsClick = (event) => {
    handleSettingsNavigation('/settings/vendor-registrations');
  };

  const handlePasscodeSubmit = () => {
    // The passcode for Superadmin access
    const SUPERADMIN_PASSCODE = '8888'; 

    if (passcode === SUPERADMIN_PASSCODE) {
      setPasscodeDialogOpen(false);
      if (typeof passcodeTarget === 'function') {
        passcodeTarget();
      }
      setPasscodeTarget(null);
    } else {
      setPasscodeError(true);
    }
  };

  const handlePasscodeClose = () => {
    setPasscodeDialogOpen(false);
    setPasscode('');
    setPasscodeError(false);
    setPasscodeTarget(null);
  };

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

  const handleHomeClick = () => {
    // Clear specific module context to return to the generic 'Select Modules' dashboard
    localStorage.removeItem('activeModule');
    localStorage.removeItem('moduleId');
    localStorage.removeItem('sidebarType');
    localStorage.removeItem('moduleDbId');
    localStorage.setItem('selectedModuleName', 'Select Modules');

    // Notify other components of the switch to a generic module selection context
    dispatchModuleEvents('', 'crm');

    // Navigate to the main dashboard
    navigate('/dashboard');
    setTimeout(() => window.location.reload(), 100);
  };

  const handleModuleClick = (module) => {
    const moduleName = (module.title || '').toLowerCase().trim();
    const moduleId = module.moduleId;
    const moduleDbId = module._id;

    // Update selected module name immediately
    setSelectedModuleName(module.title);

    // Store the selected module name in localStorage so it persists
    localStorage.setItem('selectedModuleName', module.title);

    // Check if this module has a mapping (like venues -> auditorium)
    const mapping = moduleMapping[moduleName];

    if (mapping) {
      // Use the mapped target module and route
      const targetModule = mapping.targetModule;
      const targetRoute = mapping.route;

      localStorage.setItem('moduleId', moduleId);
      if (moduleDbId && !module.isStatic) {
        localStorage.setItem('moduleDbId', moduleDbId);
      }

      dispatchModuleEvents(targetModule, module.type || 'crm');
      navigate(targetRoute);
      setTimeout(() => window.location.reload(), 100);
    } else {
      // Default behavior for non-mapped modules
      const sidebarType = module.type || 'crm';

      localStorage.setItem('moduleId', moduleId);
      if (moduleDbId && !module.isStatic) {
        localStorage.setItem('moduleDbId', moduleDbId);
      }

      dispatchModuleEvents(moduleName, sidebarType);
      navigate(`/${moduleName}/dashboard`);
      setTimeout(() => window.location.reload(), 100);
    }

    handleClose();
  };

  const handleSecondaryModuleClick = (module) => {
    const moduleName = (module.title || '').toLowerCase().trim();
    const moduleId = module.moduleId;
    const moduleDbId = module._id;

    // Update selected module name immediately
    setSelectedModuleName(module.title);

    // Store the selected module name in localStorage so it persists
    localStorage.setItem('selectedModuleName', module.title);

    // Check if this secondary module has a mapping
    const mapping = moduleMapping[moduleName];

    if (mapping) {
      // Use the mapped target module and route
      const targetModule = mapping.targetModule;
      const targetRoute = mapping.route;

      localStorage.setItem('moduleId', moduleId);
      if (moduleDbId) {
        localStorage.setItem('moduleDbId', moduleDbId);
      }

      dispatchModuleEvents(targetModule, 'secondary');
      navigate(targetRoute);
      setTimeout(() => window.location.reload(), 100);
    } else {
      // Default behavior for non-mapped secondary modules
      localStorage.setItem('moduleId', moduleId);
      if (moduleDbId) {
        localStorage.setItem('moduleDbId', moduleDbId);
      }

      dispatchModuleEvents(moduleName, 'secondary');
      navigate(`/${moduleName}/dashboard`);
      setTimeout(() => window.location.reload(), 100);
    }

    handleClose();
  };

  // Load selected module name from localStorage on component mount
  useEffect(() => {
    const storedModuleName = localStorage.getItem('selectedModuleName');
    if (storedModuleName) {
      setSelectedModuleName(storedModuleName);
    }
  }, []);
  const settingsMenuItems = [
    { label: 'Zone Setup', icon: <IconMapPinFilled size={20} />, route: '/settings/zone-setup' },
    { label: 'Module Setup', icon: <IconTool size={20} />, route: '/settings/module-setup' },
    { label: 'Subscription Settings', icon: <IconCreditCard size={20} />, route: '/settings/sub/list' },
    { label: 'Employee Management', icon: <IconUsers size={20} />, route: '/settings/employee' },
    { label: 'KYC Management', icon: <IconUserCheck size={20} />, route: '/settings/kyc-verification' }
  ];

  const getImageUrl = (icon, isSecondary = false) => {
    if (!icon) return '/default-icon.png';
    return getStandardImageUrl(icon);
  };

  const renderModuleGrid = (moduleList, handleClick, isSecondary = false) => (
    <Grid container spacing={2}>
      {moduleList.length === 0 ? (
        <Grid item xs={12}>
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: '#999'
            }}
          >
            <Typography variant="body2">No {isSecondary ? 'secondary ' : ''}modules available</Typography>
          </Box>
        </Grid>
      ) : (
        moduleList.map((item) => (
          <Grid item xs={6} sm={4} md={3} key={item.moduleId} sx={{ display: 'flex' }}>
            <Paper
              elevation={0}
              onClick={() => handleClick(item)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#ffffff',
                borderRadius: 2,
                border: '1px solid #e8e8e8',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                height: '100px', // Further reduced height
                p: 1,
                '&:hover': {
                  bgcolor: '#f8f9fa',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  borderColor: '#EA4C46'
                }
              }}
            >
              <Box
                sx={{
                  width: 44, // Smaller icons
                  height: 44,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                  border: '2px solid #eee',
                  background: '#fff',
                  flexShrink: 0
                }}
              >
                <img
                  src={getImageUrl(item.icon, isSecondary)}
                  alt={item.title || 'Module'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/default-icon.png';
                  }}
                />
              </Box>

              <Typography
                variant="caption" // Smaller font
                sx={{
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#333',
                  fontSize: '0.75rem',
                  lineHeight: 1.1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxHeight: '2.4em'
                }}
              >
                {item.title || 'Untitled'}
              </Typography>
            </Paper>
          </Grid>
        ))
      )}
    </Grid>
  );

  const renderAddButton = (onClick, label, color) => (
    <Box sx={{ mt: 2, mb: 1, px: 1 }}>
      <Button
        onClick={onClick}
        fullWidth
        sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#ffffff',
          color: '#2d3436',
          borderRadius: '16px',
          py: 1.8,
          px: 3,
          border: '1px solid #f1f2f6',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          textTransform: 'none',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          display: 'flex',
          justifyContent: 'flex-start',
          gap: 2,
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            bgcolor: color,
            transition: 'all 0.3s ease'
          },
          '&:hover': {
            bgcolor: '#ffffff',
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 28px ${color}15`,
            borderColor: color,
            color: color,
            '&:before': {
              width: '8px'
            },
            '& .plus-icon-container': {
              bgcolor: color,
              color: '#ffffff',
              transform: 'rotate(90deg) scale(1.1)',
              boxShadow: `0 4px 12px ${color}40`
            }
          },
          '&:active': {
            transform: 'translateY(-2px) scale(0.98)'
          }
        }}
      >
        <Box 
          className="plus-icon-container"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '12px', 
            bgcolor: `${color}10`,
            color: color,
            transition: 'all 0.4s ease',
            flexShrink: 0
          }}
        >
          <IconPlus size={22} stroke={3} />
        </Box>
        <Box sx={{ textAlign: 'left' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>{label}</Typography>
          <Typography variant="caption" sx={{ color: '#95a5a6', fontSize: '0.7rem', display: 'block' }}>
            Click to configure new modules
          </Typography>
        </Box>
      </Button>
    </Box>
  );

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', overflow: 'hidden' }}>
        {/* Left: Hamburger + Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 }, flexShrink: 0 }}>
          <Box component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
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

        {/* Right: Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1, md: 2 }, flexShrink: 0 }}>

          {/* Home Icon Button */}
          <Tooltip title="Back to Modules">
            <IconButton
              onClick={handleHomeClick}
              size="small"
              sx={{
                width: { xs: 32, sm: 38, md: 45 },
                height: { xs: 32, sm: 38, md: 45 },
                bgcolor: '#ffffff',
                border: '1px solid #e0e0e0',
                color: '#666',
                flexShrink: 0,
                '&:hover': {
                  borderColor: '#EA4C46',
                  bgcolor: '#FFF5F6',
                  color: '#EA4C46'
                }
              }}
            >
              <IconSmartHome size={downMD ? 16 : 22} />
            </IconButton>
          </Tooltip>

          {/* Superadmin - Icon only on mobile, text on desktop */}
          <Tooltip title="Settings">
            <IconButton
              onClick={handleSettingsClick}
              size="small"
              sx={{
                display: { xs: 'flex', md: 'none' },
                width: 32,
                height: 32,
                bgcolor: '#f5f5f5',
                color: '#666',
                border: '1px solid #e0e0e0',
                flexShrink: 0,
                '&:hover': {
                  bgcolor: '#eee',
                  color: '#333'
                }
              }}
            >
              <IconSettings size={16} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            size="large"
            startIcon={<IconSettings size={20} />}
            sx={{
              display: { xs: 'none', md: 'flex' },
              textTransform: 'none',
              borderRadius: '50px',
              px: 3,
              py: 1.5,
              fontSize: '1rem',
              bgcolor: '#f5f5f5',
              color: '#333',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                bgcolor: '#eee',
                borderColor: '#ccc',
                color: '#000',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }
            }}
            onClick={handleSettingsClick}
          >
            Settings
          </Button>

          {/* Module Name Button */}
          <Button
            variant="contained"
            size={downMD ? 'small' : 'large'}
            sx={{
              textTransform: 'none',
              borderRadius: '50px',
              px: { xs: 1.2, sm: 2, md: 3 },
              py: { xs: 0.5, sm: 1, md: 1.5 },
              fontSize: { xs: '0.65rem', sm: '0.85rem', md: '1rem' },
              maxWidth: { xs: 90, sm: 140, md: 'none' },
              minWidth: 'unset',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
              flexShrink: 0,
              bgcolor: '#EA4C46',
              lineHeight: { xs: 1.2, md: 1.75 },
              '&:hover': {
                bgcolor: '#d43d37'
              }
            }}
            onClick={handleClick}
          >
            {selectedModuleName}
          </Button>

          {/* Notification */}
          <Box sx={{ flexShrink: 0 }}>
            <NotificationSection />
          </Box>

          {/* Module Select Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                width: downMD ? '95vw' : 420,
                maxWidth: '100%',
                maxHeight: '65vh',
                overflowY: 'auto',
                borderRadius: 3,
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                position: 'fixed !important',
                right: '8px !important',
                top: '70px !important',
                left: 'auto !important',
                transform: 'translateX(0) !important',
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '10px' },
                '&::-webkit-scrollbar-thumb': { background: '#c1c1c1', borderRadius: '10px', '&:hover': { background: '#a8a8a8' } }
              }
            }}
          >
            <Box sx={{ p: 2 }}>
              {/* Main Modules Section */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, pb: 1, borderBottom: '2px solid #f0f0f0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '1.1rem' }}>
                    Main Modules
                  </Typography>
                  <Box sx={{ ml: 1.5, px: 1.5, py: 0.5, bgcolor: '#FFF5F6', borderRadius: '12px' }}>
                    <Typography variant="caption" sx={{ color: '#EA4C46', fontWeight: 600, fontSize: '0.75rem' }}>
                      {modules.length}
                    </Typography>
                  </Box>
                </Box>
                {renderModuleGrid(modules, handleModuleClick)}
                {renderAddButton(handleAddModule, 'Add New Module', '#EA4C46')}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Secondary Modules Section */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, pb: 1, borderBottom: '2px solid #f0f0f0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '1.1rem' }}>
                    Secondary Modules
                  </Typography>
                  <Box sx={{ ml: 1.5, px: 1.5, py: 0.5, bgcolor: '#FFF5F6', borderRadius: '12px' }}>
                    <Typography variant="caption" sx={{ color: '#EA4C46', fontWeight: 600, fontSize: '0.75rem' }}>
                      {secondaryModules.length}
                    </Typography>
                  </Box>
                </Box>
                {renderModuleGrid(secondaryModules, handleSecondaryModuleClick, true)}
                {renderAddButton(handleAddSecondaryModule, 'Add Secondary Module', '#D32F2F')}
              </Box>
            </Box>
          </Menu>

          {/* Profile */}
          <Box sx={{ flexShrink: 0 }}>
            <ProfileSection />
          </Box>
        </Box>
      </Box>


    </>
  );
}


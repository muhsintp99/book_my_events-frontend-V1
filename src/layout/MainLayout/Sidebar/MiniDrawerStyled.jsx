// material-ui
import { styled } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';

// project imports
import { drawerWidth } from 'store/constant';

function openedMixin(theme) {
    return {
        width: drawerWidth,
        borderRight: 'none',
        zIndex: 1099,
        background: theme.palette.background.default,
        overflowX: 'hidden',
        boxShadow: 'none',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen + 200
        })
    };
}

function closedMixin(theme) {
    return {
        borderRight: 'none',
        zIndex: 1099,
        background: theme.palette.background.default,
        overflowX: 'hidden',
        width: 72,
        height: 'auto',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen + 200
        })
    };
}

// ==============================|| DRAWER - MINI STYLED ||============================== //

const MiniDrawerStyled = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    width: drawerWidth,
    borderRight: '0px',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': {
            ...openedMixin(theme),
            // Additional styles for group headers
            '& .menu-group-header': {
                padding: '16px 24px 8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderTop: `1px solid ${theme.palette.divider}`,
                marginTop: '8px',
                '&:first-of-type': {
                    borderTop: 'none',
                    marginTop: 0
                }
            }
        }
    }),
    ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': {
            ...closedMixin(theme),
            // Hide group headers when collapsed
            '& .menu-group-header': {
                display: 'none'
            }
        }
    })
}));

export default MiniDrawerStyled;
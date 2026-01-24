import React from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    styled,
    keyframes
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import HomeIcon from '@mui/icons-material/Home';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const ErrorWrapper = styled(Box)(({ theme }) => ({
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a237e 0%, #121212 100%)',
    color: '#fff'
}));

const StyledIcon = styled(SecurityIcon)(({ theme }) => ({
    fontSize: '120px',
    color: theme.palette.error.main,
    marginBottom: theme.spacing(3),
    animation: `${pulse} 2s infinite ease-in-out`
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '30px',
    padding: '12px 35px',
    textTransform: 'none',
    fontSize: '1.1rem',
    marginTop: theme.spacing(4),
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 25px rgba(0,0,0,0.6)',
    }
}));

const Unauthorized = () => {
    return (
        <ErrorWrapper>
            <Container maxWidth="sm">
                <Box textAlign="center">
                    <StyledIcon />
                    <Typography variant="h1" sx={{ fontWeight: 800, mb: 2, letterSpacing: -1 }}>
                        Access Denied
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, fontWeight: 300 }}>
                        Whoops! You don't have permission to be here.
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: '400px', mx: 'auto' }}>
                        This section of the dashboard is reserved for administrators only. Please contact your system manager if you believe this is an error.
                    </Typography>

                    <ActionButton
                        variant="contained"
                        color="primary"
                        component={RouterLink}
                        to="/login"
                        startIcon={<HomeIcon />}
                    >
                        Back to Login
                    </ActionButton>
                </Box>
            </Container>
        </ErrorWrapper>
    );
};

export default Unauthorized;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// API base URL (for Vite projects)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AuthRegister() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'admin' // Default to 'admin' to match backend
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic client-side validation
    if (!formData.firstName.trim()) {
      setError('First name is required');
      setLoading(false);
      return;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      setLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }
    if (!['admin', 'superadmin'].includes(formData.role)) {
      setError('Invalid role selected');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed');
      } else {
        // Store token and user data
        if (checked) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
        } else {
          sessionStorage.setItem('token', data.data.token);
          sessionStorage.setItem('user', JSON.stringify(data.data.user));
        }

        // Redirect based on role
        if (data.data.user.role === 'superadmin') {
          navigate('/superadmin-dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container direction="column" spacing={2} sx={{ justifyContent: 'center' }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'center' }} xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Sign up with Email address</Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 0, sm: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            margin="normal"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            sx={{ ...theme.typography.customInput }}
            disabled={loading}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            margin="normal"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            sx={{ ...theme.typography.customInput }}
            disabled={loading}
            required
          />
        </Grid>
      </Grid>

      <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
        <InputLabel htmlFor="outlined-adornment-email-register">Email Address</InputLabel>
        <OutlinedInput
          id="outlined-adornment-email-register"
          type="email"
          value={formData.email}
          onChange={handleChange}
          name="email"
          disabled={loading}
          required
        />
      </FormControl>

      <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
        <InputLabel htmlFor="outlined-adornment-phone-register">Phone</InputLabel>
        <OutlinedInput
          id="outlined-adornment-phone-register"
          type="text"
          value={formData.phone}
          onChange={handleChange}
          name="phone"
          disabled={loading}
          required
        />
      </FormControl>

      <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
        <InputLabel htmlFor="outlined-adornment-password-register">Password</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password-register"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          name="password"
          disabled={loading}
          required
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="large"
                disabled={loading}
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>

      <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
        <TextField
          select
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          sx={{ ...theme.typography.customInput }}
          disabled={loading}
          required
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="superadmin">Superadmin</MenuItem>
        </TextField>
      </FormControl>

      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Grid>
          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                onChange={(event) => setChecked(event.target.checked)}
                name="checked"
                color="primary"
                disabled={loading}
              />
            }
            label={
              <Typography variant="subtitle1">
                Agree with &nbsp;
                <Typography variant="subtitle1" component={Link} to="#">
                  Terms & Condition.
                </Typography>
              </Typography>
            }
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button
            disableElevation
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            color="secondary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Signing up...' : 'Sign up'}
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.bookmyevent.ae/api';
const API_URL = `${API_BASE_URL}/venues`;
const ZONES_URL = `${API_BASE_URL}/zones`;
const CATEGORIES_URL = `${API_BASE_URL}/categories`;

const getToken = () => {
  try {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  } catch {
    return null;
  }
};

const getFetchOptions = (method = 'GET', body = null) => {
  const token = getToken();
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    credentials: 'include',
    mode: 'cors'
  };
  if (token) options.headers['Authorization'] = `Bearer ${token}`;
  if (body) options.body = JSON.stringify(body);
  return options;
};

const makeAPICall = async (url, options, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        const err = await res.text();
        const msg = res.status === 401 ? 'Unauthorized' :
                    res.status === 403 ? 'Forbidden' :
                    res.status === 404 ? 'Not Found' :
                    `HTTP ${res.status}: ${err}`;
        throw new Error(msg);
      }
      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
};

const EditVenuePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zones, setZones] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState({
    venueName: '',
    venueAddress: '',
    venueState: '',
    venuePostalCode: '',
    venueCountry: '',
    zone: '',
    ownerManagerName: '',
    ownerManagerPhone: '',
    ownerManagerEmail: '',
    maxGuestsSeated: '',
    maxGuestsStanding: '',
    parkingCapacity: '',
    foodCateringAvailability: false,
    alcoholPermitted: false,
    isActive: true,
    isTopPick: false,
    categories: [],
    amenities: [],
    openingHours: '',
    closingHours: '',
    pricingSchedule: {
      monday: { morning: { perDay: '' }, evening: { perDay: '' } },
      tuesday: { morning: { perDay: '' }, evening: { perDay: '' } },
      wednesday: { morning: { perDay: '' }, evening: { perDay: '' } },
      thursday: { morning: { perDay: '' }, evening: { perDay: '' } },
      friday: { morning: { perDay: '' }, evening: { perDay: '' } },
      saturday: { morning: { perDay: '' }, evening: { perDay: '' } },
      sunday: { morning: { perDay: '' }, evening: { perDay: '' } }
    }
  });

  // Fetch venue + zones + categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [venueRes, zonesRes, catsRes] = await Promise.all([
          makeAPICall(`${API_URL}/${id}`, getFetchOptions()),
          makeAPICall(ZONES_URL, getFetchOptions()),
          makeAPICall(CATEGORIES_URL, getFetchOptions())
        ]);

        const venue = venueRes.data;

        setForm({
          venueName: venue.venueName || '',
          venueAddress: venue.venueAddress || '',
          venueState: venue.venueState || '',
          venuePostalCode: venue.venuePostalCode || '',
          venueCountry: venue.venueCountry || '',
          zone: venue.zone?._id || venue.zone || '',
          ownerManagerName: venue.ownerManagerName || '',
          ownerManagerPhone: venue.ownerManagerPhone || venue.contactPhone || '',
          ownerManagerEmail: venue.ownerManagerEmail || venue.contactEmail || '',
          maxGuestsSeated: venue.maxGuestsSeated || '',
          maxGuestsStanding: venue.maxGuestsStanding || '',
          parkingCapacity: venue.parkingCapacity || '',
          foodCateringAvailability: venue.foodCateringAvailability || false,
          alcoholPermitted: venue.alcoholPermitted || false,
          isActive: venue.isActive ?? true,
          isTopPick: venue.isTopPick || false,
          categories: (venue.categories || []).map(c => c._id || c),
          amenities: venue.amenities || [],
          openingHours: venue.openingHours || '',
          closingHours: venue.closingHours || '',
          pricingSchedule: venue.pricingSchedule || form.pricingSchedule
        });

        setZones(zonesRes.data || []);
        setCategories(catsRes.data || []);
      } catch (err) {
        showNotification(`Failed to load data: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePricingChange = (day, session, field, value) => {
    setForm(prev => ({
      ...prev,
      pricingSchedule: {
        ...prev.pricingSchedule,
        [day]: {
          ...prev.pricingSchedule[day],
          [session]: {
            ...prev.pricingSchedule[day][session],
            [field]: value
          }
        }
      }
    }));
  };

  const handleAmenityChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, amenities: typeof value === 'string' ? value.split(',') : value }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, categories: typeof value === 'string' ? value.split(',') : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.venueName || !form.zone) {
      showNotification('Venue name and zone are required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        contactPhone: form.ownerManagerPhone,
        contactEmail: form.ownerManagerEmail
      };

      const res = await makeAPICall(`${API_URL}/${id}`, getFetchOptions('PUT', payload));
      if (!res.success) throw new Error(res.message || 'Update failed');

      showNotification('Venue updated successfully!', 'success');

      // Navigate back with updated data
      setTimeout(() => {
        navigate('/venues', {
          state: { updatedVenue: { ...res.data, _id: id } },
          replace: true
        });
      }, 1000);
    } catch (err) {
      showNotification(`Update failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography ml={2}>Loading venue...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3} maxWidth="lg" mx="auto">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          Edit Venue
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Info */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Venue Name"
                name="venueName"
                value={form.venueName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Zone</InputLabel>
                <Select name="zone" value={form.zone} onChange={handleInputChange}>
                  {zones.map(z => (
                    <MenuItem key={z._id} value={z._id}>{z.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="venueAddress"
                value={form.venueAddress}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="State" name="venueState" value={form.venueState} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Postal Code" name="venuePostalCode" value={form.venuePostalCode} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Country" name="venueCountry" value={form.venueCountry} onChange={handleInputChange} />
            </Grid>

            {/* Contact */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Contact Person</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Name" name="ownerManagerName" value={form.ownerManagerName} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Phone" name="ownerManagerPhone" value={form.ownerManagerPhone} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Email" name="ownerManagerEmail" value={form.ownerManagerEmail} onChange={handleInputChange} />
            </Grid>

            {/* Capacity */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Capacity & Parking</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Seated" name="maxGuestsSeated" type="number" value={form.maxGuestsSeated} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Standing" name="maxGuestsStanding" type="number" value={form.maxGuestsStanding} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Parking" name="parkingCapacity" value={form.parkingCapacity} onChange={handleInputChange} />
            </Grid>

            {/* Toggles */}
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={2} flexWrap="wrap">
                <FormControlLabel
                  control={<Switch checked={form.foodCateringAvailability} onChange={e => setForm(p => ({ ...p, foodCateringAvailability: e.target.checked }))} />}
                  label="Catering"
                />
                <FormControlLabel
                  control={<Switch checked={form.alcoholPermitted} onChange={e => setForm(p => ({ ...p, alcoholPermitted: e.target.checked }))} />}
                  label="Alcohol"
                />
              </Box>
            </Grid>

            {/* Categories & Amenities */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  value={form.categories}
                  onChange={handleCategoryChange}
                  input={<OutlinedInput label="Categories" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(id => {
                        const cat = categories.find(c => c._id === id);
                        return <Chip key={id} label={cat?.title || id} size="small" />;
                      })}
                    </Box>
                  )}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat._id} value={cat._id}>
                      <Checkbox checked={form.categories.includes(cat._id)} />
                      <ListItemText primary={cat.title} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Amenities</InputLabel>
                <Select
                  multiple
                  value={form.amenities}
                  onChange={handleAmenityChange}
                  input={<OutlinedInput label="Amenities" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(value => <Chip key={value} label={value} size="small" />)}
                    </Box>
                  )}
                >
                  {['WiFi', 'Projector', 'Sound System', 'Stage', 'Kitchen', 'Air Conditioning', 'Outdoor Space'].map(name => (
                    <MenuItem key={name} value={name}>
                      <Checkbox checked={form.amenities.includes(name)} />
                      <ListItemText primary={name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Hours */}
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Opening Hours" name="openingHours" value={form.openingHours} onChange={handleInputChange} placeholder="09:00" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Closing Hours" name="closingHours" value={form.closingHours} onChange={handleInputChange} placeholder="22:00" />
            </Grid>

            {/* Status Toggles */}
            <Grid item xs={12}>
              <Box display="flex" gap={3}>
                <FormControlLabel
                  control={<Switch checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />}
                  label="Active"
                />
                <FormControlLabel
                  control={<Switch checked={form.isTopPick} onChange={e => setForm(p => ({ ...p, isTopPick: e.target.checked }))} />}
                  label="Top Pick"
                />
              </Box>
            </Grid>

            {/* Pricing Schedule */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Pricing Schedule (Per Day)</Typography>
              <Grid container spacing={2}>
                {Object.keys(form.pricingSchedule).map(day => (
                  <Grid item xs={12} key={day}>
                    <Typography variant="body2" fontWeight="medium" textTransform="capitalize">{day}</Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Morning"
                          type="number"
                          value={form.pricingSchedule[day].morning.perDay}
                          onChange={e => handlePricingChange(day, 'morning', 'perDay', e.target.value)}
                          InputProps={{ startAdornment: 'AED' }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Evening"
                          type="number"
                          value={form.pricingSchedule[day].evening.perDay}
                          onChange={e => handlePricingChange(day, 'evening', 'perDay', e.target.value)}
                          InputProps={{ startAdornment: 'AED' }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : null}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/venues')}>
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditVenuePage;
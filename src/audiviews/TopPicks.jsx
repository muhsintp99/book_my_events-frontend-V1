import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Switch,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { API_BASE_URL, getApiImageUrl } from '../utils/apiImageUtils';

// Use environment variable or fallback to production URL
// API_BASE_URL is now imported from apiImageUtils

function TopPicks() {
  const [search, setSearch] = useState('');
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch venues on component mount and when search changes
  useEffect(() => {
    fetchAllVenues();
    if (search) {
      handleSearch();
    }
  }, [search]);

  const fetchAllVenues = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/venues?_t=${new Date().getTime()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('Venues Response:', result);

      if (response.ok && result.data) {
        // Process venues with proper image URL handling
        const formattedVenues = result.data.map((venue) => ({
          ...venue,
          thumbnail: venue.thumbnail ? getApiImageUrl(venue.thumbnail) : '',
          isTopPick: venue.isTopPick || false
        }));
        setVenues(formattedVenues);
      } else {
        showNotification('Failed to fetch venues', 'error');
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
      showNotification('Error fetching venues: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/venues/search?keyword=${search}&_t=${new Date().getTime()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('Search Response:', result);

      if (response.ok && result.data) {
        const formattedVenues = result.data.map((venue) => ({
          ...venue,
          thumbnail: venue.thumbnail ? getApiImageUrl(venue.thumbnail) : '',
          isTopPick: venue.isTopPick || false
        }));
        setVenues(formattedVenues);
      } else {
        showNotification('Failed to search venues', 'error');
      }
    } catch (error) {
      console.error('Error searching venues:', error);
      showNotification('Error searching venues: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleToggle = (id) => {
    setVenues((prev) =>
      prev.map((v) => (v._id === id ? { ...v, isTopPick: !v.isTopPick } : v))
    );
  };

  const filteredVenues = venues;

  return (
    <Box sx={{ minHeight: '100vh', p: { xs: 2, sm: 4 }, bgcolor: '#f0f2f5' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(90deg,#1565c0,#42a5f5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Top Picks
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Highlight your top venues with style
        </Typography>

        {/* Search */}
        <TextField
          placeholder="Search venues by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{
            maxWidth: 450,
            mt: 3,
            borderRadius: 3,
            backgroundColor: '#fff',
            '& .MuiOutlinedInput-root': { borderRadius: 3 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Venue Grid */}
      <Grid container spacing={4} justifyContent="center">
        {loading && <p>Loading...</p>}
        {filteredVenues.map((venue) => (
          <Grid item xs={12} sm={6} md={4} key={venue._id}>
            <Card
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.4s, box-shadow 0.4s',
                boxShadow: venue.isTopPick
                  ? '0 10px 20px rgba(21,101,192,0.25)'
                  : '0 4px 12px rgba(0,0,0,0.08)',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: '0 14px 30px rgba(0,0,0,0.15)',
                },
              }}
            >
              {/* Image with overlay */}
              <Box
                sx={{
                  position: 'relative',
                  height: 220,
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(0,0,0,0.25)',
                    transition: 'background 0.3s',
                    zIndex: 1,
                  },
                  '&:hover:after': { bgcolor: 'rgba(0,0,0,0.15)' },
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {venue.thumbnail ? (
                    <CardMedia
                      component="img"
                      height="220"
                      image={venue.thumbnail}
                      alt={venue.venueName}
                      sx={{ objectFit: 'cover', width: '100%' }}
                      onError={(e) => {
                        console.error('Image load error for URL:', venue.thumbnail);
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f5f5;color:#999;font-size:0.9rem;">No Image</div>';
                        }
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#f5f5f5',
                        color: '#999',
                        fontSize: '0.9rem',
                      }}
                    >
                      No Image
                    </Box>
                  )}
                </Box>
                {venue.isTopPick && (
                  <Chip
                    label="Top Pick"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      fontWeight: 600,
                      px: 1.5,
                      py: 0.5,
                      transform: 'translateY(-2px)',
                      zIndex: 2,
                    }}
                  />
                )}
              </Box>

              {/* Card Content */}
              <CardContent
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  px: 2,
                  py: 1.5,
                  bgcolor: '#fff',
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  sx={{
                    flex: 1,
                    pr: 2,
                    color: '#2c3e50',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {venue.venueName}
                </Typography>

                <Switch
                  checked={venue.isTopPick || false}
                  onChange={() => handleToggle(venue._id)}
                  color="primary"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#1976d2' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#90caf9',
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}

        {filteredVenues.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <Typography variant="body1" color="text.secondary">
              No venues found.
            </Typography>
          </Box>
        )}
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TopPicks;
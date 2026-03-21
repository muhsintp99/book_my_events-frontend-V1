import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Typography, Box, Button, Select, MenuItem, FormControl,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Switch, IconButton, Stack, Chip, CircularProgress, Divider, Avatar,
  Tooltip, Collapse, Grid, Snackbar, Alert, InputAdornment
} from '@mui/material';
import {
  VisibilityOutlined, Edit, Delete, Close, Search as SearchIcon, Star,
  Refresh, CheckCircle, Apartment, LocationOn, MeetingRoom, FilterList,
  GetApp, Add, Storefront, People, CurrencyRupee, Security, Wifi, LocalParking, 
  Restaurant, TheaterComedy, AccessibilityNew
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/* ============ Premium Red Luxe Theme ============ */
const themeColors = {
  primary: '#2D3436',
  accent: '#E15B64',
  accentLight: '#FFF8F9',
  success: '#00B894',
  warning: '#FDCB6E',
  danger: '#D63031',
  background: '#F9FAFB',
  border: '#E2E8F0',
  textMain: '#2D3436',
  textSecondary: '#636E72',
  white: '#FFFFFF',
  gradientPrimary: 'linear-gradient(135deg, #E15B64 0%, #FD7272 100%)',
  gradientSuccess: 'linear-gradient(135deg, #00B894 0%, #55EFC4 100%)',
};

const HeaderStat = ({ label, value, icon, color, gradient }) => (
  <Box sx={{
    bgcolor: 'white', borderRadius: '18px', py: 2.2, px: 2.8,
    display: 'flex', alignItems: 'center', gap: 2.5, flex: 1, minWidth: '220px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
    border: '1px solid', borderColor: 'rgba(0,0,0,0.04)',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 25px rgba(0,0,0,0.06)' }
  }}>
    <Box sx={{
      width: 52, height: 52, borderRadius: '15px', background: gradient || `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: gradient ? '#FFFFFF' : color,
      boxShadow: gradient ? '0 6px 15px rgba(225, 91, 100, 0.25)' : 'none'
    }}>
      {React.cloneElement(icon, { sx: { fontSize: 26 } })}
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.68rem' }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 950, color: themeColors.textMain, lineHeight: 1.1, fontSize: '1.45rem' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

export default function Venuelist() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedVendors, setExpandedVendors] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Filter state
  const [filters, setFilters] = useState({ search: "", rentalType: "", isActive: "" });
  const [pendingFilters, setPendingFilters] = useState({ search: "", rentalType: "", isActive: "" });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const API_BASE_URL = "http://localhost:5000/api"; // Should match backend

  const getFetchOptions = useCallback((method = 'GET', body = null) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include', mode: 'cors',
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);
    return opts;
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      if (filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.rentalType) params.append('rentalType', filters.rentalType);
      if (filters.isActive !== "") params.append('isActive', filters.isActive);

      const res = await fetch(`${API_BASE_URL}/venues?${params}`, getFetchOptions());
      const data = await res.json();
      if (data.success) {
        const fetchedVenues = data.data || [];
        setVenues(fetchedVenues);
        setTotalItems(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
        
        // Auto-expand vendors by default
        const vendors = {};
        fetchedVenues.forEach(v => {
          const providerId = v.provider?._id || 'unassigned';
          vendors[providerId] = true;
        });
        setExpandedVendors(vendors);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [currentPage, itemsPerPage, filters, getFetchOptions]);

  const handleApplyFilters = () => { setFilters(pendingFilters); setCurrentPage(1); };
  const handleReset = () => { setFilters({ search: "", rentalType: "", isActive: "" }); setPendingFilters({ search: "", rentalType: "", isActive: "" }); setCurrentPage(1); };

  const handleToggleActive = async (venueId, currentActive) => {
    try {
      const res = await fetch(`${API_BASE_URL}/venues/${venueId}/status`, getFetchOptions('PATCH', { isActive: !currentActive }));
      if (res.ok) {
        setVenues(prev => prev.map(v => v._id === venueId ? { ...v, isActive: !currentActive } : v));
        setNotification({ open: true, message: 'Status updated successfully', severity: 'success' });
      }
    } catch (err) { setNotification({ open: true, message: 'Update failed', severity: 'error' }); }
  };

  const handleDelete = async (venueId) => {
    if (!window.confirm("Remove this venue from the system?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/venues/${venueId}`, getFetchOptions('DELETE'));
      if (res.ok) {
        setVenues(prev => prev.filter(v => v._id !== venueId));
        setNotification({ open: true, message: 'Venue removed successfully', severity: 'success' });
      }
    } catch (err) { setNotification({ open: true, message: 'Delete failed', severity: 'error' }); }
  };

  const vendorGroups = useMemo(() => {
    const groups = {};
    venues.forEach(v => {
      const provider = v.provider;
      const providerId = provider?._id || 'unassigned';
      
      let displayName = provider?.storeName || (provider?.firstName ? `${provider.firstName} ${provider.lastName || ''}`.trim() : null) || provider?.email || 'Independent Venue';
      
      if (!groups[providerId]) {
        groups[providerId] = {
          provider: provider || { _id: 'unassigned' },
          displayName: displayName,
          venues: []
        };
      }
      groups[providerId].venues.push(v);
    });
    return Object.values(groups).sort((a,b) => b.venues.length - a.venues.length);
  }, [venues]);

  const stats = {
    total: totalItems,
    active: venues.filter(v => v.isActive).length,
    bookings: venues.reduce((sum, v) => sum + (v.totalBookings || 0), 0),
    vendors: vendorGroups.length,
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: themeColors.background, color: themeColors.textMain }}>
      {/* Premium Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'flex-end', gap: 3 }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 950, background: themeColors.gradientPrimary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-2px', fontSize: '3rem', lineHeight: 1 }}>
            Venue Management
          </Typography>
          <Typography variant="subtitle1" sx={{ color: themeColors.textSecondary, fontWeight: 700, mt: 1, fontSize: '0.95rem' }}>
            Event spaces, luxury halls & outdoor venues registry
          </Typography>
        </Box>
        <Stack direction="row" spacing={2.5}>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={() => fetchVenues()} 
            sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 800, px: 3, height: 48, borderColor: themeColors.border, color: themeColors.textMain, bgcolor: 'white' }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            disableElevation 
            onClick={() => navigate("/venue-setup/create")} 
            sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 900, px: 4, height: 48, background: themeColors.gradientPrimary, boxShadow: '0 8px 20px rgba(225, 91, 100, 0.25)', '&:hover': { opacity: 0.9, transform: 'translateY(-2px)' }, transition: 'all 0.3s ease' }}
          >
            <Add sx={{ mr: 1, fontSize: 24 }} /> New Venue
          </Button>
        </Stack>
      </Box>

      {/* Stats Dashboard */}
      <Box sx={{ display: 'flex', gap: 2.5, mb: 5, flexWrap: 'wrap' }}>
        <HeaderStat label="Total Spaces" value={stats.total} icon={<Apartment />} color={themeColors.accent} gradient={themeColors.gradientPrimary} />
        <HeaderStat label="Active Venues" value={stats.active} icon={<CheckCircle />} color={themeColors.success} gradient={themeColors.gradientSuccess} />
        <HeaderStat label="Total Bookings" value={stats.bookings} icon={<MeetingRoom />} color={themeColors.warning} />
        <HeaderStat label="Active Vendors" value={stats.vendors} icon={<Storefront />} color={themeColors.primary} />
      </Box>

      {/* Advanced Filters */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '24px', border: '1px solid', borderColor: themeColors.border, bgcolor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              placeholder="Search by venue name, address or tags..."
              fullWidth size="medium"
              value={pendingFilters.search}
              onChange={e => setPendingFilters({ ...pendingFilters, search: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: themeColors.background, fontWeight: 600 } }}
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: themeColors.textSecondary }} /></InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} md={2.5}>
            <FormControl fullWidth>
              <Select
                displayEmpty value={pendingFilters.rentalType}
                onChange={e => setPendingFilters({ ...pendingFilters, rentalType: e.target.value })}
                sx={{ borderRadius: '14px', bgcolor: themeColors.background, fontWeight: 700 }}
              >
                <MenuItem value="">All Rental Types</MenuItem>
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="distanceWise">Distance Wise</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4.5}>
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button onClick={handleReset} sx={{ color: themeColors.textSecondary, fontWeight: 800, textTransform: 'none' }}>Clear</Button>
              <Button 
                variant="contained" 
                onClick={handleApplyFilters} 
                sx={{ bgcolor: themeColors.primary, borderRadius: '14px', px: 4, py: 1.2, textTransform: 'none', fontWeight: 900, '&:hover': { bgcolor: '#000' } }}
              >
                Apply Filters
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 15 }}>
          <CircularProgress size={60} thickness={4} sx={{ color: themeColors.accent, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textSecondary }}>Loading venues...</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {vendorGroups.length > 0 ? (
            vendorGroups.map((group) => {
              const providerId = group.provider?._id || 'unassigned';
              const isExpanded = expandedVendors[providerId];
              const vendorName = group.displayName;

              return (
                <Paper key={providerId} elevation={0} sx={{
                  borderRadius: '28px', overflow: 'hidden', border: '1px solid',
                  borderColor: isExpanded ? themeColors.accent + '40' : themeColors.border,
                  boxShadow: isExpanded ? '0 15px 45px rgba(225,91,100,0.08)' : 'none',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', bgcolor: 'white'
                }}>
                  <Box onClick={() => setExpandedVendors(p => ({ ...p, [providerId]: !isExpanded }))} sx={{
                    p: 3, display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer',
                    bgcolor: isExpanded ? themeColors.accentLight : 'white',
                  }}>
                    <Avatar sx={{ 
                      width: 54, height: 54, fontSize: '1.3rem', fontWeight: 900, 
                      background: themeColors.gradientPrimary, color: 'white', 
                      border: '4px solid white', boxShadow: '0 6px 12px rgba(0,0,0,0.1)' 
                    }}>
                      {vendorName ? vendorName[0].toUpperCase() : 'V'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 950, color: themeColors.textMain, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>{vendorName}</Typography>
                      <Typography variant="body1" sx={{ color: themeColors.textSecondary, fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
                        <Storefront sx={{ fontSize: 14, mr: 0.6, color: themeColors.accent }} /> {group.provider?.email || 'Registered Partner'}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', px: 2 }}>
                      <Typography sx={{ fontWeight: 950, color: themeColors.textSecondary, fontSize: '0.75rem', letterSpacing: '1px' }}>{group.venues.length.toString().padStart(2, '0')} VENUES</Typography>
                      <Chip label="PARTNER VENDOR" size="small" sx={{ fontWeight: 900, bgcolor: themeColors.success, color: 'white', mt: 0.6, height: 24, fontSize: '0.65rem', borderRadius: '8px' }} />
                    </Box>
                  </Box>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ px: 4, pb: 4 }}>
                      <Divider sx={{ mb: 3 }} />
                      <TableContainer>
                        <Table sx={{ minWidth: 900 }}>
                          <TableHead>
                            <TableRow sx={{ '& th': { borderBottom: '2px solid' + themeColors.border, py: 1.5, fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' } }}>
                              <TableCell>Venue Details</TableCell>
                              <TableCell>Seating & Capacity</TableCell>
                              <TableCell>Facilities</TableCell>
                              <TableCell>Pricing Scale</TableCell>
                              <TableCell align="center">Active</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {group.venues.map((v) => (
                              <TableRow key={v._id} sx={{ '& td': { py: 2.2 }, '&:hover': { bgcolor: '#F9FAFB' }, transition: 'background-color 0.2s' }}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                    <Avatar 
                                      variant="rounded"
                                      src={v.thumbnail ? `${API_BASE_URL}/${v.thumbnail.replace(/^\//, '')}` : null}
                                      sx={{ width: 90, height: 60, borderRadius: '12px', bgcolor: '#eee', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '2px solid white' }}
                                    >
                                      <Apartment sx={{ color: '#ccc' }} />
                                    </Avatar>
                                    <Box>
                                      <Typography sx={{ fontWeight: 900, color: themeColors.accent, fontSize: '1.05rem', lineHeight: 1.2 }}>{v.venueName}</Typography>
                                      <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 800, display: 'flex', alignItems: 'center', mt: 0.3 }}>
                                        <LocationOn sx={{ fontSize: 12, mr: 0.4 }} /> {v.venueAddress ? (v.venueAddress.length > 30 ? v.venueAddress.substring(0, 30) + '...' : v.venueAddress) : 'No address'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip label={v.seatingArrangement || 'Standard'} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 900, mb: 0.8, bgcolor: themeColors.primary, color: 'white', borderRadius: '6px' }} />
                                  <Typography sx={{ fontWeight: 800, color: themeColors.textMain, fontSize: '0.88rem', display: 'flex', alignItems: 'center' }}>
                                    <People sx={{ fontSize: 14, mr: 0.8, color: themeColors.textSecondary }} /> {v.maxGuestsSeated || 0} Guests Capacity
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                    {v.parkingAvailability && <Tooltip title="Parking"><LocalParking sx={{ fontSize: 16, color: themeColors.success }} /></Tooltip>}
                                    {v.foodCateringAvailability && <Tooltip title="Catering"><Restaurant sx={{ fontSize: 16, color: themeColors.warning }} /></Tooltip>}
                                    {v.wifiAvailability && <Tooltip title="Wi-Fi"><Wifi sx={{ fontSize: 16, color: '#3498db' }} /></Tooltip>}
                                    {v.securityArrangements && <Tooltip title="Security"><Security sx={{ fontSize: 16, color: themeColors.danger }} /></Tooltip>}
                                    {v.stageLightingAudio && <Tooltip title="Stage & AV"><TheaterComedy sx={{ fontSize: 16, color: '#9b59b6' }} /></Tooltip>}
                                    {v.wheelchairAccessibility && <Tooltip title="Accessible"><AccessibilityNew sx={{ fontSize: 16, color: themeColors.success }} /></Tooltip>}
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography sx={{ fontWeight: 950, color: themeColors.success, fontSize: '1.15rem' }}>
                                      ₹{v.perDayPrice?.toLocaleString() || v.hourlyPrice?.toLocaleString() || '0'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 800, fontSize: '0.65rem' }}>
                                      Per {v.rentalType === 'hourly' ? 'Hour' : 'Event/Day'}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Switch size="small" checked={v.isActive} onChange={() => handleToggleActive(v._id, v.isActive)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: themeColors.success } }} />
                                </TableCell>
                                <TableCell align="right">
                                  <Stack direction="row" spacing={0.8} justifyContent="flex-end">
                                    <Tooltip title="View Property"><IconButton size="small" onClick={() => navigate(`/venue-setup/view/${v._id}`)} sx={{ color: themeColors.textSecondary, border: '1px solid #eee', bgcolor: 'white' }}><VisibilityOutlined sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                                    <Tooltip title="Edit Details"><IconButton size="small" onClick={() => navigate(`/venue-setup/edit/${v._id}`)} sx={{ color: themeColors.primary, border: '1px solid #eee', bgcolor: 'white' }}><Edit sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                                    <Tooltip title="Remove Venue"><IconButton size="small" onClick={() => handleDelete(v._id)} sx={{ color: themeColors.danger, border: '1px solid #eee', bgcolor: 'white' }}><Delete sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Collapse>
                </Paper>
              );
            })
          ) : (
            <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: '30px', border: '1px dashed' + themeColors.border, bgcolor: 'white' }}>
              <Apartment sx={{ fontSize: 60, color: themeColors.border, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textSecondary }}>No venues found.</Typography>
              <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 1 }}>Try adjusting your filters or add a new space.</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} variant="outlined" sx={{ borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 3 }}>Previous</Button>
          <Typography sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.9rem' }}>{currentPage} of {totalPages}</Typography>
          <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} variant="outlined" sx={{ borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 3 }}>Next</Button>
        </Box>
      )}

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification(p => ({...p, open: false}))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={notification.severity} variant="filled" sx={{ borderRadius: '18px', fontWeight: 800, px: 3, py: 1.2 }}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
}
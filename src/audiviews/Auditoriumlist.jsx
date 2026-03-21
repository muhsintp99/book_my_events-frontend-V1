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
  Restaurant, TheaterComedy, AccessibilityNew, Chair, DirectionsCar, Liquor,
  AccessTime, AttachMoney, Category, Save, Lightbulb, AcUnit, Tag, Help, Web
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getApiImageUrl } from '../utils/apiImageUtils';

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

export default function Auditoriumlist() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedVendors, setExpandedVendors] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = `${API_BASE_URL}/venues`;

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

  const fetchZones = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/zones`, getFetchOptions());
      const data = await res.json();
      if (data?.data) setZones(data.data);
    } catch (e) { console.error("Error fetching zones", e); }
  };

  const fetchVenues = async (topPicks = false) => {
    try {
      setLoading(true);
      const url = topPicks ? `${API_URL}/top-picks` : API_URL;
      const res = await fetch(url, getFetchOptions());
      const data = await res.json();
      if (data.success) {
        setVenues(data.data || []);
        // Auto-expand vendors
        const vendors = {};
        (data.data || []).forEach(v => {
          vendors[v.provider?._id || 'unassigned'] = true;
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
    fetchZones();
    fetchVenues();
  }, [getFetchOptions]);

  const handleToggleActive = async (venueId, currentActive) => {
    try {
      const res = await fetch(`${API_URL}/${venueId}/toggle-active`, getFetchOptions('PATCH'));
      const data = await res.json();
      if (data.success) {
        setVenues(prev => prev.map(v => v._id === venueId ? { ...v, isActive: !currentActive } : v));
        setNotification({ open: true, message: `Venue ${!currentActive ? 'activated' : 'deactivated'}`, severity: 'success' });
      }
    } catch (err) { setNotification({ open: true, message: 'Status update failed', severity: 'error' }); }
  };

  const handleToggleTopPick = async (venueId, currentVal) => {
    try {
      const res = await fetch(`${API_URL}/${venueId}/toggle-top-pick`, getFetchOptions('PATCH', { isTopPick: !currentVal }));
      const data = await res.json();
      if (data.success) {
        setVenues(prev => prev.map(v => v._id === venueId ? { ...v, isTopPick: !currentVal } : v));
        setNotification({ open: true, message: `Top Pick ${!currentVal ? 'activated' : 'deactivated'}`, severity: 'success' });
      }
    } catch (err) { setNotification({ open: true, message: 'Update failed', severity: 'error' }); }
  };

  const handleDelete = async (venueId) => {
    if (!window.confirm("Remove this property?")) return;
    try {
      const res = await fetch(`${API_URL}/${venueId}`, getFetchOptions('DELETE'));
      if (res.ok) {
        setVenues(prev => prev.filter(v => v._id !== venueId));
        setNotification({ open: true, message: 'Removed successfully', severity: 'success' });
      }
    } catch (err) { setNotification({ open: true, message: 'Delete failed', severity: 'error' }); }
  };

  // Price Discovery Helper
  const getVenuePrice = (v) => {
    if (v.perDayPrice && !isNaN(v.perDayPrice)) return v.perDayPrice;
    
    // Fallback: Check pricing schedule
    if (v.pricingSchedule) {
      const days = Object.keys(v.pricingSchedule);
      // Look for any day that has a perDay price defined
      for (const day of days) {
        const morningPrice = v.pricingSchedule[day]?.morning?.perDay;
        const eveningPrice = v.pricingSchedule[day]?.evening?.perDay;
        if (morningPrice && !isNaN(morningPrice)) return morningPrice;
        if (eveningPrice && !isNaN(eveningPrice)) return eveningPrice;
      }
    }
    return 'POA';
  };

  const filteredVenues = useMemo(() => {
    return venues.filter(v => {
      const matchesSearch = !searchTerm || v.venueName?.toLowerCase().includes(searchTerm.toLowerCase()) || v.venueAddress?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesZone = selectedZone === 'All Zones' || v.zone?.name === selectedZone || v.zone === selectedZone;
      return matchesSearch && matchesZone;
    });
  }, [venues, searchTerm, selectedZone]);

  const vendorGroups = useMemo(() => {
    const groups = {};
    filteredVenues.forEach(v => {
      const provider = v.provider;
      const providerId = provider?._id || 'unassigned';
      
      let displayName = provider?.storeName || 
                        (provider?.firstName ? `${provider.firstName} ${provider.lastName || ''}`.trim() : null) || 
                        provider?.email || 
                        'Corporate Partner';
      
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
  }, [filteredVenues]);

  const stats = {
    total: venues.length,
    active: venues.filter(v => v.isActive).length,
    topPicks: venues.filter(v => v.isTopPick).length,
    vendors: new Set(venues.map(v => v.provider?._id || 'unassigned')).size,
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: themeColors.background, color: themeColors.textMain }}>
      {/* Red Luxe Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'flex-end', gap: 3 }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 950, background: themeColors.gradientPrimary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-2px', fontSize: '3rem', lineHeight: 1 }}>
            Venue Management
          </Typography>
          <Typography variant="subtitle1" sx={{ color: themeColors.textSecondary, fontWeight: 700, mt: 1, fontSize: '0.95rem' }}>
            Auditoriums, Banquet Halls & Event Spaces Directory
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
            onClick={() => navigate("/auditorium/create")} 
            sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 900, px: 4, height: 48, background: themeColors.gradientPrimary, boxShadow: '0 8px 20px rgba(225, 91, 100, 0.25)', '&:hover': { opacity: 0.9, transform: 'translateY(-2px)' }, transition: 'all 0.3s ease' }}
          >
            <Add sx={{ mr: 1, fontSize: 24 }} /> New Space
          </Button>
        </Stack>
      </Box>

      {/* Stats Cluster */}
      <Box sx={{ display: 'flex', gap: 2.5, mb: 5, flexWrap: 'wrap' }}>
        <HeaderStat label="Total Assets" value={stats.total} icon={<Apartment />} color={themeColors.accent} gradient={themeColors.gradientPrimary} />
        <HeaderStat label="Active Status" value={stats.active} icon={<CheckCircle />} color={themeColors.success} gradient={themeColors.gradientSuccess} />
        <HeaderStat label="Top Pick Selections" value={stats.topPicks} icon={<Star />} color={themeColors.warning} />
        <HeaderStat label="Verified Vendors" value={stats.vendors} icon={<Storefront />} color={themeColors.primary} />
      </Box>

      {/* Filter Matrix */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '24px', border: '1px solid', borderColor: themeColors.border, bgcolor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              placeholder="Search by venue name, address or tags..."
              fullWidth size="medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: themeColors.background, fontWeight: 600 } }}
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: themeColors.textSecondary }} /></InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <Select
                displayEmpty value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
                sx={{ borderRadius: '14px', bgcolor: themeColors.background, fontWeight: 700 }}
              >
                <MenuItem value="All Zones">All Geographical Zones</MenuItem>
                {zones.map(z => <MenuItem key={z._id} value={z.name}>{z.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button onClick={() => { setSearchTerm(''); setSelectedZone('All Zones'); }} sx={{ color: themeColors.textSecondary, fontWeight: 800, textTransform: 'none' }}>Reset Results</Button>
              <Button 
                variant="contained" 
                onClick={() => fetchVenues(true)} 
                startIcon={<Star />}
                sx={{ bgcolor: themeColors.warning, color: '#000', borderRadius: '14px', px: 3, py: 1.2, textTransform: 'none', fontWeight: 900, '&:hover': { bgcolor: '#E6B04B' } }}
              >
                Show Top Picks
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 15 }}>
          <CircularProgress size={60} thickness={4} sx={{ color: themeColors.accent, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textSecondary }}>Refreshing inventory...</Typography>
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
                  {/* Vendor Group Header */}
                  <Box onClick={() => setExpandedVendors(p => ({ ...p, [providerId]: !isExpanded }))} sx={{
                    p: 3, display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer',
                    bgcolor: isExpanded ? themeColors.accentLight : 'white',
                    '&:hover': { bgcolor: isExpanded ? themeColors.accentLight : '#F9FAFB' }
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
                        <Storefront sx={{ fontSize: 14, mr: 0.6, color: themeColors.accent }} /> {group.provider?.email || 'Registered Service Provider'}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', px: 2 }}>
                      <Typography sx={{ fontWeight: 950, color: themeColors.textSecondary, fontSize: '0.75rem', letterSpacing: '1px' }}>{group.venues.length.toString().padStart(2, '0')} PROPERTIES</Typography>
                      <Chip label="PARTNER" size="small" sx={{ fontWeight: 900, bgcolor: themeColors.success, color: 'white', mt: 0.6, height: 24, fontSize: '0.65rem', borderRadius: '8px' }} />
                    </Box>
                  </Box>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ px: 4, pb: 4 }}>
                      <Divider sx={{ mb: 3 }} />
                      <TableContainer>
                        <Table sx={{ minWidth: 1000 }}>
                          <TableHead>
                            <TableRow sx={{ '& th': { borderBottom: '2px solid' + themeColors.border, py: 1.5, fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' } }}>
                              <TableCell>Project Info</TableCell>
                              <TableCell>Arrangement & Volume</TableCell>
                              <TableCell>Key Utilities</TableCell>
                              <TableCell>Pricing Scale</TableCell>
                              <TableCell align="center">Top Pick</TableCell>
                              <TableCell align="center">Active</TableCell>
                              <TableCell align="right">Management</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {group.venues.map((v) => (
                              <TableRow key={v._id} sx={{ '& td': { py: 2.2 }, '&:hover': { bgcolor: '#F9FAFB' }, transition: 'background-color 0.2s' }}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                    <Avatar 
                                      variant="rounded"
                                      src={getApiImageUrl(v.thumbnail)}
                                      sx={{ width: 90, height: 60, borderRadius: '12px', bgcolor: '#eee', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '2px solid white' }}
                                    >
                                      <Apartment sx={{ color: '#ccc' }} />
                                    </Avatar>
                                    <Box>
                                      <Typography sx={{ fontWeight: 900, color: themeColors.accent, fontSize: '1.05rem', lineHeight: 1.2 }}>{v.venueName}</Typography>
                                      <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 800, display: 'flex', alignItems: 'center', mt: 0.3 }}>
                                        <LocationOn sx={{ fontSize: 12, mr: 0.4 }} /> {v.venueAddress ? (v.venueAddress.length > 25 ? v.venueAddress.substring(0, 25) + '...' : v.venueAddress) : 'N/A Location'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip label={v.seatingArrangement || 'Standard'} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 900, mb: 0.8, bgcolor: themeColors.primary, color: 'white', borderRadius: '6px' }} />
                                  <Typography sx={{ fontWeight: 800, color: themeColors.textMain, fontSize: '0.88rem', display: 'flex', alignItems: 'center' }}>
                                    <People sx={{ fontSize: 14, mr: 0.8, color: themeColors.textSecondary }} /> { (v.maxGuestsSeated || 0) + (v.maxGuestsStanding || 0) } Total Capacity
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
                                    {v.acAvailable && <Tooltip title="AC Facility"><AcUnit sx={{ fontSize: 16, color: '#00cec9' }} /></Tooltip>}
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography sx={{ fontWeight: 950, color: themeColors.success, fontSize: '1.15rem' }}>
                                      {typeof getVenuePrice(v) === 'number' ? `₹${getVenuePrice(v).toLocaleString()}` : getVenuePrice(v)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 800, fontSize: '0.65rem' }}>
                                      Booking Base Price
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Switch size="small" checked={v.isTopPick} onChange={() => handleToggleTopPick(v._id, v.isTopPick)} color="warning" />
                                </TableCell>
                                <TableCell align="center">
                                  <Switch size="small" checked={v.isActive} onChange={() => handleToggleActive(v._id, v.isActive)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: themeColors.success } }} />
                                </TableCell>
                                <TableCell align="right">
                                  <Stack direction="row" spacing={0.8} justifyContent="flex-end">
                                    <Tooltip title="Preview"><IconButton size="small" onClick={() => navigate(`/venue/details/${v._id}`)} sx={{ color: themeColors.textSecondary, border: '1px solid #eee', bgcolor: 'white' }}><VisibilityOutlined sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                                    <Tooltip title="Modify"><IconButton size="small" onClick={() => navigate(`/auditorium/venues/edit/${v._id}`)} sx={{ color: themeColors.primary, border: '1px solid #eee', bgcolor: 'white' }}><Edit sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                                    <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(v._id)} sx={{ color: themeColors.danger, border: '1px solid #eee', bgcolor: 'white' }}><Delete sx={{ fontSize: 18 }} /></IconButton></Tooltip>
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
              <MeetingRoom sx={{ fontSize: 60, color: themeColors.border, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textSecondary }}>No spaces found matching your criteria.</Typography>
              <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 1 }}>Consider relaxing the filters or adding a new inventory item.</Typography>
            </Paper>
          )}
        </Box>
      )}

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification(p => ({...p, open: false}))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={notification.severity} variant="filled" sx={{ borderRadius: '18px', fontWeight: 800, px: 3, py: 1.2 }}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
}
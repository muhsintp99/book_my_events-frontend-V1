import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Typography, Box, Button, Select, MenuItem, FormControl,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Switch, IconButton, Stack, Chip, CircularProgress, Divider, Avatar,
  Tooltip, Collapse, Grid, Snackbar, Alert, InputAdornment
} from '@mui/material';
import {
  VisibilityOutlined, Edit, Delete, Close, Search as SearchIcon, Star,
  Refresh, CheckCircle, DirectionsCar, Commute, LocalTaxi, FilterList,
  GetApp, Add, Storefront, CalendarToday, PinDrop, Speed, Settings
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

export default function Vehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedVendors, setExpandedVendors] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Filter state
  const [filters, setFilters] = useState({ brand: "", category: "", type: "", search: "" });
  const [pendingFilters, setPendingFilters] = useState({ brand: "", category: "", type: "", search: "" });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/brands`, getFetchOptions());
      const data = await res.json();
      if (data.success) setBrands(data.data.brands || []);
    } catch (err) { console.error('Brands fetch fail'); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, getFetchOptions());
      const data = await res.json();
      if (data.success) setCategories(data.data.categories || []);
    } catch (err) { console.error('Categories fetch fail'); }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      if (filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);

      const res = await fetch(`${API_BASE_URL}/vehicles?${params}`, getFetchOptions());
      const data = await res.json();
      if (data.success) {
        // Correcting the mapping: data.data IS the array of vehicles
        const fetchedVehicles = Array.isArray(data.data) ? data.data : (data.data?.vehicles || []);
        setVehicles(fetchedVehicles);
        if (data.meta) {
          setTotalPages(data.meta.totalPages || data.meta.pages || 1);
          setTotalItems(data.meta.total || data.meta.totalResults || 0);
        }
        
        // Auto-expand vendors by default
        const vendors = {};
        fetchedVehicles.forEach(v => {
          const providerId = v.provider?._id || (typeof v.provider === 'string' ? v.provider : 'unassigned');
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
    fetchBrands();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, itemsPerPage, filters, getFetchOptions]);

  const handleApplyFilters = () => { setFilters(pendingFilters); setCurrentPage(1); };
  const handleReset = () => { setFilters({ brand: "", category: "", type: "", search: "" }); setPendingFilters({ brand: "", category: "", type: "" ?? "", search: "" }); setCurrentPage(1); };

  const handleToggleActive = async (vehicleId, currentActive) => {
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, getFetchOptions('PATCH', { isActive: !currentActive }));
      if (res.ok) {
        setVehicles(prev => prev.map(v => v._id === vehicleId ? { ...v, isActive: !currentActive } : v));
        setNotification({ open: true, message: 'Status updated successfully', severity: 'success' });
      }
    } catch (err) { setNotification({ open: true, message: 'Update failed', severity: 'error' }); }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm("Remove this vehicle from the inventory? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, getFetchOptions('DELETE'));
      if (res.ok) {
        setVehicles(prev => prev.filter(v => v._id !== vehicleId));
        setNotification({ open: true, message: 'Vehicle removed successfully', severity: 'success' });
      }
    } catch (err) { setNotification({ open: true, message: 'Delete failed', severity: 'error' }); }
  };

  const vendorGroups = useMemo(() => {
    const groups = {};
    vehicles.forEach(v => {
      let provider = v.provider;
      
      // Handle cases where provider might be null, an ID string, or a populated object
      const providerId = provider?._id || (typeof provider === 'string' ? provider : 'unassigned');
      
      // Extract a meaningful name: prioritize Company Name -> Full Name -> Username -> Email
      let displayName = 'Private Provider';
      if (provider && typeof provider === 'object') {
        const full = `${provider.firstName || ''} ${provider.lastName || ''}`.trim();
        displayName = provider.storeName || provider.companyName || full || provider.name || provider.email || `Vendor ${providerId.slice(-6)}`;
      } else if (typeof provider === 'string') {
        displayName = `Vendor ${provider.slice(-6)}`;
      }

      if (!groups[providerId]) {
        groups[providerId] = {
          provider: typeof provider === 'object' ? provider : { _id: providerId },
          displayName: displayName,
          vehicles: []
        };
      }
      groups[providerId].vehicles.push(v);
    });
    return Object.values(groups).sort((a,b) => b.vehicles.length - a.vehicles.length);
  }, [vehicles]);

  const stats = {
    total: totalItems,
    active: vehicles.filter(v => v.isActive).length,
    new: vehicles.filter(v => v.isNew).length,
    vendors: vendorGroups.length,
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: themeColors.background, color: themeColors.textMain }}>
      {/* Premium Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'flex-end', gap: 3 }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 950, background: themeColors.gradientPrimary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-2px', fontSize: '3rem', lineHeight: 1 }}>
            Vehicle Management
          </Typography>
          <Typography variant="subtitle1" sx={{ color: themeColors.textSecondary, fontWeight: 700, mt: 1, fontSize: '0.95rem' }}>
            Luxury fleet & Vendor inventory administration
          </Typography>
        </Box>
        <Stack direction="row" spacing={2.5}>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={() => fetchVehicles()} 
            sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 800, px: 3, height: 48, borderColor: themeColors.border, color: themeColors.textMain, bgcolor: 'white' }}
          >
            Refresh List
          </Button>
          <Button 
            variant="contained" 
            disableElevation 
            onClick={() => navigate("/vehicles/create")} 
            sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 900, px: 4, height: 48, background: themeColors.gradientPrimary, boxShadow: '0 8px 20px rgba(225, 91, 100, 0.25)', '&:hover': { opacity: 0.9, transform: 'translateY(-2px)' }, transition: 'all 0.3s ease' }}
          >
            <Add sx={{ mr: 1, fontSize: 24 }} /> Add New Vehicle
          </Button>
        </Stack>
      </Box>

      {/* Stats Dashboard */}
      <Box sx={{ display: 'flex', gap: 2.5, mb: 5, flexWrap: 'wrap' }}>
        <HeaderStat label="Total Vehicles" value={stats.total} icon={<DirectionsCar />} color={themeColors.accent} gradient={themeColors.gradientPrimary} />
        <HeaderStat label="Active Units" value={stats.active} icon={<CheckCircle />} color={themeColors.success} gradient={themeColors.gradientSuccess} />
        <HeaderStat label="New Arrivals" value={stats.new} icon={<Star />} color={themeColors.warning} />
        <HeaderStat label="Active Vendors" value={stats.vendors} icon={<Storefront />} color={themeColors.primary} />
      </Box>

      {/* Advanced Filters */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '24px', border: '1px solid', borderColor: themeColors.border, bgcolor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              placeholder="Search by vehicle name..."
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
                displayEmpty value={pendingFilters.brand}
                onChange={e => setPendingFilters({ ...pendingFilters, brand: e.target.value })}
                sx={{ borderRadius: '14px', bgcolor: themeColors.background, fontWeight: 700 }}
              >
                <MenuItem value="" disabled>Select Brand</MenuItem>
                <MenuItem value="">All Brands</MenuItem>
                {brands.map(b => <MenuItem key={b._id} value={b._id}>{b.name || b.title}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2.5}>
            <FormControl fullWidth>
              <Select
                displayEmpty value={pendingFilters.category}
                onChange={e => setPendingFilters({ ...pendingFilters, category: e.target.value })}
                sx={{ borderRadius: '14px', bgcolor: themeColors.background, fontWeight: 700 }}
              >
                <MenuItem value="" disabled>Vehicle Category</MenuItem>
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.name || c.title}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
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
          <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textSecondary }}>Refreshing vehicle data...</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {vendorGroups.length > 0 ? (
            vendorGroups.map((group) => {
              const isExpanded = expandedVendors[group.provider?._id || 'unassigned'];
              const vendorName = group.displayName || 'Independent Vendor';

              return (
                <Paper key={group.provider?._id || 'unassigned'} elevation={0} sx={{
                  borderRadius: '28px', overflow: 'hidden', border: '1px solid',
                  borderColor: isExpanded ? themeColors.accent + '40' : themeColors.border,
                  boxShadow: isExpanded ? '0 15px 45px rgba(225,91,100,0.08)' : 'none',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', bgcolor: 'white'
                }}>
                  <Box onClick={() => setExpandedVendors(p => ({ ...p, [group.provider?._id || 'unassigned']: !isExpanded }))} sx={{
                    p: 3, display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer',
                    bgcolor: isExpanded ? themeColors.accentLight : 'white',
                  }}>
                    <Avatar sx={{ 
                      width: 54, height: 54, fontSize: '1.3rem', fontWeight: 900, 
                      background: themeColors.gradientPrimary, color: 'white', 
                      border: '4px solid white', boxShadow: '0 6px 12px rgba(0,0,0,0.1)' 
                    }}>
                      {vendorName ? vendorName[0].toUpperCase() : '?'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 950, color: themeColors.textMain, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>{vendorName}</Typography>
                      <Typography variant="body1" sx={{ color: themeColors.textSecondary, fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
                        <CheckCircle sx={{ fontSize: 14, mr: 0.6, color: themeColors.success }} /> {group.provider?.email || 'Registered Vendor'}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', px: 2 }}>
                      <Typography sx={{ fontWeight: 950, color: themeColors.textSecondary, fontSize: '0.75rem', letterSpacing: '1px' }}>{group.vehicles.length.toString().padStart(2, '0')} VEHICLES</Typography>
                      <Chip label="ACTIVE PROVIDER" size="small" sx={{ fontWeight: 900, bgcolor: themeColors.success, color: 'white', mt: 0.6, height: 24, fontSize: '0.65rem', borderRadius: '8px' }} />
                    </Box>
                  </Box>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ px: 4, pb: 4 }}>
                      <Divider sx={{ mb: 3 }} />
                      <TableContainer>
                        <Table sx={{ minWidth: 900 }}>
                          <TableHead>
                            <TableRow sx={{ '& th': { borderBottom: '2px solid' + themeColors.border, py: 1.5, fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' } }}>
                              <TableCell>Preview & Details</TableCell>
                              <TableCell>Category/Brand</TableCell>
                              <TableCell>Specs & Model</TableCell>
                              <TableCell>Pricing (Base)</TableCell>
                              <TableCell align="center">Hot/New</TableCell>
                              <TableCell align="center">Active</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {group.vehicles.map((v) => (
                              <TableRow key={v._id} sx={{ '& td': { py: 2.2 }, '&:hover': { bgcolor: '#F9FAFB' }, transition: 'background-color 0.2s' }}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                    <Avatar 
                                      variant="rounded"
                                      src={getApiImageUrl(v.featuredImage)}
                                      sx={{ width: 80, height: 50, borderRadius: '12px', bgcolor: '#eee', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '2px solid white' }}
                                    >
                                      <DirectionsCar sx={{ color: '#ccc' }} />
                                    </Avatar>
                                    <Box>
                                      <Typography sx={{ fontWeight: 900, color: themeColors.accent, fontSize: '1.05rem', lineHeight: 1.2 }}>{v.name}</Typography>
                                      <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 800, display: 'flex', alignItems: 'center', mt: 0.3 }}>
                                        <PinDrop sx={{ fontSize: 12, mr: 0.4 }} /> {v.licensePlateNumber || 'ID:—'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip label={v.category?.title || v.category?.name || 'VEHICLE'} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 900, mb: 0.8, bgcolor: themeColors.primary, color: 'white', borderRadius: '6px' }} />
                                  <Typography sx={{ fontWeight: 800, color: themeColors.textMain, fontSize: '0.88rem' }}>{v.brand?.title || v.brand?.name || 'General'}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Stack spacing={0.5}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center' }}>
                                      <CalendarToday sx={{ fontSize: 13, mr: 0.8, color: themeColors.textSecondary }} /> {v.model || 'Standard'} {v.yearOfManufacture ? `(${v.yearOfManufacture})` : ''}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.78rem', color: themeColors.textSecondary, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                                      <Speed sx={{ fontSize: 13, mr: 0.8 }} /> {v.totalTrips || 0} Successful Trips
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography sx={{ fontWeight: 950, color: themeColors.success, fontSize: '1.15rem' }}>
                                      ₹{v.pricing?.basicPackage?.price?.toLocaleString() || v.pricing?.perDay?.toLocaleString() || '0'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 800, fontSize: '0.65rem' }}>
                                      {v.pricing?.basicPackage?.includedHours || 0} Hours / {v.pricing?.basicPackage?.includedKilometers || 0} KM Inc.
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Switch size="small" checked={v.isNew} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: themeColors.warning } }} />
                                </TableCell>
                                <TableCell align="center">
                                  <Switch size="small" checked={v.isActive} onChange={() => handleToggleActive(v._id, v.isActive)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: themeColors.success } }} />
                                </TableCell>
                                <TableCell align="right">
                                  <Stack direction="row" spacing={0.8} justifyContent="flex-end">
                                    <Tooltip title="Inspection View"><IconButton size="small" onClick={() => navigate(`/vehicle-setup/view/${v._id}`)} sx={{ color: themeColors.textSecondary, border: '1px solid #eee', bgcolor: 'white' }}><VisibilityOutlined sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                                    <Tooltip title="Modify Fleet Item"><IconButton size="small" onClick={() => navigate(`/vehicles/edit/${v._id}`)} sx={{ color: themeColors.primary, border: '1px solid #eee', bgcolor: 'white' }}><Edit sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                                    <Tooltip title="Decommission"><IconButton size="small" onClick={() => handleDelete(v._id)} sx={{ color: themeColors.danger, border: '1px solid #eee', bgcolor: 'white' }}><Delete sx={{ fontSize: 18 }} /></IconButton></Tooltip>
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
              <Commute sx={{ fontSize: 60, color: themeColors.border, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textSecondary }}>No vehicles currently registered.</Typography>
              <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 1 }}>Switch modules or add a new vehicle to the registry.</Typography>
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
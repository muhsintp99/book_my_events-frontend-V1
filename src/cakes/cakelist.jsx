import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer,
  Switch, IconButton, Box, TextField, Button,
  Dialog, DialogContent, DialogTitle,
  Typography, Snackbar, Alert, CircularProgress, Chip, Divider,
  Avatar, Tooltip, Collapse, Grid
} from '@mui/material';
import {
  VisibilityOutlined, Edit, Delete, Close, 
  Search as SearchIcon, Star, 
  ViewList, Refresh, CheckCircle, Storefront,
  Cake, RestaurantMenu
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/apiImageUtils';

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
    bgcolor: 'white', borderRadius: '18px', py: 2.0, px: 2.8,
    display: 'flex', alignItems: 'center', gap: 2.4, flex: 1, minWidth: '200px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
    border: '1px solid', borderColor: 'rgba(0,0,0,0.04)',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 25px rgba(0,0,0,0.06)' }
  }}>
    <Box sx={{
      width: 48, height: 48, borderRadius: '14px', background: gradient || `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: gradient ? '#FFFFFF' : color,
      boxShadow: gradient ? '0 4px 10px rgba(225, 91, 100, 0.2)' : 'none'
    }}>
      {React.cloneElement(icon, { sx: { fontSize: 24 } })}
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.7rem' }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 900, color: themeColors.textMain, lineHeight: 1.1, fontSize: '1.35rem' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const Cakelist = () => {
  const navigate = useNavigate();

  const [cakes, setCakes] = useState([]);
  const [allCakes, setAllCakes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [expandedVendors, setExpandedVendors] = useState({});
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedCake, setSelectedCake] = useState(null);

  const API_URL = `${API_BASE_URL}/cakes`;

  const getFetchOptions = (method = 'GET', body = null) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include', mode: 'cors',
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);
    return opts;
  };

  const fetchCakes = async (topPicks = false) => {
    try {
      setLoading(true);
      const url = topPicks ? `${API_URL}/top-picks` : API_URL;
      const res = await fetch(url, getFetchOptions());
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        const mapped = data.data.map((c, idx) => ({
          _id: c._id, id: idx + 1,
          title: c.name || 'Untitled',
          description: c.shortDescription || '',
          basePrice: c.basePrice ?? 0,
          finalPrice: c.finalPrice ?? 0,
          itemType: c.itemType || 'Eggless',
          providerId: c.provider?._id || c.provider?.id || 'unknown',
          providerName: c.provider?.firstName && c.provider?.lastName ? `${c.provider.firstName} ${c.provider.lastName}` : (c.provider?.firstName || c.provider?.name || '—'),
          providerEmail: c.provider?.email || '', providerPhone: c.provider?.phone || '',
          isTopPick: c.isTopPick ?? false, isActive: c.isActive ?? false,
          rawPackage: c,
        }));
        setAllCakes(mapped); setCakes(mapped);
        
        // Expand all vendors by default
        const uniqueVendors = [...new Set(mapped.map(m => m.providerId))];
        const allExpanded = {};
        uniqueVendors.forEach(id => { allExpanded[id] = true; });
        setExpandedVendors(allExpanded);
      }
    } catch (e) {
      setNotification({ open: true, message: `Error: ${e.message}`, severity: 'error' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCakes(); }, []);

  const filtered = cakes.filter((c) =>
    `${c.title} ${c.providerName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const vendorGroups = useMemo(() => {
    const groups = {};
    filtered.forEach((pkg) => {
      const key = pkg.providerId;
      if (!groups[key]) {
        groups[key] = {
          providerId: key, providerName: pkg.providerName,
          providerEmail: pkg.providerEmail, providerPhone: pkg.providerPhone,
          packages: [],
        };
      }
      groups[key].packages.push(pkg);
    });
    return Object.values(groups).sort((a, b) => b.packages.length - a.packages.length);
  }, [filtered]);

  const toggleVendor = (vendorId) => setExpandedVendors(p => ({ ...p, [vendorId]: !p[vendorId] }));

  const handleStatusUpdate = async (_id, type) => {
    const valKey = type === 'topPick' ? 'isTopPick' : 'isActive';
    const endpoint = type === 'topPick' ? 'toggle-top-pick' : 'toggle-active';
    const key = `${_id}-${type}`;
    if (toggleLoading[key]) return;

    setToggleLoading(p => ({ ...p, [key]: true }));
    setCakes(p => p.map(c => c._id === _id ? { ...c, [valKey]: !c[valKey] } : c));
    try {
      const res = await fetch(`${API_URL}/${_id}/${endpoint}`, getFetchOptions('PATCH'));
      if (!res.ok) throw new Error('Failed');
    } catch (e) {
      setCakes(p => p.map(c => c._id === _id ? { ...c, [valKey]: !c[valKey] } : c));
      setNotification({ open: true, message: 'Update failed', severity: 'error' });
    } finally { setToggleLoading(p => { const n = { ...p }; delete n[key]; return n; }); }
  };

  const handleView = (pkg) => { setSelectedCake(pkg.rawPackage); setOpenViewDialog(true); };

  const stats = {
    total: allCakes.length,
    active: allCakes.filter(c => c.isActive).length,
    topPick: allCakes.filter(c => c.isTopPick).length,
    vendors: [...new Set(allCakes.map(c => c.providerId))].length,
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: themeColors.background, color: themeColors.textMain }}>
      {/* Red Premium Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, background: themeColors.gradientPrimary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1.1px', fontSize: '2.3rem' }}>
            BookMyEvent Cakes
          </Typography>
          <Typography variant="subtitle1" sx={{ color: themeColors.textSecondary, fontWeight: 600, mt: 0.2, fontSize: '0.88rem' }}>
            Confectionery partners & treat management.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<Refresh fontSize="small" />} onClick={() => fetchCakes()} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 2.2, height: 42, fontSize: '0.82rem', borderColor: themeColors.border, color: themeColors.textSecondary }}>Refresh</Button>
          <Button variant="contained" disableElevation onClick={() => fetchCakes(true)} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 2.5, height: 42, fontSize: '0.82rem', background: themeColors.gradientPrimary, '&:hover': { opacity: 0.9 } }}>Top Picks</Button>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2.5, mb: 4, flexWrap: 'wrap' }}>
        <HeaderStat label="Confections" value={stats.total} icon={<Cake />} color={themeColors.accent} gradient={themeColors.gradientPrimary} />
        <HeaderStat label="Active" value={stats.active} icon={<CheckCircle />} color={themeColors.success} gradient={themeColors.gradientSuccess} />
        <HeaderStat label="Top Picks" value={stats.topPick} icon={<Star />} color={themeColors.warning} />
        <HeaderStat label="Bake Studios" value={stats.vendors} icon={<Storefront />} color={themeColors.primary} />
      </Box>

      {/* Filter */}
      <Paper elevation={0} sx={{ p: 1.8, mb: 3.5, borderRadius: '18px', border: '1px solid', borderColor: themeColors.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search bakeries or treats..."
            size="small"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ color: themeColors.textSecondary, mr: 1, fontSize: 18 }} /> }}
            sx={{ width: 350, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: themeColors.background, fontSize: '0.82rem' } }}
          />
        </Box>
        <Button 
          variant="text" 
          onClick={() => {
            const anyVisible = Object.values(expandedVendors).some(v => v);
            if (anyVisible) setExpandedVendors({});
            else {
              const all = {};
              [...new Set(filtered.map(f => f.providerId))].forEach(id => { all[id] = true; });
              setExpandedVendors(all);
            }
          }} 
          sx={{ fontWeight: 800, color: themeColors.textSecondary, textTransform: 'none', fontSize: '0.78rem' }}
        >
          {Object.values(expandedVendors).some(v => v) ? 'Collapse Bakeries' : 'View All Treats'}
        </Button>
      </Paper>

      {/* Vendor Groups */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {vendorGroups.map((vendor) => {
          const isExpanded = expandedVendors[vendor.providerId];
          const activeCount = vendor.packages.filter(p => p.isActive).length;

          return (
            <Paper key={vendor.providerId} elevation={0} sx={{
              borderRadius: '24px', overflow: 'hidden', border: '1px solid',
              borderColor: isExpanded ? themeColors.accent + '30' : themeColors.border,
              boxShadow: isExpanded ? '0 12px 30px rgba(225,91,100,0.06)' : 'none',
              transition: 'all 0.4s ease', bgcolor: 'white'
            }}>
              <Box onClick={() => toggleVendor(vendor.providerId)} sx={{
                p: 2.5, display: 'flex', alignItems: 'center', gap: 2.5, cursor: 'pointer',
                bgcolor: isExpanded ? themeColors.accentLight : 'white',
              }}>
                <Avatar sx={{ 
                  width: 44, height: 44, fontSize: '1.1rem', fontWeight: 900, 
                  background: themeColors.gradientPrimary, color: 'white', 
                  border: '3px solid white', boxShadow: '0 4px 8px rgba(0,0,0,0.08)' 
                }}>
                  {vendor.providerName[0].toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 900, color: themeColors.textMain, fontSize: '1.12rem' }}>{vendor.providerName}</Typography>
                  <Typography variant="body1" sx={{ color: themeColors.textSecondary, fontWeight: 600, fontSize: '0.82rem' }}>
                    {vendor.providerEmail} • {vendor.providerPhone}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', px: 1.5 }}>
                  <Typography sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.75rem' }}>{vendor.packages.length} TREATS</Typography>
                  <Chip label={`${activeCount} ACTIVE`} size="small" sx={{ fontWeight: 900, bgcolor: themeColors.success, color: 'white', mt: 0.4, height: 22, fontSize: '0.65rem' }} />
                </Box>
              </Box>

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ px: 3.5, pb: 2.5 }}>
                  <Divider sx={{ mb: 2.5 }} />
                  <TableContainer>
                    <Table size="medium">
                      <TableHead>
                        <TableRow sx={{ '& th': { borderBottom: '2px solid' + themeColors.border, py: 1.2 } }}>
                          <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.78rem' }}>CONFECTION NAME</TableCell>
                          <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.78rem' }}>PRICE (INR)</TableCell>
                          <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.78rem' }} align="center">TOP PICK</TableCell>
                          <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.78rem' }} align="center">STATUS</TableCell>
                          <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.78rem' }} align="right">ACTIONS</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vendor.packages.map((pkg) => (
                          <TableRow key={pkg._id} sx={{ '& td': { py: 1.6 }, '&:hover': { bgcolor: '#F9FAFB' } }}>
                            <TableCell>
                              <Typography sx={{ fontWeight: 800, color: themeColors.textMain, fontSize: '0.95rem' }}>{pkg.title}</Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip label={pkg.itemType} size="small" icon={<RestaurantMenu sx={{ fontSize: '10px !important' }} />} sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: pkg.itemType === 'Eggless' ? '#f0fdf4' : '#fff7ed', color: pkg.itemType === 'Eggless' ? '#16a34a' : '#ea580c' }} />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontWeight: 900, color: themeColors.success, fontSize: '1.05rem' }}>₹{pkg.finalPrice.toLocaleString()}</Typography>
                              {pkg.basePrice > pkg.finalPrice && <Typography sx={{ color: themeColors.textSecondary, textDecoration: 'line-through', fontSize: '0.75rem' }}>₹{pkg.basePrice.toLocaleString()}</Typography>}
                            </TableCell>
                            <TableCell align="center">
                              <Switch size="small" checked={pkg.isTopPick} onChange={() => handleStatusUpdate(pkg._id, 'topPick')} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: themeColors.warning } }} />
                            </TableCell>
                            <TableCell align="center">
                              <Switch size="small" checked={pkg.isActive} onChange={() => handleStatusUpdate(pkg._id, 'status')} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: themeColors.success } }} />
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.6 }}>
                                <Tooltip title="View Detailed Info"><IconButton size="small" onClick={() => handleView(pkg)} sx={{ color: themeColors.accent }}><VisibilityOutlined sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                                <IconButton size="small" sx={{ color: themeColors.textSecondary }}><Edit sx={{ fontSize: 18 }} /></IconButton>
                                <IconButton size="small" sx={{ color: themeColors.danger }}><Delete sx={{ fontSize: 18 }} /></IconButton>
                              </Box>
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
        })}
      </Box>

      {/* View Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 3 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.2rem' }}>Treat Details</Typography>
          <IconButton onClick={() => setOpenViewDialog(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 4 }}>
          {selectedCake && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1.5, color: themeColors.accent }}>{selectedCake.name}</Typography>
              <Typography sx={{ color: themeColors.textSecondary, mb: 3, lineHeight: 1.6, fontSize: '0.9rem' }}>{selectedCake.shortDescription}</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: '16px', bgcolor: '#F9FAFB' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: themeColors.textSecondary }}>FINAL PRICE</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: themeColors.success }}>₹{selectedCake.finalPrice.toLocaleString()}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: '16px', bgcolor: '#F9FAFB' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: themeColors.textSecondary }}>ITEM TYPE</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: selectedCake.itemType === 'Eggless' ? themeColors.success : themeColors.warning }}>
                      {selectedCake.itemType.toUpperCase()}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2 }}>Occasions:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(selectedCake.occasions || []).map((o, i) => (
                  <Chip key={i} label={o} size="small" sx={{ fontWeight: 700 }} />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={3000} onClose={() => setNotification(p => ({...p, open: false}))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={notification.severity} variant="filled" sx={{ borderRadius: '18px', fontWeight: 700, fontSize: '0.82rem' }}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Cakelist;
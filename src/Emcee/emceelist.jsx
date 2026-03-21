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
  Refresh, CheckCircle, Storefront,
  MicExternalOn, AutoFixHigh, MilitaryTech
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
    transition: 'all 0.4s ease',
    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 25px rgba(0,0,0,0.06)' }
  }}>
    <Box sx={{
      width: 48, height: 48, borderRadius: '14px', background: gradient || `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: gradient ? '#FFFFFF' : color,
    }}>
      {React.cloneElement(icon, { sx: { fontSize: 24 } })}
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.75rem' }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 900, color: themeColors.textMain, lineHeight: 1.1, fontSize: '1.4rem' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const EmceeList = () => {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [expandedVendors, setExpandedVendors] = useState({});
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const API_URL = `${API_BASE_URL}/emcee`;

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

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, getFetchOptions());
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        const mapped = data.data.map((m, idx) => ({
          _id: m._id, id: idx + 1,
          title: m.packageName || 'Master of Ceremonies',
          description: m.description || '',
          price: m.packagePrice ?? 0,
          advance: m.advanceBookingAmount ?? 0,
          category: m.category || 'Emcee',
          providerId: m.provider?._id || m.provider?.id || 'unknown',
          providerName: m.provider?.firstName && m.provider?.lastName ? `${m.provider.firstName} ${m.provider.lastName}` : (m.provider?.firstName || m.provider?.name || '—'),
          providerEmail: m.provider?.email || '', providerPhone: m.provider?.phone || '',
          isTopPick: m.isTopPick ?? false, isActive: m.isActive ?? false,
          rawPackage: m,
        }));
        setPackages(mapped); setAllPackages(mapped);
        
        const uniqueVendors = [...new Set(mapped.map(m => m.providerId))];
        const allExpanded = {};
        uniqueVendors.forEach(id => { allExpanded[id] = true; });
        setExpandedVendors(allExpanded);
      }
    } catch (e) {
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPackages(); }, []);

  const filtered = packages.filter(p => `${p.title} ${p.providerName}`.toLowerCase().includes(searchTerm.toLowerCase()));

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
    setPackages(p => p.map(c => c._id === _id ? { ...c, [valKey]: !c[valKey] } : c));
    try {
      await fetch(`${API_URL}/${_id}/${endpoint}`, getFetchOptions('PATCH'));
    } catch (e) {
      setPackages(p => p.map(c => c._id === _id ? { ...c, [valKey]: !c[valKey] } : c));
      setNotification({ open: true, message: 'Update failed', severity: 'error' });
    } finally { setToggleLoading(p => { const n = { ...p }; delete n[key]; return n; }); }
  };

  const handleView = (pkg) => { setSelectedPackage(pkg.rawPackage); setOpenViewDialog(true); };

  const stats = {
    total: allPackages.length,
    active: allPackages.filter(p => p.isActive).length,
    topPick: allPackages.filter(p => p.isTopPick).length,
    artists: [...new Set(allPackages.map(p => p.providerId))].length,
  };

  return (
    <Box sx={{ p: 4, bgcolor: themeColors.background, minHeight: '100vh' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, background: themeColors.gradientPrimary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1.2px' }}>
            BookMyEvent Emcee
          </Typography>
          <Typography variant="subtitle1" sx={{ color: themeColors.textSecondary, fontWeight: 700, mt: 0.2 }}>
            Masters of Ceremonies & Anchors management.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchPackages} sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 900, px: 3, border: '1px solid', borderColor: themeColors.border, color: themeColors.textMain }}>Sync Artists</Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2.5, mb: 4, flexWrap: 'wrap' }}>
        <HeaderStat label="Showreel Skills" value={stats.total} icon={<MicExternalOn />} color={themeColors.accent} gradient={themeColors.gradientPrimary} />
        <HeaderStat label="Available" value={stats.active} icon={<CheckCircle />} color={themeColors.success} gradient={themeColors.gradientSuccess} />
        <HeaderStat label="Premium Stars" value={stats.topPick} icon={<Star />} color={themeColors.warning} />
        <HeaderStat label="Host Network" value={stats.artists} icon={<Groups />} color={themeColors.primary} />
      </Box>

      <Paper elevation={0} sx={{ p: 1.5, mb: 3.5, borderRadius: '20px', border: '1px solid', borderColor: themeColors.border, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'white' }}>
        <TextField
          placeholder="Search by event type or emcee name..."
          size="small"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ width: 450, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: themeColors.background } }}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: themeColors.textSecondary, mr: 1 }} /> }}
        />
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {vendorGroups.map((vendor) => {
          const isExpanded = expandedVendors[vendor.providerId];
          return (
            <Paper key={vendor.providerId} sx={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid', borderColor: isExpanded ? themeColors.accent + '30' : themeColors.border, boxShadow: isExpanded ? '0 10px 30px rgba(0,0,0,0.03)' : 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              <Box onClick={() => toggleVendor(vendor.providerId)} sx={{ p: 2.8, display: 'flex', alignItems: 'center', gap: 2.5, cursor: 'pointer', bgcolor: isExpanded ? themeColors.accentLight : 'white' }}>
                <Avatar sx={{ width: 52, height: 52, background: themeColors.gradientPrimary, fontWeight: 900, border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>{vendor.providerName[0]}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: themeColors.textMain }}>{vendor.providerName}</Typography>
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary, fontWeight: 600 }}>{vendor.providerEmail} • {vendor.providerPhone}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.8rem' }}>{vendor.packages.length} PACKAGES</Typography>
                  <MilitaryTech sx={{ color: themeColors.warning, mt: 0.5 }} />
                </Box>
              </Box>

              <Collapse in={isExpanded}>
                <Box sx={{ px: 4, pb: 3.5 }}>
                  <Divider sx={{ mb: 3 }} />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.8rem' }}>PERFORMANCE ROLE</TableCell>
                          <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.8rem' }}>RATE (INR)</TableCell>
                          <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.8rem' }} align="center">EDITOR'S CHOICE</TableCell>
                          <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.8rem' }} align="center">STATUS</TableCell>
                          <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.8rem' }} align="right">RECORD</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vendor.packages.map(pkg => (
                          <TableRow key={pkg._id} hover sx={{ '& td': { py: 2 } }}>
                            <TableCell>
                              <Typography sx={{ fontWeight: 800, color: themeColors.textMain, fontSize: '0.95rem' }}>{pkg.title}</Typography>
                              <Stack direction="row" spacing={1} mt={0.5}>
                                <Chip label="Charismatic" size="small" variant="outlined" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800 }} />
                                <Chip label="Engaging" size="small" variant="outlined" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800 }} />
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontWeight: 900, color: themeColors.success, fontSize: '1.05rem' }}>₹{pkg.price.toLocaleString()}</Typography>
                              <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 700 }}>Advance: ₹{pkg.advance.toLocaleString()}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Switch size="small" checked={pkg.isTopPick} onChange={() => handleStatusUpdate(pkg._id, 'topPick')} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: themeColors.warning } }} />
                            </TableCell>
                            <TableCell align="center">
                              <Switch size="small" checked={pkg.isActive} onChange={() => handleStatusUpdate(pkg._id, 'status')} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: themeColors.success } }} />
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                <IconButton size="small" onClick={() => handleView(pkg)} sx={{ color: themeColors.accent }}><VisibilityOutlined sx={{ fontSize: 18 }} /></IconButton>
                                <IconButton size="small" sx={{ color: themeColors.textSecondary }}><Edit sx={{ fontSize: 18 }} /></IconButton>
                                <IconButton size="small" sx={{ color: themeColors.danger }}><Delete sx={{ fontSize: 18 }} /></IconButton>
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
        })}
      </Box>

      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '28px' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 3.5, px: 4 }}>
          <Typography sx={{ fontWeight: 950, fontSize: '1.3rem' }}>Artist Information</Typography>
          <IconButton onClick={() => setOpenViewDialog(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 5, px: 4 }}>
          {selectedPackage && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: themeColors.accent }}>{selectedPackage.packageName}</Typography>
              <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 3.5, lineHeight: 1.7, fontSize: '0.92rem' }}>{selectedPackage.description || 'Dynamic and professional presence that guarantees to keep your audience engaged and entertained throughout the event.'}</Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={6}><Paper variant="outlined" sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#F9FAFB', border: '1px solid #eee' }}><Typography variant="caption" sx={{ fontWeight: 900, color: themeColors.textSecondary }}>BOOKING FEE</Typography><Typography sx={{ fontWeight: 950, color: themeColors.success, fontSize: '1.25rem' }}>₹{selectedPackage.packagePrice.toLocaleString()}</Typography></Paper></Grid>
                <Grid item xs={6}><Paper variant="outlined" sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#F9FAFB', border: '1px solid #eee' }}><Typography variant="caption" sx={{ fontWeight: 900, color: themeColors.textSecondary }}>SECURE WITH</Typography><Typography sx={{ fontWeight: 950, color: themeColors.textMain, fontSize: '1.25rem' }}>₹{selectedPackage.advanceBookingAmount?.toLocaleString() || '0'}</Typography></Paper></Grid>
              </Grid>
              <Divider sx={{ my: 4 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2 }}>Key Highlights:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2 }}>
                {['Public Speaking', 'Crowd Control', 'Humor', 'Script Execution'].map(h => <Chip key={h} label={h} size="small" sx={{ fontWeight: 800, bgcolor: themeColors.accentLight, color: themeColors.accent, border: '1px solid', borderColor: themeColors.accent + '30' }} />)}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={3000} onClose={() => setNotification(p => ({...p, open: false}))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={notification.severity} variant="filled" sx={{ borderRadius: '14px', fontWeight: 800 }}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EmceeList;

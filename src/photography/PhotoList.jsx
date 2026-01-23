import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  Switch,
  IconButton,
  Box,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  FormControlLabel,
  Checkbox,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import {
  VisibilityOutlined,
  Edit,
  Delete,
  Search as SearchIcon,
  Close,
  Save,
  Add,
  Remove,
  Policy,
  CheckCircle,
  LocationOn,
  AttachMoney,
} from '@mui/icons-material';
import { API_BASE_URL, getApiImageUrl, API_ORIGIN } from '../utils/apiImageUtils';

const PhotographyList = () => {
  const [packages, setPackages] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewPackage, setViewPackage] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);

  // API_BASE_URL is now imported from apiImageUtils
  const API_URL = `${API_BASE_URL}/photography-packages`;

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  const getFetchOptions = (method = 'GET', body = null) => {
    const token = getToken();
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);
    return opts;
  };

  const makeAPICall = async (url, options, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (err) {
        if (i === retries) throw err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  };
  const fixImageUrl = (url) => getApiImageUrl(url);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await makeAPICall(API_URL, getFetchOptions());
      if (data?.data && Array.isArray(data.data)) {
        const mapped = data.data.map((p, idx) => ({
          id: idx + 1,
          _id: p._id,
          photographyId: p.photographyId,
          packageTitle: p.packageTitle || 'Untitled',
          description: p.description || '',
          categories: p.categories || [],
          categoryNames: (p.categories || []).map(c => c.title).join(', ') || '—',
          price: p.price ?? 0,
          providerName: `${p.provider?.firstName || ''} ${p.provider?.lastName || ''}`.trim() || '—',
          basicAddons: p.basicAddons || [],
          includedServices: p.includedServices || [],
          travelToVenue: p.travelToVenue ?? false,
          advanceBookingAmount: p.advanceBookingAmount || '',
          cancellationPolicy: p.cancellationPolicy || '',
          gallery: p.gallery || [],
          isTopPick: p.isTopPick ?? false,
          isActive: p.isActive ?? false,
        }));
        setAllPackages(mapped);
        setPackages(mapped);
      }
    } catch (e) {
      setNotification({ open: true, message: `Error loading packages: ${e.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleTopPickToggle = async (_id) => {
    const pkg = packages.find(p => p._id === _id);
    const newVal = !pkg.isTopPick;
    setPackages(p => p.map(pk => pk._id === _id ? { ...pk, isTopPick: newVal } : pk));
    try {
      await makeAPICall(`${API_URL}/${_id}/toggle-top-pick`, getFetchOptions('PATCH'));
      setNotification({ open: true, message: newVal ? 'Added to Top Picks' : 'Removed from Top Picks', severity: 'success' });
    } catch (e) {
      setPackages(p => p.map(pk => pk._id === _id ? { ...pk, isTopPick: !newVal } : pk));
      setNotification({ open: true, message: 'Failed to update Top Pick', severity: 'error' });
    }
  };

  const handleStatusToggle = async (_id) => {
    const pkg = packages.find(p => p._id === _id);
    const newVal = !pkg.isActive;
    setPackages(p => p.map(pk => pk._id === _id ? { ...pk, isActive: newVal } : pk));
    try {
      await makeAPICall(`${API_URL}/${_id}/toggle-active`, getFetchOptions('PATCH'));
      setNotification({ open: true, message: newVal ? 'Package Activated' : 'Package Deactivated', severity: 'success' });
    } catch (e) {
      setPackages(p => p.map(pk => pk._id === _id ? { ...pk, isActive: !newVal } : pk));
      setNotification({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const handleViewClick = (pkg) => {
    setViewPackage(pkg);
    setOpenViewDialog(true);
  };

  const handleEditClick = (pkg) => {
    setEditingPackage({ ...pkg });
    setTabValue(0);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (pkg) => {
    setPackageToDelete(pkg);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await makeAPICall(`${API_URL}/${packageToDelete._id}`, getFetchOptions('DELETE'));
      setPackages(p => p.filter(pk => pk._id !== packageToDelete._id));
      setAllPackages(p => p.filter(pk => pk._id !== packageToDelete._id));
      setNotification({ open: true, message: 'Package deleted successfully', severity: 'success' });
    } catch (e) {
      setNotification({ open: true, message: 'Delete failed', severity: 'error' });
    } finally {
      setOpenDeleteDialog(false);
      setPackageToDelete(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPackage) return;
    setSaving(true);
    try {
      const payload = {
        packageTitle: editingPackage.packageTitle,
        description: editingPackage.description,
        price: Number(editingPackage.price),
        basicAddons: editingPackage.basicAddons,
        includedServices: editingPackage.includedServices,
        travelToVenue: editingPackage.travelToVenue,
        advanceBookingAmount: editingPackage.advanceBookingAmount,
        cancellationPolicy: editingPackage.cancellationPolicy,
      };

      await makeAPICall(`${API_URL}/${editingPackage._id}`, getFetchOptions('PATCH', payload));
      await fetchPackages();
      setOpenEditDialog(false);
      setNotification({ open: true, message: 'Package updated successfully!', severity: 'success' });
    } catch (e) {
      setNotification({ open: true, message: 'Update failed: ' + e.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = packages.filter(p =>
    `${p.packageTitle} ${p.providerName} ${p.categoryNames}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addonLabels = {
    drone_video: 'Drone Video',
    pre_wedding: 'Pre-Wedding',
    candid_photography: 'Candid Photography',
    traditional_photography: 'Traditional Photography',
    video_editing: 'Video Editing',
    photo_album: 'Photo Album',
    led_wall: 'LED Wall',
    crane_shoot: 'Crane Shoot',
  };

  return (
    <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip label={`Total: ${allPackages.length}`} color="primary" />
              <Chip label={`Active: ${allPackages.filter(p => p.isActive).length}`} color="success" />
              <Chip label={`Top Pick: ${allPackages.filter(p => p.isTopPick).length}`} color="secondary" />
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ p: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading packages...</Typography>
        </Box>
      ) : (
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f1f5f9' }}>
              <TableCell>#</TableCell>
              <TableCell>Package</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Add-ons</TableCell>
              <TableCell>Top</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p._id} hover>
                <TableCell>{p.id}</TableCell>
                <TableCell>
                  <Typography fontWeight="medium">{p.packageTitle}</Typography>
                  <Typography variant="caption" color="textSecondary">{p.categoryNames}</Typography>
                </TableCell>
                <TableCell>₹{p.price.toLocaleString()}</TableCell>
                <TableCell>{p.providerName}</TableCell>
                <TableCell>{p.basicAddons.length}</TableCell>
                <TableCell>
                  <Switch size="small" checked={p.isTopPick} onChange={() => handleTopPickToggle(p._id)} />
                </TableCell>
                <TableCell>
                  <Switch size="small" checked={p.isActive} onChange={() => handleStatusToggle(p._id)} />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleViewClick(p)}><VisibilityOutlined /></IconButton>
                  <IconButton size="small" color="primary" onClick={() => handleEditClick(p)}><Edit /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteClick(p)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* VIEW DIALOG - IMAGES FIXED */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' } }}>
        <DialogTitle sx={{ bgcolor: '#e91e63', color: 'white', p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="bold">{viewPackage?.packageTitle || 'Package Details'}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>ID: {viewPackage?.photographyId || '—'}</Typography>
            </Box>
            <IconButton onClick={() => setOpenViewDialog(false)} sx={{ color: 'white' }}><Close /></IconButton>
          </Box>
        </DialogTitle>

        {/* HERO IMAGE - FIXED */}
        {viewPackage?.gallery?.length > 0 && (
          <Box sx={{ height: 320, bgcolor: '#000' }}>
            <img
              src={fixImageUrl(viewPackage.gallery[0])}
              alt="Package cover"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => e.target.src = 'https://via.placeholder.com/800x400?text=No+Image'}
            />
          </Box>
        )}

        <Tabs value={tabValue} onChange={(_, v) => handkerchiefTabValue(v)} centered sx={{ bgcolor: '#f8f9fa' }}>
          <Tab label="Basic Information" />
          <Tab label="Pricing & Policies" />
          <Tab label="Features & Gallery" />
        </Tabs>

        <DialogContent sx={{ p: 4, bgcolor: '#fafafa' }}>
          {viewPackage && (
            <>
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Description</Typography>
                    <Typography>{viewPackage.description || 'No description provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Categories</Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {viewPackage.categories.map(c => <Chip key={c._id} label={c.title} size="small" color="primary" />)}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Provider</Typography>
                    <Typography fontWeight="bold">{viewPackage.providerName}</Typography>
                  </Grid>
                  {viewPackage.basicAddons.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Add-ons</Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {viewPackage.basicAddons.map(a => (
                          <Chip key={a} label={addonLabels[a] || a} color="secondary" variant="outlined" size="small" />
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}

              {tabValue === 1 && (
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Box textAlign="center" p={3} bgcolor="white" borderRadius={3} boxShadow={1}>
                      <Typography variant="h6" color="success.main" fontWeight="bold">Base Price</Typography>
                      <Typography variant="h4" fontWeight="bold" color="primary">₹{viewPackage.price.toLocaleString()}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box textAlign="center" p={3} bgcolor="white" borderRadius={3} boxShadow={1}>
                      <Typography variant="h6" color="error.main" fontWeight="bold">Final Price</Typography>
                      <Typography variant="h4" fontWeight="bold" color="error">₹{viewPackage.price.toLocaleString()}</Typography>
                      <Typography variant="caption" color="textSecondary">(No discounts applied)</Typography>
                    </Box>
                  </Grid>
                  {viewPackage.advanceBookingAmount && (
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <AttachMoney color="primary" />
                        <Typography><strong>Advance Booking:</strong> {viewPackage.advanceBookingAmount}</Typography>
                      </Box>
                    </Grid>
                  )}
                  {viewPackage.cancellationPolicy && (
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="flex-start" gap={2} mt={2}>
                        <Policy color="warning" />
                        <Box>
                          <Typography fontWeight="bold" color="warning.main">Cancellation Policy</Typography>
                          <Typography variant="body2">{viewPackage.cancellationPolicy}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}

              {tabValue === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Features</Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Chip icon={<LocationOn />} label={viewPackage.travelToVenue ? "Travel Included" : "No Travel"} color={viewPackage.travelToVenue ? "success" : "default"} />
                      <Chip icon={<CheckCircle />} label={viewPackage.isTopPick ? "Top Pick" : "Regular"} color={viewPackage.isTopPick ? "secondary" : "default"} />
                      <Chip icon={<CheckCircle />} label={viewPackage.isActive ? "Active" : "Inactive"} color={viewPackage.isActive ? "success" : "error"} />
                    </Stack>
                  </Grid>

                  {/* GALLERY IMAGES - FIXED */}
                  {viewPackage.gallery.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>Gallery</Typography>
                      <Grid container spacing={2}>
                        {viewPackage.gallery.map((img, i) => (
                          <Grid item key={i}>
                            <img
                              src={fixImageUrl(img)}
                              alt={`Gallery ${i + 1}`}
                              style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                              onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  )}

                  {viewPackage.includedServices.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Included Services</Typography>
                      {viewPackage.includedServices.map((service, i) => (
                        <Box key={i} sx={{ mb: 3, p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                          <Typography fontWeight="bold" color="primary">{service.title}</Typography>
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {service.items.map((item, j) => (
                              <Chip key={j} label={item} size="small" color="info" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Grid>
                  )}
                </Grid>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', justifyContent: 'space-between' }}>
          <Button variant="outlined" startIcon={<Edit />} onClick={() => { setOpenViewDialog(false); handleEditClick(viewPackage); }}>
            Edit Package
          </Button>
          <Button variant="contained" color="error" onClick={() => setOpenViewDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT DIALOG - GALLERY IMAGES FIXED */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: '#bb1010ff', color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Edit Photography Package</Typography>
            <IconButton onClick={() => setOpenEditDialog(false)} sx={{ color: 'white' }}><Close /></IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: '#f9f9f9' }}>
          {editingPackage && (
            <>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Basic Info" />
                <Tab label="Add-ons & Services" />
                <Tab label="Pricing & Policy" />
                <Tab label="Gallery" />
              </Tabs>

              {tabValue === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Current Gallery</Typography>
                  {editingPackage.gallery.length > 0 ? (
                    <Grid container spacing={3}>
                      {editingPackage.gallery.map((img, i) => (
                        <Grid item key={i}>
                          <img
                            src={API_BASE_URL + img}
                            alt={`Gallery ${i + 1}`}
                            style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 12, boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}
                            onError={e => e.target.src = 'https://via.placeholder.com/200?text=No+Image'}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography color="textSecondary">No images uploaded</Typography>
                  )}
                </Box>
              )}

              {/* Other tabs (Basic Info, Add-ons, Pricing) remain unchanged */}
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <TextField fullWidth label="Package Title" value={editingPackage.packageTitle}
                      onChange={e => setEditingPackage({ ...editingPackage, packageTitle: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth label="Price (₹)" type="number" value={editingPackage.price}
                      onChange={e => setEditingPackage({ ...editingPackage, price: e.target.value })} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth multiline rows={4} label="Description" value={editingPackage.description}
                      onChange={e => setEditingPackage({ ...editingPackage, description: e.target.value })} />
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Basic Add-ons</Typography>
                  <Grid container spacing={2}>
                    {Object.entries(addonLabels).map(([key, label]) => (
                      <Grid item xs={6} md={4} key={key}>
                        <FormControlLabel
                          control={<Checkbox checked={editingPackage.basicAddons.includes(key)}
                            onChange={e => {
                              const checked = e.target.checked;
                              setEditingPackage(prev => ({
                                ...prev,
                                basicAddons: checked ? [...prev.basicAddons, key] : prev.basicAddons.filter(a => a !== key)
                              }));
                            }} />}
                          label={label}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Included Services</Typography>
                  {editingPackage.includedServices.map((service, idx) => (
                    <Box key={idx} sx={{ p: 3, mb: 3, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={10}>
                          <TextField fullWidth label="Service Title" value={service.title}
                            onChange={e => {
                              const newS = [...editingPackage.includedServices];
                              newS[idx].title = e.target.value;
                              setEditingPackage({ ...editingPackage, includedServices: newS });
                            }} />
                        </Grid>
                        <Grid item xs={2}>
                          <IconButton color="error" onClick={() => setEditingPackage(prev => ({
                            ...prev,
                            includedServices: prev.includedServices.filter((_, i) => i !== idx)
                          }))}>
                            <Remove />
                          </IconButton>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth multiline label="Items (comma separated)" value={service.items.join(', ')}
                            onChange={e => {
                              const newS = [...editingPackage.includedServices];
                              newS[idx].items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setEditingPackage({ ...editingPackage, includedServices: newS });
                            }} />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  <Button startIcon={<Add />} variant="outlined" onClick={() => setEditingPackage(prev => ({
                    ...prev,
                    includedServices: [...prev.includedServices, { title: '', items: [] }]
                  }))}>
                    Add Service
                  </Button>
                </Box>
              )}

              {tabValue === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Advance Booking Amount" value={editingPackage.advanceBookingAmount}
                      onChange={e => setEditingPackage({ ...editingPackage, advanceBookingAmount: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel control={<Checkbox checked={editingPackage.travelToVenue}
                      onChange={e => setEditingPackage({ ...editingPackage, travelToVenue: e.target.checked })} />}
                      label="Travel to Venue Included" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth multiline rows={4} label="Cancellation Policy" value={editingPackage.cancellationPolicy}
                      onChange={e => setEditingPackage({ ...editingPackage, cancellationPolicy: e.target.value })} />
                  </Grid>
                </Grid>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: '#f0f2f5', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary" startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            onClick={handleSaveEdit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Package?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{packageToDelete?.packageTitle}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </TableContainer>
  );
};

export default PhotographyList;
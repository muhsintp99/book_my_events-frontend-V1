import React, { useState, useEffect, useCallback } from 'react';
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
  MenuItem,
  TextField,
  InputAdornment,
  Button,
  Menu,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  Tabs,
  Tab,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  Stack,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  VisibilityOutlined,
  Edit,
  Delete,
  Download,
  Save,
  Close,
  Diamond,
  AttachMoney,
  Tag,
  People,
  Web,
  Phone,
  Email,
  Category as CategoryIcon,
  Add as AddIcon,
  CloudUpload,

} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getApiImageUrl } from '../utils/apiImageUtils';
import { getAllVendors, formatVendorsForList } from '../api/providerApi';

const OrnamentsList = () => {
  const navigate = useNavigate();

  /* ---------- State ---------- */
  const [ornaments, setOrnaments] = useState([]);
  const [allOrnaments, setAllOrnaments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [ornamentToDelete, setOrnamentToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // View Dialog
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedOrnament, setSelectedOrnament] = useState(null);

  // Edit Dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingOrnament, setEditingOrnament] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // Add Dialog
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    description: '',
    unit: '',
    weight: 1,
    material: '',
    buyPricing: { unitPrice: 0, discountType: 'none', discountValue: 0, tax: 0 },
    availabilityMode: 'purchase',
    category: '',
    subCategory: '',
    provider: '',
    isActive: true
  });
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [dependenciesLoading, setDependenciesLoading] = useState(false);

  /* ---------- API ---------- */
  // API_BASE_URL is now imported from apiImageUtils
  const API_URL = `${API_BASE_URL}/ornaments`;

  const getToken = () => {
    try { return localStorage.getItem('token') || sessionStorage.getItem('token'); }
    catch { return null; }
  };

  const getFetchOptions = (method = 'GET', body = null) => {
    const token = getToken();
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      mode: 'cors',
    };
    if (token) opts.headers.Authorization = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);
    return opts;
  };

  const makeAPICall = async (url, options, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) {
          const txt = await res.text();
          if (res.status === 401) throw new Error('Authentication required');
          if (res.status === 403) throw new Error('Forbidden');
          if (res.status === 404) throw new Error('Not found');
          if (res.status >= 500) throw new Error('Server error');
          throw new Error(`HTTP ${res.status}: ${txt}`);
        }
        return await res.json();
      } catch (e) {
        if (i === retries) throw e;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  };

  /* ---------- Currency ---------- */
  const AED_TO_INR = 22.8; // 1 AED ≈ 22.8 INR
  const toINR = (aed) => Math.round(aed * AED_TO_INR);

  /* ---------- Mapping ---------- */
  const mapOrnament = (c, idx) => ({
    id: idx + 1,
    _id: c._id,
    ornamentId: c.ornamentId,
    title: c.name || 'Untitled',
    description: c.description || '',
    unit: c.unit || '',
    weight: c.weight ?? 0,
    material: c.material || '',
    price: c.buyPricing?.totalPrice ?? 0,
    providerName:
      c.provider?.firstName && c.provider?.lastName
        ? `${c.provider.firstName} ${c.provider.lastName}`
        : c.provider?.firstName || '—',
    providerEmail: c.provider?.email || '',
    isActive: c.isActive ?? false,
    thumbnail: c.thumbnail || '',
    galleryImages: c.galleryImages || [],
    availabilityMode: c.availabilityMode || 'purchase',
    buyPricing: c.buyPricing || {},
    rentalPricing: c.rentalPricing || {},
    stock: c.stock || {},
    shipping: c.shipping || {},
    occasions: c.occasions || [],
    features: c.features || {},
    tags: c.tags || [],
    rawOrnament: c,
  });

  /* ---------- Fetch ---------- */
  const fetchOrnaments = async (topPicks = false) => {
    try {
      setLoading(true);
      const url = topPicks ? `${API_URL}/top-picks` : API_URL;
      const data = await makeAPICall(url, getFetchOptions());
      if (data?.data && Array.isArray(data.data)) {
        const mapped = data.data.map((c, i) => mapOrnament(c, i));
        setAllOrnaments(mapped);
        setOrnaments(mapped);
      }
    } catch (e) {
      setNotification({ open: true, message: `Error: ${e.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Fetch Dependencies ---------- */
  const fetchDependencies = async () => {
    try {
      setDependenciesLoading(true);
      const [vData, cData] = await Promise.all([
        getAllVendors(),
        fetch(`${API_BASE_URL}/categories`).then(r => r.json())
      ]);

      if (vData?.success) {
        const formatted = formatVendorsForList(vData.data);
        // Filter for Ornaments module vendors if possible, but for now show all who might be relevant
        setProviders(formatted.filter(v => (v.module || '').toLowerCase().includes('ornament')));
      }

      if (cData) {
        const cats = Array.isArray(cData) ? cData : cData.data || [];
        // Filter for Ornaments module categories
        setCategories(cats.filter(c => {
          const modTitle = c.module?.title || '';
          return modTitle.toLowerCase().includes('ornament');
        }));
      }
    } catch (e) {
      console.error('Error fetching dependencies:', e);
    } finally {
      setDependenciesLoading(false);
    }
  };

  const handleAddClick = () => {
    fetchDependencies();
    setOpenAddDialog(true);
  };

  useEffect(() => { fetchOrnaments(); }, []);

  /* ---------- Toggles ---------- */
  const handleTopPickToggle = useCallback(async (_id) => {
    const key = `${_id}-topPick`;
    if (toggleLoading[key]) return;
    const item = ornaments.find(c => c._id === _id);
    if (!item) return;
    const newVal = !item.isTopPick;
    setToggleLoading(p => ({ ...p, [key]: true }));
    setOrnaments(p => p.map(c => c._id === _id ? { ...c, isTopPick: newVal } : c));
    setAllOrnaments(p => p.map(c => c._id === _id ? { ...c, isTopPick: newVal } : c));
    try {
      const res = await makeAPICall(`${API_URL}/${_id}/toggle-top-pick`, getFetchOptions('PATCH'));
      if (!res.success) throw new Error(res.message || 'Failed');
      setNotification({ open: true, message: res.data.isTopPick ? 'Top-pick enabled' : 'Top-pick disabled', severity: 'success' });
    } catch (e) {
      setOrnaments(p => p.map(c => c._id === _id ? { ...c, isTopPick: !newVal } : c));
      setAllOrnaments(p => p.map(c => c._id === _id ? { ...c, isTopPick: !newVal } : c));
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setToggleLoading(p => { const n = { ...p }; delete n[key]; return n; });
    }
  }, [ornaments, toggleLoading]);

  const handleStatusToggle = useCallback(async (_id) => {
    const key = `${_id}-status`;
    if (toggleLoading[key]) return;
    const item = ornaments.find(c => c._id === _id);
    if (!item) return;
    const newVal = !item.isActive;
    setToggleLoading(p => ({ ...p, [key]: true }));
    setOrnaments(p => p.map(c => c._id === _id ? { ...c, isActive: newVal } : c));
    setAllOrnaments(p => p.map(c => c._id === _id ? { ...c, isActive: newVal } : c));
    try {
      const res = await makeAPICall(`${API_URL}/${_id}/toggle-active`, getFetchOptions('PATCH'));
      if (!res.success) throw new Error(res.message || 'Failed');
      setNotification({ open: true, message: res.data.isActive ? 'Activated' : 'Deactivated', severity: 'success' });
    } catch (e) {
      setOrnaments(p => p.map(c => c._id === _id ? { ...c, isActive: !newVal } : c));
      setAllOrnaments(p => p.map(c => c._id === _id ? { ...c, isActive: !newVal } : c));
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setToggleLoading(p => { const n = { ...p }; delete n[key]; return n; });
    }
  }, [ornaments, toggleLoading]);

  /* ---------- Delete ---------- */
  const handleDeleteClick = item => { setOrnamentToDelete(item); setOpenDeleteDialog(true); };
  const handleDeleteConfirm = async () => {
    try {
      await makeAPICall(`${API_URL}/${ornamentToDelete._id}`, getFetchOptions('DELETE'));
      setOrnaments(p => p.filter(c => c._id !== ornamentToDelete._id));
      setAllOrnaments(p => p.filter(c => c._id !== ornamentToDelete._id));
      setNotification({ open: true, message: `${ornamentToDelete.title} deleted`, severity: 'success' });
    } catch (e) {
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setOpenDeleteDialog(false); setOrnamentToDelete(null);
    }
  };

  /* ---------- Export (INR) ---------- */
  const filtered = ornaments.filter(c =>
    `${c.title} ${c.providerName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['Sl', 'Name', 'Provider', 'Provider Email', 'Availability', 'Price (INR)', 'Weight (g)', 'Status'];
    const rows = filtered.map(c => [
      c.id, `"${c.title}"`, `"${c.providerName}"`, `"${c.providerEmail}"`, c.availabilityMode, toINR(c.price),
      c.weight, c.isActive ? 'Active' : 'Inactive'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ornaments_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    setAnchorEl(null);
    setNotification({ open: true, message: 'CSV exported', severity: 'success' });
  };

  const exportExcel = () => {
    const headers = ['Sl', 'Name', 'Provider', 'Provider Email', 'Availability', 'Price (INR)', 'Weight (g)', 'Status'];
    const html = `<table border="1"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${filtered.map(c => `<tr>
      <td>${c.id}</td><td>${c.title}</td><td>${c.providerName}</td><td>${c.providerEmail}</td><td>${c.availabilityMode}</td><td>${toINR(c.price)}</td>
      <td>${c.weight}</td><td>${c.isActive ? 'Active' : 'Inactive'}</td>
    </tr>`).join('')}</tbody></table>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ornaments_${new Date().toISOString().split('T')[0]}.xls`; a.click();
    setAnchorEl(null);
    setNotification({ open: true, message: 'Excel exported', severity: 'success' });
  };

  /* ---------- View ---------- */
  const handleView = item => {
    setSelectedOrnament(item.rawOrnament);
    setOpenViewDialog(true);
  };

  /* ---------- Edit ---------- */
  const handleEdit = item => {
    const r = item.rawOrnament;
    setEditingOrnament(item);
    setEditFormData({
      name: r.name || '',
      description: r.description || '',
      unit: r.unit || '',
      weight: r.weight || 0,
      material: r.material || '',
      buyPricing: r.buyPricing || {},
      rentalPricing: r.rentalPricing || {},
      stock: r.stock || {},
      shipping: r.shipping || {},
    });
    setCurrentTab(0);
    setOpenEditDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      setSaveLoading(true);
      const payload = { ...editFormData };
      const data = await makeAPICall(`${API_BASE_URL}/ornaments/${editingOrnament._id}`, getFetchOptions('PUT', payload));
      if (data.success) {
        const updated = mapOrnament(data.data, editingOrnament.id - 1);
        setOrnaments(p => p.map(x => x._id === editingOrnament._id ? updated : x));
        setAllOrnaments(p => p.map(x => x._id === editingOrnament._id ? updated : x));
        setNotification({ open: true, message: 'Ornament updated', severity: 'success' });
        setOpenEditDialog(false);
      }
    } catch (e) {
      setNotification({ open: true, message: e.message || 'Update failed', severity: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };

  /* ---------- Add Logic ---------- */
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryImages(prev => [...prev, ...files]);
  };

  const handleSubmitAdd = async () => {
    if (!addFormData.name || !addFormData.category || !addFormData.provider || !thumbnail) {
      setNotification({ open: true, message: 'Please fill name, category, provider and thumbnail', severity: 'warning' });
      return;
    }

    try {
      setSaveLoading(true);
      const formData = new FormData();
      formData.append('name', addFormData.name);
      formData.append('description', addFormData.description);
      formData.append('unit', addFormData.unit);
      formData.append('weight', addFormData.weight);
      formData.append('material', addFormData.material);
      formData.append('availabilityMode', addFormData.availabilityMode);
      formData.append('category', addFormData.category);
      formData.append('subCategory', addFormData.subCategory);
      formData.append('provider', addFormData.provider);
      formData.append('isActive', addFormData.isActive);
      formData.append('buyPricing', JSON.stringify(addFormData.buyPricing));

      // Get Ornament Module ID
      const moduleRes = await fetch(`${API_BASE_URL}/modules`).then(r => r.json());
      const ornamentModule = (moduleRes.data || moduleRes).find(m => m.title.toLowerCase().includes('ornament'));
      if (ornamentModule) formData.append('module', ornamentModule._id);

      formData.append('thumbnail', thumbnail);
      galleryImages.forEach(img => formData.append('galleryImages', img));

      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/ornaments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add');

      setNotification({ open: true, message: 'Ornament added successfully!', severity: 'success' });
      setOpenAddDialog(false);

      // Reset form
      setAddFormData({
        name: '', description: '', unit: '', weight: 1, material: '',
        buyPricing: { unitPrice: 0, discountType: 'none', discountValue: 0, tax: 0 },
        availabilityMode: 'purchase', category: '', subCategory: '', provider: '', isActive: true
      });
      setThumbnail(null); setThumbnailPreview(null); setGalleryImages([]);

      fetchOrnaments();
    } catch (e) {
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };



  /* ---------- Stats ---------- */
  const stats = {
    total: allOrnaments.length,
    active: allOrnaments.filter(c => c.isActive).length,
    inactive: allOrnaments.filter(c => !c.isActive).length,
    topPick: allOrnaments.filter(c => c.isTopPick).length,
  };

  return (
    <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      {/* Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', p: 2, bgcolor: '#f5f5f5', gap: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ bgcolor: '#e3f2fd', p: 1, borderRadius: 1 }}>Total: {stats.total}</Box>
          <Box sx={{ bgcolor: '#fff3e0', p: 1, borderRadius: 1 }}>Active: {stats.active}</Box>
          <Box sx={{ bgcolor: '#e0f7fa', p: 1, borderRadius: 1 }}>Inactive: {stats.inactive}</Box>
          <Box sx={{ bgcolor: '#fce4ec', p: 1, borderRadius: 1 }}>Top-Pick: {stats.topPick}</Box>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="success" size="small" startIcon={<AddIcon />} onClick={handleAddClick}>
            Add Ornament
          </Button>
          <Button variant="contained" color="secondary" size="small" onClick={() => fetchOrnaments(true)} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Top-Picks'}
          </Button>
        </Stack>
      </Box>

      {/* Search & Export */}
      <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, bgcolor: '#f5f5f5' }}>
        <TextField
          placeholder="Search Package / Provider"
          size="small"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start">Search</InputAdornment> }}
          sx={{ bgcolor: 'white', minWidth: 220 }}
        />
        <Button variant="contained" color="primary" size="small" endIcon={<Download />} onClick={e => setAnchorEl(e.currentTarget)}>
          Export
        </Button>
        <Menu anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={exportExcel}>Excel</MenuItem>
          <MenuItem onClick={exportCSV}>CSV</MenuItem>
        </Menu>
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>Loading ornaments...</Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 560, overflowY: 'auto' }}>
          <Table stickyHeader sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Sl</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Material</TableCell>
                <TableCell>Weight</TableCell>
                <TableCell>Price (INR)</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Availability</TableCell>
                <TableCell>Top-Pick</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography color="textSecondary">No ornaments found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(c => {
                  const topKey = `${c._id}-topPick`;
                  const statKey = `${c._id}-status`;
                  return (
                    <TableRow key={c._id} hover>
                      <TableCell>{c.id}</TableCell>
                      <TableCell sx={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</TableCell>
                      <TableCell>{c.material}</TableCell>
                      <TableCell>{c.weight}g</TableCell>
                      <TableCell>{toINR(c.price)}</TableCell>
                      <TableCell>{c.providerName}</TableCell>
                      <TableCell>{c.availabilityMode}</TableCell>
                      <TableCell>
                        <Switch size="small" checked={c.isTopPick} onChange={() => handleTopPickToggle(c._id)} disabled={toggleLoading[topKey]} />
                        {toggleLoading[topKey] && <CircularProgress size={14} sx={{ ml: 0.5 }} />}
                      </TableCell>
                      <TableCell>
                        <Switch size="small" checked={c.isActive} onChange={() => handleStatusToggle(c._id)} disabled={toggleLoading[statKey]} />
                        {toggleLoading[statKey] && <CircularProgress size={14} sx={{ ml: 0.5 }} />}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton size="small" color="info" onClick={() => handleView(c)} title="View"><VisibilityOutlined /></IconButton>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(c)} title="Edit"><Edit /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(c)} title="Delete"><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* ---------- VIEW DIALOG (INR) ---------- */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6">{selectedOrnament?.name || 'Ornament Details'}</Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrnament && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom><CategoryIcon fontSize="small" /> Name</Typography>
                <Typography paragraph>{selectedOrnament.name}</Typography>

                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Material</Typography>
                <Typography paragraph>{selectedOrnament.material || '—'}</Typography>

                <Typography variant="subtitle2" color="textSecondary" gutterBottom><AttachMoney fontSize="small" /> Price (INR)</Typography>
                <Typography>₹{toINR(selectedOrnament.buyPricing?.totalPrice || 0)}</Typography>

                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Weight</Typography>
                <Typography>{selectedOrnament.weight}g</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom><People fontSize="small" /> Provider</Typography>
                <Typography>{selectedOrnament.provider?.firstName} {selectedOrnament.provider?.lastName}</Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Phone fontSize="small" /> {selectedOrnament.provider?.phone || '—'}
                </Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Email fontSize="small" /> {selectedOrnament.provider?.email || '—'}
                </Typography>
              </Grid>

              {selectedOrnament.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>Description</Typography>
                  <Typography paragraph>{selectedOrnament.description}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)} variant="outlined">Close</Button>
          <Button onClick={() => { setOpenViewDialog(false); handleEdit({ rawOrnament: selectedOrnament }); }} variant="contained" startIcon={<Edit />}>Edit</Button>
        </DialogActions>
      </Dialog>

      {/* ---------- EDIT DIALOG ---------- */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6">Edit Ornament: {editingOrnament?.title}</Typography>
        </DialogTitle>
        <DialogContent dividers>
          {editingOrnament && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Name" value={editFormData.name || ''} onChange={e => setEditFormData(p => ({ ...p, name: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Material" value={editFormData.material || ''} onChange={e => setEditFormData(p => ({ ...p, material: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Weight (g)" type="number" value={editFormData.weight || 0} onChange={e => setEditFormData(p => ({ ...p, weight: Number(e.target.value) }))} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Description" multiline rows={3} value={editFormData.description || ''} onChange={e => setEditFormData(p => ({ ...p, description: e.target.value }))} />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} disabled={saveLoading}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary" disabled={saveLoading}>
            {saveLoading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- ADD DIALOG ---------- */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'success.main', color: 'white' }}>
          <Typography variant="h6">Add New Ornament</Typography>
        </DialogTitle>
        <DialogContent dividers>
          {dependenciesLoading ? (
            <Box sx={{ textAlign: 'center', p: 3 }}><CircularProgress /><Typography>Loading providers and categories...</Typography></Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Name" value={addFormData.name} onChange={e => setAddFormData({ ...addFormData, name: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Provider</InputLabel>
                  <Select value={addFormData.provider} label="Provider" onChange={e => setAddFormData({ ...addFormData, provider: e.target.value })}>
                    {providers.map(v => <MenuItem key={v.vendorId} value={v.vendorId}>{v.name} ({v.email})</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select value={addFormData.category} label="Category" onChange={e => setAddFormData({ ...addFormData, category: e.target.value })}>
                    {categories.filter(c => !c.parentCategory).map(c => <MenuItem key={c._id} value={c._id}>{c.title || c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Availability Mode</InputLabel>
                  <Select value={addFormData.availabilityMode} label="Availability Mode" onChange={e => setAddFormData({ ...addFormData, availabilityMode: e.target.value })}>
                    <MenuItem value="purchase">Purchase</MenuItem>
                    <MenuItem value="rental">Rental</MenuItem>
                    <MenuItem value="all">All</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Material" value={addFormData.material} onChange={e => setAddFormData({ ...addFormData, material: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Weight (g)" type="number" value={addFormData.weight} onChange={e => setAddFormData({ ...addFormData, weight: Number(e.target.value) })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Unit Price (AED)" type="number" value={addFormData.buyPricing.unitPrice} onChange={e => setAddFormData({ ...addFormData, buyPricing: { ...addFormData.buyPricing, unitPrice: Number(e.target.value) } })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Description" multiline rows={3} value={addFormData.description} onChange={e => setAddFormData({ ...addFormData, description: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Button variant="outlined" component="label" fullWidth startIcon={<CloudUpload />}>
                  {thumbnail ? thumbnail.name : 'Upload Thumbnail *'}
                  <input type="file" hidden accept="image/*" onChange={handleThumbnailChange} />
                </Button>
                {thumbnailPreview && <Box sx={{ mt: 1 }}><img src={thumbnailPreview} alt="Preview" style={{ width: 100, height: 100, objectFit: 'cover' }} /></Box>}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} disabled={saveLoading}>Cancel</Button>
          <Button onClick={handleSubmitAdd} variant="contained" color="success" disabled={saveLoading || dependenciesLoading}>
            {saveLoading ? <CircularProgress size={24} /> : 'Add Ornament'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- DELETE DIALOG ---------- */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle color="error">Confirm Delete</DialogTitle>
        <DialogContent><DialogContentText>Delete <strong>{ornamentToDelete?.title}</strong>? This cannot be undone.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* ---------- SNACKBAR ---------- */}
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setNotification(p => ({ ...p, open: false }))} severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </TableContainer>
  );
};

export default OrnamentsList;
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
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Divider
} from '@mui/material';
import {
  VisibilityOutlined,
  Edit,
  Delete,
  Download,
  People,
  Phone,
  Email,
  Category as CategoryIcon,
  Add as AddIcon,
  CloudUpload,
  AttachMoney,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getApiImageUrl } from '../utils/apiImageUtils';
import { getAllVendors, formatVendorsForList } from '../api/providerApi';

const BouncerList = () => {
  const navigate = useNavigate();

  /* ---------- State ---------- */
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // View Dialog
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Edit Dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  // Add Dialog
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addFormData, setAddFormData] = useState({
    packageName: '',
    description: '',
    packagePrice: 0,
    advanceBookingAmount: 0,
    category: '',
    provider: '',
    isActive: true
  });
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dependenciesLoading, setDependenciesLoading] = useState(false);

  /* ---------- API ---------- */
  const API_URL = `${API_BASE_URL}/bouncers-security`;

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
          throw new Error(`HTTP ${res.status}: ${txt}`);
        }
        return await res.json();
      } catch (e) {
        if (i === retries) throw e;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  };

  /* ---------- Mapping ---------- */
  const mapItem = (c, idx) => ({
    id: idx + 1,
    _id: c._id,
    packageId: c.packageId,
    title: c.packageName || 'Untitled',
    description: c.description || '',
    price: c.packagePrice ?? 0,
    advanceBookingAmount: c.advanceBookingAmount ?? 0,
    providerName:
      c.provider?.firstName && c.provider?.lastName
        ? `${c.provider.firstName} ${c.provider.lastName}`
        : c.provider?.firstName || '—',
    providerEmail: c.provider?.email || '',
    isActive: c.isActive ?? false,
    isTopPick: c.isTopPick ?? false,
    image: c.image || '',
    rawItem: c,
  });

  /* ---------- Fetch ---------- */
  const fetchItems = async (topPicks = false) => {
    try {
      setLoading(true);
      const url = topPicks ? `${API_URL}/top-picks` : API_URL;
      const data = await makeAPICall(url, getFetchOptions());
      if (data?.data && Array.isArray(data.data)) {
        const mapped = data.data.map((c, i) => mapItem(c, i));
        setAllItems(mapped);
        setItems(mapped);
      }
    } catch (e) {
      setNotification({ open: true, message: `Error: ${e.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      setDependenciesLoading(true);
      const [vData, cData] = await Promise.all([
        getAllVendors(),
        fetch(`${API_BASE_URL}/categories`).then(r => r.json())
      ]);

      if (vData?.success) {
        const formatted = formatVendorsForList(vData.data);
        setProviders(formatted.filter(v => 
          (v.module || '').toLowerCase().includes('bouncer') || 
          (v.module || '').toLowerCase().includes('security')
        ));
      }

      if (cData) {
        const cats = Array.isArray(cData) ? cData : cData.data || [];
        setCategories(cats.filter(c => {
          const modTitle = (c.module?.title || '').toLowerCase();
          return modTitle.includes('bouncer') || modTitle.includes('security');
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

  useEffect(() => { fetchItems(); }, []);

  /* ---------- Toggles ---------- */
  const handleTopPickToggle = useCallback(async (_id) => {
    const key = `${_id}-topPick`;
    if (toggleLoading[key]) return;
    const item = items.find(c => c._id === _id);
    if (!item) return;
    const newVal = !item.isTopPick;
    setToggleLoading(p => ({ ...p, [key]: true }));
    setItems(p => p.map(c => c._id === _id ? { ...c, isTopPick: newVal } : c));
    try {
      const res = await makeAPICall(`${API_URL}/${_id}/toggle-top-pick`, getFetchOptions('PATCH'));
      if (!res.success) throw new Error(res.message || 'Failed');
      setNotification({ open: true, message: res.data.isTopPick ? 'Top-pick enabled' : 'Top-pick disabled', severity: 'success' });
    } catch (e) {
      setItems(p => p.map(c => c._id === _id ? { ...c, isTopPick: !newVal } : c));
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setToggleLoading(p => { const n = { ...p }; delete n[key]; return n; });
    }
  }, [items, toggleLoading, API_URL]);

  const handleStatusToggle = useCallback(async (_id) => {
    const key = `${_id}-status`;
    if (toggleLoading[key]) return;
    const item = items.find(c => c._id === _id);
    if (!item) return;
    const newVal = !item.isActive;
    setToggleLoading(p => ({ ...p, [key]: true }));
    setItems(p => p.map(c => c._id === _id ? { ...c, isActive: newVal } : c));
    try {
      const res = await makeAPICall(`${API_URL}/${_id}/toggle-active`, getFetchOptions('PATCH'));
      if (!res.success) throw new Error(res.message || 'Failed');
      setNotification({ open: true, message: res.data.isActive ? 'Activated' : 'Deactivated', severity: 'success' });
    } catch (e) {
      setItems(p => p.map(c => c._id === _id ? { ...c, isActive: !newVal } : c));
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setToggleLoading(p => { const n = { ...p }; delete n[key]; return n; });
    }
  }, [items, toggleLoading, API_URL]);

  /* ---------- Delete ---------- */
  const handleDeleteClick = item => { setItemToDelete(item); setOpenDeleteDialog(true); };
  const handleDeleteConfirm = async () => {
    try {
      await makeAPICall(`${API_URL}/${itemToDelete._id}`, getFetchOptions('DELETE'));
      setItems(p => p.filter(c => c._id !== itemToDelete._id));
      setNotification({ open: true, message: `${itemToDelete.title} deleted`, severity: 'success' });
    } catch (e) {
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setOpenDeleteDialog(false); setItemToDelete(null);
    }
  };

  /* ---------- Search & Filtering ---------- */
  const filteredResult = items.filter(c =>
    `${c.title} ${c.providerName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ---------- Export ---------- */
  const exportCSV = () => {
    const headers = ['Sl', 'Package Name', 'Provider', 'Price', 'Advance Amount', 'Status'];
    const rows = filteredResult.map(c => [
      c.id, `"${c.title}"`, `"${c.providerName}"`, c.price, c.advanceBookingAmount, c.isActive ? 'Active' : 'Inactive'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bouncer_packages_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setAnchorEl(null);
  };

  const exportExcel = () => {
    const headers = ['Sl', 'Package Name', 'Provider', 'Price', 'Advance Amount', 'Status'];
    const html = `<table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${filteredResult.map(c => `<tr><td>${c.id}</td><td>${c.title}</td><td>${c.providerName}</td><td>${c.price}</td><td>${c.advanceBookingAmount}</td><td>${c.isActive ? 'Active' : 'Inactive'}</td></tr>`).join('')}</table>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bouncer_packages_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    setAnchorEl(null);
  };

  /* ---------- View & Edit ---------- */
  const handleView = item => { setSelectedItem(item.rawItem); setOpenViewDialog(true); };

  const handleEdit = item => {
    const r = item.rawItem;
    setEditingItem(item);
    setEditFormData({
      packageName: r.packageName || '',
      description: r.description || '',
      packagePrice: r.packagePrice || 0,
      advanceBookingAmount: r.advanceBookingAmount || 0,
    });
    setOpenEditDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      setSaveLoading(true);
      const data = await makeAPICall(`${API_URL}/${editingItem._id}`, getFetchOptions('PUT', editFormData));
      if (data.success) {
        setNotification({ open: true, message: 'Updated successfully', severity: 'success' });
        fetchItems();
        setOpenEditDialog(false);
      }
    } catch (e) {
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };

  /* ---------- Add Logic ---------- */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitAdd = async () => {
    if (!addFormData.packageName || !addFormData.provider || !addFormData.category) {
      setNotification({ open: true, message: 'Please fill name, provider and category', severity: 'warning' });
      return;
    }
    try {
      setSaveLoading(true);
      const formData = new FormData();
      Object.entries(addFormData).forEach(([k, v]) => formData.append(k, v));
      
      const moduleRes = await fetch(`${API_BASE_URL}/modules`).then(r => r.json());
      const mod = (moduleRes.data || moduleRes).find(m => 
        (m.title || '').toLowerCase().includes('bouncer') || 
        (m.title || '').toLowerCase().includes('security')
      );
      if (mod) formData.append('secondaryModule', mod._id);
      
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Add failed');

      setNotification({ open: true, message: 'Package added!', severity: 'success' });
      setOpenAddDialog(false);
      fetchItems();
      setAddFormData({ packageName: '', description: '', packagePrice: 0, advanceBookingAmount: 0, category: '', provider: '', isActive: true });
      setImageFile(null); setImagePreview(null);
    } catch (e) {
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };

  /* ---------- Render ---------- */
  const stats = {
    total: allItems.length,
    active: allItems.filter(c => c.isActive).length,
    inactive: allItems.filter(c => !c.isActive).length,
    topPick: allItems.filter(c => c.isTopPick).length,
  };

  return (
    <TableContainer component={Paper} sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Bouncers & Security Packages</Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', mb: 2, gap: 1 }}>
        <Stack direction="row" spacing={1}>
          <Chip label={`Total: ${stats.total}`} color="primary" variant="outlined" />
          <Chip label={`Active: ${stats.active}`} color="success" variant="outlined" />
          <Chip label={`Inactive: ${stats.inactive}`} color="default" variant="outlined" />
          <Chip label={`Top-Pick: ${stats.topPick}`} color="secondary" variant="outlined" />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="success" size="small" startIcon={<AddIcon />} onClick={handleAddClick}>
            Add Package
          </Button>
          <Button variant="contained" color="secondary" size="small" onClick={() => fetchItems(true)} disabled={loading}>
            Top-Picks
          </Button>
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1 }}>
        <TextField
          placeholder="Search Package / Provider..."
          size="small"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        <Button variant="outlined" size="small" endIcon={<Download />} onClick={e => setAnchorEl(e.currentTarget)}>Export</Button>
        <Menu anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={exportExcel}>Excel</MenuItem>
          <MenuItem onClick={exportCSV}>CSV</MenuItem>
        </Menu>
      </Box>

      {loading ? (
        <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /><Typography>Loading packages...</Typography></Box>
      ) : (
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>Sl</TableCell>
              <TableCell>Package Name</TableCell>
              <TableCell>Price (₹)</TableCell>
              <TableCell>Advance (₹)</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Top-Pick</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredResult.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center">No packages found</TableCell></TableRow>
            ) : (
              filteredResult.map(c => {
                const topKey = `${c._id}-topPick`;
                const statKey = `${c._id}-status`;
                return (
                  <TableRow key={c._id}>
                    <TableCell>{c.id}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{c.title}</TableCell>
                    <TableCell>{c.price}</TableCell>
                    <TableCell>{c.advanceBookingAmount}</TableCell>
                    <TableCell>{c.providerName}</TableCell>
                    <TableCell>
                      <Switch size="small" checked={c.isTopPick} onChange={() => handleTopPickToggle(c._id)} disabled={toggleLoading[topKey]} />
                    </TableCell>
                    <TableCell>
                      <Switch size="small" checked={c.isActive} onChange={() => handleStatusToggle(c._id)} disabled={toggleLoading[statKey]} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="info" onClick={() => handleView(c)}><VisibilityOutlined /></IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEdit(c)}><Edit /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(c)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      )}

      {/* ---------- VIEW DIALOG ---------- */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Package Details</DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Box component="img" src={getApiImageUrl(selectedItem.image)} sx={{ width: '100%', maxHeight: 250, objectFit: 'contain', borderRadius: 1 }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">{selectedItem.packageName}</Typography>
                <Typography variant="body2" color="textSecondary" paragraph>{selectedItem.description || 'No description provided.'}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2">Price: ₹{selectedItem.packagePrice}</Typography>
                <Typography variant="subtitle2">Advance: ₹{selectedItem.advanceBookingAmount}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2">Provider: {selectedItem.provider?.firstName} {selectedItem.provider?.lastName}</Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Email fontSize="inherit" /> {selectedItem.provider?.email}</Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Phone fontSize="inherit" /> {selectedItem.provider?.phone}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ---------- EDIT DIALOG ---------- */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Package</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Package Name" value={editFormData.packageName || ''} onChange={e => setEditFormData({ ...editFormData, packageName: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Price (₹)" type="number" value={editFormData.packagePrice || 0} onChange={e => setEditFormData({ ...editFormData, packagePrice: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Advance (₹)" type="number" value={editFormData.advanceBookingAmount || 0} onChange={e => setEditFormData({ ...editFormData, advanceBookingAmount: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={3} value={editFormData.description || ''} onChange={e => setEditFormData({ ...editFormData, description: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={saveLoading}>{saveLoading ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {/* ---------- ADD DIALOG ---------- */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Package</DialogTitle>
        <DialogContent dividers>
          {dependenciesLoading ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField fullWidth label="Package Name" value={addFormData.packageName} onChange={e => setAddFormData({ ...addFormData, packageName: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Provider</InputLabel>
                  <Select value={addFormData.provider} label="Provider" onChange={e => setAddFormData({ ...addFormData, provider: e.target.value })}>
                    {providers.map(p => <MenuItem key={p.vendorId} value={p.vendorId}>{p.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select value={addFormData.category} label="Category" onChange={e => setAddFormData({ ...addFormData, category: e.target.value })}>
                    {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Price (₹)" type="number" value={addFormData.packagePrice} onChange={e => setAddFormData({ ...addFormData, packagePrice: Number(e.target.value) })} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Advance (₹)" type="number" value={addFormData.advanceBookingAmount} onChange={e => setAddFormData({ ...addFormData, advanceBookingAmount: Number(e.target.value) })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Description" multiline rows={2} value={addFormData.description} onChange={e => setAddFormData({ ...addFormData, description: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" component="label" fullWidth startIcon={<CloudUpload />}>
                  {imageFile ? imageFile.name : 'Upload Image'}
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
                {imagePreview && <Box component="img" src={imagePreview} sx={{ mt: 1, height: 100, borderRadius: 1 }} />}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitAdd} variant="contained" disabled={saveLoading}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* ---------- DELETE DIALOG ---------- */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Package?</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to delete <strong>{itemToDelete?.title}</strong>?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert severity={notification.severity} variant="filled">{notification.message}</Alert>
      </Snackbar>
    </TableContainer>
  );
};

export default BouncerList;

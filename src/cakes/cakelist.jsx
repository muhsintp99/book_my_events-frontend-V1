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
} from '@mui/material';
import {
  VisibilityOutlined,
  Edit,
  Delete,
  Download,
  Save,
  Close,
  Restaurant,
  AttachMoney,
  Tag,
  People,
  Web,
  Phone,
  Email,
  Category,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/apiImageUtils';

const CateringList = () => {
  const navigate = useNavigate();

  /* ---------- State ---------- */
  const [caterings, setCaterings] = useState([]);
  const [allCaterings, setAllCaterings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [cateringToDelete, setCateringToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // View Dialog
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedCatering, setSelectedCatering] = useState(null);

  // Edit Dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingCatering, setEditingCatering] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  /* ---------- API ---------- */
  // API_BASE_URL is now imported from apiImageUtils
  const API_URL = `${API_BASE_URL}/catering`;

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
  const mapCatering = (c, idx) => ({
    id: idx + 1,
    _id: c._id,
    cateringId: c.cateringId,
    title: c.title || 'Untitled',
    subtitle: c.subtitle || '',
    description: c.description || '',
    cateringType: c.cateringType || '',
    price: c.price ?? 0,
    providerName:
      c.provider?.firstName && c.provider?.lastName
        ? `${c.provider.firstName} ${c.provider.lastName}`
        : c.provider?.firstName || '—',
    providerEmail: c.provider?.email || '',
    includes: (c.includes || [])
      .map(inc => `${inc.title}: ${inc.items.join(', ')}`)
      .join(' | '),
    isTopPick: c.isTopPick ?? false,
    isActive: c.isActive ?? false,
    thumbnail: c.thumbnail || '',
    searchTags: c.searchTags || [],
    faqs: c.faqs || [],
    rawCatering: c,
  });

  /* ---------- Fetch ---------- */
  const fetchCaterings = async (topPicks = false) => {
    try {
      setLoading(true);
      const url = topPicks ? `${API_URL}/top-picks` : API_URL;
      const data = await makeAPICall(url, getFetchOptions());
      if (data?.data && Array.isArray(data.data)) {

        // ✅ FILTER ONLY CAKE MODULE PACKAGES
        const cakeOnly = data.data.filter(c =>
          c.module?.title?.toLowerCase().includes("cake")
        );

        const mapped = cakeOnly.map((c, i) => mapCatering(c, i));

        setAllCaterings(mapped);
        setCaterings(mapped);
      }

    } catch (e) {
      setNotification({ open: true, message: `Error: ${e.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCaterings(); }, []);

  /* ---------- Toggles ---------- */
  const handleTopPickToggle = useCallback(async (_id) => {
    const key = `${_id}-topPick`;
    if (toggleLoading[key]) return;
    const cat = caterings.find(c => c._id === _id);
    if (!cat) return;
    const newVal = !cat.isTopPick;
    setToggleLoading(p => ({ ...p, [key]: true }));
    setCaterings(p => p.map(c => c._id === _id ? { ...c, isTopPick: newVal } : c));
    setAllCaterings(p => p.map(c => c._id === _id ? { ...c, isTopPick: newVal } : c));
    try {
      const res = await makeAPICall(`${API_URL}/${_id}/toggle-top-pick`, getFetchOptions('PATCH'));
      if (!res.success) throw new Error(res.message || 'Failed');
      setNotification({ open: true, message: res.data.isTopPick ? 'Top-pick enabled' : 'Top-pick disabled', severity: 'success' });
    } catch (e) {
      setCaterings(p => p.map(c => c._id === _id ? { ...c, isTopPick: !newVal } : c));
      setAllCaterings(p => p.map(c => c._id === _id ? { ...c, isTopPick: !newVal } : c));
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setToggleLoading(p => { const n = { ...p }; delete n[key]; return n; });
    }
  }, [caterings, toggleLoading]);

  const handleStatusToggle = useCallback(async (_id) => {
    const key = `${_id}-status`;
    if (toggleLoading[key]) return;
    const cat = caterings.find(c => c._id === _id);
    if (!cat) return;
    const newVal = !cat.isActive;
    setToggleLoading(p => ({ ...p, [key]: true }));
    setCaterings(p => p.map(c => c._id === _id ? { ...c, isActive: newVal } : c));
    setAllCaterings(p => p.map(c => c._id === _id ? { ...c, isActive: newVal } : c));
    try {
      const res = await makeAPICall(`${API_URL}/${_id}/toggle-active`, getFetchOptions('PATCH'));
      if (!res.success) throw new Error(res.message || 'Failed');
      setNotification({ open: true, message: res.data.isActive ? 'Activated' : 'Deactivated', severity: 'success' });
    } catch (e) {
      setCaterings(p => p.map(c => c._id === _id ? { ...c, isActive: !newVal } : c));
      setAllCaterings(p => p.map(c => c._id === _id ? { ...c, isActive: !newVal } : c));
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setToggleLoading(p => { const n = { ...p }; delete n[key]; return n; });
    }
  }, [caterings, toggleLoading]);

  /* ---------- Delete ---------- */
  const handleDeleteClick = cat => { setCateringToDelete(cat); setOpenDeleteDialog(true); };
  const handleDeleteConfirm = async () => {
    try {
      await makeAPICall(`${API_URL}/${cateringToDelete._id}`, getFetchOptions('DELETE'));
      setCaterings(p => p.filter(c => c._id !== cateringToDelete._id));
      setAllCaterings(p => p.filter(c => c._id !== cateringToDelete._id));
      setNotification({ open: true, message: `${cateringToDelete.title} deleted`, severity: 'success' });
    } catch (e) {
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setOpenDeleteDialog(false); setCateringToDelete(null);
    }
  };

  /* ---------- Export (INR) ---------- */
  const filtered = caterings.filter(c =>
    `${c.title} ${c.subtitle} ${c.providerName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['Sl', 'Package', 'Subtitle', 'Type', 'Price (INR)', 'Provider', 'Provider Email', 'Includes', 'Top-Pick', 'Status'];
    const rows = filtered.map(c => [
      c.id, `"${c.title}"`, `"${c.subtitle}"`, c.cateringType, toINR(c.price),
      `"${c.providerName}"`, `"${c.providerEmail}"`, `"${c.includes}"`,
      c.isTopPick ? 'Yes' : 'No', c.isActive ? 'Active' : 'Inactive'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `catering_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    setAnchorEl(null);
    setNotification({ open: true, message: 'CSV exported', severity: 'success' });
  };

  const exportExcel = () => {
    const headers = ['Sl', 'Package', 'Subtitle', 'Type', 'Price (INR)', 'Provider', 'Provider Email', 'Includes', 'Top-Pick', 'Status'];
    const html = `<table border="1"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${filtered.map(c => `<tr>
      <td>${c.id}</td><td>${c.title}</td><td>${c.subtitle}</td><td>${c.cateringType}</td><td>${toINR(c.price)}</td>
      <td>${c.providerName}</td><td>${c.providerEmail}</td><td>${c.includes}</td>
      <td>${c.isTopPick ? 'Yes' : 'No'}</td><td>${c.isActive ? 'Active' : 'Inactive'}</td>
    </tr>`).join('')}</tbody></table>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `catering_${new Date().toISOString().split('T')[0]}.xls`; a.click();
    setAnchorEl(null);
    setNotification({ open: true, message: 'Excel exported', severity: 'success' });
  };

  /* ---------- View ---------- */
  const handleView = cat => {
    setSelectedCatering(cat.rawCatering);
    setOpenViewDialog(true);
  };

  /* ---------- Edit ---------- */
  const handleEdit = cat => {
    const r = cat.rawCatering;
    setEditingCatering(cat);
    setEditFormData({
      title: r.title || '',
      subtitle: r.subtitle || '',
      description: r.description || '',
      cateringType: r.cateringType || '',
      price: r.price || 0,
      includes: r.includes || [],
      searchTags: r.searchTags || [],
      faqs: r.faqs || [],
      thumbnail: r.thumbnail || '',
    });
    setCurrentTab(0);
    setOpenEditDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      setSaveLoading(true);
      const payload = { ...editFormData };
      if (payload.includes) {
        payload.includes = payload.includes.filter(inc => inc.title && inc.items?.length);
      }
      const data = await makeAPICall(`${API_URL}/${editingCatering._id}`, getFetchOptions('PUT', payload));
      if (data.success) {
        const updated = mapCatering(data.data, editingCatering.id - 1);
        setCaterings(p => p.map(x => x._id === editingCatering._id ? updated : x));
        setAllCaterings(p => p.map(x => x._id === editingCatering._id ? updated : x));
        setNotification({ open: true, message: 'Catering updated', severity: 'success' });
        setOpenEditDialog(false);
      }
    } catch (e) {
      setNotification({ open: true, message: e.message || 'Update failed', severity: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleIncludeChange = (idx, field, val) => {
    setEditFormData(p => ({
      ...p,
      includes: p.includes.map((inc, i) => i === idx ? { ...inc, [field]: val } : inc)
    }));
  };
  const addInclude = () => setEditFormData(p => ({ ...p, includes: [...(p.includes || []), { title: '', items: [] }] }));
  const removeInclude = idx => setEditFormData(p => ({ ...p, includes: p.includes.filter((_, i) => i !== idx) }));

  /* ---------- Stats ---------- */
  const stats = {
    total: allCaterings.length,
    active: allCaterings.filter(c => c.isActive).length,
    inactive: allCaterings.filter(c => !c.isActive).length,
    topPick: allCaterings.filter(c => c.isTopPick).length,
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
        <Button variant="contained" color="secondary" size="small" onClick={() => fetchCaterings(true)} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Top-Picks'}
        </Button>
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
          <Typography>Loading caterings...</Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 560, overflowY: 'auto' }}>
          <Table stickyHeader sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Sl</TableCell>
                <TableCell>Package</TableCell>
                <TableCell>Subtitle</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Price (INR)</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Includes</TableCell>
                <TableCell>Top-Pick</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography color="textSecondary">No catering packages found</Typography>
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
                      <TableCell>{c.subtitle}</TableCell>
                      <TableCell>{c.cateringType}</TableCell>
                      <TableCell>{toINR(c.price)}</TableCell>
                      <TableCell>{c.providerName}</TableCell>
                      <TableCell sx={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.includes}</TableCell>
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
          <Typography variant="h6">{selectedCatering?.title}</Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedCatering && (
            <Grid container spacing={3}>
              {/* Basic */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom><Category fontSize="small" /> Package</Typography>
                <Typography paragraph>{selectedCatering.title}</Typography>

                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Subtitle</Typography>
                <Typography paragraph>{selectedCatering.subtitle || '—'}</Typography>

                <Typography variant="subtitle2" color="textSecondary" gutterBottom><AttachMoney fontSize="small" /> Price (INR)</Typography>
                <Typography>₹{toINR(selectedCatering.price)}</Typography>

                <Typography variant="subtitle2" color="textSecondary" gutterBottom><Restaurant fontSize="small" /> Type</Typography>
                <Typography>{selectedCatering.cateringType || '—'}</Typography>
              </Grid>

              {/* Provider */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom><People fontSize="small" /> Provider</Typography>
                <Typography>{selectedCatering.provider?.firstName} {selectedCatering.provider?.lastName}</Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Phone fontSize="small" /> {selectedCatering.provider?.phone || '—'}
                </Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Email fontSize="small" /> {selectedCatering.provider?.email || '—'}
                </Typography>
                {selectedCatering.provider?.website && (
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Web fontSize="small" /> <a href={selectedCatering.provider.website} target="_blank" rel="noopener noreferrer">{selectedCatering.provider.website}</a>
                  </Typography>
                )}
              </Grid>

              {/* Includes */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Includes</Typography>
                <List dense>
                  {selectedCatering.includes?.map((inc, i) => (
                    <ListItem key={i} disableGutters>
                      <ListItemText primary={<strong>{inc.title}</strong>} secondary={inc.items.join(', ')} />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Tags */}
              {selectedCatering.searchTags?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>Search Tags</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedCatering.searchTags.map(t => <Chip key={t} label={t} size="small" variant="outlined" />)}
                  </Box>
                </Grid>
              )}

              {/* Description */}
              {selectedCatering.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>Description</Typography>
                  <Typography paragraph>{selectedCatering.description}</Typography>
                </Grid>
              )}

              {/* FAQs */}
              {selectedCatering.faqs?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>FAQs</Typography>
                  <List dense>
                    {selectedCatering.faqs.map((q, i) => (
                      <ListItem key={i}>
                        <ListItemText primary={q.question} secondary={q.answer} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)} variant="outlined">Close</Button>
          <Button onClick={() => { setOpenViewDialog(false); handleEdit({ rawCatering: selectedCatering }); }} variant="contained" startIcon={<Edit />}>Edit</Button>
        </DialogActions>
      </Dialog>

      {/* ---------- EDIT DIALOG (INR Helper) ---------- */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Edit Catering: {editingCatering?.title}</Typography>
          <IconButton size="small" onClick={() => setOpenEditDialog(false)} sx={{ color: 'white' }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Basic" />
            <Tab label="Includes" />
            <Tab label="Other" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Basic */}
            {currentTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}><TextField fullWidth label="Title" value={editFormData.title || ''} onChange={e => setEditFormData(p => ({ ...p, title: e.target.value }))} /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth label="Subtitle" value={editFormData.subtitle || ''} onChange={e => setEditFormData(p => ({ ...p, subtitle: e.target.value }))} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={3} value={editFormData.description || ''} onChange={e => setEditFormData(p => ({ ...p, description: e.target.value }))} /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth label="Type" value={editFormData.cateringType || ''} onChange={e => setEditFormData(p => ({ ...p, cateringType: e.target.value }))} /></Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Price (AED)"
                    type="number"
                    value={editFormData.price || ''}
                    onChange={e => setEditFormData(p => ({ ...p, price: Number(e.target.value) }))}
                    helperText={`≈ ₹${toINR(editFormData.price || 0)}`}
                  />
                </Grid>
              </Grid>
            )}

            {/* Includes */}
            {currentTab === 1 && (
              <Box>
                <Button variant="outlined" size="small" onClick={addInclude} sx={{ mb: 2 }}>Add Include</Button>
                {editFormData.includes?.map((inc, idx) => (
                  <Box key={idx} sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Title" size="small" value={inc.title || ''} onChange={e => handleIncludeChange(idx, 'title', e.target.value)} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Items (comma-separated)" size="small" value={inc.items?.join(', ') || ''} onChange={e => handleIncludeChange(idx, 'items', e.target.value.split(',').map(i => i.trim()).filter(Boolean))} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <IconButton color="error" onClick={() => removeInclude(idx)} size="small"><Delete /></IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            )}

            {/* Other */}
            {currentTab === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete multiple freeSolo options={[]} value={editFormData.searchTags || []}
                    onChange={(e, v) => setEditFormData(p => ({ ...p, searchTags: v }))}
                    renderTags={(v, p) => v.map((o, i) => <Chip key={i} label={o} {...p(i)} />)}
                    renderInput={p => <TextField {...p} label="Search Tags" />} />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setOpenEditDialog(false)} variant="outlined" disabled={saveLoading}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" startIcon={saveLoading ? <CircularProgress size={16} /> : <Save />} disabled={saveLoading}>
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- DELETE DIALOG ---------- */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle color="error">Confirm Delete</DialogTitle>
        <DialogContent><DialogContentText>Delete <strong>{cateringToDelete?.title}</strong>? This cannot be undone.</DialogContentText></DialogContent>
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

export default CateringList;
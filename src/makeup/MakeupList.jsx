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
  Palette,
  AttachMoney,
  Tag,
  People,
  Phone,
  Email,
  Web,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const MakeupList = () => {
  const navigate = useNavigate();

  /* ---------- State ---------- */
  const [makeups, setMakeups] = useState([]);
  const [allMakeups, setAllMakeups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [makeupToDelete, setMakeupToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // View Dialog
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedMakeup, setSelectedMakeup] = useState(null);

  // Edit Dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingMakeup, setEditingMakeup] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  /* ---------- API ---------- */
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.bookmyevent.ae/api';
  const API_URL = `${API_BASE_URL}/makeup-packages`;

  const getToken = () => {
    try {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    } catch {
      return null;
    }
  };

  const getFetchOptions = (method = 'GET', body = null) => {
    const token = getToken();
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
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

        if (!response.ok) {
          const txt = await response.text();
          if (response.status === 401) throw new Error('Authentication required');
          if (response.status === 403) throw new Error('Forbidden');
          if (response.status === 404) throw new Error('Not found');
          if (response.status >= 500) throw new Error('Server error');
          throw new Error(`HTTP ${response.status}: ${txt}`);
        }
        return await response.json();
      } catch (err) {
        if (i === retries) throw err;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  };

  /* ---------- Currency ---------- */
  const AED_TO_INR = 22.8; // 1 AED ≈ 22.8 INR
  const toINR = (aed) => Math.round(aed * AED_TO_INR);

  /* ---------- Mapping ---------- */
  const mapMakeup = (m, idx) => ({
    id: idx + 1,
    _id: m._id,
    makeupId: m.makeupId,
    title: m.packageTitle || 'Untitled',
    description: m.description || '',
    makeupType: m.makeupType || '',
    basePrice: m.basePrice ?? 0,
    offerPrice: m.offerPrice ?? 0,
    finalPrice: m.finalPrice ?? 0,
    providerName:
      m.provider?.firstName && m.provider?.lastName
        ? `${m.provider.firstName} ${m.provider.lastName}`
        : m.provider?.firstName || '—',
    providerEmail: m.provider?.email || '',
    includes: (m.includedServices || [])
      .map((inc) => `${inc.title}: ${inc.items.join(', ')}`)
      .join(' | '),
    isTopPick: m.isTopPick ?? false,
    isActive: m.isActive ?? false,
    gallery: m.gallery?.[0] || '',
    searchTags: m.searchTags || [],
    faqs: m.faqs || [],
    rawMakeup: m,
  });

  /* ---------- Fetch ---------- */
  const fetchMakeups = async (topPicks = false) => {
    try {
      setLoading(true);
      const url = topPicks ? `${API_URL}/top-picks` : API_URL;
      const data = await makeAPICall(url, getFetchOptions());

      if (data?.data && Array.isArray(data.data)) {
        const mapped = data.data.map((m, idx) => mapMakeup(m, idx));
        setAllMakeups(mapped);
        setMakeups(mapped);
      }
    } catch (e) {
      setNotification({ open: true, message: `Error: ${e.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMakeups();
  }, []);

  /* ---------- Top-Pick Toggle ---------- */
  const handleTopPickToggle = useCallback(
    async (_id) => {
      const key = `${_id}-topPick`;
      if (toggleLoading[key]) return;
      const pkg = makeups.find((c) => c._id === _id);
      if (!pkg) return;
      const newVal = !pkg.isTopPick;
      setToggleLoading((p) => ({ ...p, [key]: true }));
      setMakeups((p) => p.map((c) => (c._id === _id ? { ...c, isTopPick: newVal } : c)));
      setAllMakeups((p) => p.map((c) => (c._id === _id ? { ...c, isTopPick: newVal } : c)));

      try {
        const res = await makeAPICall(
          `${API_URL}/${_id}/toggle-top-pick`,
          getFetchOptions('PATCH')
        );
        if (!res.success) throw new Error(res.message || 'Failed');
        setNotification({
          open: true,
          message: res.data.isTopPick ? 'Top-pick enabled' : 'Top-pick disabled',
          severity: 'success',
        });
      } catch (e) {
        setMakeups((p) => p.map((c) => (c._id === _id ? { ...c, isTopPick: !newVal } : c)));
        setAllMakeups((p) => p.map((c) => (c._id === _id ? { ...c, isTopPick: !newVal } : c)));
        setNotification({ open: true, message: e.message, severity: 'error' });
      } finally {
        setToggleLoading((p) => {
          const n = { ...p };
          delete n[key];
          return n;
        });
      }
    },
    [makeups, toggleLoading]
  );

  /* ---------- Status Toggle ---------- */
  const handleStatusToggle = useCallback(
    async (_id) => {
      const key = `${_id}-status`;
      if (toggleLoading[key]) return;
      const pkg = makeups.find((c) => c._id === _id);
      if (!pkg) return;
      const newVal = !pkg.isActive;
      setToggleLoading((p) => ({ ...p, [key]: true }));
      setMakeups((p) => p.map((c) => (c._id === _id ? { ...c, isActive: newVal } : c)));
      setAllMakeups((p) => p.map((c) => (c._id === _id ? { ...c, isActive: newVal } : c)));

      try {
        const res = await makeAPICall(
          `${API_URL}/${_id}/toggle-active`,
          getFetchOptions('PATCH')
        );
        if (!res.success) throw new Error(res.message || 'Failed');
        setNotification({
          open: true,
          message: res.data.isActive ? 'Activated' : 'Deactivated',
          severity: 'success',
        });
      } catch (e) {
        setMakeups((p) => p.map((c) => (c._id === _id ? { ...c, isActive: !newVal } : c)));
        setAllMakeups((p) => p.map((c) => (c._id === _id ? { ...c, isActive: !newVal } : c)));
        setNotification({ open: true, message: e.message, severity: 'error' });
      } finally {
        setToggleLoading((p) => {
          const n = { ...p };
          delete n[key];
          return n;
        });
      }
    },
    [makeups, toggleLoading]
  );

  /* ---------- Delete ---------- */
  const handleDeleteClick = (pkg) => {
    setMakeupToDelete(pkg);
    setOpenDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setMakeupToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await makeAPICall(`${API_URL}/${makeupToDelete._id}`, getFetchOptions('DELETE'));
      setMakeups((p) => p.filter((c) => c._id !== makeupToDelete._id));
      setAllMakeups((p) => p.filter((c) => c._id !== makeupToDelete._id));
      setNotification({
        open: true,
        message: `${makeupToDelete.title} deleted`,
        severity: 'success',
      });
    } catch (e) {
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setOpenDeleteDialog(false);
      setMakeupToDelete(null);
    }
  };

  /* ---------- Export (INR) ---------- */
  const filtered = makeups.filter((c) =>
    `${c.title} ${c.providerName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = [
      'Sl',
      'Package',
      'Makeup Type',
      'Base Price (INR)',
      'Offer (INR)',
      'Final Price (INR)',
      'Provider',
      'Provider Email',
      'Includes',
      'Top-Pick',
      'Status',
    ];
    const rows = filtered.map((c) => [
      c.id,
      `"${c.title}"`,
      c.makeupType,
      toINR(c.basePrice),
      toINR(c.offerPrice),
      toINR(c.finalPrice),
      `"${c.providerName}"`,
      `"${c.providerEmail}"`,
      `"${c.includes}"`,
      c.isTopPick ? 'Yes' : 'No',
      c.isActive ? 'Active' : 'Inactive',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `makeup-packages_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setAnchorEl(null);
    setNotification({ open: true, message: 'CSV exported', severity: 'success' });
  };

  const exportExcel = () => {
    const headers = [
      'Sl', 'Package', 'Makeup Type', 'Base Price (INR)', 'Offer (INR)', 'Final Price (INR)',
      'Provider', 'Provider Email', 'Includes', 'Top-Pick', 'Status',
    ];
    const html = `
      <table border="1">
        <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${filtered
          .map(
            (c) => `<tr>
              <td>${c.id}</td>
              <td>${c.title}</td>
              <td>${c.makeupType}</td>
              <td>${toINR(c.basePrice)}</td>
              <td>${toINR(c.offerPrice)}</td>
              <td>${toINR(c.finalPrice)}</td>
              <td>${c.providerName}</td>
              <td>${c.providerEmail}</td>
              <td>${c.includes}</td>
              <td>${c.isTopPick ? 'Yes' : 'No'}</td>
              <td>${c.isActive ? 'Active' : 'Inactive'}</td>
            </tr>`
          )
          .join('')}</tbody>
      </table>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `makeup-packages_${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    setAnchorEl(null);
    setNotification({ open: true, message: 'Excel exported', severity: 'success' });
  };

  /* ---------- View ---------- */
  const handleView = (pkg) => {
    setSelectedMakeup(pkg.rawMakeup);
    setOpenViewDialog(true);
  };

  /* ---------- Edit ---------- */
  const handleEdit = (pkg) => {
    const r = pkg.rawMakeup;
    setEditingMakeup(pkg);
    setEditFormData({
      packageTitle: r.packageTitle || '',
      description: r.description || '',
      makeupType: r.makeupType || '',
      basePrice: r.basePrice || 0,
      offerPrice: r.offerPrice || 0,
      finalPrice: r.finalPrice || 0,
      includedServices: r.includedServices || [],
      searchTags: r.searchTags || [],
      faqs: r.faqs || [],
      gallery: r.gallery?.[0] || '',
    });
    setCurrentTab(0);
    setOpenEditDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      setSaveLoading(true);
      const payload = { ...editFormData };
      if (payload.includedServices) {
        payload.includedServices = payload.includedServices.filter(
          (inc) => inc.title && inc.items?.length > 0
        );
      }
      const data = await makeAPICall(
        `${API_URL}/${editingMakeup._id}`,
        getFetchOptions('PUT', payload)
      );
      if (data.success) {
        const updated = mapMakeup(data.data, editingMakeup.id - 1);
        setMakeups((p) => p.map((x) => (x._id === editingMakeup._id ? updated : x)));
        setAllMakeups((p) => p.map((x) => (x._id === editingMakeup._id ? updated : x)));
        setNotification({ open: true, message: 'Makeup package updated', severity: 'success' });
        setOpenEditDialog(false);
      }
    } catch (e) {
      setNotification({ open: true, message: e.message || 'Update failed', severity: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };

  // FIXED: Corrected syntax error
  const handleIncludeChange = (index, field, value) => {
    setEditFormData((p) => ({
      ...p,
      includedServices: p.includedServices.map((inc, i) =>
        i === index ? { ...inc, [field]: value } : inc
      ),
    }));
  };

  const addInclude = () => {
    setEditFormData((p) => ({
      ...p,
      includedServices: [...(p.includedServices || []), { title: '', items: [] }],
    }));
  };

  const removeInclude = (index) => {
    setEditFormData((p) => ({
      ...p,
      includedServices: p.includedServices.filter((_, i) => i !== index),
    }));
  };

  /* ---------- Stats ---------- */
  const stats = {
    total: allMakeups.length,
    active: allMakeups.filter((c) => c.isActive).length,
    inactive: allMakeups.filter((c) => !c.isActive).length,
    topPick: allMakeups.filter((c) => c.isTopPick).length,
  };

  return (
    <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      {/* Stats Bar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: '#f5f5f5',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ bgcolor: '#e3f2fd', p: 1, borderRadius: 1 }}>
            Total: {stats.total}
          </Box>
          <Box sx={{ bgcolor: '#fff3e0', p: 1, borderRadius: 1 }}>
            Active: {stats.active}
          </Box>
          <Box sx={{ bgcolor: '#e0f7fa', p: 1, borderRadius: 1 }}>
            Inactive: {stats.inactive}
          </Box>
          <Box sx={{ bgcolor: '#fce4ec', p: 1, borderRadius: 1 }}>
            Top-Pick: {stats.topPick}
          </Box>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => fetchMakeups(true)}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Fetch Top-Picks'}
        </Button>
      </Box>

      {/* Search & Export */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
          bgcolor: '#f5f5f5',
        }}
      >
        <TextField
          placeholder="Search Package / Provider"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">Search</InputAdornment>,
          }}
          sx={{ bgcolor: 'white', minWidth: 220 }}
        />
        <Button
          variant="contained"
          color="primary"
          size="small"
          endIcon={<Download />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
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
          <Typography>Loading makeup packages...</Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 560, overflowY: 'auto' }}>
          <Table stickyHeader sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Sl</TableCell>
                <TableCell>Package</TableCell>
                <TableCell>Makeup Type</TableCell>
                <TableCell>Base Price (INR)</TableCell>
                <TableCell>Offer (INR)</TableCell>
                <TableCell>Final Price (INR)</TableCell>
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
                  <TableCell colSpan={11} align="center">
                    <Typography color="textSecondary">No makeup packages found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => {
                  const topKey = `${c._id}-topPick`;
                  const statKey = `${c._id}-status`;
                  return (
                    <TableRow key={c._id} hover>
                      <TableCell>{c.id}</TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 180,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {c.title}
                      </TableCell>
                      <TableCell>{c.makeupType}</TableCell>
                      <TableCell>{toINR(c.basePrice)}</TableCell>
                      <TableCell>{toINR(c.offerPrice)}</TableCell>
                      <TableCell>{toINR(c.finalPrice)}</TableCell>
                      <TableCell>{c.providerName}</TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 250,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {c.includes}
                      </TableCell>
                      <TableCell>
                        <Switch
                          size="small"
                          checked={c.isTopPick}
                          onChange={() => handleTopPickToggle(c._id)}
                          disabled={toggleLoading[topKey]}
                        />
                        {toggleLoading[topKey] && (
                          <CircularProgress size={14} sx={{ ml: 0.5 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          size="small"
                          checked={c.isActive}
                          onChange={() => handleStatusToggle(c._id)}
                          disabled={toggleLoading[statKey]}
                        />
                        {toggleLoading[statKey] && (
                          <CircularProgress size={14} sx={{ ml: 0.5 }} />
                        )}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleView(c)}
                          title="View Package"
                        >
                          <VisibilityOutlined />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(c)}
                          title="Edit Package"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(c)}
                          title="Delete Package"
                        >
                          <Delete />
                        </IconButton>
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
          <Typography variant="h6">{selectedMakeup?.packageTitle}</Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedMakeup && (
            <Grid container spacing={3}>
              {/* Basic Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  <Palette fontSize="small" /> Package
                </Typography>
                <Typography paragraph>{selectedMakeup.packageTitle}</Typography>

                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Makeup Type
                </Typography>
                <Typography>{selectedMakeup.makeupType || '—'}</Typography>

                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  <AttachMoney fontSize="small" /> Pricing (INR)
                </Typography>
                <Typography>Base: ₹{toINR(selectedMakeup.basePrice)}</Typography>
                <Typography>Offer: ₹{toINR(selectedMakeup.offerPrice)}</Typography>
                <Typography>Final: ₹{toINR(selectedMakeup.finalPrice)}</Typography>
              </Grid>

              {/* Provider Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  <People fontSize="small" /> Provider
                </Typography>
                <Typography>
                  {selectedMakeup.provider?.firstName} {selectedMakeup.provider?.lastName}
                </Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Phone fontSize="small" /> {selectedMakeup.provider?.phone || '—'}
                </Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Email fontSize="small" /> {selectedMakeup.provider?.email || '—'}
                </Typography>
                {selectedMakeup.provider?.website && (
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Web fontSize="small" />{' '}
                    <a
                      href={selectedMakeup.provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedMakeup.provider.website}
                    </a>
                  </Typography>
                )}
              </Grid>

              {/* Included Services */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Included Services
                </Typography>
                <List dense>
                  {selectedMakeup.includedServices?.map((inc, i) => (
                    <ListItem key={i} disableGutters>
                      <ListItemText
                        primary={<strong>{inc.title}</strong>}
                        secondary={inc.items.join(', ')}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Search Tags */}
              {selectedMakeup.searchTags?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Search Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedMakeup.searchTags.map((t) => (
                      <Chip key={t} label={t} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
              )}

              {/* Description */}
              {selectedMakeup.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography paragraph>{selectedMakeup.description}</Typography>
                </Grid>
              )}

              {/* FAQs */}
              {selectedMakeup.faqs?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    FAQs
                  </Typography>
                  <List dense>
                    {selectedMakeup.faqs.map((q, i) => (
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
          <Button onClick={() => setOpenViewDialog(false)} variant="outlined">
            Close
          </Button>
          <Button
            onClick={() => {
              setOpenViewDialog(false);
              handleEdit({ rawMakeup: selectedMakeup });
            }}
            variant="contained"
            startIcon={<Edit />}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- EDIT DIALOG (INR helper) ---------- */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">Edit Makeup Package: {editingMakeup?.title}</Typography>
          <IconButton
            size="small"
            onClick={() => setOpenEditDialog(false)}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Tabs
            value={currentTab}
            onChange={(e, v) => setCurrentTab(v)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Basic" />
            <Tab label="Included Services" />
            <Tab label="Other" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Basic */}
            {currentTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Package Title"
                    value={editFormData.packageTitle || ''}
                    onChange={(e) =>
                      setEditFormData((p) => ({ ...p, packageTitle: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Makeup Type"
                    value={editFormData.makeupType || ''}
                    onChange={(e) =>
                      setEditFormData((p) => ({ ...p, makeupType: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={editFormData.description || ''}
                    onChange={(e) =>
                      setEditFormData((p) => ({ ...p, description: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Base Price (AED)"
                    type="number"
                    value={editFormData.basePrice || ''}
                    onChange={(e) =>
                      setEditFormData((p) => ({ ...p, basePrice: Number(e.target.value) }))
                    }
                    helperText={`≈ ₹${toINR(editFormData.basePrice || 0)}`}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Offer Price (AED)"
                    type="number"
                    value={editFormData.offerPrice || ''}
                    onChange={(e) =>
                      setEditFormData((p) => ({ ...p, offerPrice: Number(e.target.value) }))
                    }
                    helperText={`≈ ₹${toINR(editFormData.offerPrice || 0)}`}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Final Price (AED)"
                    type="number"
                    value={editFormData.finalPrice || ''}
                    onChange={(e) =>
                      setEditFormData((p) => ({ ...p, finalPrice: Number(e.target.value) }))
                    }
                    helperText={`≈ ₹${toINR(editFormData.finalPrice || 0)}`}
                  />
                </Grid>
              </Grid>
            )}

            {/* Included Services */}
            {currentTab === 1 && (
              <Box>
                <Button variant="outlined" size="small" onClick={addInclude} sx={{ mb: 2 }}>
                  Add Service
                </Button>
                {editFormData.includedServices?.map((inc, idx) => (
                  <Box key={idx} sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Title"
                          size="small"
                          value={inc.title || ''}
                          onChange={(e) => handleIncludeChange(idx, 'title', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Items (comma-separated)"
                          size="small"
                          value={inc.items?.join(', ') || ''}
                          onChange={(e) =>
                            handleIncludeChange(
                              idx,
                              'items',
                              e.target.value
                                .split(',')
                                .map((i) => i.trim())
                                .filter(Boolean)
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <IconButton
                          color="error"
                          onClick={() => removeInclude(idx)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
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
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={editFormData.searchTags || []}
                    onChange={(e, v) => setEditFormData((p) => ({ ...p, searchTags: v }))}
                    renderTags={(v, p) =>
                      v.map((o, i) => <Chip key={i} label={o} {...p(i)} />)
                    }
                    renderInput={(p) => <TextField {...p} label="Search Tags" />}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setOpenEditDialog(false)} variant="outlined" disabled={saveLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            startIcon={saveLoading ? <CircularProgress size={16} /> : <Save />}
            disabled={saveLoading}
          >
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- DELETE DIALOG ---------- */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle color="error">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete <strong>{makeupToDelete?.title}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- SNACKBAR ---------- */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification((p) => ({ ...p, open: false }))}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </TableContainer>
  );
};

export default MakeupList;
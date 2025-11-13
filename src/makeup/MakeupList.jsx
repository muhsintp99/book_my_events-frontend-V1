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
} from '@mui/material';
import {
  VisibilityOutlined,
  Edit,
  Delete,
  Download,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const CateringList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* ---------- State ---------- */
  const [caterings, setCaterings] = useState([]);
  const [allCaterings, setAllCaterings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [cateringToDelete, setCateringToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  /* ---------- API ---------- */
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.bookmyevent.ae/api';
  const API_URL = `${API_BASE_URL}/catering`;

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

  /* ---------- Fetch All / Top-Picks ---------- */
  const fetchCaterings = async (topPicks = false) => {
    try {
      setLoading(true);
      const url = topPicks ? `${API_URL}/top-picks` : API_URL;
      const data = await makeAPICall(url, getFetchOptions());

      if (data?.data && Array.isArray(data.data)) {
        const mapped = data.data.map((c, idx) => ({
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
            .map((inc) => `${inc.title}: ${inc.items.join(', ')}`)
            .join(' | '),
          isTopPick: c.isTopPick ?? false,
          isActive: c.isActive ?? false,
          thumbnail: c.thumbnail || '',
        }));

        setAllCaterings(mapped);
        setCaterings(mapped);
      }
    } catch (e) {
      setNotification({ open: true, message: `Error: ${e.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaterings();
  }, []);

  /* ---------- Top-Pick Toggle ---------- */
  const handleTopPickToggle = useCallback(
    async (_id) => {
      const key = `${_id}-topPick`;
      if (toggleLoading[key]) return;

      const cat = caterings.find((c) => c._id === _id);
      if (!cat) return;

      const newVal = !cat.isTopPick;
      setToggleLoading((p) => ({ ...p, [key]: true }));
      setCaterings((p) => p.map((c) => (c._id === _id ? { ...c, isTopPick: newVal } : c)));
      setAllCaterings((p) => p.map((c) => (c._id === _id ? { ...c, isTopPick: newVal } : c)));

      try {
        const res = await makeAPICall(`${API_URL}/${_id}/toggle-top-pick`, getFetchOptions('PATCH'));
        if (!res.success) throw new Error(res.message || 'Failed');
        setCaterings((p) =>
          p.map((c) => (c._id === _id ? { ...c, isTopPick: res.data.isTopPick } : c))
        );
        setAllCaterings((p) =>
          p.map((c) => (c._id === _id ? { ...c, isTopPick: res.data.isTopPick } : c))
        );
        setNotification({
          open: true,
          message: res.data.isTopPick ? 'Top-pick enabled' : 'Top-pick disabled',
          severity: 'success',
        });
      } catch (e) {
        setCaterings((p) => p.map((c) => (c._id === _id ? { ...c, isTopPick: !newVal } : c)));
        setAllCaterings((p) => p.map((c) => (c._id === _id ? { ...c, isTopPick: !newVal } : c)));
        setNotification({ open: true, message: e.message, severity: 'error' });
      } finally {
        setToggleLoading((p) => {
          const n = { ...p };
          delete n[key];
          return n;
        });
      }
    },
    [caterings, toggleLoading]
  );

  /* ---------- Status Toggle ---------- */
  const handleStatusToggle = useCallback(
    async (_id) => {
      const key = `${_id}-status`;
      if (toggleLoading[key]) return;

      const cat = caterings.find((c) => c._id === _id);
      if (!cat) return;

      const newVal = !cat.isActive;
      setToggleLoading((p) => ({ ...p, [key]: true }));
      setCaterings((p) => p.map((c) => (c._id === _id ? { ...c, isActive: newVal } : c)));
      setAllCaterings((p) => p.map((c) => (c._id === _id ? { ...c, isActive: newVal } : c)));

      try {
        const res = await makeAPICall(`${API_URL}/${_id}/toggle-active`, getFetchOptions('PATCH'));
        if (!res.success) throw new Error(res.message || 'Failed');
        setCaterings((p) =>
          p.map((c) => (c._id === _id ? { ...c, isActive: res.data.isActive } : c))
        );
        setAllCaterings((p) =>
          p.map((c) => (c._id === _id ? { ...c, isActive: res.data.isActive } : c))
        );
        setNotification({
          open: true,
          message: res.data.isActive ? 'Activated' : 'Deactivated',
          severity: 'success',
        });
      } catch (e) {
        setCaterings((p) => p.map((c) => (c._id === _id ? { ...c, isActive: !newVal } : c)));
        setAllCaterings((p) => p.map((c) => (c._id === _id ? { ...c, isActive: !newVal } : c)));
        setNotification({ open: true, message: e.message, severity: 'error' });
      } finally {
        setToggleLoading((p) => {
          const n = { ...p };
          delete n[key];
          return n;
        });
      }
    },
    [caterings, toggleLoading]
  );

  /* ---------- Delete ---------- */
  const handleDeleteClick = (cat) => {
    setCateringToDelete(cat);
    setOpenDeleteDialog(true);
  };
  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setCateringToDelete(null);
  };
  const handleDeleteConfirm = async () => {
    try {
      await makeAPICall(`${API_URL}/${cateringToDelete._id}`, getFetchOptions('DELETE'));
      setCaterings((p) => p.filter((c) => c._id !== cateringToDelete._id));
      setAllCaterings((p) => p.filter((c) => c._id !== cateringToDelete._id));
      setNotification({
        open: true,
        message: `${cateringToDelete.title} deleted`,
        severity: 'success',
      });
    } catch (e) {
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setOpenDeleteDialog(false);
      setCateringToDelete(null);
    }
  };

  /* ---------- Export ---------- */
  const filtered = caterings.filter((c) =>
    `${c.title} ${c.subtitle} ${c.providerName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = [
      'Sl',
      'Package',
      'Subtitle',
      'Type',
      'Price',
      'Provider',
      'Provider Email',
      'Includes',
      'Top-Pick',
      'Status',
    ];
    const rows = filtered.map((c) => [
      c.id,
      `"${c.title}"`,
      `"${c.subtitle}"`,
      c.cateringType,
      c.price,
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
    a.download = `catering_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setAnchorEl(null);
    setNotification({ open: true, message: 'CSV exported', severity: 'success' });
  };

  const exportExcel = () => {
    const html = `
      <table border="1">
        <thead><tr>${[
          'Sl',
          'Package',
          'Subtitle',
          'Type',
          'Price',
          'Provider',
          'Provider Email',
          'Includes',
          'Top-Pick',
          'Status',
        ]
          .map((h) => `<th>${h}</th>`)
          .join('')}</tr></thead>
        <tbody>${filtered
          .map(
            (c) => `<tr>
              <td>${c.id}</td>
              <td>${c.title}</td>
              <td>${c.subtitle}</td>
              <td>${c.cateringType}</td>
              <td>${c.price}</td>
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
    a.download = `catering_${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    setAnchorEl(null);
    setNotification({ open: true, message: 'Excel exported', severity: 'success' });
  };

  /* ---------- UI Helpers ---------- */
  const stats = {
    total: allCaterings.length,
    active: allCaterings.filter((c) => c.isActive).length,
    inactive: allCaterings.filter((c) => !c.isActive).length,
    topPick: allCaterings.filter((c) => c.isTopPick).length,
  };

  return (
    <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      {/* ---- Stats Bar ---- */}
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
          onClick={() => fetchCaterings(true)}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Fetch Top-Picks'}
        </Button>
      </Box>

      {/* ---- Search & Export ---- */}
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

      {/* ---- Table ---- */}
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
                <TableCell>Price</TableCell>
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
                filtered.map((c) => {
                  const topKey = `${c._id}-topPick`;
                  const statKey = `${c._id}-status`;
                  return (
                    <TableRow key={c._id} hover>
                      <TableCell>{c.id}</TableCell>
                      <TableCell sx={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.title}
                      </TableCell>
                      <TableCell>{c.subtitle}</TableCell>
                      <TableCell>{c.cateringType}</TableCell>
                      <TableCell>{c.price}</TableCell>
                      <TableCell>{c.providerName}</TableCell>
                      <TableCell sx={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.includes}
                      </TableCell>
                      <TableCell>
                        <Switch
                          size="small"
                          checked={c.isTopPick}
                          onChange={() => handleTopPickToggle(c._id)}
                          disabled={toggleLoading[topKey]}
                        />
                        {toggleLoading[topKey] && <CircularProgress size={14} sx={{ ml: 0.5 }} />}
                      </TableCell>
                      <TableCell>
                        <Switch
                          size="small"
                          checked={c.isActive}
                          onChange={() => handleStatusToggle(c._id)}
                          disabled={toggleLoading[statKey]}
                        />
                        {toggleLoading[statKey] && <CircularProgress size={14} sx={{ ml: 0.5 }} />}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => alert(`View ${c.title}`)} // replace with real view page
                        >
                          <VisibilityOutlined />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate('/catering/edit', { state: { catering: c } })}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(c)}>
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

      {/* ---- Delete Dialog ---- */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle color="error">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete <strong>{cateringToDelete?.title}</strong>? This cannot be undone.
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

      {/* ---- Snackbar ---- */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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

export default CateringList;
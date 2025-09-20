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
  TextField,
  MenuItem,
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
  CircularProgress
} from '@mui/material';
import { VisibilityOutlined, Edit, Delete, Download } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProvidersList = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const API_URL = 'https://api.bookmyevent.ae/api/users?role=vendor';

  // Simplified fetch options (no token, no CORS setup)
  const getFetchOptions = (method = 'GET', body = null) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    return options;
  };

  const makeAPICall = async (url, options, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        throw error;
      }
    }
  };

  // Fetch vendors
  const fetchProviders = async () => {
    try {
      setLoading(true);
      const data = await makeAPICall(API_URL, getFetchOptions());

      if (data && Array.isArray(data.users)) {
        const mappedProviders = data.users.map((provider, index) => ({
          id: index + 1,
          _id: provider._id,
          storeInfo: provider.storeName || 'Unknown Store',
          ownerInfo: `${provider.firstName || ''} ${provider.lastName || ''} (${provider.phone || 'N/A'})`,
          zone: provider.zone || 'N/A',
          featured: provider.isFeatured || false,
          status: provider.isActive || false,
          email: provider.email || '',
          phone: provider.phone || ''
        }));
        setProviders(mappedProviders);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      setNotification({
        open: true,
        message: `Error fetching vendors: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // Status toggle
  const handleStatusToggle = useCallback(
    (_id) => {
      const toggleKey = `${_id}-status`;
      if (toggleLoading[toggleKey]) return;

      const provider = providers.find((p) => p._id === _id);
      if (!provider) return;

      const originalValue = provider.status;
      const newValue = !originalValue;

      setToggleLoading((prev) => ({ ...prev, [toggleKey]: true }));
      setProviders((prev) => prev.map((p) => (p._id === _id ? { ...p, status: newValue } : p)));

      // NOTE: No backend toggle API provided here, just UI toggle
      setTimeout(() => {
        setToggleLoading((prev) => {
          const newState = { ...prev };
          delete newState[toggleKey];
          return newState;
        });
        setNotification({
          open: true,
          message: `${provider.storeInfo} status updated (UI only)`,
          severity: 'success'
        });
      }, 800);
    },
    [providers, toggleLoading]
  );

  const handleDeleteClick = (provider) => {
    setProviderToDelete(provider);
    setOpenDeleteDialog(true);
  };
  const handleDeleteCancel = () => setOpenDeleteDialog(false);

  const handleDeleteConfirm = () => {
    setProviders((prev) => prev.filter((p) => p._id !== providerToDelete._id));
    setNotification({
      open: true,
      message: `${providerToDelete.storeInfo} deleted (UI only)`,
      severity: 'success'
    });
    setOpenDeleteDialog(false);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleCloseNotification = () => setNotification((prev) => ({ ...prev, open: false }));

  const filteredProviders = providers.filter((provider) => {
    const matchesZone = selectedZone === 'All Zones' || provider.zone === selectedZone;
    const matchesSearch =
      provider.storeInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.ownerInfo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesZone && matchesSearch;
  });

  return (
    <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      {/* Stats bar */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', p: 2, bgcolor: '#f5f5f5', gap: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ bgcolor: '#e3f2fd', p: 1, borderRadius: 1 }}>Total vendors: {providers.length}</Box>
          <Box sx={{ bgcolor: '#fff3e0', p: 1, borderRadius: 1 }}>Active vendors: {providers.filter((p) => p.status).length}</Box>
          <Box sx={{ bgcolor: '#e0f7fa', p: 1, borderRadius: 1 }}>Inactive vendors: {providers.filter((p) => !p.status).length}</Box>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5' }}>
        <TextField
          select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          size="small"
          sx={{ minWidth: 150, bgcolor: 'white' }}
        >
          <MenuItem value="All Zones">All Zones</MenuItem>
          {[...new Set(providers.map((p) => p.zone))].map((zone) => (
            <MenuItem key={zone} value={zone}>
              {zone}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            placeholder="Search Vendor"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
            sx={{ bgcolor: 'white' }}
          />
          <Button variant="contained" color="primary" size="small" endIcon={<Download />} onClick={handleClick}>
            Export
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={() => alert('Export Excel not implemented')}>Excel</MenuItem>
            <MenuItem onClick={() => alert('Export CSV not implemented')}>CSV</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
          <CircularProgress size={20} />
          <Typography>Loading vendors...</Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ position: 'sticky', top: 0, bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Sl</TableCell>
                <TableCell>Store Information</TableCell>
                <TableCell>Owner Information</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProviders.map((provider) => {
                const statusToggleKey = `${provider._id}-status`;
                return (
                  <TableRow key={provider._id}>
                    <TableCell>{provider.id}</TableCell>
                    <TableCell>{provider.storeInfo}</TableCell>
                    <TableCell>{provider.ownerInfo}</TableCell>
                    <TableCell>{provider.email}</TableCell>
                    <TableCell>{provider.phone}</TableCell>
                    <TableCell>
                      <Switch
                        checked={provider.status}
                        onChange={() => handleStatusToggle(provider._id)}
                        disabled={toggleLoading[statusToggleKey]}
                      />
                      {toggleLoading[statusToggleKey] && <CircularProgress size={16} sx={{ ml: 1 }} />}
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => alert(`Viewing: ${provider.storeInfo}`)}>
                        <VisibilityOutlined />
                      </IconButton>
                      <IconButton color="primary" onClick={() => navigate('/providers/edit', { state: { provider } })}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteClick(provider)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Delete dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete vendor "<strong>{providerToDelete?.storeInfo}</strong>"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </TableContainer>
  );
};

export default ProvidersList;

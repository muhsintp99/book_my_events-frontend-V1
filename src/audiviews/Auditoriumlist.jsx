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
import { useNavigate, useLocation } from 'react-router-dom';

const ProvidersList = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const API_URL = `${API_BASE_URL}/users?role=vendor`;

  const getToken = () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return token;
    } catch (error) {
      console.warn('Error accessing storage for token:', error);
      return null;
    }
  };

  const getFetchOptions = (method = 'GET', body = null) => {
    const token = getToken();
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    return options;
  };

  const makeAPICall = async (url, options, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error Response:', errorText);

          if (response.status === 401) {
            throw new Error('Authentication required - please login again');
          } else if (response.status === 403) {
            throw new Error('Access forbidden - insufficient permissions');
          } else if (response.status === 404) {
            throw new Error('Resource not found');
          } else if (response.status >= 500) {
            throw new Error('Server error - please try again later');
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
          }
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`❌ API Call Failed (attempt ${attempt + 1}):`, {
          message: error.message,
          url,
          stack: error.stack
        });

        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        if (error.name === 'AbortError') {
          throw new Error('Request timed out - please check your connection');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Network error - please check if the server is running and CORS is properly configured');
        }

        throw error;
      }
    }
  };

  const [zones, setZones] = useState([]);
  
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const url = `${API_BASE_URL}/zones`;
        const options = getFetchOptions();
        const data = await makeAPICall(url, options);

        if (data.success) {
          setZones(data.data.zones || data.data || []);
        } else {
          throw new Error(data.message || 'Failed to fetch zones');
        }
      } catch (error) {
        console.error('Error fetching zones:', error);
        setZones([
          { _id: '1', name: 'Downtown Zone' },
          { _id: '2', name: 'North Zone' },
          { _id: '3', name: 'South Zone' },
          { _id: '4', name: 'East Zone' },
          { _id: '5', name: 'West Zone' }
        ]);
      }
    };
    fetchZones();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const url = API_URL;
      const options = getFetchOptions();
      const data = await makeAPICall(url, options);

      if (data && Array.isArray(data.users)) {
        const mappedProviders = data.users.map((provider, index) => ({
          id: index + 1,
          _id: provider._id,
          storeInfo: provider.storeName || 'Unknown Store',
          ownerInfo: `${provider.firstName || ''} ${provider.lastName || ''} (${provider.phone || 'N/A'})`,
          zone: provider.zone?.name || 'N/A',
          zoneId: provider.zone?._id || '',
          featured: provider.isFeatured || false,
          status: provider.isActive || false,
          email: provider.email || '',
          phone: provider.phone || '',
          firstName: provider.firstName || '',
          lastName: provider.lastName || '',
          storeName: provider.storeName || '',
          password: '********'
        }));
        setProviders(mappedProviders);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
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
    
    if (location.state?.updatedProvider) {
      const updatedProvider = location.state.updatedProvider;
      setProviders((prev) =>
        prev.map((provider) =>
          provider._id === updatedProvider._id
            ? {
                ...provider,
                ...updatedProvider,
                storeInfo: updatedProvider.storeName,
                ownerInfo: `${updatedProvider.firstName || ''} ${updatedProvider.lastName || ''} (${updatedProvider.phone || 'N/A'})`,
                zone: zones.find((zone) => zone._id === updatedProvider.zone)?.name || 'N/A'
              }
            : provider
        )
      );
      setNotification({
        open: true,
        message: 'Provider updated successfully!',
        severity: 'success'
      });
    }
  }, [location.state]);

  const handleFeaturedToggle = useCallback(
    async (_id) => {
      const toggleKey = `${_id}-featured`;
      if (toggleLoading[toggleKey]) return;

      const provider = providers.find((p) => p._id === _id);
      if (!provider) {
        setNotification({
          open: true,
          message: 'Provider not found',
          severity: 'error'
        });
        return;
      }

      const newValue = !provider.featured;
      setToggleLoading((prev) => ({ ...prev, [toggleKey]: true }));
      setProviders((prev) => prev.map((p) => (p._id === _id ? { ...p, featured: newValue } : p)));

      try {
        const endpoint = `${API_BASE_URL}/users/${_id}/toggle-featured`;
        const options = getFetchOptions('PATCH');
        const response = await fetch(endpoint, options);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Update failed');

        setProviders((prev) =>
          prev.map((p) =>
            p._id === _id
              ? { ...p, featured: data.data.user?.isFeatured ?? p.featured }
              : p
          )
        );

        setNotification({
          open: true,
          message: `${provider.storeInfo} featured status updated successfully`,
          severity: 'success'
        });
      } catch (error) {
        console.error('❌ Featured toggle error:', error);
        setProviders((prev) => prev.map((p) => (p._id === _id ? { ...p, featured: !newValue } : p)));

        setNotification({
          open: true,
          message: `Error updating featured status: ${error.message}`,
          severity: 'error'
        });
      } finally {
        setToggleLoading((prev) => {
          const newState = { ...prev };
          delete newState[toggleKey];
          return newState;
        });
      }
    },
    [providers, API_BASE_URL, toggleLoading]
  );

  const handleStatusToggle = useCallback(
    async (_id) => {
      const toggleKey = `${_id}-status`;
      if (toggleLoading[toggleKey]) return;

      const provider = providers.find((p) => p._id === _id);
      if (!provider) {
        setNotification({
          open: true,
          message: 'Provider not found',
          severity: 'error'
        });
        return;
      }

      const newValue = !provider.status;
      setToggleLoading((prev) => ({ ...prev, [toggleKey]: true }));
      setProviders((prev) => prev.map((p) => (p._id === _id ? { ...p, status: newValue } : p)));

      try {
        const endpoint = `${API_BASE_URL}/users/${_id}/toggle-status`;
        const options = getFetchOptions('PATCH');
        const response = await fetch(endpoint, options);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Update failed');

        setProviders((prev) =>
          prev.map((p) =>
            p._id === _id
              ? { ...p, status: data.data.user?.isActive ?? p.status }
              : p
          )
        );

        setNotification({
          open: true,
          message: `${provider.storeInfo} status updated successfully`,
          severity: 'success'
        });
      } catch (error) {
        console.error('❌ Status toggle error:', error);
        setProviders((prev) => prev.map((p) => (p._id === _id ? { ...p, status: !newValue } : p)));

        setNotification({
          open: true,
          message: `Error updating status: ${error.message}`,
          severity: 'error'
        });
      } finally {
        setToggleLoading((prev) => {
          const newState = { ...prev };
          delete newState[toggleKey];
          return newState;
        });
      }
    },
    [providers, API_BASE_URL, toggleLoading]
  );

  const handleDeleteClick = (provider) => {
    setProviderToDelete(provider);
    setOpenDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setProviderToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    const storeName = providerToDelete.storeInfo;
    try {
      const url = `${API_BASE_URL}/users/${providerToDelete._id}`;
      const options = getFetchOptions('DELETE');
      const data = await makeAPICall(url, options);

      if (data.success) {
        setProviders((prev) => prev.filter((p) => p._id !== providerToDelete._id));
        setNotification({
          open: true,
          message: `${storeName} has been deleted successfully`,
          severity: 'success'
        });
      } else {
        throw new Error(data.message || 'Failed to delete provider');
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      setNotification({
        open: true,
        message: `Error deleting provider: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setOpenDeleteDialog(false);
      setProviderToDelete(null);
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  const filteredProviders = providers.filter((provider) => {
    const matchesZone = selectedZone === 'All Zones' || provider.zone === selectedZone;
    const matchesSearch =
      provider.storeInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.ownerInfo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ['Sl', 'Store Name', 'Owner Information', 'Email', 'Phone', 'Zone', 'Featured', 'Status'];
    const csvData = filteredProviders.map((provider) => [
      provider.id,
      `"${provider.storeInfo}"`,
      `"${provider.ownerInfo}"`,
      `"${provider.email}"`,
      `"${provider.phone}"`,
      `"${provider.zone}"`,
      provider.featured ? 'Yes' : 'No',
      provider.status ? 'Active' : 'Inactive'
    ]);

    const csvContent = [headers.join(','), ...csvData.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `providers_list_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleClose();

    setNotification({
      open: true,
      message: 'CSV file exported successfully!',
      severity: 'success'
    });
  };

  const exportToExcel = () => {
    const headers = ['Sl', 'Store Name', 'Owner Information', 'Email', 'Phone', 'Zone', 'Featured', 'Status'];
    let excelContent = `
      <table border="1">
        <thead>
          <tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${filteredProviders
            .map(
              (provider) => `
            <tr>
              <td>${provider.id}</td>
              <td>${provider.storeInfo}</td>
              <td>${provider.ownerInfo}</td>
              <td>${provider.email}</td>
              <td>${provider.phone}</td>
              <td>${provider.zone}</td>
              <td>${provider.featured ? 'Yes' : 'No'}</td>
              <td>${provider.status ? 'Active' : 'Inactive'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `providers_list_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleClose();

    setNotification({
      open: true,
      message: 'Excel file exported successfully!',
      severity: 'success'
    });
  };

  return (
    <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      {/* Stats bar */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', p: 2, bgcolor: '#f5f5f5', gap: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ bgcolor: '#e3f2fd', p: 1, borderRadius: 1 }}>Total vendors: {providers.length}</Box>
          <Box sx={{ bgcolor: '#fff3e0', p: 1, borderRadius: 1 }}>Active vendors: {providers.filter((p) => p.status).length}</Box>
          <Box sx={{ bgcolor: '#e0f7fa', p: 1, borderRadius: 1 }}>Inactive vendors: {providers.filter((p) => !p.status).length}</Box>
          <Box sx={{ bgcolor: '#fce4ec', p: 1, borderRadius: 1 }}>Featured vendors: {providers.filter((p) => p.featured).length}</Box>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, bgcolor: '#f5f5f5' }}>
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
            <MenuItem onClick={exportToExcel}>Excel</MenuItem>
            <MenuItem onClick={exportToCSV}>CSV</MenuItem>
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
            <TableHead sx={{ position: 'sticky', top: 0, bgcolor: '#f5f5f5', zIndex: 1 }}>
              <TableRow>
                <TableCell>Sl</TableCell>
                <TableCell>Store Information</TableCell>
                <TableCell>Owner Information</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Zone</TableCell>
                <TableCell>Featured</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProviders.map((provider) => {
                const featuredToggleKey = `${provider._id}-featured`;
                const statusToggleKey = `${provider._id}-status`;
                return (
                  <TableRow key={provider._id}>
                    <TableCell>{provider.id}</TableCell>
                    <TableCell>{provider.storeInfo}</TableCell>
                    <TableCell>{provider.ownerInfo}</TableCell>
                    <TableCell>{provider.email}</TableCell>
                    <TableCell>{provider.phone}</TableCell>
                    <TableCell>{provider.zone}</TableCell>
                    <TableCell>
                      <Switch
                        checked={provider.featured}
                        onChange={() => handleFeaturedToggle(provider._id)}
                        disabled={toggleLoading[featuredToggleKey]}
                        color="primary"
                      />
                      {toggleLoading[featuredToggleKey] && <CircularProgress size={16} sx={{ ml: 1 }} />}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={provider.status}
                        onChange={() => handleStatusToggle(provider._id)}
                        disabled={toggleLoading[statusToggleKey]}
                        color="primary"
                      />
                      {toggleLoading[statusToggleKey] && <CircularProgress size={16} sx={{ ml: 1 }} />}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
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
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        sx={{ '& .MuiDialog-paper': { borderRadius: 2, padding: 2, maxWidth: 400 } }}
      >
        <DialogTitle>
          <Typography variant="h6" color="error">
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete vendor "<strong>{providerToDelete?.storeInfo}</strong>"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel} variant="outlined" color="primary" sx={{ borderRadius: 1, textTransform: 'none', px: 3 }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ borderRadius: 1, textTransform: 'none', px: 3 }}>
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
        <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </TableContainer>
  );
};

export default ProvidersList;
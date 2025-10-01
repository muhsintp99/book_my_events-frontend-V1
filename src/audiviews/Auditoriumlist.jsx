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

const AuditoriumsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [auditoriums, setAuditoriums] = useState([]);
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [auditoriumToDelete, setAuditoriumToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
          throw new Error('Network error - please check if the server is running at http://localhost:5000 and CORS is properly configured');
        }

        throw error;
      }
    }
  };

  useEffect(() => {
    fetchAuditoriums();
    if (location.state?.updatedAuditorium) {
      const updatedAuditorium = location.state.updatedAuditorium;
      setAuditoriums((prev) =>
        prev.map((auditorium) =>
          auditorium._id === updatedAuditorium._id
            ? {
                ...auditorium,
                ...updatedAuditorium,
                storeInfo: updatedAuditorium.storeName,
                ownerInfo: `${updatedAuditorium.ownerFirstName || ''} ${updatedAuditorium.ownerLastName || ''} (${updatedAuditorium.ownerPhone || 'N/A'})`,
                zone: zones.find((zone) => zone._id === updatedAuditorium.zone)?.name || 'N/A',
                ownerEmail: updatedAuditorium.ownerEmail || '',
                password: updatedAuditorium.password || '********', // Mask password for security
                confirmPassword: updatedAuditorium.confirmPassword || '********' // Mask confirm password
              }
            : auditorium
        )
      );
      setNotification({
        open: true,
        message: 'Auditorium updated successfully!',
        severity: 'success'
      });
    }
  }, [location.state]);

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
          { _id: '5', name: 'West Zone' },
          { _id: '6', name: 'Airport Zone' },
          { _id: '7', name: 'Industrial Zone' }
        ]);
      }
    };
    fetchZones();
  }, []);

  const fetchAuditoriums = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/auditoriums`;
      const options = getFetchOptions();
      const data = await makeAPICall(url, options);

      if (data.success) {
        const auditoriumsData = data.data.auditoriums || [];
        const mappedAuditoriums = auditoriumsData.map((auditorium, index) => ({
          id: index + 1,
          _id: auditorium._id,
          storeInfo: auditorium.storeName || 'Unknown Auditorium',
          ownerInfo: `${auditorium.ownerFirstName || ''} ${auditorium.ownerLastName || ''} (${auditorium.ownerPhone || 'N/A'})`,
          zone: auditorium.zone?.name || 'N/A',
          zoneId: auditorium.zone?._id || '',
          featured: auditorium.isFeatured || false,
          status: auditorium.isActive || false,
          storeName: auditorium.storeName || '',
          storeAddress: auditorium.storeAddress || '',
          minimumDeliveryTime: auditorium.minimumDeliveryTime || '',
          maximumDeliveryTime: auditorium.maximumDeliveryTime || '',
          latitude: auditorium.latitude || '',
          longitude: auditorium.longitude || '',
          ownerFirstName: auditorium.ownerFirstName || '',
          ownerLastName: auditorium.ownerLastName || '',
          ownerPhone: auditorium.ownerPhone || '',
          ownerEmail: auditorium.ownerEmail || '',
          password: '********', // Mask password for security
          confirmPassword: '********', // Mask confirm password
          businessTIN: auditorium.businessTIN || '',
          tinExpireDate: auditorium.tinExpireDate || '',
          logo: auditorium.logo
            ? auditorium.logo.startsWith('http')
              ? auditorium.logo
              : `${API_BASE_URL}/${auditorium.logo.replace(/^\//, '')}`
            : null,
          coverImage: auditorium.coverImage || null,
          tinCertificate: auditorium.tinCertificate || null
        }));
        setAuditoriums(mappedAuditoriums);
      } else {
        throw new Error(data.message || 'Failed to fetch auditoriums');
      }
    } catch (error) {
      console.error('Error fetching auditoriums:', error);
      setNotification({
        open: true,
        message: `Error fetching auditoriums: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedToggle = useCallback(
    async (_id) => {
      const toggleKey = `${_id}-featured`;
      if (toggleLoading[toggleKey]) return;

      const auditorium = auditoriums.find((a) => a._id === _id);
      if (!auditorium) {
        setNotification({
          open: true,
          message: 'Auditorium not found',
          severity: 'error'
        });
        return;
      }

      const newValue = !auditorium.featured;
      setToggleLoading((prev) => ({ ...prev, [toggleKey]: true }));
      setAuditoriums((prev) => prev.map((a) => (a._id === _id ? { ...a, featured: newValue } : a)));

      try {
        const endpoint = `${API_BASE_URL}/auditoriums/${_id}/toggle-featured`;
        const options = getFetchOptions('PATCH');
        const response = await fetch(endpoint, options);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Update failed');

        setAuditoriums((prev) =>
          prev.map((a) =>
            a._id === _id
              ? { ...a, featured: data.data.auditorium.isFeatured ?? a.featured }
              : a
          )
        );

        setNotification({
          open: true,
          message: `${auditorium.storeInfo} featured status updated successfully`,
          severity: 'success'
        });
      } catch (error) {
        console.error('❌ Featured toggle error:', {
          message: error.message,
          stack: error.stack
        });
        setAuditoriums((prev) => prev.map((a) => (a._id === _id ? { ...a, featured: !newValue } : a)));

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
    [auditoriums, API_BASE_URL, toggleLoading]
  );

  const handleStatusToggle = useCallback(
    async (_id) => {
      const toggleKey = `${_id}-status`;
      if (toggleLoading[toggleKey]) return;

      const auditorium = auditoriums.find((a) => a._id === _id);
      if (!auditorium) {
        setNotification({
          open: true,
          message: 'Auditorium not found',
          severity: 'error'
        });
        return;
      }

      const newValue = !auditorium.status;
      setToggleLoading((prev) => ({ ...prev, [toggleKey]: true }));
      setAuditoriums((prev) => prev.map((a) => (a._id === _id ? { ...a, status: newValue } : a)));

      try {
        const endpoint = `${API_BASE_URL}/auditoriums/${_id}/toggle-status`;
        const options = getFetchOptions('PATCH');
        const response = await fetch(endpoint, options);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Update failed');

        setAuditoriums((prev) =>
          prev.map((a) =>
            a._id === _id
              ? { ...a, status: data.data.auditorium.isActive ?? a.status }
              : a
          )
        );

        setNotification({
          open: true,
          message: `${auditorium.storeInfo} status updated successfully`,
          severity: 'success'
        });
      } catch (error) {
        console.error('❌ Status toggle error:', {
          message: error.message,
          stack: error.stack
        });
        setAuditoriums((prev) => prev.map((a) => (a._id === _id ? { ...a, status: !newValue } : a)));

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
    [auditoriums, API_BASE_URL, toggleLoading]
  );

  const handleDeleteConfirm = async () => {
    const storeName = auditoriumToDelete.storeInfo;
    try {
      const url = `${API_BASE_URL}/auditoriums/${auditoriumToDelete._id}`;
      const options = getFetchOptions('DELETE');
      const data = await makeAPICall(url, options);

      if (data.success) {
        setAuditoriums((prev) => prev.filter((a) => a._id !== auditoriumToDelete._id));
        setNotification({
          open: true,
          message: `${storeName} has been deleted successfully`,
          severity: 'success'
        });
      } else {
        throw new Error(data.message || 'Failed to delete auditorium');
      }
    } catch (error) {
      console.error('Error deleting auditorium:', error);
      setNotification({
        open: true,
        message: `Error deleting auditorium: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setOpenDeleteDialog(false);
      setAuditoriumToDelete(null);
    }
  };

  const handleDeleteClick = (auditorium) => {
    setAuditoriumToDelete(auditorium);
    setOpenDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setAuditoriumToDelete(null);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  const filteredAuditoriums = auditoriums.filter((auditorium) => {
    const matchesZone = selectedZone === 'All Zones' || auditorium.zone === selectedZone;
    const matchesSearch =
      auditorium.storeInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auditorium.ownerInfo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ['Sl', 'Auditorium Name', 'Owner Information', 'Zone', 'Featured', 'Status', 'Email', 'Password', 'Confirm Password'];
    const csvData = filteredAuditoriums.map((auditorium) => [
      auditorium.id,
      `"${auditorium.storeInfo}"`,
      `"${auditorium.ownerInfo}"`,
      `"${auditorium.zone}"`,
      auditorium.featured ? 'Yes' : 'No',
      auditorium.status ? 'Active' : 'Inactive',
      `"${auditorium.ownerEmail}"`,
      `"${auditorium.password}"`,
      `"${auditorium.confirmPassword}"`
    ]);

    const csvContent = [headers.join(','), ...csvData.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoriums_list_${new Date().toISOString().split('T')[0]}.csv`);
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
    const headers = ['Sl', 'Auditorium Name', 'Owner Information', 'Zone', 'Featured', 'Status', 'Email', 'Password', 'Confirm Password'];
    let excelContent = `
      <table border="1">
        <thead>
          <tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${filteredAuditoriums
            .map(
              (auditorium) => `
            <tr>
              <td>${auditorium.id}</td>
              <td>${auditorium.storeInfo}</td>
              <td>${auditorium.ownerInfo}</td>
              <td>${auditorium.zone}</td>
              <td>${auditorium.featured ? 'Yes' : 'No'}</td>
              <td>${auditorium.status ? 'Active' : 'Inactive'}</td>
              <td>${auditorium.ownerEmail}</td>
              <td>${auditorium.password}</td>
              <td>${auditorium.confirmPassword}</td>
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
    link.setAttribute('download', `auditoriums_list_${new Date().toISOString().split('T')[0]}.xls`);
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', p: 2, bgcolor: '#f5f5f5', gap: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ bgcolor: '#e3f2fd', p: 1, borderRadius: 1 }}>Total auditoriums: {auditoriums.length}</Box>
          <Box sx={{ bgcolor: '#fff3e0', p: 1, borderRadius: 1 }}>Active auditoriums: {auditoriums.filter((a) => a.status).length}</Box>
          <Box sx={{ bgcolor: '#e0f7fa', p: 1, borderRadius: 1 }}>Inactive auditoriums: {auditoriums.filter((a) => !a.status).length}</Box>
          <Box sx={{ bgcolor: '#fce4ec', p: 1, borderRadius: 1 }}>Newly joined auditoriums: 0</Box>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ bgcolor: 'green.50', p: 1, borderRadius: 1 }}>Total Transactions: 0</Box>
          <Box sx={{ bgcolor: 'green.50', p: 1, borderRadius: 1 }}>Commission Earned: $0</Box>
          <Box sx={{ bgcolor: '#ffebee', p: 1, borderRadius: 1 }}>Total Auditorium Withdraws: $0</Box>
        </Box>
      </Box>

      <Box
        sx={{ p: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, bgcolor: '#f5f5f5' }}
      >
        <TextField
          select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 150, bgcolor: 'white', borderRadius: 1 }}
        >
          <MenuItem value="All Zones">All Zones</MenuItem>
          {[...new Set(auditoriums.map((a) => a.zone))].map((zone) => (
            <MenuItem key={zone} value={zone}>
              {zone}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <TextField
            placeholder="Search Auditorium Name"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
            sx={{ bgcolor: 'white', borderRadius: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            endIcon={<Download />}
            onClick={handleClick}
            sx={{ textTransform: 'none' }}
          >
            Export
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={exportToExcel}>Excel</MenuItem>
            <MenuItem onClick={exportToCSV}>CSV</MenuItem>
          </Menu>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
          <CircularProgress size={20} />
          <Typography>Loading auditoriums...</Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ position: 'sticky', top: 0, bgcolor: '#f5f5f5', zIndex: 1 }}>
              <TableRow>
                <TableCell>Sl</TableCell>
                <TableCell>Auditorium Name</TableCell>
                <TableCell>Owner Information</TableCell>
                <TableCell>Zone</TableCell>
                <TableCell>Featured</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Password</TableCell>
                <TableCell>Confirm Password</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAuditoriums.map((auditorium) => {
                const featuredToggleKey = `${auditorium._id}-featured`;
                const statusToggleKey = `${auditorium._id}-status`;

                return (
                  <TableRow key={auditorium.id}>
                    <TableCell>{auditorium.id}</TableCell>
                    <TableCell>{auditorium.storeInfo}</TableCell>
                    <TableCell>{auditorium.ownerInfo}</TableCell>
                    <TableCell>{auditorium.zone}</TableCell>
                    <TableCell>
                      <Switch
                        checked={auditorium.featured}
                        color="primary"
                        onChange={() => handleFeaturedToggle(auditorium._id)}
                        disabled={toggleLoading[featuredToggleKey]}
                      />
                      {toggleLoading[featuredToggleKey] && <CircularProgress size={16} sx={{ ml: 1 }} />}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={auditorium.status}
                        color="primary"
                        onChange={() => handleStatusToggle(auditorium._id)}
                        disabled={toggleLoading[statusToggleKey]}
                      />
                      {toggleLoading[statusToggleKey] && <CircularProgress size={16} sx={{ ml: 1 }} />}
                    </TableCell>
                    <TableCell>{auditorium.ownerEmail}</TableCell>
                    <TableCell>{auditorium.password}</TableCell>
                    <TableCell>{auditorium.confirmPassword}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <IconButton color="primary" onClick={() => alert(`Viewing auditorium: ${auditorium.storeInfo}`)}>
                        <VisibilityOutlined />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => navigate('/auditoriums/edit', { state: { auditorium } })}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteClick(auditorium)}>
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

      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        sx={{ '& .MuiDialog-paper': { borderRadius: 2, padding: 2, maxWidth: 400 } }}
      >
        <DialogTitle id="delete-dialog-title">
          <Typography variant="h6" color="error">
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the auditorium "<strong>{auditoriumToDelete?.storeInfo}</strong>"? This action cannot be undone.
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

export default AuditoriumsList;
import React, { useEffect, useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  IconButton,
  Chip,
  InputAdornment,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Stack
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SortIcon from '@mui/icons-material/Sort';
import { useNavigate } from 'react-router-dom';
import { getAllVendors, deleteProvider, formatVendorsForList, getImageUrl } from '../api/providerApi';
import { API_BASE_URL } from '../utils/apiImageUtils';

function PhotographyProviderList() {
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('all');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  /* ================= FETCH VENDORS ================= */
  const fetchVendors = async () => {
    try {
      setLoading(true);

      const data = await getAllVendors(sortBy, sortOrder);
      const mappedVendors = formatVendorsForList(data.data);

      setVendors(mappedVendors);
    } catch (err) {
      setNotification({
        open: true,
        message: err.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchModules();
  }, [sortBy, sortOrder]);

  const fetchModules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/modules`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setModules(data);
      } else if (data.data && Array.isArray(data.data)) {
        setModules(data.data);
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
    }
  };

  /* ================= DELETE VENDOR ================= */
  const handleDeleteVendor = async (vendorId, name) => {
    if (!vendorId) {
      setNotification({
        open: true,
        message: 'Vendor ID missing. Cannot delete.',
        severity: 'error'
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteProvider(vendorId);

      setVendors(prev => prev.filter(v => v.vendorId !== vendorId));

      setNotification({
        open: true,
        message: 'Vendor deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  /* ================= FILTER ================= */
  const filteredVendors = vendors.filter(v => {
    const tabMatch = tabValue === 0 ? !v.isVerified : v.isVerified;
    const searchMatch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase());
    const moduleMatch = selectedModule === 'all' || v.moduleId === selectedModule;
    return tabMatch && searchMatch && moduleMatch;
  });

  /* ================= SORT OPTIONS ================= */
  const handleSortChange = (event) => {
    const value = event.target.value;
    if (value === '') {
      setSortBy('');
    } else {
      setSortBy(value);
    }
  };

  /* ================= UI ================= */
  return (
    <Box p={3} bgcolor="#f4f6f8" minHeight="100vh">
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Typography variant="h5" fontWeight={600} color="white">
          Photography Providers
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.9)">
          Manage photography vendors and view detailed profiles
        </Typography>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            bgcolor: '#f8f9fa',
            '& .MuiTab-root': { fontWeight: 600 }
          }}
        >
          <Tab label="Pending Vendors" />
          <Tab label="Verified Vendors" />
        </Tabs>

        <Box p={3}>
          {/* Controls */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            mb={3}
          >
            <Typography variant="h6" fontWeight={600}>
              Vendors ({filteredVendors.length})
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flex: 1, maxWidth: { sm: 600 } }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={handleSortChange}
                  startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="">Default</MenuItem>
                  <MenuItem value="packageCount">Most Packages</MenuItem>
                  <MenuItem value="bookingCount">Most Bookings</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Module</InputLabel>
                <Select
                  value={selectedModule}
                  label="Module"
                  onChange={(e) => setSelectedModule(e.target.value)}
                >
                  <MenuItem value="all">All Modules</MenuItem>
                  {modules.map((m) => (
                    <MenuItem key={m._id} value={m._id}>
                      {m.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                placeholder="Search vendor or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Stack>
          </Stack>

          {loading ? (
            <Box display="flex" alignItems="center" gap={2} py={4}>
              <CircularProgress size={22} />
              <Typography>Loading vendors...</Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Module</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Packages</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Bookings</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredVendors.map(vendor => (
                    <TableRow
                      key={vendor.vendorId}
                      hover
                      sx={{
                        '&:hover': { bgcolor: '#f8f9fa' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={getImageUrl(vendor.profilePhoto)}
                            sx={{
                              bgcolor: '#667eea',
                              width: 40,
                              height: 40
                            }}
                          >
                            {vendor.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography fontWeight={500}>{vendor.name}</Typography>
                        </Box>
                      </TableCell>

                      <TableCell>{vendor.email}</TableCell>
                      <TableCell>{vendor.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={vendor.module}
                          size="small"
                          sx={{ bgcolor: 'rgba(74, 144, 226, 0.1)', color: '#4a90e2', fontWeight: 500 }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={vendor.packageCount}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={vendor.bookingCount}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={vendor.status}
                          size="small"
                          color={vendor.isVerified ? 'success' : 'warning'}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              sx={{
                                color: '#667eea',
                                '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' }
                              }}
                              onClick={() => navigate(`/provider/${vendor.vendorId}/details`)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/photography/AddProvider/${vendor.vendorId}`)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteVendor(vendor.vendorId, vendor.name)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredVendors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No Vendors Found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(p => ({ ...p, open: false }))}
      >
        <Alert severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PhotographyProviderList;

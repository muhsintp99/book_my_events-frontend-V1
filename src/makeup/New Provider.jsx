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
  Paper
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://api.bookmyevent.ae/api/profile';

function CateringProvider() {
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  /* ================= FETCH VENDORS ================= */
  const fetchVendors = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/vendors/all`);
      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      // 🔥 IMPORTANT FIX: vendorId = user._id
      const mappedVendors = data.data
        .filter(v => v.user && v.user._id)
        .map((v, index) => ({
          id: index + 1,
          vendorId: v.user._id,
          name: `${v.user.firstName || ''} ${v.user.lastName || ''}`.trim() || 'N/A',
          email: v.user.email || 'N/A',
          phone: v.user.phone || 'N/A',
          isVerified: v.isVerified || false,
          status: v.isVerified ? 'Verified' : 'Pending'
        }));

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
  }, []);

  /* ================= DELETE VENDOR ONLY ================= */
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
      const res = await fetch(`${API_BASE}/vendor/${vendorId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setVendors(prev =>
        prev.filter(v => v.vendorId !== vendorId)
      );

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
    return tabMatch && searchMatch;
  });

  /* ================= UI ================= */
  return (
    <Box p={3} bgcolor="#f4f6f8" minHeight="100vh">
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          Providers List
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage catering vendors
        </Typography>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Pending Vendors" />
          <Tab label="Verified Vendors" />
        </Tabs>

        <Box p={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            gap={2}
          >
            <Typography variant="h6">
              Vendors ({filteredVendors.length})
            </Typography>

            <TextField
              size="small"
              placeholder="Search vendor or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {loading ? (
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress size={22} />
              <Typography>Loading vendors...</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredVendors.map(vendor => (
                  <TableRow key={vendor.vendorId} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar>
                          {vendor.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography>{vendor.name}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell>{vendor.email}</TableCell>
                    <TableCell>{vendor.phone}</TableCell>

                    <TableCell>
                      <Chip
                        label={vendor.status}
                        size="small"
                        color={vendor.isVerified ? 'success' : 'warning'}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          navigate(`/makeup/AddProvider/${vendor.vendorId}`)
                        }
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() =>
                          handleDeleteVendor(vendor.vendorId, vendor.name)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredVendors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No Vendors Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() =>
          setNotification(p => ({ ...p, open: false }))
        }
      >
        <Alert severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CateringProvider;

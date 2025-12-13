import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Avatar
} from '@mui/material';

import {
  Edit,
  Delete,
  Search
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

const ProvidersList = () => {
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0); // 0 = Pending, 1 = Verified
  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  /* ===============================
     FETCH VENDORS
  =============================== */
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://api.bookmyevent.ae/api/users?role=vendor');
        const data = await res.json();

        if (!Array.isArray(data.users)) {
          throw new Error('Invalid vendor data');
        }

        const mapped = data.users.map((u, index) => ({
          id: index + 1,
          _id: u._id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
          email: u.email || 'N/A',
          phone: u.phone || u.mobile || 'N/A',
          isVerified: u.isVerified || false,
          status: u.isVerified ? 'Verified' : 'Pending'
        }));

        setProviders(mapped);
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

    fetchProviders();
  }, []);

  /* ===============================
     FILTER LOGIC
  =============================== */
  const filteredProviders = providers.filter((p) => {
    const matchesTab = tabValue === 0 ? !p.isVerified : p.isVerified;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  /* ===============================
     UI
  =============================== */
  return (
    <Box p={3} bgcolor="#f4f6f8" minHeight="100vh">
      {/* HEADER */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          Providers List
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage pending & verified providers
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip label={`Total: ${providers.length}`} color="primary" />
          <Chip
            label={`Verified: ${providers.filter(p => p.isVerified).length}`}
            color="success"
          />
          <Chip
            label={`Pending: ${providers.filter(p => !p.isVerified).length}`}
            color="warning"
          />
        </Box>
      </Paper>

      {/* TABS + SEARCH */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Pending Providers" />
            <Tab label="Verified Providers" />
          </Tabs>

          <TextField
            size="small"
            placeholder="Search provider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
        </Box>
      </Paper>

      {/* TABLE */}
      <Paper sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box p={3} display="flex" gap={2}>
            <CircularProgress size={22} />
            <Typography>Loading providers...</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Provider</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredProviders.map((p) => (
                <TableRow key={p._id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar>{p.name.charAt(0)}</Avatar>
                      <Typography>{p.name}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.phone}</TableCell>

                  <TableCell>
                    <Chip
                      label={p.status}
                      size="small"
                      color={p.isVerified ? 'success' : 'warning'}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/makeup/AddProvider/${p._id}`)}
                    >
                      <Edit />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => alert(`Delete provider ${p.name}`)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {filteredProviders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No providers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* SNACKBAR */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() =>
          setNotification((p) => ({ ...p, open: false }))
        }
      >
        <Alert severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProvidersList;

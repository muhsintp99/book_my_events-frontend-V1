import React, { useState, useEffect } from 'react';
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
  IconButton,
  TextField,
  InputAdornment,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';

import { Edit, Delete, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProvidersList = ({ isVerified }) => {
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://api.bookmyevent.ae/api/users');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const mapped = data.users.map((u, index) => ({
          id: index + 1,
          _id: u._id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
          email: u.email || 'N/A',
          phone: u.phone || u.mobile || 'N/A',
          verified: u.isVerified || false
        }));

        setUsers(mapped);
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

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const tabMatch = tabValue === 0 ? !u.verified : u.verified;
    const searchMatch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return tabMatch && searchMatch;
  });

  if (isVerified) {
    return (
      <Box p={3} display="flex" justifyContent="center">
        <Typography variant="h6">Provider is verified</Typography>
      </Box>
    );
  }

  return (
    <Box p={3} bgcolor="#f4f6f8" minHeight="100vh">

      {/* HEADER */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          Providers List
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage provider stores, status & details
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip label={`Total: ${users.length}`} color="primary" />
          <Chip
            label={`Verified: ${users.filter(u => u.verified).length}`}
            color="success"
          />
          <Chip
            label={`Pending: ${users.filter(u => !u.verified).length}`}
            color="warning"
          />
        </Box>
      </Paper>

      {/* TABS */}
      <Paper sx={{ borderRadius: 2, mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Pending Stores" />
          <Tab label="Verified Stores" />
        </Tabs>
      </Paper>

      {/* SEARCH */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <TextField
          size="small"
          placeholder="Search name or email"
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
                <TableCell>Sl</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u._id} hover>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={u.verified ? 'Verified' : 'Pending'}
                      color={u.verified ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/makeup/AddProvider/${u._id}`)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => alert(`Delete ${u.name}`)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
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
        onClose={() => setNotification(p => ({ ...p, open: false }))}
      >
        <Alert severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProvidersList;

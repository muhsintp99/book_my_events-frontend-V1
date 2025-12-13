import React, { useState, useEffect, useMemo } from 'react';
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

function NewProvider({ isVerified }) {
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

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  const getFetchOptions = (method = 'GET', body = null) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      mode: 'cors'
    };
    if (body) options.body = JSON.stringify(body);
    return options;
  };

  const makeAPICall = async (url, options, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        throw error;
      }
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await makeAPICall(
          'https://api.bookmyevent.ae/api/users',
          getFetchOptions()
        );

        if (Array.isArray(data.users)) {
          setUsers(
            data.users.map((user, index) => ({
              id: index + 1,
              _id: user._id,
              userInfo: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              email: user.email || 'N/A',
              role: user.role || 'N/A',
              isVerified: user.isVerified || false,
              status: user.isVerified ? 'Verified' : 'Pending'
            }))
          );
        } else {
          throw new Error('Unexpected data format');
        }
      } catch (error) {
        setNotification({
          open: true,
          message: error.message,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesTab = tabValue === 0 ? !user.isVerified : user.isVerified;
      const matchesSearch =
        user.userInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [users, tabValue, searchTerm]);

  if (isVerified) {
    return (
      <Box p={3} display="flex" justifyContent="center">
        <Typography variant="h6">Provider is verified</Typography>
      </Box>
    );
  }

  return (
    <Box p={3} bgcolor="#f4f6f8" minHeight="100vh">
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          Providers List
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage providers with edit & delete actions
        </Typography>
      </Paper>

      <Paper sx={{ borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Pending Stores" />
          <Tab label="Verified Stores" />
        </Tabs>

        <Box p={3}>
          <Box display="flex" justifyContent="space-between" mb={2} gap={2}>
            <Typography variant="h6">
              Stores ({filteredUsers.length})
            </Typography>

            <TextField
              size="small"
              placeholder="Search user or email"
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
            <Box display="flex" gap={2}>
              <CircularProgress size={22} />
              <Typography>Loading users...</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar>{user.userInfo.charAt(0)}</Avatar>
                        <Typography>{user.userInfo}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.email}</TableCell>

                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        color={user.isVerified ? 'success' : 'warning'}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/makeup/AddProvider/${user._id}`)}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() => alert(`Delete ${user.userInfo}`)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No Data Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Box>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification((p) => ({ ...p, open: false }))}
      >
        <Alert severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default NewProvider;

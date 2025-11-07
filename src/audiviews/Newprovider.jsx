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
} from '@mui/material';

function NewProvider({ isVerified }) {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'error',
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getFetchOptions = (method = 'GET', body = null) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      mode: 'cors',
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
          if (response.status === 401) throw new Error('Authentication required - please login again');
          if (response.status === 403) throw new Error('Access forbidden - insufficient permissions');
          if (response.status === 404) throw new Error('Resource not found');
          if (response.status >= 500) throw new Error('Server error - please try again later');
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        if (error.name === 'AbortError') throw new Error('Request timed out - please check your connection');
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))
          throw new Error('Network error - please check if the server is running and CORS is properly configured');
        throw error;
      }
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const url = 'https://api.bookmyevent.ae/api/users';
        const options = getFetchOptions();
        const data = await makeAPICall(url, options);

        if (Array.isArray(data.users)) {
          const mappedUsers = data.users.map((user, index) => ({
            id: index + 1,
            _id: user._id,
            userInfo: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.email || 'N/A',
            role: user.role || 'N/A',
            status: user.isVerified ? 'Verified' : 'Pending',
            isVerified: user.isVerified || false,
          }));
          setUsers(mappedUsers);
        } else {
          throw new Error('Unexpected data format');
        }
      } catch (error) {
        setNotification({
          open: true,
          message: `Error fetching users: ${error.message}`,
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleCloseNotification = (_, reason) => {
    if (reason === 'clickaway') return;
    setNotification((p) => ({ ...p, open: false }));
  };

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
      <Box sx={{ p: 3, bgcolor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="h6">Provider is verified</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'white', overflowX: 'auto' }}>
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto">
        <Tab label="Pending Stores" />
        <Tab label="Verified Stores" />
      </Tabs>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1 }}>
        <Typography variant="h6">Stores List ({filteredUsers.length})</Typography>
        <TextField
          variant="outlined"
          placeholder="Search User or Email"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: { xs: '100%', sm: 200 } }}
        />
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
            <CircularProgress size={20} />
            <Typography>Loading users...</Typography>
          </Box>
        ) : (
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Sl</TableCell>
                <TableCell>User Information</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="h6" sx={{ py: 3 }}>
                      No Data Found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.userInfo}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Box>

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
    </Box>
  );
}

export default NewProvider;

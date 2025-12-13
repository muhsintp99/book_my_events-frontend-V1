import React, { useState, useEffect } from 'react';
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
  Paper,
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

function CateringProvider({ isVerified }) {
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const res = await fetch('https://api.bookmyevent.ae/api/users');
        const data = await res.json();

        if (!Array.isArray(data.users)) {
          throw new Error('Unexpected data format');
        }

        // ✅ ONLY VENDORS
        const vendors = data.users
          .filter((u) => u.role === 'vendor')
          .map((user, index) => ({
            id: index + 1,
            _id: user._id,
            name: `${user.firstName || ''} ${user.lastName || ''}`,
            email: user.email || 'N/A',
            phone: user.phone || user.mobile || 'N/A',
            isVerified: user.isVerified || false,
            status: user.isVerified ? 'Verified' : 'Pending'
          }));

        setUsers(vendors);
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

  const filteredUsers = users.filter((user) => {
    const matchesTab = tabValue === 0 ? !user.isVerified : user.isVerified;
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
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
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          Vendor List
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage vendors with edit & delete options
        </Typography>
      </Paper>

      <Paper sx={{ borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
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
              Total: {filteredUsers.length}
            </Typography>

            <TextField
              size="small"
              placeholder="Search vendor..."
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
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Typography>{user.name}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>

                    <TableCell>
                      <Chip
                        label={user.status}
                        color={user.isVerified ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          navigate(`/makeup/AddProvider/${user._id}`)
                        }
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() =>
                          alert(`Delete vendor ${user.name}`)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No vendors found
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
        onClose={() =>
          setNotification({ ...notification, open: false })
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

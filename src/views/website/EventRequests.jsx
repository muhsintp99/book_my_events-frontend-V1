import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Drawer,
  Grid,
  Card,
  Stack,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarMonth as DateIcon,
  People as GuestIcon,
  LocationOn as LocationIcon,
  CurrencyRupee as BudgetIcon,
} from '@mui/icons-material';
import { API_BASE_URL } from '../../utils/apiImageUtils';

const EventRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Drawer & status loading state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const getAuthToken = () => localStorage.getItem('token') || '';

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/event-requests/admin`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setRequests(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch requests');
      }
    } catch (err) {
      console.error('Error fetching event requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdatingStatusId(id);
      const response = await fetch(`${API_BASE_URL}/event-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(`Status updated to ${status}`);
        // Locally update to avoid full reload flickers
        setRequests(prev => prev.map(req => req._id === id ? { ...req, status } : req));
        if (selectedRequest && selectedRequest._id === id) {
            setSelectedRequest(result.data);
        }
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.message || 'Failed to update status');
      }
    } catch (err) {
      setError(err.message);
    } finally {
        setUpdatingStatusId(null);
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event request?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/event-requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setSuccess('Request deleted successfully');
        fetchRequests();
        if (drawerOpen) setDrawerOpen(false);
      } else {
        throw new Error(result.message || 'Failed to delete request');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleViewClick = (request) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedRequest(null);
  };

  const filteredRequests = requests.filter(req => 
    req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.mobileNumber.includes(searchTerm) ||
    req.eventType.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { main: '#9a3412', bg: '#fff7ed' };
      case 'interested': return { main: '#1d4ed8', bg: '#eff6ff' };
      case 'contacted': return { main: '#7c3aed', bg: '#f5f3ff' };
      case 'follow_up': return { main: '#be185d', bg: '#fdf2f8' };
      case 'confirmed': return { main: '#15803d', bg: '#f0fdf4' };
      case 'cancelled': return { main: '#b91c1c', bg: '#fef2f2' };
      case 'closed': return { main: '#334155', bg: '#f8fafc' };
      default: return { main: '#64748b', bg: '#f1f5f9' };
    }
  };

  return (
    <Box sx={{ p: 0, backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      <Box sx={{ p: 3 }}>
        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff', borderBottom: '1px solid #f1f5f9' }}>
                <Box>
                    <Typography variant="h5" fontWeight={800} color="#1e293b">Event Enquiries</Typography>
                    <Typography variant="body2" color="textSecondary">Manage your custom website enquiries</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<RefreshIcon />} 
                    onClick={fetchRequests} 
                    sx={{ borderRadius: 2, bgcolor: '#EA4C46', '&:hover': { bgcolor: '#CD3D37' }, textTransform: 'none', fontWeight: 700 }}
                >
                    Refresh
                </Button>
            </Box>

            <Box sx={{ p: 2, bgcolor: '#f8fafc' }}>
                <TextField
                    variant="outlined"
                    placeholder="Search by client name, mobile, or event type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
                    InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: '#94a3b8' }} /> }}
                />
            </Box>

            {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ m: 2 }}>{success}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center" p={10}><CircularProgress /></Box>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                            <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Client Info</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Requirements</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Budget</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#475569', minWidth: 180 }}>Update Status</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Date</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: '#475569' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRequests.map((req) => (
                            <TableRow key={req._id} sx={{ '&:hover': { bgcolor: '#f1f5f9' } }}>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={700}>{req.fullName}</Typography>
                                    <Typography variant="caption" color="primary" fontWeight={600}>{req.mobileNumber}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {req.eventType.map((t, i) => (
                                            <Chip key={i} label={t} size="small" variant="outlined" sx={{ borderRadius: 1, fontSize: '0.65rem' }} />
                                        ))}
                                    </Box>
                                    <Typography variant="caption" color="textSecondary">{req.guestCount} Guests · {req.eventLocation}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={800}>₹{req.minBudget?.toLocaleString()} - {req.maxBudget?.toLocaleString()}</Typography>
                                </TableCell>
                                <TableCell>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={req.status}
                                            onChange={(e) => updateStatus(req._id, e.target.value)}
                                            disabled={updatingStatusId === req._id}
                                            sx={{ 
                                                borderRadius: 2, 
                                                fontSize: '0.8rem', 
                                                fontWeight: 700,
                                                bgcolor: getStatusColor(req.status).bg,
                                                color: getStatusColor(req.status).main,
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: `${getStatusColor(req.status).main}50` },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: getStatusColor(req.status).main }
                                            }}
                                        >
                                            <MenuItem value="pending" sx={{ fontWeight: 600 }}>Pending</MenuItem>
                                            <MenuItem value="interested" sx={{ fontWeight: 600 }}>Interested</MenuItem>
                                            <MenuItem value="contacted" sx={{ fontWeight: 600 }}>Contacted</MenuItem>
                                            <MenuItem value="follow_up" sx={{ fontWeight: 600 }}>Follow Up</MenuItem>
                                            <MenuItem value="confirmed" sx={{ fontWeight: 600 }}>Confirmed</MenuItem>
                                            <MenuItem value="cancelled" sx={{ fontWeight: 600 }}>Cancelled</MenuItem>
                                            <MenuItem value="closed" sx={{ fontWeight: 600 }}>Closed</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{new Date(req.createdAt).toLocaleDateString()}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Tooltip title="View All Details">
                                            <IconButton size="small" sx={{ color: '#334155' }} onClick={() => handleViewClick(req)}>
                                                <ViewIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => deleteRequest(req._id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </Card>
      </Box>

      {/* Detail Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 500 }, p: 0, borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }
        }}
      >
        {selectedRequest && (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 3, bgcolor: '#1e293b', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={800} color='white'>Consultation Request</Typography>
                    <IconButton onClick={handleDrawerClose} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 4 }}>
                    <Stack spacing={4}>
                        {/* Summary */}
                        <Box>
                            <Typography variant="subtitle1" fontWeight={800} color="#1e293b" gutterBottom>CLIENT CONTACT</Typography>
                            <Card sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ p: 1, bgcolor: '#f1f5f9', borderRadius: 2 }}><PhoneIcon sx={{ color: '#64748b' }} /></Box>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">Full Name</Typography>
                                            <Typography variant="body1" fontWeight={800}>{selectedRequest.fullName}</Typography>
                                            <Typography variant="body2" color="primary" fontWeight={700}>{selectedRequest.mobileNumber}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ p: 1, bgcolor: '#f1f5f9', borderRadius: 2 }}><EmailIcon sx={{ color: '#64748b' }} /></Box>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">Email Address</Typography>
                                            <Typography variant="body2" fontWeight={700}>{selectedRequest.email || 'N/A'}</Typography>
                                        </Box>
                                    </Box>
                                </Stack>
                            </Card>
                        </Box>

                        {/* Details */}
                        <Box>
                            <Typography variant="subtitle1" fontWeight={800} color="#1e293b" gutterBottom>EVENT SPECIFICATIONS</Typography>
                            <Card sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="textSecondary">Selected Categories</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                            {selectedRequest.eventType.map((t, i) => (
                                                <Chip key={i} label={t} sx={{ fontWeight: 700 }} />
                                            ))}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <DateIcon fontSize="small" color="action" />
                                            <Box>
                                                <Typography variant="caption" color="textSecondary">Date</Typography>
                                                <Typography variant="body2" fontWeight={700}>{selectedRequest.eventDate}</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <GuestIcon fontSize="small" color="action" />
                                            <Box>
                                                <Typography variant="caption" color="textSecondary">Guests</Typography>
                                                <Typography variant="body2" fontWeight={700}>{selectedRequest.guestCount}</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <LocationIcon fontSize="small" color="action" />
                                            <Box>
                                                <Typography variant="caption" color="textSecondary">Location</Typography>
                                                <Typography variant="body2" fontWeight={700}>{selectedRequest.eventLocation}</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <BudgetIcon fontSize="small" color="action" />
                                            <Box>
                                                <Typography variant="caption" color="textSecondary">Planned Budget Range</Typography>
                                                <Typography variant="h6" fontWeight={800} color="#EA4C46">₹{selectedRequest.minBudget?.toLocaleString()} - ₹{selectedRequest.maxBudget?.toLocaleString()}</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Card>
                        </Box>

                        {/* Notes */}
                        <Box>
                            <Typography variant="subtitle1" fontWeight={800} color="#1e293b" gutterBottom>CLIENT NOTES</Typography>
                            <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 4, border: '1px dashed #cbd5e1', fontWeight: 600 }}>
                                {selectedRequest.notes ? selectedRequest.notes : "No special notes provided."}
                            </Box>
                        </Box>
                    </Stack>
                </Box>

                {/* Status Update Section In Drawer Too */}
                <Box sx={{ p: 4, bgcolor: '#fff', borderTop: '1px solid #f1f5f9' }}>
                    <Typography variant="subtitle2" color="textSecondary" fontWeight={800} sx={{ mb: 2 }}>CURRENT PIPELINE STAGE</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        {['pending', 'interested', 'contacted', 'follow_up', 'confirmed', 'cancelled', 'closed'].map((st) => (
                            <Button 
                                key={st}
                                size="small"
                                variant={selectedRequest.status === st ? "contained" : "outlined"}
                                onClick={() => updateStatus(selectedRequest._id, st)}
                                sx={{ 
                                    textTransform: 'capitalize', 
                                    borderRadius: 5,
                                    fontWeight: 700,
                                    bgcolor: selectedRequest.status === st ? getStatusColor(st).main : 'transparent',
                                    color: selectedRequest.status === st ? '#fff' : getStatusColor(st).main,
                                    borderColor: getStatusColor(st).main,
                                    '&:hover': {
                                        bgcolor: selectedRequest.status === st ? getStatusColor(st).main : `${getStatusColor(st).bg}`
                                    }
                                }}
                            >
                                {st.replace('_', ' ')}
                            </Button>
                        ))}
                    </Stack>
                </Box>
            </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default EventRequests;

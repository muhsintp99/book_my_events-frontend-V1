import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer,
    Switch, IconButton, Box, MenuItem, TextField, InputAdornment, Button, Menu,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Typography, Snackbar, Alert, CircularProgress, Chip, Stack, FormControl,
    InputLabel, Select, Grid
} from '@mui/material';
import {
    VisibilityOutlined, Edit, Delete, Download, Add as AddIcon,
    Search as SearchIcon, FileDownload as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getApiImageUrl } from '../utils/apiImageUtils';
import { getAllVendors, formatVendorsForList } from '../api/providerApi';

const InvitationList = () => {
    const navigate = useNavigate();
    const [invitations, setInvitations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [anchorEl, setAnchorEl] = useState(null);

    const API_URL = `${API_BASE_URL}/invitations`;

    const fetchInvitations = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await res.json();
            if (data?.success || Array.isArray(data.data)) {
                setInvitations(data.data || []);
            }
        } catch (e) {
            console.error('Fetch error:', e);
            // setNotification({ open: true, message: 'Failed to fetch invitations', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const res = await fetch(`${API_URL}/${itemToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                setNotification({ open: true, message: 'Deleted successfully', severity: 'success' });
                fetchInvitations();
            }
        } catch (e) {
            setNotification({ open: true, message: 'Delete failed', severity: 'error' });
        } finally {
            setOpenDeleteDialog(false);
        }
    };

    const filtered = invitations.filter(inv =>
        (inv.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.provider?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box p={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Invitation & Printing List</Typography>
                <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/invitation/AddProvider')}>
                    Add Invitation
                </Button>
            </Stack>

            <TableContainer component={Paper}>
                <Box p={2} display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                    <TextField
                        placeholder="Search invitations..."
                        size="small"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                        sx={{ width: 300 }}
                    />
                </Box>

                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell>Sl</TableCell>
                            <TableCell>Image</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Provider</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" py={5}><CircularProgress /></TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" py={5}>No invitations found</TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((inv, idx) => (
                                <TableRow key={inv._id} hover>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>
                                        <Box component="img" src={getApiImageUrl(inv.thumbnail)} sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }} />
                                    </TableCell>
                                    <TableCell>{inv.name}</TableCell>
                                    <TableCell>{inv.provider?.firstName} {inv.provider?.lastName}</TableCell>
                                    <TableCell>₹{inv.buyPricing?.totalPrice || 0}</TableCell>
                                    <TableCell>
                                        <Chip label={inv.isActive ? 'Active' : 'Inactive'} color={inv.isActive ? 'success' : 'default'} size="small" />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" color="primary" onClick={() => navigate(`/invitation/AddProvider/${inv._id}`)}><Edit /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(inv)}><Delete /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent><DialogContentText>Are you sure you want to delete this invitation?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })}>
                <Alert severity={notification.severity} variant="filled">{notification.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default InvitationList;

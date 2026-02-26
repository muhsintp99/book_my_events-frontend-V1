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

const EmceeList = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [anchorEl, setAnchorEl] = useState(null);

    const API_URL = `${API_BASE_URL}/emcees`;

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await res.json();
            if (data?.success || Array.isArray(data.data)) {
                setItems(data.data || []);
            }
        } catch (e) {
            console.error('Fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

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
                fetchItems();
            }
        } catch (e) {
            setNotification({ open: true, message: 'Delete failed', severity: 'error' });
        } finally {
            setOpenDeleteDialog(false);
        }
    };

    const filtered = items.filter(item =>
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.provider?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box p={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Emcee List</Typography>
                <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/emcee/AddProvider')}>
                    Add Emcee
                </Button>
            </Stack>

            <TableContainer component={Paper}>
                <Box p={2} display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                    <TextField
                        placeholder="Search emcees..."
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
                                <TableCell colSpan={7} align="center" py={5}>No emcees found</TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((item, idx) => (
                                <TableRow key={item._id} hover>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>
                                        <Box component="img" src={getApiImageUrl(item.thumbnail)} sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }} />
                                    </TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.provider?.firstName} {item.provider?.lastName}</TableCell>
                                    <TableCell>₹{item.buyPricing?.totalPrice || 0}</TableCell>
                                    <TableCell>
                                        <Chip label={item.isActive ? 'Active' : 'Inactive'} color={item.isActive ? 'success' : 'default'} size="small" />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" color="primary" onClick={() => navigate(`/emcee/AddProvider/${item._id}`)}><Edit /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(item)}><Delete /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent><DialogContentText>Are you sure you want to delete this emcee?</DialogContentText></DialogContent>
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

export default EmceeList;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Stack,
    Snackbar,
    Alert,
    Tabs,
    Tab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import MainCard from 'ui-component/cards/MainCard';
import { API_BASE_URL } from '../../utils/apiImageUtils';

const WithdrawalRequests = () => {
    const theme = useTheme();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processLoading, setProcessLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const [statusTab, setStatusTab] = useState('pending');

    const fetchRequests = async (status) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/admin/wallet/all-withdrawals?status=${status}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setRequests(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
            setToast({ open: true, message: 'Failed to fetch withdrawal requests', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests(statusTab);
    }, [statusTab]);

    const handleProcess = async () => {
        if (!selectedRequest || !actionType) return;
        setProcessLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/admin/wallet/process-withdrawal`, {
                walletId: selectedRequest._id,
                transactionId: selectedRequest.transaction._id,
                action: actionType
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setToast({ 
                    open: true, 
                    message: `Withdrawal successfully ${actionType}ed`, 
                    severity: 'success' 
                });
                setOpenDialog(false);
                fetchRequests(statusTab);
            }
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            setToast({ 
                open: true, 
                message: error.response?.data?.message || 'Error processing request', 
                severity: 'error' 
            });
        } finally {
            setProcessLoading(false);
        }
    };

    const openConfirmDialog = (request, type) => {
        setSelectedRequest(request);
        setActionType(type);
        setOpenDialog(true);
    };

    const handleTabChange = (event, newValue) => {
        setStatusTab(newValue);
    };

    const getStatusChip = (status) => {
        const config = {
            pending: { color: 'warning', label: 'Pending' },
            completed: { color: 'success', label: 'Completed' },
            failed: { color: 'error', label: 'Rejected' },
        };
        const { color, label } = config[status] || { color: 'default', label: status };
        return <Chip label={label} color={color} size="small" sx={{ fontWeight: 600 }} />;
    };

    return (
        <MainCard title="Vendor Withdrawal Requests">
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary">
                    Review and process payout requests from platform vendors. 
                    Approving a request marks it as completed. Rejecting it returns the funds to the vendor's wallet.
                </Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                    value={statusTab} 
                    onChange={handleTabChange} 
                    textColor="secondary"
                    indicatorColor="secondary"
                    aria-label="withdrawal status tabs"
                >
                    <Tab label="Pending (New)" value="pending" />
                    <Tab label="Completed" value="completed" />
                    <Tab label="Rejected" value="failed" />
                    <Tab label="Show All" value="all" />
                </Tabs>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress color="error" />
                </Box>
            ) : requests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="h5" color="textSecondary">No {statusTab} withdrawal requests found</Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eef2f6' }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell>Vendor Details</TableCell>
                                <TableCell>Requested Date</TableCell>
                                <TableCell align="right">Amount (₹)</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map((req) => (
                                <TableRow key={req.transaction._id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle1" fontWeight={600}>{req.vendorName}</Typography>
                                        <Typography variant="caption" display="block">{req.email}</Typography>
                                        <Typography variant="caption" color="primary">{req.phone}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(req.transaction.date).toLocaleDateString()}
                                        <Typography variant="caption" display="block">
                                            {new Date(req.transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="subtitle1" fontWeight={700} color="error">
                                            ₹ {req.transaction.amount.toLocaleString()}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Balance: ₹ {req.currentBalance.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{req.transaction.description}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {getStatusChip(req.transaction.status)}
                                    </TableCell>
                                    <TableCell align="center">
                                        {req.transaction.status === 'pending' ? (
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Button 
                                                    size="small" 
                                                    variant="contained" 
                                                    color="success"
                                                    startIcon={<CheckCircleOutlineIcon />}
                                                    onClick={() => openConfirmDialog(req, 'approve')}
                                                    sx={{ borderRadius: '8px' }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button 
                                                    size="small" 
                                                    variant="outlined" 
                                                    color="error"
                                                    startIcon={<HighlightOffIcon />}
                                                    onClick={() => openConfirmDialog(req, 'reject')}
                                                    sx={{ borderRadius: '8px' }}
                                                >
                                                    Reject
                                                </Button>
                                            </Stack>
                                        ) : (
                                            <Typography variant="caption" color="textSecondary">
                                                Processed
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>
                    {actionType === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal Request'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        Are you sure you want to <strong>{actionType}</strong> the withdrawal request of 
                        <strong style={{ color: theme.palette.error.main }}> ₹ {selectedRequest?.transaction?.amount.toLocaleString()} </strong> 
                        for <strong>{selectedRequest?.vendorName}</strong>?
                    </Typography>
                    {actionType === 'reject' && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                            Rejecting this request will automatically credit the amount back to the vendor's wallet balance.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} disabled={processLoading}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        color={actionType === 'approve' ? 'success' : 'error'}
                        onClick={handleProcess}
                        disabled={processLoading}
                        startIcon={processLoading ? <CircularProgress size={16} /> : null}
                    >
                        Confirm {actionType}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={toast.open} 
                autoHideDuration={6000} 
                onClose={() => setToast({ ...toast, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={toast.severity} sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </MainCard>
    );
};

export default WithdrawalRequests;

import React, { useState, useEffect, useMemo } from "react";
import {
    Box, Button, Typography, Chip, Avatar, Table, TableBody, TableCell,
    TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, FormControl, InputLabel, Select, CircularProgress,
    Paper, Divider, Card, CardContent, Grid, Tooltip, Tabs, Tab, Stack, alpha,
    useTheme, MenuItem
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PendingIcon from "@mui/icons-material/Pending";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PaymentIcon from "@mui/icons-material/Payment";
import TimerIcon from "@mui/icons-material/Timer";
import FilterListIcon from "@mui/icons-material/FilterList";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import * as XLSX from "xlsx";

const SubscriptionRequests = () => {
    const theme = useTheme();
    const [requests, setRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [moduleFilter, setModuleFilter] = useState("all");
    const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
    const [actionDialog, setActionDialog] = useState({ open: false, data: null, action: "" });
    const [paymentDialog, setPaymentDialog] = useState({ open: false, data: null });
    const [adminNote, setAdminNote] = useState("");
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const getAuthToken = () => localStorage.getItem("token") || sessionStorage.getItem("token") || "";

    useEffect(() => {
        fetchRequests();
        fetchModules();
        
        // Handle Return from HDFC Payment
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get("orderId");
        if (orderId) {
            verifyPayment(orderId);
        }
    }, []);

    // ================= HDFC PAYMENT VERIFICATION =================
    const verifyPayment = async (orderId) => {
        try {
            const res = await fetch("https://api.bookmyevent.ae/api/admin/subscription-request/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId })
            });
            const data = await res.json();
            
            if (data.success) {
                alert("✅ Payment Successful! Subscription has been activated.");
                window.history.replaceState({}, document.title, window.location.pathname);
                fetchRequests();
            } else if (data.status === "pending") {
                // Auto-retry verification if pending
                setTimeout(() => verifyPayment(orderId), 3000);
            } else {
                alert("❌ Payment Verification Failed: " + (data.message || "Unknown error"));
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (error) {
            console.error("Verification error:", error);
        }
    };

    // ================= HDFC PAYMENT INITIATION =================
    const handlePayAndApprove = async (request) => {
        setPaymentLoading(true);
        try {
            const token = getAuthToken();
            const res = await fetch("https://api.bookmyevent.ae/api/admin/subscription-request/payment/initiate", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    requestId: request.id,
                    adminNote: adminNote || `Payment for ${request.planName}`
                })
            });
            const data = await res.json();
            
            if (data.success && data.payment_links?.web) {
                // Redirect to HDFC Gateway
                window.location.href = data.payment_links.web;
            } else {
                alert(data.message || "Failed to initiate payment");
            }
        } catch (error) {
            console.error("Payment initiation error:", error);
            alert("Error connecting to payment gateway");
        } finally {
            setPaymentLoading(false);
        }
    };

    // ================= DATA FETCHING =================
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch("https://api.bookmyevent.ae/api/admin/subscription/requests", {
                headers: { Authorization: `Bearer ${getAuthToken()}` }
            });
            const data = await res.json();
            if (data.success) {
                const mapped = data.requests.map(r => ({
                    id: r._id,
                    userName: r.userId ? `${r.userId.firstName || ""} ${r.userId.lastName || ""}`.trim() : "Unknown",
                    userEmail: r.userId?.email || "",
                    userPhone: r.userId?.phone || "",
                    userAvatar: r.userId?.avatar || "",
                    planName: r.planId?.name || "N/A",
                    planPrice: r.planId?.price || 0,
                    planDuration: r.planId?.durationInDays || 0,
                    module: r.moduleId?.title || "Other",
                    status: r.status,
                    requestDate: new Date(r.createdAt).toLocaleDateString(),
                    adminNote: r.adminNote || ""
                }));
                setRequests(mapped);
            }
        } catch (err) { 
            console.error("Fetch error:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    const fetchModules = async () => {
        try {
            const res = await fetch("https://api.bookmyevent.ae/api/modules");
            const data = await res.json();
            setModules(Array.isArray(data) ? data : (data.modules || []));
        } catch (err) { 
            console.error("Modules error:", err); 
        }
    };

    // ================= STATUS UI =================
    const getStatusChip = status => {
        const config = {
            pending: { label: "Pending", color: "warning", icon: <PendingIcon fontSize="small" /> },
            approved: { label: "Approved", color: "success", icon: <CheckCircleIcon fontSize="small" /> },
            rejected: { label: "Rejected", color: "error", icon: <CancelIcon fontSize="small" /> }
        };
        const cfg = config[status] || config.pending;
        return <Chip label={cfg.label} color={cfg.color} size="small" icon={cfg.icon} sx={{ fontWeight: 600, px: 1 }} />;
    };

    const filteredRequests = useMemo(() => {
        return requests.filter(r => {
            const matchSearch = r.userName.toLowerCase().includes(searchQuery.toLowerCase()) || r.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === "all" || r.status === statusFilter;
            const matchModule = moduleFilter === "all" || r.module === moduleFilter;
            const matchTab = tabValue === 0 || (tabValue === 1 && r.status === "pending") || (tabValue === 2 && r.status === "approved") || (tabValue === 3 && r.status === "rejected");
            return matchSearch && matchStatus && matchModule && matchTab;
        });
    }, [requests, searchQuery, statusFilter, moduleFilter, tabValue]);

    const stats = useMemo(() => ({
        total: requests.length,
        pending: requests.filter(r => r.status === "pending").length,
        revenue: requests.filter(r => r.status === "approved").reduce((sum, r) => sum + r.planPrice, 0)
    }), [requests]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, background: "#f4f7fe", minHeight: "100vh" }}>
            {/* Professional Header */}
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 4, 
                    mb: 4, 
                    borderRadius: 4, 
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, 
                    color: "white" 
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} letterSpacing={-0.5} color="white">
                            Subscription Requests
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.95, color: "white", mt: 0.5 }}>
                            Manage and approve vendor plan applications
                        </Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        startIcon={<FileDownloadIcon />} 
                        onClick={() => {
                            const ws = XLSX.utils.json_to_sheet(requests);
                            const wb = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(wb, ws, "Requests");
                            XLSX.writeFile(wb, "Subscriptions.xlsx");
                        }} 
                        sx={{ 
                            bgcolor: "white", 
                            color: theme.palette.primary.main, 
                            fontWeight: 700, 
                            "&:hover": { bgcolor: "#f0f0f0" } 
                        }}
                    >
                        Export Report
                    </Button>
                </Box>

                <Grid container spacing={3} sx={{ mt: 3 }}>
                    {[
                        { label: "Total Applications", value: stats.total, icon: <TrendingUpIcon />, color: "#2196f3" },
                        { label: "Pending Review", value: stats.pending, icon: <PendingIcon />, color: "#ff9800" },
                        { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: <CurrencyRupeeIcon />, color: "#4caf50" }
                    ].map((s, i) => (
                        <Grid item xs={12} sm={4} key={i}>
                            <Box sx={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: 2, 
                                p: 2, 
                                borderRadius: 3, 
                                bgcolor: "rgba(255,255,255,0.2)",
                                backdropFilter: "blur(10px)"
                            }}>
                                <Avatar sx={{ 
                                    bgcolor: "white", 
                                    color: s.color,
                                    width: 56,
                                    height: 56
                                }}>
                                    {s.icon}
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" sx={{ opacity: 0.95, color: "white", fontWeight: 600 }}>
                                        {s.label}
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700} color="white">
                                        {s.value}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* Main Content Area */}
            <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={(e, v) => setTabValue(v)} 
                        sx={{ 
                            "& .MuiTab-root": { 
                                fontWeight: 600, 
                                py: 2,
                                color: "text.secondary",
                                "&.Mui-selected": {
                                    color: "primary.main"
                                }
                            } 
                        }}
                    >
                        <Tab label="All Requests" />
                        <Tab label="Pending" />
                        <Tab label="Approved" />
                        <Tab label="Rejected" />
                    </Tabs>
                </Box>

                <Box sx={{ 
                    p: 3, 
                    display: "flex", 
                    gap: 2, 
                    flexWrap: "wrap", 
                    alignItems: "center", 
                    bgcolor: "#fafafa" 
                }}>
                    <TextField 
                        size="small" 
                        placeholder="Search vendor name or email..." 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)} 
                        InputProps={{ 
                            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} /> 
                        }} 
                        sx={{ 
                            flexGrow: 1, 
                            maxWidth: 400, 
                            bgcolor: "white",
                            "& .MuiInputBase-input": {
                                color: "text.primary"
                            }
                        }} 
                    />
                    <FormControl size="small" sx={{ minWidth: 160, bgcolor: "white" }}>
                        <InputLabel sx={{ color: "text.secondary" }}>Module</InputLabel>
                        <Select 
                            value={moduleFilter} 
                            label="Module" 
                            onChange={e => setModuleFilter(e.target.value)}
                            sx={{
                                color: "text.primary"
                            }}
                        >
                            <MenuItem value="all">All Modules</MenuItem>
                            {modules.map(m => <MenuItem key={m._id} value={m.title}>{m.title}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Box>

                <Table>
                    <TableHead sx={{ bgcolor: "#f8f9fc" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Vendor Details</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Plan Info</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Request Date</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: "text.primary" }}>Management</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : filteredRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                    <Typography color="text.secondary" variant="h6">
                                        No requests found
                                    </Typography>
                                    <Typography color="text.secondary" variant="body2">
                                        Try adjusting your filters
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRequests.map(r => (
                                <TableRow key={r.id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar 
                                                src={r.userAvatar} 
                                                sx={{ 
                                                    width: 45, 
                                                    height: 45, 
                                                    bgcolor: "primary.light",
                                                    color: "primary.main",
                                                    fontWeight: 700
                                                }}
                                            >
                                                {r.userName[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={700} color="text.primary">
                                                    {r.userName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {r.userEmail}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                            {r.planName}
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                            <Chip 
                                                size="small" 
                                                label={`₹${r.planPrice}`} 
                                                sx={{ 
                                                    height: 20, 
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                                    color: "primary.main", 
                                                    fontWeight: 700,
                                                    "& .MuiChip-label": {
                                                        color: "primary.main"
                                                    }
                                                }} 
                                            />
                                            <Chip 
                                                size="small" 
                                                label={`${r.planDuration} Days`} 
                                                variant="outlined" 
                                                sx={{ 
                                                    height: 20,
                                                    "& .MuiChip-label": {
                                                        color: "text.primary"
                                                    }
                                                }} 
                                            />
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                                            <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {r.requestDate}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>{getStatusChip(r.status)}</TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="View Info">
                                                <IconButton 
                                                    onClick={() => setDetailDialog({ open: true, data: r })} 
                                                    size="small"
                                                    sx={{ color: "text.primary" }}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {r.status === "pending" && (
                                                <>
                                                    <Button 
                                                        size="small" 
                                                        variant="contained" 
                                                        disableElevation 
                                                        onClick={() => setPaymentDialog({ open: true, data: r })} 
                                                        startIcon={<PaymentIcon />} 
                                                        sx={{ 
                                                            borderRadius: 2, 
                                                            textTransform: "none", 
                                                            fontWeight: 700,
                                                            color: "white"
                                                        }}
                                                    >
                                                        Pay & Approve
                                                    </Button>
                                                    <IconButton 
                                                        color="error" 
                                                        onClick={() => setActionDialog({ open: true, data: r, action: "reject" })} 
                                                        size="small"
                                                    >
                                                        <CancelIcon fontSize="small" />
                                                    </IconButton>
                                                </>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Payment Modal */}
            <Dialog 
                open={paymentDialog.open} 
                onClose={() => setPaymentDialog({ open: false, data: null })} 
                fullWidth 
                maxWidth="xs" 
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
                    <Avatar sx={{ 
                        m: "0 auto", 
                        bgcolor: alpha(theme.palette.primary.main, 0.1), 
                        color: "primary.main", 
                        width: 60, 
                        height: 60, 
                        mb: 2 
                    }}>
                        <PaymentIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h5" fontWeight={800} color="text.primary">
                        Confirm Payment
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ bgcolor: "#f8f9fc", p: 2, borderRadius: 3, mb: 3 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Total Payable Amount
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="primary.main">
                            ₹{paymentDialog.data?.planPrice}
                        </Typography>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                            {paymentDialog.data?.planName} Plan
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                            {paymentDialog.data?.userName} ({paymentDialog.data?.module})
                        </Typography>
                    </Box>
                    <TextField 
                        fullWidth 
                        multiline 
                        rows={3} 
                        label="Note for Vendor" 
                        placeholder="Add a comment about the approval..." 
                        value={adminNote} 
                        onChange={e => setAdminNote(e.target.value)} 
                        sx={{ 
                            mt: 1,
                            "& .MuiInputBase-input": {
                                color: "text.primary"
                            }
                        }} 
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button 
                        fullWidth 
                        onClick={() => setPaymentDialog({ open: false })} 
                        sx={{ fontWeight: 700, color: "text.primary" }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        fullWidth 
                        variant="contained" 
                        disableElevation 
                        onClick={() => handlePayAndApprove(paymentDialog.data)} 
                        disabled={paymentLoading} 
                        sx={{ 
                            py: 1.5, 
                            borderRadius: 3, 
                            fontWeight: 700,
                            color: "white"
                        }}
                    >
                        {paymentLoading ? <CircularProgress size={24} color="inherit" /> : `Pay ₹${paymentDialog.data?.planPrice}`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Detail Modal */}
            <Dialog 
                open={detailDialog.open} 
                onClose={() => setDetailDialog({ open: false })} 
                fullWidth 
                maxWidth="sm" 
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: "text.primary" }}>
                    Application Overview
                </DialogTitle>
                <DialogContent>
                    {detailDialog.data && (
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <Box sx={{ p: 2, borderRadius: 3, border: "1px solid #eee", bgcolor: "#fafafa" }}>
                                <Typography variant="caption" color="primary.main" fontWeight={700} gutterBottom>
                                    VENDOR PROFILE
                                </Typography>
                                <Typography variant="h6" fontWeight={700} color="text.primary">
                                    {detailDialog.data.userName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {detailDialog.data.userEmail}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {detailDialog.data.userPhone || "No Phone Contact"}
                                </Typography>
                            </Box>
                            <Box sx={{ 
                                p: 2, 
                                borderRadius: 3, 
                                bgcolor: theme.palette.primary.main, 
                                color: "white" 
                            }}>
                                <Typography variant="caption" sx={{ color: "white", opacity: 0.9 }} fontWeight={700}>
                                    SELECTED PLAN
                                </Typography>
                                <Typography variant="h6" fontWeight={700} color="white">
                                    {detailDialog.data.planName}
                                </Typography>
                                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                    <Typography variant="h5" fontWeight={800} color="white">
                                        ₹{detailDialog.data.planPrice}
                                    </Typography>
                                    <Divider orientation="vertical" flexItem sx={{ bgcolor: "white", opacity: 0.3 }} />
                                    <Box>
                                        <Typography variant="body2" fontWeight={700} color="white">
                                            {detailDialog.data.planDuration} Days
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "white", opacity: 0.8 }}>
                                            Validity
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                            {detailDialog.data.adminNote && (
                                <Box sx={{ 
                                    p: 2, 
                                    borderRadius: 3, 
                                    bgcolor: "#fff8e1", 
                                    border: "1px solid #ffe082" 
                                }}>
                                    <Typography variant="caption" color="#f57c00" fontWeight={700}>
                                        ADMIN COMMENTS
                                    </Typography>
                                    <Typography variant="body2" color="text.primary">
                                        {detailDialog.data.adminNote}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setDetailDialog({ open: false })} 
                        fullWidth 
                        variant="outlined" 
                        sx={{ 
                            borderRadius: 3, 
                            fontWeight: 700,
                            color: "text.primary",
                            borderColor: "divider"
                        }}
                    >
                        Close View
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog
                open={actionDialog.open && actionDialog.action === "reject"}
                onClose={() => setActionDialog({ open: false, data: null, action: "" })}
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
                    <Avatar sx={{ 
                        m: "0 auto", 
                        bgcolor: alpha(theme.palette.error.main, 0.1), 
                        color: "error.main", 
                        width: 60, 
                        height: 60, 
                        mb: 2 
                    }}>
                        <CancelIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h5" fontWeight={800} color="text.primary">
                        Reject Request
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: "center" }}>
                        Are you sure you want to reject this subscription request?
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Reason for Rejection"
                        placeholder="Provide a reason for rejecting this request..."
                        value={adminNote}
                        onChange={e => setAdminNote(e.target.value)}
                        sx={{
                            "& .MuiInputBase-input": {
                                color: "text.primary"
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        fullWidth
                        onClick={() => {
                            setActionDialog({ open: false, data: null, action: "" });
                            setAdminNote("");
                        }}
                        sx={{ fontWeight: 700, color: "text.primary" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        disableElevation
                        onClick={async () => {
                            try {
                                const token = getAuthToken();
                                await fetch(
                                    `https://api.bookmyevent.ae/api/admin/subscription/requests/${actionDialog.data.id}/reject`,
                                    {
                                        method: "PUT",
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify({ adminNote })
                                    }
                                );
                                fetchRequests();
                                setActionDialog({ open: false, data: null, action: "" });
                                setAdminNote("");
                            } catch {
                                alert("Reject failed");
                            }
                        }}
                        sx={{
                            py: 1.5,
                            borderRadius: 3,
                            fontWeight: 700,
                            color: "white"
                        }}
                    >
                        Reject Request
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SubscriptionRequests;
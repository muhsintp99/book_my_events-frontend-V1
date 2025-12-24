import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Button,
    Typography,
    Chip,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    CircularProgress,
    Paper,
    Divider,
    Card,
    CardContent,
    Grid,
    Tooltip,
    Badge,
    LinearProgress,
    Tabs,
    Tab,
    Stack,
    alpha,
    useTheme
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PendingIcon from "@mui/icons-material/Pending";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TimerIcon from "@mui/icons-material/Timer";
import FilterListIcon from "@mui/icons-material/FilterList";
import * as XLSX from "xlsx";
const SubscriptionRequests = () => {
    const theme = useTheme();
    const [requests, setRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [moduleFilter, setModuleFilter] = useState("all");
    const [anchorEl, setAnchorEl] = useState(null);
    const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
    const [actionDialog, setActionDialog] = useState({ open: false, data: null, action: "" });
    const [upgradeDialog, setUpgradeDialog] = useState({ open: false, data: null });
    const [paymentDialog, setPaymentDialog] = useState({ open: false, data: null });
    const [adminNote, setAdminNote] = useState("");
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [plans, setPlans] = useState([]);
    const [selectedUpgradePlan, setSelectedUpgradePlan] = useState("");
    const open = Boolean(anchorEl);
    const getAuthToken = () =>
        localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    useEffect(() => {
        fetchRequests();
        fetchModules();
        fetchPlans();
        // Check if returning from payment
        const urlParams = new URLSearchParams(window.location.search);
        const merchantTransactionId = urlParams.get("merchantTransactionId");
        if (merchantTransactionId) {
            verifyPayment(merchantTransactionId);
        }
    }, []);
    // ================= PAYMENT VERIFICATION =================
    const verifyPayment = async (merchantTransactionId) => {
        try {
            const token = getAuthToken();
            const res = await fetch(
                `https://api.bookmyevent.ae/api/admin/subscription/payment/status/${merchantTransactionId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            const data = await res.json();
            if (data.success && data.payment.status === "success") {
                alert("✅ Payment successful! Subscription activated.");
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
                // Refresh requests
                fetchRequests();
            } else if (data.payment.status === "failed") {
                alert("❌ Payment failed. Please try again.");
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                alert("⏳ Payment is still processing. Please check back later.");
            }
        } catch (error) {
            console.error("Payment verification error:", error);
        }
    };
    // ================= PAYMENT INITIATION =================
    const handlePayAndApprove = async (request) => {
        setPaymentLoading(true);
        try {
            const token = getAuthToken();
            const res = await fetch("https://api.bookmyevent.ae/api/admin/subscription/payment/initiate", {
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
            if (data.success && data.paymentUrl) {
                // Redirect to PhonePe payment page
                window.location.href = data.paymentUrl;
            } else {
                alert(data.message || "Payment initiation failed");
            }
        } catch (error) {
            console.error("Payment initiation error:", error);
            alert("Failed to initiate payment");
        } finally {
            setPaymentLoading(false);
        }
    };
    // ================= FETCH REQUESTS =================
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const res = await fetch("https://api.bookmyevent.ae/api/admin/subscription/requests", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const mapped = data.requests.map(r => ({
                    id: r._id,
                    userName: r.userId
                        ? `${r.userId.firstName || ""} ${r.userId.lastName || ""}`.trim()
                        : "Unknown User",
                    userEmail: r.userId?.email || "",
                    userPhone: r.userId?.phone || "",
                    userAvatar: r.userId?.avatar || "",
                    userId: r.userId?._id || "",
                    planId: r.planId?._id || "",
                    planName: r.planId?.name || "Unknown Plan",
                    planPrice: r.planId?.price || 0,
                    planDuration: r.planId?.durationInDays || 0,
                    module: r.moduleId?.title || "Other",
                    moduleId: r.moduleId?._id || "",
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
    // ================= FETCH MODULES =================
    const fetchModules = async () => {
        try {
            const res = await fetch("https://api.bookmyevent.ae/api/modules");
            const data = await res.json();
            if (Array.isArray(data)) {
                setModules(data);
            } else if (Array.isArray(data.modules)) {
                setModules(data.modules);
            } else if (Array.isArray(data.data)) {
                setModules(data.data);
            }
        } catch (err) {
            console.error("Error fetching modules:", err);
        }
    };
    // ================= FETCH PLANS =================
    const fetchPlans = async () => {
        try {
            const token = getAuthToken();
            const res = await fetch("https://api.bookmyevent.ae/api/admin/subscription/plans", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.plans)) {
                setPlans(data.plans);
            }
        } catch (err) {
            console.error("Error fetching plans:", err);
        }
    };
    // ================= ACTIONS =================
    const handleApprove = async () => {
        try {
            const token = getAuthToken();
            await fetch(
                `https://api.bookmyevent.ae/api/admin/subscription/requests/${actionDialog.data.id}/approve`,
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
            alert("Approve failed");
        }
    };
    const handleReject = async () => {
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
    };
    const handleUpgrade = async () => {
        try {
            const token = getAuthToken();
            const res = await fetch(
                `https://api.bookmyevent.ae/api/admin/subscription/upgrade`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        requestId: upgradeDialog.data.id,
                        userId: upgradeDialog.data.userId,
                        newPlanId: selectedUpgradePlan,
                        adminNote
                    })
                }
            );
            const data = await res.json();
            if (data.success) {
                fetchRequests();
                setUpgradeDialog({ open: false, data: null });
                setSelectedUpgradePlan("");
                setAdminNote("");
                alert("Upgrade successful!");
            } else {
                alert(data.message || "Upgrade failed");
            }
        } catch (err) {
            console.error("Upgrade error:", err);
            alert("Upgrade failed");
        }
    };
    // ================= STATISTICS =================
    const statistics = useMemo(() => {
        const total = requests.length;
        const pending = requests.filter(r => r.status === "pending").length;
        const approved = requests.filter(r => r.status === "approved").length;
        const rejected = requests.filter(r => r.status === "rejected").length;
        const totalRevenue = requests
            .filter(r => r.status === "approved")
            .reduce((sum, r) => sum + r.planPrice, 0);
        return { total, pending, approved, rejected, totalRevenue };
    }, [requests]);
    // ================= UI HELPERS =================
    const getStatusChip = status => {
        const map = {
            pending: { label: "Pending", color: "warning", icon: <PendingIcon fontSize="small" /> },
            approved: { label: "Approved", color: "success", icon: <CheckCircleIcon fontSize="small" /> },
            rejected: { label: "Rejected", color: "error", icon: <CancelIcon fontSize="small" /> }
        };
        const cfg = map[status] || map.pending;
        return (
            <Chip
                label={cfg.label}
                color={cfg.color}
                size="small"
                icon={cfg.icon}
                sx={{ fontWeight: 600 }}
            />
        );
    };
    // ================= FILTERING =================
    const filteredRequests = useMemo(() => {
        let filtered = requests.filter(r => {
            const q = searchQuery.toLowerCase();
            const matchSearch =
                r.userName.toLowerCase().includes(q) ||
                r.userEmail.toLowerCase().includes(q) ||
                r.planName.toLowerCase().includes(q);
            const matchStatus = statusFilter === "all" || r.status === statusFilter;
            const matchModule = moduleFilter === "all" || r.module === moduleFilter;
            return matchSearch && matchStatus && matchModule;
        });
        // Tab filtering
        if (tabValue === 1) filtered = filtered.filter(r => r.status === "pending");
        if (tabValue === 2) filtered = filtered.filter(r => r.status === "approved");
        if (tabValue === 3) filtered = filtered.filter(r => r.status === "rejected");
        return filtered;
    }, [requests, searchQuery, statusFilter, moduleFilter, tabValue]);
    const groupedByModule = useMemo(() => {
        return filteredRequests.reduce((acc, r) => {
            acc[r.module] = acc[r.module] || [];
            acc[r.module].push(r);
            return acc;
        }, {});
    }, [filteredRequests]);
    // ================= EXPORT =================
    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(requests);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Requests");
        XLSX.writeFile(wb, "subscription_requests.xlsx");
    };
    // Get available upgrade plans for a user
    const getAvailableUpgradePlans = (currentPlanId, moduleId) => {
        return plans.filter(plan =>
            plan._id !== currentPlanId &&
            (!moduleId || plan.moduleId === moduleId)
        );
    };
    // ================= RENDER =================
    return (
        <Box sx={{
            p: 3,
            background: "#ffffff",
            minHeight: "100vh"
        }}>
            {/* HEADER WITH STATS */}
            <Paper
                elevation={1}
                sx={{
                    p: 4,
                    mb: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: "white",
                    borderRadius: 2,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Subscription Management
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Manage and track all subscription requests in one place
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<FileDownloadIcon />}
                        onClick={e => setAnchorEl(e.currentTarget)}
                        sx={{
                            bgcolor: "white",
                            color: theme.palette.primary.main,
                            "&:hover": { bgcolor: alpha("#fff", 0.9) }
                        }}
                    >
                        Export Data
                    </Button>
                </Box>
                {/* STATISTICS CARDS */}
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{
                            bgcolor: "white",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            border: "1px solid rgba(255,255,255,0.2)"
                        }}>
                            <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <TrendingUpIcon sx={{ color: theme.palette.primary.main }} />
                                    <Typography variant="body2" sx={{ color: theme.palette.grey[700] }}>
                                        Total Requests
                                    </Typography>
                                </Box>
                                <Typography variant="h4" fontWeight={700} sx={{ color: theme.palette.grey[900] }}>
                                    {statistics.total}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{
                            bgcolor: "white",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            border: "1px solid rgba(255,255,255,0.2)"
                        }}>
                            <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <PendingIcon sx={{ color: "#ffa726" }} />
                                    <Typography variant="body2" sx={{ color: theme.palette.grey[700] }}>
                                        Pending
                                    </Typography>
                                </Box>
                                <Typography variant="h4" fontWeight={700} sx={{ color: theme.palette.grey[900] }}>
                                    {statistics.pending}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{
                            bgcolor: "white",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            border: "1px solid rgba(255,255,255,0.2)"
                        }}>
                            <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <CheckCircleIcon sx={{ color: "#66bb6a" }} />
                                    <Typography variant="body2" sx={{ color: theme.palette.grey[700] }}>
                                        Approved
                                    </Typography>
                                </Box>
                                <Typography variant="h4" fontWeight={700} sx={{ color: theme.palette.grey[900] }}>
                                    {statistics.approved}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{
                            bgcolor: "white",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            border: "1px solid rgba(255,255,255,0.2)"
                        }}>
                            <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <CancelIcon sx={{ color: "#ef5350" }} />
                                    <Typography variant="body2" sx={{ color: theme.palette.grey[700] }}>
                                        Rejected
                                    </Typography>
                                </Box>
                                <Typography variant="h4" fontWeight={700} sx={{ color: theme.palette.grey[900] }}>
                                    {statistics.rejected}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{
                            bgcolor: "white",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            border: "1px solid rgba(255,255,255,0.2)"
                        }}>
                            <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <AttachMoneyIcon sx={{ color: "#4caf50" }} />
                                    <Typography variant="body2" sx={{ color: theme.palette.grey[700] }}>
                                        Revenue
                                    </Typography>
                                </Box>
                                <Typography variant="h4" fontWeight={700} sx={{ color: theme.palette.grey[900] }}>
                                    ₹{statistics.totalRevenue}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>
            {/* TABS */}
            <Paper elevation={0} sx={{
                mb: 3,
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, val) => setTabValue(val)}
                    sx={{
                        "& .MuiTab-root": {
                            fontWeight: 600,
                            textTransform: "none",
                            fontSize: "1rem"
                        }
                    }}
                >
                    <Tab label={`All (${requests.length})`} />
                    <Tab label={`Pending (${statistics.pending})`} />
                    <Tab label={`Approved (${statistics.approved})`} />
                    <Tab label={`Rejected (${statistics.rejected})`} />
                </Tabs>
            </Paper>
            {/* FILTER BAR */}
            <Paper elevation={0} sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <TextField
                        size="small"
                        placeholder="Search vendor, email, plan..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                        }}
                        sx={{ minWidth: 300 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Status"
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Status</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="approved">Approved</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Module</InputLabel>
                        <Select
                            value={moduleFilter}
                            label="Module"
                            onChange={e => setModuleFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Modules</MenuItem>
                            {modules.map(m => (
                                <MenuItem key={m._id} value={m.title}>
                                    {m.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Chip
                        icon={<FilterListIcon />}
                        label={`${filteredRequests.length} Results`}
                        color="primary"
                        variant="outlined"
                    />
                </Box>
            </Paper>
            {/* LOADING */}
            {loading && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
                        Loading requests...
                    </Typography>
                </Box>
            )}
            {/* TABLES BY MODULE */}
            {!loading && Object.entries(groupedByModule).length === 0 && (
                <Paper elevation={0} sx={{
                    p: 8,
                    textAlign: "center",
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                }}>
                    <Typography variant="h6" color="text.secondary">
                        No requests found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Try adjusting your filters
                    </Typography>
                </Paper>
            )}
            {!loading &&
                Object.entries(groupedByModule).map(([module, rows]) => (
                    <Paper
                        key={module}
                        elevation={0}
                        sx={{
                            mb: 4,
                            borderRadius: 2,
                            overflow: "hidden",
                            border: "1px solid #e0e0e0",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                        }}
                    >
                        <Box
                            sx={{
                                p: 2.5,
                                bgcolor: alpha(theme.palette.primary.main, 0.03),
                                borderBottom: "1px solid #e0e0e0"
                            }}
                        >
                            <Typography variant="h6" fontWeight={700} color="primary">
                                {module}
                                <Chip
                                    label={rows.length}
                                    size="small"
                                    sx={{ ml: 2 }}
                                    color="primary"
                                />
                            </Typography>
                        </Box>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#fafafa" }}>
                                    <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Plan Details</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Request Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map(r => (
                                    <TableRow
                                        key={r.id}
                                        sx={{
                                            "&:hover": {
                                                bgcolor: "#f5f5f5"
                                            },
                                            transition: "background-color 0.2s",
                                            borderBottom: "1px solid #f0f0f0"
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                                <Avatar
                                                    src={r.userAvatar}
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        bgcolor: theme.palette.primary.main,
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    {r.userName.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                                                        {r.userName}
                                                    </Typography>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <EmailIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {r.userEmail}
                                                        </Typography>
                                                    </Stack>
                                                    {r.userPhone && (
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                            <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {r.userPhone}
                                                            </Typography>
                                                        </Stack>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                                                {r.planName}
                                            </Typography>
                                            <Stack direction="row" spacing={2}>
                                                <Chip
                                                    icon={<AttachMoneyIcon />}
                                                    label={`₹${r.planPrice}`}
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                />
                                                <Chip
                                                    icon={<TimerIcon />}
                                                    label={`${r.planDuration} Days`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <CalendarTodayIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                                <Typography variant="body2">{r.requestDate}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{getStatusChip(r.status)}</TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setDetailDialog({ open: true, data: r })}
                                                        sx={{
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                                                        }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {r.status === "approved" && (
                                                    <Tooltip title="Upgrade Plan">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setUpgradeDialog({ open: true, data: r })}
                                                            sx={{
                                                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                                                color: theme.palette.info.main,
                                                                "&:hover": { bgcolor: alpha(theme.palette.info.main, 0.2) }
                                                            }}
                                                        >
                                                            <UpgradeIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {r.status === "pending" && (
                                                    <>
                                                        {/* NEW: Pay & Approve Button */}
                                                        <Tooltip title="Pay & Approve">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => setPaymentDialog({ open: true, data: r })}
                                                                sx={{
                                                                    bgcolor: alpha("#4caf50", 0.1),
                                                                    color: "#4caf50",
                                                                    "&:hover": { bgcolor: alpha("#4caf50", 0.2) }
                                                                }}
                                                            >
                                                                <AttachMoneyIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Approve (No Payment)">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => setActionDialog({ open: true, data: r, action: "approve" })}
                                                                sx={{
                                                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                                                    color: theme.palette.success.main,
                                                                    "&:hover": { bgcolor: alpha(theme.palette.success.main, 0.2) }
                                                                }}
                                                            >
                                                                <CheckCircleIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Reject">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => setActionDialog({ open: true, data: r, action: "reject" })}
                                                                sx={{
                                                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                                                    color: theme.palette.error.main,
                                                                    "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.2) }
                                                                }}
                                                            >
                                                                <CancelIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                ))}
            {/* EXPORT MENU */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                elevation={3}
            >
                <MenuItem onClick={exportExcel}>
                    <FileDownloadIcon sx={{ mr: 1 }} />
                    Export to Excel
                </MenuItem>
            </Menu>
            {/* DETAIL DIALOG */}
            <Dialog
                open={detailDialog.open}
                onClose={() => setDetailDialog({ open: false, data: null })}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: "1px solid #e0e0e0",
                    bgcolor: "#fafafa"
                }}>
                    <Typography variant="h6" fontWeight={700}>
                        Request Details
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 3 }}>
                    {detailDialog.data && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{
                                    p: 2,
                                    bgcolor: "#fafafa",
                                    border: "1px solid #e0e0e0"
                                }}>
                                    <Typography variant="overline" color="text.secondary" fontWeight={700}>
                                        User Information
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Name</Typography>
                                            <Typography fontWeight={600}>{detailDialog.data.userName}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Email</Typography>
                                            <Typography fontWeight={600}>{detailDialog.data.userEmail}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Phone</Typography>
                                            <Typography fontWeight={600}>{detailDialog.data.userPhone || "N/A"}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Status</Typography>
                                            <Box sx={{ mt: 0.5 }}>{getStatusChip(detailDialog.data.status)}</Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{
                                    p: 2,
                                    bgcolor: "#f0f7ff",
                                    border: "1px solid #e0e0e0"
                                }}>
                                    <Typography variant="overline" color="text.secondary" fontWeight={700}>
                                        Plan Information
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Plan Name</Typography>
                                            <Typography fontWeight={600}>{detailDialog.data.planName}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Module</Typography>
                                            <Typography fontWeight={600}>{detailDialog.data.module}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Price</Typography>
                                            <Typography fontWeight={600} color="success.main">₹{detailDialog.data.planPrice}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Duration</Typography>
                                            <Typography fontWeight={600}>{detailDialog.data.planDuration} Days</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                            {detailDialog.data.adminNote && (
                                <Grid item xs={12}>
                                    <Paper elevation={0} sx={{
                                        p: 2,
                                        bgcolor: "#fff8e1",
                                        border: "1px solid #e0e0e0"
                                    }}>
                                        <Typography variant="overline" color="text.secondary" fontWeight={700}>
                                            Admin Note
                                        </Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography>{detailDialog.data.adminNote}</Typography>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
                    <Button
                        onClick={() => setDetailDialog({ open: false, data: null })}
                        variant="outlined"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            {/* APPROVE / REJECT DIALOG */}
            <Dialog
                open={actionDialog.open}
                onClose={() => setActionDialog({ open: false, data: null, action: "" })}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: "1px solid #e0e0e0",
                    bgcolor: actionDialog.action === "approve"
                        ? "#f1f8f4"
                        : "#fef3f2"
                }}>
                    <Typography variant="h6" fontWeight={700}>
                        {actionDialog.action === "approve" ? "Approve Request" : "Reject Request"}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 3 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Admin Note (Optional)"
                        placeholder="Add a note about this decision..."
                        value={adminNote}
                        onChange={e => setAdminNote(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
                    <Button
                        onClick={() => {
                            setActionDialog({ open: false, data: null, action: "" });
                            setAdminNote("");
                        }}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color={actionDialog.action === "approve" ? "success" : "error"}
                        onClick={actionDialog.action === "approve" ? handleApprove : handleReject}
                        startIcon={actionDialog.action === "approve" ? <CheckCircleIcon /> : <CancelIcon />}
                    >
                        {actionDialog.action === "approve" ? "Approve" : "Reject"}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* PAYMENT CONFIRMATION DIALOG */}
            <Dialog
                open={paymentDialog.open}
                onClose={() => setPaymentDialog({ open: false, data: null })}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: "1px solid #e0e0e0",
                    bgcolor: "#f1f8f4"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AttachMoneyIcon sx={{ color: "#4caf50" }} />
                        <Typography variant="h6" fontWeight={700}>
                            Pay & Approve Subscription
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 3 }}>
                    {paymentDialog.data && (
                        <Box>
                            <Paper elevation={0} sx={{
                                p: 2,
                                mb: 3,
                                bgcolor: "#e3f2fd",
                                border: "1px solid #bbdefb"
                            }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Vendor Details
                                </Typography>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    {paymentDialog.data.userName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {paymentDialog.data.userEmail}
                                </Typography>
                            </Paper>
                            <Paper elevation={0} sx={{
                                p: 2,
                                mb: 3,
                                bgcolor: "#f1f8f4",
                                border: "1px solid #c8e6c9"
                            }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Subscription Plan
                                </Typography>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    {paymentDialog.data.planName}
                                </Typography>
                                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                    <Chip
                                        icon={<AttachMoneyIcon />}
                                        label={`₹${paymentDialog.data.planPrice}`}
                                        color="success"
                                        size="small"
                                    />
                                    <Chip
                                        icon={<TimerIcon />}
                                        label={`${paymentDialog.data.planDuration} Days`}
                                        size="small"
                                    />
                                </Stack>
                            </Paper>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Admin Note (Optional)"
                                placeholder="Add a note about this payment..."
                                value={adminNote}
                                onChange={e => setAdminNote(e.target.value)}
                                variant="outlined"
                            />
                            <Box sx={{ mt: 2, p: 2, bgcolor: "#fff3e0", borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    ℹ️ You will be redirected to PhonePe payment gateway. After successful payment,
                                    the subscription will be automatically activated for the vendor.
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
                    <Button
                        onClick={() => {
                            setPaymentDialog({ open: false, data: null });
                            setAdminNote("");
                        }}
                        variant="outlined"
                        disabled={paymentLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ bgcolor: "#4caf50", "&:hover": { bgcolor: "#45a049" } }}
                        onClick={() => {
                            handlePayAndApprove(paymentDialog.data);
                            setPaymentDialog({ open: false, data: null });
                        }}
                        disabled={paymentLoading}
                        startIcon={paymentLoading ? <CircularProgress size={20} /> : <AttachMoneyIcon />}
                    >
                        {paymentLoading ? "Processing..." : "Proceed to Payment"}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* UPGRADE DIALOG */}
            <Dialog
                open={upgradeDialog.open}
                onClose={() => {
                    setUpgradeDialog({ open: false, data: null });
                    setSelectedUpgradePlan("");
                    setAdminNote("");
                }}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: "1px solid #e0e0e0",
                    bgcolor: "#e3f2fd"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <UpgradeIcon color="info" />
                        <Typography variant="h6" fontWeight={700}>
                            Upgrade Subscription Plan
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 3 }}>
                    {upgradeDialog.data && (
                        <Box>
                            <Paper elevation={0} sx={{
                                p: 2,
                                mb: 3,
                                bgcolor: "#e3f2fd",
                                border: "1px solid #bbdefb"
                            }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Current Plan
                                </Typography>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    {upgradeDialog.data.planName}
                                </Typography>
                                <Stack direction="row" spacing={2}>
                                    <Chip label={`₹${upgradeDialog.data.planPrice}`} color="info" size="small" />
                                    <Chip label={`${upgradeDialog.data.planDuration} Days`} size="small" />
                                </Stack>
                            </Paper>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Select New Plan</InputLabel>
                                <Select
                                    value={selectedUpgradePlan}
                                    label="Select New Plan"
                                    onChange={e => setSelectedUpgradePlan(e.target.value)}
                                >
                                    {getAvailableUpgradePlans(upgradeDialog.data.planId, upgradeDialog.data.moduleId).map(plan => (
                                        <MenuItem key={plan._id} value={plan._id}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                                <Typography>{plan.name}</Typography>
                                                <Typography color="success.main" fontWeight={600}>
                                                    ₹{plan.price} / {plan.durationInDays} Days
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Admin Note (Optional)"
                                placeholder="Add a note about this upgrade..."
                                value={adminNote}
                                onChange={e => setAdminNote(e.target.value)}
                                variant="outlined"
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
                    <Button
                        onClick={() => {
                            setUpgradeDialog({ open: false, data: null });
                            setSelectedUpgradePlan("");
                            setAdminNote("");
                        }}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={handleUpgrade}
                        disabled={!selectedUpgradePlan}
                        startIcon={<UpgradeIcon />}
                    >
                        Upgrade Plan
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
export default SubscriptionRequests;
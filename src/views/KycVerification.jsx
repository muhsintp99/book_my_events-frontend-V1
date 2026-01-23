import { useState, useEffect, useMemo } from "react";
import {
    Box, Button, Typography, Chip, Avatar, Table, TableBody, TableCell,
    TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, FormControl, InputLabel, Select, CircularProgress,
    Paper, Divider, Card, Grid, Tooltip, Tabs, Tab, Stack, alpha,
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
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import BusinessIcon from "@mui/icons-material/Business";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DescriptionIcon from "@mui/icons-material/Description";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";
import { API_BASE_URL, getApiImageUrl } from "../utils/apiImageUtils";

const KycVerification = () => {
    const theme = useTheme();
    const [requests, setRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
    const [actionDialog, setActionDialog] = useState({ open: false, data: null, action: "" });
    const [rejectionReason, setRejectionReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [imagePreviewDialog, setImagePreviewDialog] = useState({ open: false, imageUrl: "" });

    const getAuthToken = () => localStorage.getItem("token") || sessionStorage.getItem("token") || "";

    useEffect(() => {
        fetchKycRequests();
    }, []);

    const fetchKycRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/kyc`, {
                headers: { Authorization: `Bearer ${getAuthToken()}` }
            });
            const data = await res.json();
            if (data.success) {
                // Filter out vendors who haven't submitted KYC
                const submittedRequests = data.data.filter(r => r.kycDetails?.status !== "not_submitted");
                setRequests(submittedRequests);
            }
        } catch (err) {
            console.error("Fetch KYC error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (userId, status) => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/kyc/status`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId,
                    status,
                    rejectionReason: status === 'rejected' ? rejectionReason : ""
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchKycRequests();
                setActionDialog({ open: false, data: null, action: "" });
                setDetailDialog({ open: false, data: null });
                setRejectionReason("");
            } else {
                alert(data.message || "Failed to update status");
            }
        } catch (err) {
            console.error("Update status error:", err);
            alert("Error updating status");
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusChip = status => {
        const config = {
            pending: { label: "Pending", color: "warning", icon: <PendingIcon fontSize="small" /> },
            verified: { label: "Verified", color: "success", icon: <CheckCircleIcon fontSize="small" /> },
            rejected: { label: "Rejected", color: "error", icon: <CancelIcon fontSize="small" /> }
        };
        const cfg = config[status] || config.pending;
        return <Chip label={cfg.label} color={cfg.color} size="small" icon={cfg.icon} sx={{ fontWeight: 600, px: 1 }} />;
    };

    const filteredRequests = useMemo(() => {
        return requests.filter(r => {
            const userName = `${r.userId?.firstName || ""} ${r.userId?.lastName || ""}`.toLowerCase();
            const userEmail = (r.userId?.email || "").toLowerCase();
            const matchSearch = userName.includes(searchQuery.toLowerCase()) || userEmail.includes(searchQuery.toLowerCase());

            const statusMap = ["all", "pending", "verified", "rejected"];
            const currentTabStatus = statusMap[tabValue];
            const matchTab = currentTabStatus === "all" || r.kycDetails?.status === currentTabStatus;

            return matchSearch && matchTab;
        });
    }, [requests, searchQuery, tabValue]);

    const stats = useMemo(() => ({
        total: requests.length,
        pending: requests.filter(r => r.kycDetails?.status === "pending").length,
        verified: requests.filter(r => r.kycDetails?.status === "verified").length
    }), [requests]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, background: "#f4f7fe", minHeight: "100vh" }}>
            {/* Header Section */}
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
                        <Stack direction="row" spacing={1} alignItems="center">
                            <VerifiedUserIcon sx={{ fontSize: 32 }} />
                            <Typography variant="h4" fontWeight={800} letterSpacing={-0.5} color="white">
                                KYC Verification
                            </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ opacity: 0.95, color: "white", mt: 0.5 }}>
                            Review and approve vendor identity documents
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => {
                            const exportData = requests.map(r => ({
                                Vendor: `${r.userId?.firstName} ${r.userId?.lastName}`,
                                Email: r.userId?.email,
                                Phone: r.userId?.phone,
                                Status: r.kycDetails?.status,
                                SubmittedAt: r.kycDetails?.submittedAt
                            }));
                            const ws = XLSX.utils.json_to_sheet(exportData);
                            const wb = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(wb, ws, "KYC Requests");
                            XLSX.writeFile(wb, "KYC_Verification_Report.xlsx");
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
                        { label: "Total Requests", value: stats.total, icon: <TrendingUpIcon />, color: "#2196f3" },
                        { label: "Pending Verification", value: stats.pending, icon: <PendingIcon />, color: "#ff9800" },
                        { label: "Verified Vendors", value: stats.verified, icon: <CheckCircleIcon />, color: "#4caf50" }
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

            {/* Main Table Card */}
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
                        <Tab label="Verified" />
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
                        }}
                    />
                </Box>

                <Table>
                    <TableHead sx={{ bgcolor: "#f8f9fc" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Document Type</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Submitted On</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
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
                                    <Typography color="text.secondary" variant="h6">No KYC requests found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRequests.map(r => (
                                <TableRow key={r._id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar
                                                src={r.profilePhoto || ""}
                                                sx={{
                                                    width: 45,
                                                    height: 45,
                                                    bgcolor: "primary.light",
                                                    color: "primary.main",
                                                    fontWeight: 700
                                                }}
                                            >
                                                {r.userId?.firstName ? r.userId.firstName[0] : "V"}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={700}>
                                                    {r.userId?.firstName} {r.userId?.lastName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {r.userId?.email}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{r.kycDetails?.documentInfo?.documentType || "N/A"}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                                            <CalendarTodayIcon sx={{ fontSize: 14 }} />
                                            <Typography variant="caption">
                                                {r.kycDetails?.submittedAt ? new Date(r.kycDetails.submittedAt).toLocaleDateString() : "N/A"}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>{getStatusChip(r.kycDetails?.status)}</TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    onClick={() => setDetailDialog({ open: true, data: r })}
                                                    size="small"
                                                    color="primary"
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {r.kycDetails?.status === "pending" && (
                                                <>
                                                    <Tooltip title="Verify">
                                                        <IconButton
                                                            color="success"
                                                            size="small"
                                                            onClick={() => handleUpdateStatus(r.userId?._id, 'verified')}
                                                        >
                                                            <CheckCircleIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject">
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() => setActionDialog({ open: true, data: r, action: "reject" })}
                                                        >
                                                            <CancelIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
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

            {/* Detail View Modal */}
            <Dialog
                open={detailDialog.open}
                onClose={() => setDetailDialog({ open: false })}
                fullWidth
                maxWidth="md"
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3 }}>
                    KYC Application Details
                    <Typography variant="body2" color="text.secondary">
                        Review vendor documents and information for verification
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ px: 3 }}>
                    {detailDialog.data && (
                        <Grid container spacing={3} sx={{ mt: 0.5 }}>
                            {/* Left Column: Info */}
                            <Grid item xs={12} md={5}>
                                <Stack spacing={3}>
                                    {/* Personal Info */}
                                    <Box sx={{ p: 2, borderRadius: 3, border: "1px solid #eee", bgcolor: "#fafafa" }}>
                                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                            <BusinessIcon color="primary" fontSize="small" />
                                            <Typography variant="subtitle2" fontWeight={700}>Personal Info</Typography>
                                        </Stack>
                                        <Typography variant="body2"><strong>Full Name:</strong> {detailDialog.data.kycDetails?.personalInfo?.fullName}</Typography>
                                        <Typography variant="body2"><strong>Email:</strong> {detailDialog.data.kycDetails?.personalInfo?.email}</Typography>
                                        <Typography variant="body2"><strong>Address:</strong> {detailDialog.data.kycDetails?.personalInfo?.address}</Typography>
                                    </Box>

                                    {/* Bank Details */}
                                    <Box sx={{ p: 2, borderRadius: 3, border: "1px solid #eee", bgcolor: "#f8f9fe" }}>
                                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                            <AccountBalanceIcon color="primary" fontSize="small" />
                                            <Typography variant="subtitle2" fontWeight={700}>Bank Details</Typography>
                                        </Stack>
                                        <Typography variant="body2"><strong>Holder:</strong> {detailDialog.data.kycDetails?.bankDetails?.accountHolder}</Typography>
                                        <Typography variant="body2"><strong>Account:</strong> {detailDialog.data.kycDetails?.bankDetails?.accountNumber}</Typography>
                                        <Typography variant="body2"><strong>IFSC:</strong> {detailDialog.data.kycDetails?.bankDetails?.ifsc}</Typography>
                                        <Typography variant="body2"><strong>Bank:</strong> {detailDialog.data.kycDetails?.bankDetails?.bankName}</Typography>
                                    </Box>

                                    {/* Status Card */}
                                    <Box sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        bgcolor: detailDialog.data.kycDetails?.status === 'verified' ? alpha(theme.palette.success.main, 0.1) :
                                            detailDialog.data.kycDetails?.status === 'rejected' ? alpha(theme.palette.error.main, 0.1) :
                                                alpha(theme.palette.warning.main, 0.1),
                                        border: "1px solid",
                                        borderColor: detailDialog.data.kycDetails?.status === 'verified' ? 'success.main' :
                                            detailDialog.data.kycDetails?.status === 'rejected' ? 'error.main' : 'warning.main'
                                    }}>
                                        <Typography variant="caption" fontWeight={700} display="block">CURRENT STATUS</Typography>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            {getStatusChip(detailDialog.data.kycDetails?.status)}
                                            {detailDialog.data.kycDetails?.status === 'rejected' && (
                                                <Typography variant="caption" color="error" fontWeight={600}>
                                                    Reason: {detailDialog.data.kycDetails?.rejectionReason}
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Grid>

                            {/* Right Column: Documents */}
                            <Grid item xs={12} md={7}>
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <DescriptionIcon color="primary" fontSize="small" />
                                        <Typography variant="subtitle2" fontWeight={700}>Verification Documents</Typography>
                                    </Stack>

                                    <Typography variant="caption" fontWeight={600}>FRONT IMAGE</Typography>
                                    <Box
                                        onClick={() => detailDialog.data.kycDetails?.documentInfo?.frontImage && setImagePreviewDialog({
                                            open: true,
                                            imageUrl: getApiImageUrl(detailDialog.data.kycDetails.documentInfo.frontImage)
                                        })}
                                        sx={{
                                            width: "100%",
                                            height: 200,
                                            borderRadius: 3,
                                            overflow: "hidden",
                                            border: "1px solid #eee",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor: "#f0f0f0",
                                            position: "relative",
                                            cursor: detailDialog.data.kycDetails?.documentInfo?.frontImage ? "pointer" : "default",
                                            "&:hover .image-overlay": {
                                                opacity: 1
                                            }
                                        }}
                                    >
                                        {detailDialog.data.kycDetails?.documentInfo?.frontImage ? (
                                            <>
                                                <img
                                                    src={getApiImageUrl(detailDialog.data.kycDetails.documentInfo.frontImage)}
                                                    alt="Front"
                                                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                                />
                                                <Box
                                                    className="image-overlay"
                                                    sx={{
                                                        position: "absolute",
                                                        top: 0,
                                                        left: 0,
                                                        width: "100%",
                                                        height: "100%",
                                                        bgcolor: "rgba(0,0,0,0.4)",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: "white",
                                                        opacity: 0,
                                                        transition: "opacity 0.2s ease-in-out",
                                                        gap: 1
                                                    }}
                                                >
                                                    <ZoomInIcon />
                                                    <Typography variant="caption" fontWeight={600}>Click to view full image</Typography>
                                                </Box>
                                            </>
                                        ) : <Typography variant="caption">No Image Uploaded</Typography>}
                                    </Box>

                                    <Typography variant="caption" fontWeight={600}>BACK IMAGE</Typography>
                                    <Box
                                        onClick={() => detailDialog.data.kycDetails?.documentInfo?.backImage && setImagePreviewDialog({
                                            open: true,
                                            imageUrl: getApiImageUrl(detailDialog.data.kycDetails.documentInfo.backImage)
                                        })}
                                        sx={{
                                            width: "100%",
                                            height: 200,
                                            borderRadius: 3,
                                            overflow: "hidden",
                                            border: "1px solid #eee",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor: "#f0f0f0",
                                            position: "relative",
                                            cursor: detailDialog.data.kycDetails?.documentInfo?.backImage ? "pointer" : "default",
                                            "&:hover .image-overlay": {
                                                opacity: 1
                                            }
                                        }}
                                    >
                                        {detailDialog.data.kycDetails?.documentInfo?.backImage ? (
                                            <>
                                                <img
                                                    src={getApiImageUrl(detailDialog.data.kycDetails.documentInfo.backImage)}
                                                    alt="Back"
                                                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                                />
                                                <Box
                                                    className="image-overlay"
                                                    sx={{
                                                        position: "absolute",
                                                        top: 0,
                                                        left: 0,
                                                        width: "100%",
                                                        height: "100%",
                                                        bgcolor: "rgba(0,0,0,0.4)",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: "white",
                                                        opacity: 0,
                                                        transition: "opacity 0.2s ease-in-out",
                                                        gap: 1
                                                    }}
                                                >
                                                    <ZoomInIcon />
                                                    <Typography variant="caption" fontWeight={600}>Click to view full image</Typography>
                                                </Box>
                                            </>
                                        ) : <Typography variant="caption">No Image Uploaded</Typography>}
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDetailDialog({ open: false })} variant="outlined" sx={{ borderRadius: 2 }}>Close</Button>
                    {detailDialog.data?.kycDetails?.status === 'pending' && (
                        <>
                            <Button
                                color="error"
                                variant="contained"
                                onClick={() => setActionDialog({ open: true, data: detailDialog.data, action: "reject" })}
                                sx={{ borderRadius: 2, color: "white" }}
                            >
                                Reject
                            </Button>
                            <Button
                                color="success"
                                variant="contained"
                                onClick={() => handleUpdateStatus(detailDialog.data.userId?._id, 'verified')}
                                sx={{ borderRadius: 2, color: "white" }}
                            >
                                Approve KYC
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Rejection Reason Dialog */}
            <Dialog
                open={actionDialog.open && actionDialog.action === "reject"}
                onClose={() => setActionDialog({ open: false, data: null, action: "" })}
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle>Reject KYC Request</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Please provide a reason for rejecting the KYC submission for <strong>{actionDialog.data?.kycDetails?.personalInfo?.fullName}</strong>.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Rejection Reason"
                        placeholder="e.g. Documents are blurry or invalid"
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setActionDialog({ open: false, data: null, action: "" })}>Cancel</Button>
                    <Button
                        color="error"
                        variant="contained"
                        disabled={!rejectionReason || actionLoading}
                        onClick={() => handleUpdateStatus(actionDialog.data.userId?._id, 'rejected')}
                        sx={{ borderRadius: 2, color: "white" }}
                    >
                        {actionLoading ? <CircularProgress size={24} /> : "Confirm Rejection"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Image Preview Dialog */}
            <Dialog
                open={imagePreviewDialog.open}
                onClose={() => setImagePreviewDialog({ open: false, imageUrl: "" })}
                maxWidth="lg"
                PaperProps={{
                    sx: {
                        bgcolor: "transparent",
                        boxShadow: "none",
                        overflow: "hidden",
                        position: "relative"
                    }
                }}
            >
                <IconButton
                    onClick={() => setImagePreviewDialog({ open: false, imageUrl: "" })}
                    sx={{
                        position: "absolute",
                        right: 16,
                        top: 16,
                        color: "white",
                        bgcolor: "rgba(0,0,0,0.5)",
                        "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                        zIndex: 1
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Box
                    component="img"
                    src={imagePreviewDialog.imageUrl}
                    alt="Full View"
                    sx={{
                        maxWidth: "100%",
                        maxHeight: "90vh",
                        objectFit: "contain",
                        borderRadius: 2,
                        bgcolor: "white"
                    }}
                />
            </Dialog>
        </Box>
    );
};

export default KycVerification;

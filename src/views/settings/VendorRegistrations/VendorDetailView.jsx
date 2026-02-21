import { useState, useEffect } from "react";
import {
    Box, Button, Typography, Chip, Avatar, IconButton, CircularProgress,
    Paper, Stack, Grid, Divider, Card, useTheme, CardContent
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import MapIcon from "@mui/icons-material/Map";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, getApiImageUrl } from "../../../utils/apiImageUtils";

const VendorDetailView = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const getAuthToken = () => localStorage.getItem("token") || sessionStorage.getItem("token") || "";

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/vendor-registrations/${id}`, {
                headers: { Authorization: `Bearer ${getAuthToken()}` }
            });
            const data = await res.json();
            if (data.success) {
                setRegistration(data.data);
            } else {
                alert(data.message || "Failed to fetch details");
                navigate("/settings/vendor-registrations");
            }
        } catch (err) {
            console.error("Fetch registration detail error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        const confirmMsg = action === "approve"
            ? "Are you sure you want to approve this vendor? This will grant them access to the vendor panel."
            : "Are you sure you want to reject this registration?";

        if (!window.confirm(confirmMsg)) return;

        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/vendor-registrations/${id}/${action}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            if (data.success) {
                alert(`Vendor registration ${action}d successfully`);
                navigate("/settings/vendor-registrations");
            } else {
                alert(data.message || `Failed to ${action} registration`);
            }
        } catch (err) {
            console.error(`${action} error:`, err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!registration) return null;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, background: "#f4f7fe", minHeight: "100vh" }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <IconButton onClick={() => navigate("/settings/vendor-registrations")} sx={{ bgcolor: "white", boxShadow: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h3" fontWeight={800} letterSpacing={-0.5}>
                    Registration Details
                </Typography>
            </Stack>

            <Grid container spacing={3}>
                {/* Left Column: Store & Owner Profile */}
                <Grid item xs={12} md={8}>
                    <Stack spacing={3}>
                        {/* Store Overview Card */}
                        <Card elevation={0} sx={{ borderRadius: 4, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                            <Box sx={{ height: 180, position: "relative", bgcolor: "#eee" }}>
                                <img
                                    src={getApiImageUrl(registration.coverImage)}
                                    alt="Cover"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={(e) => { e.target.src = "https://placehold.co/1200x400?text=No+Cover+Image"; }}
                                />
                                <Avatar
                                    src={getApiImageUrl(registration.logo)}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        position: "absolute",
                                        bottom: -60,
                                        left: 40,
                                        borderRadius: 4,
                                        border: "5px solid white",
                                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                                        bgcolor: theme.palette.primary.main,
                                        fontSize: 40
                                    }}
                                >
                                    {registration.storeName ? registration.storeName[0] : "V"}
                                </Avatar>
                            </Box>
                            <CardContent sx={{ pt: 10, px: 5, pb: 4 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                                    <Box>
                                        <Typography variant="h2" fontWeight={800} color="textPrimary">
                                            {registration.storeName}
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                            <Chip label={registration.module?.title} color="secondary" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                                            <Chip label={registration.status?.toUpperCase()} color="warning" size="small" sx={{ fontWeight: 800 }} />
                                        </Stack>
                                    </Box>
                                    <Box sx={{ display: "flex", gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<CancelIcon />}
                                            onClick={() => handleAction("reject")}
                                            disabled={actionLoading}
                                            sx={{ borderRadius: 2, fontWeight: 700 }}
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                                            onClick={() => handleAction("approve")}
                                            disabled={actionLoading}
                                            sx={{ borderRadius: 2, fontWeight: 700, px: 4, color: "white" }}
                                        >
                                            Approve Vendor
                                        </Button>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 4 }} />

                                <Grid container spacing={4}>
                                    <Grid item xs={12} sm={6}>
                                        <Stack spacing={2}>
                                            <Typography variant="subtitle1" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <PersonIcon color="primary" /> Owner Information
                                            </Typography>
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">Full Name</Typography>
                                                <Typography variant="body1" fontWeight={600}>{registration.ownerFirstName} {registration.ownerLastName}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">Email Address</Typography>
                                                <Typography variant="body1" fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <EmailIcon sx={{ fontSize: 16 }} color="action" /> {registration.ownerEmail}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">Phone Number</Typography>
                                                <Typography variant="body1" fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <PhoneIcon sx={{ fontSize: 16 }} color="action" /> {registration.ownerPhone}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Stack spacing={2}>
                                            <Typography variant="subtitle1" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <MapIcon color="primary" /> Business Location
                                            </Typography>
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">Zone / Area</Typography>
                                                <Typography variant="body1" fontWeight={600}>{registration.zone?.name || "N/A"}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">Street Address</Typography>
                                                <Typography variant="body1" fontWeight={600}>{registration.storeAddress?.street || "N/A"}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">City & State</Typography>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {registration.storeAddress?.city}{registration.storeAddress?.state ? `, ${registration.storeAddress?.state}` : ""}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Financial Information */}
                        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h4" fontWeight={800} sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <AccountBalanceIcon color="primary" /> Financial & Bank Details
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body2" color="textSecondary">Account Holder</Typography>
                                        <Typography variant="h5" fontWeight={700}>{registration.bankDetails?.accountHolderName || "N/A"}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body2" color="textSecondary">Bank Name</Typography>
                                        <Typography variant="h5" fontWeight={700}>{registration.bankDetails?.bankName || "N/A"}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body2" color="textSecondary">Account Type</Typography>
                                        <Chip label={registration.bankDetails?.accountType?.toUpperCase() || "N/A"} size="small" color="primary" variant="outlined" />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body2" color="textSecondary">Account Number</Typography>
                                        <Typography variant="body1" fontWeight={700} sx={{ letterSpacing: 1 }}>{registration.bankDetails?.accountNumber || "N/A"}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body2" color="textSecondary">IFSC Code</Typography>
                                        <Typography variant="body1" fontWeight={700}>{registration.bankDetails?.ifscCode || "N/A"}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body2" color="textSecondary">UPI ID</Typography>
                                        <Typography variant="body1" fontWeight={700} color="primary">{registration.bankDetails?.upiId || "N/A"}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>

                {/* Right Column: Documents & Verification */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        {/* Legal Documents */}
                        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h5" fontWeight={800} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                                    <DescriptionIcon color="primary" /> Legal Documents
                                </Typography>
                                <Box sx={{ p: 2, bgcolor: "#f8f9fc", borderRadius: 3, border: "1px dashed #ced4da" }}>
                                    <Typography variant="subtitle2" fontWeight={800} color="textPrimary">Business TIN / License</Typography>
                                    <Typography variant="h4" fontWeight={800} color="primary" sx={{ my: 1 }}>{registration.businessTIN || "NOT PROVIDED"}</Typography>
                                    {registration.tinExpireDate && (
                                        <Typography variant="caption" sx={{ display: "block", color: "error.main", fontWeight: 700 }}>
                                            Expires: {new Date(registration.tinExpireDate).toLocaleDateString()}
                                        </Typography>
                                    )}
                                </Box>

                                <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 3, mb: 1.5 }}>
                                    TIN Certificate Image
                                </Typography>
                                <Box sx={{
                                    width: "100%",
                                    height: 240,
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    bgcolor: "#eee",
                                    border: "1px solid",
                                    borderColor: "divider"
                                }}>
                                    {registration.tinCertificate ? (
                                        <img
                                            src={getApiImageUrl(registration.tinCertificate)}
                                            alt="TIN Doc"
                                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                            onClick={() => window.open(getApiImageUrl(registration.tinCertificate), "_blank")}
                                        />
                                    ) : (
                                        <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <Typography color="textSecondary">No document uploaded</Typography>
                                        </Box>
                                    )}
                                </Box>
                                {registration.tinCertificate && (
                                    <Button
                                        fullWidth
                                        variant="text"
                                        size="small"
                                        onClick={() => window.open(getApiImageUrl(registration.tinCertificate), "_blank")}
                                        sx={{ mt: 1 }}
                                    >
                                        View Full Document
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Activity & Info Card */}
                        <Card elevation={0} sx={{ borderRadius: 4, bgcolor: theme.palette.secondary.light, color: theme.palette.secondary.darker }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>System Info</Typography>
                                <Stack spacing={1.5}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography variant="body2">System User ID:</Typography>
                                        <Typography variant="body2" fontWeight={700}>{registration.user?.userId || "N/A"}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography variant="body2">Account Type:</Typography>
                                        <Typography variant="body2" fontWeight={700}>{registration.user?.role?.toUpperCase() || "VENDOR"}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography variant="body2">Applied Date:</Typography>
                                        <Typography variant="body2" fontWeight={700}>{new Date(registration.createdAt).toLocaleString()}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default VendorDetailView;

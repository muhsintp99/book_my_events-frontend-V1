import { useState, useEffect, useMemo } from "react";
import {
    Box, Button, Typography, Chip, Avatar, Table, TableBody, TableCell,
    TableHead, TableRow, IconButton, CircularProgress,
    Paper, Stack, Grid, Tooltip, useTheme
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { Link } from "react-router-dom";
import { API_BASE_URL, getApiImageUrl } from "../../../utils/apiImageUtils";

const VendorRegistrations = () => {
    const theme = useTheme();
    const [registrations, setRegistrations] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const getAuthToken = () => localStorage.getItem("token") || sessionStorage.getItem("token") || "";

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/vendor-registrations/pending`, {
                headers: { Authorization: `Bearer ${getAuthToken()}` }
            });
            const data = await res.json();
            if (data.success) {
                setRegistrations(data.data);
            }
        } catch (err) {
            console.error("Fetch registrations error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this vendor?`)) return;

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
                fetchRegistrations();
            } else {
                alert(data.message || `Failed to ${action} registration`);
            }
        } catch (err) {
            console.error(`${action} registration error:`, err);
            alert(`Error trying to ${action} registration`);
        }
    };

    const filteredRegistrations = useMemo(() => {
        return registrations.filter(r => {
            const name = `${r.ownerFirstName || ""} ${r.ownerLastName || ""}`.toLowerCase();
            const email = (r.ownerEmail || "").toLowerCase();
            const store = (r.storeName || "").toLowerCase();
            return name.includes(searchQuery.toLowerCase()) ||
                email.includes(searchQuery.toLowerCase()) ||
                store.includes(searchQuery.toLowerCase());
        });
    }, [registrations, searchQuery]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, background: "#f4f7fe", minHeight: "100vh" }}>
            {/* Header Section */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 4,
                    background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                    color: "white"
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <PersonAddIcon sx={{ fontSize: 32 }} />
                            <Typography variant="h4" fontWeight={800} letterSpacing={-0.5} color="white">
                                Vendor Registrations
                            </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ opacity: 0.95, color: "white", mt: 0.5 }}>
                            Manage new vendor sign-ups and approval requests
                        </Typography>
                    </Box>
                    <Box sx={{ minWidth: 200, textAlign: "right" }}>
                        <Typography variant="h2" fontWeight={800} color="white">
                            {registrations.length}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, textTransform: "uppercase", fontWeight: 700 }}>
                            Pending Requests
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Main Table Card */}
            <Paper elevation={0} sx={{ borderRadius: 4, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                <Box sx={{ p: 3, display: "flex", gap: 2, alignItems: "center", bgcolor: "white" }}>
                    <TextField
                        size="small"
                        placeholder="Search by name, email, or store..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        sx={{ flexGrow: 1, maxWidth: 450 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" color="disabled" />
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>

                <Table>
                    <TableHead sx={{ bgcolor: "#fafcfe" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Vendor / Store</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Zone</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Applied On</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                    <CircularProgress size={40} />
                                    <Typography sx={{ mt: 2 }} color="textSecondary">Loading registrations...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : filteredRegistrations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                    <Typography color="textSecondary" variant="h6">No pending registrations found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRegistrations.map(r => (
                                <TableRow key={r._id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar
                                                src={getApiImageUrl(r.logo)}
                                                sx={{ width: 45, height: 45, borderRadius: "10px", bgcolor: theme.palette.primary.light }}
                                            >
                                                {r.storeName ? r.storeName[0].toUpperCase() : "V"}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700}>
                                                    {r.storeName}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                                                    {r.ownerFirstName} {r.ownerLastName}
                                                </Typography>
                                                <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                                                    {r.ownerEmail}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={r.module?.title || "N/A"}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontWeight: 600, color: theme.palette.secondary.main, borderColor: theme.palette.secondary.light }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="textSecondary">
                                            {r.zone?.name || "N/A"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center" color="textSecondary">
                                            <CalendarTodayIcon sx={{ fontSize: 14 }} />
                                            <Typography variant="caption">
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label="PENDING"
                                            size="small"
                                            color="warning"
                                            sx={{ fontWeight: 700, fontSize: "0.65rem" }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    component={Link}
                                                    to={`/settings/vendor-registrations/${r._id}`}
                                                    color="primary"
                                                    size="small"
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Quick Approve">
                                                <IconButton
                                                    onClick={() => handleQuickAction(r._id, "approve")}
                                                    color="success"
                                                    size="small"
                                                >
                                                    <CheckCircleIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Reject">
                                                <IconButton
                                                    onClick={() => handleQuickAction(r._id, "reject")}
                                                    color="error"
                                                    size="small"
                                                >
                                                    <CancelIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default VendorRegistrations;

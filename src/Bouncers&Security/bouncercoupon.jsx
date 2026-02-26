import React, { useState, useEffect } from "react";
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Typography, MenuItem, Select, Table, TableHead, TableRow,
    TableCell, TableBody, Paper, TableContainer, useMediaQuery,
    Stack, CircularProgress, Snackbar, Alert
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.bookmyevent.ae/api";

const BouncerCoupon = () => {
    const [coupons, setCoupons] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });
    const [formData, setFormData] = useState({ title: "", type: "", code: "", totalUses: "", startDate: "", expireDate: "", discountType: "", minPurchase: "", discount: "", maxDiscount: "" });

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const fetchCoupons = async (pageNum = 1, searchQuery = "") => {
        setLoading(true);
        try {
            const url = `${API_BASE_URL}/bouncer-coupons?page=${pageNum}&limit=10&search=${encodeURIComponent(searchQuery)}`;
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const data = await response.json();
            if (data.success || Array.isArray(data.data)) {
                setCoupons(data.data?.coupons || data.data || []);
                if (data.pagination) setPagination(data.pagination);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons(page, search);
    }, [page, search]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({ title: "", type: "", code: "", totalUses: "", startDate: "", expireDate: "", discountType: "", minPurchase: "", discount: "", maxDiscount: "" });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/bouncer-coupons`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ ...formData, code: formData.code.toUpperCase().trim(), isActive: true }),
            });
            if (response.ok) {
                setSuccess("Coupon created successfully!");
                handleClose();
                fetchCoupons();
            }
        } catch (err) {
            setError("Failed to create coupon");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <Box p={3}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Bouncers & Security Coupons</Typography>

            <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}><Alert severity="error">{error}</Alert></Snackbar>
            <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}><Alert severity="success">{success}</Alert></Snackbar>

            <Stack direction="row" justifyContent="space-between" mb={3}>
                <Button variant="contained" onClick={handleOpen}>Add New Coupon</Button>
                <TextField size="small" placeholder="Search by code" value={search} onChange={(e) => setSearch(e.target.value)} />
            </Stack>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
                <DialogTitle>Add New Coupon</DialogTitle>
                <DialogContent dividers>
                    <TextField fullWidth label="Title *" name="title" value={formData.title} onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField fullWidth label="Code *" name="code" value={formData.code} onChange={handleChange} sx={{ mb: 2 }} />
                    <Select fullWidth name="type" value={formData.type} onChange={handleChange} displayEmpty sx={{ mb: 2 }}>
                        <MenuItem value="">--Select Type--</MenuItem>
                        <MenuItem value="percentage">Percentage</MenuItem>
                        <MenuItem value="fixed_amount">Fixed Amount</MenuItem>
                    </Select>
                    <TextField fullWidth label="Discount *" name="discount" type="number" value={formData.discount} onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField fullWidth type="date" label="Expire Date" name="expireDate" value={formData.expireDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? <CircularProgress size={20} /> : "Create Coupon"}</Button>
                </DialogActions>
            </Dialog>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell>Title</TableCell>
                            <TableCell>Code</TableCell>
                            <TableCell>Discount</TableCell>
                            <TableCell>Expires</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? <TableRow><TableCell colSpan={5} align="center" py={4}><CircularProgress /></TableCell></TableRow> :
                            coupons.length === 0 ? <TableRow><TableCell colSpan={5} align="center" py={4}>No coupons found</TableCell></TableRow> :
                                coupons.map((coupon) => (
                                    <TableRow key={coupon._id} hover>
                                        <TableCell>{coupon.title}</TableCell>
                                        <TableCell><strong>{coupon.code}</strong></TableCell>
                                        <TableCell>{coupon.discountType === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`}</TableCell>
                                        <TableCell>{coupon.expireDate ? new Date(coupon.expireDate).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell><Typography color={coupon.isActive ? 'success.main' : 'error.main'}>{coupon.isActive ? 'Active' : 'Inactive'}</Typography></TableCell>
                                    </TableRow>
                                ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default BouncerCoupon;

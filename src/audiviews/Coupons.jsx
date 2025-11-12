import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  MenuItem,
  Select,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  useMediaQuery,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Switch,
  Tooltip,
  DialogContentText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    code: "",
    totalUses: "",
    startDate: "",
    expireDate: "",
    discountType: "",
    minPurchase: "",
    discount: "",
    maxDiscount: "",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // Helper functions
  const getAuthToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  const getUserRole = () => {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!user) return null;
    try {
      return JSON.parse(user).role;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  };

  // Fetch coupons
  const fetchCoupons = async (pageNum = 1, searchQuery = "") => {
    const token = getAuthToken();
    if (!token) {
      setError("You are not authenticated. Please log in.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}/coupons?page=${pageNum}&limit=10&search=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }
      if (response.status === 403) {
        setError("Access denied. You don't have permission to view coupons.");
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      if (data.success && data.data && data.data.coupons) {
        setCoupons(data.data.coupons);
        setPagination(data.pagination || {
          currentPage: pageNum,
          totalPages: Math.ceil(data.data.coupons.length / 10) || 1,
          totalItems: data.data.coupons.length,
          itemsPerPage: 10,
        });

        if (data.data.coupons.length === 0) {
          setError("No coupons found. Create a new one using 'Add New Coupon'.");
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch coupons.");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const role = getUserRole();
    const token = getAuthToken();
    if (!token) {
      setError("You are not authenticated. Please log in.");
      return;
    }
    if (!["superadmin", "admin", "vendor"].includes(role)) {
      setError("Access denied. Admin, Superadmin, or Vendor role required.");
      return;
    }
    fetchCoupons(page, search);
  }, [page, search]);

  // Dialog Handlers
  const handleOpen = (coupon = null) => {
    if (coupon) {
      setEditMode(true);
      setEditingCoupon(coupon);
      setFormData({
        title: coupon.title,
        type: coupon.type,
        code: coupon.code,
        totalUses: coupon.totalUses || "",
        startDate: coupon.startDate ? coupon.startDate.split("T")[0] : "",
        expireDate: coupon.expireDate ? coupon.expireDate.split("T")[0] : "",
        discountType: coupon.discountType || "",
        minPurchase: coupon.minPurchase || "",
        discount: coupon.discount || "",
        maxDiscount: coupon.maxDiscount || "",
      });
    } else {
      setEditMode(false);
      setEditingCoupon(null);
      setFormData({
        title: "",
        type: "",
        code: "",
        totalUses: "",
        startDate: "",
        expireDate: "",
        discountType: "",
        minPurchase: "",
        discount: "",
        maxDiscount: "",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setEditingCoupon(null);
  };

  // Save (Create or Update)
  const handleSave = async () => {
    const token = getAuthToken();
    if (!token) return;

    if (!formData.title || !formData.code || !formData.type || !formData.discount || !formData.expireDate) {
      setError("Please fill all required fields: Title, Code, Type, Discount, Expire Date");
      return;
    }

    setLoading(true);
    try {
      const url = editMode
        ? `${API_BASE_URL}/coupons/${editingCoupon._id}`
        : `${API_BASE_URL}/coupons`;

      const method = editMode ? "PUT" : "POST";

      const body = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        totalUses: parseInt(formData.totalUses) || null,
        minPurchase: parseFloat(formData.minPurchase) || 0,
        discount: parseFloat(formData.discount) || 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${editMode ? "update" : "create"} coupon`);
      }

      setSuccess(data.message || `Coupon ${editMode ? "updated" : "created"} successfully!`);
      handleClose();
      fetchCoupons(page, search);
    } catch (err) {
      setError(err.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Coupon
  const handleDeleteClick = (coupon) => {
    setCouponToDelete(coupon);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    const token = getAuthToken();
    if (!token || !couponToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/${couponToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete coupon");
      }

      setSuccess("Coupon deleted successfully!");
      setDeleteConfirmOpen(false);
      setCouponToDelete(null);
      fetchCoupons(page, search);
    } catch (err) {
      setError(err.message || "Failed to delete coupon");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Status
  const toggleStatus = async (coupon) => {
    const token = getAuthToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/${coupon._id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setSuccess(`Coupon ${coupon.isActive ? "deactivated" : "activated"}!`);
      fetchCoupons(page, search);
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRetry = () => fetchCoupons(page, search);
  const handleLoginRedirect = () => navigate("/login");
  const handleDashboardRedirect = () => navigate("/dashboard");

  // Loading state
  if (loading && coupons.length === 0) {
    return (
      <Box p={2} display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Loading coupons...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Coupons Management
      </Typography>

      {/* Notifications */}
      {/* ──────────────────────  NOTIFICATIONS (top‑right)  ────────────────────── */}
<Snackbar
  open={!!error}
  autoHideDuration={6000}
  onClose={() => setError(null)}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}   // ← top‑right
>
  <Alert
    severity="error"
    onClose={() => setError(null)}
    sx={{ width: "100%" }}
    action={
      <Stack direction="row" spacing={1}>
        {error?.includes("not authenticated") && (
          <Button color="inherit" size="small" onClick={handleLoginRedirect}>
            Login
          </Button>
        )}
        {error?.includes("Access denied") && (
          <Button color="inherit" size="small" onClick={handleDashboardRedirect}>
            Dashboard
          </Button>
        )}
        {error && !error.includes("not authenticated") && !error.includes("Access denied") && (
          <Button color="inherit" size="small" onClick={handleRetry}>
            Retry
          </Button>
        )}
      </Stack>
    }
  >
    {error}
  </Alert>
</Snackbar>

{/* SUCCESS – green when activated, red when deactivated */}
<Snackbar
  open={!!success}
  autoHideDuration={4000}
  onClose={() => setSuccess(null)}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}   // ← top‑right
>
  <Alert
    severity={success?.includes("activated") ? "success" : "error"}   // ← green / red
    onClose={() => setSuccess(null)}
    sx={{
      bgcolor: success?.includes("activated") ? "#4caf50" : "#f44336", // explicit colour
      color: "#fff",
    }}
  >
    {success}
  </Alert>
</Snackbar>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
        <DialogTitle>{editMode ? "Edit Coupon" : "Add New Coupon"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Title *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          />
          <Select
            fullWidth
            name="type"
            value={formData.type}
            onChange={handleChange}
            displayEmpty
            sx={{ mb: 2 }}
            required
          >
            <MenuItem value="">--Select coupon type *--</MenuItem>
            <MenuItem value="percentage">Percentage</MenuItem>
            <MenuItem value="fixed_amount">Fixed Amount</MenuItem>
            <MenuItem value="free_shipping">Free Shipping</MenuItem>
          </Select>
          <TextField
            fullWidth
            label="Code *"
            name="code"
            value={formData.code}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
            disabled={editMode}
            helperText={editMode ? "Code cannot be changed" : "Will be converted to uppercase"}
          />
          <TextField
            fullWidth
            label="Total Uses"
            name="totalUses"
            type="number"
            value={formData.totalUses}
            onChange={handleChange}
            sx={{ mb: 2 }}
            inputProps={{ min: 1 }}
          />
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="date"
            label="Expire Date *"
            name="expireDate"
            value={formData.expireDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            required
          />
          <Select
            fullWidth
            name="discountType"
            value={formData.discountType}
            onChange={handleChange}
            displayEmpty
            sx={{ mb: 2 }}
          >
            <MenuItem value="">--Select discount type--</MenuItem>
            <MenuItem value="percentage">Percentage (%)</MenuItem>
            <MenuItem value="amount">Fixed Amount</MenuItem>
          </Select>
          <TextField
            fullWidth
            label="Min Purchase Amount"
            name="minPurchase"
            type="number"
            value={formData.minPurchase}
            onChange={handleChange}
            sx={{ mb: 2 }}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            fullWidth
            label="Discount *"
            name="discount"
            type="number"
            value={formData.discount}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            fullWidth
            label="Max Discount Amount"
            name="maxDiscount"
            type="number"
            value={formData.maxDiscount}
            onChange={handleChange}
            sx={{ mb: 2 }}
            inputProps={{ min: 0, step: 0.01 }}
            helperText="For percentage discounts"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Coupon</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the coupon <strong>{couponToDelete?.title}</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={confirmDelete} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Table */}
      <Paper sx={{ mt: 2, width: "100%" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          p={2}
        >
          <Button variant="contained" onClick={() => handleOpen()} disabled={loading}>
            Add New Coupon
          </Button>
          <TextField
            label="Search by title or code"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            sx={{ maxWidth: { sm: 300 } }}
            disabled={loading}
          />
        </Stack>

        {loading && coupons.length > 0 && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        )}

        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>S#</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Total Uses</TableCell>
                <TableCell>Used</TableCell>
                <TableCell>Min Purchase</TableCell>
                <TableCell>Max Discount</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Discount Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Expire Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={14} align="center">
                    <Stack spacing={2} alignItems="center" py={4}>
                      <Typography variant="h6" color="textSecondary">
                        No coupons found
                      </Typography>
                      <Button variant="outlined" onClick={() => handleOpen()}>
                        Create First Coupon
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon, index) => (
                  <TableRow key={coupon._id} hover>
                    <TableCell>{(page - 1) * pagination.itemsPerPage + index + 1}</TableCell>
                    <TableCell>{coupon.title}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: "bold" }}>
                        {coupon.code}
                      </Typography>
                    </TableCell>
                    <TableCell>{coupon.type}</TableCell>
                    <TableCell>{coupon.totalUses || "Unlimited"}</TableCell>
                    <TableCell>{coupon.usedCount || 0}</TableCell>
                    <TableCell>${coupon.minPurchase || 0}</TableCell>
                    <TableCell>{coupon.maxDiscount ? `$${coupon.maxDiscount}` : "-"}</TableCell>
                    <TableCell>
                      {coupon.discountType === "percentage" ? `${coupon.discount}%` : `$${coupon.discount}`}
                    </TableCell>
                    <TableCell>{coupon.discountType}</TableCell>
                    <TableCell>
                      {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      {coupon.expireDate ? new Date(coupon.expireDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={coupon.isActive}
                        onChange={() => toggleStatus(coupon)}
                        color="primary"
                        size="small"
                      />
                      <Typography
                        variant="caption"
                        color={coupon.isActive ? "success.main" : "error.main"}
                        sx={{ ml: 1 }}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpen(coupon)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDeleteClick(coupon)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" p={2}>
            <Button
              variant="outlined"
              disabled={page === 1 || loading}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </Button>
            <Typography variant="body2">
              Page {page} of {pagination.totalPages}
              {pagination.totalItems > 0 && ` (${pagination.totalItems} total)`}
            </Typography>
            <Button
              variant="outlined"
              disabled={page === pagination.totalPages || loading}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </Button>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default Coupons;
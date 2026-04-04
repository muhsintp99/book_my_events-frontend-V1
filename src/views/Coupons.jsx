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
  Tooltip,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.bookmyevent.ae/api";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
  const [modules, setModules] = useState([]);
  const [secondaryModules, setSecondaryModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
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
    description: "",
    bannerImage: null,
    isActive: true,
    applyTo: "total",
    linkedModules: [],
    linkedSecondaryModules: [],
  });

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // Helper functions
  const getAuthToken = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("Retrieved token:", token ? "Token exists" : "No token found");
    return token;
  };

  const getUserRole = () => {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!user) {
      console.log("No user data found in storage");
      return null;
    }
    try {
      const parsedUser = JSON.parse(user);
      console.log("User role:", parsedUser.role);
      return parsedUser.role;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  };

  // Enhanced fetch coupons with better error handling - NO TIMERS
  const fetchCoupons = async (pageNum = 1, searchQuery = "") => {
    const token = getAuthToken();
    if (!token) {
      setError("You are not authenticated. Please log in.");
      console.log("No token found");
      return;
    }

    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const url = `${API_BASE_URL}/coupons?page=${pageNum}&limit=10&ownerType=admin&search=${encodeURIComponent(searchQuery)}`;
      console.log("Fetching admin coupons from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      console.log("API response status:", response.status, "Response text:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Invalid JSON response:", text);
        throw new Error("Server returned invalid response format. Please check server logs.");
      }

      // Handle specific error cases - NO REDIRECTS WITH TIMERS
      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        console.log("401 Unauthorized - but staying on page");
        return;
      }

      if (response.status === 403) {
        setError("Access denied. You don't have permission to view coupons.");
        console.log("403 Forbidden - but staying on page");
        return;
      }

      // Check if the response indicates an error (even with 200 status)
      if (data.success === false) {
        console.error("API returned error:", data);
        throw new Error(data.message || "Failed to fetch coupons from server");
      }

      if (!response.ok) {
        console.error("Server error response:", data);
        const errorMessage = data.message || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Handle successful response
      if (data.success !== false) {
        // Check for different possible response structures
        let couponsArray = [];
        let paginationData = {
          currentPage: pageNum,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        };

        if (data.data && data.data.coupons) {
          // Structure: { data: { coupons: [...] }, pagination: {...} }
          couponsArray = data.data.coupons;
          paginationData = data.pagination || paginationData;
        } else if (data.coupons) {
          // Structure: { coupons: [...], pagination: {...} }
          couponsArray = data.coupons;
          paginationData = data.pagination || paginationData;
        } else if (Array.isArray(data)) {
          // Structure: [coupon1, coupon2, ...]
          couponsArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          // Structure: { data: [coupon1, coupon2, ...] }
          couponsArray = data.data;
        }

        setCoupons(couponsArray);
        setPagination(paginationData);

        if (couponsArray.length === 0) {
          setError("No coupons found. You can create a new coupon using the 'Add New Coupon' button.");
        }
      } else {
        throw new Error(data.message || "Unknown error occurred while fetching coupons");
      }

    } catch (err) {
      console.error("Fetch error:", err);
      const errorMessage = err.message || "Network error occurred. Please check your connection and try again.";
      setError(errorMessage);
      setCoupons([]); // Clear coupons on error
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllModules = async () => {
    setLoadingModules(true);
    try {
      const [pRes, sRes] = await Promise.all([
        fetch(`${API_BASE_URL}/modules`),
        fetch(`${API_BASE_URL}/secondary-modules`)
      ]);
      const pData = await pRes.json();
      const sData = await sRes.json();
      
      setModules(Array.isArray(pData) ? pData : (pData.data || []));
      setSecondaryModules(Array.isArray(sData) ? sData : (sData.data || []));
    } catch (err) {
      console.error("Error fetching modules:", err);
    } finally {
      setLoadingModules(false);
    }
  };

  const isModuleAllowed = (m, type = 'primary') => {
    const name = (m.title || m.name || '').toLowerCase();
    if (type === 'primary') {
      const allowedKeys = ['venue', 'catering', 'photograph', 'makeup', 'music', 'dj', 'transport', 'decorator', 'cake', 'ornam', 'boutiq'];
      return allowedKeys.some(key => name.includes(key));
    } else {
      const allowedKeys = ['mehan', 'mehen', 'invitation', 'floris'];
      return allowedKeys.some(key => name.includes(key));
    }
  };

  // Check role and fetch coupons - ALLOW ADMIN AND SUPERADMIN - NO TIMERS
  useEffect(() => {
    const role = getUserRole();
    const token = getAuthToken();
    console.log("Initial check - Token:", token ? "Exists" : "Missing", "Role:", role);

    if (!token) {
      console.log("No token found - showing error but staying on page");
      setError("You are not authenticated. Please log in.");
      return;
    }

    // ALLOW BOTH ADMIN AND SUPERADMIN
    if (role !== "superadmin" && role !== "admin") {
      console.log("Not admin or superadmin - showing error but staying on page");
      setError("Access denied. Admin or Superadmin role required.");
      return;
    }

    console.log("Proceeding to fetch coupons - role check passed");
    fetchCoupons(page, search);
    fetchAllModules();
  }, [page, search]);

  const handleOpen = () => {
    setEditMode(false);
    setSelectedCoupon(null);
    setOpen(true);
  };

  const handleEdit = (coupon) => {
    setEditMode(true);
    setSelectedCoupon(coupon);

    // Format dates for input fields
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    setFormData({
      title: coupon.title || "",
      type: coupon.type || "",
      code: coupon.code || "",
      totalUses: coupon.totalUses?.toString() || "",
      startDate: formatDate(coupon.startDate),
      expireDate: formatDate(coupon.expireDate),
      discountType: coupon.discountType || "",
      minPurchase: coupon.minPurchase?.toString() || "",
      discount: coupon.discount?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      description: coupon.description || "",
      bannerImage: null, // Don't pre-fill file input
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
      applyTo: coupon.applyTo || "total",
      linkedModules: coupon.linkedModules || [],
      linkedSecondaryModules: coupon.linkedSecondaryModules || [],
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedCoupon(null);
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
      description: "",
      bannerImage: null,
      isActive: true,
      applyTo: "total",
      linkedModules: [],
      linkedSecondaryModules: [],
    });
  };

  const handleSave = async () => {
    const token = getAuthToken();
    if (!token) {
      setError("You are not authenticated. Please log in.");
      console.log("No token found during save");
      return;
    }

    // Basic validation
    if (!formData.title || !formData.code || !formData.type || !formData.discount) {
      setError("Please fill in all required fields (Title, Code, Type, Discount)");
      return;
    }

    setLoading(true);
    try {
      const url = editMode
        ? `${API_BASE_URL}/coupons/${selectedCoupon._id || selectedCoupon.id}`
        : `${API_BASE_URL}/coupons`;

      const method = editMode ? "PUT" : "POST";

      const form = new FormData();
      form.append("title", formData.title);
      form.append("code", formData.code.toUpperCase().trim());
      form.append("type", formData.type);
      form.append("discountType", formData.discountType);
      form.append("discount", formData.discount);
      form.append("description", formData.description);
      form.append("totalUses", formData.totalUses || "");
      form.append("startDate", formData.startDate);
      form.append("expireDate", formData.expireDate);
      form.append("isActive", formData.isActive);
      form.append("ownerType", "admin");
      form.append("applyTo", formData.applyTo || "total");
      
      // Handle Arrays
      if (formData.linkedModules && formData.linkedModules.length > 0) {
        form.append("linkedModules", JSON.stringify(formData.linkedModules));
      }
      if (formData.linkedSecondaryModules && formData.linkedSecondaryModules.length > 0) {
        form.append("linkedSecondaryModules", JSON.stringify(formData.linkedSecondaryModules));
      }

      if (formData.bannerImage) {
        form.append("bannerImage", formData.bannerImage);
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const text = await response.text();
      console.log(`${editMode ? 'Update' : 'Save'} coupon response status:`, response.status, "Response text:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Invalid JSON response:", text);
        throw new Error("Server returned invalid response format");
      }

      // NO TIMER REDIRECTS
      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        console.log("401 Unauthorized during save - but staying on page");
        return;
      }

      if (data.success === false) {
        throw new Error(data.message || `Failed to ${editMode ? 'update' : 'create'} coupon`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      // Handle successful creation/update
      const updatedCoupon = data.data?.coupon || data.coupon || data;

      if (editMode) {
        // Update existing coupon in the list
        setCoupons(prev => prev.map(coupon =>
          (coupon._id || coupon.id) === (selectedCoupon._id || selectedCoupon.id)
            ? { ...coupon, ...updatedCoupon }
            : coupon
        ));
        setSuccess("Coupon updated successfully!");
      } else {
        // Add new coupon to the list
        if (updatedCoupon && (updatedCoupon._id || updatedCoupon.id)) {
          setCoupons(prev => [updatedCoupon, ...prev]);
        }
        setSuccess("Coupon created successfully!");
      }

      handleClose();
      // Optionally refresh the list to get updated pagination
      setTimeout(() => fetchCoupons(page, search), 1000);
    } catch (err) {
      console.error("Save error:", err.message);
      setError(err.message || `Failed to ${editMode ? 'update' : 'create'} coupon. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (coupon) => {
    setSelectedCoupon(coupon);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    const token = getAuthToken();
    if (!token) {
      setError("You are not authenticated. Please log in.");
      return;
    }

    if (!selectedCoupon) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/${selectedCoupon._id || selectedCoupon.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      console.log("Delete coupon response status:", response.status, "Response text:", text);

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // Handle cases where delete might return empty response
        data = {};
      }

      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }

      if (response.status === 404) {
        setError("Coupon not found. It may have already been deleted.");
        // Remove from local state anyway
        setCoupons(prev => prev.filter(coupon =>
          (coupon._id || coupon.id) !== (selectedCoupon._id || selectedCoupon.id)
        ));
        setDeleteDialogOpen(false);
        setSelectedCoupon(null);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      // Remove coupon from local state
      setCoupons(prev => prev.filter(coupon =>
        (coupon._id || coupon.id) !== (selectedCoupon._id || selectedCoupon.id)
      ));

      setSuccess("Coupon deleted successfully!");
      setDeleteDialogOpen(false);
      setSelectedCoupon(null);

      // Refresh the list to get updated pagination
      setTimeout(() => fetchCoupons(page, search), 1000);
    } catch (err) {
      console.error("Delete error:", err.message);
      setError(err.message || "Failed to delete coupon. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCoupon(null);
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

  const handleRetry = () => {
    fetchCoupons(page, search);
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleDashboardRedirect = () => {
    navigate("/dashboard");
  };

  const isExpired = (expireDate) => {
    if (!expireDate) return false;
    return new Date(expireDate) < new Date();
  };

  const getStatusColor = (coupon) => {
    if (!coupon.isActive) return "error";
    if (isExpired(coupon.expireDate)) return "warning";
    return "success";
  };

  const getStatusText = (coupon) => {
    if (!coupon.isActive) return "Inactive";
    if (isExpired(coupon.expireDate)) return "Expired";
    return "Active";
  };

  // Show loading state during initial fetch
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

      {/* Error/Success Messages - WITH MANUAL REDIRECT BUTTONS */}
      <Snackbar
        open={!!error}
        autoHideDuration={null}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity="error"
          onClose={() => setError(null)}
          action={
            <Stack direction="row" spacing={1}>
              {error && error.includes("not authenticated") && (
                <Button color="inherit" size="small" onClick={handleLoginRedirect}>
                  Go to Login
                </Button>
              )}
              {error && error.includes("Access denied") && (
                <Button color="inherit" size="small" onClick={handleDashboardRedirect}>
                  Go to Dashboard
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

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>

      {/* Add/Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 12px 48px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          pb: 1, 
          pt: 3, 
          px: 3,
          color: '#2d3436',
          fontWeight: 800,
          fontSize: '1.4rem'
        }}>
          <Box sx={{ 
            bgcolor: '#E15B65', 
            p: 0.8, 
            borderRadius: 1.5, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: `0 4px 12px rgba(225, 91, 101, 0.3)`
          }}>
            <Box component="span" sx={{ fontSize: 20, color: '#fff', display: 'flex', alignItems: 'center' }}>
              🎫
            </Box>
          </Box>
          {editMode ? "Edit Coupon" : "Create New Coupon"}
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 2 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Coupon Title *"
              name="title"
              fullWidth
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Summer Special"
              size="medium"
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            />
            <TextField
              label="Coupon Code *"
              name="code"
              fullWidth
              required
              value={formData.code}
              onChange={handleChange}
              placeholder="SUMMER20"
              size="medium"
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              disabled={editMode}
            />

            <FormControl fullWidth size="medium">
              <InputLabel>Discount Type</InputLabel>
              <Select
                label="Discount Type"
                name="discountType"
                value={formData.discountType || ""}
                onChange={handleChange}
                sx={{ borderRadius: 2.5 }}
              >
                <MenuItem value="">--Select discount type--</MenuItem>
                <MenuItem value="percentage">Percentage (%)</MenuItem>
                <MenuItem value="amount">Fixed Amount (₹)</MenuItem>
              </Select>
            </FormControl>

            {/* Check if any selected module is Cake, Ornaments, or Boutique to hide ApplyTo */}
            {(() => {
              const selectedMainNames = (formData.linkedModules || []).map(id => modules.find(m => m._id === id)?.title?.toLowerCase() || "");
              const restrictedKeywords = ["cake", "ornament", "boutique"];
              const isRestricted = selectedMainNames.some(name => restrictedKeywords.some(key => name.includes(key)));

              if (!isRestricted) {
                return (
                  <FormControl fullWidth size="medium">
                    <InputLabel>Apply Discount To</InputLabel>
                    <Select
                      label="Apply Discount To"
                      name="applyTo"
                      value={formData.applyTo || "total"}
                      onChange={handleChange}
                      sx={{ borderRadius: 2.5 }}
                    >
                      <MenuItem value="total">Total Amount</MenuItem>
                      <MenuItem value="advance">Advance Amount</MenuItem>
                    </Select>
                  </FormControl>
                );
              }
              return null;
            })()}

            <TextField
              label="Discount Value *"
              name="discount"
              type="number"
              fullWidth
              required
              value={formData.discount}
              onChange={handleChange}
              size="medium"
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            />

            <TextField
              label="Total Uses Allowed"
              name="totalUses"
              type="number"
              fullWidth
              value={formData.totalUses}
              onChange={handleChange}
              placeholder="Leave empty for unlimited"
              size="medium"
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            />

            <TextField
              label="Start Date *"
              name="startDate"
              type="date"
              fullWidth
              required
              value={formData.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              size="medium"
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            />

            <TextField
              label="Expire Date *"
              name="expireDate"
              type="date"
              fullWidth
              required
              value={formData.expireDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              size="medium"
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            />

            <FormControl fullWidth size="medium">
              <InputLabel>Primary Modules</InputLabel>
              <Select
                multiple
                label="Primary Modules"
                value={formData.linkedModules || []}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedModules: e.target.value }))}
                input={<OutlinedInput label="Primary Modules" sx={{ borderRadius: 2.5 }} />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((id) => {
                      const mod = modules.find(m => m._id === id);
                      return <Chip key={id} label={mod?.title || mod?.name || id} size="small" />;
                    })}
                  </Box>
                )}
              >
                {modules.map((m) => (
                  <MenuItem 
                    key={m._id} 
                    value={m._id}
                    disabled={!isModuleAllowed(m, 'primary')}
                    sx={!isModuleAllowed(m, 'primary') ? { opacity: 0.5, bgcolor: '#f1f1f1' } : {}}
                  >
                    {m.title || m.name || m._id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="medium">
              <InputLabel>Secondary Modules</InputLabel>
              <Select
                multiple
                label="Secondary Modules"
                value={formData.linkedSecondaryModules || []}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedSecondaryModules: e.target.value }))}
                input={<OutlinedInput label="Secondary Modules" sx={{ borderRadius: 2.5 }} />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((id) => {
                      const mod = secondaryModules.find(m => m._id === id);
                      return <Chip key={id} label={mod?.title || mod?.name || id} size="small" />;
                    })}
                  </Box>
                )}
              >
                {secondaryModules.map((m) => (
                  <MenuItem 
                    key={m._id} 
                    value={m._id}
                    disabled={!isModuleAllowed(m, 'secondary')}
                    sx={!isModuleAllowed(m, 'secondary') ? { opacity: 0.5, bgcolor: '#f1f1f1' } : {}}
                  >
                    {m.title || m.name || m._id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ p: 2.5, bgcolor: '#f8f9fa', borderRadius: 3, border: '2px dashed #dee2e6' }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#495057', fontWeight: 800, fontSize: '0.9rem' }}>
                Promotional Banner (Recommended 800x400px)
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  bgcolor: '#fff',
                  borderRadius: 2,
                  border: '1px solid #e9ecef',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#f8f9fa', borderColor: '#E15B65' }
                }}
                onClick={() => document.getElementById('couponBannerInput').click()}
              >
                {formData.bannerImage ? (
                  <Typography variant="body2" color="#E15B65" sx={{ fontWeight: 600 }}>
                    Selected: {formData.bannerImage.name}
                  </Typography>
                ) : selectedCoupon?.bannerImage ? (
                  <Box textAlign="center">
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                      Current Banner Exists
                    </Typography>
                  </Box>
                ) : (
                  <Box textAlign="center">
                    <Typography variant="body2" color="textSecondary">Click to upload banner</Typography>
                  </Box>
                )}
                <input
                  id="couponBannerInput"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => setFormData(prev => ({ ...prev, bannerImage: e.target.files[0] }))}
                />
              </Box>

              <TextField
                fullWidth
                label="Offer Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                sx={{ mt: 2.5, bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                placeholder="E.g., Get 20% off on all bookings!"
              />
            </Box>

            {editMode && (
              <FormControl fullWidth size="medium">
                <InputLabel>Status</InputLabel>
                <Select
                  name="isActive"
                  value={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value }))}
                  label="Status"
                  sx={{ borderRadius: 2.5 }}
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pb: 4, px: 4, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{ 
              color: '#55acee', 
              fontWeight: 600, 
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={loading}
            sx={{ 
              bgcolor: '#E15B65', 
              '&:hover': { bgcolor: '#c14a54' },
              borderRadius: 2.5,
              px: 4,
              boxShadow: `0 4px 14px rgba(225, 91, 101, 0.4)`
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : (editMode ? "Update Coupon" : "Save Coupon")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Coupon</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this coupon?
          </Typography>
          {selectedCoupon && (
            <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
              <Typography variant="subtitle2" color="primary">
                <strong>Code:</strong> {selectedCoupon.code}
              </Typography>
              <Typography variant="body2">
                <strong>Title:</strong> {selectedCoupon.title}
              </Typography>
              <Typography variant="body2">
                <strong>Type:</strong> {selectedCoupon.type}
              </Typography>
              <Typography variant="body2">
                <strong>Discount:</strong> {selectedCoupon.discountType === "percentage" ? `${selectedCoupon.discount}%` : `$${selectedCoupon.discount}`}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error" mt={2}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Content */}
      <Paper sx={{ mt: 2, width: "100%" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          p={2}
        >
          <Button variant="contained" onClick={handleOpen} disabled={loading}>
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

        {/* Loading indicator for search/pagination */}
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
                  <TableCell colSpan={12} align="center">
                    <Stack spacing={2} alignItems="center" py={4}>
                      <Typography variant="h6" color="textSecondary">
                        No coupons found
                      </Typography>
                      {error ? (
                        <Button variant="outlined" onClick={handleRetry}>
                          Try Again
                        </Button>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Create your first coupon using the "Add New Coupon" button
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon, index) => (
                  <TableRow key={coupon._id || coupon.id || index}>
                    <TableCell>
                      {(page - 1) * pagination.itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell>{coupon.title || "-"}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {coupon.code || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>{coupon.type || "-"}</TableCell>
                    <TableCell>{coupon.totalUses || "Unlimited"}</TableCell>
                    <TableCell>{coupon.usedCount || 0}</TableCell>
                    <TableCell>
                      {coupon.discountType === "percentage" ? `${coupon.discount}%` : `$${coupon.discount}`}
                    </TableCell>
                    <TableCell>{coupon.discountType || "-"}</TableCell>
                    <TableCell>
                      {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      {coupon.expireDate ? new Date(coupon.expireDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(coupon)}
                        color={getStatusColor(coupon)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Edit Coupon">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(coupon)}
                            disabled={loading}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Coupon">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(coupon)}
                            disabled={loading || deleteLoading}
                          >
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
              Page {pagination.currentPage} of {pagination.totalPages}
              {pagination.totalItems ? ` (${pagination.totalItems} total)` : ""}
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
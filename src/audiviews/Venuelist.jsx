import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  IconButton,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
} from "@mui/material";
import { 
  Visibility, 
  Edit, 
  Delete, 
  Search, 
  ToggleOn as ToggleOnIcon, 
  ToggleOff as ToggleOffIcon 
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Venues() {
  const theme = useTheme();
  const navigate = useNavigate();

  // API Configuration
  const API_BASE_URL = "http://localhost:5000/api"; // Replace with your production URL

  // State Management
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");

  // Filters
  const [filters, setFilters] = useState({
    brand: "",
    category: "",
    rentalType: "",
    search: "",
    isActive: "",
  });
  const [pendingFilters, setPendingFilters] = useState({
    brand: "",
    category: "",
    rentalType: "",
    search: "",
    isActive: "",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Extract unique values for filters
  const getUniqueBrands = () => {
    return [...new Set(venues.map((v) => v.provider?.storeName || "Unknown"))];
  };

  const getUniqueCategories = () => {
    return [...new Set(venues.map((v) => v.seatingArrangement || "Unknown"))];
  };

  const getUniqueRentalTypes = () => {
    return [...new Set(venues.map((v) => v.rentalType || "Unknown"))];
  };

  // Fetch venues from API
  const fetchVenues = async (page = 1, appliedFilters = filters) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
      });

      // Add filters
      if (appliedFilters.search) {
        params.append("search", appliedFilters.search);
      }
      if (appliedFilters.isActive !== "") {
        params.append("isActive", appliedFilters.isActive);
      }
      if (appliedFilters.rentalType) {
        params.append("rentalType", appliedFilters.rentalType);
      }

      const response = await fetch(`${API_BASE_URL}/createvenue?${params.toString()}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setVenues(data.data.venues || []);
        setPagination({
          currentPage: data.pagination.currentPage || 1,
          totalPages: data.pagination.totalPages || 1,
          totalItems: data.pagination.totalItems || 0,
          itemsPerPage: data.pagination.itemsPerPage || 10,
        });
      } else {
        throw new Error(data.message || "Failed to fetch venues");
      }
    } catch (err) {
      console.error("Error fetching venues:", err);
      setError(err.message);
      setToastMessage("Error fetching venues: " + err.message);
      setToastSeverity("error");
      setOpenToast(true);
      
      // Fallback to mock data if API fails
      setVenues([
        {
          _id: "1",
          venueName: "Sample Venue 1",
          venueAddress: "123 Main St, City",
          provider: { storeName: "City Events Co" },
          seatingArrangement: "Theater",
          rentalType: "hourly",
          hourlyPrice: 50,
          maxGuestsSeated: 200,
          isActive: true,
          facilities: {
            parkingAvailability: true,
            foodCateringAvailability: false,
            stageLightingAudio: true,
            wheelchairAccessibility: true,
            securityArrangements: false,
            wifiAvailability: true,
          },
          searchTags: ["event", "conference"],
          images: [],
          totalBookings: 5,
        },
        {
          _id: "2",
          venueName: "Sample Venue 2",
          venueAddress: "456 Oak St, City",
          provider: { storeName: "Elite Venues" },
          seatingArrangement: "Banquet",
          rentalType: "perDay",
          perDayPrice: 500,
          maxGuestsSeated: 300,
          isActive: false,
          facilities: {
            parkingAvailability: true,
            foodCateringAvailability: true,
            stageLightingAudio: false,
            wheelchairAccessibility: true,
            securityArrangements: true,
            wifiAvailability: false,
          },
          searchTags: ["wedding", "party"],
          images: [],
          totalBookings: 12,
        },
      ]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10,
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchVenues(1, filters);
  }, []);

  // Filter handlers
  const handleApplyFilters = () => {
    setFilters(pendingFilters);
    fetchVenues(1, pendingFilters);
  };

  const handleReset = () => {
    const resetFilters = { brand: "", category: "", rentalType: "", search: "", isActive: "" };
    setFilters(resetFilters);
    setPendingFilters(resetFilters);
    fetchVenues(1, resetFilters);
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    fetchVenues(newPage, filters);
  };

  // Export functionality
  const handleExport = () => {
    const headers = [
      "Sl,Venue Name,Address,Provider,Seating Arrangement,Rental Type,Price,Capacity,Status,Total Bookings,Tags",
    ];
    const rows = venues.map((v, i) => {
      const price = v.rentalType === "hourly" ? `${v.hourlyPrice}/hr` :
                   v.rentalType === "perDay" ? `${v.perDayPrice}/day` :
                   v.rentalType === "distanceWise" ? `${v.distanceWisePrice}/km` : "N/A";
      return `${i + 1},"${v.venueName}","${v.venueAddress}","${v.provider?.storeName || 'N/A'}","${v.seatingArrangement || 'N/A'}","${v.rentalType || 'N/A'}","${price}","${v.maxGuestsSeated || 'N/A'}","${v.isActive ? 'Active' : 'Inactive'}","${v.totalBookings || 0}","${(v.searchTags || []).join(', ')}"`;
    });
    const csv = headers.concat(rows).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `venues-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Action handlers
  const handleToggleStatus = async (venueId) => {
    try {
      const venue = venues.find(v => v._id === venueId);
      if (!venue) return;

      const response = await fetch(`${API_BASE_URL}/createvenue/${venueId}/status`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !venue.isActive }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setVenues(prevVenues =>
          prevVenues.map(v =>
            v._id === venueId ? { ...v, isActive: !v.isActive } : v
          )
        );
        
        setToastMessage(`Venue ${data.data.venue.isActive ? "activated" : "deactivated"} successfully`);
        setToastSeverity("success");
        setOpenToast(true);
      } else {
        throw new Error(data.message || "Failed to toggle status");
      }
    } catch (err) {
      console.error("Error toggling venue status:", err);
      setToastMessage("Error toggling venue status: " + err.message);
      setToastSeverity("error");
      setOpenToast(true);
    }
  };

  const handleDeleteVenue = async (venueId) => {
    if (!window.confirm("Are you sure you want to delete this venue?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/createvenue/${venueId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setVenues(prevVenues => prevVenues.filter(v => v._id !== venueId));
        setToastMessage("Venue deleted successfully");
        setToastSeverity("success");
        setOpenToast(true);
        // Update pagination if needed
        if (venues.length === 1 && pagination.currentPage > 1) {
          handlePageChange(pagination.currentPage - 1);
        }
      } else {
        throw new Error(data.message || "Failed to delete venue");
      }
    } catch (err) {
      console.error("Error deleting venue:", err);
      setToastMessage("Error deleting venue: " + err.message);
      setToastSeverity("error");
      setOpenToast(true);
    }
  };

  const handleViewVenue = (venueId) => {
    navigate(`/venue-setup/view/${venueId}`);
  };

  const handleEditVenue = (venueId) => {
    navigate(`/venue-setup/edit/${venueId}`);
  };

  // Toast handlers
  const handleCloseToast = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenToast(false);
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        bgcolor: "#fafafa", 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading venues...</Typography>
      </Box>
    );
  }

  // Error state
  if (error && venues.length === 0) {
    return (
      <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh", p: 2 }}>
        <Paper sx={{ p: 4, textAlign: "center", maxWidth: 600, mx: "auto" }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => fetchVenues(1, filters)}
            sx={{ bgcolor: "#2563eb" }}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh", p: 2 }}>
      {/* Navbar */}
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: "#333" }}>
            🏢 CityRide Venues
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Filters */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <FormControl sx={{ minWidth: 180 }} size="small">
            <Select
              displayEmpty
              value={pendingFilters.brand}
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, brand: e.target.value })
              }
            >
              <MenuItem value="">All Providers</MenuItem>
              {getUniqueBrands().map((b) => (
                <MenuItem key={b} value={b}>
                  {b}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180 }} size="small">
            <Select
              displayEmpty
              value={pendingFilters.category}
              onChange={(e) =>
                setPendingFilters({
                  ...pendingFilters,
                  category: e.target.value,
                })
              }
            >
              <MenuItem value="">All Arrangements</MenuItem>
              {getUniqueCategories().map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180 }} size="small">
            <Select
              displayEmpty
              value={pendingFilters.rentalType}
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, rentalType: e.target.value })
              }
            >
              <MenuItem value="">All Rental Types</MenuItem>
              {getUniqueRentalTypes().map((t) => (
                <MenuItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }} size="small">
            <Select
              displayEmpty
              value={pendingFilters.isActive}
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, isActive: e.target.value })
              }
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#2b68bdff" }}
            onClick={handleApplyFilters}
          >
            Filter
          </Button>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          spacing={2}
          mb={2}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Total Venues{" "}
            <Chip
              label={pagination.totalItems}
              color="success"
              size="small"
              sx={{ ml: 1 }}
            />
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search by venue name or address"
              value={pendingFilters.search}
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, search: e.target.value })
              }
              InputProps={{
                endAdornment: <Search fontSize="small" />,
              }}
              sx={{ minWidth: 200 }}
            />
            <Button variant="outlined" onClick={handleExport}>
              Export CSV
            </Button>
            <Button
              variant="contained"
              sx={{ bgcolor: "#2563eb" }}
              onClick={() => navigate("/venue-setup/create")}
            >
              New Venue
            </Button>
          </Stack>
        </Stack>

        {/* Pagination Info */}
        {venues.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{" "}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
            {pagination.totalItems} venues
          </Typography>
        )}

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                <TableCell>Sl</TableCell>
                <TableCell>Venue Info</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Arrangement</TableCell>
                <TableCell>Rental Type</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Bookings</TableCell>
                <TableCell>Facilities</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {venues.map((v, i) => {
                const price = v.rentalType === "hourly" ? `$${v.hourlyPrice}/hr` :
                             v.rentalType === "perDay" ? `$${v.perDayPrice}/day` :
                             v.rentalType === "distanceWise" ? `$${v.distanceWisePrice}/km` : "N/A";
                
                const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
                const slNumber = startIndex + i + 1;

                return (
                  <TableRow key={v._id} hover>
                    <TableCell>{slNumber}</TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#2563eb" }}
                        >
                          {v.venueName}
                        </Typography>
                        {v.searchTags && v.searchTags.length > 0 && (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {v.searchTags.slice(0, 3).map((tag, idx) => (
                              <Chip
                                key={idx}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.65rem" }}
                              />
                            ))}
                            {v.searchTags.length > 3 && (
                              <Chip
                                label={`+${v.searchTags.length - 3}`}
                                size="small"
                                sx={{ fontSize: "0.65rem" }}
                              />
                            )}
                          </Stack>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 150 }}>
                      <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                        {v.venueAddress.length > 50 
                          ? `${v.venueAddress.substring(0, 50)}...` 
                          : v.venueAddress
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {v.provider?.storeName || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={v.seatingArrangement || "N/A"}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={v.rentalType ? v.rentalType.charAt(0).toUpperCase() + v.rentalType.slice(1) : "N/A"}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#059669" }}>
                        {price}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {v.maxGuestsSeated || "N/A"} seats
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="primary">
                        {v.totalBookings || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {v.facilities?.parkingAvailability && (
                          <Chip label="P" size="small" color="success" variant="outlined" sx={{ fontSize: "0.65rem" }} />
                        )}
                        {v.facilities?.foodCateringAvailability && (
                          <Chip label="F" size="small" color="warning" variant="outlined" sx={{ fontSize: "0.65rem" }} />
                        )}
                        {v.facilities?.wifiAvailability && (
                          <Chip label="W" size="small" color="info" variant="outlined" sx={{ fontSize: "0.65rem" }} />
                        )}
                        {v.facilities?.wheelchairAccessibility && (
                          <Chip label="A" size="small" color="primary" variant="outlined" sx={{ fontSize: "0.65rem" }} />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={v.isActive || false}
                        onChange={() => handleToggleStatus(v._id)}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton 
                          size="small" 
                          sx={{ color: "#2563eb" }}
                          onClick={() => handleViewVenue(v._id)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          sx={{ color: "#065f46" }}
                          onClick={() => handleEditVenue(v._id)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: "#dc2626" }}
                          onClick={() => handleDeleteVenue(v._id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {venues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                    <Stack spacing={2} alignItems="center">
                      <Typography variant="h6" color="text.secondary">
                        No venues found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {filters.search && `No venues match "${filters.search}"`}
                        {!filters.search && "Create your first venue to get started"}
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{ bgcolor: "#2563eb" }}
                        onClick={() => navigate("/venue-setup/create")}
                      >
                        Create New Venue
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 3, pt: 2, borderTop: "1px solid #e5e7eb" }}
          >
            <Typography variant="body2" color="text.secondary">
              Page {pagination.currentPage} of {pagination.totalPages}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                Next
              </Button>
            </Stack>
          </Stack>
        )}
      </Paper>

      {/* Toast Notification */}
      <Snackbar
        open={openToast}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toastSeverity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
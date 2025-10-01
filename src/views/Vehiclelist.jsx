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
} from "@mui/material";
import { Visibility, Edit, Delete, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for actual applied filters
  const [filters, setFilters] = useState({
    brand: "",
    category: "",
    type: "",
    search: "",
  });

  // State for dropdowns/search before applying
  const [pendingFilters, setPendingFilters] = useState({
    brand: "",
    category: "",
    type: "",
    search: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:5000/api';

  // Fetch brands
  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please log in.');
      const response = await fetch(`${API_BASE_URL}/brands`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch brands');
      if (data.success) {
        setBrands(data.data.brands || []);
      } else {
        throw new Error(data.message || 'Failed to fetch brands');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please log in.');
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch categories');
      if (data.success) {
        setCategories(data.data.categories || []);
      } else {
        throw new Error(data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please log in.');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      if (filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);

      const response = await fetch(`${API_BASE_URL}/vehicles?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch vehicles');
      if (data.success) {
        setVehicles(data.data.vehicles || []);
        if (data.pagination) {
          setCurrentPage(data.pagination.currentPage);
          setTotalPages(data.pagination.totalPages);
          setTotalItems(data.pagination.totalItems);
          setItemsPerPage(data.pagination.itemsPerPage);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch vehicles');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when filters or pagination change
  useEffect(() => {
    fetchBrands();
    fetchCategories();
    fetchVehicles();
  }, [currentPage, itemsPerPage, filters]);

  // Apply filters when "Filter" button clicked
  const handleApplyFilters = () => {
    setFilters(pendingFilters);
    setCurrentPage(1);
  };

  // Reset filters
  const handleReset = () => {
    setFilters({ brand: "", category: "", type: "", search: "" });
    setPendingFilters({ brand: "", category: "", type: "", search: "" });
    setCurrentPage(1);
  };

  // Export CSV
  const handleExport = () => {
    const headers = [
      "Sl,Name,Code,Category,Brand,Type,Total Trip,Hourly,Distance,Daily,New,Active",
    ];
    const rows = vehicles.map(
      (v, i) =>
        `${i + 1},${v.name},${v.vinNumber || "-"},${v.category?.name || "N/A"},${v.brand?.name || "N/A"},${v.type || "-"},${v.totalTrips || 0},${v.pricing?.hourly || "-"},${v.pricing?.distanceWise || "-"},${v.pricing?.perDay || "-"},${v.isNew ? "Yes" : "No"},${v.isActive ? "Active" : "Inactive"}`
    );
    const csv = headers.concat(rows).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "vehicles.csv";
    link.click();
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1);
  };

  // Handle toggle new tag
  const handleToggleNewTag = async (vehicleId, currentNewTag) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please log in.');
      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isNew: !currentNewTag }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update vehicle');
      if (data.success) {
        setVehicles((prev) =>
          prev.map((v) =>
            v._id === vehicleId ? { ...v, isNew: !currentNewTag } : v
          )
        );
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (vehicleId, currentActive) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please log in.');
      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update vehicle');
      if (data.success) {
        setVehicles((prev) =>
          prev.map((v) =>
            v._id === vehicleId ? { ...v, isActive: !currentActive } : v
          )
        );
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete vehicle
  const handleDelete = async (vehicleId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please log in.');
      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete vehicle');
      if (data.success) {
        setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh", p: 2 }}>
      {/* Navbar */}
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: "#333" }}>
            🚗 CityRide Rentals
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Filters */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <FormControl sx={{ minWidth: 200 }} size="small">
            <Select
              displayEmpty
              value={pendingFilters.brand}
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, brand: e.target.value })
              }
            >
              <MenuItem value="">Select vehicle brand</MenuItem>
              {brands.map((b) => (
                <MenuItem key={b._id} value={b._id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }} size="small">
            <Select
              displayEmpty
              value={pendingFilters.category}
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, category: e.target.value })
              }
            >
              <MenuItem value="">Select vehicle category</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }} size="small">
            <Select
              displayEmpty
              value={pendingFilters.type}
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, type: e.target.value })
              }
            >
              <MenuItem value="">Select vehicle type</MenuItem>
              <MenuItem value="sedan">Sedan</MenuItem>
              <MenuItem value="suv">SUV</MenuItem>
              <MenuItem value="hatchback">Hatchback</MenuItem>
              <MenuItem value="coupe">Coupe</MenuItem>
              <MenuItem value="convertible">Convertible</MenuItem>
              <MenuItem value="truck">Truck</MenuItem>
              <MenuItem value="van">Van</MenuItem>
              <MenuItem value="motorcycle">Motorcycle</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            sx={{ bgcolor: "#f3f4f6", borderRadius: "8px" }}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#2563eb", borderRadius: "8px" }}
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
            Total Vehicles{" "}
            <Chip
              label={totalItems}
              color="success"
              size="small"
              sx={{ ml: 1 }}
            />
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search by vehicle name"
              value={pendingFilters.search}
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, search: e.target.value })
              }
              InputProps={{
                endAdornment: <Search fontSize="small" />,
              }}
            />
            <Button variant="outlined" onClick={handleExport}>
              Export
            </Button>
            <Button
              variant="contained"
              sx={{ bgcolor: "#2563eb" }}
              onClick={() => navigate("/vehicle-setup/create")}
            >
              New Vehicle
            </Button>
          </Stack>
        </Stack>

        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f9fafb" }}>
                <TableRow>
                  <TableCell>Sl</TableCell>
                  <TableCell>Vehicle Info</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Total Trip</TableCell>
                  <TableCell>Trip Fare</TableCell>
                  <TableCell>New Tag</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.map((v, i) => (
                  <TableRow key={v._id}>
                    <TableCell>{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#2563eb" }}
                      >
                        {v.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {v.vinNumber || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>{v.category?.name || "N/A"}</TableCell>
                    <TableCell>{v.brand?.name || "N/A"}</TableCell>
                    <TableCell>{v.totalTrips || 0}</TableCell>
                    <TableCell>
                      {v.pricing?.hourly && (
                        <Typography variant="body2">
                          Hourly: ${v.pricing.hourly}
                        </Typography>
                      )}
                      {v.pricing?.distanceWise && (
                        <Typography variant="body2">
                          Distance Wise: ${v.pricing.distanceWise}
                        </Typography>
                      )}
                      {v.pricing?.perDay && (
                        <Typography variant="body2">
                          Per Day: ${v.pricing.perDay}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={v.isNew || false}
                        onChange={() => handleToggleNewTag(v._id, v.isNew)}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={v.isActive || false}
                        onChange={() => handleToggleActive(v._id, v.isActive)}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          sx={{
                            border: "1px solid #d1d5db",
                            color: "#2563eb",
                            borderRadius: "8px",
                          }}
                          onClick={() => navigate(`/vehicle-setup/view/${v._id}`)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            border: "1px solid #d1d5db",
                            color: "#065f46",
                            borderRadius: "8px",
                          }}
                          onClick={() => navigate(`/vehicle-setup/edit/${v._id}`)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            border: "1px solid #d1d5db",
                            color: "#dc2626",
                            borderRadius: "8px",
                          }}
                          onClick={() => handleDelete(v._id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {vehicles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No vehicles found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControl variant="outlined" size="small">
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Page {currentPage} of {totalPages}
            </Typography>
            <Button
              variant="outlined"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
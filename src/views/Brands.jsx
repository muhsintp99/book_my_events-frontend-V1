import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Tooltip,
  Button,
  useTheme,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const Brandlist = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  
  // Create Brand state
  const [newBrand, setNewBrand] = useState({ name: '', description: '', imageFile: null });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Base API URL - adjust this to match your backend URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Fetch brands from API
  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      if (statusFilter !== 'all') {
        params.append('isActive', statusFilter === 'active' ? 'true' : 'false');
      }

      const response = await fetch(`${API_BASE_URL}/brands?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setBrands(data.data.brands || []);
        
        if (data.pagination) {
          setCurrentPage(data.pagination.currentPage);
          setTotalPages(data.pagination.totalPages);
          setTotalItems(data.pagination.totalItems);
          setItemsPerPage(data.pagination.itemsPerPage);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch brands');
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError(err.message || 'Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  // Fetch featured brands
  const fetchFeaturedBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/brands/featured`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setBrands(data.data.brands || []);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalItems(data.data.brands?.length || 0);
      } else {
        throw new Error(data.message || 'Failed to fetch featured brands');
      }
    } catch (err) {
      console.error('Error fetching featured brands:', err);
      setError(err.message || 'Failed to fetch featured brands');
    } finally {
      setLoading(false);
    }
  };

  // Toggle brand status
  const toggleBrandStatus = async (brandId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/brands/${brandId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setBrands(prevBrands =>
          prevBrands.map(brand =>
            brand._id === brandId
              ? { ...brand, isActive: data.data.brand.isActive }
              : brand
          )
        );
      } else {
        throw new Error(data.message || 'Failed to toggle brand status');
      }
    } catch (err) {
      console.error('Error toggling brand status:', err);
      setError(err.message || 'Failed to toggle brand status');
    }
  };

  // Delete brand
  const deleteBrand = async (brandId) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/brands/${brandId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setBrands(prevBrands => prevBrands.filter(brand => brand._id !== brandId));
      } else {
        throw new Error(data.message || 'Failed to delete brand');
      }
    } catch (err) {
      console.error('Error deleting brand:', err);
      setError(err.message || 'Failed to delete brand');
    }
  };

  // Create brand with image upload
  const createBrand = async () => {
    try {
      setCreateLoading(true);
      setCreateError(null);

      const formData = new FormData();
      formData.append('name', newBrand.name);
      formData.append('description', newBrand.description);
      if (newBrand.imageFile) {
        formData.append('logo', newBrand.imageFile); // Changed from 'image' to 'logo'
      }

      const response = await fetch(`${API_BASE_URL}/brands`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setBrands([data.data.brand, ...brands]);
        setNewBrand({ name: '', description: '', imageFile: null });
        setCurrentPage(1); // Reset to first page to show new brand
      } else {
        throw new Error(data.message || 'Failed to create brand');
      }
    } catch (err) {
      console.error('Error creating brand:', err);
      setCreateError(err.message || 'Failed to create brand');
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    if (!loading) {
      fetchBrands();
    }
  }, [statusFilter]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBrands();
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleExport = () => {
    const csvContent = [
      ['Sr', 'Brand ID', 'Brand Name', 'Status', 'Featured', 'Created At'].join(','),
      ...brands.map((brand, index) => [
        index + 1,
        brand._id,
        `"${brand.name}"`,
        brand.isActive ? 'Active' : 'Inactive',
        brand.isFeatured ? 'Yes' : 'No',
        new Date(brand.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'brands.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: theme.palette.grey[100],
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          maxWidth: 'lg',
          margin: 'auto',
          backgroundColor: 'white',
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[1],
          p: 3,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h5" component="h1">
            Brand List ({totalItems} total)
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              variant="outlined"
              placeholder="Search by brand name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              Search
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={brands.length === 0}
            >
              Export
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchBrands}
              disabled={loading}
            >
              Refresh
            </Button>
            
            <Button
              variant="contained"
              onClick={fetchFeaturedBrands}
              disabled={loading}
            >
              Featured Only
            </Button>
            
            <Tooltip title="Settings">
              <IconButton
                color="primary"
                sx={{
                  backgroundColor: 'white',
                  border: `1px solid ${theme.palette.grey[300]}`,
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Create Brand Section */}
        <Box sx={{ mb: 3, p: 2, border: `1px solid ${theme.palette.grey[300]}`, borderRadius: theme.shape.borderRadius }}>
          <Typography variant="h6" gutterBottom>
            Create Brand
          </Typography>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCreateError(null)}>
              {createError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Brand Name"
              value={newBrand.name}
              onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Description"
              value={newBrand.description}
              onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
              size="small"
              fullWidth
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewBrand({ ...newBrand, imageFile: e.target.files[0] })}
              style={{ marginTop: '8px' }}
            />
            <Button
              variant="contained"
              onClick={createBrand}
              disabled={createLoading || !newBrand.name.trim() || !newBrand.imageFile}
              sx={{ height: '40px' }}
            >
              {createLoading ? <CircularProgress size={24} /> : 'Create'}
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Brand Table */}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sr</TableCell>
                  <TableCell>Brand ID</TableCell>
                  <TableCell>Brand Image</TableCell>
                  <TableCell>Brand Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Featured</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {brands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No brands found
                    </TableCell>
                  </TableRow>
                ) : (
                  brands.map((brand, index) => (
                    <TableRow key={brand._id}>
                      <TableCell>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell>{brand._id}</TableCell>
                      <TableCell>
                        <img
                          src={brand.image}
                          alt={brand.name}
                          style={{
                            width: 100,
                            height: 50,
                            objectFit: 'contain',
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {brand.name}
                          </Typography>
                          {brand.description && (
                            <Typography variant="caption" color="textSecondary">
                              {brand.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={brand.isActive ? 'Active' : 'Inactive'}
                          color={brand.isActive ? 'success' : 'default'}
                          size="small"
                          onClick={() => toggleBrandStatus(brand._id)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={brand.isFeatured ? 'Yes' : 'No'}
                          color={brand.isFeatured ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(brand.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => deleteBrand(brand._id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 3,
                }}
              >
                <FormControl size="small">
                  <InputLabel>Items per page</InputLabel>
                  <Select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    label="Items per page"
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </FormControl>

                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Brandlist;
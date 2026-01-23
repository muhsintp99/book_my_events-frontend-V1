
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
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { API_BASE_URL, getApiImageUrl, API_ORIGIN } from '../utils/apiImageUtils';

const Brandlist = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [modules, setModules] = useState([]);

  // Create/Edit Brand state
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandForm, setBrandForm] = useState({
    title: '',
    module: '',
    icon: null,
  });
  const [formLoading, setFormLoading] = useState(false);

  // API_BASE_URL is now imported from apiImageUtils

  // Get auth token
  const getAuthToken = () => localStorage.getItem('token') || '';

  // Get user ID - MUST be a valid MongoDB ObjectId
  // Replace this with your actual auth logic that returns a valid ObjectId
  const getUserId = () => {
    const userId = localStorage.getItem('userId');
    // If no userId in localStorage, you should handle this properly
    // For now, we'll just return null and let the backend handle it
    return userId || null;
  };

  // Fetch modules for dropdown
  const fetchModules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/modules`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setModules(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
    }
  };

  // Fetch brands from API
  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/brands`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch brands: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setBrands(data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch brands by module
  const fetchBrandsByModule = async (moduleId) => {
    if (!moduleId || moduleId === 'all') {
      fetchBrands();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/brands/module/${moduleId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch brands by module: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setBrands(data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching brands by module:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create brand
  const createBrand = async () => {
    try {
      setFormLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', brandForm.title);
      formData.append('module', brandForm.module);

      // Only append createdBy if we have a valid userId
      const userId = getUserId();
      if (userId) {
        formData.append('createdBy', userId);
      }

      if (brandForm.icon) {
        formData.append('icon', brandForm.icon);
      }

      const response = await fetch(`${API_BASE_URL}/brands`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create brand');
      }

      const data = await response.json();

      setSuccess(data.message || 'Brand created successfully');
      setBrands([data.brand, ...brands]);
      handleCloseDialog();
      setCurrentPage(1);
    } catch (err) {
      console.error('Error creating brand:', err);
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Update brand
  const updateBrand = async () => {
    try {
      setFormLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', brandForm.title);
      formData.append('module', brandForm.module);

      // Only append updatedBy if we have a valid userId
      const userId = getUserId();
      if (userId) {
        formData.append('updatedBy', userId);
      }

      if (brandForm.icon) {
        formData.append('icon', brandForm.icon);
      }

      const response = await fetch(`${API_BASE_URL}/brands/${selectedBrand._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update brand');
      }

      const data = await response.json();

      setSuccess(data.message || 'Brand updated successfully');
      setBrands(brands.map(b => b._id === selectedBrand._id ? data.brand : b));
      handleCloseDialog();
    } catch (err) {
      console.error('Error updating brand:', err);
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle brand status
  const toggleBrandStatus = async (brand) => {
    try {
      const endpoint = brand.isActive ? 'block' : 'reactivate';

      const userId = getUserId();
      const body = userId ? { updatedBy: userId } : {};

      const response = await fetch(`${API_BASE_URL}/brands/${brand._id}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle brand status');
      }

      const data = await response.json();

      setSuccess(data.message);
      setBrands(brands.map(b => b._id === brand._id ? data.brand : b));
    } catch (err) {
      console.error('Error toggling brand status:', err);
      setError(err.message);
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
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete brand');
      }

      const data = await response.json();

      setSuccess(data.message || 'Brand deleted successfully');
      setBrands(brands.filter(b => b._id !== brandId));

      // Adjust pagination if needed
      const newFilteredCount = brands.filter(b => b._id !== brandId).length;
      const newTotalPages = Math.ceil(newFilteredCount / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error('Error deleting brand:', err);
      setError(err.message);
    }
  };

  // Dialog handlers
  const handleOpenDialog = (brand = null) => {
    if (brand) {
      setEditMode(true);
      setSelectedBrand(brand);
      setBrandForm({
        title: brand.title,
        module: brand.module?._id || brand.module || '',
        icon: null,
      });
    } else {
      setEditMode(false);
      setSelectedBrand(null);
      setBrandForm({
        title: '',
        module: '',
        icon: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedBrand(null);
    setBrandForm({
      title: '',
      module: '',
      icon: null,
    });
  };

  const handleSubmit = () => {
    if (editMode) {
      updateBrand();
    } else {
      createBrand();
    }
  };

  // Filter brands
  const getFilteredBrands = () => {
    let filtered = [...brands];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(brand =>
        brand.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.brandId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(brand =>
        statusFilter === 'active' ? brand.isActive : !brand.isActive
      );
    }

    // Module filter
    if (moduleFilter !== 'all') {
      filtered = filtered.filter(brand =>
        (brand.module?._id || brand.module) === moduleFilter
      );
    }

    return filtered;
  };

  // Pagination
  const getPaginatedBrands = () => {
    const filtered = getFilteredBrands();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filtered = getFilteredBrands();
    return Math.ceil(filtered.length / itemsPerPage);
  };

  // Export to CSV
  const handleExport = () => {
    const filtered = getFilteredBrands();
    const csvContent = [
      ['Sr', 'Brand ID', 'Brand Title', 'Module', 'Status', 'Created At'].join(','),
      ...filtered.map((brand, index) => [
        index + 1,
        brand.brandId,
        `"${brand.title}"`,
        `"${brand.module?.title || brand.module?.name || 'N/A'}"`,
        brand.isActive ? 'Active' : 'Inactive',
        new Date(brand.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `brands_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Effects
  useEffect(() => {
    fetchBrands();
    fetchModules();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (moduleFilter !== 'all') {
      fetchBrandsByModule(moduleFilter);
    } else {
      fetchBrands();
    }
  }, [moduleFilter]);

  const paginatedBrands = getPaginatedBrands();
  const totalPages = getTotalPages();
  const filteredCount = getFilteredBrands().length;

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 'lg', margin: 'auto', backgroundColor: 'white', borderRadius: 2, boxShadow: 1, p: 3 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Brand List ({filteredCount} {filteredCount === 1 ? 'brand' : 'brands'})
          </Typography>

          <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
            + Create Brand
          </Button>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            variant="outlined"
            placeholder="Search by title or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Module</InputLabel>
            <Select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} label="Module">
              <MenuItem value="all">All Modules</MenuItem>
              {modules.map((module) => (
                <MenuItem key={module._id} value={module._id}>
                  {module.title || module.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} disabled={brands.length === 0}>
            Export
          </Button>

          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => { setModuleFilter('all'); fetchBrands(); }} disabled={loading}>
            Refresh
          </Button>
        </Box>

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
                  <TableCell>Icon</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBrands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No brands found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBrands.map((brand, index) => (
                    <TableRow key={brand._id}>
                      <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell>{brand.brandId}</TableCell>
                      <TableCell>
                        {brand.icon && (
                          <img
                            src={getApiImageUrl(brand.icon)}
                            alt={brand.title}
                            style={{ width: 80, height: 40, objectFit: 'contain' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{brand.title}</TableCell>
                      <TableCell>{brand.module?.title || brand.module?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={brand.isActive ? 'Active' : 'Inactive'}
                          color={brand.isActive ? 'success' : 'default'}
                          size="small"
                          onClick={() => toggleBrandStatus(brand)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell>{new Date(brand.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => handleOpenDialog(brand)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => deleteBrand(brand._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                <FormControl size="small">
                  <InputLabel>Rows</InputLabel>
                  <Select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(e.target.value); setCurrentPage(1); }}
                    label="Rows"
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </FormControl>

                <Pagination count={totalPages} page={currentPage} onChange={(e, page) => setCurrentPage(page)} color="primary" />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Brand' : 'Create Brand'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Brand Title"
              value={brandForm.title}
              onChange={(e) => setBrandForm({ ...brandForm, title: e.target.value })}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Module</InputLabel>
              <Select
                value={brandForm.module}
                onChange={(e) => setBrandForm({ ...brandForm, module: e.target.value })}
                label="Module"
              >
                {modules.map((module) => (
                  <MenuItem key={module._id} value={module._id}>
                    {module.title || module.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Brand Icon (PNG/JPEG, max 2MB)
              </Typography>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => setBrandForm({ ...brandForm, icon: e.target.files[0] })}
              />
              {editMode && selectedBrand?.icon && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption">Current Icon:</Typography>
                  <img
                    src={getApiImageUrl(selectedBrand.icon)}
                    alt="Current"
                    style={{ width: 100, height: 50, objectFit: 'contain', display: 'block', marginTop: 8 }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={formLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={formLoading || !brandForm.title.trim() || !brandForm.module}
          >
            {formLoading ? <CircularProgress size={24} /> : editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Brandlist;

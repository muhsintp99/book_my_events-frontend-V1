import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  IconButton,
  InputAdornment,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  Close as CloseIcon,
  TableView as ExcelIcon,
  Description as CsvIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CategoryManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    displayOrder: 0,
    isActive: true,
    isFeatured: false,
    metaTitle: '',
    metaDescription: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Notification states
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    categoryId: null,
    categoryName: ''
  });

  // Export menu state
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const exportMenuOpen = Boolean(exportMenuAnchor);

  const navigate = useNavigate();

  // Language tabs configuration
  const languageTabs = [
    { key: 'default', label: 'Default' },
    { key: 'english', label: 'English(EN)' },
    { key: 'arabic', label: 'Arabic - العربية(AR)' }
  ];

  // Auth helper functions (same as your coupons component)
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

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  // Handle form data change
  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch categories with proper authentication
// Replace your fetchCategories function with this corrected version:

const fetchCategories = useCallback(async () => {
  const token = getAuthToken();
  if (!token) {
    setError("You are not authenticated. Please log in.");
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);
  
  try {
    const url = `${API_BASE_URL}/categories?page=${pagination.currentPage}&limit=${pagination.itemsPerPage}&search=${searchTerm}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    if (response.status === 401) {
      setError("Session expired. Please log in again.");
      return;
    }

    if (response.status === 403) {
      setError("Access denied. You don't have permission to view categories.");
      return;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract categories from the response
    const categories = data.data?.categories || data.categories || [];
    
    // Process categories for display
    const baseURL = API_BASE_URL.replace('/api', ''); // http://localhost:5000
    
    const formattedCategories = categories.map(cat => ({
      id: cat._id,
      names: {
        default: cat.name || '',
        english: cat.name || '',
        arabic: cat.name || ''
      },
      status: cat.isActive !== undefined ? cat.isActive : true,
      image: cat.image ? `${baseURL}/${cat.image}` : ''
    }));
    
    setCategories(formattedCategories);
    
    // Handle pagination
    if (data.pagination) {
      setPagination({
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
        totalItems: data.pagination.totalItems,
        itemsPerPage: data.pagination.itemsPerPage
      });
    }
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    setError(error.message);
    showNotification('Failed to fetch categories', 'error');
  } finally {
    setLoading(false);
  }
}, [searchTerm, pagination.currentPage, pagination.itemsPerPage]);


  // Check role and fetch categories on component mount
  useEffect(() => {
    const role = getUserRole();
    const token = getAuthToken();
    console.log("Initial check - Token:", token ? "Exists" : "Missing", "Role:", role);

    if (!token) {
      console.log("No token found - showing error but staying on page");
      setError("You are not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    // Allow admin, manager, and superadmin roles
    if (!['admin', 'manager', 'superadmin'].includes(role)) {
      console.log("Insufficient permissions - showing error but staying on page");
      setError("Access denied. Admin, Manager, or Superadmin role required.");
      setLoading(false);
      return;
    }

    console.log("Proceeding to fetch categories - role check passed");
    fetchCategories();
  }, []);

  // Re-fetch when pagination or search changes
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchCategories();
    }
  }, [fetchCategories]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification('File size should be less than 5MB', 'error');
        return;
      }

      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle add category
  const handleAdd = async () => {
    const token = getAuthToken();
    if (!token) {
      setError("You are not authenticated. Please log in.");
      return;
    }

    if (!formData.name.trim()) {
      showNotification('Please enter a category name in Default language', 'error');
      return;
    }
    if (!uploadedImage) {
      showNotification('Please upload an image', 'error');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      if (formData.description.trim()) {
        formDataToSend.append('description', formData.description.trim());
      }
      if (formData.parentCategory.trim()) {
        formDataToSend.append('parentCategory', formData.parentCategory.trim());
      }
      formDataToSend.append('displayOrder', formData.displayOrder);
      formDataToSend.append('isActive', formData.isActive);
      formDataToSend.append('isFeatured', formData.isFeatured);
      if (formData.metaTitle.trim()) {
        formDataToSend.append('metaTitle', formData.metaTitle.trim());
      }
      if (formData.metaDescription.trim()) {
        formDataToSend.append('metaDescription', formData.metaDescription.trim());
      }
      formDataToSend.append('categoryImage', uploadedImage);

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
      });

      // Handle authentication errors
      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { message: text || 'Unknown error' };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      showNotification(`Category "${data.data.category.name}" added successfully!`, 'success');
      handleReset();
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      showNotification(`Failed to add category: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      parentCategory: '',
      displayOrder: 0,
      isActive: true,
      isFeatured: false,
      metaTitle: '',
      metaDescription: ''
    });
    setUploadedImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById('image-upload-input');
    if (fileInput) fileInput.value = '';
  };

  // Handle edit
  const handleEdit = (id) => {
    navigate(`/categories/edit/${id}`);
  };

  // Handle delete confirmation
  const handleDeleteClick = (id) => {
    const category = categories.find(c => c.id === id);
    setDeleteDialog({
      open: true,
      categoryId: id,
      categoryName: category?.names?.default || ''
    });
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    const token = getAuthToken();
    if (!token) {
      setError("You are not authenticated. Please log in.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${deleteDialog.categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      // Handle authentication errors
      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { message: text || 'Unknown error' };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      showNotification(`Category "${deleteDialog.categoryName}" deleted successfully!`, 'success');
      setDeleteDialog({ open: false, categoryId: null, categoryName: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showNotification(`Failed to delete category: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (id) => {
    const token = getAuthToken();
    if (!token) {
      setError("You are not authenticated. Please log in.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      // Handle authentication errors
      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { message: text || 'Unknown error' };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newStatus = data.data.category.isActive;
      showNotification(
        `Category "${data.data.category.name}" ${newStatus ? 'activated' : 'deactivated'}`,
        'info'
      );
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      showNotification(`Failed to update category status: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Navigation helpers
  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleDashboardRedirect = () => {
    navigate("/dashboard");
  };

  const handleRetry = () => {
    fetchCategories();
  };

  // Get current selected language key
  const getCurrentLanguageKey = () => languageTabs[tabValue].key;

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => {
    const currentLang = getCurrentLanguageKey();
    return category.names[currentLang].toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Export menu handlers
  const handleExportMenuOpen = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  // CSV Export function
  const exportToCSV = () => {
    const currentLang = getCurrentLanguageKey();
    const currentLangLabel = languageTabs[tabValue].label;
    
    const headers = ['SI', 'ID', `Name (${currentLangLabel})`, 'Status'];
    
    const csvData = filteredCategories.map((category, index) => [
      index + 1 + (pagination.currentPage - 1) * pagination.itemsPerPage,
      category.id,
      category.names[currentLang],
      category.status ? 'Active' : 'Inactive'
    ]);

    let csvContent = headers.join(',') + '\n';
    csvData.forEach(row => {
      csvContent += row.map(field => `"${field}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `categories_${currentLang}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    handleExportMenuClose();
    showNotification('CSV file downloaded successfully!', 'success');
  };

  // Excel Export function
  const exportToExcel = () => {
    const currentLang = getCurrentLanguageKey();
    const currentLangLabel = languageTabs[tabValue].label;
    
    const headers = ['SI', 'ID', `Name (${currentLangLabel})`, 'Status'];
    
    const excelData = filteredCategories.map((category, index) => [
      index + 1 + (pagination.currentPage - 1) * pagination.itemsPerPage,
      category.id,
      category.names[currentLang],
      category.status ? 'Active' : 'Inactive'
    ]);

    let excelContent = headers.join('\t') + '\n';
    excelData.forEach(row => {
      excelContent += row.join('\t') + '\n';
    });

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `categories_${currentLang}_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    handleExportMenuClose();
    showNotification('Excel file downloaded successfully!', 'success');
  };

  // Show loading state during initial fetch
  if (loading && categories.length === 0) {
    return (
      <Box p={2} display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Loading categories...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#f5f5f5', p: { xs: 2, sm: 3 } }}>
      
      {/* Error/Success Messages with manual redirect buttons */}
      <Snackbar
        open={!!error}
        autoHideDuration={null}
        onClose={() => setError(null)}
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

      {/* Add Category Form */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Card sx={{ width: '100%', maxWidth: '1400px', boxShadow: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            
            {/* Tabs */}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: 4,
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTabs-indicator': { backgroundColor: '#2196f3' }
              }}
            >
              {languageTabs.map((tab, index) => (
                <Tab key={tab.key} label={tab.label} />
              ))}
            </Tabs>

            {/* Dynamic Name Input */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Name ({languageTabs[tabValue].label}) <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={languageTabs[tabValue].key === 'default' ? formData.name : ''}
              onChange={(e) => languageTabs[tabValue].key === 'default' && handleFormDataChange('name', e.target.value)}
              placeholder={`Enter category name in ${languageTabs[tabValue].label}`}
              variant="outlined"
              disabled={languageTabs[tabValue].key !== 'default'}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  direction: languageTabs[tabValue].key === 'arabic' ? 'rtl' : 'ltr'
                }
              }}
            />

            {/* Upload Image */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Image <span style={{ color: '#f44336' }}>*</span>{' '}
              <span style={{ color: '#e91e63', fontSize: '0.875rem' }}>( Ratio 3:2)</span>
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box>
                <input
                  id="image-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload-input">
                  <Button
                    component="span"
                    variant="outlined"
                    sx={{
                      width: { xs: '100%', sm: 240 },
                      height: { xs: 100, sm: 140 },
                      border: '2px dashed #e0e0e0',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      color: 'text.secondary',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#2196f3',
                        backgroundColor: '#e3f2fd',
                        border: '2px dashed #2196f3'
                      }
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 40, color: '#bdbdbd' }} />
                    <Typography variant="body2" color="text.secondary">
                      {uploadedImage ? 'Change Image' : 'Upload Image'}
                    </Typography>
                  </Button>
                </label>
              </Box>

              {imagePreview && (
                <Box sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      width: { xs: '100%', sm: 240 },
                      height: { xs: 160, sm: 140 },
                      border: '2px solid #e0e0e0',
                      borderRadius: 2,
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        setImagePreview(null);
                        setUploadedImage(null);
                        const fileInput = document.getElementById('image-upload-input');
                        if (fileInput) fileInput.value = '';
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {uploadedImage?.name}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{
                  px: 4, py: 1.5, textTransform: 'none',
                  borderColor: '#e0e0e0', color: '#666',
                  '&:hover': { borderColor: '#bdbdbd', backgroundColor: '#f5f5f5' }
                }}
                disabled={loading}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleAdd}
                disabled={!formData.name.trim() || !uploadedImage || loading}
                sx={{
                  px: 4, py: 1.5,
                  backgroundColor: '#00695c', textTransform: 'none',
                  '&:hover': { backgroundColor: '#004d40' },
                  '&:disabled': { backgroundColor: '#e0e0e0', color: '#999' }
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Add'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Category List */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ width: '100%', maxWidth: '1400px', boxShadow: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={600}>Category List</Typography>
                <Chip 
                  label={filteredCategories.length} 
                  size="small" 
                  sx={{ backgroundColor: '#e3f2fd', color: '#2196f3', fontWeight: 600 }} 
                />
                <Chip 
                  label={`Language: ${languageTabs[tabValue].label}`}
                  size="small" 
                  sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32', fontWeight: 500 }} 
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder={`Search categories in ${languageTabs[tabValue].label}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    minWidth: { xs: '100%', sm: 250, md: 300 },
                    '& .MuiOutlinedInput-root': {
                      direction: languageTabs[tabValue].key === 'arabic' ? 'rtl' : 'ltr'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#bdbdbd' }} />
                      </InputAdornment>
                    )
                  }}
                  disabled={loading}
                />
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  endIcon={<ExpandMoreIcon />}
                  onClick={handleExportMenuOpen}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#e0e0e0',
                    color: '#2196f3',
                    '&:hover': { borderColor: '#2196f3', backgroundColor: '#e3f2fd' }
                  }}
                  disabled={loading || filteredCategories.length === 0}
                >
                  Export
                </Button>
                
                {/* Export Menu */}
                <Menu
                  anchorEl={exportMenuAnchor}
                  open={exportMenuOpen}
                  onClose={handleExportMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  sx={{
                    '& .MuiPaper-root': {
                      minWidth: 180,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      borderRadius: 2,
                      mt: 1
                    }
                  }}
                >
                  <MenuItem onClick={exportToExcel} sx={{ py: 1.5, px: 2 }}>
                    <ListItemIcon>
                      <ExcelIcon sx={{ color: '#1976d2' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Export to Excel"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={exportToCSV} sx={{ py: 1.5, px: 2 }}>
                    <ListItemIcon>
                      <CsvIcon sx={{ color: '#2e7d32' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Export to CSV"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </MenuItem>
                </Menu>
              </Box>
            </Box>

            {/* Loading indicator for search/pagination */}
            {loading && categories.length > 0 && (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            )}

            {/* Table */}
           <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
  <Table size="small">
    <TableHead sx={{ backgroundColor: '#fafafa' }}>
      <TableRow>
        <TableCell sx={{ fontWeight: 600, color: '#666' }}>SI</TableCell>
        <TableCell sx={{ fontWeight: 600, color: '#666' }}>Image</TableCell>
        <TableCell
          sx={{
            fontWeight: 600,
            color: '#666',
            direction: languageTabs[tabValue].key === 'arabic' ? 'rtl' : 'ltr'
          }}
        >
          Name ({languageTabs[tabValue].label})
        </TableCell>
        <TableCell sx={{ fontWeight: 600, color: '#666' }}>Status</TableCell>
        <TableCell sx={{ fontWeight: 600, color: '#666' }}>Action</TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {filteredCategories.length > 0 ? (
        filteredCategories.map((category, index) => {
          const currentLang = getCurrentLanguageKey();
          return (
            <TableRow
              key={category.id}
              sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
            >
              {/* SI Column */}
              <TableCell>
                {index + 1 + (pagination.currentPage - 1) * pagination.itemsPerPage}
              </TableCell>

              {/* Image Column */}
              <TableCell>
                {category.image ? (
                  <Box
                    sx={{
                      width: 50,
                      height: 35,
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <img
                      src={category.image}
                      alt={category.names[currentLang]}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 50,
                      height: 35,
                      borderRadius: 1,
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      No Image
                    </Typography>
                  </Box>
                )}
              </TableCell>

              {/* Name Column */}
              <TableCell
                sx={{
                  fontWeight: 500,
                  maxWidth: 200,
                  direction: languageTabs[tabValue].key === 'arabic' ? 'rtl' : 'ltr'
                }}
              >
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {category.names[currentLang]}
                </Typography>
              </TableCell>

              {/* Status Column */}
              <TableCell>
                <Switch
                  checked={category.status}
                  onChange={() => handleStatusToggle(category.id)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#2196f3' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#2196f3'
                    }
                  }}
                  disabled={loading}
                />
              </TableCell>

              {/* Action Column */}
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(category.id)}
                    sx={{ color: '#2196f3' }}
                    disabled={loading}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(category.id)}
                    sx={{ color: '#f44336' }}
                    disabled={loading}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          );
        })
      ) : (
        <TableRow>
          <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#999' }}>
            <Stack spacing={2} alignItems="center">
              <Typography variant="h6" color="textSecondary">
                {loading
                  ? 'Loading categories...'
                  : searchTerm
                  ? `No categories found matching your search in ${languageTabs[tabValue].label}.`
                  : 'No categories available.'}
              </Typography>
              {error ? (
                <Button variant="outlined" onClick={handleRetry}>
                  Try Again
                </Button>
              ) : (
                !loading &&
                !searchTerm && (
                  <Typography variant="body2" color="textSecondary">
                    Create your first category using the form above
                  </Typography>
                )
              )}
            </Stack>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" p={2}>
                <Button
                  variant="outlined"
                  disabled={pagination.currentPage === 1 || loading}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                >
                  Previous
                </Button>
                <Typography variant="body2">
                  Page {pagination.currentPage} of {pagination.totalPages}
                  {pagination.totalItems ? ` (${pagination.totalItems} total)` : ""}
                </Typography>
                <Button
                  variant="outlined"
                  disabled={pagination.currentPage === pagination.totalPages || loading}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                >
                  Next
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, categoryId: null, categoryName: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the category "{deleteDialog.categoryName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, categoryId: null, categoryName: '' })}
            variant="outlined"
            sx={{ textTransform: 'none' }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  ExpandMore as ExpandMoreIcon,
  TableView as ExcelIcon,
  Description as CsvIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CategoryManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [modulesError, setModulesError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    module: '',
    displayOrder: 0,
    isActive: true,
    isFeatured: false,
    metaTitle: '',
    metaDescription: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    categoryId: null,
    categoryName: ''
  });
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const exportMenuOpen = Boolean(exportMenuAnchor);
  const navigate = useNavigate();

  const languageTabs = [
    { key: 'default', label: 'Default' },
    { key: 'english', label: 'English(EN)' },
    { key: 'arabic', label: 'Arabic - العربية(AR)' }
  ];

  const getAuthToken = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('Retrieved token:', token ? 'Token exists' : 'No token found');
    return token;
  };

  const getUserRole = () => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!user) {
      console.log('No user data found in storage');
      return null;
    }
    try {
      const parsedUser = JSON.parse(user);
      console.log('User role:', parsedUser.role);
      return parsedUser.role;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  };

  const getUserId = () => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!user) return null;
    try {
      return JSON.parse(user)._id;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  };

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const fetchModules = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setModulesError('You are not authenticated. Please log in.');
      setModulesLoading(false);
      return;
    }

    setModulesLoading(true);
    setModulesError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/modules`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      if (response.status === 401) {
        setModulesError('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}: ${text}`);
      }

      const data = await response.json();
      console.log('Fetched modules:', data);

      let modulesList = [];
      if (Array.isArray(data)) {
        modulesList = data;
      } else if (Array.isArray(data.modules)) {
        modulesList = data.modules;
      } else if (data.data && Array.isArray(data.data.modules)) {
        modulesList = data.data.modules;
      } else if (data.data && Array.isArray(data.data)) {
        modulesList = data.data;
      }

      setModules(modulesList);

      const auditoriumModule = modulesList.find(m => m.title?.toLowerCase().includes('auditorium') || m.name?.toLowerCase().includes('auditorium'));
      if (!formData.module && modulesList.length > 0) {
        setFormData(prev => ({ ...prev, module: auditoriumModule ? auditoriumModule._id : modulesList[0]._id }));
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      setModulesError(error.message);
      showNotification('Failed to fetch modules', 'error');
    } finally {
      setModulesLoading(false);
    }
  }, [navigate]);

  const fetchCategories = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setError('You are not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}/categories?page=${pagination.currentPage}&limit=${pagination.itemsPerPage}&search=${encodeURIComponent(searchTerm)}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      if (response.status === 401) {
        setError('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      if (response.status === 403) {
        setError("Access denied. You don't have permission to view categories.");
        navigate('/dashboard');
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}: ${text}`);
      }

      const data = await response.json();
      console.log('Fetched categories:', data);

      let categoriesList = [];
      if (Array.isArray(data)) {
        categoriesList = data;
      } else if (Array.isArray(data.categories)) {
        categoriesList = data.categories;
      } else if (data.data && Array.isArray(data.data.categories)) {
        categoriesList = data.data.categories;
      } else if (data.data && Array.isArray(data.data)) {
        categoriesList = data.data;
      }

      const formattedCategories = categoriesList.map((cat) => ({
        id: cat._id,
        names: {
          default: cat.name || cat.title || '',
          english: cat.name || cat.title || '',
          arabic: cat.name || cat.title || ''
        },
        status: cat.isActive !== undefined ? cat.isActive : true,
        module: cat.module || null
      }));

      setCategories(formattedCategories);

      const pag = data.pagination || (data.data && data.data.pagination) || {
        currentPage: pagination.currentPage,
        totalPages: Math.ceil(categoriesList.length / pagination.itemsPerPage),
        totalItems: categoriesList.length,
        itemsPerPage: pagination.itemsPerPage
      };
      setPagination({
        currentPage: pag.currentPage,
        totalPages: pag.totalPages,
        totalItems: pag.totalItems,
        itemsPerPage: pag.itemsPerPage
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message);
      showNotification(`Failed to fetch categories: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, pagination.currentPage, pagination.itemsPerPage, navigate]);

  useEffect(() => {
    const role = getUserRole();
    const token = getAuthToken();
    console.log('Initial check - Token:', token ? 'Exists' : 'Missing', 'Role:', role);

    if (!token) {
      console.log('No token found - showing error but staying on page');
      setError('You are not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    if (!['admin', 'manager', 'superadmin'].includes(role)) {
      console.log('Insufficient permissions - showing error but staying on page');
      setError('Access denied. Admin, Manager, or Superadmin role required.');
      setLoading(false);
      navigate('/dashboard');
      return;
    }

    fetchModules();
    fetchCategories();
  }, [fetchModules, fetchCategories, navigate]);

  const handleFormDataChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdd = async () => {
    const token = getAuthToken();
    if (!token) {
      setError('You are not authenticated. Please log in.');
      navigate('/login');
      return;
    }

    if (!formData.name.trim()) {
      showNotification('Please enter a category title in Default language', 'error');
      return;
    }
    if (!formData.module || !/^[0-9a-fA-F]{24}$/.test(formData.module)) {
      showNotification('Please select a valid module', 'error');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.name.trim());
      formDataToSend.append('module', formData.module);
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
      formDataToSend.append('createdBy', getUserId());

      console.log('Sending FormData with module:', formData.module);

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        let errorMessage = 'Failed to add category';
        const status = response.status;

        try {
          const text = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(text);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = text || errorMessage;
          }

          if (status === 401) {
            setError('Session expired. Please log in again.');
            navigate('/login');
            return;
          }
          if (status === 403) {
            setError("Access denied. You don't have permission to create categories.");
            navigate('/dashboard');
            return;
          }
          if (status === 502) {
            errorMessage = 'Server error: Unable to connect to the backend service. Please try again later.';
          }
          if (errorData?.error && errorData.error.includes('title is required')) {
            showNotification('A title is required for the category.', 'error');
            return;
          }
          if (errorData?.error && errorData.error.includes('Module')) {
            showNotification(errorData.error, 'error');
            return;
          }
        } catch (parseError) {
          errorMessage = 'Failed to parse server response. Please try again.';
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      const addedCategory = data.data?.category || data.category;
      showNotification(`Category "${addedCategory.title || addedCategory.name}" added successfully!`, 'success');
      handleReset();
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      let errorMessage = error.message || 'Failed to add category due to a network or server error. Please try again.';
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to reach the server. Please check your connection or try again later.';
      }
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData((prev) => ({
      ...prev,
      name: '',
      description: '',
      parentCategory: '',
      displayOrder: 0,
      isActive: true,
      isFeatured: false,
      metaTitle: '',
      metaDescription: ''
    }));
  };

  const handleEdit = (id) => {
    navigate(`/categories/edit/${id}`);
  };

  const handleDeleteClick = (id) => {
    const category = categories.find((c) => c.id === id);
    setDeleteDialog({
      open: true,
      categoryId: id,
      categoryName: category?.names?.default || ''
    });
  };

  const handleDeleteConfirm = async () => {
    const token = getAuthToken();
    if (!token) {
      setError('You are not authenticated. Please log in.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${deleteDialog.categoryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { error: text || 'Unknown error' };
        }
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        if (response.status === 403) {
          setError("Access denied. You don't have permission to delete categories.");
          navigate('/dashboard');
          return;
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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

  const handleStatusToggle = async (id) => {
    const token = getAuthToken();
    if (!token) {
      setError('You are not authenticated. Please log in.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { error: text || 'Unknown error' };
        }
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        if (response.status === 403) {
          setError("Access denied. You don't have permission to update category status.");
          navigate('/dashboard');
          return;
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const updatedCategory = data.data?.category || data.category;
      const newStatus = updatedCategory.isActive;
      showNotification(`Category "${updatedCategory.name}" ${newStatus ? 'activated' : 'deactivated'}`, 'info');
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      showNotification(`Failed to update category status: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleDashboardRedirect = () => {
    navigate('/dashboard');
  };

  const handleRetry = () => {
    fetchModules();
    fetchCategories();
  };

  const getCurrentLanguageKey = () => languageTabs[tabValue].key;

  const filteredCategories = categories.filter((category) => {
    const currentLang = getCurrentLanguageKey();
    return category.names[currentLang].toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleExportMenuOpen = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const exportToCSV = () => {
    const currentLang = getCurrentLanguageKey();
    const currentLangLabel = languageTabs[tabValue].label;

    const headers = ['SI', 'ID', `Name (${currentLangLabel})`, 'Module', 'Status'];

    const csvData = filteredCategories.map((category, index) => [
      index + 1 + (pagination.currentPage - 1) * pagination.itemsPerPage,
      category.id,
      category.names[currentLang],
      category.module ? category.module.title || 'N/A' : 'None',
      category.status ? 'Active' : 'Inactive'
    ]);

    let csvContent = headers.join(',') + '\n';
    csvData.forEach((row) => {
      csvContent += row.map((field) => `"${field}"`).join(',') + '\n';
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

  const exportToExcel = () => {
    const currentLang = getCurrentLanguageKey();
    const currentLangLabel = languageTabs[tabValue].label;

    const headers = ['SI', 'ID', `Name (${currentLangLabel})`, 'Module', 'Status'];

    const excelData = filteredCategories.map((category, index) => [
      index + 1 + (pagination.currentPage - 1) * pagination.itemsPerPage,
      category.id,
      category.names[currentLang],
      category.module ? category.module.title || 'N/A' : 'None',
      category.status ? 'Active' : 'Inactive'
    ]);

    let excelContent = headers.join('\t') + '\n';
    excelData.forEach((row) => {
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

  if (loading && categories.length === 0 && modulesLoading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Loading categories and modules...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#f5f5f5', p: { xs: 2, sm: 3 } }}>
      <Snackbar open={!!error || !!modulesError} autoHideDuration={null} onClose={() => { setError(null); setModulesError(null); }}>
        <Alert
          severity="error"
          onClose={() => { setError(null); setModulesError(null); }}
          action={
            <Stack direction="row" spacing={1}>
              {(error || modulesError) && (error?.includes('not authenticated') || modulesError?.includes('not authenticated')) && (
                <Button color="inherit" size="small" onClick={handleLoginRedirect}>
                  Go to Login
                </Button>
              )}
              {(error || modulesError) && (error?.includes('Access denied') || modulesError?.includes('Access denied')) && (
                <Button color="inherit" size="small" onClick={handleDashboardRedirect}>
                  Go to Dashboard
                </Button>
              )}
              {(error || modulesError) && !(error?.includes('not authenticated') || modulesError?.includes('not authenticated')) && !(error?.includes('Access denied') || modulesError?.includes('Access denied')) && (
                <Button color="inherit" size="small" onClick={handleRetry}>
                  Retry
                </Button>
              )}
            </Stack>
          }
        >
          {error || modulesError}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Card sx={{ width: '100%', maxWidth: '1400px', boxShadow: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
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
              {languageTabs.map((tab) => (
                <Tab key={tab.key} label={tab.label} />
              ))}
            </Tabs>

            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Title ({languageTabs[tabValue].label}) <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={languageTabs[tabValue].key === 'default' ? formData.name : ''}
              onChange={(e) => languageTabs[tabValue].key === 'default' && handleFormDataChange('name', e.target.value)}
              placeholder={`Enter category title in ${languageTabs[tabValue].label}`}
              variant="outlined"
              disabled={languageTabs[tabValue].key !== 'default'}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  direction: languageTabs[tabValue].key === 'arabic' ? 'rtl' : 'ltr'
                }
              }}
            />

            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Module <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={
                modulesLoading
                  ? 'Loading modules...'
                  : modulesError
                  ? 'Error loading modules'
                  : modules.length === 0
                  ? 'No modules available'
                  : modules.find((m) => m._id === formData.module)?.title || 'Module not found'
              }
              placeholder="Module"
              variant="outlined"
              disabled
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  borderColor: '#e0e0e0',
                  color: '#666',
                  '&:hover': { borderColor: '#bdbdbd', backgroundColor: '#f5f5f5' }
                }}
                disabled={loading || modulesLoading}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleAdd}
                disabled={!formData.name.trim() || !formData.module || !/^[0-9a-fA-F]{24}$/.test(formData.module) || loading || modulesLoading || modulesError || modules.length === 0}
                sx={{
                  px: 4,
                  py: 1.5,
                  backgroundColor: '#00695c',
                  textTransform: 'none',
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

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ width: '100%', maxWidth: '1400px', boxShadow: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  Category List
                </Typography>
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

                <Menu
                  anchorEl={exportMenuAnchor}
                  open={exportMenuOpen}
                  onClose={handleExportMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
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
                    <ListItemText primary="Export to Excel" primaryTypographyProps={{ fontWeight: 500 }} />
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={exportToCSV} sx={{ py: 1.5, px: 2 }}>
                    <ListItemIcon>
                      <CsvIcon sx={{ color: '#2e7d32' }} />
                    </ListItemIcon>
                    <ListItemText primary="Export to CSV" primaryTypographyProps={{ fontWeight: 500 }} />
                  </MenuItem>
                </Menu>
              </Box>
            </Box>

            {loading && categories.length > 0 && (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            )}

            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#fafafa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>SI</TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#666',
                        direction: languageTabs[tabValue].key === 'arabic' ? 'rtl' : 'ltr'
                      }}
                    >
                      Name ({languageTabs[tabValue].label})
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Module</TableCell>
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
                          <TableCell>
                            {index + 1 + (pagination.currentPage - 1) * pagination.itemsPerPage}
                          </TableCell>
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
                          <TableCell>
                            <Typography variant="body2">
                              {category.module ? category.module.title || 'N/A' : 'None'}
                            </Typography>
                          </TableCell>
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
                          {error || modulesError ? (
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

            {pagination.totalPages > 1 && (
              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" p={2}>
                <Button
                  variant="outlined"
                  disabled={pagination.currentPage === 1 || loading}
                  onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                >
                  Previous
                </Button>
                <Typography variant="body2">
                  Page {pagination.currentPage} of {pagination.totalPages}
                  {pagination.totalItems ? ` (${pagination.totalItems} total)` : ''}
                </Typography>
                <Button
                  variant="outlined"
                  disabled={pagination.currentPage === pagination.totalPages || loading}
                  onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                >
                  Next
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, categoryId: null, categoryName: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete the category "{deleteDialog.categoryName}"? This action cannot be undone.</Typography>
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
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ textTransform: 'none' }} disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleNotificationClose} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
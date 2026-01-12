import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Stack,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  ExpandMore as ExpandMoreIcon,
  TableView as ExcelIcon,
  Description as CsvIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.bookmyevent.ae/api';

export default function CategoryManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [modulesError, setModulesError] = useState(null);
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('all');

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

  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Edit Dialog State
  const [editDialog, setEditDialog] = useState({
    open: false,
    categoryId: null,
    loading: false
  });
  const [editFormData, setEditFormData] = useState({
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
  const [editUploadedImage, setEditUploadedImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const languageTabs = [
    { key: 'default', label: 'Default' },
    { key: 'english', label: 'English(EN)' },
    { key: 'arabic', label: 'Arabic - العربية(AR)' }
  ];

  const getAuthToken = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token;
  };

  const getUserRole = () => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!user) return null;
    try {
      const parsedUser = JSON.parse(user);
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

      // ──────────────────────────────────────────────────────
      // PRIORITY: 1. Makeup → 2. Path-based → 3. First module
      // ──────────────────────────────────────────────────────
      const currentPath = window.location.pathname;
      let defaultModuleId = '';

      // 1. Find Makeup module
      const makeupModule = modulesList.find(m =>
        (m.title || m.name || '').toLowerCase().includes('makeup')
      );

      // 2. Path-based override (only if not Makeup)
      if (!makeupModule) {
        if (currentPath.includes('/catering')) {
          const catering = modulesList.find(m =>
            (m.title || m.name || '').toLowerCase().includes('catering')
          );
          defaultModuleId = catering?._id || '';
        } else if (currentPath.includes('/auditorium')) {
          const auditorium = modulesList.find(m =>
            (m.title || m.name || '').toLowerCase().includes('auditorium')
          );
          defaultModuleId = auditorium?._id || '';
        }
      }

      // 3. Final default: Makeup > Path > First
      if (makeupModule) {
        defaultModuleId = makeupModule._id;
      } else if (!defaultModuleId && modulesList.length > 0) {
        defaultModuleId = modulesList[0]._id;
      }

      if (defaultModuleId) {
        setFormData(prev => ({ ...prev, module: defaultModuleId }));
        setSelectedModuleFilter(defaultModuleId);
      } else {
        setModulesError('No modules available. Please create a module first.');
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
      const url = `${API_BASE_URL}/categories?limit=1000&search=${encodeURIComponent(searchTerm)}`;

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

      const formattedCategories = categoriesList.map((cat) => {
        let imageUrl = '';
        if (cat.image) {
          if (cat.image.startsWith('http://') || cat.image.startsWith('https://')) {
            imageUrl = cat.image;
          } else if (cat.image.startsWith('/uploads') || cat.image.startsWith('uploads')) {
            const cleanPath = cat.image.startsWith('/') ? cat.image : `/${cat.image}`;
            imageUrl = `https://api.bookmyevent.ae${cleanPath}`;
          } else {
            imageUrl = `https://api.bookmyevent.ae/${cat.image}`;
          }
        }

        return {
          id: cat._id,
          names: {
            default: cat.title || cat.name || '',
            english: cat.title || cat.name || '',
            arabic: cat.title || cat.name || ''
          },
          status: cat.isActive !== undefined ? cat.isActive : true,
          image: imageUrl,
          module: cat.module || null
        };
      });

      setCategories(formattedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message);
      showNotification(`Failed to fetch categories: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, navigate]);

  useEffect(() => {
    const role = getUserRole();
    const token = getAuthToken();

    if (!token) {
      setError('You are not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    if (!['admin', 'manager', 'superadmin'].includes(role)) {
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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file (JPEG, PNG, GIF, WebP, SVG)', 'error');
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
      formDataToSend.append('image', uploadedImage);

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
      let errorMessage = error.message || 'Failed to add category due to a network or server error.';
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to reach the server. Please check your connection.';
      }
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const makeupModule = modules.find(m =>
      (m.title || m.name || '').toLowerCase().includes('makeup')
    );
    const defaultModuleId = makeupModule?._id || (modules.length > 0 ? modules[0]._id : '');

    setFormData((prev) => ({
      ...prev,
      name: '',
      description: '',
      parentCategory: '',
      module: defaultModuleId,
      displayOrder: 0,
      isActive: true,
      isFeatured: false,
      metaTitle: '',
      metaDescription: ''
    }));
    setUploadedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ------------------- EDIT CATEGORY LOGIC -------------------
  const handleEditClick = async (id) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    setEditDialog(prev => ({ ...prev, open: true, loading: true, categoryId: id }));

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch category details');

      const result = await response.json();
      const cat = result.data || result;

      setEditFormData({
        name: cat.title || '',
        description: cat.description || '',
        parentCategory: cat.parentCategory?._id || cat.parentCategory || '',
        module: cat.module?._id || cat.module || '',
        displayOrder: cat.displayOrder || 0,
        isActive: cat.isActive !== undefined ? cat.isActive : true,
        isFeatured: cat.isFeatured !== undefined ? cat.isFeatured : false,
        metaTitle: cat.metaTitle || '',
        metaDescription: cat.metaDescription || ''
      });

      // Handle Image Preview
      if (cat.image) {
        let imageUrl = '';
        if (cat.image.startsWith('http')) {
          imageUrl = cat.image;
        } else {
          const cleanPath = cat.image.startsWith('/') ? cat.image : `/${cat.image}`;
          imageUrl = `https://api.bookmyevent.ae${cleanPath}`;
        }
        setExistingImageUrl(imageUrl);
        setEditImagePreview(imageUrl);
      } else {
        setExistingImageUrl(null);
        setEditImagePreview(null);
      }

    } catch (err) {
      console.error('Fetch category error:', err);
      showNotification(`Failed to load category: ${err.message}`, 'error');
      setEditDialog(prev => ({ ...prev, open: false }));
    } finally {
      setEditDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleEditDialogClose = () => {
    setEditDialog({ open: false, categoryId: null, loading: false });
    setEditFormData({
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
    setEditUploadedImage(null);
    setEditImagePreview(null);
    setExistingImageUrl(null);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'module') {
        newData.parentCategory = '';
      }
      return newData;
    });
  };

  const handleEditImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      return;
    }
    setEditUploadedImage(file);
    const reader = new FileReader();
    reader.onload = e => setEditImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleEditSubmit = async () => {
    const token = getAuthToken();
    if (!token) return;

    if (!editFormData.name.trim()) {
      showNotification('Please enter a category title', 'error');
      return;
    }

    setEditDialog(prev => ({ ...prev, loading: true }));
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', editFormData.name.trim());
      formDataToSend.append('module', editFormData.module);
      formDataToSend.append('description', editFormData.description);
      formDataToSend.append('parentCategory', editFormData.parentCategory || '');
      formDataToSend.append('displayOrder', editFormData.displayOrder);
      formDataToSend.append('isActive', editFormData.isActive);
      formDataToSend.append('isFeatured', editFormData.isFeatured);
      formDataToSend.append('metaTitle', editFormData.metaTitle);
      formDataToSend.append('metaDescription', editFormData.metaDescription);
      formDataToSend.append('updatedBy', getUserId());

      if (editUploadedImage) {
        formDataToSend.append('image', editUploadedImage);
      }

      const response = await fetch(`${API_BASE_URL}/categories/${editDialog.categoryId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }

      showNotification('Category updated successfully!', 'success');
      handleEditDialogClose();
      fetchCategories();
    } catch (err) {
      console.error('Update error:', err);
      showNotification(err.message, 'error');
    } finally {
      setEditDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleEdit = (id) => handleEditClick(id);

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

    const category = categories.find((c) => c.id === id);
    if (!category) {
      showNotification('Category not found', 'error');
      return;
    }

    const isActive = category.status;
    const endpoint = isActive ? `/categories/${id}/block` : `/categories/${id}/reactivate`;
    const action = isActive ? 'blocked' : 'reactivated';

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          updatedBy: getUserId()
        })
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
          setError(`Access denied. You don't have permission to ${action} categories.`);
          navigate('/dashboard');
          return;
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const updatedCategory = data.data?.category || data.category;
      showNotification(`Category "${updatedCategory.title || updatedCategory.name}" ${action} successfully`, 'info');
      fetchCategories();
    } catch (error) {
      console.error(`Error ${action} category:`, error);
      showNotification(`Failed to ${action} category: ${error.message}`, 'error');
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
    const matchesSearch = category.names[currentLang].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModuleFilter === 'all' || category.module?._id === selectedModuleFilter;
    return matchesSearch && matchesModule;
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
      index + 1,
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
      index + 1,
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

      {/* Add Form */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Card sx={{ width: '100%', maxWidth: '1400px', boxShadow: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto"
              sx={{ mb: 4, borderBottom: 1, borderColor: 'divider', '& .MuiTabs-indicator': { backgroundColor: '#2196f3' } }}>
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
              select
              fullWidth
              value={formData.module}
              onChange={(e) => handleFormDataChange('module', e.target.value)}
              placeholder="Select a module"
              variant="outlined"
              disabled={modulesLoading || modulesError || modules.length === 0}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: modulesLoading || modulesError || modules.length === 0 ? '#f5f5f5' : 'white'
                }
              }}
            >
              {modulesLoading ? (
                <MenuItem value="">Loading modules...</MenuItem>
              ) : modulesError ? (
                <MenuItem value="">Error loading modules</MenuItem>
              ) : modules.length === 0 ? (
                <MenuItem value="">No modules available</MenuItem>
              ) : (
                modules.map((module) => (
                  <MenuItem key={module._id} value={module._id}>
                    {module.title || module.name || 'Unnamed Module'}
                  </MenuItem>
                ))
              )}
            </TextField>

            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Image <span style={{ color: '#f44336' }}>*</span> <span style={{ color: '#e91e63', fontSize: '0.875rem' }}>(Ratio 3:2)</span>
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box>
                <input
                  id="image-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
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
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
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
                disabled={!formData.name.trim() || !formData.module || !/^[0-9a-fA-F]{24}$/.test(formData.module) || !uploadedImage || loading || modulesLoading || modulesError || modules.length === 0}
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

      {/* Category List */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ width: '100%', maxWidth: '1400px', boxShadow: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  Category List
                </Typography>
                <Chip label={filteredCategories.length} size="small" sx={{ backgroundColor: '#e3f2fd', color: '#2196f3', fontWeight: 600 }} />
                <Chip label={`Language: ${languageTabs[tabValue].label}`} size="small" sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32', fontWeight: 500 }} />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                  select
                  size="small"
                  value={selectedModuleFilter}
                  onChange={(e) => setSelectedModuleFilter(e.target.value)}
                  sx={{ minWidth: { xs: '100%', sm: 200 } }}
                  disabled={loading || modulesLoading}
                >
                  <MenuItem value="all">All Modules</MenuItem>
                  {modules.map((module) => (
                    <MenuItem key={module._id} value={module._id}>
                      {module.title || module.name || 'Unnamed Module'}
                    </MenuItem>
                  ))}
                </TextField>
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
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
                    <ListItemIcon><ExcelIcon sx={{ color: '#1976d2' }} /></ListItemIcon>
                    <ListItemText primary="Export to Excel" primaryTypographyProps={{ fontWeight: 500 }} />
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={exportToCSV} sx={{ py: 1.5, px: 2 }}>
                    <ListItemIcon><CsvIcon sx={{ color: '#2e7d32' }} /></ListItemIcon>
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
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Image</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666', direction: languageTabs[tabValue].key === 'arabic' ? 'rtl' : 'ltr' }}>
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
                        <TableRow key={category.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            {category.image ? (
                              <Box sx={{ width: 50, height: 35, borderRadius: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                                <img
                                  src={category.image}
                                  alt={category.names[currentLang]}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f5f5;font-size:10px;color:#999;">Error</div>';
                                  }}
                                />
                              </Box>
                            ) : (
                              <Box sx={{ width: 50, height: 35, borderRadius: 1, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0e0e0' }}>
                                <Typography variant="caption" color="text.secondary">No Image</Typography>
                              </Box>
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500, maxWidth: 200, direction: languageTabs[tabValue].key === 'arabic' ? 'rtl' : 'ltr' }}>
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
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#2196f3' }
                              }}
                              disabled={loading}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton size="small" onClick={() => handleEdit(category.id)} sx={{ color: '#2196f3' }} disabled={loading}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteClick(category.id)} sx={{ color: '#f44336' }} disabled={loading}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#999' }}>
                        <Stack spacing={2} alignItems="center">
                          <Typography variant="h6" color="textSecondary">
                            {loading
                              ? 'Loading categories...'
                              : searchTerm
                                ? `No categories found matching your search in ${languageTabs[tabValue].label}.`
                                : 'No categories available.'}
                          </Typography>
                          {error || modulesError ? (
                            <Button variant="outlined" onClick={handleRetry}>Try Again</Button>
                          ) : (
                            !loading && !searchTerm && (
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
          </CardContent>
        </Card>
      </Box>

      {/* EDIT DIALOG */}
      <Dialog
        open={editDialog.open}
        onClose={handleEditDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }
        }}
        TransitionProps={{ timeout: 400 }}
      >
        <DialogTitle sx={{
          m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #eee', bgcolor: '#fafafa'
        }}>
          <Typography variant="h6" fontWeight={700} color="primary">Edit Category</Typography>
          <IconButton onClick={handleEditDialogClose} sx={{ color: '#999', '&:hover': { color: '#f44336' } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {editDialog.loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
              <CircularProgress size={48} thickness={4} />
              <Typography variant="body1" color="textSecondary" fontWeight={500}>Fetching category details...</Typography>
            </Box>
          ) : (
            <Stack spacing={4} sx={{ mt: 1 }}>
              {/* SECTION: BASIC INFO */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#666', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="span" sx={{ width: 4, height: 16, bgcolor: 'primary.main', borderRadius: 1 }} />
                  Basic Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom fontWeight={500}>Category Title *</Typography>
                    <TextField
                      fullWidth
                      value={editFormData.name}
                      onChange={(e) => handleEditFormChange('name', e.target.value)}
                      placeholder="e.g. Premium Venues"
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom fontWeight={500}>Description</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={editFormData.description}
                      onChange={(e) => handleEditFormChange('description', e.target.value)}
                      placeholder="Provide a brief description of this category..."
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* SECTION: HIERARCHY & ASSOCIATIONS */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#666', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="span" sx={{ width: 4, height: 16, bgcolor: 'primary.main', borderRadius: 1 }} />
                  Associations
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" gutterBottom fontWeight={500}>Module *</Typography>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={editFormData.module}
                      onChange={(e) => handleEditFormChange('module', e.target.value)}
                    >
                      {modules.map(m => (
                        <MenuItem key={m._id} value={m._id}>{m.title || m.name}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" gutterBottom fontWeight={500}>Parent Category</Typography>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={editFormData.parentCategory}
                      onChange={(e) => handleEditFormChange('parentCategory', e.target.value)}
                    >
                      <MenuItem value=""><em>None (Root Category)</em></MenuItem>
                      {categories
                        .filter(c => !c.parentCategory && c.module?._id === editFormData.module && c.id !== editDialog.categoryId)
                        .map(cat => (
                          <MenuItem key={cat.id} value={cat.id}>{cat.names.default}</MenuItem>
                        ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Box>

              {/* SECTION: VISUALS */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#666', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="span" sx={{ width: 4, height: 16, bgcolor: 'primary.main', borderRadius: 1 }} />
                  Media & Visuals
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 180, height: 120, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden',
                      backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    {editImagePreview ? (
                      <img src={editImagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Typography variant="caption" color="textSecondary">No Image Selected</Typography>
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <input
                      type="file"
                      id="edit-img-input"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleEditImageUpload}
                      ref={editFileInputRef}
                    />
                    <label htmlFor="edit-img-input">
                      <Button
                        component="span"
                        variant="soft"
                        size="medium"
                        startIcon={<CloudUploadIcon />}
                        sx={{
                          textTransform: 'none',
                          bgcolor: '#e3f2fd',
                          color: '#1976d2',
                          '&:hover': { bgcolor: '#bbdefb' }
                        }}
                      >
                        {editImagePreview ? 'Replace Image' : 'Upload Image'}
                      </Button>
                    </label>
                    <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1.5, lineHeight: 1.6 }}>
                      Recommended: <strong>600x400px</strong> (3:2 ratio).<br />
                      Max file size: 5MB. Supports JPG, PNG, WebP.
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderStyle: 'dashed' }} />

              {/* SECTION: ADVANCED / SEO */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#666', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="span" sx={{ width: 4, height: 16, bgcolor: 'primary.main', borderRadius: 1 }} />
                  Settings & SEO
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" gutterBottom fontWeight={500}>Display Order</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      value={editFormData.displayOrder}
                      onChange={(e) => handleEditFormChange('displayOrder', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8} sx={{ display: 'flex', gap: 6, alignItems: 'center', height: '100%', pt: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={500}>Active Status</Typography>
                      <Switch
                        checked={editFormData.isActive}
                        onChange={(e) => handleEditFormChange('isActive', e.target.checked)}
                        size="medium"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={500}>Featured</Typography>
                      <Switch
                        checked={editFormData.isFeatured}
                        onChange={(e) => handleEditFormChange('isFeatured', e.target.checked)}
                        color="secondary"
                        size="medium"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" gutterBottom fontWeight={500}>Meta Title (SEO)</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={editFormData.metaTitle}
                      onChange={(e) => handleEditFormChange('metaTitle', e.target.value)}
                      placeholder="Title for search engines"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" gutterBottom fontWeight={500}>Meta Description (SEO)</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={editFormData.metaDescription}
                      onChange={(e) => handleEditFormChange('metaDescription', e.target.value)}
                      placeholder="Short summary for search results"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #eee', bgcolor: '#fafafa' }}>
          <Button
            onClick={handleEditDialogClose}
            variant="outlined"
            sx={{ textTransform: 'none', px: 4, borderRadius: 2, borderColor: '#ddd', color: '#666' }}
            disabled={editDialog.loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
            sx={{
              textTransform: 'none', px: 5, borderRadius: 2,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
              fontWeight: 600
            }}
            disabled={editDialog.loading || !editFormData.name.trim()}
          >
            {editDialog.loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, categoryId: null, categoryName: '' })} maxWidth="sm" fullWidth>
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

      {/* Notification Snackbar */}
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={handleNotificationClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleNotificationClose} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box >
  );
}
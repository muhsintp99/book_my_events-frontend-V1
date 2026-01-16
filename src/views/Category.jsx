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
  Grid,
  Avatar,
  Tooltip,
  Collapse,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
  Close as CloseIcon,
  Folder as FolderIcon,
  SubdirectoryArrowRight as SubIcon,
  Image as ImageIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  Tag as TagIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.bookmyevent.ae/api';

// ---- STATIC TRANSPORT MODULE (fallback) ----
const TRANSPORT_ID = 'static_transport_123456789012345678901234';
const STATIC_TRANSPORT = { _id: TRANSPORT_ID, title: 'Transport', name: 'Transport' };

export default function CategoryManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [modulesError, setModulesError] = useState(null);
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    module: TRANSPORT_ID,
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
      return JSON.parse(user).role;
    } catch {
      return null;
    }
  };

  const getUserId = () => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!user) return null;
    try {
      return JSON.parse(user)._id;
    } catch {
      return null;
    }
  };

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  // ------------------- FETCH MODULES -------------------
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
      if (Array.isArray(data)) modulesList = data;
      else if (Array.isArray(data.modules)) modulesList = data.modules;
      else if (data.data && Array.isArray(data.data.modules)) modulesList = data.data.modules;
      else if (data.data && Array.isArray(data.data)) modulesList = data.data;

      const realTransport = modulesList.find(m =>
        (m.title || m.name || '').toLowerCase().includes('transport')
      );

      const finalModules = realTransport
        ? modulesList
        : [STATIC_TRANSPORT, ...modulesList];

      setModules(finalModules);

      const selected = realTransport || STATIC_TRANSPORT;
      setFormData(prev => ({ ...prev, module: selected._id }));
      setSelectedModuleFilter(selected._id);

    } catch (err) {
      console.error('fetchModules error:', err);
      setModulesError(err.message);
      showNotification('Failed to fetch modules – using static Transport', 'warning');
      setModules([STATIC_TRANSPORT]);
      setFormData(prev => ({ ...prev, module: TRANSPORT_ID }));
      setSelectedModuleFilter(TRANSPORT_ID);
    } finally {
      setModulesLoading(false);
    }
  }, [navigate]);

  // ------------------- FETCH CATEGORIES -------------------
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
      const url = `${API_BASE_URL}/categories?search=${encodeURIComponent(searchTerm)}`;

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
      if (Array.isArray(data)) categoriesList = data;
      else if (Array.isArray(data.categories)) categoriesList = data.categories;
      else if (data.data && Array.isArray(data.data.categories)) categoriesList = data.data.categories;
      else if (data.data && Array.isArray(data.data)) categoriesList = data.data;

      const formattedCategories = categoriesList.map(cat => {
  let imageUrl = '';

  if (cat.image) {
    const cleanPath = cat.image.startsWith('/')
      ? cat.image
      : `/${cat.image}`;
    imageUrl = `https://api.bookmyevent.ae${cleanPath}`;
  }

  return {
    id: cat._id,
    names: {
      default: cat.title || '',
      english: cat.title || '',
      arabic: cat.title || ''
    },
    status: cat.isActive !== undefined ? cat.isActive : true,
    image: imageUrl,
    module: cat.module || null,

    // ✅ FIX HERE
    parentCategory: cat.parentCategory?._id || cat.parentCategory || null,

    raw: cat,
    description: cat.description || '',
    displayOrder: cat.displayOrder || 0,
    isFeatured: cat.isFeatured || false,
    subcategories: []
  };
});


      // Organize categories hierarchically
      const rootCategories = formattedCategories.filter(cat => !cat.parentCategory);
      const subcategories = formattedCategories.filter(cat => cat.parentCategory);
      
      // Add subcategories to their parents
      rootCategories.forEach(parent => {
        parent.subcategories = subcategories.filter(sub => sub.parentCategory === parent.id);
      });

      setCategories(formattedCategories);
    } catch (err) {
      console.error('fetchCategories error:', err);
      setError(err.message);
      showNotification(`Failed to fetch categories: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, navigate]);

  // ------------------- INITIAL LOAD -------------------
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

  // ------------------- FORM HANDLERS -------------------
  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

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
    reader.onload = e => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setFormData((prev) => ({
      ...prev,
      name: '',
      description: '',
      parentCategory: '',
      module: prev.module || (modules.length > 0 ? modules[0]._id : ''),
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

  // ------------------- ADD CATEGORY -------------------
  const handleAdd = async () => {
    const token = getAuthToken();
    if (!token) {
      setError('You are not authenticated. Please log in.');
      navigate('/login');
      return;
    }

    if (!formData.name.trim()) {
      showNotification('Please enter a category title in Default', 'error');
      return;
    }
    if (!formData.module || !/^[0-9a-fA-F]{24}$/.test(formData.module)) {
      showNotification('Please select a valid module', 'error');
      return;
    }
    if (!uploadedImage) {
      showNotification('Please upload an image', 'error');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.name.trim());
      formDataToSend.append('module', formData.module);
      if (formData.description.trim()) formDataToSend.append('description', formData.description.trim());
      if (formData.parentCategory) formDataToSend.append('parentCategory', formData.parentCategory);
      formDataToSend.append('displayOrder', formData.displayOrder);
      formDataToSend.append('isActive', formData.isActive);
      formDataToSend.append('isFeatured', formData.isFeatured);
      if (formData.metaTitle.trim()) formDataToSend.append('metaTitle', formData.metaTitle.trim());
      if (formData.metaDescription.trim()) formDataToSend.append('metaDescription', formData.metaDescription.trim());
      formDataToSend.append('createdBy', getUserId());
      formDataToSend.append('image', uploadedImage);

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend
      });

      if (!response.ok) {
        let errorMessage = 'Failed to add category';
        const status = response.status;
        try {
          const text = await response.text();
          let errorData;
          try { errorData = JSON.parse(text); errorMessage = errorData.error || errorMessage; }
          catch { errorMessage = text || errorMessage; }

          if (status === 401) { setError('Session expired. Please log in again.'); navigate('/login'); return; }
          if (status === 403) { setError("Access denied. You don't have permission to create categories."); navigate('/dashboard'); return; }
          if (status === 502) errorMessage = 'Server error: Unable to connect to the backend service. Please try again later.';
        } catch { errorMessage = 'Failed to parse server response. Please try again.'; }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const added = data.data?.category || data.category || data;
      showNotification(`Category "${added.title || added.name}" added successfully!`, 'success');
      handleReset();
      fetchCategories();
    } catch (err) {
      console.error('Add error:', err);
      const errorMessage = err.message.includes('Failed to fetch')
        ? 'Network error: Unable to reach the server. Please check your connection.'
        : err.message || 'Failed to add category';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ------------------- EDIT / DELETE / STATUS -------------------
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
    const cat = categories.find(c => c.id === id);
    setDeleteDialog({
      open: true,
      categoryId: id,
      categoryName: cat?.names?.default || ''
    });
  };

  const handleDeleteConfirm = async () => {
    const token = getAuthToken();
    if (!token) { navigate('/login'); return; }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${deleteDialog.categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const txt = await response.text();
        let err = { error: txt };
        try { err = JSON.parse(txt); } catch { }
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      showNotification(`Category "${deleteDialog.categoryName}" deleted!`, 'success');
      setDeleteDialog({ open: false, categoryId: null, categoryName: '' });
      fetchCategories();
    } catch (err) {
      showNotification(`Delete failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id) => {
    const token = getAuthToken();
    if (!token) { navigate('/login'); return; }

    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    const endpoint = cat.status ? `/categories/${id}/block` : `/categories/${id}/reactivate`;
    const action = cat.status ? 'blocked' : 'reactivated';

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ updatedBy: getUserId() })
      });

      if (!response.ok) {
        const txt = await response.text();
        let err = { error: txt };
        try { err = JSON.parse(txt); } catch { }
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      showNotification(`Category "${cat.names.default}" ${action}`, 'info');
      fetchCategories();
    } catch (err) {
      showNotification(`Status change failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ------------------- NOTIFICATIONS & REDIRECTS -------------------
  const showNotification = (msg, sev = 'success') => {
    setNotification({ open: true, message: msg, severity: sev });
  };
  const handleNotificationClose = () => setNotification(prev => ({ ...prev, open: false }));

  const handleLoginRedirect = () => navigate('/login');
  const handleDashboardRedirect = () => navigate('/dashboard');
  const handleRetry = () => { fetchModules(); fetchCategories(); };

  const getCurrentLanguageKey = () => languageTabs[tabValue].key;


  const getSelectedModuleName = () => {
  if (selectedModuleFilter === 'all') return 'All';
  const module = modules.find(m => m._id === selectedModuleFilter);
  return module?.title || module?.name || 'Categories';
};

  // ------------------- CATEGORY HIERARCHY FUNCTIONS -------------------
  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getRootCategories = () => {
    return categories.filter(cat => !cat.parentCategory);
  };

  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parentCategory === parentId);
  };

  const filteredCategories = categories.filter(cat => {
    const lang = getCurrentLanguageKey();
    const matchesSearch = cat.names[lang].toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedModuleFilter === 'all') return matchesSearch;

    const belongsToModule =
      cat.module?._id === selectedModuleFilter ||
      (cat.parentCategory &&
        categories.find(p => p.id === cat.parentCategory)?.module?._id === selectedModuleFilter);

    return matchesSearch && belongsToModule;
  });

  // ------------------- EXPORT -------------------
  const handleExportMenuOpen = (e) => setExportMenuAnchor(e.currentTarget);
  const handleExportMenuClose = () => setExportMenuAnchor(null);

  const exportToCSV = () => {
    const lang = getCurrentLanguageKey();
    const headers = ['SI', 'ID', `Name (${lang})`, 'Module', 'Parent', 'Status'];
    const rows = filteredCategories.map((c, i) => {
      const parentName = c.parentCategory
        ? categories.find(p => p.id === c.parentCategory)?.names.default || '—'
        : '—';
      return [
        i + 1,
        c.id,
        c.names[lang],
        c.module?.title || (c.parentCategory ? '—' : 'N/A'),
        parentName,
        c.status ? 'Active' : 'Inactive'
      ];
    });

    let csv = headers.join(',') + '\n' + rows.map(r => r.map(f => `"${f}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories_${lang}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    handleExportMenuClose();
    showNotification('CSV downloaded', 'success');
  };

  const exportToExcel = () => {
    const lang = getCurrentLanguageKey();
    const headers = ['SI', 'ID', `Name (${lang})`, 'Module', 'Parent', 'Status'];
    const rows = filteredCategories.map((c, i) => {
      const parentName = c.parentCategory
        ? categories.find(p => p.id === c.parentCategory)?.names.default || '—'
        : '—';
      return [
        i + 1,
        c.id,
        c.names[lang],
        c.module?.title || (c.parentCategory ? '—' : 'N/A'),
        parentName,
        c.status ? 'Active' : 'Inactive'
      ];
    });

    let txt = headers.join('\t') + '\n' + rows.map(r => r.join('\t')).join('\n');
    const blob = new Blob([txt], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories_${lang}_${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    handleExportMenuClose();
    showNotification('Excel downloaded', 'success');
  };

  // ------------------- RENDER -------------------
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

      {/* ERROR SNACKBAR */}
      <Snackbar open={!!error || !!modulesError} autoHideDuration={null}
        onClose={() => { setError(null); setModulesError(null); }}>
        <Alert severity="error" onClose={() => { setError(null); setModulesError(null); }}
          action={
            <Stack direction="row" spacing={1}>
              {(error?.includes('not authenticated') || modulesError?.includes('not authenticated')) && (
                <Button color="inherit" size="small" onClick={handleLoginRedirect}>Login</Button>
              )}
              {(error?.includes('Access denied') || modulesError?.includes('Access denied')) && (
                <Button color="inherit" size="small" onClick={handleDashboardRedirect}>Dashboard</Button>
              )}
              {!(error?.includes('not authenticated') || error?.includes('Access denied')) &&
                !(modulesError?.includes('not authenticated') || modulesError?.includes('Access denied')) && (
                  <Button color="inherit" size="small" onClick={handleRetry}>Retry</Button>
                )}
            </Stack>
          }>
          {error || modulesError}
        </Alert>
      </Snackbar>

      {/* ADD FORM */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Card sx={{ width: '100%', maxWidth: '1400px', boxShadow: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>

            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Title ({languageTabs[tabValue].label}) <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={languageTabs[tabValue].key === 'default' ? formData.name : ''}
              onChange={e => languageTabs[tabValue].key === 'default' && handleFormDataChange('name', e.target.value)}
              placeholder={`Enter title in ${languageTabs[tabValue].label}`}
              variant="outlined"
              disabled={languageTabs[tabValue].key !== 'default'}
              sx={{ mb: 4, '& .MuiOutlinedInput-root': { direction: languageTabs[tabValue].key === 'arabic' ? 'rtl' : 'ltr' } }}
            />

            {/* PARENT CATEGORY */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Parent Category
            </Typography>
            <TextField
              select
              fullWidth
              value={formData.parentCategory}
              onChange={e => handleFormDataChange('parentCategory', e.target.value)}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) return <em>None</em>;
                  const cat = categories.find(c => c.id === selected);
                  return cat?.names.default || selected;
                }
              }}
              variant="outlined"
              sx={{ mb: 4 }}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {categories
                .filter(c => !c.parentCategory && c.module?._id === formData.module)
                .map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.names.default}</MenuItem>
                ))}
            </TextField>

            {/* MODULE SELECT */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Module <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              select fullWidth
              value={formData.module}
              onChange={e => {
                const newModule = e.target.value;
                handleFormDataChange('module', newModule);
                handleFormDataChange('parentCategory', '');
              }}
              variant="outlined"
              disabled={modulesLoading || !!modulesError}
              sx={{ mb: 4 }}
            >
              {modulesLoading && <MenuItem value="">Loading...</MenuItem>}
              {modulesError && <MenuItem value="">Error loading</MenuItem>}
              {modules.length === 0 && !modulesLoading && <MenuItem value="">No modules</MenuItem>}
              {modules.map(m => (
                <MenuItem key={m._id} value={m._id}>
                  {m.title || m.name || 'Unnamed'}
                </MenuItem>
              ))}
            </TextField>

            {/* IMAGE UPLOAD */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Image <span style={{ color: '#f44336' }}>*</span>{' '}
              <span style={{ color: '#e91e63', fontSize: '0.875rem' }}>(Ratio 3:2)</span>
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box>
                <input
                  id="img-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <label htmlFor="img-input">
                  <Button component="span" variant="outlined"
                    sx={{
                      width: { xs: '100%', sm: 240 }, height: { xs: 100, sm: 140 },
                      border: '2px dashed #e0e0e0', borderRadius: 2,
                      display: 'flex', flexDirection: 'column', gap: 1,
                      color: 'text.secondary', textTransform: 'none',
                      '&:hover': { borderColor: '#2196f3', backgroundColor: '#e3f2fd', border: '2px dashed #2196f3' }
                    }}>
                    <CloudUploadIcon sx={{ fontSize: 40, color: '#bdbdbd' }} />
                    <Typography variant="body2" color="text.secondary">
                      {uploadedImage ? 'Change Image' : 'Upload Image'}
                    </Typography>
                  </Button>
                </label>
              </Box>

              {imagePreview && (
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{
                    width: { xs: '100%', sm: 240 }, height: { xs: 160, sm: 140 },
                    border: '2px solid #e0e0e0', borderRadius: 2, overflow: 'hidden'
                  }}>
                    <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <IconButton size="small" onClick={() => {
                      setImagePreview(null);
                      setUploadedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }} sx={{
                      position: 'absolute', top: 8, right: 8,
                      backgroundColor: 'rgba(0,0,0,0.5)', color: 'white',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                    }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {uploadedImage?.name}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* ACTION BUTTONS */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 2 }}>
              <Button variant="outlined" onClick={handleReset}
                disabled={loading || modulesLoading}
                sx={{
                  px: 4, py: 1.5, textTransform: 'none', borderColor: '#e0e0e0', color: '#666',
                  '&:hover': { borderColor: '#bdbdbd', backgroundColor: '#f5f5f5' }
                }}>
                Reset
              </Button>
              <Button variant="contained" onClick={handleAdd}
                disabled={!formData.name.trim() || !formData.module || !/^[0-9a-fA-F]{24}$/.test(formData.module) || !uploadedImage || loading || modulesLoading}
                sx={{
                  px: 4, py: 1.5, backgroundColor: '#00695c', textTransform: 'none',
                  '&:hover': { backgroundColor: '#004d40' },
                  '&:disabled': { backgroundColor: '#e0e0e0', color: '#999' }
                }}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Add'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* CATEGORY LIST */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ width: '100%', maxWidth: '1400px', boxShadow: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CategoryIcon sx={{ color: '#1976d2', fontSize: 28 }} />
                <Box>
<Typography variant="h5" fontWeight={700} color="#2c3e50">
  {getSelectedModuleName()} Categories
</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Parent categories and their subcategories
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder={`Search in ${languageTabs[tabValue].label}`}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  sx={{
                    minWidth: { xs: '100%', sm: 250, md: 300 },
                    '& .MuiOutlinedInput-root': { 
                      direction: languageTabs[tabValue].key === 'arabic' ? 'rtl' : 'ltr',
                      borderRadius: 2
                    }
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#bdbdbd' }} /></InputAdornment>
                  }}
                  disabled={loading}
                />

                <TextField 
                  select 
                  size="small" 
                  value={selectedModuleFilter}
                  onChange={e => setSelectedModuleFilter(e.target.value)}
                  sx={{ minWidth: { xs: '100%', sm: 200 }, borderRadius: 2 }}
                  disabled={loading || modulesLoading}
                >
                  <MenuItem value="all">All Modules</MenuItem>
                  {modules.map(m => (
                    <MenuItem key={m._id} value={m._id}>{m.title || m.name || 'Unnamed'}</MenuItem>
                  ))}
                </TextField>

                <Button 
                  variant="contained" 
                  startIcon={<ExportIcon />}
                  onClick={handleExportMenuOpen}
                  sx={{
                    textTransform: 'none', 
                    borderRadius: 2,
                    px: 3,
                    backgroundColor: '#1976d2',
                    '&:hover': { backgroundColor: '#1565c0' }
                  }}
                  disabled={loading || filteredCategories.length === 0}
                >
                  Export
                </Button>

                <Menu anchorEl={exportMenuAnchor} open={exportMenuOpen} onClose={handleExportMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  sx={{ '& .MuiPaper-root': { minWidth: 180, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 2, mt: 1 } }}>
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
              <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>
            )}

            {/* CATEGORY LIST */}
            <Box sx={{ mt: 3 }}>
              {filteredCategories.length > 0 ? (
                getRootCategories()
                  .filter(root => {
                    if (selectedModuleFilter === 'all') return true;
                    return root.module?._id === selectedModuleFilter;
                  })
                  .map((rootCat, rootIndex) => {
                    const subcategories = getSubcategories(rootCat.id);
                    const isExpanded = expandedCategories[rootCat.id] || false;

                    return (
                      <Card key={rootCat.id} sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <CardHeader
                          sx={{
                            bgcolor: '#f8f9fa',
                            borderBottom: '1px solid #e0e0e0',
                            '& .MuiCardHeader-action': { m: 0 }
                          }}
                          avatar={
                            <Avatar
                              src={rootCat.image}
                              sx={{ 
                                width: 56, 
                                height: 56, 
                                bgcolor: rootCat.image ? 'transparent' : '#e3f2fd',
                                border: '2px solid #fff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              }}
                            >
                              {!rootCat.image && <CategoryIcon sx={{ color: '#1976d2' }} />}
                            </Avatar>
                          }
                          title={
                            <Box>
                              <Typography variant="h6" fontWeight={600} color="#2c3e50">
                                {rootCat.names[getCurrentLanguageKey()]}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {rootCat.module?.title || 'No Module'} • Display Order: {rootCat.displayOrder}
                              </Typography>
                            </Box>
                          }
                          subheader={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                              <Chip 
                                label={rootCat.status ? "Active" : "Inactive"} 
                                size="small"
                                color={rootCat.status ? "success" : "error"}
                                variant="outlined"
                              />
                              <Chip 
                                icon={<TagIcon />}
                                label={`${subcategories.length} subcategories`}
                                size="small"
                                variant="outlined"
                              />
                              {rootCat.isFeatured && (
                                <Chip 
                                  label="Featured" 
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          action={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
                                <IconButton onClick={() => toggleCategoryExpand(rootCat.id)}>
                                  {isExpanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton onClick={() => handleEdit(rootCat.id)} sx={{ color: '#1976d2' }}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton onClick={() => handleDeleteClick(rootCat.id)} sx={{ color: '#d32f2f' }}>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Toggle Status">
                                <Switch
                                  checked={rootCat.status}
                                  onChange={() => handleStatusToggle(rootCat.id)}
                                  size="small"
                                />
                              </Tooltip>
                            </Box>
                          }
                        />
                        
                        {/* SUBCATEGORIES */}
                        <Collapse in={isExpanded}>
                          <Box sx={{ p: 2, bgcolor: '#fafafa' }}>
                            {subcategories.length > 0 ? (
                              <Grid container spacing={2}>
                                {subcategories.map((subCat, subIndex) => (
                                  <Grid item xs={12} sm={6} md={4} key={subCat.id}>
                                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                      <CardContent sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                          <Avatar
                                            src={subCat.image}
                                            variant="rounded"
                                            sx={{ 
                                              width: 60, 
                                              height: 60,
                                              bgcolor: subCat.image ? 'transparent' : '#e8f5e9'
                                            }}
                                          >
                                            {!subCat.image && <TagIcon />}
                                          </Avatar>
                                          <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                              <Typography variant="subtitle1" fontWeight={500}>
                                                {subCat.names[getCurrentLanguageKey()]}
                                              </Typography>
                                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Tooltip title="Edit">
                                                  <IconButton 
                                                    size="small" 
                                                    onClick={() => handleEdit(subCat.id)}
                                                    sx={{ color: '#1976d2' }}
                                                  >
                                                    <EditIcon fontSize="small" />
                                                  </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                  <IconButton 
                                                    size="small" 
                                                    onClick={() => handleDeleteClick(subCat.id)}
                                                    sx={{ color: '#d32f2f' }}
                                                  >
                                                    <DeleteIcon fontSize="small" />
                                                  </IconButton>
                                                </Tooltip>
                                              </Box>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                              {subCat.description || 'No description'}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                              <Switch
                                                checked={subCat.status}
                                                onChange={() => handleStatusToggle(subCat.id)}
                                                size="small"
                                              />
                                              <Typography variant="caption">
                                                {subCat.status ? "Active" : "Inactive"}
                                              </Typography>
                                              {subCat.isFeatured && (
                                                <Chip 
                                                  label="Featured" 
                                                  size="small"
                                                  color="warning"
                                                  sx={{ height: 20 }}
                                                />
                                              )}
                                            </Box>
                                          </Box>
                                        </Box>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                ))}
                              </Grid>
                            ) : (
                              <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                  No subcategories available. Add subcategories to this parent category.
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Collapse>
                      </Card>
                    );
                  })
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CategoryIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    {loading ? 'Loading categories...' :
                      searchTerm ? `No results for "${searchTerm}"` :
                        'No categories available'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {!loading && !searchTerm && 'Create your first category using the form above'}
                  </Typography>
                </Box>
              )}
            </Box>
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
          sx: { 
            borderRadius: 3, 
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
          }
        }}
      >
        <DialogTitle sx={{
          m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #e0e0e0', bgcolor: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#1976d2', width: 40, height: 40 }}>
              <EditIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700} color="#2c3e50">Edit Category</Typography>
              <Typography variant="body2" color="text.secondary">Update category details and settings</Typography>
            </Box>
          </Box>
          <IconButton onClick={handleEditDialogClose} sx={{ color: '#666', '&:hover': { bgcolor: '#f5f5f5' } }}>
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
            <Box sx={{ mt: 2 }}>
              {/* TWO COLUMN LAYOUT */}
              <Grid container spacing={4}>
                {/* LEFT COLUMN */}
                <Grid item xs={12} md={6}>
                  {/* BASIC INFO */}
                  <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight={600} color="#2c3e50">
                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                          <SettingsIcon fontSize="small" />
                          Basic Information
                        </Box>
                      </Typography>
                      
                      <TextField
                        fullWidth
                        label="Category Title"
                        value={editFormData.name}
                        onChange={(e) => handleEditFormChange('name', e.target.value)}
                        placeholder="e.g. Premium Venues"
                        size="medium"
                        variant="outlined"
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CategoryIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={3}
                        value={editFormData.description}
                        onChange={(e) => handleEditFormChange('description', e.target.value)}
                        placeholder="Provide a brief description of this category..."
                        size="medium"
                      />
                    </CardContent>
                  </Card>

                  {/* IMAGE UPLOAD */}
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight={600} color="#2c3e50">
                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                          <ImageIcon fontSize="small" />
                          Category Image
                        </Box>
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: '100%',
                            height: 200,
                            border: '2px dashed #e0e0e0',
                            borderRadius: 2,
                            overflow: 'hidden',
                            backgroundColor: '#fafafa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            '&:hover': { borderColor: '#1976d2', bgcolor: '#f0f7ff' }
                          }}
                        >
                          {editImagePreview ? (
                            <img 
                              src={editImagePreview} 
                              alt="Preview" 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                              }} 
                            />
                          ) : (
                            <Box sx={{ textAlign: 'center', p: 3 }}>
                              <CloudUploadIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                Click to upload or drag and drop
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                SVG, PNG, JPG or GIF (max. 5MB)
                              </Typography>
                            </Box>
                          )}
                          <input
                            type="file"
                            id="edit-img-input"
                            style={{ 
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              opacity: 0,
                              cursor: 'pointer'
                            }}
                            accept="image/*"
                            onChange={handleEditImageUpload}
                            ref={editFileInputRef}
                          />
                        </Box>
                        
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          {editImagePreview ? 'Replace Image' : 'Choose Image'}
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleEditImageUpload}
                          />
                        </Button>
                        
                        <Typography variant="caption" color="text.secondary" align="center">
                          Recommended: 600×400px (3:2 ratio) • Max 5MB
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* RIGHT COLUMN */}
                <Grid item xs={12} md={6}>
                  {/* ASSOCIATIONS */}
                  <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight={600} color="#2c3e50">
                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                          <FolderIcon fontSize="small" />
                          Associations
                        </Box>
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            select
                            fullWidth
                            label="Module"
                            size="medium"
                            value={editFormData.module}
                            onChange={(e) => handleEditFormChange('module', e.target.value)}
                            sx={{ mb: 2 }}
                          >
                            {modules.map(m => (
                              <MenuItem key={m._id} value={m._id}>
                                {m.title || m.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            select
                            fullWidth
                            label="Parent Category"
                            size="medium"
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
                    </CardContent>
                  </Card>

                  {/* SETTINGS */}
                  <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight={600} color="#2c3e50">
                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                          <SettingsIcon fontSize="small" />
                          Settings
                        </Box>
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Display Order"
                            type="number"
                            size="medium"
                            value={editFormData.displayOrder}
                            onChange={(e) => handleEditFormChange('displayOrder', parseInt(e.target.value) || 0)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Typography color="text.secondary">#</Typography>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>Active Status</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Show/Hide category from listings
                              </Typography>
                            </Box>
                            <Switch
                              checked={editFormData.isActive}
                              onChange={(e) => handleEditFormChange('isActive', e.target.checked)}
                              color="primary"
                              size="medium"
                            />
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>Featured</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Highlight as featured category
                              </Typography>
                            </Box>
                            <Switch
                              checked={editFormData.isFeatured}
                              onChange={(e) => handleEditFormChange('isFeatured', e.target.checked)}
                              color="warning"
                              size="medium"
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                 
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0', bgcolor: 'white' }}>
          <Button
            onClick={handleEditDialogClose}
            variant="outlined"
            sx={{ 
              textTransform: 'none', 
              px: 4, 
              borderRadius: 2, 
              borderColor: '#ddd', 
              color: '#666',
              '&:hover': { borderColor: '#999', bgcolor: '#f5f5f5' }
            }}
            disabled={editDialog.loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
            sx={{
              textTransform: 'none', 
              px: 5, 
              borderRadius: 2,
              bgcolor: '#1976d2',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': { 
                bgcolor: '#1565c0',
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
              }
            }}
            disabled={editDialog.loading || !editFormData.name.trim()}
            startIcon={editDialog.loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {editDialog.loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog 
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, categoryId: null, categoryName: '' })}
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#ffebee', color: '#d32f2f', width: 40, height: 40 }}>
              <DeleteIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" color="#d32f2f">Confirm Delete</Typography>
              <Typography variant="body2" color="text.secondary">This action cannot be undone</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            Warning: Deleting a category will also remove all associated subcategories and references.
          </Alert>
          <Typography>
            Are you sure you want to delete <strong>"{deleteDialog.categoryName}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, categoryId: null, categoryName: '' })}
            variant="outlined" 
            sx={{ 
              textTransform: 'none', 
              px: 4,
              borderRadius: 2
            }} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            sx={{ 
              textTransform: 'none', 
              px: 4,
              borderRadius: 2,
              bgcolor: '#d32f2f',
              '&:hover': { bgcolor: '#c62828' }
            }} 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Deleting...' : 'Delete Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUCCESS / INFO SNACKBAR */}
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
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
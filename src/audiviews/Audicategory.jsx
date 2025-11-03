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
  Stack
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

// Use environment variable or fallback to localhost
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

  // Ref for file input
  const fileInputRef = useRef(null);

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
      console.log('Fetched modules:', data);

      let modulesList = [];
      if (Array.isArray(data)) modulesList = data;
      else if (Array.isArray(data.modules)) modulesList = data.modules;
      else if (data.data && Array.isArray(data.data.modules)) modulesList = data.data.modules;
      else if (data.data && Array.isArray(data.data)) modulesList = data.data;

      setModules(modulesList);

      // Auto-select auditorium module if exists
      const auditoriumModule = modulesList.find(m =>
        m.title?.toLowerCase().includes('auditorium') ||
        m.name?.toLowerCase().includes('auditorium')
      );

      if (auditoriumModule) {
        setFormData(prev => ({ ...prev, module: auditoriumModule._id }));
        setSelectedModuleFilter(auditoriumModule._id);
      } else if (modulesList.length > 0) {
        setFormData(prev => ({ ...prev, module: modulesList[0]._id }));
        setSelectedModuleFilter(modulesList[0]._id);
      } else {
        setModulesError('No modules available. Please create a module first.');
      }
    } catch (err) {
      console.error('fetchModules error:', err);
      setModulesError(err.message);
      showNotification('Failed to fetch modules', 'error');
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
      console.log('Fetched categories:', data);

      let categoriesList = [];
      if (Array.isArray(data)) categoriesList = data;
      else if (Array.isArray(data.categories)) categoriesList = data.categories;
      else if (data.data && Array.isArray(data.data.categories)) categoriesList = data.data.categories;
      else if (data.data && Array.isArray(data.data)) categoriesList = data.data;

      const formattedCategories = categoriesList.map(cat => {
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
    setFormData(prev => ({
      ...prev,
      name: '',
      description: '',
      parentCategory: '',
      module: modules.length > 0 ? modules[0]._id : '',
      displayOrder: 0,
      isActive: true,
      isFeatured: false,
      metaTitle: '',
      metaDescription: ''
    }));
    setUploadedImage(null);
    setImagePreview(null);

    // Properly reset file input
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
      showNotification('Please enter a category title in Default language', 'error');
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
      if (formData.parentCategory.trim()) formDataToSend.append('parentCategory', formData.parentCategory.trim());
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
      const added = data.data?.category || data.category || data;
      showNotification(`Category "${added.title || added.name}" added successfully!`, 'success');
      handleReset();
      fetchCategories();
    } catch (err) {
      console.error('Add error:', err);
      let errorMessage = err.message || 'Failed to add category';
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to reach the server. Please check your connection.';
      }
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ------------------- EDIT / DELETE / STATUS -------------------
  const handleEdit = (id) => navigate(`/categories/edit/${id}`);

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
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${deleteDialog.categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const txt = await response.text();
        let err = { error: txt };
        try { err = JSON.parse(txt); } catch {}
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
    if (!token) {
      navigate('/login');
      return;
    }

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
        try { err = JSON.parse(txt); } catch {}
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

  // ------------------- FILTERED CATEGORIES -------------------
  const filteredCategories = categories.filter(cat => {
    const lang = getCurrentLanguageKey();
    const matchesSearch = cat.names[lang].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModuleFilter === 'all' || cat.module?._id === selectedModuleFilter;
    return matchesSearch && matchesModule;
  });

  // ------------------- EXPORT -------------------
  const handleExportMenuOpen = (e) => setExportMenuAnchor(e.currentTarget);
  const handleExportMenuClose = () => setExportMenuAnchor(null);

  const exportToCSV = () => {
    const lang = getCurrentLanguageKey();
    const label = languageTabs[tabValue].label;
    const headers = ['SI', 'ID', `Name (${label})`, 'Module', 'Status'];
    const rows = filteredCategories.map((c, i) => [
      i + 1,
      c.id,
      c.names[lang],
      c.module?.title || 'N/A',
      c.status ? 'Active' : 'Inactive'
    ]);

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
    const label = languageTabs[tabValue].label;
    const headers = ['SI', 'ID', `Name (${label})`, 'Module', 'Status'];
    const rows = filteredCategories.map((c, i) => [
      i + 1,
      c.id,
      c.names[lang],
      c.module?.title || 'N/A',
      c.status ? 'Active' : 'Inactive'
    ]);

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
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto"
              sx={{ mb: 4, borderBottom: 1, borderColor: 'divider', '& .MuiTabs-indicator': { backgroundColor: '#2196f3' } }}>
              {languageTabs.map(t => <Tab key={t.key} label={t.label} />)}
            </Tabs>

            {/* TITLE */}
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

            {/* MODULE SELECT */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Module <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              select fullWidth
              value={formData.module}
              onChange={e => handleFormDataChange('module', e.target.value)}
              variant="outlined"
              disabled={modulesLoading || !!modulesError || modules.length === 0}
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
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
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
                sx={{ px: 4, py: 1.5, textTransform: 'none', borderColor: '#e0e0e0', color: '#666',
                  '&:hover': { borderColor: '#bdbdbd', backgroundColor: '#f5f5f5' } }}>
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

      {/* LIST TABLE */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ width: '100%', maxWidth: '1400px', boxShadow: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={600}>Category List</Typography>
                <Chip label={filteredCategories.length} size="small"
                  sx={{ backgroundColor: '#e3f2fd', color: '#2196f3', fontWeight: 600 }} />
                <Chip label={`Language: ${languageTabs[tabValue].label}`} size="small"
                  sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32', fontWeight: 500 }} />
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                {/* MODULE FILTER */}
                <TextField select size="small" value={selectedModuleFilter}
                  onChange={e => setSelectedModuleFilter(e.target.value)}
                  sx={{ minWidth: { xs: '100%', sm: 200 } }} disabled={loading || modulesLoading}>
                  <MenuItem value="all">All Modules</MenuItem>
                  {modules.map(m => (
                    <MenuItem key={m._id} value={m._id}>{m.title || m.name || 'Unnamed'}</MenuItem>
                  ))}
                </TextField>

                {/* SEARCH */}
                <TextField size="small"
                  placeholder={`Search in ${languageTabs[tabValue].label}`}
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  sx={{
                    minWidth: { xs: '100%', sm: 250, md: 300 },
                    '& .MuiOutlinedInput-root': { direction: languageTabs[tabValue].key === 'arabic' ? 'rtl' : 'ltr' }
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#bdbdbd' }} /></InputAdornment>
                  }}
                  disabled={loading}
                />

                {/* EXPORT */}
                <Button variant="outlined" startIcon={<ExportIcon />} endIcon={<ExpandMoreIcon />}
                  onClick={handleExportMenuOpen}
                  sx={{
                    textTransform: 'none', borderColor: '#e0e0e0', color: '#2196f3',
                    '&:hover': { borderColor: '#2196f3', backgroundColor: '#e3f2fd' }
                  }}
                  disabled={loading || filteredCategories.length === 0}>
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

            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#fafafa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>SI</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Image</TableCell>
                    <TableCell sx={{
                      fontWeight: 600, color: '#666',
                      direction: languageTabs[tabValue].key === 'arabic' ? 'rtl' : 'ltr'
                    }}>
                      Name ({languageTabs[tabValue].label})
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Module</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredCategories.length > 0 ? filteredCategories.map((cat, idx) => {
                    const lang = getCurrentLanguageKey();
                    return (
                      <TableRow key={cat.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          {cat.image ? (
                            <Box sx={{
                              width: 50, height: 35, borderRadius: 1, overflow: 'hidden',
                              border: '1px solid #e0e0e0'
                            }}>
                              <img src={cat.image} alt={cat.names[lang]}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f5f5;font-size:10px;color:#999;">Error</div>';
                                }} />
                            </Box>
                          ) : (
                            <Box sx={{
                              width: 50, height: 35, borderRadius: 1, backgroundColor: '#f5f5f5',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '1px solid #e0e0e0'
                            }}>
                              <Typography variant="caption" color="text.secondary">No Image</Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell sx={{
                          fontWeight: 500, maxWidth: 200,
                          direction: languageTabs[tabValue].key === 'arabic' ? 'rtl' : 'ltr'
                        }}>
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {cat.names[lang]}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {cat.module ? cat.module.title || 'N/A' : 'None'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Switch checked={cat.status} onChange={() => handleStatusToggle(cat.id)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#2196f3' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#2196f3' }
                            }}
                            disabled={loading} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" onClick={() => handleEdit(cat.id)} sx={{ color: '#2196f3' }} disabled={loading}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteClick(cat.id)} sx={{ color: '#f44336' }} disabled={loading}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#999' }}>
                        <Stack spacing={2} alignItems="center">
                          <Typography variant="h6" color="textSecondary">
                            {loading ? 'Loading...' :
                              searchTerm ? `No results for "${searchTerm}" in ${languageTabs[tabValue].label}` :
                              'No categories available.'}
                          </Typography>
                          {error || modulesError ? (
                            <Button variant="outlined" onClick={handleRetry}>Retry</Button>
                          ) : !loading && !searchTerm && (
                            <Typography variant="body2" color="textSecondary">
                              Create your first category using the form above
                            </Typography>
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

      {/* DELETE DIALOG */}
      <Dialog open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, categoryId: null, categoryName: '' })}
        maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{deleteDialog.categoryName}"? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setDeleteDialog({ open: false, categoryId: null, categoryName: '' })}
            variant="outlined" sx={{ textTransform: 'none' }} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error"
            sx={{ textTransform: 'none' }} disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUCCESS / INFO SNACKBAR */}
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleNotificationClose} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
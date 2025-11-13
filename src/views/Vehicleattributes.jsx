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
  CircularProgress,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemAvatar,
  Avatar,
  Input,
  Divider,
  Tooltip,
  Zoom,
  Fab,
  Stack,
  InputLabel,
  FormControl,
  Select,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  TableView as ExcelIcon,
  Description as CsvIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Tag as TagIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  DragHandle as DragHandleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.bookmyevent.ae/api';

export default function Vehicleattributes() {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadedIcon, setUploadedIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [modulesError, setModulesError] = useState(null);
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    module: '',
  });

  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    attributeId: null,
    attributeTitle: '',
  });

  // === Redesigned Values Dialog State ===
  const [valuesDialog, setValuesDialog] = useState({
    open: false,
    attributeId: null,
    attributeTitle: '',
    currentValues: [],
    newValueInput: '',
    searchValueFilter: '',
  });

  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const exportMenuOpen = Boolean(exportMenuAnchor);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const languageTabs = [
    { key: 'default', label: 'Default' },
    { key: 'english', label: 'English(EN)' },
    { key: 'arabic', label: 'Arabic - العربية(AR)' },
  ];

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const getAuthToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
  const getUserRole = () => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!user) return null;
    try { return JSON.parse(user).role; } catch { return null; }
  };

  const handleTabChange = (_, newValue) => setTabValue(newValue);

  // -------------------------------------------------------------------------
  // Fetch Modules
  // -------------------------------------------------------------------------
  const fetchModules = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setModulesError('Authentication required');
      setModulesLoading(false);
      return;
    }

    setModulesLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { navigate('/login'); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (data.modules) list = data.modules;
      else if (data.data?.modules) list = data.data.modules;
      else if (data.data) list = data.data;

      setModules(list);

      const transport = list.find(m => (m.title || m.name || '').toLowerCase().includes('transport'));
      const defaultModule = transport?._id || list[0]?._id || '';
      setFormData(prev => ({ ...prev, module: defaultModule }));
      setSelectedModuleFilter('all');
    } catch (err) {
      setModulesError(err.message);
    } finally {
      setModulesLoading(false);
    }
  }, [navigate]);

  // -------------------------------------------------------------------------
  // Fetch Attributes
  // -------------------------------------------------------------------------
  const fetchAttributes = useCallback(async () => {
    const token = getAuthToken();
    if (!token) { setError('Authentication required'); setLoading(false); return; }

    setLoading(true);
    try {
      const url = `${API_BASE_URL}/vehicle-attributes?search=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) { navigate('/login'); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const result = await res.json();
      const list = result.data || [];

      const formatted = list.map(attr => {
        let iconUrl = '';
        if (attr.icon) {
          if (attr.icon.startsWith('http://') || attr.icon.startsWith('https://')) {
            iconUrl = attr.icon;
          } else if (attr.icon.startsWith('/uploads') || attr.icon.startsWith('uploads')) {
            const cleanPath = attr.icon.startsWith('/') ? attr.icon : `/${attr.icon}`;
            iconUrl = `https://api.bookmyevent.ae${cleanPath}`;
          } else {
            iconUrl = `https://api.bookmyevent.ae/${attr.icon}`;
          }
        }

        return {
          id: attr._id,
          title: attr.title || '',
          module: modules.find(m => m._id === attr.module) || { title: 'Unknown', _id: attr.module },
          moduleId: attr.module,
          icon: iconUrl,
          values: attr.values || [],
          status: attr.status ?? true,
        };
      });

      setAttributes(formatted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, modules, navigate]);

  // -------------------------------------------------------------------------
  // Initial Load
  // -------------------------------------------------------------------------
  useEffect(() => {
    const role = getUserRole();
    if (!['admin', 'manager', 'superadmin'].includes(role || '')) {
      setError('Access denied');
      navigate('/dashboard');
      return;
    }
    fetchModules();
  }, [fetchModules, navigate]);

  useEffect(() => {
    if (modules.length > 0) {
      fetchAttributes();
    }
  }, [fetchAttributes, modules]);

  // -------------------------------------------------------------------------
  // Icon Upload
  // -------------------------------------------------------------------------
  const handleIconUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file (JPEG, PNG, GIF, WebP, SVG)', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showNotification('Icon must be less than 2 MB', 'error');
      return;
    }

    setUploadedIcon(file);
    const reader = new FileReader();
    reader.onload = ev => setIconPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------------------
  // Reset Form
  // -------------------------------------------------------------------------
  const handleReset = () => {
    setFormData({
      title: '',
      module: modules[0]?._id || '',
    });
    setUploadedIcon(null);
    setIconPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // -------------------------------------------------------------------------
  // Add Attribute
  // -------------------------------------------------------------------------
  const handleAdd = async () => {
    const token = getAuthToken();
    if (!token) { navigate('/login'); return; }

    if (!formData.title.trim()) {
      showNotification('Attribute title is required', 'error');
      return;
    }
    if (!formData.module) {
      showNotification('Please select a module', 'error');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title.trim());
      fd.append('module', formData.module);
      if (uploadedIcon) fd.append('icon', uploadedIcon);

      const res = await fetch(`${API_BASE_URL}/vehicle-attributes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to create');

      showNotification(`"${formData.title}" added!`, 'success');
      handleReset();
      fetchAttributes();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Delete Attribute
  // -------------------------------------------------------------------------
  const handleDeleteClick = (id, title) => {
    setDeleteDialog({ open: true, attributeId: id, attributeTitle: title });
  };

  const handleDeleteConfirm = async () => {
    const token = getAuthToken();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/vehicle-attributes/${deleteDialog.attributeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      showNotification('Attribute deleted!', 'success');
      setDeleteDialog({ open: false, attributeId: null, attributeTitle: '' });
      fetchAttributes();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Toggle Status
  // -------------------------------------------------------------------------
  const handleStatusToggle = async (id) => {
    const token = getAuthToken();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/vehicle-attributes/toggle/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed');
      showNotification(result.message, 'success');
      fetchAttributes();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // === Redesigned Values Dialog Logic ===
  // -------------------------------------------------------------------------
  const handleValuesClick = (id, title, values) => {
    setValuesDialog({
      open: true,
      attributeId: id,
      attributeTitle: title,
      currentValues: [...values],
      newValueInput: '',
      searchValueFilter: '',
    });
  };

  const handleBulkAdd = () => {
    const input = valuesDialog.newValueInput.trim();
    if (!input) return;

    const newItems = input
      .split(',')
      .map(v => v.trim())
      .filter(v => v && !valuesDialog.currentValues.includes(v));

    if (newItems.length === 0) {
      showNotification('No new unique values to add', 'warning');
      return;
    }

    setValuesDialog(prev => ({
      ...prev,
      currentValues: [...prev.currentValues, ...newItems],
      newValueInput: '',
    }));
    showNotification(`${newItems.length} value(s) added`, 'success');
  };

  const handleRemoveValue = (idx) => {
    setValuesDialog(prev => ({
      ...prev,
      currentValues: prev.currentValues.filter((_, i) => i !== idx),
    }));
  };

  const filteredValues = valuesDialog.currentValues.filter(val =>
    val.toLowerCase().includes(valuesDialog.searchValueFilter.toLowerCase())
  );

  const handleSaveValues = async () => {
    const token = getAuthToken();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/vehicle-attributes/values/${valuesDialog.attributeId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: valuesDialog.currentValues }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save values');
      }
      showNotification('Values updated successfully!', 'success');
      setValuesDialog({ ...valuesDialog, open: false });
      fetchAttributes();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Filter & Export
  // -------------------------------------------------------------------------
  const filteredAttributes = attributes.filter(attr => {
    const matchesSearch = attr.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModuleFilter === 'all' || attr.moduleId === selectedModuleFilter;
    return matchesSearch && matchesModule;
  });

  const handleExportMenuOpen = e => setExportMenuAnchor(e.currentTarget);
  const handleExportMenuClose = () => setExportMenuAnchor(null);

  const exportToCSV = () => {
    const headers = ['SI', 'ID', 'Title', 'Module', 'Values', 'Status'];
    const rows = filteredAttributes.map((a, i) => [
      i + 1,
      a.id,
      a.title,
      a.module?.title || 'N/A',
      a.values.join('; '),
      a.status ? 'Active' : 'Inactive',
    ]);
    const csv = [headers, ...rows.map(r => r.map(f => `"${f}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vehicle_attributes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    handleExportMenuClose();
    showNotification('CSV exported', 'success');
  };

  const exportToExcel = () => {
    const headers = ['SI', 'ID', 'Title', 'Module', 'Values', 'Status'];
    const rows = filteredAttributes.map((a, i) => [
      i + 1,
      a.id,
      a.title,
      a.module?.title || 'N/A',
      a.values.join('; '),
      a.status ? 'Active' : 'Inactive',
    ]);
    const content = [headers, ...rows.map(r => r.join('\t'))].join('\n');
    const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vehicle_attributes_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    handleExportMenuClose();
    showNotification('Excel exported', 'success');
  };

  const showNotification = (msg, severity = 'success') => {
    setNotification({ open: true, message: msg, severity });
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (loading && attributes.length === 0 && modulesLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f5f5f5', p: { xs: 2, sm: 3 } }}>

      {/* Error Snackbar */}
      <Snackbar open={!!error || !!modulesError} autoHideDuration={null}
        onClose={() => { setError(null); setModulesError(null); }}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error || modulesError}
          <Button size="small" onClick={() => { fetchModules(); fetchAttributes(); }} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Snackbar>

      {/* Add Form */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Card sx={{ width: '100%', maxWidth: 1400, boxShadow: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 4 }}>
              {languageTabs.map(t => <Tab key={t.key} label={t.label} />)}
            </Tabs>

            {/* Title */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Attribute Title <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={languageTabs[tabValue].key === 'default' ? formData.title : ''}
              onChange={e => languageTabs[tabValue].key === 'default' && setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Fuel Type, Transmission"
              disabled={languageTabs[tabValue].key !== 'default'}
              sx={{ mb: 4 }}
            />

            {/* Module */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Module <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              select
              fullWidth
              value={formData.module}
              onChange={e => setFormData(prev => ({ ...prev, module: e.target.value }))}
              disabled={modulesLoading || !!modulesError}
              sx={{ mb: 4 }}
            >
              {modules.map(m => (
                <MenuItem key={m._id} value={m._id}>
                  {m.title || m.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Icon Upload */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Icon <span style={{ color: '#777', fontSize: '0.8rem' }}>(optional, max 2 MB)</span>
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box>
                <input
                  id="icon-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <label htmlFor="icon-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    sx={{
                      width: { xs: '100%', sm: 240 },
                      height: 140,
                      border: '2px dashed #e0e0e0',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      color: 'text.secondary',
                      textTransform: 'none',
                      '&:hover': { borderColor: '#2196f3', bgcolor: '#e3f2fd' },
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 40, color: '#bdbdbd' }} />
                    <Typography variant="body2" color="text.secondary">
                      {uploadedIcon ? 'Change Icon' : 'Upload Icon'}
                    </Typography>
                  </Button>
                </label>
              </Box>

              {iconPreview && (
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{
                    width: 240,
                    height: 140,
                    border: '2px solid #e0e0e0',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}>
                    <img
                      src={iconPreview}
                      alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        setUploadedIcon(null);
                        setIconPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {uploadedIcon?.name}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleReset} disabled={loading}>Reset</Button>
              <Button
                variant="contained"
                onClick={handleAdd}
                disabled={!formData.title.trim() || !formData.module || loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Add Attribute'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* List */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ width: '100%', maxWidth: 1400, boxShadow: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={600}>Vehicle Attributes</Typography>
                <Chip label={filteredAttributes.length} color="primary" size="small" />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  select
                  size="small"
                  value={selectedModuleFilter}
                  onChange={e => setSelectedModuleFilter(e.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="all">All Modules</MenuItem>
                  {modules.map(m => (
                    <MenuItem key={m._id} value={m._id}>{m.title || m.name}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  size="small"
                  placeholder="Search attributes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                  sx={{ minWidth: 250 }}
                />
                <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportMenuOpen}>
                  Export
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SI</TableCell>
                    <TableCell>Icon</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Module</TableCell>
                    <TableCell>Values</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAttributes.map((attr, i) => (
                    <TableRow key={attr.id} hover>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>
                        {attr.icon ? (
                          <Box sx={{
                            width: 50,
                            height: 35,
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid #e0e0e0'
                          }}>
                            <img
                              src={attr.icon}
                              alt={attr.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `
                                  <div style="
                                    width:100%;height:100%;
                                    display:flex;align-items:center;justify-content:center;
                                    background:#f5f5f5;font-size:10px;color:#999;
                                  ">Error</div>`;
                              }}
                            />
                          </Box>
                        ) : (
                          <Box sx={{
                            width: 50,
                            height: 35,
                            borderRadius: 1,
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #e0e0e0'
                          }}>
                            <Typography variant="caption" color="text.secondary">No Icon</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>{attr.title}</TableCell>
                      <TableCell>{attr.module?.title || 'N/A'}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => handleValuesClick(attr.id, attr.title, attr.values)}
                        >
                          {attr.values.length} Value{attr.values.length !== 1 ? 's' : ''}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Switch checked={attr.status} onChange={() => handleStatusToggle(attr.id)} disabled={loading} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => navigate(`/vehicle-attributes/edit/${attr.id}`)}><EditIcon /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(attr.id, attr.title)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAttributes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography>No attributes found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* === Redesigned Values Dialog === */}
      <Dialog
        open={valuesDialog.open}
        onClose={() => setValuesDialog({ ...valuesDialog, open: false })}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <TagIcon color="primary" />
            <Typography variant="h6" component="span">
              Manage Values
            </Typography>
            <Chip label={valuesDialog.currentValues.length} size="small" color="primary" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {valuesDialog.attributeTitle}
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          {/* Add Input */}
          <Box sx={{ mb: 3 }}>
            <InputLabel sx={{ mb: 1, fontWeight: 500 }}>Add Values (comma-separated)</InputLabel>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Diesel, Petrol, Electric, Hybrid"
              value={valuesDialog.newValueInput}
              onChange={e => setValuesDialog(prev => ({ ...prev, newValueInput: e.target.value }))}
              onKeyPress={e => e.key === 'Enter' && handleBulkAdd()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Add all unique values">
                      <IconButton onClick={handleBulkAdd} disabled={!valuesDialog.newValueInput.trim()}>
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Tip: Paste or type comma-separated values
            </Typography>
          </Box>

          {/* Search Filter */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search values..."
              value={valuesDialog.searchValueFilter}
              onChange={e => setValuesDialog(prev => ({ ...prev, searchValueFilter: e.target.value }))}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
            />
          </Box>

          {/* Values List */}
          <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', bgcolor: '#fafafa' }}>
            {filteredValues.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                {valuesDialog.searchValueFilter ? (
                  <>
                    <WarningIcon sx={{ fontSize: 40, mb: 1, color: 'warning.main' }} />
                    <Typography>No values match your search</Typography>
                  </>
                ) : (
                  <>
                    <TagIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                    <Typography>No values added yet</Typography>
                    <Typography variant="caption">Start by adding values above</Typography>
                  </>
                )}
              </Box>
            ) : (
              <List disablePadding>
                {filteredValues.map((val, idx) => (
                  <ListItem
                    key={idx}
                    secondaryAction={
                      <IconButton size="small" onClick={() => handleRemoveValue(valuesDialog.currentValues.indexOf(val))}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{
                      bgcolor: 'background.paper',
                      mb: 0.5,
                      borderRadius: 1,
                      mx: 1,
                      mt: 0.5,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.85rem' }}>
                        {val.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={val} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setValuesDialog({ ...valuesDialog, open: false })}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveValues}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          >
            Save Values
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Delete "{deleteDialog.attributeTitle}"? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Export Menu */}
      <Menu anchorEl={exportMenuAnchor} open={exportMenuOpen} onClose={handleExportMenuClose}>
        <MenuItem onClick={exportToExcel}><ListItemIcon><ExcelIcon /></ListItemIcon> Excel</MenuItem>
        <MenuItem onClick={exportToCSV}><ListItemIcon><CsvIcon /></ListItemIcon> CSV</MenuItem>
      </Menu>

      {/* Notification */}
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification(prev => ({ ...prev, open: false }))}>
        <Alert severity={notification.severity} onClose={() => setNotification(prev => ({ ...prev, open: false }))}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
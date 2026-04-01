
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  Drawer,
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Refresh as RefreshIcon, 
  Edit as EditIcon, 
  Close as CloseIcon 
} from '@mui/icons-material';
import { API_BASE_URL, getApiImageUrl } from '../utils/apiImageUtils';

const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [modules, setModules] = useState([]);
  const [secondaryModules, setSecondaryModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filter state
  const [moduleFilter, setModuleFilter] = useState('all');

  // Drawer state
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    module: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const getAuthToken = () => localStorage.getItem('token') || '';

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const galleryUrl = moduleFilter === 'all' 
        ? `${API_BASE_URL}/gallery` 
        : `${API_BASE_URL}/gallery?module=${moduleFilter}`;
        
      const galleryRes = await fetch(galleryUrl, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
      });
      const galleryResult = await galleryRes.json();
      if (galleryResult.success) setGallery(galleryResult.data);

      const modulesRes = await fetch(`${API_BASE_URL}/modules`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
      });
      const modulesResult = await modulesRes.json();
      const mods = (Array.isArray(modulesResult) ? modulesResult : (modulesResult.data || []))
        .map(m => ({ ...m, modelType: 'Module' }));
      setModules(mods);

      const secModulesRes = await fetch(`${API_BASE_URL}/secondary-modules`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
      });
      const secModulesResult = await secModulesRes.json();
      const secMods = (Array.isArray(secModulesResult) ? secModulesResult : (secModulesResult.data || []))
        .map(m => ({ ...m, modelType: 'SecondaryModule' }));
      setSecondaryModules(secMods);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [moduleFilter]);

  const allModules = [...modules, ...secondaryModules];

  const handleOpenAdd = () => {
    setEditMode(false);
    setSelectedId(null);
    setFormData({ title: '', module: '' });
    setImage(null);
    setImagePreview(null);
    setOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditMode(true);
    setSelectedId(item._id);
    setFormData({ 
        title: item.title, 
        module: item.module?._id || item.module 
    });
    setImagePreview(getApiImageUrl(item.image));
    setImage(null);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!image && !editMode) {
      setError('Please select an image');
      return;
    }

    const selectedMod = allModules.find(m => m._id === formData.module);

    setFormLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('module', formData.module);
    data.append('moduleModel', selectedMod?.modelType || 'Module');
    if (image) data.append('image', image);

    try {
      const url = editMode 
        ? `${API_BASE_URL}/gallery/${selectedId}`
        : `${API_BASE_URL}/gallery/create`;
      
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        body: data,
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(editMode ? 'Gallery item updated!' : 'Gallery item added!');
        setOpen(false);
        fetchData();
      } else throw new Error(result.error || 'Failed to save item');
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
      });
      if (response.ok) {
        setSuccess('Item deleted');
        setGallery(gallery.filter(item => item._id !== id));
      } else throw new Error('Failed to delete');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f1f5f9', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 'xl', margin: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" fontWeight={700} color="#1e293b">Gallery Management</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel sx={{ color: '#64748b' }}>Filter by Module</InputLabel>
                <Select
                    value={moduleFilter}
                    onChange={(e) => setModuleFilter(e.target.value)}
                    label="Filter by Module"
                    sx={{ bgcolor: 'white', borderRadius: 2 }}
                >
                <MenuItem value="all">All Modules</MenuItem>
                {allModules.map((m) => (
                    <MenuItem key={m._id} value={m._id}>{m.title}</MenuItem>
                ))}
                </Select>
            </FormControl>
            <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={handleOpenAdd}
                sx={{ bgcolor: '#EA4C46', '&:hover': { bgcolor: '#d43d37' }, px: 3, borderRadius: 2, boxShadow: 'none' }}
            >
                Add Image
            </Button>
            </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

        {loading ? (
            <Box display="flex" justifyContent="center" p={8}><CircularProgress /></Box>
        ) : (
            <Grid container spacing={3}>
            {gallery.map((item) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item._id}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 2px 4px rgb(0 0 0 / 0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <CardMedia
                    component="img"
                    height="200"
                    image={getApiImageUrl(item.image)}
                    alt={item.title}
                    sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap color="#1e293b">{item.title}</Typography>
                    <Chip 
                        label={item.module?.title || 'General'} 
                        size="small" 
                        variant="outlined" 
                        sx={{ mt: 1, borderRadius: 1.5, borderColor: '#e2e8f0', color: '#64748b', fontSize: '0.7rem' }}
                    />
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2, pt: 0 }}>
                    <Tooltip title="Edit">
                        <IconButton size="small" sx={{ color: '#3b82f6', bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' } }} onClick={() => handleOpenEdit(item)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" sx={{ color: '#ef4444', bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }} onClick={() => handleDelete(item._id)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    </CardActions>
                </Card>
                </Grid>
            ))}
            {gallery.length === 0 && (
                <Grid size={{ xs: 12 }}>
                <Box sx={{ textAlign: 'center', py: 12, bgcolor: 'white', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <Typography variant="body1" color="#64748b">No images found for this category.</Typography>
                    <Button startIcon={<RefreshIcon />} onClick={fetchData} sx={{ mt: 2, color: '#EA4C46' }}>Refresh Gallery</Button>
                </Box>
                </Grid>
            )}
            </Grid>
        )}
      </Box>

      {/* Add/Edit Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 450 }, p: 4, display: 'flex', flexDirection: 'column' }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            {editMode ? 'Edit Gallery Image' : 'Add Gallery Image'}
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ color: '#64748b' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
                <TextField
                    label="Image Title *"
                    fullWidth
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    variant="outlined"
                    placeholder="Enter image title"
                    sx={{ bgcolor: '#f8fafc' }}
                />
            </Grid>

            <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required sx={{ bgcolor: '#f8fafc' }}>
                    <InputLabel>Module Selection *</InputLabel>
                    <Select
                    value={formData.module}
                    onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                    label="Module Selection *"
                    >
                    <MenuItem value="" disabled>Select a module</MenuItem>
                    {allModules.map((m) => (
                        <MenuItem key={m._id} value={m._id}>{m.title}</MenuItem>
                    ))}
                    </Select>
                </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#64748b' }}>
                {editMode ? 'Replace Image' : 'Upload Gallery Image'}
                </Typography>
                <Box
                sx={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: 3,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    bgcolor: '#f8fafc',
                    '&:hover': { borderColor: '#EA4C46', bgcolor: '#f1f5f9' }
                }}
                onClick={() => document.getElementById('gallery-image-input-drawer').click()}
                >
                <input
                    id="gallery-image-input-drawer"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                />
                <AddIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
                <Typography variant="body2" color="#64748b">
                    Click to select image or drag here
                </Typography>
                </Box>

                {imagePreview && (
                <Box sx={{ mt: 3, position: 'relative', textAlign: 'center' }}>
                    <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: 250, objectFit: 'cover', borderRadius: 12, border: '1px solid #e2e8f0' }}
                    />
                    <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }}
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    >
                    <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
                )}
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 'auto', pt: 4, display: 'flex', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setOpen(false)}
            sx={{ height: 48, borderRadius: 1.5, color: '#EA4C46', borderColor: '#EA4C46', '&:hover': { borderColor: '#d43d37', bgcolor: '#fff5f5' } }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            onClick={handleSubmit}
            disabled={formLoading || !formData.module || !formData.title}
            variant="contained"
            sx={{ height: 48, borderRadius: 1.5, bgcolor: '#EA4C46', '&:hover': { bgcolor: '#d43d37' }, boxShadow: 'none' }}
          >
            {formLoading ? <CircularProgress size={24} color="inherit" /> : editMode ? 'Update Image' : 'Save Image'}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Gallery;

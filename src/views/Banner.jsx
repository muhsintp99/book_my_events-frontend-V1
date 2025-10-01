import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  TextField,
  TableContainer,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CloudUpload,
  Image as ImageIcon,
  Refresh,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Custom ObjectId validator for the frontend
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Utility to validate and construct image URLs
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // Already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:image/')) {
    return imagePath;
  }

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${API_BASE_URL}/${imagePath.replace(/^\/+/, '')}`; 
};


// Utility to validate image URLs
const isValidImageUrl = (url) => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/');
};

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  borderRadius: 8
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: '1px solid #e0e0e0',
  '& .MuiTab-root': {
    textTransform: 'none',
    minWidth: 120,
    fontWeight: 500,
    fontSize: '14px'
  },
  '& .Mui-selected': {
    color: '#14b8a6'
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#14b8a6'
  }
}));

const ImageUploadArea = styled(Box)(({ theme }) => ({
  border: '2px dashed #e0e0e0',
  borderRadius: 8,
  padding: theme.spacing(6),
  textAlign: 'center',
  backgroundColor: '#f8fffe',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  minHeight: 150,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    borderColor: '#14b8a6',
    backgroundColor: '#f0fdfa'
  }
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  maxWidth: 300,
  marginTop: theme.spacing(2),
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  overflow: 'hidden'
}));

const PreviewCloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 4,
  right: 4,
  backgroundColor: 'rgba(0,0,0,0.5)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.7)'
  }
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#14b8a6',
  color: 'white',
  fontWeight: 600,
  padding: theme.spacing(1.2, 4),
  borderRadius: 6,
  textTransform: 'none',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: '#0f9488'
  }
}));

const ResetButton = styled(Button)(({ theme }) => ({
  color: '#666',
  fontWeight: 500,
  padding: theme.spacing(1.2, 3),
  borderRadius: 6,
  textTransform: 'none',
  fontSize: '14px',
  border: '1px solid #e0e0e0',
  '&:hover': {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc'
  }
}));

const SearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 6,
    backgroundColor: '#f8f9fa'
  }
}));

// TabPanel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Banner() {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [storesLoading, setStoresLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);
  const [banners, setBanners] = useState([]);
  const [zones, setZones] = useState([]);
  const [stores, setStores] = useState([]);
  const [togglingStatus, setTogglingStatus] = useState({}); // Track individual toggle states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    zone: '',
    bannerType: 'default',
    store: '',
    bannerImage: null,
    isFeatured: false,
    isActive: true,
    displayOrder: 0
  });
  const [loading, setLoading] = useState(false);

  // Base API URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch data on mount
  useEffect(() => {
    fetchBanners();
    fetchZones();
    fetchStores();
  }, []);

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setBannersLoading(true);
      const response = await fetch(`${API_BASE_URL}/banners`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBanners(data.data.banners || []);
      } else {
        throw new Error(data.message || 'Failed to fetch banners');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      showAlert('Error fetching banners', 'error');
      setBanners([]);
    } finally {
      setBannersLoading(false);
    }
  };

  // Fetch zones
  const fetchZones = async () => {
    try {
      setZonesLoading(true);
      const response = await fetch(`${API_BASE_URL}/zones`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setZones(data.data.zones || data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch zones');
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      showAlert('Error fetching zones', 'error');
      setZones([]);
    } finally {
      setZonesLoading(false);
    }
  };

  // Fetch stores
  const fetchStores = async () => {
    try {
      setStoresLoading(true);
      const response = await fetch(`${API_BASE_URL}/stores`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStores(data.data.stores || data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch stores');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      showAlert('Error fetching stores. Please try again later.', 'error');
      setStores([]);
    } finally {
      setStoresLoading(false);
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setOpen(true);
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showAlert('Please select a valid image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showAlert('Image size should be less than 5MB', 'error');
        return;
      }
      setFormData({ ...formData, bannerImage: file });
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImagePreview = () => {
    setImagePreview(null);
    setFormData({ ...formData, bannerImage: null });
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.zone) errors.push('Zone is required');
    if (!formData.bannerImage && !editingId) errors.push('Banner image is required');
    if (!['default', 'store_wise', 'zone_wise'].includes(formData.bannerType)) {
      errors.push('Invalid banner type');
    }
    if (formData.bannerType === 'store_wise' && !formData.store) {
      errors.push('Store is required for store-wise banners');
    }
    if (formData.store && !isValidObjectId(formData.store)) {
      errors.push('Invalid store ID');
    }
    if (formData.displayOrder && isNaN(parseInt(formData.displayOrder))) {
      errors.push('Display order must be a valid number');
    }
    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showAlert(validationErrors.join(', '), 'error');
      return;
    }

    try {
      setLoading(true);
      const submitFormData = new FormData();
      submitFormData.append('title', formData.title);
      submitFormData.append('description', formData.description);
      submitFormData.append('zone', formData.zone);
      submitFormData.append('bannerType', formData.bannerType);
      if (formData.store && isValidObjectId(formData.store)) {
        submitFormData.append('store', formData.store);
      }
      if (formData.bannerImage) submitFormData.append('bannerImage', formData.bannerImage);
      submitFormData.append('isFeatured', formData.isFeatured);
      submitFormData.append('isActive', formData.isActive);
      submitFormData.append('displayOrder', formData.displayOrder);

      const url = editingId ? `${API_BASE_URL}/banners/${editingId}` : `${API_BASE_URL}/banners`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: submitFormData
      });

      const data = await response.json();
      if (data.success) {
        showAlert(editingId ? 'Banner updated successfully!' : 'Banner created successfully!', 'success');
        fetchBanners();
        handleReset();
      } else {
        throw new Error(data.message || 'Failed to submit banner');
      }
    } catch (error) {
      console.error('Error submitting banner:', error);
      showAlert(`Error submitting banner: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      zone: '',
      bannerType: 'default',
      store: '',
      bannerImage: null,
      isFeatured: false,
      isActive: true,
      displayOrder: 0
    });
    setImagePreview(null);
    setEditingId(null);
    showAlert('Form reset successfully', 'info');
  };

  // Fixed toggle function
  const handleToggle = async (id, field) => {
    try {
      const banner = banners.find((b) => b._id === id);
      if (!banner) {
        throw new Error('Banner not found');
      }
      
      const newValue = !banner[field];
      const toggleKey = `${id}-${field}`;
      
      // Set individual toggle loading state
      setTogglingStatus(prev => ({ ...prev, [toggleKey]: true }));

      const response = await fetch(`${API_BASE_URL}/banners/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [field]: newValue })
      });

      const data = await response.json();
      if (data.success) {
        // Update only the specific banner in state
        setBanners((prev) =>
          prev.map((b) =>
            b._id === id ? { ...b, [field]: newValue } : b
          )
        );
        showAlert(
          `Banner ${newValue ? 'activated' : 'deactivated'} for ${field === 'isActive' ? 'status' : 'featured'} successfully`,
          'success'
        );
      } else {
        throw new Error(data.message || `Failed to toggle ${field}`);
      }
    } catch (error) {
      console.error(`Error toggling ${field}:`, error);
      showAlert(`Error toggling ${field}: ${error.message}`, 'error');
    } finally {
      // Remove individual toggle loading state
      setTogglingStatus(prev => {
        const newState = { ...prev };
        delete newState[`${id}-${field}`];
        return newState;
      });
    }
  };

  const handleEdit = async (banner) => {
    try {
      const response = await fetch(`${API_BASE_URL}/banners/${banner._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const bannerData = data.data.banner;
        setFormData({
          title: bannerData.title,
          description: bannerData.description || '',
          zone: bannerData.zone?._id || '',
          bannerType: bannerData.bannerType,
          store: bannerData.store?._id || '',
          bannerImage: null,
          isFeatured: bannerData.isFeatured,
          isActive: bannerData.isActive,
          displayOrder: bannerData.displayOrder
        });
        
        // Set image preview with proper URL
        const imageUrl = getImageUrl(bannerData.image);
        setImagePreview(imageUrl);
        
        setEditingId(banner._id);
        setTabValue(0);
        showAlert(`Editing "${banner.title}"`, 'info');
      } else {
        throw new Error(data.message || 'Failed to fetch banner');
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
      showAlert(`Error fetching banner: ${error.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    const banner = banners.find((b) => b._id === id);
    if (window.confirm(`Are you sure you want to delete "${banner?.title}"?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setBanners((prev) => prev.filter((banner) => banner._id !== id));
          showAlert(`Banner "${banner?.title}" deleted successfully`, 'success');
        } else {
          throw new Error(data.message || 'Failed to delete banner');
        }
      } catch (error) {
        console.error('Error deleting banner:', error);
        showAlert(`Error deleting banner: ${error.message}`, 'error');
      }
    }
  };

  const handleImagePreview = (imageUrl, title) => {
    if (isValidImageUrl(imageUrl)) {
      setSelectedPreviewImage({ url: imageUrl, title });
      setPreviewDialogOpen(true);
    } else {
      showAlert('Invalid image URL for preview', 'error');
    }
  };

  const filteredBanners = banners.filter((banner) =>
    banner.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <StyledPaper elevation={0}>
        {/* Main Heading */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="h4" fontWeight="bold">
            Add New Banner
          </Typography>
        </Box>

        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
          Default
        </Typography>

        <TabPanel value={tabValue} index={0}>
          <Grid container rowSpacing={3} columnSpacing={3}>
            {/* Title Field */}
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                label="Title *"
                variant="outlined"
                placeholder="Banner title"
                value={formData.title}
                onChange={handleInputChange('title')}
                required
              />
            </Grid>

            {/* Description Field */}
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                placeholder="Banner description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange('description')}
              />
            </Grid>

            {/* Banner Image Upload */}
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <Typography variant="body2" sx={{ mb: 1, color: '#ef4444', fontWeight: 500 }}>
                Banner image * (Ratio 3:1)
              </Typography>
              <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ width: '100%' }}
                >
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
              </Box>
              {imagePreview && (
                <ImagePreviewContainer>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', height: 'auto', display: 'block', cursor: 'pointer' }}
                    onClick={() => handleImagePreview(imagePreview, 'Banner Preview')}
                  />
                  <PreviewCloseButton size="small" onClick={removeImagePreview}>
                    <CloseIcon fontSize="small" />
                  </PreviewCloseButton>
                </ImagePreviewContainer>
              )}
            </Grid>

            {/* Zone Field */}
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              {zonesLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>Loading zones...</Typography>
                </Box>
              ) : (
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="zone-label">Zone *</InputLabel>
                  <Select
                    labelId="zone-label"
                    value={formData.zone}
                    onChange={handleInputChange('zone')}
                    label="Zone *"
                    required
                  >
                    <MenuItem value="">
                      <em>---Select---</em>
                    </MenuItem>
                    {zones.map((zone) => (
                      <MenuItem key={zone._id} value={zone._id}>
                        {zone.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>

            {/* Banner Type Field */}
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="banner-type-label">Banner Type</InputLabel>
                <Select
                  labelId="banner-type-label"
                  value={formData.bannerType}
                  onChange={handleInputChange('bannerType')}
                  label="Banner Type"
                >
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="store_wise">Store Wise</MenuItem>
                  <MenuItem value="zone_wise">Zone Wise</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Store Field */}
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              {formData.bannerType === 'store_wise' && (
                <>
                  {storesLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={20} />
                      <Typography>Loading stores...</Typography>
                    </Box>
                  ) : (
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="store-label">Store</InputLabel>
                      <Select
                        labelId="store-label"
                        value={formData.store}
                        onChange={handleInputChange('store')}
                        label="Store"
                      >
                        <MenuItem value="">
                          <em>---Select store---</em>
                        </MenuItem>
                        {stores.map((store) => (
                          <MenuItem key={store._id} value={store._id}>
                            {store.storeName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </>
              )}
            </Grid>

            {/* Display Order Field */}
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                label="Display Order"
                type="number"
                variant="outlined"
                value={formData.displayOrder}
                onChange={handleInputChange('displayOrder')}
                placeholder="0"
              />
            </Grid>

            {/* Action Buttons */}
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <ResetButton variant="outlined" onClick={handleReset} disabled={loading}>
                  Reset
                </ResetButton>
                <SubmitButton
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Submitting...' : editingId ? 'Update' : 'Submit'}
                </SubmitButton>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Existing Banners Section */}
        <Box sx={{ mt: 5 }}>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" fontWeight="bold">
                Existing Banners
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#14b8a6',
                  color: 'white',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {filteredBanners.length}
              </Box>
            </Box>
            <SearchTextField
              size="small"
              placeholder="Search by title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" sx={{ color: '#14b8a6' }}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: 300 }}
            />
          </Box>

          {bannersLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
              <Typography>Loading banners...</Typography>
            </Box>
          ) : filteredBanners.length > 0 ? (
            <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 8 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f7fa' }}>
                    <TableCell sx={{ fontWeight: 500 }}>SL</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>Featured</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBanners.map((banner, index) => {
                    const imageUrl = getImageUrl(banner.image);
                    return (
                      <TableRow key={banner._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {/* <img
                              src={imageUrl || 'https://via.placeholder.com/50'}
                              alt={`${banner.title} preview`}
                              style={{
                                width: 50,
                                height: 30,
                                objectFit: 'cover',
                                borderRadius: 4,
                                cursor: imageUrl ? 'pointer' : 'default',
                              }}
                              onClick={() => imageUrl && handleImagePreview(imageUrl, banner.title)}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/50';
                              }}
                            /> */}
                            <Typography>{banner.title}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{banner.bannerType || 'Unknown'}</TableCell>
                        <TableCell>
                          <Switch
                            checked={banner.isFeatured || false}
                            onChange={() => handleToggle(banner._id, 'isFeatured')}
                            color="primary"
                            disabled={togglingStatus[`${banner._id}-isFeatured`] || false}
                          />
                          {togglingStatus[`${banner._id}-isFeatured`] && (
                            <CircularProgress size={16} sx={{ ml: 1 }} />
                          )}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={banner.isActive || false}
                            onChange={() => handleToggle(banner._id, 'isActive')}
                            color="success"
                            disabled={togglingStatus[`${banner._id}-isActive`] || false}
                          />
                          {togglingStatus[`${banner._id}-isActive`] && (
                            <CircularProgress size={16} sx={{ ml: 1 }} />
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleEdit(banner)} color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(banner._id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              No banners found. Try adjusting your search or create a new banner.
            </Typography>
          )}
        </Box>
      </StyledPaper>

      {/* Alert Notification */}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={alertSeverity}
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Image Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedPreviewImage?.title || 'Image Preview'}
          <IconButton onClick={() => setPreviewDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedPreviewImage && (
            <img
              src={selectedPreviewImage.url}
              alt={selectedPreviewImage.title}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 8
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
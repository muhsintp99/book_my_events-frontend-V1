import React, { useState, useEffect, useMemo } from 'react';
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
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Utility to validate and construct image URLs
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

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

// Memoized TableRow component
const BannerTableRow = React.memo(({ banner, index, handleImagePreview, handleEdit, handleDelete, handleToggle, handleBannerClick, togglingStatus }) => {
  const imageUrl = useMemo(() => getImageUrl(banner.image), [banner.image]);

  // Format banner type for display
  const formatBannerType = (type) => {
    if (type === 'top_deal') return 'Top Deal';
    if (type === 'cash_back') return 'Cash Back';
    return type;
  };

  return (
    <TableRow key={banner._id}>
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img
            src={imageUrl || 'https://via.placeholder.com/50'}
            alt={`${banner.title} preview`}
            loading="lazy"
            style={{
              width: 50,
              height: 30,
              objectFit: 'cover',
              borderRadius: 4,
              cursor: imageUrl ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (imageUrl) {
                handleBannerClick(banner._id);
                handleImagePreview(imageUrl, banner.title);
              }
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/50';
              e.target.onerror = null;
            }}
          />
          <Typography>{banner.title}</Typography>
        </Box>
      </TableCell>
      <TableCell>{formatBannerType(banner.bannerType)}</TableCell>
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
        <IconButton onClick={() => handleEdit(banner)} color="primary" size="small">
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => handleDelete(banner._id)} color="error" size="small">
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
});

export default function Banner() {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);
  const [banners, setBanners] = useState([]);
  const [zones, setZones] = useState([]);
  const [togglingStatus, setTogglingStatus] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    zone: '',
    bannerType: 'top_deal',
    bannerImage: null,
    isFeatured: false,
    isActive: true,
    displayOrder: 0
  });
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchBanners();
    fetchZones();
  }, []);

  const fetchBanners = async () => {
    try {
      setBannersLoading(true);
      const response = await fetch(`${API_BASE_URL}/auditorium-banner`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setBanners(data.data.banners || []);
      } else {
        throw new Error(data.message || 'Failed to fetch banners');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      showAlert(`Error fetching banners: ${error.message}`, 'error');
      setBanners([]);
    } finally {
      setBannersLoading(false);
    }
  };

  const fetchZones = async () => {
    try {
      setZonesLoading(true);
      const response = await fetch(`${API_BASE_URL}/zone`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Zones response:', data); // Debug log
      if (data.data) {
        setZones(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch zones');
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      showAlert('Error fetching zones. Please ensure the zones API is available.', 'error');
      setZones([]);
    } finally {
      setZonesLoading(false);
    }
  };

  const handleBannerClick = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/auditorium-banner/${id}/click`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error recording banner click:', error);
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
      if (file.size > 2 * 1024 * 1024) {
        showAlert('Image size should be less than 2MB', 'error');
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
    if (!['top_deal', 'cash_back'].includes(formData.bannerType)) {
      errors.push('Invalid banner type');
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
      if (formData.bannerImage) submitFormData.append('image', formData.bannerImage);
      submitFormData.append('isFeatured', formData.isFeatured);
      submitFormData.append('isActive', formData.isActive);
      submitFormData.append('displayOrder', formData.displayOrder);

      const url = editingId ? `${API_BASE_URL}/auditorium-banner/${editingId}` : `${API_BASE_URL}/auditorium-banner`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: submitFormData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

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
      bannerType: 'top_deal',
      bannerImage: null,
      isFeatured: false,
      isActive: true,
      displayOrder: 0
    });
    setImagePreview(null);
    setEditingId(null);
    showAlert('Form reset successfully', 'info');
  };

  const handleToggle = async (id, field) => {
    try {
      const banner = banners.find((b) => b._id === id);
      if (!banner) {
        throw new Error('Banner not found');
      }

      const newValue = !banner[field];
      const toggleKey = `${id}-${field}`;

      setTogglingStatus(prev => ({ ...prev, [toggleKey]: true }));

      const response = await fetch(`${API_BASE_URL}/auditorium-banner/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [field]: newValue })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
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
      setTogglingStatus(prev => {
        const newState = { ...prev };
        delete newState[`${id}-${field}`];
        return newState;
      });
    }
  };

  const handleEdit = async (banner) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auditorium-banner/${banner._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        const bannerData = data.data.banner;
        setFormData({
          title: bannerData.title,
          description: bannerData.description || '',
          zone: bannerData.zone?._id || bannerData.zone || '',
          bannerType: bannerData.bannerType,
          bannerImage: null,
          isFeatured: bannerData.isFeatured,
          isActive: bannerData.isActive,
          displayOrder: bannerData.displayOrder
        });

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
        const response = await fetch(`${API_BASE_URL}/auditorium-banner/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
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

  const filteredBanners = useMemo(() => {
    return banners.filter((banner) =>
      banner.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [banners, searchQuery]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <StyledPaper elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="h4" fontWeight="bold">
            {editingId ? 'Edit Banner' : 'Add New Banner'}
          </Typography>
        </Box>

        <StyledTabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} aria-label="banner tabs">
          <Tab label="Banner Details" id="tab-0" aria-controls="tabpanel-0" />
        </StyledTabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
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

            <Grid item xs={12}>
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

            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, color: '#ef4444', fontWeight: 500 }}>
                Banner image * (Ratio 3:1, Max 2MB)
              </Typography>
              <ImageUploadArea component="label">
                <CloudUpload sx={{ fontSize: 40, color: '#14b8a6', mb: 1 }} />
                <Typography>{imagePreview ? 'Change Image' : 'Upload Image'}</Typography>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </ImageUploadArea>
              {imagePreview && (
                <ImagePreviewContainer>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', height: 'auto', display: 'block', cursor: 'pointer' }}
                    loading="lazy"
                    onClick={() => handleImagePreview(imagePreview, 'Banner Preview')}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300';
                      e.target.onerror = null;
                    }}
                  />
                  <PreviewCloseButton size="small" onClick={removeImagePreview}>
                    <CloseIcon fontSize="small" />
                  </PreviewCloseButton>
                </ImagePreviewContainer>
              )}
            </Grid>

            <Grid item xs={12}>
              {zonesLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>Loading zones...</Typography>
                </Box>
              ) : zones.length === 0 ? (
                <Alert severity="warning">No zones available. Please create zones first.</Alert>
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
                      <em>---Select Zone---</em>
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

            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="banner-type-label">Banner Type *</InputLabel>
                <Select
                  labelId="banner-type-label"
                  value={formData.bannerType}
                  onChange={handleInputChange('bannerType')}
                  label="Banner Type *"
                  required
                >
                  <MenuItem value="top_deal">Top Deal</MenuItem>
                  <MenuItem value="cash_back">Cash Back</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
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

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <ResetButton variant="outlined" onClick={handleReset} disabled={loading}>
                  Reset
                </ResetButton>
                <SubmitButton
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Submitting...' : editingId ? 'Update' : 'Submit'}
                </SubmitButton>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <Box sx={{ mt: 5 }}>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" fontWeight="bold">
                Existing Banners
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#14b8a6',
                  color: 'white',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" sx={{ color: '#14b8a6' }}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
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
            <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f7fa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>SL</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Featured</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBanners.map((banner, index) => (
                    <BannerTableRow
                      key={banner._id}
                      banner={banner}
                      index={index}
                      handleImagePreview={handleImagePreview}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                      handleToggle={handleToggle}
                      handleBannerClick={handleBannerClick}
                      togglingStatus={togglingStatus}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No banners found. {searchQuery ? 'Try adjusting your search or ' : ''}Create a new banner to get started.
              </Typography>
            </Paper>
          )}
        </Box>
      </StyledPaper>

      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={alertSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>

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
                borderRadius: 8,
              }}
              loading="lazy"
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
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = import.meta.env.VITE_API_URL ? 'https://api.bookmyevent.ae' : 'http://localhost:5000';

function VehicleBannerForm() {
  const [formData, setFormData] = useState({
    title: '',
    zone: '',
    bannerType: 'top_deal',
    link: '',
    bannerImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [banners, setBanners] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Fetch zones on component mount
  useEffect(() => {
    fetchZones();
    fetchBanners();
  }, []);

  const fetchZones = async () => {
    setZonesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/zones`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      console.log('Zones Response:', result);
      
      if (response.ok && result.data) {
        setZones(result.data);
      } else {
        showNotification('Failed to fetch zones', 'error');
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      showNotification('Error fetching zones: ' + error.message, 'error');
    } finally {
      setZonesLoading(false);
    }
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/vehicle-banners?limit=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      console.log('Vehicle Banners Response:', result);
      
      if (response.ok) {
        let bannersList = [];
        
        // Handle different response structures
        if (result.success && result.data && result.data.banners) {
          bannersList = result.data.banners;
        } else if (result.banners) {
          bannersList = result.banners;
        } else if (Array.isArray(result.data)) {
          bannersList = result.data;
        } else if (Array.isArray(result)) {
          bannersList = result;
        }

        // Process banners with proper image URL handling
        const formattedBanners = bannersList.map((banner) => {
          let imageUrl = '';
          if (banner.image) {
            // Handle full URLs
            if (banner.image.startsWith('http://') || banner.image.startsWith('https://')) {
              imageUrl = banner.image;
            } 
            // Handle absolute server paths like /var/www/backend/Uploads/...
            else if (banner.image.includes('/Uploads/')) {
              const uploadsIndex = banner.image.indexOf('/Uploads/');
              const relativePath = banner.image.substring(uploadsIndex);
              imageUrl = `${BASE_URL}${relativePath}`;
            }
            // Handle paths that start with Uploads (without leading slash)
            else if (banner.image.startsWith('Uploads/')) {
              imageUrl = `${BASE_URL}/${banner.image}`;
            }
            // Handle paths that start with /uploads (lowercase)
            else if (banner.image.startsWith('/uploads') || banner.image.startsWith('uploads')) {
              const cleanPath = banner.image.startsWith('/') ? banner.image : `/${banner.image}`;
              imageUrl = `${BASE_URL}${cleanPath}`;
            } 
            // Default case
            else {
              imageUrl = `${BASE_URL}/${banner.image}`;
            }
          }

          console.log('Vehicle Banner image processing:', {
            id: banner._id,
            original: banner.image,
            final: imageUrl
          });

          return {
            ...banner,
            image: imageUrl
          };
        });

        setBanners(formattedBanners);
      } else {
        showNotification(result.message || 'Failed to fetch vehicle banners', 'error');
      }
    } catch (error) {
      console.error('Error fetching vehicle banners:', error);
      showNotification('Error fetching vehicle banners: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, bannerImage: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.zone || !formData.bannerImage) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('zone', formData.zone);
      formDataToSend.append('bannerType', formData.bannerType);
      
      if (formData.link) {
        formDataToSend.append('link', formData.link);
      }
      
      formDataToSend.append('image', formData.bannerImage);

      const response = await fetch(`${API_BASE_URL}/vehicle-banners`, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('Create Vehicle Banner Response:', result);

      if (response.ok || result.success) {
        showNotification(result.message || 'Vehicle banner created successfully', 'success');
        setFormData({ 
          title: '', 
          zone: '', 
          bannerType: 'top_deal', 
          link: '', 
          bannerImage: null 
        });
        setImagePreview(null);
        fetchBanners();
      } else {
        showNotification(result.message || 'Failed to create vehicle banner', 'error');
      }
    } catch (error) {
      console.error('Error creating vehicle banner:', error);
      showNotification('Error creating vehicle banner: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ 
      title: '', 
      zone: '', 
      bannerType: 'top_deal', 
      link: '', 
      bannerImage: null 
    });
    setImagePreview(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle banner?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/vehicle-banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('Delete Response:', result);

      if (response.ok || result.success) {
        showNotification(result.message || 'Vehicle banner deleted successfully', 'success');
        fetchBanners();
      } else {
        showNotification(result.message || 'Failed to delete vehicle banner', 'error');
      }
    } catch (error) {
      console.error('Error deleting vehicle banner:', error);
      showNotification('Error deleting vehicle banner: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner) => {
    setFormData({
      title: banner.title,
      zone: banner.zone?._id || banner.zone || '',
      bannerType: banner.bannerType || 'top_deal',
      link: banner.link || '',
      bannerImage: null,
    });
    if (banner.image) {
      setImagePreview(banner.image);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: '#f5f7fa',
        borderRadius: 2,
        boxShadow: 1,
        minHeight: '100vh',
      }}
    >
      <Box sx={{ mb: 4, fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
        Add New Vehicle Banner
      </Box>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <TextField
          fullWidth
          name="title"
          label="Vehicle Banner Title *"
          value={formData.title}
          onChange={handleInputChange}
          required
          variant="outlined"
          sx={{ mb: 3, bgcolor: 'white' }}
          disabled={loading}
        />
        
        <FormControl fullWidth variant="outlined" sx={{ mb: 3, bgcolor: 'white' }}>
          <InputLabel id="zone-label">Select Zone *</InputLabel>
          <Select
            name="zone"
            labelId="zone-label"
            value={formData.zone}
            onChange={handleInputChange}
            label="Select Zone *"
            required
            disabled={loading || zonesLoading}
          >
            <MenuItem value="">--Select Zone--</MenuItem>
            {zones.map((zone) => (
              <MenuItem key={zone._id} value={zone._id}>
                {zone.name}
              </MenuItem>
            ))}
          </Select>
          {zonesLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <CircularProgress size={20} />
            </Box>
          )}
        </FormControl>
        
        <FormControl fullWidth variant="outlined" sx={{ mb: 3, bgcolor: 'white' }}>
          <InputLabel id="banner-type-label">Banner Type *</InputLabel>
          <Select
            name="bannerType"
            labelId="banner-type-label"
            value={formData.bannerType}
            onChange={handleInputChange}
            label="Banner Type *"
            required
            disabled={loading}
          >
            <MenuItem value="top_deal">Top Deal</MenuItem>
            <MenuItem value="cash_back">Cash Back</MenuItem>
            <MenuItem value="zone_wise">Zone Wise</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          name="link"
          label="Banner Link (Optional)"
          value={formData.link}
          onChange={handleInputChange}
          variant="outlined"
          sx={{ mb: 3, bgcolor: 'white' }}
          disabled={loading}
          placeholder="https://example.com"
        />
        
        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 1,
            p: 4,
            textAlign: 'center',
            bgcolor: '#fff',
            mb: 3,
            cursor: loading ? 'not-allowed' : 'pointer',
            '&:hover': { borderColor: loading ? '#ccc' : '#999' },
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="image-upload"
            disabled={loading}
          />
          <label htmlFor="image-upload" style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
            <Box sx={{ color: '#666' }}>
              {imagePreview ? (
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={imagePreview}
                    alt="Vehicle Banner Preview"
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px', 
                      objectFit: 'contain' 
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, bannerImage: null }));
                    }}
                    sx={{ mt: 2 }}
                    disabled={loading}
                  >
                    Remove Image
                  </Button>
                </Box>
              ) : (
                <>
                  <Box sx={{ fontSize: '1rem', mb: 1 }}>Click to upload *</Box>
                  <Box sx={{ color: '#999', fontSize: '0.875rem' }}>Or drag and drop</Box>
                  <Box sx={{ color: '#999', fontSize: '0.875rem', mt: 1 }}>
                    JPG, JPEG, PNG (Ratio 3:1)
                  </Box>
                </>
              )}
            </Box>
          </label>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Button 
            variant="contained" 
            type="submit" 
            color="primary" 
            sx={{ minWidth: 120, height: 45 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleCancel} 
            color="primary" 
            sx={{ minWidth: 120, height: 45 }}
            disabled={loading}
          >
            Cancel
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 6 }}>
        <Box sx={{ mb: 3, fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
          Existing Vehicle Banners
        </Box>
        
        {loading && banners.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Zone</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {banners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#999' }}>
                      No vehicle banners found. Create your first vehicle banner above.
                    </TableCell>
                  </TableRow>
                ) : (
                  banners.map((banner) => (
                    <TableRow key={banner._id} hover>
                      <TableCell>
                        <Box
                          sx={{
                            width: 100,
                            height: 60,
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid #e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#f5f5f5'
                          }}
                        >
                          {banner.image ? (
                            <img
                              src={banner.image}
                              alt={banner.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                              onError={(e) => {
                                console.error('Image load error for:', banner.image);
                                e.target.style.display = 'none';
                                const parent = e.target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f5f5;color:#999;font-size:0.7rem;">No Image</div>';
                                }
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: '#f5f5f5',
                                color: '#999',
                                fontSize: '0.7rem',
                              }}
                            >
                              No Image
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{banner.title}</TableCell>
                      <TableCell>{banner.zone?.name || 'N/A'}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>
                        {banner.bannerType?.replace('_', ' ') || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: banner.isActive ? '#4caf50' : '#f44336',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 'medium',
                          }}
                        >
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEdit(banner)}
                          disabled={loading}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(banner._id)}
                          disabled={loading}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default VehicleBannerForm;
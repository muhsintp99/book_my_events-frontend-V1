import React, { useState } from 'react';
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

function BannerForm() {
  const [formData, setFormData] = useState({
    title: '',
    zone: '',
    bannerType: 'top_deal',
    link: '',
    bannerImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Sample data for UI demonstration
  const zones = [
    { _id: '1', name: 'Zone 1' },
    { _id: '2', name: 'Zone 2' },
    { _id: '3', name: 'Zone 3' },
  ];

  const banners = [
    {
      _id: '1',
      title: 'Summer Sale',
      zone: { name: 'Zone 1' },
      bannerType: 'top_deal',
      isActive: true,
      image: 'https://via.placeholder.com/300x100',
    },
    {
      _id: '2',
      title: 'Cashback Offer',
      zone: { name: 'Zone 2' },
      bannerType: 'cash_back',
      isActive: false,
      image: 'https://via.placeholder.com/300x100',
    },
  ];

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
      if (file.size > 2 * 1024 * 1024) {
        showNotification('Image size should be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, bannerImage: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.zone || !formData.bannerImage) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    showNotification('Banner created successfully', 'success');
    handleCancel();
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

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }
    showNotification('Banner deleted successfully', 'success');
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
        Add New Banner
      </Box>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <TextField
          fullWidth
          name="title"
          label="Banner Title *"
          value={formData.title}
          onChange={handleInputChange}
          required
          variant="outlined"
          sx={{ mb: 3, bgcolor: 'white' }}
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
          >
            <MenuItem value="">--Select Zone--</MenuItem>
            {zones.map((zone) => (
              <MenuItem key={zone._id} value={zone._id}>
                {zone.name}
              </MenuItem>
            ))}
          </Select>
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
            cursor: 'pointer',
            '&:hover': { borderColor: '#999' },
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
            <Box sx={{ color: '#666' }}>
              {imagePreview ? (
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={imagePreview}
                    alt="Banner Preview"
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
                  >
                    Remove Image
                  </Button>
                </Box>
              ) : (
                <>
                  <Box sx={{ fontSize: '1rem', mb: 1 }}>Click to upload *</Box>
                  <Box sx={{ color: '#999', fontSize: '0.875rem' }}>Or drag and drop</Box>
                  <Box sx={{ color: '#999', fontSize: '0.875rem', mt: 1 }}>
                    JPG, JPEG, PNG Less Than 2MB (Ratio 3:1)
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
          >
            Submit
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleCancel} 
            color="primary" 
            sx={{ minWidth: 120, height: 45 }}
          >
            Cancel
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 6 }}>
        <Box sx={{ mb: 3, fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
          Existing Banners
        </Box>
        
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
              {banners.map((banner) => (
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
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(banner._id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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

export default BannerForm;
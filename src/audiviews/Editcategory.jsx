import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Tab,
  Tabs,
  TextField,
  Typography,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link
} from "@mui/material";
import {
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";

export default function EditCategory() {
  const { id } = useParams(); // get category id from url
  const navigate = useNavigate();

  // Mock data for the specific category being edited
  const [mockCategories] = useState([
    { 
      id: 11, 
      names: { 
        default: 'Luxury Minibus', 
        english: 'Luxury Minibus', 
        arabic: 'حافلة صغيرة فاخرة' 
      }, 
      status: true,
      image: null
    },
    { 
      id: 10, 
      names: { 
        default: 'Crossover', 
        english: 'Crossover', 
        arabic: 'كروس أوفر' 
      }, 
      status: true,
      image: null
    }
  ]);

  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    id: '',
    names: {
      default: '',
      english: '',
      arabic: ''
    },
    status: true,
    image: null
  });
  const [originalData, setOriginalData] = useState({});
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Notification states
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Language tabs configuration
  const languageTabs = [
    { key: 'default', label: 'Default' },
    { key: 'english', label: 'English(EN)' },
    { key: 'arabic', label: 'Arabic - العربية(AR)' }
  ];

  useEffect(() => {
    // Simulate API fetch based on ID
    const categoryToEdit = mockCategories.find(cat => cat.id === parseInt(id));
    
    if (categoryToEdit) {
      setFormData(categoryToEdit);
      setOriginalData(categoryToEdit);
      if (categoryToEdit.image) {
        setImagePreview(categoryToEdit.image);
      }
    } else {
      showNotification(`Category with ID ${id} not found`, 'error');
      // Redirect back to category list after 2 seconds
      setTimeout(() => {
        navigate('/vehicles/category');
      }, 2000);
    }
  }, [id, navigate, mockCategories]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleNameChange = (language, value) => {
    setFormData(prev => ({
      ...prev,
      names: {
        ...prev.names,
        [language]: value
      }
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('File size should be less than 5MB', 'error');
        return;
      }

      setUploadedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData(prev => ({
          ...prev,
          image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setImagePreview(originalData.image);
    setUploadedImage(null);
    // Reset file input
    const fileInput = document.getElementById('edit-image-upload-input');
    if (fileInput) fileInput.value = '';
    showNotification('Form reset to original values', 'info');
  };

  const handleUpdate = () => {
    // Validate required fields
    if (!formData.names.default.trim()) {
      showNotification('Please enter a category name in Default language', 'error');
      return;
    }

    // Here you would normally send API request to update the category
    console.log("Updated category:", formData);
    
    showNotification(`Category "${formData.names.default}" updated successfully!`, 'success');
    
    // Navigate back to category list after successful update
    setTimeout(() => {
      navigate('/vehicles/category');
    }, 1500);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setUploadedImage(null);
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    // Reset file input
    const fileInput = document.getElementById('edit-image-upload-input');
    if (fileInput) fileInput.value = '';
  };

  // Show notification
  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Handle back navigation
  const handleBackToList = () => {
    navigate('/vehicles/category');
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#f5f5f5', p: { xs: 2, sm: 3 } }}>
      
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link 
            color="inherit" 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Link 
            color="inherit" 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('/vehicles/category'); }}
            sx={{ textDecoration: 'none' }}
          >
            Category Management
          </Link>
          <Typography color="text.primary">Edit Category</Typography>
        </Breadcrumbs>
      </Box>

      {/* Main Edit Form */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ width: '100%', maxWidth: '1400px', boxShadow: 3, borderRadius: 3 }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton 
                  onClick={handleBackToList}
                  sx={{ 
                    backgroundColor: '#e3f2fd',
                    '&:hover': { backgroundColor: '#bbdefb' }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight="bold">
                  ✏️ Update Category (ID: {id})
                </Typography>
              </Box>
            }
            sx={{ borderBottom: '1px solid #e0e0e0' }}
          />

          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            <Grid container spacing={4}>
              {/* Left Section - Tabs & Fields */}
              <Grid item xs={12} md={8}>
                {/* Tabs */}
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
                  {languageTabs.map((tab, index) => (
                    <Tab key={tab.key} label={tab.label} />
                  ))}
                </Tabs>

                {/* Dynamic Name Input based on selected tab */}
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  Name ({languageTabs[tabValue].label}) <span style={{ color: '#f44336' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  value={formData.names?.[languageTabs[tabValue].key] || ''}
                  onChange={(e) => handleNameChange(languageTabs[tabValue].key, e.target.value)}
                  placeholder={`Enter category name in ${languageTabs[tabValue].label}`}
                  variant="outlined"
                  sx={{ 
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      direction: languageTabs[tabValue].key === 'arabic' ? 'rtl' : 'ltr'
                    }
                  }}
                />
              </Grid>

              {/* Right Section - Image Upload */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Image <span style={{ color: '#f44336' }}>*</span>{' '}
                    <span style={{ color: '#e91e63', fontSize: '0.875rem' }}>( Ratio 1:1)</span>
                  </Typography>
                  
                  <Box
                    sx={{
                      width: 200,
                      height: 200,
                      border: "2px dashed #e0e0e0",
                      borderRadius: 2,
                      position: "relative",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                      backgroundColor: '#fafafa'
                    }}
                  >
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={handleRemoveImage}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            color: "white",
                            '&:hover': { backgroundColor: "rgba(0,0,0,0.7)" }
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          component="label"
                          sx={{
                            position: "absolute",
                            bottom: 8,
                            right: 8,
                            backgroundColor: "rgba(33, 150, 243, 0.8)",
                            color: "white",
                            '&:hover': { backgroundColor: "rgba(33, 150, 243, 1)" }
                          }}
                        >
                          <EditIcon fontSize="small" />
                          <input
                            id="edit-image-upload-input"
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </IconButton>
                      </>
                    ) : (
                      <Box sx={{ textAlign: 'center' }}>
                        <input
                          id="edit-image-upload-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="edit-image-upload-input">
                          <Button
                            component="span"
                            variant="outlined"
                            sx={{
                              width: 180,
                              height: 180,
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
                              Upload Image
                            </Typography>
                          </Button>
                        </label>
                      </Box>
                    )}
                  </Box>
                  
                  {uploadedImage && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                      {uploadedImage.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: { xs: 'center', sm: 'flex-end' }, 
              gap: 2,
              mt: 4,
              pt: 3,
              borderTop: '1px solid #e0e0e0'
            }}>
              <Button
                variant="outlined"
                onClick={handleBackToList}
                startIcon={<ArrowBackIcon />}
                sx={{
                  px: 3, py: 1.5, textTransform: 'none',
                  borderColor: '#e0e0e0', color: '#666',
                  '&:hover': { borderColor: '#bdbdbd', backgroundColor: '#f5f5f5' }
                }}
              >
                Back to List
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{
                  px: 4, py: 1.5, textTransform: 'none',
                  borderColor: '#ff9800', color: '#ff9800',
                  '&:hover': { borderColor: '#f57c00', backgroundColor: '#fff3e0' }
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdate}
                disabled={!formData.names?.default?.trim()}
                sx={{
                  px: 4, py: 1.5,
                  backgroundColor: '#00695c', textTransform: 'none',
                  '&:hover': { backgroundColor: '#004d40' },
                  '&:disabled': { backgroundColor: '#e0e0e0', color: '#999' }
                }}
              >
                Update Category
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Notification Snackbar */}
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
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
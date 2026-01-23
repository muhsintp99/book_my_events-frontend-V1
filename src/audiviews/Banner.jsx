// // import React, { useState, useEffect, useMemo } from 'react';
// // import {
// //   Box,
// //   Tabs,
// //   Tab,
// //   Table,
// //   TableHead,
// //   TableRow,
// //   TableCell,
// //   TableBody,
// //   Switch,
// //   TextField,
// //   TableContainer,
// //   Select,
// //   MenuItem,
// //   FormControl,
// //   InputLabel,
// //   Button,
// //   Typography,
// //   Paper,
// //   Grid,
// //   CircularProgress,
// //   Snackbar,
// //   Alert,
// //   Divider,
// //   IconButton,
// //   InputAdornment,
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogActions
// // } from '@mui/material';
// // import { styled } from '@mui/material/styles';
// // import {
// //   CloudUpload,
// //   Search as SearchIcon,
// //   Edit as EditIcon,
// //   Delete as DeleteIcon,
// //   Close as CloseIcon
// // } from '@mui/icons-material';

// // // Utility to validate and construct image URLs
// // const getImageUrl = (imagePath) => {
// //   if (!imagePath) return null;

// //   if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:image/')) {
// //     return imagePath;
// //   }

// //   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// //   return `${API_BASE_URL}/${imagePath.replace(/^\/+/, '')}`;
// // };

// // // Utility to validate image URLs
// // const isValidImageUrl = (url) => {
// //   if (!url) return false;
// //   return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/');
// // };

// // // Styled components
// // const StyledPaper = styled(Paper)(({ theme }) => ({
// //   padding: theme.spacing(3),
// //   margin: theme.spacing(2),
// //   backgroundColor: '#ffffff',
// //   boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
// //   borderRadius: 8
// // }));

// // const StyledTabs = styled(Tabs)(({ theme }) => ({
// //   borderBottom: '1px solid #e0e0e0',
// //   '& .MuiTab-root': {
// //     textTransform: 'none',
// //     minWidth: 120,
// //     fontWeight: 500,
// //     fontSize: '14px'
// //   },
// //   '& .Mui-selected': {
// //     color: '#14b8a6'
// //   },
// //   '& .MuiTabs-indicator': {
// //     backgroundColor: '#14b8a6'
// //   }
// // }));

// // const ImageUploadArea = styled(Box)(({ theme }) => ({
// //   border: '2px dashed #e0e0e0',
// //   borderRadius: 8,
// //   padding: theme.spacing(6),
// //   textAlign: 'center',
// //   backgroundColor: '#f8fffe',
// //   cursor: 'pointer',
// //   transition: 'all 0.3s ease',
// //   minHeight: 150,
// //   display: 'flex',
// //   flexDirection: 'column',
// //   alignItems: 'center',
// //   justifyContent: 'center',
// //   '&:hover': {
// //     borderColor: '#14b8a6',
// //     backgroundColor: '#f0fdfa'
// //   }
// // }));

// // const ImagePreviewContainer = styled(Box)(({ theme }) => ({
// //   position: 'relative',
// //   maxWidth: 300,
// //   marginTop: theme.spacing(2),
// //   border: '1px solid #e0e0e0',
// //   borderRadius: 8,
// //   overflow: 'hidden'
// // }));

// // const PreviewCloseButton = styled(IconButton)(({ theme }) => ({
// //   position: 'absolute',
// //   top: 4,
// //   right: 4,
// //   backgroundColor: 'rgba(0,0,0,0.5)',
// //   color: 'white',
// //   '&:hover': {
// //     backgroundColor: 'rgba(0,0,0,0.7)'
// //   }
// // }));

// // const SubmitButton = styled(Button)(({ theme }) => ({
// //   backgroundColor: '#14b8a6',
// //   color: 'white',
// //   fontWeight: 600,
// //   padding: theme.spacing(1.2, 4),
// //   borderRadius: 6,
// //   textTransform: 'none',
// //   fontSize: '14px',
// //   '&:hover': {
// //     backgroundColor: '#0f9488'
// //   }
// // }));

// // const ResetButton = styled(Button)(({ theme }) => ({
// //   color: '#666',
// //   fontWeight: 500,
// //   padding: theme.spacing(1.2, 3),
// //   borderRadius: 6,
// //   textTransform: 'none',
// //   fontSize: '14px',
// //   border: '1px solid #e0e0e0',
// //   '&:hover': {
// //     backgroundColor: '#f5f5f5',
// //     borderColor: '#ccc'
// //   }
// // }));

// // const SearchTextField = styled(TextField)(({ theme }) => ({
// //   '& .MuiOutlinedInput-root': {
// //     borderRadius: 6,
// //     backgroundColor: '#f8f9fa'
// //   }
// // }));

// // // TabPanel component
// // function TabPanel({ children, value, index, ...other }) {
// //   return (
// //     <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
// //       {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
// //     </div>
// //   );
// // }

// // // Memoized TableRow component
// // const BannerTableRow = React.memo(({ banner, index, handleImagePreview, handleEdit, handleDelete, handleToggle, handleBannerClick, togglingStatus }) => {
// //   const imageUrl = useMemo(() => getImageUrl(banner.image), [banner.image]);

// //   // Format banner type for display
// //   const formatBannerType = (type) => {
// //     if (type === 'top_deal') return 'Top Deal';
// //     if (type === 'cash_back') return 'Cash Back';
// //     return type;
// //   };

// //   return (
// //     <TableRow key={banner._id}>
// //       <TableCell>{index + 1}</TableCell>
// //       <TableCell>
// //         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
// //           <img
// //             src={imageUrl || 'https://via.placeholder.com/50'}
// //             alt={`${banner.title} preview`}
// //             loading="lazy"
// //             style={{
// //               width: 50,
// //               height: 30,
// //               objectFit: 'cover',
// //               borderRadius: 4,
// //               cursor: imageUrl ? 'pointer' : 'default',
// //             }}
// //             onClick={() => {
// //               if (imageUrl) {
// //                 handleBannerClick(banner._id);
// //                 handleImagePreview(imageUrl, banner.title);
// //               }
// //             }}
// //             onError={(e) => {
// //               e.target.src = 'https://via.placeholder.com/50';
// //               e.target.onerror = null;
// //             }}
// //           />
// //           <Typography>{banner.title}</Typography>
// //         </Box>
// //       </TableCell>
// //       <TableCell>{formatBannerType(banner.bannerType)}</TableCell>
// //       <TableCell>
// //         <Switch
// //           checked={banner.isFeatured || false}
// //           onChange={() => handleToggle(banner._id, 'isFeatured')}
// //           color="primary"
// //           disabled={togglingStatus[`${banner._id}-isFeatured`] || false}
// //         />
// //         {togglingStatus[`${banner._id}-isFeatured`] && (
// //           <CircularProgress size={16} sx={{ ml: 1 }} />
// //         )}
// //       </TableCell>
// //       <TableCell>
// //         <Switch
// //           checked={banner.isActive || false}
// //           onChange={() => handleToggle(banner._id, 'isActive')}
// //           color="success"
// //           disabled={togglingStatus[`${banner._id}-isActive`] || false}
// //         />
// //         {togglingStatus[`${banner._id}-isActive`] && (
// //           <CircularProgress size={16} sx={{ ml: 1 }} />
// //         )}
// //       </TableCell>
// //       <TableCell>
// //         <IconButton onClick={() => handleEdit(banner)} color="primary" size="small">
// //           <EditIcon />
// //         </IconButton>
// //         <IconButton onClick={() => handleDelete(banner._id)} color="error" size="small">
// //           <DeleteIcon />
// //         </IconButton>
// //       </TableCell>
// //     </TableRow>
// //   );
// // });

// // export default function Banner() {
// //   const [tabValue, setTabValue] = useState(0);
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [editingId, setEditingId] = useState(null);
// //   const [imagePreview, setImagePreview] = useState(null);
// //   const [bannersLoading, setBannersLoading] = useState(true);
// //   const [zonesLoading, setZonesLoading] = useState(true);
// //   const [open, setOpen] = useState(false);
// //   const [alertMessage, setAlertMessage] = useState('');
// //   const [alertSeverity, setAlertSeverity] = useState('success');
// //   const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
// //   const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);
// //   const [banners, setBanners] = useState([]);
// //   const [zones, setZones] = useState([]);
// //   const [togglingStatus, setTogglingStatus] = useState({});
// //   const [formData, setFormData] = useState({
// //     title: '',
// //     description: '',
// //     zone: '',
// //     bannerType: 'top_deal',
// //     bannerImage: null,
// //     isFeatured: false,
// //     isActive: true,
// //     displayOrder: 0
// //   });
// //   const [loading, setLoading] = useState(false);

// //   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// //   useEffect(() => {
// //     fetchBanners();
// //     fetchZones();
// //   }, []);

// //   const fetchBanners = async () => {
// //     try {
// //       setBannersLoading(true);
// //       const response = await fetch(`${API_BASE_URL}/auditorium-banner`, {
// //         headers: {
// //           Authorization: `Bearer ${localStorage.getItem('token')}`
// //         }
// //       });
// //       if (!response.ok) {
// //         throw new Error(`HTTP error! Status: ${response.status}`);
// //       }
// //       const data = await response.json();
// //       if (data.success) {
// //         setBanners(data.data.banners || []);
// //       } else {
// //         throw new Error(data.message || 'Failed to fetch banners');
// //       }
// //     } catch (error) {
// //       console.error('Error fetching banners:', error);
// //       showAlert(`Error fetching banners: ${error.message}`, 'error');
// //       setBanners([]);
// //     } finally {
// //       setBannersLoading(false);
// //     }
// //   };

// //   const fetchZones = async () => {
// //     try {
// //       setZonesLoading(true);
// //       const response = await fetch(`${API_BASE_URL}/zone`, {
// //         headers: {
// //           Authorization: `Bearer ${localStorage.getItem('token')}`
// //         }
// //       });
// //       if (!response.ok) {
// //         throw new Error(`HTTP error! Status: ${response.status}`);
// //       }
// //       const data = await response.json();
// //       console.log('Zones response:', data); // Debug log
// //       if (data.data) {
// //         setZones(data.data || []);
// //       } else {
// //         throw new Error(data.message || 'Failed to fetch zones');
// //       }
// //     } catch (error) {
// //       console.error('Error fetching zones:', error);
// //       showAlert('Error fetching zones. Please ensure the zones API is available.', 'error');
// //       setZones([]);
// //     } finally {
// //       setZonesLoading(false);
// //     }
// //   };

// //   const handleBannerClick = async (id) => {
// //     try {
// //       await fetch(`${API_BASE_URL}/auditorium-banner/${id}/click`, {
// //         method: 'PATCH',
// //         headers: {
// //           'Content-Type': 'application/json'
// //         }
// //       });
// //     } catch (error) {
// //       console.error('Error recording banner click:', error);
// //     }
// //   };

// //   const showAlert = (message, severity = 'success') => {
// //     setAlertMessage(message);
// //     setAlertSeverity(severity);
// //     setOpen(true);
// //   };

// //   const handleInputChange = (field) => (event) => {
// //     setFormData({
// //       ...formData,
// //       [field]: event.target.value
// //     });
// //   };

// //   const handleImageUpload = (event) => {
// //     const file = event.target.files[0];
// //     if (file) {
// //       if (!file.type.startsWith('image/')) {
// //         showAlert('Please select a valid image file', 'error');
// //         return;
// //       }
// //       if (file.size > 2 * 1024 * 1024) {
// //         showAlert('Image size should be less than 2MB', 'error');
// //         return;
// //       }
// //       setFormData({ ...formData, bannerImage: file });
// //       const reader = new FileReader();
// //       reader.onload = (e) => setImagePreview(e.target.result);
// //       reader.readAsDataURL(file);
// //     }
// //   };

// //   const removeImagePreview = () => {
// //     setImagePreview(null);
// //     setFormData({ ...formData, bannerImage: null });
// //   };

// //   const validateForm = () => {
// //     const errors = [];
// //     if (!formData.title.trim()) errors.push('Title is required');
// //     if (!formData.zone) errors.push('Zone is required');
// //     if (!formData.bannerImage && !editingId) errors.push('Banner image is required');
// //     if (!['top_deal', 'cash_back'].includes(formData.bannerType)) {
// //       errors.push('Invalid banner type');
// //     }
// //     if (formData.displayOrder && isNaN(parseInt(formData.displayOrder))) {
// //       errors.push('Display order must be a valid number');
// //     }
// //     return errors;
// //   };

// //   const handleSubmit = async () => {
// //     const validationErrors = validateForm();
// //     if (validationErrors.length > 0) {
// //       showAlert(validationErrors.join(', '), 'error');
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       const submitFormData = new FormData();
// //       submitFormData.append('title', formData.title);
// //       submitFormData.append('description', formData.description);
// //       submitFormData.append('zone', formData.zone);
// //       submitFormData.append('bannerType', formData.bannerType);
// //       if (formData.bannerImage) submitFormData.append('image', formData.bannerImage);
// //       submitFormData.append('isFeatured', formData.isFeatured);
// //       submitFormData.append('isActive', formData.isActive);
// //       submitFormData.append('displayOrder', formData.displayOrder);

// //       const url = editingId ? `${API_BASE_URL}/auditorium-banner/${editingId}` : `${API_BASE_URL}/auditorium-banner`;
// //       const method = editingId ? 'PUT' : 'POST';

// //       const response = await fetch(url, {
// //         method,
// //         headers: {
// //           Authorization: `Bearer ${localStorage.getItem('token')}`
// //         },
// //         body: submitFormData
// //       });

// //       if (!response.ok) {
// //         throw new Error(`HTTP error! Status: ${response.status}`);
// //       }

// //       const data = await response.json();
// //       if (data.success) {
// //         showAlert(editingId ? 'Banner updated successfully!' : 'Banner created successfully!', 'success');
// //         fetchBanners();
// //         handleReset();
// //       } else {
// //         throw new Error(data.message || 'Failed to submit banner');
// //       }
// //     } catch (error) {
// //       console.error('Error submitting banner:', error);
// //       showAlert(`Error submitting banner: ${error.message}`, 'error');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleReset = () => {
// //     setFormData({
// //       title: '',
// //       description: '',
// //       zone: '',
// //       bannerType: 'top_deal',
// //       bannerImage: null,
// //       isFeatured: false,
// //       isActive: true,
// //       displayOrder: 0
// //     });
// //     setImagePreview(null);
// //     setEditingId(null);
// //     showAlert('Form reset successfully', 'info');
// //   };

// //   const handleToggle = async (id, field) => {
// //     try {
// //       const banner = banners.find((b) => b._id === id);
// //       if (!banner) {
// //         throw new Error('Banner not found');
// //       }

// //       const newValue = !banner[field];
// //       const toggleKey = `${id}-${field}`;

// //       setTogglingStatus(prev => ({ ...prev, [toggleKey]: true }));

// //       const response = await fetch(`${API_BASE_URL}/auditorium-banner/${id}/toggle-status`, {
// //         method: 'PATCH',
// //         headers: {
// //           Authorization: `Bearer ${localStorage.getItem('token')}`,
// //           'Content-Type': 'application/json'
// //         },
// //         body: JSON.stringify({ [field]: newValue })
// //       });

// //       if (!response.ok) {
// //         throw new Error(`HTTP error! Status: ${response.status}`);
// //       }

// //       const data = await response.json();
// //       if (data.success) {
// //         setBanners((prev) =>
// //           prev.map((b) =>
// //             b._id === id ? { ...b, [field]: newValue } : b
// //           )
// //         );
// //         showAlert(
// //           `Banner ${newValue ? 'activated' : 'deactivated'} for ${field === 'isActive' ? 'status' : 'featured'} successfully`,
// //           'success'
// //         );
// //       } else {
// //         throw new Error(data.message || `Failed to toggle ${field}`);
// //       }
// //     } catch (error) {
// //       console.error(`Error toggling ${field}:`, error);
// //       showAlert(`Error toggling ${field}: ${error.message}`, 'error');
// //     } finally {
// //       setTogglingStatus(prev => {
// //         const newState = { ...prev };
// //         delete newState[`${id}-${field}`];
// //         return newState;
// //       });
// //     }
// //   };

// //   const handleEdit = async (banner) => {
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/auditorium-banner/${banner._id}`, {
// //         headers: {
// //           Authorization: `Bearer ${localStorage.getItem('token')}`
// //         }
// //       });
// //       if (!response.ok) {
// //         throw new Error(`HTTP error! Status: ${response.status}`);
// //       }
// //       const data = await response.json();
// //       if (data.success) {
// //         const bannerData = data.data.banner;
// //         setFormData({
// //           title: bannerData.title,
// //           description: bannerData.description || '',
// //           zone: bannerData.zone?._id || bannerData.zone || '',
// //           bannerType: bannerData.bannerType,
// //           bannerImage: null,
// //           isFeatured: bannerData.isFeatured,
// //           isActive: bannerData.isActive,
// //           displayOrder: bannerData.displayOrder
// //         });

// //         const imageUrl = getImageUrl(bannerData.image);
// //         setImagePreview(imageUrl);

// //         setEditingId(banner._id);
// //         setTabValue(0);
// //         showAlert(`Editing "${banner.title}"`, 'info');
// //       } else {
// //         throw new Error(data.message || 'Failed to fetch banner');
// //       }
// //     } catch (error) {
// //       console.error('Error fetching banner:', error);
// //       showAlert(`Error fetching banner: ${error.message}`, 'error');
// //     }
// //   };

// //   const handleDelete = async (id) => {
// //     const banner = banners.find((b) => b._id === id);
// //     if (window.confirm(`Are you sure you want to delete "${banner?.title}"?`)) {
// //       try {
// //         const response = await fetch(`${API_BASE_URL}/auditorium-banner/${id}`, {
// //           method: 'DELETE',
// //           headers: {
// //             Authorization: `Bearer ${localStorage.getItem('token')}`
// //           }
// //         });
// //         if (!response.ok) {
// //           throw new Error(`HTTP error! Status: ${response.status}`);
// //         }
// //         const data = await response.json();
// //         if (data.success) {
// //           setBanners((prev) => prev.filter((banner) => banner._id !== id));
// //           showAlert(`Banner "${banner?.title}" deleted successfully`, 'success');
// //         } else {
// //           throw new Error(data.message || 'Failed to delete banner');
// //         }
// //       } catch (error) {
// //         console.error('Error deleting banner:', error);
// //         showAlert(`Error deleting banner: ${error.message}`, 'error');
// //       }
// //     }
// //   };

// //   const handleImagePreview = (imageUrl, title) => {
// //     if (isValidImageUrl(imageUrl)) {
// //       setSelectedPreviewImage({ url: imageUrl, title });
// //       setPreviewDialogOpen(true);
// //     } else {
// //       showAlert('Invalid image URL for preview', 'error');
// //     }
// //   };

// //   const filteredBanners = useMemo(() => {
// //     return banners.filter((banner) =>
// //       banner.title.toLowerCase().includes(searchQuery.toLowerCase())
// //     );
// //   }, [banners, searchQuery]);

// //   return (
// //     <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
// //       <StyledPaper elevation={0}>
// //         <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
// //           <Typography variant="h4" fontWeight="bold">
// //             {editingId ? 'Edit Banner' : 'Add New Banner'}
// //           </Typography>
// //         </Box>

// //         <StyledTabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} aria-label="banner tabs">
// //           <Tab label="Banner Details" id="tab-0" aria-controls="tabpanel-0" />
// //         </StyledTabs>

// //         <TabPanel value={tabValue} index={0}>
// //           <Grid container spacing={3}>
// //             <Grid item xs={12}>
// //               <TextField
// //                 fullWidth
// //                 label="Title *"
// //                 variant="outlined"
// //                 placeholder="Banner title"
// //                 value={formData.title}
// //                 onChange={handleInputChange('title')}
// //                 required
// //               />
// //             </Grid>

// //             <Grid item xs={12}>
// //               <TextField
// //                 fullWidth
// //                 label="Description"
// //                 variant="outlined"
// //                 placeholder="Banner description"
// //                 multiline
// //                 rows={3}
// //                 value={formData.description}
// //                 onChange={handleInputChange('description')}
// //               />
// //             </Grid>

// //             <Grid item xs={12}>
// //               <Typography variant="body2" sx={{ mb: 1, color: '#ef4444', fontWeight: 500 }}>
// //                 Banner image * (Ratio 3:1, Max 2MB)
// //               </Typography>
// //               <ImageUploadArea component="label">
// //                 <CloudUpload sx={{ fontSize: 40, color: '#14b8a6', mb: 1 }} />
// //                 <Typography>{imagePreview ? 'Change Image' : 'Upload Image'}</Typography>
// //                 <input
// //                   type="file"
// //                   hidden
// //                   accept="image/*"
// //                   onChange={handleImageUpload}
// //                 />
// //               </ImageUploadArea>
// //               {imagePreview && (
// //                 <ImagePreviewContainer>
// //                   <img
// //                     src={imagePreview}
// //                     alt="Preview"
// //                     style={{ width: '100%', height: 'auto', display: 'block', cursor: 'pointer' }}
// //                     loading="lazy"
// //                     onClick={() => handleImagePreview(imagePreview, 'Banner Preview')}
// //                     onError={(e) => {
// //                       e.target.src = 'https://via.placeholder.com/300';
// //                       e.target.onerror = null;
// //                     }}
// //                   />
// //                   <PreviewCloseButton size="small" onClick={removeImagePreview}>
// //                     <CloseIcon fontSize="small" />
// //                   </PreviewCloseButton>
// //                 </ImagePreviewContainer>
// //               )}
// //             </Grid>

// //             <Grid item xs={12}>
// //               {zonesLoading ? (
// //                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
// //                   <CircularProgress size={20} />
// //                   <Typography>Loading zones...</Typography>
// //                 </Box>
// //               ) : zones.length === 0 ? (
// //                 <Alert severity="warning">No zones available. Please create zones first.</Alert>
// //               ) : (
// //                 <FormControl fullWidth variant="outlined">
// //                   <InputLabel id="zone-label">Zone *</InputLabel>
// //                   <Select
// //                     labelId="zone-label"
// //                     value={formData.zone}
// //                     onChange={handleInputChange('zone')}
// //                     label="Zone *"
// //                     required
// //                   >
// //                     <MenuItem value="">
// //                       <em>---Select Zone---</em>
// //                     </MenuItem>
// //                     {zones.map((zone) => (
// //                       <MenuItem key={zone._id} value={zone._id}>
// //                         {zone.name}
// //                       </MenuItem>
// //                     ))}
// //                   </Select>
// //                 </FormControl>
// //               )}
// //             </Grid>

// //             <Grid item xs={12}>
// //               <FormControl fullWidth variant="outlined">
// //                 <InputLabel id="banner-type-label">Banner Type *</InputLabel>
// //                 <Select
// //                   labelId="banner-type-label"
// //                   value={formData.bannerType}
// //                   onChange={handleInputChange('bannerType')}
// //                   label="Banner Type *"
// //                   required
// //                 >
// //                   <MenuItem value="top_deal">Top Deal</MenuItem>
// //                   <MenuItem value="cash_back">Cash Back</MenuItem>
// //                 </Select>
// //               </FormControl>
// //             </Grid>

// //             <Grid item xs={12}>
// //               <TextField
// //                 fullWidth
// //                 label="Display Order"
// //                 type="number"
// //                 variant="outlined"
// //                 value={formData.displayOrder}
// //                 onChange={handleInputChange('displayOrder')}
// //                 placeholder="0"
// //               />
// //             </Grid>

// //             <Grid item xs={12}>
// //               <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
// //                 <ResetButton variant="outlined" onClick={handleReset} disabled={loading}>
// //                   Reset
// //                 </ResetButton>
// //                 <SubmitButton
// //                   variant="contained"
// //                   onClick={handleSubmit}
// //                   disabled={loading}
// //                   startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
// //                 >
// //                   {loading ? 'Submitting...' : editingId ? 'Update' : 'Submit'}
// //                 </SubmitButton>
// //               </Box>
// //             </Grid>
// //           </Grid>
// //         </TabPanel>

// //         <Box sx={{ mt: 5 }}>
// //           <Divider sx={{ mb: 3 }} />
// //           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
// //             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
// //               <Typography variant="h4" fontWeight="bold">
// //                 Existing Banners
// //               </Typography>
// //               <Box
// //                 sx={{
// //                   backgroundColor: '#14b8a6',
// //                   color: 'white',
// //                   borderRadius: '50%',
// //                   width: 32,
// //                   height: 32,
// //                   display: 'flex',
// //                   alignItems: 'center',
// //                   justifyContent: 'center',
// //                   fontSize: '14px',
// //                   fontWeight: 600,
// //                 }}
// //               >
// //                 {filteredBanners.length}
// //               </Box>
// //             </Box>
// //             <SearchTextField
// //               size="small"
// //               placeholder="Search by title"
// //               value={searchQuery}
// //               onChange={(e) => setSearchQuery(e.target.value)}
// //               InputProps={{
// //                 endAdornment: (
// //                   <InputAdornment position="end">
// //                     <IconButton size="small" sx={{ color: '#14b8a6' }}>
// //                       <SearchIcon />
// //                     </IconButton>
// //                   </InputAdornment>
// //                 ),
// //               }}
// //               sx={{ width: 300 }}
// //             />
// //           </Box>

// //           {bannersLoading ? (
// //             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', py: 4 }}>
// //               <CircularProgress size={24} />
// //               <Typography>Loading banners...</Typography>
// //             </Box>
// //           ) : filteredBanners.length > 0 ? (
// //             <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
// //               <Table>
// //                 <TableHead>
// //                   <TableRow sx={{ backgroundColor: '#f5f7fa' }}>
// //                     <TableCell sx={{ fontWeight: 600 }}>SL</TableCell>
// //                     <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
// //                     <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
// //                     <TableCell sx={{ fontWeight: 600 }}>Featured</TableCell>
// //                     <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
// //                     <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
// //                   </TableRow>
// //                 </TableHead>
// //                 <TableBody>
// //                   {filteredBanners.map((banner, index) => (
// //                     <BannerTableRow
// //                       key={banner._id}
// //                       banner={banner}
// //                       index={index}
// //                       handleImagePreview={handleImagePreview}
// //                       handleEdit={handleEdit}
// //                       handleDelete={handleDelete}
// //                       handleToggle={handleToggle}
// //                       handleBannerClick={handleBannerClick}
// //                       togglingStatus={togglingStatus}
// //                     />
// //                   ))}
// //                 </TableBody>
// //               </Table>
// //             </TableContainer>
// //           ) : (
// //             <Paper sx={{ p: 4, textAlign: 'center' }}>
// //               <Typography color="text.secondary">
// //                 No banners found. {searchQuery ? 'Try adjusting your search or ' : ''}Create a new banner to get started.
// //               </Typography>
// //             </Paper>
// //           )}
// //         </Box>
// //       </StyledPaper>

// //       <Snackbar
// //         open={open}
// //         autoHideDuration={6000}
// //         onClose={() => setOpen(false)}
// //         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
// //       >
// //         <Alert
// //           onClose={() => setOpen(false)}
// //           severity={alertSeverity}
// //           variant="filled"
// //           sx={{ width: '100%' }}
// //         >
// //           {alertMessage}
// //         </Alert>
// //       </Snackbar>

// //       <Dialog
// //         open={previewDialogOpen}
// //         onClose={() => setPreviewDialogOpen(false)}
// //         maxWidth="md"
// //         fullWidth
// //       >
// //         <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
// //           {selectedPreviewImage?.title || 'Image Preview'}
// //           <IconButton onClick={() => setPreviewDialogOpen(false)}>
// //             <CloseIcon />
// //           </IconButton>
// //         </DialogTitle>
// //         <DialogContent>
// //           {selectedPreviewImage && (
// //             <img
// //               src={selectedPreviewImage.url}
// //               alt={selectedPreviewImage.title}
// //               style={{
// //                 width: '100%',
// //                 height: 'auto',
// //                 borderRadius: 8,
// //               }}
// //               loading="lazy"
// //             />
// //           )}
// //         </DialogContent>
// //         <DialogActions>
// //           <Button onClick={() => setPreviewDialogOpen(false)} color="primary">
// //             Close
// //           </Button>
// //         </DialogActions>
// //       </Dialog>
// //     </Box>
// //   );
// // }


// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   TextField,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   IconButton,
//   CircularProgress,
//   Alert,
//   Snackbar,
// } from '@mui/material';
// import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// // Use environment variable or fallback to localhost
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// const BASE_URL = import.meta.env.VITE_API_URL ? 'https://api.bookmyevent.ae' : 'http://localhost:5000';

// function BannerForm() {
//   const [formData, setFormData] = useState({
//     title: '',
//     zone: '',
//     bannerType: 'top_deal',
//     link: '',
//     bannerImage: null,
//   });
//   const [imagePreview, setImagePreview] = useState(null);
//   const [banners, setBanners] = useState([]);
//   const [zones, setZones] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [zonesLoading, setZonesLoading] = useState(false);
//   const [notification, setNotification] = useState({ 
//     open: false, 
//     message: '', 
//     severity: 'success' 
//   });

//   // Fetch zones on component mount
//   useEffect(() => {
//     fetchZones();
//     fetchBanners();
//   }, []);

//   const fetchZones = async () => {
//     setZonesLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/zones`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       const result = await response.json();
//       console.log('Zones Response:', result);

//       if (response.ok && result.data) {
//         setZones(result.data);
//       } else {
//         showNotification('Failed to fetch zones', 'error');
//       }
//     } catch (error) {
//       console.error('Error fetching zones:', error);
//       showNotification('Error fetching zones: ' + error.message, 'error');
//     } finally {
//       setZonesLoading(false);
//     }
//   };

//   const fetchBanners = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/banners?limit=100`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       const result = await response.json();
//       console.log('Banners Response:', result);

//       if (response.ok) {
//         let bannersList = [];

//         // Handle different response structures
//         if (result.success && result.data && result.data.banners) {
//           bannersList = result.data.banners;
//         } else if (result.banners) {
//           bannersList = result.banners;
//         } else if (Array.isArray(result.data)) {
//           bannersList = result.data;
//         } else if (Array.isArray(result)) {
//           bannersList = result;
//         }

//         // Process banners with proper image URL handling
//         const formattedBanners = bannersList.map((banner) => {
//           let imageUrl = '';
//           if (banner.image) {
//             // Handle full URLs
//             if (banner.image.startsWith('http://') || banner.image.startsWith('https://')) {
//               imageUrl = banner.image;
//             } 
//             // Handle absolute server paths like /var/www/backend/Uploads/...
//             else if (banner.image.includes('/Uploads/')) {
//               const uploadsIndex = banner.image.indexOf('/Uploads/');
//               const relativePath = banner.image.substring(uploadsIndex);
//               imageUrl = `${BASE_URL}${relativePath}`;
//             }
//             // Handle paths that start with Uploads (without leading slash)
//             else if (banner.image.startsWith('Uploads/')) {
//               imageUrl = `${BASE_URL}/${banner.image}`;
//             }
//             // Handle paths that start with /uploads (lowercase)
//             else if (banner.image.startsWith('/uploads') || banner.image.startsWith('uploads')) {
//               const cleanPath = banner.image.startsWith('/') ? banner.image : `/${banner.image}`;
//               imageUrl = `${BASE_URL}${cleanPath}`;
//             } 
//             // Default case
//             else {
//               imageUrl = `${BASE_URL}/${banner.image}`;
//             }
//           }

//           console.log('Banner image processing:', {
//             id: banner._id,
//             original: banner.image,
//             final: imageUrl
//           });

//           return {
//             ...banner,
//             image: imageUrl
//           };
//         });

//         setBanners(formattedBanners);
//       } else {
//         showNotification(result.message || 'Failed to fetch banners', 'error');
//       }
//     } catch (error) {
//       console.error('Error fetching banners:', error);
//       showNotification('Error fetching banners: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showNotification = (message, severity = 'success') => {
//     setNotification({ open: true, message, severity });
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size > 2 * 1024 * 1024) {
//         showNotification('Image size should be less than 2MB', 'error');
//         return;
//       }
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//         setFormData((prev) => ({ ...prev, bannerImage: file }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.title || !formData.zone || !formData.bannerImage) {
//       showNotification('Please fill all required fields', 'error');
//       return;
//     }

//     setLoading(true);

//     try {
//       const formDataToSend = new FormData();
//       formDataToSend.append('title', formData.title);
//       formDataToSend.append('zone', formData.zone);
//       formDataToSend.append('bannerType', formData.bannerType);

//       if (formData.link) {
//         formDataToSend.append('link', formData.link);
//       }

//       formDataToSend.append('image', formData.bannerImage);

//       const response = await fetch(`${API_BASE_URL}/banners`, {
//         method: 'POST',
//         body: formDataToSend,
//       });

//       const result = await response.json();
//       console.log('Create Banner Response:', result);

//       if (response.ok || result.success) {
//         showNotification(result.message || 'Banner created successfully', 'success');
//         setFormData({ 
//           title: '', 
//           zone: '', 
//           bannerType: 'top_deal', 
//           link: '', 
//           bannerImage: null 
//         });
//         setImagePreview(null);
//         fetchBanners();
//       } else {
//         showNotification(result.message || 'Failed to create banner', 'error');
//       }
//     } catch (error) {
//       console.error('Error creating banner:', error);
//       showNotification('Error creating banner: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     setFormData({ 
//       title: '', 
//       zone: '', 
//       bannerType: 'top_deal', 
//       link: '', 
//       bannerImage: null 
//     });
//     setImagePreview(null);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this banner?')) {
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       const result = await response.json();
//       console.log('Delete Response:', result);

//       if (response.ok || result.success) {
//         showNotification(result.message || 'Banner deleted successfully', 'success');
//         fetchBanners();
//       } else {
//         showNotification(result.message || 'Failed to delete banner', 'error');
//       }
//     } catch (error) {
//       console.error('Error deleting banner:', error);
//       showNotification('Error deleting banner: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (banner) => {
//     setFormData({
//       title: banner.title,
//       zone: banner.zone?._id || banner.zone || '',
//       bannerType: banner.bannerType || 'top_deal',
//       link: banner.link || '',
//       bannerImage: null,
//     });
//     if (banner.image) {
//       setImagePreview(banner.image);
//     }
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   return (
//     <Box
//       sx={{
//         p: 4,
//         bgcolor: '#f5f7fa',
//         borderRadius: 2,
//         boxShadow: 1,
//         minHeight: '100vh',
//       }}
//     >
//       <Box sx={{ mb: 4, fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
//         Add New Banner
//       </Box>

//       <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
//         <TextField
//           fullWidth
//           name="title"
//           label="Banner Title *"
//           value={formData.title}
//           onChange={handleInputChange}
//           required
//           variant="outlined"
//           sx={{ mb: 3, bgcolor: 'white' }}
//           disabled={loading}
//         />

//         <FormControl fullWidth variant="outlined" sx={{ mb: 3, bgcolor: 'white' }}>
//           <InputLabel id="zone-label">Select Zone *</InputLabel>
//           <Select
//             name="zone"
//             labelId="zone-label"
//             value={formData.zone}
//             onChange={handleInputChange}
//             label="Select Zone *"
//             required
//             disabled={loading || zonesLoading}
//           >
//             <MenuItem value="">--Select Zone--</MenuItem>
//             {zones.map((zone) => (
//               <MenuItem key={zone._id} value={zone._id}>
//                 {zone.name}
//               </MenuItem>
//             ))}
//           </Select>
//           {zonesLoading && (
//             <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
//               <CircularProgress size={20} />
//             </Box>
//           )}
//         </FormControl>

//         <FormControl fullWidth variant="outlined" sx={{ mb: 3, bgcolor: 'white' }}>
//           <InputLabel id="banner-type-label">Banner Type *</InputLabel>
//           <Select
//             name="bannerType"
//             labelId="banner-type-label"
//             value={formData.bannerType}
//             onChange={handleInputChange}
//             label="Banner Type *"
//             required
//             disabled={loading}
//           >
//             <MenuItem value="top_deal">Top Deal</MenuItem>
//             <MenuItem value="cash_back">Cash Back</MenuItem>
//             <MenuItem value="zone_wise">Zone Wise</MenuItem>
//           </Select>
//         </FormControl>

//         <TextField
//           fullWidth
//           name="link"
//           label="Banner Link (Optional)"
//           value={formData.link}
//           onChange={handleInputChange}
//           variant="outlined"
//           sx={{ mb: 3, bgcolor: 'white' }}
//           disabled={loading}
//           placeholder="https://example.com"
//         />

//         <Box
//           sx={{
//             border: '2px dashed #ccc',
//             borderRadius: 1,
//             p: 4,
//             textAlign: 'center',
//             bgcolor: '#fff',
//             mb: 3,
//             cursor: loading ? 'not-allowed' : 'pointer',
//             '&:hover': { borderColor: loading ? '#ccc' : '#999' },
//           }}
//         >
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleImageUpload}
//             style={{ display: 'none' }}
//             id="image-upload"
//             disabled={loading}
//           />
//           <label htmlFor="image-upload" style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
//             <Box sx={{ color: '#666' }}>
//               {imagePreview ? (
//                 <Box sx={{ position: 'relative' }}>
//                   <img
//                     src={imagePreview}
//                     alt="Banner Preview"
//                     style={{ 
//                       maxWidth: '100%', 
//                       maxHeight: '200px', 
//                       objectFit: 'contain' 
//                     }}
//                   />
//                   <Button
//                     variant="outlined"
//                     size="small"
//                     onClick={(e) => {
//                       e.preventDefault();
//                       setImagePreview(null);
//                       setFormData(prev => ({ ...prev, bannerImage: null }));
//                     }}
//                     sx={{ mt: 2 }}
//                     disabled={loading}
//                   >
//                     Remove Image
//                   </Button>
//                 </Box>
//               ) : (
//                 <>
//                   <Box sx={{ fontSize: '1rem', mb: 1 }}>Click to upload *</Box>
//                   <Box sx={{ color: '#999', fontSize: '0.875rem' }}>Or drag and drop</Box>
//                   <Box sx={{ color: '#999', fontSize: '0.875rem', mt: 1 }}>
//                     JPG, JPEG, PNG Less Than 2MB (Ratio 3:1)
//                   </Box>
//                 </>
//               )}
//             </Box>
//           </label>
//         </Box>

//         <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
//           <Button 
//             variant="contained" 
//             type="submit" 
//             color="primary" 
//             sx={{ minWidth: 120, height: 45 }}
//             disabled={loading}
//           >
//             {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
//           </Button>
//           <Button 
//             variant="outlined" 
//             onClick={handleCancel} 
//             color="primary" 
//             sx={{ minWidth: 120, height: 45 }}
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//         </Box>
//       </Box>

//       <Box sx={{ mt: 6 }}>
//         <Box sx={{ mb: 3, fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
//           Existing Banners
//         </Box>

//         {loading && banners.length === 0 ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
//             <CircularProgress />
//           </Box>
//         ) : (
//           <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
//             <Table>
//               <TableHead>
//                 <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
//                   <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Image</TableCell>
//                   <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Title</TableCell>
//                   <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Zone</TableCell>
//                   <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Type</TableCell>
//                   <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Status</TableCell>
//                   <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {banners.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#999' }}>
//                       No banners found. Create your first banner above.
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   banners.map((banner) => (
//                     <TableRow key={banner._id} hover>
//                       <TableCell>
//                         <Box
//                           sx={{
//                             width: 100,
//                             height: 60,
//                             borderRadius: 1,
//                             overflow: 'hidden',
//                             border: '1px solid #e0e0e0',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             bgcolor: '#f5f5f5'
//                           }}
//                         >
//                           {banner.image ? (
//                             <img
//                               src={banner.image}
//                               alt={banner.title}
//                               style={{
//                                 width: '100%',
//                                 height: '100%',
//                                 objectFit: 'cover',
//                               }}
//                               onError={(e) => {
//                                 console.error('Image load error for:', banner.image);
//                                 e.target.style.display = 'none';
//                                 const parent = e.target.parentElement;
//                                 if (parent) {
//                                   parent.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f5f5;color:#999;font-size:0.7rem;">No Image</div>';
//                                 }
//                               }}
//                             />
//                           ) : (
//                             <Box
//                               sx={{
//                                 width: '100%',
//                                 height: '100%',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 bgcolor: '#f5f5f5',
//                                 color: '#999',
//                                 fontSize: '0.7rem',
//                               }}
//                             >
//                               No Image
//                             </Box>
//                           )}
//                         </Box>
//                       </TableCell>
//                       <TableCell>{banner.title}</TableCell>
//                       <TableCell>{banner.zone?.name || 'N/A'}</TableCell>
//                       <TableCell sx={{ textTransform: 'capitalize' }}>
//                         {banner.bannerType?.replace('_', ' ') || 'N/A'}
//                       </TableCell>
//                       <TableCell>
//                         <Box
//                           sx={{
//                             display: 'inline-block',
//                             px: 2,
//                             py: 0.5,
//                             borderRadius: 1,
//                             bgcolor: banner.isActive ? '#4caf50' : '#f44336',
//                             color: 'white',
//                             fontSize: '0.875rem',
//                             fontWeight: 'medium',
//                           }}
//                         >
//                           {banner.isActive ? 'Active' : 'Inactive'}
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <IconButton 
//                           color="primary" 
//                           onClick={() => handleEdit(banner)}
//                           disabled={loading}
//                           size="small"
//                         >
//                           <EditIcon />
//                         </IconButton>
//                         <IconButton 
//                           color="error" 
//                           onClick={() => handleDelete(banner._id)}
//                           disabled={loading}
//                           size="small"
//                         >
//                           <DeleteIcon />
//                         </IconButton>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         )}
//       </Box>

//       <Snackbar
//         open={notification.open}
//         autoHideDuration={6000}
//         onClose={() => setNotification({ ...notification, open: false })}
//         anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
//       >
//         <Alert
//           onClose={() => setNotification({ ...notification, open: false })}
//           severity={notification.severity}
//           sx={{ width: '100%' }}
//           variant="filled"
//         >
//           {notification.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }

// export default BannerForm;



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
import { API_BASE_URL, getApiImageUrl } from '../utils/apiImageUtils';

// Use environment variable or fallback to localhost
// API_BASE_URL is now imported from apiImageUtils

function BannerForm() {
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
      const response = await fetch(`${API_BASE_URL}/banners?limit=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('Banners Response:', result);

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

        const formattedBanners = bannersList.map((banner) => {
          const imageUrl = banner.image ? getApiImageUrl(banner.image) : '';
          return {
            ...banner,
            image: imageUrl
          };
        });

        setBanners(formattedBanners);
      } else {
        showNotification(result.message || 'Failed to fetch banners', 'error');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      showNotification('Error fetching banners: ' + error.message, 'error');
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

      const response = await fetch(`${API_BASE_URL}/banners`, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('Create Banner Response:', result);

      if (response.ok || result.success) {
        showNotification(result.message || 'Banner created successfully', 'success');
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
        showNotification(result.message || 'Failed to create banner', 'error');
      }
    } catch (error) {
      console.error('Error creating banner:', error);
      showNotification('Error creating banner: ' + error.message, 'error');
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
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('Delete Response:', result);

      if (response.ok || result.success) {
        showNotification(result.message || 'Banner deleted successfully', 'success');
        fetchBanners();
      } else {
        showNotification(result.message || 'Failed to delete banner', 'error');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      showNotification('Error deleting banner: ' + error.message, 'error');
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
          Existing Banners
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
                      No banners found. Create your first banner above.
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

export default BannerForm;
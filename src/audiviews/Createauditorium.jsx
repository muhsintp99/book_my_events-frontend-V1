import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Tabs, Tab, Card, CardContent,
  IconButton, Tooltip, Stack, Radio, RadioGroup, FormControlLabel,
  Select, MenuItem, FormControl, InputLabel, useTheme, useMediaQuery,
  Switch, Snackbar, Alert, Grid, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon, Settings as SettingsIcon,
  Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon,
  Add as AddIcon, List as ListIcon
} from '@mui/icons-material';
import { styled } from '@mui/system';

// Styled component for the upload area
const UploadDropArea = styled(Box)(({ theme }) => ({
  border: '2px dashed #e0e0e0',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: theme.palette.grey[50],
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '150px',
  '&:hover': { borderColor: theme.palette.primary.main },
  '& input[type="file"]': { display: 'none' },
}));

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const CreateAuditorium = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const API_BASE_URL = "http://localhost:5000/api"; // Replace with production URL

  // State management
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', or 'edit'
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [openToast, setOpenToast] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    venueName: '',
    shortDescription: '',
    venueAddress: '',
    latitude: '',
    longitude: '',
    language: 'EN',
    contactPhone: '',
    contactEmail: '',
    contactWebsite: '',
    ownerManagerName: '',
    ownerManagerPhone: '',
    ownerManagerEmail: '',
    openingHours: '',
    closingHours: '',
    holidaySchedule: '',
    watermarkProtection: false,
    parkingAvailability: false,
    parkingCapacity: '',
    foodCateringAvailability: false,
    stageLightingAudio: false,
    wheelchairAccessibility: false,
    securityArrangements: false,
    wifiAvailability: false,
    washroomsInfo: '',
    dressingRooms: '',
    rentalType: 'hourly',
    hourlyPrice: '',
    perDayPrice: '',
    distanceWisePrice: '',
    discount: '',
    customPackages: '',
    dynamicPricing: false,
    advanceDeposit: '',
    cancellationPolicy: '',
    extraCharges: '',
    seatingArrangement: '',
    maxGuestsSeated: '',
    maxGuestsStanding: '',
    multipleHalls: false,
    nearbyTransport: '',
    accessibilityInfo: '',
    searchTags: '',
    thumbnail: null,
    images: [],
    documents: []
  });
  const [editingVenueId, setEditingVenueId] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Fetch venues
  useEffect(() => {
    if (currentView === 'list') {
      fetchVenues(currentPage);
    }
  }, [currentView, currentPage]);

  const fetchVenues = async (page = 1) => {
    setLoadingVenues(true);
    try {
      const response = await fetch(`${API_BASE_URL}/venues?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        const updatedVenues = data.data.map(venue => ({
          ...venue,
          thumbnail: venue.thumbnail ? `${API_BASE_URL}/${venue.thumbnail.replace(/^\//, '')}` : null,
          images: venue.images ? venue.images.map(img => `${API_BASE_URL}/${img.replace(/^\//, '')}`) : []
        }));
        setVenues(updatedVenues);
        setTotalItems(data.count || 0);
        setTotalPages(Math.ceil(data.count / 10));
        setCurrentPage(page);
      } else {
        throw new Error(data.message || 'Failed to fetch venues');
      }
    } catch (error) {
      setErrorMessage('Error fetching venues: ' + error.message);
      setAlertSeverity('error');
      setOpenToast(true);
    } finally {
      setLoadingVenues(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle file inputs
  const handleFileChange = (field) => (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({ ...prev, [field]: files }));
  };

  const handleDrop = (field) => (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setFormData(prev => ({ ...prev, [field]: files }));
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      venueName: '',
      shortDescription: '',
      venueAddress: '',
      latitude: '',
      longitude: '',
      language: 'EN',
      contactPhone: '',
      contactEmail: '',
      contactWebsite: '',
      ownerManagerName: '',
      ownerManagerPhone: '',
      ownerManagerEmail: '',
      openingHours: '',
      closingHours: '',
      holidaySchedule: '',
      watermarkProtection: false,
      parkingAvailability: false,
      parkingCapacity: '',
      foodCateringAvailability: false,
      stageLightingAudio: false,
      wheelchairAccessibility: false,
      securityArrangements: false,
      wifiAvailability: false,
      washroomsInfo: '',
      dressingRooms: '',
      rentalType: 'hourly',
      hourlyPrice: '',
      perDayPrice: '',
      distanceWisePrice: '',
      discount: '',
      customPackages: '',
      dynamicPricing: false,
      advanceDeposit: '',
      cancellationPolicy: '',
      extraCharges: '',
      seatingArrangement: '',
      maxGuestsSeated: '',
      maxGuestsStanding: '',
      multipleHalls: false,
      nearbyTransport: '',
      accessibilityInfo: '',
      searchTags: '',
      thumbnail: null,
      images: [],
      documents: []
    });
    setEditingVenueId(null);
    setTabValue(0);
  };

  // Form validation
  const validateForm = () => {
    const errors = [];
    if (!formData.venueName.trim()) errors.push('Venue name is required');
    if (!formData.venueAddress.trim()) errors.push('Venue address is required');
    if (!formData.contactPhone.trim()) errors.push('Contact phone is required');
    if (!formData.contactEmail.trim()) errors.push('Contact email is required');
    if (!formData.ownerManagerName.trim()) errors.push('Owner/Manager name is required');
    if (!formData.openingHours.trim()) errors.push('Opening hours are required');
    if (!formData.closingHours.trim()) errors.push('Closing hours are required');
    if (!formData.seatingArrangement) errors.push('Seating arrangement is required');
    if (!formData.maxGuestsSeated) errors.push('Max guests seated is required');
    if (formData.rentalType === 'hourly' && !formData.hourlyPrice) errors.push('Hourly price is required');
    if (formData.rentalType === 'daily' && !formData.perDayPrice) errors.push('Daily price is required');
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) errors.push('Valid contact email is required');
    if (formData.ownerManagerEmail && !/\S+@\S+\.\S+/.test(formData.ownerManagerEmail)) errors.push('Valid owner/manager email is required');
    if (formData.latitude && isNaN(parseFloat(formData.latitude))) errors.push('Valid latitude is required');
    if (formData.longitude && isNaN(parseFloat(formData.longitude))) errors.push('Valid longitude is required');
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrorMessage(validationErrors.join(', '));
      setAlertSeverity('error');
      setOpenToast(true);
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'thumbnail' && value) formDataToSend.append('thumbnail', value[0]);
      else if (key === 'images' && value.length) value.forEach(file => formDataToSend.append('images', file));
      else if (key === 'documents' && value.length) value.forEach(file => formDataToSend.append('documents', file));
      else if (key !== 'thumbnail' && key !== 'images' && key !== 'documents') {
        formDataToSend.append(key, value === null || value === undefined ? '' : value);
      }
    });
    formDataToSend.append('provider', localStorage.getItem('userId') || '68c2e5e707259c009c62f8fe');

    try {
      const url = editingVenueId ? `${API_BASE_URL}/venues/${editingVenueId}` : `${API_BASE_URL}/venues`;
      const method = editingVenueId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      const data = await response.json();
      if (data.success) {
        setErrorMessage(editingVenueId ? 'Venue updated successfully' : 'Venue created successfully');
        setAlertSeverity('success');
        setOpenToast(true);
        handleReset();
        setCurrentView('list');
        fetchVenues(currentPage);
      } else {
        throw new Error(data.message || 'Failed to process venue');
      }
    } catch (error) {
      setErrorMessage(`Error ${editingVenueId ? 'updating' : 'creating'} venue: ${error.message}`);
      setAlertSeverity('error');
      setOpenToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit venue
  const handleEditVenue = (venue) => {
    setFormData({
      venueName: venue.venueName || '',
      shortDescription: venue.shortDescription || '',
      venueAddress: venue.venueAddress || '',
      latitude: venue.latitude || '',
      longitude: venue.longitude || '',
      language: venue.language || 'EN',
      contactPhone: venue.contactPhone || '',
      contactEmail: venue.contactEmail || '',
      contactWebsite: venue.contactWebsite || '',
      ownerManagerName: venue.ownerManagerName || '',
      ownerManagerPhone: venue.ownerManagerPhone || '',
      ownerManagerEmail: venue.ownerManagerEmail || '',
      openingHours: venue.openingHours || '',
      closingHours: venue.closingHours || '',
      holidaySchedule: venue.holidaySchedule || '',
      watermarkProtection: venue.watermarkProtection || false,
      parkingAvailability: venue.parkingAvailability || false,
      parkingCapacity: venue.parkingCapacity || '',
      foodCateringAvailability: venue.foodCateringAvailability || false,
      stageLightingAudio: venue.stageLightingAudio || false,
      wheelchairAccessibility: venue.wheelchairAccessibility || false,
      securityArrangements: venue.securityArrangements || false,
      wifiAvailability: venue.wifiAvailability || false,
      washroomsInfo: venue.washroomsInfo || '',
      dressingRooms: venue.dressingRooms || '',
      rentalType: venue.rentalType || 'hourly',
      hourlyPrice: venue.hourlyPrice || '',
      perDayPrice: venue.perDayPrice || '',
      distanceWisePrice: venue.distanceWisePrice || '',
      discount: venue.discount || '',
      customPackages: venue.customPackages || '',
      dynamicPricing: venue.dynamicPricing || false,
      advanceDeposit: venue.advanceDeposit || '',
      cancellationPolicy: venue.cancellationPolicy || '',
      extraCharges: venue.extraCharges || '',
      seatingArrangement: venue.seatingArrangement || '',
      maxGuestsSeated: venue.maxGuestsSeated || '',
      maxGuestsStanding: venue.maxGuestsStanding || '',
      multipleHalls: venue.multipleHalls || false,
      nearbyTransport: venue.nearbyTransport || '',
      accessibilityInfo: venue.accessibilityInfo || '',
      searchTags: venue.searchTags || '',
      thumbnail: null,
      images: [],
      documents: []
    });
    setEditingVenueId(venue._id);
    setCurrentView('create');
  };

  // Handle delete venue
  const handleDeleteVenue = async (venueId) => {
    if (window.confirm('Are you sure you want to delete this venue?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/venues/${venueId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.success) {
          setErrorMessage('Venue deleted successfully');
          setAlertSeverity('success');
          setOpenToast(true);
          fetchVenues(currentPage);
        } else {
          throw new Error(data.message || 'Failed to delete venue');
        }
      } catch (error) {
        setErrorMessage('Error deleting venue: ' + error.message);
        setAlertSeverity('error');
        setOpenToast(true);
      }
    }
  };

  // Handle image errors
  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // Render venues list
  const renderVenuesList = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5">Venue Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Total: {totalItems} venues
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { handleReset(); setCurrentView('create'); }}
        >
          Add New Venue
        </Button>
      </Box>

      {loadingVenues ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : venues.length > 0 ? (
        <Grid container spacing={3}>
          {venues.map((venue) => (
            <Grid item xs={12} sm={6} md={4} key={venue._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                  <img
                    src={imageErrors[venue._id] || !venue.thumbnail ? 'https://via.placeholder.com/150?text=No+Image' : venue.thumbnail}
                    alt={venue.venueName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => handleImageError(venue._id)}
                  />
                  <Box sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: venue.isActive ? 'success.main' : 'error.main',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem'
                  }}>
                    {venue.isActive ? 'Active' : 'Inactive'}
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography variant="h6" noWrap gutterBottom>
                    {venue.venueName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {venue.venueAddress}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={venue.rentalType} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={`Seats: ${venue.maxGuestsSeated || 'N/A'}`} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                    {venue.rentalType === 'hourly' && `$${venue.hourlyPrice}/hour`}
                    {venue.rentalType === 'daily' && `$${venue.perDayPrice}/day`}
                    {venue.rentalType === 'distanceWise' && `$${venue.distanceWisePrice}/km`}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => { setSelectedVenue(venue); setViewDialogOpen(true); }}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    color="info"
                    onClick={() => handleEditVenue(venue)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => handleDeleteVenue(venue._id)}
                  >
                    Delete
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No venues found.</Typography>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </Button>
          <Typography sx={{ mx: 2, alignSelf: 'center' }}>
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );

  // Render venue details dialog
  const renderVenueDialog = () => (
    <Dialog
      open={viewDialogOpen}
      onClose={() => setViewDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      {selectedVenue && (
        <>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{selectedVenue.venueName}</Typography>
              <Chip 
                label={selectedVenue.isActive ? 'Active' : 'Inactive'}
                color={selectedVenue.isActive ? 'success' : 'error'}
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              {selectedVenue.thumbnail && (
                <img
                  src={imageErrors[selectedVenue._id] || !selectedVenue.thumbnail ? 'https://via.placeholder.com/150?text=No+Image' : selectedVenue.thumbnail}
                  alt={selectedVenue.venueName}
                  style={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'cover',
                    borderRadius: theme.shape.borderRadius
                  }}
                  onError={() => handleImageError(selectedVenue._id)}
                />
              )}
            </Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Basic Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2"><strong>Address:</strong> {selectedVenue.venueAddress}</Typography>
              <Typography variant="body2"><strong>Contact Phone:</strong> {selectedVenue.contactPhone}</Typography>
              <Typography variant="body2"><strong>Contact Email:</strong> {selectedVenue.contactEmail}</Typography>
              <Typography variant="body2"><strong>Owner/Manager:</strong> {selectedVenue.ownerManagerName}</Typography>
              <Typography variant="body2"><strong>Hours:</strong> {selectedVenue.openingHours} - {selectedVenue.closingHours}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Capacity & Pricing
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2"><strong>Seating Arrangement:</strong> {selectedVenue.seatingArrangement}</Typography>
              <Typography variant="body2"><strong>Max Guests (Seated):</strong> {selectedVenue.maxGuestsSeated}</Typography>
              <Typography variant="body2"><strong>Max Guests (Standing):</strong> {selectedVenue.maxGuestsStanding}</Typography>
              <Typography variant="body2"><strong>Rental Type:</strong> {selectedVenue.rentalType}</Typography>
              <Typography variant="body2">
                <strong>Price:</strong> 
                {selectedVenue.rentalType === 'hourly' && ` $${selectedVenue.hourlyPrice}/hour`}
                {selectedVenue.rentalType === 'daily' && ` $${selectedVenue.perDayPrice}/day`}
                {selectedVenue.rentalType === 'distanceWise' && ` $${selectedVenue.distanceWisePrice}/km`}
              </Typography>
              {selectedVenue.discount && (
                <Typography variant="body2"><strong>Discount:</strong> {selectedVenue.discount}%</Typography>
              )}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Facilities
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {selectedVenue.parkingAvailability && <Chip label="Parking Available" size="small" color="success" />}
              {selectedVenue.foodCateringAvailability && <Chip label="Food & Catering" size="small" color="success" />}
              {selectedVenue.stageLightingAudio && <Chip label="Stage/Lighting/Audio" size="small" color="success" />}
              {selectedVenue.wheelchairAccessibility && <Chip label="Wheelchair Accessible" size="small" color="success" />}
              {selectedVenue.securityArrangements && <Chip label="Security" size="small" color="success" />}
              {selectedVenue.wifiAvailability && <Chip label="Wi-Fi" size="small" color="success" />}
            </Box>
            {selectedVenue.searchTags && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedVenue.searchTags.split(',').map((tag, index) => (
                    <Chip key={index} label={tag.trim()} size="small" variant="outlined" />
                  ))}
                </Box>
              </>
            )}
            {selectedVenue.images && selectedVenue.images.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Gallery
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedVenue.images.map((image, index) => (
                    <img
                      key={index}
                      src={imageErrors[`${selectedVenue._id}-${index}`] || !image ? 'https://via.placeholder.com/100?text=No+Image' : image}
                      alt={`Gallery ${index + 1}`}
                      style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: theme.shape.borderRadius }}
                      onError={() => setImageErrors(prev => ({ ...prev, [`${selectedVenue._id}-${index}`]: true }))}
                    />
                  ))}
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  // Render create/edit form
  const renderCreateForm = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ListIcon />}
            onClick={() => { handleReset(); setCurrentView('list'); }}
            variant="outlined"
          >
            Back to List
          </Button>
          <Typography variant="h5">{editingVenueId ? 'Edit Venue' : 'Add New Venue'}</Typography>
        </Box>
      </Box>
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', gap: 3, mb: 4 }}>
          <Card sx={{ flex: isSmallScreen ? 'auto' : 2, p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>General Information</Typography>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} aria-label="language tabs">
                  <Tab label="Default" {...a11yProps(0)} />
                </Tabs>
              </Box>
              <TabPanel value={tabValue} index={0}>
                <TextField
                  fullWidth
                  label="Venue Name*"
                  value={formData.venueName}
                  onChange={handleInputChange('venueName')}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Short Description"
                  multiline
                  rows={4}
                  value={formData.shortDescription}
                  onChange={handleInputChange('shortDescription')}
                  sx={{ mb: 2 }}
                />
              </TabPanel>
              <TextField
                fullWidth
                label="Venue Address*"
                value={formData.venueAddress}
                onChange={handleInputChange('venueAddress')}
                sx={{ mb: 2 }}
                required
              />
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Latitude"
                  value={formData.latitude}
                  onChange={handleInputChange('latitude')}
                  type="number"
                />
                <TextField
                  fullWidth
                  label="Longitude"
                  value={formData.longitude}
                  onChange={handleInputChange('longitude')}
                  type="number"
                />
              </Box>
              <TextField
                fullWidth
                label="Contact Phone*"
                value={formData.contactPhone}
                onChange={handleInputChange('contactPhone')}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Contact Email*"
                value={formData.contactEmail}
                onChange={handleInputChange('contactEmail')}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Contact Website"
                value={formData.contactWebsite}
                onChange={handleInputChange('contactWebsite')}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Owner/Manager Name*"
                value={formData.ownerManagerName}
                onChange={handleInputChange('ownerManagerName')}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Owner/Manager Phone"
                value={formData.ownerManagerPhone}
                onChange={handleInputChange('ownerManagerPhone')}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Owner/Manager Email"
                value={formData.ownerManagerEmail}
                onChange={handleInputChange('ownerManagerEmail')}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Opening Hours*"
                  value={formData.openingHours}
                  onChange={handleInputChange('openingHours')}
                  required
                />
                <TextField
                  fullWidth
                  label="Closing Hours*"
                  value={formData.closingHours}
                  onChange={handleInputChange('closingHours')}
                  required
                />
              </Box>
              <TextField
                fullWidth
                label="Holiday Schedule"
                multiline
                rows={2}
                value={formData.holidaySchedule}
                onChange={handleInputChange('holidaySchedule')}
              />
            </CardContent>
          </Card>
          <Card sx={{ flex: isSmallScreen ? 'auto' : 1, p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Venue Thumbnail</Typography>
              <UploadDropArea
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop('thumbnail')}
                onClick={() => document.getElementById('thumbnail-upload').click()}
              >
                {formData.thumbnail && formData.thumbnail[0] ? (
                  <Box>
                    <img
                      src={URL.createObjectURL(formData.thumbnail[0])}
                      alt="Thumbnail preview"
                      style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain', marginBottom: theme.spacing(1) }}
                    />
                    <Typography variant="body2" color="text.secondary">{formData.thumbnail[0].name}</Typography>
                  </Box>
                ) : (
                  <Box>
                    <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                    <Typography variant="body2" color="primary">Click to upload</Typography>
                    <Typography variant="body2" color="text.secondary">Or drag and drop (JPG, PNG)</Typography>
                  </Box>
                )}
                <input
                  type="file"
                  id="thumbnail-upload"
                  hidden
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange('thumbnail')}
                />
              </UploadDropArea>
            </CardContent>
          </Card>
        </Box>

        {/* Rest of the form sections */}
        <Box sx={{ mb: 4 }}>
          <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Media Enhancements</Typography>
              <UploadDropArea
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop('images')}
                onClick={() => document.getElementById('images-upload').click()}
                sx={{ mb: 2 }}
              >
                {formData.images.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {formData.images.map((file, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`Venue image ${index + 1}`}
                        style={{ maxWidth: 80, maxHeight: 80, objectFit: 'cover', borderRadius: theme.shape.borderRadius }}
                      />
                    ))}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, width: '100%' }}>
                      {formData.images.length} image(s) selected
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                    <Typography variant="body2" color="primary">Click to upload images</Typography>
                    <Typography variant="body2" color="text.secondary">Or drag and drop (Gallery)</Typography>
                  </Box>
                )}
                <input
                  type="file"
                  id="images-upload"
                  hidden
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handleFileChange('images')}
                />
              </UploadDropArea>
              <FormControlLabel
                control={<Switch checked={formData.watermarkProtection} onChange={handleInputChange('watermarkProtection')} />}
                label="Enable Watermark Protection"
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Venue Facilities</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, 1fr)', gap: 2 }}>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch checked={formData.parkingAvailability} onChange={handleInputChange('parkingAvailability')} />}
                    label="Parking Availability"
                  />
                  <TextField
                    fullWidth
                    label="Parking Capacity"
                    value={formData.parkingCapacity}
                    onChange={handleInputChange('parkingCapacity')}
                    type="number"
                  />
                  <FormControlLabel
                    control={<Switch checked={formData.foodCateringAvailability} onChange={handleInputChange('foodCateringAvailability')} />}
                    label="Food & Catering"
                  />
                  <FormControlLabel
                    control={<Switch checked={formData.stageLightingAudio} onChange={handleInputChange('stageLightingAudio')} />}
                    label="Stage/Lighting/Audio"
                  />
                </Stack>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch checked={formData.wheelchairAccessibility} onChange={handleInputChange('wheelchairAccessibility')} />}
                    label="Wheelchair Accessibility"
                  />
                  <FormControlLabel
                    control={<Switch checked={formData.securityArrangements} onChange={handleInputChange('securityArrangements')} />}
                    label="Security Arrangements"
                  />
                  <FormControlLabel
                    control={<Switch checked={formData.wifiAvailability} onChange={handleInputChange('wifiAvailability')} />}
                    label="Wi-Fi Availability"
                  />
                  <TextField
                    fullWidth
                    label="Washrooms Info"
                    value={formData.washroomsInfo}
                    onChange={handleInputChange('washroomsInfo')}
                  />
                  <TextField
                    fullWidth
                    label="Dressing Rooms"
                    value={formData.dressingRooms}
                    onChange={handleInputChange('dressingRooms')}
                  />
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pricing & Booking</Typography>
              <RadioGroup
                value={formData.rentalType}
                onChange={handleInputChange('rentalType')}
                sx={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, 1fr)', gap: 2 }}
              >
                <Card variant="outlined" sx={{ p: 2, borderColor: formData.rentalType === 'hourly' ? theme.palette.primary.main : undefined }}>
                  <FormControlLabel value="hourly" control={<Radio />} label="Hourly" />
                </Card>
                <Card variant="outlined" sx={{ p: 2, borderColor: formData.rentalType === 'daily' ? theme.palette.primary.main : undefined }}>
                  <FormControlLabel value="daily" control={<Radio />} label="Daily" />
                </Card>
              </RadioGroup>
              {formData.rentalType === 'hourly' && (
                <TextField
                  fullWidth
                  label="Hourly Price*"
                  value={formData.hourlyPrice}
                  onChange={handleInputChange('hourlyPrice')}
                  type="number"
                  inputProps={{ step: "0.01" }}
                  sx={{ mt: 2 }}
                  required
                />
              )}
              {formData.rentalType === 'daily' && (
                <TextField
                  fullWidth
                  label="Daily Price*"
                  value={formData.perDayPrice}
                  onChange={handleInputChange('perDayPrice')}
                  type="number"
                  inputProps={{ step: "0.01" }}
                  sx={{ mt: 2 }}
                  required
                />
              )}
              <TextField
                fullWidth
                label="Discount (%)"
                value={formData.discount}
                onChange={handleInputChange('discount')}
                type="number"
                inputProps={{ min: 0, max: 100 }}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Custom Packages"
                multiline
                rows={2}
                value={formData.customPackages}
                onChange={handleInputChange('customPackages')}
                sx={{ mt: 2 }}
              />
              <FormControlLabel
                control={<Switch checked={formData.dynamicPricing} onChange={handleInputChange('dynamicPricing')} />}
                label="Dynamic Pricing"
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Advance Deposit (%)"
                value={formData.advanceDeposit}
                onChange={handleInputChange('advanceDeposit')}
                type="number"
                inputProps={{ min: 0, max: 100 }}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Cancellation Policy"
                multiline
                rows={2}
                value={formData.cancellationPolicy}
                onChange={handleInputChange('cancellationPolicy')}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Extra Charges"
                multiline
                rows={2}
                value={formData.extraCharges}
                onChange={handleInputChange('extraCharges')}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Capacity & Layout</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Seating Arrangement*</InputLabel>
                <Select
                  value={formData.seatingArrangement}
                  onChange={handleInputChange('seatingArrangement')}
                  label="Seating Arrangement"
                  required
                >
                  <MenuItem value="">Select seating arrangement</MenuItem>
                  <MenuItem value="Theater">Theater</MenuItem>
                  <MenuItem value="Banquet">Banquet</MenuItem>
                  <MenuItem value="Classroom">Classroom</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Max Guests (Seated)*"
                  value={formData.maxGuestsSeated}
                  onChange={handleInputChange('maxGuestsSeated')}
                  type="number"
                  required
                />
                <TextField
                  fullWidth
                  label="Max Guests (Standing)"
                  value={formData.maxGuestsStanding}
                  onChange={handleInputChange('maxGuestsStanding')}
                  type="number"
                />
              </Box>
              <FormControlLabel
                control={<Switch checked={formData.multipleHalls} onChange={handleInputChange('multipleHalls')} />}
                label="Multiple Halls"
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Location & Accessibility</Typography>
              <TextField
                fullWidth
                label="Nearby Transport"
                multiline
                rows={2}
                value={formData.nearbyTransport}
                onChange={handleInputChange('nearbyTransport')}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Accessibility Info"
                multiline
                rows={2}
                value={formData.accessibilityInfo}
                onChange={handleInputChange('accessibilityInfo')}
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Search Tags</Typography>
              <TextField
                fullWidth
                label="Search Tags (comma-separated)"
                value={formData.searchTags}
                onChange={handleInputChange('searchTags')}
                placeholder="e.g., event, wedding, conference"
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Processing...' : editingVenueId ? 'Update Venue' : 'Create Venue'}
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3, backgroundColor: theme.palette.grey[100], minHeight: '100vh' }}>
      <Box sx={{
        maxWidth: 'lg',
        margin: 'auto',
        backgroundColor: 'white',
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[1],
        p: isSmallScreen ? 2 : 3,
      }}>
        {currentView === 'list' ? renderVenuesList() : renderCreateForm()}
        {renderVenueDialog()}
        <Snackbar 
          open={openToast} 
          autoHideDuration={3000} 
          onClose={(e, reason) => reason !== 'clickaway' && setOpenToast(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setOpenToast(false)} severity={alertSeverity}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default CreateAuditorium;
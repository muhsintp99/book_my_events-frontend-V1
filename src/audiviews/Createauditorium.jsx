import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Switch,
  Snackbar,
  Alert,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  List as ListIcon
} from '@mui/icons-material';
import { styled } from '@mui/system';

// Helper component for Tab Panels
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
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

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
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  '& input[type="file"]': {
    display: 'none',
  },
}));

const Createauditorium = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Base API URL (replacing process.env)
  const API_BASE_URL = "http://localhost:5000/api"; // Replace with your production URL in deployment

  // Main view state
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'create'
  
  // Venue list state
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({}); // Track image loading errors
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // State for form data
  const [tabValue, setTabValue] = useState(0);
  const [venueNameDefault, setVenueNameDefault] = useState('');
  const [shortDescriptionDefault, setShortDescriptionDefault] = useState('');
  const [venueNameEnglish, setVenueNameEnglish] = useState('');
  const [shortDescriptionEnglish, setShortDescriptionEnglish] = useState('');
  const [venueNameArabic, setVenueNameArabic] = useState('');
  const [shortDescriptionArabic, setShortDescriptionArabic] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactWebsite, setContactWebsite] = useState('');
  const [ownerManagerName, setOwnerManagerName] = useState('');
  const [ownerManagerPhone, setOwnerManagerPhone] = useState('');
  const [ownerManagerEmail, setOwnerManagerEmail] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [closingHours, setClosingHours] = useState('');
  const [holidaySchedule, setHolidaySchedule] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [venueImages, setVenueImages] = useState([]);
  const [watermarkProtection, setWatermarkProtection] = useState(false);
  const [parkingAvailability, setParkingAvailability] = useState(false);
  const [parkingCapacity, setParkingCapacity] = useState('');
  const [foodCateringAvailability, setFoodCateringAvailability] = useState(false);
  const [stageLightingAudio, setStageLightingAudio] = useState(false);
  const [wheelchairAccessibility, setWheelchairAccessibility] = useState(false);
  const [securityArrangements, setSecurityArrangements] = useState(false);
  const [wifiAvailability, setWifiAvailability] = useState(false);
  const [washroomsInfo, setWashroomsInfo] = useState('');
  const [dressingRooms, setDressingRooms] = useState('');
  const [rentalType, setRentalType] = useState('hourly');
  const [hourlyPrice, setHourlyPrice] = useState('');
  const [perDayPrice, setPerDayPrice] = useState('');
  const [distanceWisePrice, setDistanceWisePrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [customPackages, setCustomPackages] = useState('');
  const [dynamicPricing, setDynamicPricing] = useState(false);
  const [advanceDeposit, setAdvanceDeposit] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [extraCharges, setExtraCharges] = useState('');
  const [seatingArrangement, setSeatingArrangement] = useState('');
  const [maxGuestsSeated, setMaxGuestsSeated] = useState('');
  const [maxGuestsStanding, setMaxGuestsStanding] = useState('');
  const [floorPlanFile, setFloorPlanFile] = useState(null);
  const [multipleHalls, setMultipleHalls] = useState(false);
  const [nearbyTransport, setNearbyTransport] = useState('');
  const [accessibilityInfo, setAccessibilityInfo] = useState('');
  const [documents, setDocuments] = useState([]);
  const [searchTags, setSearchTags] = useState('');
  const [providerId, setProviderId] = useState('68c2e5e707259c009c62f8fe'); // Replace with dynamic fetch if needed
  const [openToast, setOpenToast] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch venues on component mount or page change
  useEffect(() => {
    if (currentView === 'list') {
      fetchVenues(currentPage);
    }
  }, [currentView, currentPage]);

  // Fetch venues function
  const fetchVenues = async (page = 1) => {
    setLoadingVenues(true);
    try {
      const response = await fetch(`${API_BASE_URL}/createvenue?page=${page}&limit=10`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        const venuesData = data.data.venues || [];
        // Ensure image URLs are absolute
        const updatedVenues = venuesData.map(venue => ({
          ...venue,
          thumbnail: venue.thumbnail 
            ? venue.thumbnail.startsWith('http') 
              ? venue.thumbnail 
              : `${API_BASE_URL}/${venue.thumbnail.replace(/^\//, '')}`
            : null,
          images: venue.images && venue.images.length > 0 
            ? venue.images.map(img => 
                img.startsWith('http') ? img : `${API_BASE_URL}/${img.replace(/^\//, '')}`
              )
            : []
        }));
        setVenues(updatedVenues);
        setCurrentPage(data.pagination.currentPage || 1);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalItems(data.pagination.totalItems || 0);
      } else {
        throw new Error(data.message || 'Failed to fetch venues');
      }
    } catch (error) {
      console.error('Error fetching venues:', error.message);
      setErrorMessage('Error fetching venues: ' + error.message);
      setAlertSeverity('error');
      setOpenToast(true);
      // Fallback data
      setVenues([
        {
          _id: '1',
          venueName: 'Sample Venue 1',
          venueAddress: '123 Main St, City',
          thumbnail: 'https://via.placeholder.com/150?text=Sample+Venue+1',
          rentalType: 'hourly',
          hourlyPrice: 50,
          maxGuestsSeated: 200,
          isActive: true,
          facilities: {
            parkingAvailability: true,
            foodCateringAvailability: false,
            stageLightingAudio: true,
            wheelchairAccessibility: true,
            securityArrangements: false,
            wifiAvailability: true,
          },
          searchTags: ['event', 'conference'],
          images: [],
        },
        {
          _id: '2',
          venueName: 'Sample Venue 2',
          venueAddress: '456 Oak St, City',
          thumbnail: 'https://via.placeholder.com/150?text=Sample+Venue+2',
          rentalType: 'perDay',
          perDayPrice: 500,
          maxGuestsSeated: 300,
          isActive: false,
          facilities: {
            parkingAvailability: true,
            foodCateringAvailability: true,
            stageLightingAudio: false,
            wheelchairAccessibility: true,
            securityArrangements: true,
            wifiAvailability: false,
          },
          searchTags: ['wedding', 'party'],
          images: [],
        }
      ]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalItems(2);
    } finally {
      setLoadingVenues(false);
    }
  };

  // Handle image loading errors
  const handleImageError = (venueId) => {
    setImageErrors(prev => ({
      ...prev,
      [venueId]: true
    }));
  };

  // View venue details
  const handleViewVenue = (venue) => {
    setSelectedVenue(venue);
    setViewDialogOpen(true);
  };

  // Delete venue
  const handleDeleteVenue = async (venueId) => {
    if (window.confirm('Are you sure you want to delete this venue?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/createvenue/${venueId}`, {
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
          fetchVenues(currentPage); // Refresh the list
        } else {
          throw new Error(data.message || 'Failed to delete venue');
        }
      } catch (error) {
        console.error('Error deleting venue:', error.message);
        setErrorMessage('Error deleting venue: ' + error.message);
        setAlertSeverity('error');
        setOpenToast(true);
      }
    }
  };

  // Existing handlers
  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleFileChange = (setter) => (event) => {
    const files = Array.from(event.target.files);
    setter(files);
  };

  const handleDrop = (setter) => (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setter(files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleReset = () => {
    setTabValue(0);
    setVenueNameDefault('');
    setShortDescriptionDefault('');
    setVenueNameEnglish('');
    setShortDescriptionEnglish('');
    setVenueNameArabic('');
    setShortDescriptionArabic('');
    setVenueAddress('');
    setLatitude('');
    setLongitude('');
    setContactPhone('');
    setContactEmail('');
    setContactWebsite('');
    setOwnerManagerName('');
    setOwnerManagerPhone('');
    setOwnerManagerEmail('');
    setOpeningHours('');
    setClosingHours('');
    setHolidaySchedule('');
    setThumbnailFile(null);
    setVenueImages([]);
    setWatermarkProtection(false);
    setParkingAvailability(false);
    setParkingCapacity('');
    setFoodCateringAvailability(false);
    setStageLightingAudio(false);
    setWheelchairAccessibility(false);
    setSecurityArrangements(false);
    setWifiAvailability(false);
    setWashroomsInfo('');
    setDressingRooms('');
    setRentalType('hourly');
    setHourlyPrice('');
    setPerDayPrice('');
    setDistanceWisePrice('');
    setDiscount('');
    setCustomPackages('');
    setDynamicPricing(false);
    setAdvanceDeposit('');
    setCancellationPolicy('');
    setExtraCharges('');
    setSeatingArrangement('');
    setMaxGuestsSeated('');
    setMaxGuestsStanding('');
    setFloorPlanFile(null);
    setMultipleHalls(false);
    setNearbyTransport('');
    setAccessibilityInfo('');
    setDocuments([]);
    setSearchTags('');
    setErrorMessage('');
  };

  const validateForm = () => {
    const errors = [];
    
    if (!venueNameDefault.trim()) errors.push('Venue name is required');
    if (!venueAddress.trim()) errors.push('Venue address is required');
    if (!contactPhone.trim()) errors.push('Contact phone is required');
    if (!contactEmail.trim()) errors.push('Contact email is required');
    if (!ownerManagerName.trim()) errors.push('Owner/Manager name is required');
    if (!openingHours.trim()) errors.push('Opening hours are required');
    if (!closingHours.trim()) errors.push('Closing hours are required');
    if (!seatingArrangement) errors.push('Seating arrangement is required');
    if (!maxGuestsSeated) errors.push('Max guests seated is required');
    if (rentalType === 'hourly' && !hourlyPrice) errors.push('Hourly price is required');
    if (rentalType === 'perDay' && !perDayPrice) errors.push('Per day price is required');
    if (rentalType === 'distanceWise' && !distanceWisePrice) errors.push('Distance wise price is required');
    
    if (contactEmail && !/\S+@\S+\.\S+/.test(contactEmail)) {
      errors.push('Valid contact email is required');
    }
    
    if (ownerManagerEmail && !/\S+@\S+\.\S+/.test(ownerManagerEmail)) {
      errors.push('Valid owner/manager email is required');
    }
    
    if (latitude && isNaN(parseFloat(latitude))) {
      errors.push('Valid latitude is required');
    }
    
    if (longitude && isNaN(parseFloat(longitude))) {
      errors.push('Valid longitude is required');
    }

    return errors;
  };

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

    const formData = new FormData();
    formData.append('venueName', venueNameDefault);
    formData.append('shortDescription', shortDescriptionDefault);
    formData.append('venueAddress', venueAddress);
    formData.append('latitude', latitude || '');
    formData.append('longitude', longitude || '');
    formData.append('language', 'EN');
    if (thumbnailFile && thumbnailFile[0]) formData.append('thumbnail', thumbnailFile[0]);
    formData.append('contactPhone', contactPhone);
    formData.append('contactEmail', contactEmail);
    formData.append('contactWebsite', contactWebsite || '');
    formData.append('ownerManagerName', ownerManagerName);
    formData.append('ownerManagerPhone', ownerManagerPhone || '');
    formData.append('ownerManagerEmail', ownerManagerEmail || '');
    formData.append('openingHours', openingHours);
    formData.append('closingHours', closingHours);
    formData.append('holidaySchedule', holidaySchedule || '');
    venueImages.forEach((file) => formData.append('images', file));
    formData.append('watermarkProtection', watermarkProtection);
    formData.append('facilities[parkingAvailability]', parkingAvailability);
    formData.append('facilities[parkingCapacity]', parkingCapacity || '');
    formData.append('facilities[foodCateringAvailability]', foodCateringAvailability);
    formData.append('facilities[stageLightingAudio]', stageLightingAudio);
    formData.append('facilities[wheelchairAccessibility]', wheelchairAccessibility);
    formData.append('facilities[securityArrangements]', securityArrangements);
    formData.append('facilities[wifiAvailability]', wifiAvailability);
    formData.append('facilities[washroomsInfo]', washroomsInfo || '');
    formData.append('facilities[dressingRooms]', dressingRooms || '');
    formData.append('rentalType', rentalType);
    formData.append('hourlyPrice', rentalType === 'hourly' ? hourlyPrice : '');
    formData.append('perDayPrice', rentalType === 'perDay' ? perDayPrice : '');
    formData.append('distanceWisePrice', rentalType === 'distanceWise' ? distanceWisePrice : '');
    formData.append('discount', discount || '');
    formData.append('customPackages', customPackages || '');
    formData.append('dynamicPricing', dynamicPricing);
    formData.append('advanceDeposit', advanceDeposit || '');
    formData.append('cancellationPolicy', cancellationPolicy || '');
    formData.append('extraCharges', extraCharges || '');
    formData.append('seatingArrangement', seatingArrangement);
    formData.append('maxGuestsSeated', maxGuestsSeated || '');
    formData.append('maxGuestsStanding', maxGuestsStanding || '');
    if (floorPlanFile && floorPlanFile[0]) formData.append('floorPlan', floorPlanFile[0]);
    formData.append('multipleHalls', multipleHalls);
    formData.append('nearbyTransport', nearbyTransport || '');
    formData.append('accessibilityInfo', accessibilityInfo || '');
    documents.forEach((file) => formData.append('documents', file));
    formData.append('searchTags', searchTags.split(',').map(tag => tag.trim()).filter(tag => tag).join(',') || '');
    formData.append('provider', providerId);

    try {
      const response = await fetch(`${API_BASE_URL}/createvenue`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setErrorMessage('Venue created successfully');
        setAlertSeverity('success');
        setOpenToast(true);
        handleReset();
        setCurrentView('list'); // Switch back to list view
        fetchVenues(currentPage); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to create venue');
      }
    } catch (error) {
      console.error('Error submitting form:', error.message);
      setErrorMessage('Error submitting form: ' + error.message);
      setAlertSeverity('error');
      setOpenToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenToast(false);
    setErrorMessage('');
  };

  // Render venues list
  const renderVenuesList = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h1">Venue Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Total: {totalItems} venues
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCurrentView('create')}
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
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
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
                      label={`${venue.rentalType.charAt(0).toUpperCase() + venue.rentalType.slice(1)}`} 
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
                    {venue.rentalType === 'perDay' && `$${venue.perDayPrice}/day`}
                    {venue.rentalType === 'distanceWise' && `$${venue.distanceWisePrice}/km`}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewVenue(venue)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    color="info"
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
                {selectedVenue.rentalType === 'perDay' && ` $${selectedVenue.perDayPrice}/day`}
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
              {selectedVenue.facilities.parkingAvailability && (
                <Chip label="Parking Available" size="small" color="success" />
              )}
              {selectedVenue.facilities.foodCateringAvailability && (
                <Chip label="Food & Catering" size="small" color="success" />
              )}
              {selectedVenue.facilities.stageLightingAudio && (
                <Chip label="Stage/Lighting/Audio" size="small" color="success" />
              )}
              {selectedVenue.facilities.wheelchairAccessibility && (
                <Chip label="Wheelchair Accessible" size="small" color="success" />
              )}
              {selectedVenue.facilities.securityArrangements && (
                <Chip label="Security" size="small" color="success" />
              )}
              {selectedVenue.facilities.wifiAvailability && (
                <Chip label="Wi-Fi" size="small" color="success" />
              )}
            </Box>

            {selectedVenue.searchTags && selectedVenue.searchTags.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedVenue.searchTags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
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
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: theme.shape.borderRadius
                      }}
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

  // Render create form
  const renderCreateForm = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ListIcon />}
            onClick={() => setCurrentView('list')}
            variant="outlined"
          >
            Back to List
          </Button>
          <Typography variant="h5" component="h1">Add New Venue</Typography>
        </Box>
        <Tooltip title="Settings">
          <IconButton color="primary" sx={{ backgroundColor: 'white', border: `1px solid ${theme.palette.grey[300]}` }}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Insert the basic information of the Venue
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', gap: 3, mb: 4 }}>
          <Card sx={{ flex: isSmallScreen ? 'auto' : 2, p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" gutterBottom>General Information</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Insert the basic information of the Venue
              </Typography>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="language tabs">
                  <Tab label="Default" {...a11yProps(0)} />
                  <Tab label="English(EN)" {...a11yProps(1)} />
                  <Tab label="العربية - Arabic (AR)" {...a11yProps(2)} />
                </Tabs>
              </Box>
              <TabPanel value={tabValue} index={0}>
                <TextField
                  fullWidth
                  label="Venue name (Default)*"
                  variant="outlined"
                  value={venueNameDefault}
                  onChange={(e) => setVenueNameDefault(e.target.value)}
                  placeholder="Type venue name"
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Short description (Default)"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={shortDescriptionDefault}
                  onChange={(e) => setShortDescriptionDefault(e.target.value)}
                  placeholder="Type venue description"
                />
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <TextField
                  fullWidth
                  label="Venue name (English)"
                  variant="outlined"
                  value={venueNameEnglish}
                  onChange={(e) => setVenueNameEnglish(e.target.value)}
                  placeholder="Type venue name in English"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Short description (English)"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={shortDescriptionEnglish}
                  onChange={(e) => setShortDescriptionEnglish(e.target.value)}
                  placeholder="Type short description in English"
                />
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <TextField
                  fullWidth
                  label="Venue name (Arabic)"
                  variant="outlined"
                  value={venueNameArabic}
                  onChange={(e) => setVenueNameArabic(e.target.value)}
                  placeholder="Type venue name in Arabic"
                  sx={{ mb: 2 }}
                  dir="rtl"
                  inputProps={{ style: { textAlign: 'right' } }}
                />
                <TextField
                  fullWidth
                  label="Short description (Arabic)"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={shortDescriptionArabic}
                  onChange={(e) => setShortDescriptionArabic(e.target.value)}
                  placeholder="Type short description in Arabic"
                  dir="rtl"
                  inputProps={{ style: { textAlign: 'right' } }}
                />
              </TabPanel>
              <TextField
                fullWidth
                label="Venue Address*"
                variant="outlined"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="Full address with Google Maps integration"
                sx={{ mb: 2 }}
                required
              />
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Latitude"
                  variant="outlined"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Auto-detect latitude"
                  type="number"
                />
                <TextField
                  fullWidth
                  label="Longitude"
                  variant="outlined"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Auto-detect longitude"
                  type="number"
                />
              </Box>
              <TextField
                fullWidth
                label="Contact Phone*"
                variant="outlined"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Phone number"
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Contact Email*"
                variant="outlined"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Email address"
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Contact Website"
                variant="outlined"
                value={contactWebsite}
                onChange={(e) => setContactWebsite(e.target.value)}
                placeholder="Website URL"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Owner/Manager Name*"
                variant="outlined"
                value={ownerManagerName}
                onChange={(e) => setOwnerManagerName(e.target.value)}
                placeholder="Name"
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Owner/Manager Phone"
                variant="outlined"
                value={ownerManagerPhone}
                onChange={(e) => setOwnerManagerPhone(e.target.value)}
                placeholder="Phone number"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Owner/Manager Email"
                variant="outlined"
                value={ownerManagerEmail}
                onChange={(e) => setOwnerManagerEmail(e.target.value)}
                placeholder="Email address"
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Opening Hours*"
                  variant="outlined"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="e.g., 09:00 AM"
                  required
                />
                <TextField
                  fullWidth
                  label="Closing Hours*"
                  variant="outlined"
                  value={closingHours}
                  onChange={(e) => setClosingHours(e.target.value)}
                  placeholder="e.g., 10:00 PM"
                  required
                />
              </Box>
              <TextField
                fullWidth
                label="Holiday Scheduling"
                variant="outlined"
                multiline
                rows={2}
                value={holidaySchedule}
                onChange={(e) => setHolidaySchedule(e.target.value)}
                placeholder="Holiday schedule details"
              />
            </CardContent>
          </Card>
          <Card sx={{ flex: isSmallScreen ? 'auto' : 1, p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" gutterBottom>Venue Thumbnail*</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                JPG, JPEG, PNG Less Than 1MB (Ratio 2:1)
              </Typography>
              <UploadDropArea
                onDragOver={handleDragOver}
                onDrop={handleDrop((files) => setThumbnailFile(files))}
                onClick={() => document.getElementById('thumbnail-upload').click()}
              >
                {thumbnailFile && thumbnailFile.length > 0 ? (
                  <Box>
                    <img
                      src={URL.createObjectURL(thumbnailFile[0])}
                      alt="Thumbnail preview"
                      style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain', marginBottom: theme.spacing(1) }}
                    />
                    <Typography variant="body2" color="text.secondary">{thumbnailFile[0].name}</Typography>
                  </Box>
                ) : (
                  <Box>
                    <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                    <Typography variant="body2" color="primary" sx={{ mb: 0.5, fontWeight: 'medium' }}>Click to upload</Typography>
                    <Typography variant="body2" color="text.secondary">Or drag and drop</Typography>
                  </Box>
                )}
                <input
                  type="file"
                  id="thumbnail-upload"
                  hidden
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange((files) => setThumbnailFile(files))}
                />
              </UploadDropArea>
            </CardContent>
          </Card>
        </Box>

        {/* Media Enhancements */}
        <Box sx={{ mb: 4 }}>
          <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" gutterBottom>Media Enhancements*</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Upload images</Typography>
              <UploadDropArea
                onDragOver={handleDragOver}
                onDrop={handleDrop(setVenueImages)}
                onClick={() => document.getElementById('images-upload').click()}
                sx={{ mb: 2 }}
              >
                {venueImages.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {venueImages.map((file, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`Venue image ${index + 1}`}
                        style={{ maxWidth: 80, maxHeight: 80, objectFit: 'cover', borderRadius: theme.shape.borderRadius }}
                      />
                    ))}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, width: '100%' }}>
                      {venueImages.length} image(s) selected
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                    <Typography variant="body2" color="primary" sx={{ mb: 0.5, fontWeight: 'medium' }}>Click to upload images</Typography>
                    <Typography variant="body2" color="text.secondary">Or drag and drop (Gallery)</Typography>
                  </Box>
                )}
                <input
                  type="file"
                  id="images-upload"
                  hidden
                  accept="image/jpeg,image/png,image/jpg"
                  multiple
                  onChange={handleFileChange(setVenueImages)}
                />
              </UploadDropArea>
              <FormControlLabel
                control={<Switch checked={watermarkProtection} onChange={(e) => setWatermarkProtection(e.target.checked)} />}
                label="Enable Watermark Protection for Images"
              />
            </CardContent>
          </Card>
        </Box>

        {/* Venue Facilities */}
        <Box sx={{ mb: 4 }}>
          <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" gutterBottom>Venue Facilities</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Specify available facilities</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, 1fr)', gap: theme.spacing(3) }}>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch checked={parkingAvailability} onChange={(e) => setParkingAvailability(e.target.checked)} />}
                    label="Parking Availability"
                  />
                  <TextField
                    fullWidth
                    label="Parking Capacity"
                    variant="outlined"
                    value={parkingCapacity}
                    onChange={(e) => setParkingCapacity(e.target.value)}
                    placeholder="Number of spots"
                    type="number"
                  />
                  <FormControlLabel
                    control={<Switch checked={foodCateringAvailability} onChange={(e) => setFoodCateringAvailability(e.target.checked)} />}
                    label="Food & Catering Availability"
                  />
                  <FormControlLabel
                    control={<Switch checked={stageLightingAudio} onChange={(e) => setStageLightingAudio(e.target.checked)} />}
                    label="Stage / Lighting / Audio System"
                  />
                </Stack>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch checked={wheelchairAccessibility} onChange={(e) => setWheelchairAccessibility(e.target.checked)} />}
                    label="Wheelchair Accessibility"
                  />
                  <FormControlLabel
                    control={<Switch checked={securityArrangements} onChange={(e) => setSecurityArrangements(e.target.checked)} />}
                    label="Security Arrangements"
                  />
                  <FormControlLabel
                    control={<Switch checked={wifiAvailability} onChange={(e) => setWifiAvailability(e.target.checked)} />}
                    label="Wi-Fi Availability"
                  />
                  <TextField
                    fullWidth
                    label="Washrooms/Restrooms Info"
                    variant="outlined"
                    value={washroomsInfo}
                    onChange={(e) => setWashroomsInfo(e.target.value)}
                    placeholder="Details about washrooms"
                  />
                  <TextField
                    fullWidth
                    label="Dressing Rooms/Green Rooms"
                    variant="outlined"
                    value={dressingRooms}
                    onChange={(e) => setDressingRooms(e.target.value)}
                    placeholder="Details about dressing rooms"
                  />
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Pricing & Booking Options */}
        <Box sx={{ mb: 4 }}>
          <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" gutterBottom>Pricing & Booking Options</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Insert The Pricing & Discount Informations</Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Rental Type</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Choose the rental type you prefer.</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(3, 1fr)', gap: theme.spacing(2) }}>
                  <Card
                    variant="outlined"
                    sx={{ p: 2, cursor: 'pointer', borderColor: rentalType === 'hourly' ? theme.palette.primary.main : undefined, borderWidth: rentalType === 'hourly' ? 2 : 1 }}
                    onClick={() => setRentalType('hourly')}
                  >
                    <FormControlLabel
                      control={<Radio checked={rentalType === 'hourly'} onChange={() => setRentalType('hourly')} />}
                      label="Hourly"
                      labelPlacement="start"
                      sx={{ m: 0, '.MuiFormControlLabel-label': { ml: 'auto' } }}
                    />
                    <Typography variant="body2" color="text.secondary">Set your hourly rental price.</Typography>
                  </Card>
                  <Card
                    variant="outlined"
                    sx={{ p: 2, cursor: 'pointer', borderColor: rentalType === 'perDay' ? theme.palette.primary.main : undefined, borderWidth: rentalType === 'perDay' ? 2 : 1 }}
                    onClick={() => setRentalType('perDay')}
                  >
                    <FormControlLabel
                      control={<Radio checked={rentalType === 'perDay'} onChange={() => setRentalType('perDay')} />}
                      label="Per Day"
                      labelPlacement="start"
                      sx={{ m: 0, '.MuiFormControlLabel-label': { ml: 'auto' } }}
                    />
                    <Typography variant="body2" color="text.secondary">Set your per day rental price.</Typography>
                  </Card>
                  <Card
                    variant="outlined"
                    sx={{ p: 2, cursor: 'pointer', borderColor: rentalType === 'distanceWise' ? theme.palette.primary.main : undefined, borderWidth: rentalType === 'distanceWise' ? 2 : 1 }}
                    onClick={() => setRentalType('distanceWise')}
                  >
                    <FormControlLabel
                      control={<Radio checked={rentalType === 'distanceWise'} onChange={() => setRentalType('distanceWise')} />}
                      label="Distance Wise"
                      labelPlacement="start"
                      sx={{ m: 0, '.MuiFormControlLabel-label': { ml: 'auto' } }}
                    />
                    <Typography variant="body2" color="text.secondary">Set your distance wise rental price.</Typography>
                  </Card>
                </Box>
              </Box>
              {rentalType === 'hourly' && (
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Hourly Price ($/per hour)*"
                    variant="outlined"
                    value={hourlyPrice}
                    onChange={(e) => setHourlyPrice(e.target.value)}
                    placeholder="Ex: 35.25"
                    type="number"
                    inputProps={{ step: "0.01" }}
                    required
                  />
                </Box>
              )}
              {rentalType === 'perDay' && (
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Per Day Price ($/per day)*"
                    variant="outlined"
                    value={perDayPrice}
                    onChange={(e) => setPerDayPrice(e.target.value)}
                    placeholder="Ex: 250.00"
                    type="number"
                    inputProps={{ step: "0.01" }}
                    required
                  />
                </Box>
              )}
              {rentalType === 'distanceWise' && (
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Distance Wise Price ($/per km)*"
                    variant="outlined"
                    value={distanceWisePrice}
                    onChange={(e) => setDistanceWisePrice(e.target.value)}
                    placeholder="Ex: 1.50"
                    type="number"
                    inputProps={{ step: "0.01" }}
                    required
                  />
                </Box>
              )}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Give Discount</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Set a discount that applies to all pricing types—hourly, daily, and distance-based
                </Typography>
                <TextField
                  fullWidth
                  label="Discount"
                  variant="outlined"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="Ex: 10"
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                />
              </Box>
              <TextField
                fullWidth
                label="Custom Packages (e.g., Wedding, Corporate)"
                variant="outlined"
                multiline
                rows={2}
                value={customPackages}
                onChange={(e) => setCustomPackages(e.target.value)}
                placeholder="Describe custom packages"
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={<Switch checked={dynamicPricing} onChange={(e) => setDynamicPricing(e.target.checked)} />}
                label="Enable Dynamic Pricing (Weekend/Holiday higher rates)"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Advance Payment / Deposit %"
                variant="outlined"
                value={advanceDeposit}
                onChange={(e) => setAdvanceDeposit(e.target.value)}
                placeholder="Ex: 20"
                type="number"
                inputProps={{ min: 0, max: 100 }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Cancellation Policy"
                variant="outlined"
                multiline
                rows={2}
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                placeholder="e.g., Free cancellation 48 hours before"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Extra Charges (e.g., Cleaning fee)"
                variant="outlined"
                multiline
                rows={2}
                value={extraCharges}
                onChange={(e) => setExtraCharges(e.target.value)}
                placeholder="Describe extra charges"
              />
            </CardContent>
          </Card>
        </Box>

        {/* Capacity & Layout */}
        <Box sx={{ mb: 4 }}>
          <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" gutterBottom>Capacity & Layout</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Specify capacity and layout details</Typography>
              <FormControl fullWidth variant="outlined" required sx={{ mb: 2 }}>
                <InputLabel id="seating-arrangement-label">Seating Arrangement*</InputLabel>
                <Select
                  labelId="seating-arrangement-label"
                  id="seating-arrangement-select"
                  value={seatingArrangement}
                  label="Seating Arrangement"
                  onChange={(e) => setSeatingArrangement(e.target.value)}
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
                  label="Max Guest Count (Seated)*"
                  variant="outlined"
                  value={maxGuestsSeated}
                  onChange={(e) => setMaxGuestsSeated(e.target.value)}
                  placeholder="e.g., 200"
                  type="number"
                  required
                />
                <TextField
                  fullWidth
                  label="Max Guest Count (Standing)"
                  variant="outlined"
                  value={maxGuestsStanding}
                  onChange={(e) => setMaxGuestsStanding(e.target.value)}
                  placeholder="e.g., 300"
                  type="number"
                />
              </Box>
              <UploadDropArea
                onDragOver={handleDragOver}
                onDrop={handleDrop((files) => setFloorPlanFile(files))}
                onClick={() => document.getElementById('floor-plan-upload').click()}
                sx={{ mb: 2 }}
              >
                {floorPlanFile && floorPlanFile.length > 0 ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary">{floorPlanFile[0].name}</Typography>
                  </Box>
                ) : (
                  <Box>
                    <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                    <Typography variant="body2" color="primary" sx={{ mb: 0.5, fontWeight: 'medium' }}>Click to upload Floor Plan (PDF/Image)</Typography>
                    <Typography variant="body2" color="text.secondary">Or drag and drop</Typography>
                  </Box>
                )}
                <input
                  type="file"
                  id="floor-plan-upload"
                  hidden
                  accept="image/*,application/pdf"
                  onChange={handleFileChange((files) => setFloorPlanFile(files))}
                />
              </UploadDropArea>
              <FormControlLabel
                control={<Switch checked={multipleHalls} onChange={(e) => setMultipleHalls(e.target.checked)} />}
                label="Multiple Halls/Sections Under One Venue"
              />
            </CardContent>
          </Card>
        </Box>

        {/* Location & Accessibility */}
        <Box sx={{ mb: 4 }}>
          <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" gutterBottom>Location & Accessibility</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Provide location and accessibility details</Typography>
              <TextField
                fullWidth
                label="Nearby Transport (metro, bus, airport)"
                variant="outlined"
                multiline
                rows={2}
                value={nearbyTransport}
                onChange={(e) => setNearbyTransport(e.target.value)}
                placeholder="Describe nearby transport options"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Accessibility Info"
                variant="outlined"
                multiline
                rows={2}
                value={accessibilityInfo}
                onChange={(e) => setAccessibilityInfo(e.target.value)}
                placeholder="Describe accessibility details"
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Box>

        {/* Venue Documents */}
        <Box sx={{ mb: 4 }}>
          <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" gutterBottom>Venue Documents*</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Upload relevant documents (PDF, etc.)</Typography>
              <UploadDropArea
                onDragOver={handleDragOver}
                onDrop={handleDrop(setDocuments)}
                onClick={() => document.getElementById('doc-upload').click()}
              >
                {documents.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {documents.map((file, index) => (
                      <Typography key={index} variant="body2" color="text.secondary">{file.name}</Typography>
                    ))}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, width: '100%' }}>
                      {documents.length} document(s) selected
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                    <Typography variant="body2" color="primary" sx={{ mb: 0.5, fontWeight: 'medium' }}>Click to upload</Typography>
                    <Typography variant="body2" color="text.secondary">Or drag and drop</Typography>
                  </Box>
                )}
                <input
                  type="file"
                  id="doc-upload"
                  hidden
                  accept="application/pdf,image/*"
                  multiple
                  onChange={handleFileChange(setDocuments)}
                />
              </UploadDropArea>
            </CardContent>
          </Card>
        </Box>

        {/* Search Tags */}
        <Box sx={{ mb: 4 }}>
          <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" gutterBottom>Search Tags</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Insert The Tags For Appear In User s Search List
              </Typography>
              <TextField
                fullWidth
                label="Type and press Enter (comma-separated)"
                variant="outlined"
                value={searchTags}
                onChange={(e) => setSearchTags(e.target.value)}
                placeholder="e.g., event, wedding, conference"
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            type="submit"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3, backgroundColor: theme.palette.grey[100], minHeight: '100vh', width: '100%' }}>
      <Box sx={{
        maxWidth: 'lg',
        margin: 'auto',
        backgroundColor: 'white',
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[1],
        p: isSmallScreen ? 2 : 3,
        overflowX: 'hidden',
      }}>
        {currentView === 'list' ? renderVenuesList() : renderCreateForm()}
        {renderVenueDialog()}

        <Snackbar 
          open={openToast} 
          autoHideDuration={3000} 
          onClose={handleCloseToast} 
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseToast} 
            severity={alertSeverity} 
            sx={{ width: '100%' }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Createauditorium;
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
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Pagination,
  Chip,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Settings as SettingsIcon, Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
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

const Createnew = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  // State for General Information
  const [tabValue, setTabValue] = useState(0);
  const [vehicleNameDefault, setVehicleNameDefault] = useState('');
  const [shortDescriptionDefault, setShortDescriptionDefault] = useState('');
  const [vehicleNameEnglish, setVehicleNameEnglish] = useState('');
  const [shortDescriptionEnglish, setShortDescriptionEnglish] = useState('');
  const [vehicleNameArabic, setVehicleNameArabic] = useState('');
  const [shortDescriptionArabic, setShortDescriptionArabic] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  // State for Images section
  const [vehicleImages, setVehicleImages] = useState([]);
  // State for Vehicle Information section
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [engineCapacity, setEngineCapacity] = useState('');
  const [enginePower, setEnginePower] = useState('');
  const [seatingCapacity, setSeatingCapacity] = useState('');
  const [airCondition, setAirCondition] = useState('yes');
  const [fuelType, setFuelType] = useState('');
  const [transmissionType, setTransmissionType] = useState('');
  // State for Vehicle Identity section
  const [vinNumber, setVinNumber] = useState('');
  const [licensePlateNumber, setLicensePlateNumber] = useState('');
  const [sameModelMultipleVehicles, setSameModelMultipleVehicles] = useState(false);
  // State for Additional Vehicle Identity section
  const [additionalVinNumber, setAdditionalVinNumber] = useState('');
  const [additionalLicensePlateNumber, setAdditionalLicensePlateNumber] = useState('');
  // State for Pricing & Discounts section
  const [tripType, setTripType] = useState('hourly');
  const [hourlyWisePrice, setHourlyWisePrice] = useState('');
  const [perDayPrice, setPerDayPrice] = useState('');
  const [distanceWisePrice, setDistanceWisePrice] = useState('');
  const [giveDiscount, setGiveDiscount] = useState('');
  const [discountType, setDiscountType] = useState('%');
  // Vehicle document
  const [vehicleDoc, setVehicleDoc] = useState([]);
  // State for toast message
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');
  // State for multiple vehicle images
  const [multipleVehicleImages, setMultipleVehicleImages] = useState([]);
  // State for fetching brands, categories, and vehicles
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Base API URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Fetch brands
  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please log in.');
      const response = await fetch(`${API_BASE_URL}/brands`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch brands');
      if (data.success) {
        setBrands(data.data.brands || []);
      } else {
        throw new Error(data.message || 'Failed to fetch brands');
      }
    } catch (err) {
      setError(err.message);
      setToastMessage(err.message);
      setToastSeverity('error');
      setOpenToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please log in.');
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch categories');
      if (data.success) {
        setCategories(data.data.categories || []);
      } else {
        throw new Error(data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError(err.message);
      setToastMessage(err.message);
      setToastSeverity('error');
      setOpenToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please log in.');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      const response = await fetch(`${API_BASE_URL}/vehicles?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch vehicles');
      if (data.success) {
        setVehicles(data.data.vehicles || []);
        if (data.pagination) {
          setCurrentPage(data.pagination.currentPage);
          setTotalPages(data.pagination.totalPages);
          setTotalItems(data.pagination.totalItems);
          setItemsPerPage(data.pagination.itemsPerPage);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch vehicles');
      }
    } catch (err) {
      setError(err.message);
      setToastMessage(err.message);
      setToastSeverity('error');
      setOpenToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Validate VIN and License Plate Number
  const validateVehicleIdentity = async (vin, licensePlate, additionalVin = '', additionalLicensePlate = '') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please log in.');
      const response = await fetch(`${API_BASE_URL}/vehicles/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          vinNumber: vin || undefined,
          licensePlateNumber: licensePlate || undefined,
          ...(sameModelMultipleVehicles && {
            additionalVinNumber: additionalVin || undefined,
            additionalLicensePlateNumber: additionalLicensePlate || undefined,
          }),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid VIN or License Plate Number');
      }
      return true;
    } catch (err) {
      setToastMessage(err.message);
      setToastSeverity('error');
      setOpenToast(true);
      return false;
    }
  };

  // Fetch brands, categories, and vehicles on mount
  useEffect(() => {
    fetchBrands();
    fetchCategories();
    fetchVehicles();
  }, [currentPage, itemsPerPage]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchVehicles();
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1);
  };

  // Handlers for General Information
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleThumbnailFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size > 1 * 1024 * 1024) {
      setToastMessage('Thumbnail file size must be less than 1MB.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }
    setThumbnailFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDropThumbnail = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.size > 1 * 1024 * 1024) {
      setToastMessage('Thumbnail file size must be less than 1MB.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }
    setThumbnailFile(file);
  };

  // Handlers for Vehicle Images
  const handleVehicleImagesChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.some(file => file.size > 1 * 1024 * 1024)) {
      setToastMessage('Each vehicle image must be less than 1MB.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }
    setVehicleImages(files);
  };

  const handleDropImages = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.some(file => file.size > 1 * 1024 * 1024)) {
      setToastMessage('Each vehicle image must be less than 1MB.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }
    setVehicleImages(files);
  };

  // Handlers for vehicle document
  const handleVehicleDocChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.some(file => file.size > 2 * 1024 * 1024)) {
      setToastMessage('Each document must be less than 2MB.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }
    setVehicleDoc(files);
  };

  const handleDropDoc = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.some(file => file.size > 2 * 1024 * 1024)) {
      setToastMessage('Each document must be less than 2MB.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }
    setVehicleDoc(files);
  };

  // Handler for multiple vehicle images
  const handleMultipleVehicleImagesChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.some(file => file.size > 1 * 1024 * 1024)) {
      setToastMessage('Each additional vehicle image must be less than 1MB.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }
    setMultipleVehicleImages(files);
  };

  const handleDropMultipleImages = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.some(file => file.size > 1 * 1024 * 1024)) {
      setToastMessage('Each additional vehicle image must be less than 1MB.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }
    setMultipleVehicleImages(files);
  };

  const handleReset = () => {
    setVehicleNameDefault('');
    setShortDescriptionDefault('');
    setVehicleNameEnglish('');
    setShortDescriptionEnglish('');
    setVehicleNameArabic('');
    setShortDescriptionArabic('');
    setThumbnailFile(null);
    setVehicleImages([]);
    setVehicleDoc([]);
    setBrand('');
    setModel('');
    setCategory('');
    setType('');
    setEngineCapacity('');
    setEnginePower('');
    setSeatingCapacity('');
    setAirCondition('yes');
    setFuelType('');
    setTransmissionType('');
    setVinNumber('');
    setLicensePlateNumber('');
    setSameModelMultipleVehicles(false);
    setAdditionalVinNumber('');
    setAdditionalLicensePlateNumber('');
    setTripType('hourly');
    setHourlyWisePrice('');
    setPerDayPrice('');
    setDistanceWisePrice('');
    setGiveDiscount('');
    setDiscountType('%');
    setMultipleVehicleImages([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Validation
    if (
      !vehicleNameDefault ||
      !brand ||
      !model ||
      !category ||
      !type ||
      !engineCapacity ||
      !enginePower ||
      !seatingCapacity ||
      !fuelType ||
      !transmissionType ||
      !tripType ||
      (tripType === 'hourly' && !hourlyWisePrice) ||
      (tripType === 'perDay' && !perDayPrice) ||
      (tripType === 'distanceWise' && !distanceWisePrice) ||
      !vinNumber ||
      !licensePlateNumber
    ) {
      setToastMessage('Please fill all required fields.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }
    if (!thumbnailFile) {
      setToastMessage('Please upload a thumbnail image.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }
    if (vehicleImages.length === 0) {
      setToastMessage('Please upload at least one vehicle image.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }
    if (sameModelMultipleVehicles && (!additionalVinNumber || !additionalLicensePlateNumber)) {
      setToastMessage('Please provide additional VIN and License Plate Number.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }

    // Validate VIN and License Plate Numbers
    const isValid = await validateVehicleIdentity(vinNumber, licensePlateNumber, additionalVinNumber, additionalLicensePlateNumber);
    if (!isValid) return;

    // Prepare form data for primary vehicle
    const formData = new FormData();
    formData.append('name', vehicleNameDefault);
    formData.append('description', shortDescriptionDefault);
    formData.append('brand', brand);
    formData.append('model', model);
    formData.append('category', category);
    formData.append('type', type);
    formData.append('engineCapacity', engineCapacity);
    formData.append('enginePower', enginePower);
    formData.append('seatingCapacity', seatingCapacity);
    formData.append('airCondition', airCondition === 'yes');
    formData.append('fuelType', fuelType);
    formData.append('transmissionType', transmissionType);
    formData.append('pricing[hourly]', tripType === 'hourly' ? hourlyWisePrice : 0);
    formData.append('pricing[perDay]', tripType === 'perDay' ? perDayPrice : 0);
    formData.append('pricing[distanceWise]', tripType === 'distanceWise' ? distanceWisePrice : 0);
    formData.append('discount', giveDiscount || 0);
    formData.append('thumbnail', thumbnailFile);
    vehicleImages.forEach((image) => {
      formData.append('images', image);
    });
    formData.append('vinNumber', vinNumber);
    formData.append('licensePlateNumber', licensePlateNumber);
    vehicleDoc.forEach((doc) => {
      formData.append('documents', doc);
    });

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please log in.');

      // Create primary vehicle
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create vehicle');
      }

      if (data.success) {
        setVehicles([data.data.vehicle, ...vehicles]);
        setCurrentPage(1);

        // Handle additional vehicle if sameModelMultipleVehicles is true
        if (sameModelMultipleVehicles) {
          const additionalFormData = new FormData();
          additionalFormData.append('name', vehicleNameDefault);
          additionalFormData.append('description', shortDescriptionDefault);
          additionalFormData.append('brand', brand);
          additionalFormData.append('model', model);
          additionalFormData.append('category', category);
          additionalFormData.append('type', type);
          additionalFormData.append('engineCapacity', engineCapacity);
          additionalFormData.append('enginePower', enginePower);
          additionalFormData.append('seatingCapacity', seatingCapacity);
          additionalFormData.append('airCondition', airCondition === 'yes');
          additionalFormData.append('fuelType', fuelType);
          additionalFormData.append('transmissionType', transmissionType);
          additionalFormData.append('pricing[hourly]', tripType === 'hourly' ? hourlyWisePrice : 0);
          additionalFormData.append('pricing[perDay]', tripType === 'perDay' ? perDayPrice : 0);
          additionalFormData.append('pricing[distanceWise]', tripType === 'distanceWise' ? distanceWisePrice : 0);
          additionalFormData.append('discount', giveDiscount || 0);
          if (thumbnailFile) {
            additionalFormData.append('thumbnail', thumbnailFile);
          }
          multipleVehicleImages.forEach((image) => {
            additionalFormData.append('images', image);
          });
          additionalFormData.append('vinNumber', additionalVinNumber);
          additionalFormData.append('licensePlateNumber', additionalLicensePlateNumber);
          vehicleDoc.forEach((doc) => {
            additionalFormData.append('documents', doc);
          });

          const additionalResponse = await fetch(`${API_BASE_URL}/vehicles`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: additionalFormData,
          });

          const additionalData = await additionalResponse.json();

          if (!additionalResponse.ok) {
            throw new Error(additionalData.message || 'Failed to create additional vehicle');
          }

          if (additionalData.success) {
            setVehicles([additionalData.data.vehicle, ...vehicles]);
          }
        }

        setToastMessage('Vehicle(s) created successfully!');
        setToastSeverity('success');
        setOpenToast(true);
        handleReset();
      } else {
        throw new Error(data.message || 'Failed to create vehicle');
      }
    } catch (err) {
      console.error('Error creating vehicle:', err);
      setToastMessage(err.message || 'Error creating vehicle. Please try again.');
      setToastSeverity('error');
      setOpenToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenToast(false);
  };

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3, backgroundColor: theme.palette.grey['100'], minHeight: '100vh', width: '100%' }}>
      <Box sx={{
        maxWidth: 'lg',
        margin: 'auto',
        backgroundColor: 'white',
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[1],
        p: isSmallScreen ? 2 : 3,
        overflowX: 'hidden'
      }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src="https://via.placeholder.com/24" alt="Vehicle Icon" style={{ marginRight: 8 }} />
            <Typography variant="h5" component="h1">
              Add New Vehicle
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              variant="outlined"
              placeholder="Search by vehicle name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchVehicles}
              disabled={loading}
            >
              Refresh
            </Button>
            <Tooltip title="Settings">
              <IconButton color="primary" sx={{ backgroundColor: 'white', border: `1px solid ${theme.palette.grey['200']}` }}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Insert the basic information of the vehicle
        </Typography>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {/* Vehicles Table */}
        <Box sx={{ mb: 4 }}>
          <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey['200']}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Vehicles
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              ) : vehicles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No vehicles found. Add a new vehicle below.
                </Typography>
              ) : (
                <>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Brand</TableCell>
                        <TableCell>Model</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vehicles.map((vehicle) => (
                        <TableRow key={vehicle._id}>
                          <TableCell>{vehicle.name}</TableCell>
                          <TableCell>{vehicle.brand?.name || 'N/A'}</TableCell>
                          <TableCell>{vehicle.model}</TableCell>
                          <TableCell>{vehicle.type}</TableCell>
                          <TableCell>
                            <Chip
                              label={vehicle.isActive ? 'Active' : 'Inactive'}
                              color={vehicle.isActive ? 'success' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControl variant="outlined" size="small">
                      <InputLabel>Items per page</InputLabel>
                      <Select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        label="Items per page"
                      >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                      </Select>
                    </FormControl>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
        <Box component="form" onSubmit={handleSubmit}>
          {/* General Information & Vehicle Thumbnail */}
          <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', gap: 3, mb: 4 }}>
            <Card sx={{ flex: isSmallScreen ? 'auto' : 2, p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey['200']}` }}>
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" gutterBottom>
                  General Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Insert the basic information of the vehicle
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
                    label="Vehicle name (Default)*"
                    variant="outlined"
                    value={vehicleNameDefault}
                    onChange={(e) => setVehicleNameDefault(e.target.value)}
                    placeholder="Type vehicle name"
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
                    placeholder="Type short description"
                  />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <TextField
                    fullWidth
                    label="Vehicle name (English)"
                    variant="outlined"
                    value={vehicleNameEnglish}
                    onChange={(e) => setVehicleNameEnglish(e.target.value)}
                    placeholder="Type vehicle name in English"
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
                    label="Vehicle name (Arabic)"
                    variant="outlined"
                    value={vehicleNameArabic}
                    onChange={(e) => setVehicleNameArabic(e.target.value)}
                    placeholder="Type vehicle name in Arabic"
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
              </CardContent>
            </Card>
            <Card sx={{ flex: isSmallScreen ? 'auto' : 1, p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey['200']}` }}>
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" gutterBottom>
                  Vehicle Thumbnail*
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  JPG, JPEG, PNG Less Than 1MB (Ratio 2:1)
                </Typography>
                <UploadDropArea
                  onDragOver={handleDragOver}
                  onDrop={handleDropThumbnail}
                  onClick={() => document.getElementById('thumbnail-upload').click()}
                >
                  {thumbnailFile ? (
                    <Box>
                      <img
                        src={URL.createObjectURL(thumbnailFile)}
                        alt="Thumbnail preview"
                        style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain', marginBottom: theme.spacing(1) }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {thumbnailFile.name}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                      <Typography variant="body2" color="primary" sx={{ mb: 0.5, fontWeight: 'medium' }}>
                        Click to upload
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Or drag and drop
                      </Typography>
                    </Box>
                  )}
                  <input
                    type="file"
                    id="thumbnail-upload"
                    hidden
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleThumbnailFileChange}
                  />
                </UploadDropArea>
              </CardContent>
            </Card>
          </Box>
          {!sameModelMultipleVehicles && (
            <Box sx={{ mb: 4 }}>
              <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey['200']}` }}>
                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                  <Typography variant="h6" gutterBottom>
                    Images*
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    JPG, JPEG, PNG Less Than 1MB (Ratio 2:1)
                  </Typography>
                  <UploadDropArea
                    onDragOver={handleDragOver}
                    onDrop={handleDropImages}
                    onClick={() => document.getElementById('images-upload').click()}
                  >
                    {vehicleImages.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                        {vehicleImages.map((file, index) => (
                          <img
                            key={index}
                            src={URL.createObjectURL(file)}
                            alt={`Vehicle image ${index + 1}`}
                            style={{ maxWidth: 80, maxHeight: 80, objectFit: 'cover', borderRadius: theme.shape.borderRadius }}
                          />
                        ))}
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, width: '100%' }}>
                          {vehicleImages.length} image(s) selected
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                        <Typography variant="body2" color="primary" sx={{ mb: 0.5, fontWeight: 'medium' }}>
                          Click to upload
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Or drag and drop
                        </Typography>
                      </Box>
                    )}
                    <input
                      type="file"
                      id="images-upload"
                      hidden
                      accept="image/jpeg,image/png,image/jpg"
                      multiple
                      onChange={handleVehicleImagesChange}
                    />
                  </UploadDropArea>
                </CardContent>
              </Card>
            </Box>
          )}
          <Box sx={{ mb: 4 }}>
            <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey['200']}` }}>
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" gutterBottom>
                  Vehicle Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Insert The Vehicle's General Informations
                </Typography>
                {loading ? (
                  <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(3, 1fr)', gap: theme.spacing(3) }}>
                    <Stack spacing={2}>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="brand-label">Brand*</InputLabel>
                        <Select
                          labelId="brand-label"
                          id="brand-select"
                          value={brand}
                          label="Brand"
                          onChange={(e) => setBrand(e.target.value)}
                        >
                          <MenuItem value="">Select vehicle brand</MenuItem>
                          {brands.map((b) => (
                            <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="type-label">Type*</InputLabel>
                        <Select
                          labelId="type-label"
                          id="type-select"
                          value={type}
                          label="Type"
                          onChange={(e) => setType(e.target.value)}
                        >
                          <MenuItem value="">Select vehicle type</MenuItem>
                          <MenuItem value="sedan">Sedan</MenuItem>
                          <MenuItem value="suv">SUV</MenuItem>
                          <MenuItem value="hatchback">Hatchback</MenuItem>
                          <MenuItem value="coupe">Coupe</MenuItem>
                          <MenuItem value="convertible">Convertible</MenuItem>
                          <MenuItem value="truck">Truck</MenuItem>
                          <MenuItem value="van">Van</MenuItem>
                          <MenuItem value="motorcycle">Motorcycle</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth variant="outlined" required>
                        <TextField
                          id="seating-capacity-input"
                          label="Seating Capacity*"
                          variant="outlined"
                          value={seatingCapacity}
                          onChange={(e) => setSeatingCapacity(e.target.value)}
                          placeholder="Input how many person can seat"
                          type="number"
                        />
                      </FormControl>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="transmission-type-label">Transmission type*</InputLabel>
                        <Select
                          labelId="transmission-type-label"
                          id="transmission-type-select"
                          value={transmissionType}
                          label="Transmission type"
                          onChange={(e) => setTransmissionType(e.target.value)}
                        >
                          <MenuItem value="">Select vehicle transmission</MenuItem>
                          <MenuItem value="manual">Manual</MenuItem>
                          <MenuItem value="automatic">Automatic</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        label="Model*"
                        variant="outlined"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="Model Name"
                        required
                      />
                      <TextField
                        fullWidth
                        label="Engine Capacity (cc)*"
                        variant="outlined"
                        value={engineCapacity}
                        onChange={(e) => setEngineCapacity(e.target.value)}
                        placeholder="Ex: 1500"
                        type="number"
                        required
                      />
                      <FormControl component="fieldset" fullWidth>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>Air Condition</Typography>
                        <RadioGroup row value={airCondition} onChange={(e) => setAirCondition(e.target.value)}>
                          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                          <FormControlLabel value="no" control={<Radio />} label="No" />
                        </RadioGroup>
                      </FormControl>
                    </Stack>
                    <Stack spacing={2}>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="category-label">Category*</InputLabel>
                        <Select
                          labelId="category-label"
                          id="category-select"
                          value={category}
                          label="Category"
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <MenuItem value="">Select vehicle category</MenuItem>
                          {categories.map((c) => (
                            <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Engine Power (hp)*"
                        variant="outlined"
                        value={enginePower}
                        onChange={(e) => setEnginePower(e.target.value)}
                        placeholder="Ex: 120"
                        type="number"
                        required
                      />
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="fuel-type-label">Fuel type*</InputLabel>
                        <Select
                          labelId="fuel-type-label"
                          id="fuel-type-select"
                          value={fuelType}
                          label="Fuel type"
                          onChange={(e) => setFuelType(e.target.value)}
                        >
                          <MenuItem value="">Select fuel type</MenuItem>
                          <MenuItem value="petrol">Petrol</MenuItem>
                          <MenuItem value="diesel">Diesel</MenuItem>
                          <MenuItem value="electric">Electric</MenuItem>
                          <MenuItem value="hybrid">Hybrid</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey['200']}` }}>
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Vehicle Identity
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Insert The Vehicle's Unique Informations
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sameModelMultipleVehicles}
                        onChange={(e) => setSameModelMultipleVehicles(e.target.checked)}
                        name="sameModelMultipleVehicles"
                        color="primary"
                      />
                    }
                    label="Same Model Multiple Vehicles"
                    labelPlacement="start"
                  />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, 1fr)', gap: theme.spacing(3) }}>
                  <TextField
                    fullWidth
                    label="VIN Number*"
                    variant="outlined"
                    value={vinNumber}
                    onChange={(e) => setVinNumber(e.target.value)}
                    placeholder="Type your VIN number"
                    required
                  />
                  <TextField
                    fullWidth
                    label="License Plate Number*"
                    variant="outlined"
                    value={licensePlateNumber}
                    onChange={(e) => setLicensePlateNumber(e.target.value)}
                    placeholder="Type your license plate number"
                    required
                  />
                </Box>
                {sameModelMultipleVehicles && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Additional Vehicle Identity
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Insert Additional Vehicle's Unique Informations
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, 1fr)', gap: theme.spacing(3) }}>
                      <TextField
                        fullWidth
                        label="Additional VIN Number*"
                        variant="outlined"
                        value={additionalVinNumber}
                        onChange={(e) => setAdditionalVinNumber(e.target.value)}
                        placeholder="Type additional VIN number"
                        required
                      />
                      <TextField
                        fullWidth
                        label="Additional License Plate Number*"
                        variant="outlined"
                        value={additionalLicensePlateNumber}
                        onChange={(e) => setAdditionalLicensePlateNumber(e.target.value)}
                        placeholder="Type additional license plate number"
                        required
                      />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Additional Vehicle Images
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        JPG, JPEG, PNG Less Than 1MB (Ratio 2:1)
                      </Typography>
                      <UploadDropArea
                        onDragOver={handleDragOver}
                        onDrop={handleDropMultipleImages}
                        onClick={() => document.getElementById('multiple-images-upload').click()}
                      >
                        {multipleVehicleImages.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                            {multipleVehicleImages.map((file, index) => (
                              <img
                                key={index}
                                src={URL.createObjectURL(file)}
                                alt={`Additional vehicle image ${index + 1}`}
                                style={{ maxWidth: 80, maxHeight: 80, objectFit: 'cover', borderRadius: theme.shape.borderRadius }}
                              />
                            ))}
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, width: '100%' }}>
                              {multipleVehicleImages.length} image(s) selected
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                            <Typography variant="body2" color="primary" sx={{ mb: 0.5, fontWeight: 'medium' }}>
                              Click to upload
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Or drag and drop
                            </Typography>
                          </Box>
                        )}
                        <input
                          type="file"
                          id="multiple-images-upload"
                          hidden
                          accept="image/jpeg,image/png,image/jpg"
                          multiple
                          onChange={handleMultipleVehicleImagesChange}
                        />
                      </UploadDropArea>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey['200']}` }}>
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" gutterBottom>
                  Pricing & Discounts
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Insert The Pricing & Discount Informations
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>Trip Type</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Choose the trip type you prefer.
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(3, 1fr)', gap: theme.spacing(2) }}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        borderColor: tripType === 'hourly' ? theme.palette.primary.main : undefined,
                        borderWidth: tripType === 'hourly' ? 2 : 1,
                      }}
                      onClick={() => setTripType('hourly')}
                    >
                      <FormControlLabel
                        control={<Radio checked={tripType === 'hourly'} onChange={() => setTripType('hourly')} />}
                        label="Hourly"
                        labelPlacement="start"
                        sx={{ m: 0, '.MuiFormControlLabel-label': { ml: 'auto' } }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Set your hourly rental price.
                      </Typography>
                    </Card>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        borderColor: tripType === 'perDay' ? theme.palette.primary.main : undefined,
                        borderWidth: tripType === 'perDay' ? 2 : 1,
                      }}
                      onClick={() => setTripType('perDay')}
                    >
                      <FormControlLabel
                        control={<Radio checked={tripType === 'perDay'} onChange={() => setTripType('perDay')} />}
                        label="Per Day"
                        labelPlacement="start"
                        sx={{ m: 0, '.MuiFormControlLabel-label': { ml: 'auto' } }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Set your Per Day rental price.
                      </Typography>
                    </Card>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        borderColor: tripType === 'distanceWise' ? theme.palette.primary.main : undefined,
                        borderWidth: tripType === 'distanceWise' ? 2 : 1,
                      }}
                      onClick={() => setTripType('distanceWise')}
                    >
                      <FormControlLabel
                        control={<Radio checked={tripType === 'distanceWise'} onChange={() => setTripType('distanceWise')} />}
                        label="Distance Wise"
                        labelPlacement="start"
                        sx={{ m: 0, '.MuiFormControlLabel-label': { ml: 'auto' } }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Set your distance wise rental price.
                      </Typography>
                    </Card>
                  </Box>
                </Box>
                {tripType === 'hourly' && (
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Hourly Wise Price ($/per hour)*"
                      variant="outlined"
                      value={hourlyWisePrice}
                      onChange={(e) => setHourlyWisePrice(e.target.value)}
                      placeholder="Ex: 35.25"
                      type="number"
                      inputProps={{ step: "0.01" }}
                      required
                    />
                  </Box>
                )}
                {tripType === 'perDay' && (
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
                {tripType === 'distanceWise' && (
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
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Give Discount</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Set a discount that applies to all pricing types—hourly, daily, and distance-based
                  </Typography>
                  <TextField
                    fullWidth
                    label="Discount (%)"
                    variant="outlined"
                    value={giveDiscount}
                    onChange={(e) => setGiveDiscount(e.target.value)}
                    placeholder="Ex: 10"
                    type="number"
                    inputProps={{ step: "any", min: 0, max: 100 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey['200']}` }}>
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" gutterBottom>
                  Search Tags
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Insert The Tags For Appear In User s Search List
                </Typography>
                <TextField
                  fullWidth
                  label="Type and press Enter"
                  variant="outlined"
                  placeholder="Type and press Enter"
                  sx={{ mb: 2 }}
                />
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey['200']}` }}>
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" gutterBottom>
                  Vehicle Document
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload related documents (PDF, DOC, DOCX). Max size 2MB
                </Typography>
                <UploadDropArea
                  onDragOver={handleDragOver}
                  onDrop={handleDropDoc}
                  onClick={() => document.getElementById('docs-upload').click()}
                >
                  {vehicleDoc.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                      {vehicleDoc.map((file, index) => (
                        <Typography key={index} variant="body2" color="text.primary">
                          📄 {file.name}
                        </Typography>
                      ))}
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {vehicleDoc.length} document(s) selected
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                      <Typography variant="body2" color="primary" sx={{ mb: 0.5, fontWeight: 'medium' }}>
                        Click to upload
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Or drag and drop
                      </Typography>
                    </Box>
                  )}
                  <input
                    type="file"
                    id="docs-upload"
                    hidden
                    accept=".pdf,.doc,.docx"
                    multiple
                    onChange={handleVehicleDocChange}
                  />
                </UploadDropArea>
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
            >
              {loading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </Box>
        </Box>
      </Box>
      {/* Success/Error Toast Message */}
      <Snackbar open={openToast} autoHideDuration={3000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseToast} severity={toastSeverity} sx={{ backgroundColor: toastSeverity === 'success' ? '#1976d2' : '#d32f2f', color: 'white' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Createnew;
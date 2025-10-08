import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
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
  Chip
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/system';

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
    borderColor: theme.palette.primary.main
  },
  '& input[type="file"]': {
    display: 'none'
  }
}));

const Createnew = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [vehicleName, setVehicleName] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [vehicleImages, setVehicleImages] = useState([]);
  const [vehicleDoc, setVehicleDoc] = useState([]);
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
  const [vinNumber, setVinNumber] = useState('');
  const [licensePlateNumber, setLicensePlateNumber] = useState('');
  const [sameModelMultipleVehicles, setSameModelMultipleVehicles] = useState(false);
  const [additionalVinNumber, setAdditionalVinNumber] = useState('');
  const [additionalLicensePlateNumber, setAdditionalLicensePlateNumber] = useState('');
  const [multipleVehicleImages, setMultipleVehicleImages] = useState([]);
  const [tripType, setTripType] = useState('hourly');
  const [hourlyWisePrice, setHourlyWisePrice] = useState('');
  const [perDayPrice, setPerDayPrice] = useState('');
  const [distanceWisePrice, setDistanceWisePrice] = useState('');
  const [giveDiscount, setGiveDiscount] = useState('');
  const [searchTags, setSearchTags] = useState([]);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rentalModuleId, setRentalModuleId] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = 'https://api.bookmyevent.ae/api';

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please log in.');
      const response = await fetch(`${API_BASE_URL}/brands`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch brands');
      if (!response.ok) throw new Error('Failed to fetch brands');
      const data = await response.json();
      setBrands(Array.isArray(data) ? data : []);
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setToastMessage(err.message);
      setToastSeverity('error');
      setOpenToast(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchRentalModule = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/modules`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch modules');

      const modules = await response.json();
      const rentalModule = modules.find((module) => module.title === 'Rental');

      if (rentalModule) {
        setRentalModuleId(rentalModule._id);
      } else {
        setError('Rental module not found. Please create the Rental module first.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please log in.');

      if (!rentalModuleId) {
        setCategories([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/categories/modules/${rentalModuleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch categories' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch categories`);
      }

      const data = await response.json();
      const categoriesArray = Array.isArray(data) ? data : data.data || [];
      setCategories(categoriesArray);
    } catch (err) {
      setError(err.message);
      setCategories([]);
      setToastMessage('Failed to load rental categories. Please try again.');
      setToastSeverity('warning');
      setOpenToast(true);
    } finally {
      setLoading(false);
    }
  };


  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please log in.');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm.trim() && { search: searchTerm.trim() })
      });
      const response = await fetch(`${API_BASE_URL}/vehicles?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch vehicles');
      if (data.success) {
        setVehicles(data.data?.vehicles || []);
        setCurrentPage(data.pagination?.currentPage || 1);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
        setItemsPerPage(data.pagination?.itemsPerPage || 10);
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

  useEffect(() => {
    fetchBrands();
    fetchRentalModule();
  }, []);

  useEffect(() => {
    if (rentalModuleId) {
      fetchCategories();
    }
  }, [rentalModuleId]);

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, itemsPerPage, searchTerm]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchVehicles();
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
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

  const handleVehicleImagesChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.some((file) => file.size > 1 * 1024 * 1024)) {
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
    if (files.some((file) => file.size > 1 * 1024 * 1024)) {
      setToastMessage('Each vehicle image must be less than 1MB.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }
    setVehicleImages(files);
  };

  const handleVehicleDocChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.some((file) => file.size > 2 * 1024 * 1024)) {
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
    if (files.some((file) => file.size > 2 * 1024 * 1024)) {
      setToastMessage('Each document must be less than 2MB.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }
    setVehicleDoc(files);
  };

  const handleMultipleVehicleImagesChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.some((file) => file.size > 1 * 1024 * 1024)) {
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
    if (files.some((file) => file.size > 1 * 1024 * 1024)) {
      setToastMessage('Each additional vehicle image must be less than 1MB.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }
    setMultipleVehicleImages(files);
  };

  const handleSearchTagsKeyPress = (event) => {
    if (event.key === 'Enter' && event.target.value.trim()) {
      setSearchTags([...searchTags, event.target.value.trim()]);
      event.target.value = '';
    }
  };

  const handleReset = () => {
    setVehicleName('');
    setDescription('');
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
    setSearchTags([]);
    setMultipleVehicleImages([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Trim and validate vehicle name
    const trimmedVehicleName = vehicleName.trim();
    if (!trimmedVehicleName) {
      setToastMessage('Please enter a vehicle name.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }

    // Normalize VIN and License Plate
    const normalizedVin = vinNumber.trim().toUpperCase().replace(/\s+/g, '');
    const normalizedLicensePlate = licensePlateNumber.trim().toUpperCase();
    const normalizedAdditionalVin = additionalVinNumber.trim().toUpperCase().replace(/\s+/g, '');
    const normalizedAdditionalLicensePlate = additionalLicensePlateNumber.trim().toUpperCase();

    // Validate VIN length
    if (normalizedVin.length !== 17) {
      setToastMessage('VIN Number must be exactly 17 characters');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }

    if (sameModelMultipleVehicles && normalizedAdditionalVin.length !== 17) {
      setToastMessage('Additional VIN Number must be exactly 17 characters');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }

    // Validate all required fields
    if (
    
    // Trim and validate vehicle name
    const trimmedVehicleName = vehicleName.trim();
    if (!trimmedVehicleName) {
      setToastMessage('Please enter a vehicle name.');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }

    // Normalize VIN and License Plate
    const normalizedVin = vinNumber.trim().toUpperCase().replace(/\s+/g, '');
    const normalizedLicensePlate = licensePlateNumber.trim().toUpperCase();
    const normalizedAdditionalVin = additionalVinNumber.trim().toUpperCase().replace(/\s+/g, '');
    const normalizedAdditionalLicensePlate = additionalLicensePlateNumber.trim().toUpperCase();

    // Validate VIN length
    if (normalizedVin.length !== 17) {
      setToastMessage('VIN Number must be exactly 17 characters');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }

    if (sameModelMultipleVehicles && normalizedAdditionalVin.length !== 17) {
      setToastMessage('Additional VIN Number must be exactly 17 characters');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }

    // Validate all required fields
    if (
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
      (tripType === 'distanceWise' && !distanceWisePrice)
      (tripType === 'distanceWise' && !distanceWisePrice)
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

    // Create FormData
    // Create FormData
    const formData = new FormData();
    formData.append('name', trimmedVehicleName);
    formData.append('name', trimmedVehicleName);
    formData.append('description', description);
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
    vehicleImages.forEach((image) => formData.append('images', image));
    vehicleDoc.forEach((doc) => formData.append('documents', doc));
    formData.append('vinNumber', normalizedVin);
    formData.append('licensePlateNumber', normalizedLicensePlate);
    formData.append('vinNumber', normalizedVin);
    formData.append('licensePlateNumber', normalizedLicensePlate);
    searchTags.forEach((tag) => formData.append('searchTags', tag));

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please log in.');

      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create vehicle');
      }

      if (data.success) {
        // Handle additional vehicle if needed
        // Handle additional vehicle if needed
        if (sameModelMultipleVehicles) {
          const additionalFormData = new FormData();
          additionalFormData.append('name', trimmedVehicleName);
          additionalFormData.append('name', trimmedVehicleName);
          additionalFormData.append('description', description);
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
          additionalFormData.append('thumbnail', thumbnailFile);
          multipleVehicleImages.forEach((image) => additionalFormData.append('images', image));
          vehicleDoc.forEach((doc) => additionalFormData.append('documents', doc));
          additionalFormData.append('vinNumber', normalizedAdditionalVin);
          additionalFormData.append('licensePlateNumber', normalizedAdditionalLicensePlate);
          additionalFormData.append('vinNumber', normalizedAdditionalVin);
          additionalFormData.append('licensePlateNumber', normalizedAdditionalLicensePlate);
          searchTags.forEach((tag) => additionalFormData.append('searchTags', tag));

          const additionalResponse = await fetch(`${API_BASE_URL}/vehicles`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: additionalFormData
          });

          const additionalData = await additionalResponse.json();

          if (!additionalResponse.ok) {
            throw new Error(additionalData.message || 'Failed to create additional vehicle');
          }
        }

        setToastMessage('Vehicle(s) created successfully!');
        setToastSeverity('success');
        setOpenToast(true);
        handleReset();
        fetchVehicles();
        fetchVehicles();
      } else {
        throw new Error(data.message || 'Failed to create vehicle');
      }
    } catch (err) {
      setToastMessage(err.message || 'Error creating vehicle. Please try again.');
      setToastSeverity('error');
      setOpenToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenToast(false);
  };

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3, backgroundColor: theme.palette.grey[100], minHeight: '100vh', width: '100%' }}>
      <Box
        sx={{
          maxWidth: 'lg',
          margin: 'auto',
          backgroundColor: 'white',
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[1],
          p: isSmallScreen ? 2 : 3,
          overflowX: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src="https://via.placeholder.com/24" alt="Vehicle Icon" style={{ marginRight: 8 }} />
            <Typography variant="h5" component="h1">
              Add New Rental Vehicle
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
            <Button variant="outlined" startIcon={<SearchIcon />} onClick={handleSearch} disabled={loading}>
              Search
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchVehicles} disabled={loading}>
              Refresh
            </Button>
            <Tooltip title="Settings">
              <IconButton color="primary" sx={{ backgroundColor: 'white', border: `1px solid ${theme.palette.grey[200]}` }}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Insert the basic information of the rental vehicle (Categories limited to Rental module)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Rental Vehicles
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              ) : vehicles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No rental vehicles found. Add a new vehicle below.
                </Typography>
              ) : (
                <>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Brand</TableCell>
                        <TableCell>Model</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vehicles.map((vehicle) => (
                        <TableRow key={vehicle._id}>
                          <TableCell>{vehicle.name}</TableCell>
                          <TableCell>{vehicle.brand?.title || 'N/A'}</TableCell>
                          <TableCell>{vehicle.model}</TableCell>
                          <TableCell>
                            <Chip label={vehicle.category?.title || 'N/A'} size="small" color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell>{vehicle.type}</TableCell>
                          <TableCell>
                            <Chip
                              label={vehicle.isActive ? 'Active' : 'Inactive'}
                              color={vehicle.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControl variant="outlined" size="small">
                      <InputLabel>Items per page</InputLabel>
                      <Select value={itemsPerPage} onChange={handleItemsPerPageChange} label="Items per page">
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                      </Select>
                    </FormControl>
                    <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', gap: 3, mb: 4 }}>
            <Card sx={{ flex: isSmallScreen ? 'auto' : 2, p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" gutterBottom>
                  General Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Insert the basic information of the rental vehicle
                </Typography>
                <TextField
                  fullWidth
                  label="Vehicle Name*"
                  variant="outlined"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  placeholder="Type vehicle name"
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Description"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Type description"
                />
              </CardContent>
            </Card>
            <Card sx={{ flex: isSmallScreen ? 'auto' : 1, p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
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
              <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                  <Typography variant="h6" gutterBottom>
                    Rental Vehicle Images*
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
            <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" gutterBottom>
                  Rental Vehicle Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Insert The Rental Vehicle's General Information (Limited to Rental Categories)
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
                        <Select labelId="brand-label" value={brand} label="Brand" onChange={(e) => setBrand(e.target.value)}>
                          <MenuItem value="">Select vehicle brand</MenuItem>
                          {brands.map((b) => (
                            <MenuItem key={b._id} value={b._id}>
                              {b.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="type-label">Type*</InputLabel>
                        <Select labelId="type-label" value={type} label="Type" onChange={(e) => setType(e.target.value)}>
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
                          label="Seating Capacity*"
                          variant="outlined"
                          value={seatingCapacity}
                          onChange={(e) => setSeatingCapacity(e.target.value)}
                          placeholder="Input how many person can seat"
                          type="number"
                          inputProps={{ min: 1 }}
                        />
                      </FormControl>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="transmission-type-label">Transmission type*</InputLabel>
                        <Select
                          labelId="transmission-type-label"
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
                        inputProps={{ min: 0 }}
                        required
                      />
                      <FormControl component="fieldset" fullWidth>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                          Air Condition
                        </Typography>
                        <RadioGroup row value={airCondition} onChange={(e) => setAirCondition(e.target.value)}>
                          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                          <FormControlLabel value="no" control={<Radio />} label="No" />
                        </RadioGroup>
                      </FormControl>
                    </Stack>
                    <Stack spacing={2}>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="category-label">Rental Category*</InputLabel>
                        <Select
                          labelId="category-label"
                          value={category}
                          label="Rental Category"
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <MenuItem value="">Select rental category</MenuItem>
                          {categories.length > 0 ? (
                            categories.map((c) => (
                              <MenuItem key={c._id} value={c._id}>
                                {c.title} {c.module?.title ? `(${c.module.title})` : '(Rental)'}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No rental categories available</MenuItem>
                          )}
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
                        inputProps={{ min: 0 }}
                        required
                      />
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="fuel-type-label">Fuel type*</InputLabel>
                        <Select labelId="fuel-type-label" value={fuelType} label="Fuel type" onChange={(e) => setFuelType(e.target.value)}>
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
            <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Rental Vehicle Identity
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Insert The Rental Vehicle's Unique Information
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
                    placeholder="Type your VIN number (17 characters)"
                    required
                    inputProps={{ maxLength: 17 }}
                  />
                  <TextField
                    fullWidth
                    label="License Plate Number*"
                    variant="outlined"
                    value={licensePlateNumber}
                    onChange={(e) => setLicensePlateNumber(e.target.value)}
                    placeholder="Type your license plate number"
                    required
                    inputProps={{ maxLength: 15 }}
                    inputProps={{ maxLength: 15 }}
                  />
                </Box>
                {sameModelMultipleVehicles && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Additional Rental Vehicle Identity
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Insert Additional Rental Vehicle's Unique Information
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, 1fr)', gap: theme.spacing(3) }}>
                      <TextField
                        fullWidth
                        label="Additional VIN Number*"
                        variant="outlined"
                        value={additionalVinNumber}
                        onChange={(e) => setAdditionalVinNumber(e.target.value)}
                        placeholder="Type additional VIN number (17 characters)"
                        required
                        inputProps={{ maxLength: 17 }}
                      />
                      <TextField
                        fullWidth
                        label="Additional License Plate Number*"
                        variant="outlined"
                        value={additionalLicensePlateNumber}
                        onChange={(e) => setAdditionalLicensePlateNumber(e.target.value)}
                        placeholder="Type additional license plate number"
                        required
                        inputProps={{ maxLength: 15 }}
                        inputProps={{ maxLength: 15 }}
                      />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Additional Rental Vehicle Images
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
            <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" gutterBottom>
                  Rental Pricing & Discounts
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Insert The Rental Pricing & Discount Information
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Trip Type
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Choose the rental trip type you prefer.
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(3, 1fr)', gap: theme.spacing(2) }}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        borderColor: tripType === 'hourly' ? theme.palette.primary.main : undefined,
                        borderWidth: tripType === 'hourly' ? 2 : 1
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
                        borderWidth: tripType === 'perDay' ? 2 : 1
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
                        borderWidth: tripType === 'distanceWise' ? 2 : 1
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
                      inputProps={{ step: '0.01', min: 0 }}
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
                      inputProps={{ step: '0.01', min: 0 }}
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
                      inputProps={{ step: '0.01', min: 0 }}
                      required
                    />
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Rental Discount
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Set a discount that applies to all rental pricing types—hourly, daily, and distance-based
                  </Typography>
                  <TextField
                    fullWidth
                    label="Discount (%)"
                    variant="outlined"
                    value={giveDiscount}
                    onChange={(e) => setGiveDiscount(e.target.value)}
                    placeholder="Ex: 10"
                    type="number"
                    inputProps={{ step: 'any', min: 0, max: 100 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" gutterBottom>
                  Rental Search Tags
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Insert The Tags For Appear In User s Rental Search List
                </Typography>
                <TextField
                  fullWidth
                  label="Type and press Enter"
                  variant="outlined"
                  placeholder="Type and press Enter"
                  onKeyPress={handleSearchTagsKeyPress}
                  sx={{ mb: 2 }}
                />
                {searchTags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {searchTags.map((tag, index) => (
                      <Chip key={index} label={tag} onDelete={() => setSearchTags(searchTags.filter((_, i) => i !== index))} />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Card sx={{ p: 2, boxShadow: 'none', border: `1px solid ${theme.palette.grey[200]}` }}>
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" gutterBottom>
                  Rental Vehicle Documents
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload related rental documents (PDF, DOC, DOCX). Max size 2MB
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
                  <input type="file" id="docs-upload" hidden accept=".pdf,.doc,.docx" multiple onChange={handleVehicleDocChange} />
                </UploadDropArea>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" color="inherit" size="large" onClick={handleReset} disabled={loading}>
              Reset
            </Button>
            <Button variant="contained" type="submit" size="large" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Create Rental Vehicle'}
            </Button>
          </Box>
        </Box>
      </Box>
      <Snackbar
        open={openToast}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toastSeverity}
          sx={{ backgroundColor: toastSeverity === 'success' ? '#1976d2' : '#d32f2f', color: 'white' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Createnew;
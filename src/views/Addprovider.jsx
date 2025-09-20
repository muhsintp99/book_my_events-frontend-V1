import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function AddProvider() {
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [vendorsLoading, setVendorsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    storeName: '',
    storeAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      fullAddress: ''
    },
    zone: '',
    module: '',
    latitude: '',
    longitude: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerPhone: '',
    ownerEmail: '',
    password: '',
    confirmPassword: '',
    businessTIN: '',
    tinExpireDate: ''
  });


  const [zones, setZones] = useState([]);
  const [modules, setModules] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [tinCertificatePreview, setTinCertificatePreview] = useState(null);
  const [logoErrors, setLogoErrors] = useState({});

  // File state
  const [files, setFiles] = useState({
    logo: null,
    coverImage: null,
    tinCertificate: null
  });

  // Base API URL
  const API_BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000/api' : "https://api.bookmyevent.ae/api";
  console.log('API_BASE_URL:', API_BASE_URL);

  // Fetch zones, modules, and vendors on component mount
  useEffect(() => {
    fetchZones();
    fetchModules();
    fetchVendors();
  }, []);

  const fetchZones = async () => {
    try {
      setZonesLoading(true);
      const response = await fetch(`${API_BASE_URL}/zones`);
      console.log('Zones response status:', response.status, response.statusText);
      const data = await response.json();
      console.log('Zones raw data:', JSON.stringify(data, null, 2));
      // Handle response with { data: [...] }
      setZones(data.data || []);
    } catch (error) {
      console.error('Error fetching zones:', error); // Line 95
      showAlert('Error fetching zones', 'error');
      setZones([]);
    } finally {
      setZonesLoading(false);
    }
  };
  const fetchModules = async () => {
    try {
      setModulesLoading(true);
      const response = await fetch(`${API_BASE_URL}/modules`);
      console.log('Modules response status:', response.status, response.statusText);
      const data = await response.json();
      console.log('Modules raw data:', JSON.stringify(data, null, 2));
      // Handle array response
      setModules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching modules:', error); // Line 117
      showAlert('Error fetching modules', 'error');
      setModules([]);
    } finally {
      setModulesLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setVendorsLoading(true);
      const response = await fetch(`${API_BASE_URL}/vendorprofiles`);
      console.log('Vendors response status:', response.status, response.statusText);
      const data = await response.json();
      console.log('Vendors raw data:', JSON.stringify(data, null, 2));

      if (data.success) {
        const vendorsData = data.data.vendors || [];
        const updatedVendors = vendorsData.map(vendor => ({
          ...vendor,
          logo: vendor.logo
            ? vendor.logo.startsWith('http')
              ? vendor.logo
              : `${API_BASE_URL}/${vendor.logo.replace(/^\//, '')}`
            : null
        }));
        setVendors(updatedVendors);
      } else {
        throw new Error(data.message || 'Failed to fetch vendors');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      showAlert('Error fetching vendors', 'error');
      setVendors([]);
    } finally {
      setVendorsLoading(false);
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  // Handle storeAddress subfield changes
  const handleAddressChange = (subfield) => (event) => {
    setFormData({
      ...formData,
      storeAddress: {
        ...formData.storeAddress,
        [subfield]: event.target.value
      }
    });
  };

  // Handle zone selection
  const handleZoneChange = (event) => {
    setFormData({
      ...formData,
      zone: event.target.value
    });
  };

  // Handle module selection
  const handleModuleChange = (event) => {
    setFormData({
      ...formData,
      module: event.target.value
    });
  };

  // Handle image upload and preview
  const handleImageUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        showAlert(`File size for ${type} exceeds 2MB limit`, 'error');
        return;
      }

      const validTypes = {
        logo: ['image/jpeg', 'image/png'],
        coverImage: ['image/jpeg', 'image/png'],
        tinCertificate: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      };

      if (!validTypes[type].includes(file.type)) {
        showAlert(`Invalid file type for ${type}. Allowed: ${validTypes[type].join(', ')}`, 'error');
        return;
      }

      setFiles({
        ...files,
        [type]: file
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        switch (type) {
          case 'logo':
            setLogoPreview(e.target.result);
            break;
          case 'coverImage':
            setCoverPreview(e.target.result);
            break;
          case 'tinCertificate':
            if (file.type.startsWith('image/')) {
              setTinCertificatePreview(e.target.result);
            } else {
              setTinCertificatePreview(file.name);
            }
            break;
          default:
            break;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoError = (id) => {
    setLogoErrors(prev => ({ ...prev, [id]: true }));
  };

  // Validate form
  const validateForm = () => {
    const errors = [];

    if (!formData.storeName.trim()) errors.push('Store name is required');
    if (!formData.storeAddress.fullAddress.trim()) errors.push('Full address is required');
    if (!formData.businessTIN.trim()) errors.push('Business TIN is required');
    if (!formData.tinExpireDate) errors.push('TIN expire date is required');
    if (!formData.zone) errors.push('Zone selection is required');
    if (!formData.module) errors.push('Module selection is required');

    if (formData.ownerEmail && !/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
      errors.push('Valid email is required');
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (formData.latitude && isNaN(parseFloat(formData.latitude))) {
      errors.push('Valid latitude is required');
    }

    if (formData.longitude && isNaN(parseFloat(formData.longitude))) {
      errors.push('Valid longitude is required');
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
    const formPayload = new FormData();
    formPayload.append('firstName', formData.ownerFirstName);
    formPayload.append('lastName', formData.ownerLastName);
    formPayload.append('email', formData.ownerEmail);
    formPayload.append('password', formData.password);
    formPayload.append('phone', formData.ownerPhone);
    formPayload.append('role', 'vendor');
    formPayload.append('storeName', formData.storeName);
    formPayload.append('storeAddress[street]', formData.storeAddress.street);
    formPayload.append('storeAddress[city]', formData.storeAddress.city);
    formPayload.append('storeAddress[state]', formData.storeAddress.state);
    formPayload.append('storeAddress[zipCode]', formData.storeAddress.zipCode);
    formPayload.append('storeAddress[fullAddress]', formData.storeAddress.fullAddress);
    formPayload.append('businessTIN', formData.businessTIN);
    formPayload.append('tinExpireDate', formData.tinExpireDate);
    formPayload.append('module', formData.module);
    formPayload.append('zone', formData.zone);

    if (files.logo) formPayload.append('logo', files.logo);
    if (files.coverImage) formPayload.append('coverImage', files.coverImage);
    if (files.tinCertificate) formPayload.append('tinCertificate', files.tinCertificate);

    // Log FormData contents
    for (let pair of formPayload.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: formPayload
    });

    const result = await response.json();
    console.log("Register result:", result);

    if (response.ok && result.success) {
      showAlert('Vendor registered successfully', 'success');
      handleReset();
      fetchVendors();
    } else {
      throw new Error(result.message || 'Failed to register vendor');
    }
  } catch (err) {
    console.error(err);
    showAlert(err.message || 'Error adding vendor', 'error');
  } finally {
    setLoading(false);
  }
};


  // Handle reset
  const handleReset = () => {
    setFormData({
      storeName: '',
      storeAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        fullAddress: ''
      },
      minimumDeliveryTime: '',
      maximumDeliveryTime: '',
      zone: '',
      module: '',
      latitude: '',
      longitude: '',
      ownerFirstName: '',
      ownerLastName: '',
      ownerPhone: '',
      ownerEmail: '',
      password: '',
      confirmPassword: '',
      businessTIN: '',
      tinExpireDate: ''
    });
    setLogoPreview(null);
    setCoverPreview(null);
    setTinCertificatePreview(null);
    setFiles({
      logo: null,
      coverImage: null,
      tinCertificate: null
    });
  };

  // Helper function to format storeAddress for display
  const formatAddress = (address) => {
    if (typeof address === 'string') {
      return address;
    }
    if (typeof address === 'object' && address !== null) {
      return address.fullAddress ||
        `${address.street || ''}, ${address.city || ''}, ${address.state || ''} ${address.zipCode || ''}`.trim();
    }
    return 'N/A';
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Add New Vendor
      </Typography>

      <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 3 }}>
        {/* Logo Upload */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
          <Typography variant="h6">Logo</Typography>
          <Typography variant="caption" color="textSecondary">
            png, jpg. File size : max 2 MB
          </Typography>
        </Box>

        {logoPreview && (
          <Box sx={{ mb: 2 }}>
            <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
          </Box>
        )}

        <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 1, width: '100%' }}
          >
            {logoPreview ? 'Change Logo' : 'Select a file or Drag & Drop here'}
            <input
              type="file"
              hidden
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleImageUpload(e, 'logo')}
            />
          </Button>
        </Box>

        {/* Cover Image Upload */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
          <Typography variant="h6">Cover Image</Typography>
          <Typography variant="caption" color="textSecondary">
            png, jpg. File size : max 2 MB
          </Typography>
        </Box>

        {coverPreview && (
          <Box sx={{ mb: 2 }}>
            <img src={coverPreview} alt="Cover Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
          </Box>
        )}

        <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 1, width: '100%' }}
          >
            {coverPreview ? 'Change Cover' : 'Select a file or Drag & Drop here'}
            <input
              type="file"
              hidden
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleImageUpload(e, 'coverImage')}
            />
          </Button>
        </Box>

        <TextField
          fullWidth
          label="Store Name *"
          variant="outlined"
          value={formData.storeName}
          onChange={handleInputChange('storeName')}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Street"
          variant="outlined"
          value={formData.storeAddress.street}
          onChange={handleAddressChange('street')}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="City"
          variant="outlined"
          value={formData.storeAddress.city}
          onChange={handleAddressChange('city')}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="State"
          variant="outlined"
          value={formData.storeAddress.state}
          onChange={handleAddressChange('state')}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Zip Code"
          variant="outlined"
          value={formData.storeAddress.zipCode}
          onChange={handleAddressChange('zipCode')}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Full Address *"
          variant="outlined"
          value={formData.storeAddress.fullAddress}
          onChange={handleAddressChange('fullAddress')}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Minimum Delivery Time *"
          variant="outlined"
          value={formData.minimumDeliveryTime}
          onChange={handleInputChange('minimumDeliveryTime')}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Maximum Delivery Time *"
          variant="outlined"
          value={formData.maximumDeliveryTime}
          onChange={handleInputChange('maximumDeliveryTime')}
          sx={{ mb: 2 }}
          required
        />

        {/* Zone Selection */}
        {zonesLoading ? (
          <CircularProgress sx={{ mb: 2 }} />
        ) : (
          <Select
            fullWidth
            value={formData.zone}
            onChange={handleZoneChange}
            displayEmpty
            variant="outlined"
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Select Zone *</MenuItem>
            {zones.map((zone) => (
              <MenuItem key={zone._id} value={zone._id}>
                {zone.name}
              </MenuItem>
            ))}
          </Select>
        )}

        {/* Module Selection */}
        {modulesLoading ? (
          <CircularProgress sx={{ mb: 2 }} />
        ) : (
          <Select
            fullWidth
            value={formData.module}
            onChange={handleModuleChange}
            displayEmpty
            variant="outlined"
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Select Module *</MenuItem>
            {modules.map((module) => (
              <MenuItem key={module._id} value={module._id}>
                {module.title}
              </MenuItem>
            ))}
          </Select>
        )}

        <TextField
          fullWidth
          label="Latitude"
          variant="outlined"
          value={formData.latitude}
          onChange={handleInputChange('latitude')}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Longitude"
          variant="outlined"
          value={formData.longitude}
          onChange={handleInputChange('longitude')}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Owner First Name *"
          variant="outlined"
          value={formData.ownerFirstName}
          onChange={handleInputChange('ownerFirstName')}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Owner Last Name *"
          variant="outlined"
          value={formData.ownerLastName}
          onChange={handleInputChange('ownerLastName')}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Owner Phone *"
          variant="outlined"
          value={formData.ownerPhone}
          onChange={handleInputChange('ownerPhone')}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Owner Email *"
          variant="outlined"
          value={formData.ownerEmail}
          onChange={handleInputChange('ownerEmail')}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Password *"
          variant="outlined"
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Confirm Password *"
          variant="outlined"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Business TIN *"
          variant="outlined"
          value={formData.businessTIN}
          onChange={handleInputChange('businessTIN')}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Expire Date *"
          variant="outlined"
          placeholder="yyyy-mm-dd"
          value={formData.tinExpireDate}
          onChange={handleInputChange('tinExpireDate')}
          type="date"
          sx={{ mb: 2 }}
          InputLabelProps={{
            shrink: true,
          }}
          required
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
          <Typography variant="h6">TIN Certificate</Typography>
          <Typography variant="caption" color="textSecondary">
            Pdf, doc, jpg. File size : max 2 MB
          </Typography>
        </Box>

        {tinCertificatePreview && (
          <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Selected File:</Typography>
            {typeof tinCertificatePreview === 'string' && !tinCertificatePreview.startsWith('data:') ? (
              <Typography variant="body2" color="primary">{tinCertificatePreview}</Typography>
            ) : (
              <img
                src={tinCertificatePreview}
                alt="TIN Certificate Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            )}
          </Box>
        )}

        <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 1, width: '100%' }}
          >
            {tinCertificatePreview ? 'Change File' : 'Select a file or Drag & Drop here'}
            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleImageUpload(e, 'tinCertificate')}
            />
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={handleReset} disabled={loading}>
            Reset
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </Box>

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

      {/* Existing Vendors Section */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          Existing Vendors
        </Typography>

        {vendorsLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography>Loading vendors...</Typography>
          </Box>
        ) : vendors.length > 0 ? (
          <Grid container spacing={3}>
            {vendors.map((vendor) => (
              <Grid item xs={12} sm={6} md={4} key={vendor._id}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 8px 28px rgba(0,0,0,0.15)"
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={logoErrors[vendor._id] || !vendor.logo ? "https://via.placeholder.com/150?text=No+Logo" : vendor.logo}
                    alt={`${vendor.storeName} logo`}
                    sx={{ objectFit: "contain", bgcolor: "#fafafa", p: 2 }}
                    onError={() => handleLogoError(vendor._id)}
                  />

                  <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {vendor.storeName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Owner: {vendor.ownerFirstName} {vendor.ownerLastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      📍 {formatAddress(vendor.storeAddress)}
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                      <Chip
                        label={`Zone: ${vendor.zone?.name || "N/A"}`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        label={`Delivery: ${vendor.minimumDeliveryTime}-${vendor.maximumDeliveryTime} min`}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        label={`Module: ${vendor.module?.title || "N/A"}`}
                        size="small"
                        color="secondary"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>

                    <Box sx={{ mt: "auto", display: "flex", justifyContent: "flex-end" }}>
                      <Button variant="outlined" size="small">View Details</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>No vendors found.</Typography>
        )}
      </Box>
    </Box>
  );
}

export default AddProvider;
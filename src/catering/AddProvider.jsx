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
  Chip,
  InputLabel,
  FormControl
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function Addcatering() {
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [vendorsLoading, setVendorsLoading] = useState(true);

  const activeModuleId = localStorage.getItem('moduleDbId');
  const activeModuleName = localStorage.getItem('activeModule');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
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
    module: activeModuleId || '',
    latitude: '',
    longitude: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerPhone: '',
    ownerEmail: '',
    businessTIN: '',
    tinExpireDate: '',
    status: 'pending',
    reviewedBy: '',
    reviewedAt: '',
    rejectionReason: '',
    adminNotes: '',
    isActive: true,
    approvedProvider: ''
  });

  const [zones, setZones] = useState([]);
  const [modules, setModules] = useState([]);
  const [allModules, setAllModules] = useState([]); // Store all modules for reference
  const [vendors, setVendors] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [tinCertificatePreview, setTinCertificatePreview] = useState(null);
  const [logoErrors, setLogoErrors] = useState({});

  const [files, setFiles] = useState({
    logo: null,
    coverImage: null,
    tinCertificate: null
  });

  const API_BASE_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api'
    : 'https://api.bookmyevent.ae/api';

  useEffect(() => {
    fetchZones();
    fetchModules();
    fetchVendors();
  }, []);

  const fetchZones = async () => {
    try {
      setZonesLoading(true);
      const response = await fetch(`${API_BASE_URL}/zones`);
      const data = await response.json();
      setZones(data.data || []);
    } catch (error) {
      showAlert('Error fetching zones', 'error');
      setZones([]);
    } finally {
      setZonesLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      setModulesLoading(true);
      const res = await fetch(`${API_BASE_URL}/modules`);
      const data = await res.json();
      
      console.log('Fetched modules:', data);
      console.log('Active module ID from localStorage:', activeModuleId);
      console.log('Active module name from localStorage:', activeModuleName);
      
      // Store all modules for reference
      setAllModules(Array.isArray(data) ? data : []);
      
      // If there's an active module ID, filter for it; otherwise show all modules
      const filtered = Array.isArray(data)
        ? activeModuleId 
          ? data.filter((m) => m._id === activeModuleId)
          : data
        : [];
      
      console.log('Filtered modules:', filtered);
      setModules(filtered);
      
      // Set the initial module value if we have an active module
      if (activeModuleId && filtered.length > 0) {
        setFormData(prev => ({ ...prev, module: activeModuleId }));
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
      setModules([]);
      setAllModules([]);
    } finally {
      setModulesLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setVendorsLoading(true);
      const response = await fetch(`${API_BASE_URL}/vendorprofiles`);
      const data = await response.json();
      if (data.success) {
        const vendorsData = data.data.vendors || [];
        const updated = vendorsData.map(v => ({
          ...v,
          logo: v.logo
            ? v.logo.startsWith('http')
              ? v.logo
              : `${API_BASE_URL}/${v.logo.replace(/^\//, '')}`
            : null
        }));
        setVendors(updated);
      } else {
        throw new Error('Failed to fetch vendors');
      }
    } catch (error) {
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

  const handleInputChange = (field) => (e) => {
    setFormData({
      ...formData,
      [field]: e.target.value
    });
  };

  const handleAddressChange = (subfield) => (e) => {
    setFormData({
      ...formData,
      storeAddress: {
        ...formData.storeAddress,
        [subfield]: e.target.value
      }
    });
  };

  const handleZoneChange = (event) => {
    const zoneId = event.target.value;
    setSelectedZone(zoneId);
    setFormData({ ...formData, zone: zoneId });
  };

  const handleModuleChange = (event) => {
    const selectedModuleId = event.target.value;
    console.log('Module changed to:', selectedModuleId);
    setFormData({ ...formData, module: selectedModuleId });
  };

  const handleImageUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      setFiles({ ...files, [type]: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'logo') setLogoPreview(e.target.result);
        if (type === 'coverImage') setCoverPreview(e.target.result);
        if (type === 'tinCertificate') {
          if (file.type.startsWith('image/')) {
            setTinCertificatePreview(e.target.result);
          } else {
            setTinCertificatePreview(file.name);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoError = (id) => {
    setLogoErrors(prev => ({ ...prev, [id]: true }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.ownerFirstName.trim()) errors.push('Owner first name is required');
    if (!formData.ownerLastName.trim()) errors.push('Owner last name is required');
    if (!formData.ownerEmail.trim()) errors.push('Owner email is required');
    if (formData.ownerEmail && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.ownerEmail)) {
      errors.push('Owner email is invalid');
    }
    if (!formData.module) errors.push('Module is required');
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
      formPayload.append('firstName', formData.firstName);
      formPayload.append('lastName', formData.lastName);
      formPayload.append('email', formData.email);
      formPayload.append('role', 'vendor');
      formPayload.append('storeName', formData.storeName);
      formPayload.append('storeAddress[street]', formData.storeAddress.street);
      formPayload.append('storeAddress[city]', formData.storeAddress.city);
      formPayload.append('storeAddress[state]', formData.storeAddress.state);
      formPayload.append('storeAddress[zipCode]', formData.storeAddress.zipCode);
      formPayload.append('storeAddress[fullAddress]', formData.storeAddress.fullAddress);
      formPayload.append('minimumDeliveryTime', formData.minimumDeliveryTime);
      formPayload.append('maximumDeliveryTime', formData.maximumDeliveryTime);
      formPayload.append('latitude', formData.latitude);
      formPayload.append('longitude', formData.longitude);
      formPayload.append('ownerFirstName', formData.ownerFirstName);
      formPayload.append('ownerLastName', formData.ownerLastName);
      formPayload.append('ownerPhone', formData.ownerPhone);
      formPayload.append('ownerEmail', formData.ownerEmail);
      formPayload.append('businessTIN', formData.businessTIN);
      formPayload.append('tinExpireDate', formData.tinExpireDate);
      formPayload.append('module', formData.module);
      formPayload.append('zone', formData.zone);
      formPayload.append('status', formData.status);
      formPayload.append('reviewedBy', formData.reviewedBy);
      formPayload.append('reviewedAt', formData.reviewedAt);
      formPayload.append('rejectionReason', formData.rejectionReason);
      formPayload.append('adminNotes', formData.adminNotes);
      formPayload.append('isActive', formData.isActive);
      formPayload.append('approvedProvider', formData.approvedProvider);
      if (files.logo) formPayload.append('logo', files.logo);
      if (files.coverImage) formPayload.append('coverImage', files.coverImage);
      if (files.tinCertificate) formPayload.append('tinCertificate', files.tinCertificate);

      console.log('Submitting with module ID:', formData.module);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: formPayload
      });
      const result = await response.json();
      if (response.ok) {
        showAlert('Provider added successfully', 'success');
        fetchVendors();
        handleReset();
      } else {
        showAlert(result.message || 'Failed to add provider', 'error');
      }
    } catch (error) {
      showAlert('Error adding provider', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
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
      module: activeModuleId || '',
      latitude: '',
      longitude: '',
      ownerFirstName: '',
      ownerLastName: '',
      ownerPhone: '',
      ownerEmail: '',
      businessTIN: '',
      tinExpireDate: '',
      status: 'pending',
      reviewedBy: '',
      reviewedAt: '',
      rejectionReason: '',
      adminNotes: '',
      isActive: true,
      approvedProvider: ''
    });
    setSelectedZone('');
    setLogoPreview(null);
    setCoverPreview(null);
    setTinCertificatePreview(null);
    setFiles({
      logo: null,
      coverImage: null,
      tinCertificate: null
    });
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return [address.street, address.city, address.state, address.zipCode].filter(Boolean).join(', ') || 'N/A';
  };

  // Get the current selected module details for display
  const getSelectedModuleName = () => {
    if (!formData.module) return 'No module selected';
    const selectedModule = allModules.find(m => m._id === formData.module);
    return selectedModule ? selectedModule.title : 'Unknown module';
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Add Provider
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Store Information</Typography>
        <TextField
          fullWidth
          label="Store Name"
          variant="outlined"
          value={formData.storeName}
          onChange={handleInputChange('storeName')}
          sx={{ mb: 2 }}
        />
      </Box>

      {logoPreview && (
        <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Selected Logo:</Typography>
          <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: '100px', maxHeight: '200px', objectFit: 'contain' }} />
        </Box>
      )}
      <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center', mb: 2 }}>
        <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{ mt: 1, width: '100%' }}>
          {logoPreview ? 'Change Logo' : 'Upload Logo'}
          <input type="file" hidden accept="image/jpeg,image/png" onChange={(e) => handleImageUpload(e, 'logo')} />
        </Button>
      </Box>

      {coverPreview && (
        <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Selected Cover:</Typography>
          <img src={coverPreview} alt="Cover Preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
        </Box>
      )}
      <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center', mb: 2 }}>
        <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{ mt: 1, width: '100%' }}>
          {coverPreview ? 'Change Cover' : 'Upload Cover'}
          <input type="file" hidden accept="image/jpeg,image/png" onChange={(e) => handleImageUpload(e, 'coverImage')} />
        </Button>
      </Box>

      {/* User Information */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>User Information</Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="First Name *"
            variant="outlined"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            required
          />
          <TextField
            fullWidth
            label="Last Name *"
            variant="outlined"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            required
          />
        </Box>
        <TextField
          fullWidth
          label="Email *"
          variant="outlined"
          value={formData.email}
          onChange={handleInputChange('email')}
          required
          sx={{ mb: 2 }}
        />
      </Box>

      {/* Location */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Location</Typography>
        
        {/* Module Selection */}
        <Box sx={{ mb: 2 }}>
          {modulesLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Loading modules...</Typography>
            </Box>
          ) : modules.length > 0 ? (
            <FormControl fullWidth variant="outlined">
              <InputLabel id="module-select-label">Module *</InputLabel>
              <Select
                labelId="module-select-label"
                id="module-select"
                value={formData.module}
                onChange={handleModuleChange}
                label="Module *"
                disabled={modules.length === 1}
              >
                {modules.map((m) => (
                  <MenuItem key={m._id} value={m._id}>
                    {m.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Alert severity="warning">No modules available. Please configure modules first.</Alert>
          )}
          
          {/* Display current selection */}
          {formData.module && (
            <Box sx={{ mt: 1, p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1 }}>
              <Typography variant="body2" color="primary">
                Selected Module: <strong>{getSelectedModuleName()}</strong>
              </Typography>
            </Box>
          )}
        </Box>

        {/* Zone Selection */}
        <Box sx={{ mb: 2 }}>
          {zonesLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Loading zones...</Typography>
            </Box>
          ) : zones.length > 0 ? (
            <FormControl fullWidth variant="outlined">
              <InputLabel id="zone-select-label">Zone</InputLabel>
              <Select
                labelId="zone-select-label"
                id="zone-select"
                value={selectedZone}
                onChange={handleZoneChange}
                label="Zone"
              >
                <MenuItem value="">
                  <em>Select Zone</em>
                </MenuItem>
                {zones.map((zone) => (
                  <MenuItem key={zone._id} value={zone._id}>
                    {zone.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Alert severity="info">No zones available</Alert>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Street"
            variant="outlined"
            value={formData.storeAddress.street}
            onChange={handleAddressChange('street')}
          />
          <TextField
            fullWidth
            label="City"
            variant="outlined"
            value={formData.storeAddress.city}
            onChange={handleAddressChange('city')}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="State"
            variant="outlined"
            value={formData.storeAddress.state}
            onChange={handleAddressChange('state')}
          />
          <TextField
            fullWidth
            label="Zip Code"
            variant="outlined"
            value={formData.storeAddress.zipCode}
            onChange={handleAddressChange('zipCode')}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Full Address"
            variant="outlined"
            value={formData.storeAddress.fullAddress}
            onChange={handleAddressChange('fullAddress')}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Latitude"
            variant="outlined"
            value={formData.latitude}
            onChange={handleInputChange('latitude')}
          />
          <TextField
            fullWidth
            label="Longitude"
            variant="outlined"
            value={formData.longitude}
            onChange={handleInputChange('longitude')}
          />
        </Box>
      </Box>

      {/* Owner Information */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Owner Information</Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Owner First Name *"
            variant="outlined"
            value={formData.ownerFirstName}
            onChange={handleInputChange('ownerFirstName')}
            required
          />
          <TextField
            fullWidth
            label="Owner Last Name *"
            variant="outlined"
            value={formData.ownerLastName}
            onChange={handleInputChange('ownerLastName')}
            required
          />
        </Box>
        <TextField
          fullWidth
          label="Owner Email *"
          variant="outlined"
          value={formData.ownerEmail}
          onChange={handleInputChange('ownerEmail')}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Owner Phone"
          variant="outlined"
          value={formData.ownerPhone}
          onChange={handleInputChange('ownerPhone')}
          sx={{ mb: 2 }}
        />
      </Box>

      {/* Business TIN */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Business TIN</Typography>
        <TextField
          fullWidth
          label="TIN"
          variant="outlined"
          value={formData.businessTIN}
          onChange={handleInputChange('businessTIN')}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="TIN Expire Date"
          type="date"
          value={formData.tinExpireDate}
          onChange={handleInputChange('tinExpireDate')}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        {tinCertificatePreview && (
          <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Selected File:</Typography>
            {typeof tinCertificatePreview === 'string' && !tinCertificatePreview.startsWith('data:') ? (
              <Typography variant="body2" color="primary">{tinCertificatePreview}</Typography>
            ) : (
              <img src={tinCertificatePreview} alt="TIN Certificate" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
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
            {tinCertificatePreview ? 'Change File' : 'Upload TIN Certificate'}
            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleImageUpload(e, 'tinCertificate')}
            />
          </Button>
        </Box>
      </Box>

      {/* Submit and Reset Buttons */}
      <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 2 }}>
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

      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpen(false)} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Existing Vendors */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          Existing Providers
        </Typography>
        {vendorsLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography>Loading providers...</Typography>
          </Box>
        ) : vendors.length > 0 ? (
          <Grid container spacing={3}>
            {vendors.map((vendor) => (
              <Grid item xs={12} sm={6} md={4} key={vendor._id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 8px 28px rgba(0,0,0,0.15)' }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={logoErrors[vendor._id] || !vendor.logo ? 'https://via.placeholder.com/150?text=No+Logo' : vendor.logo}
                    alt={`${vendor.storeName} logo`}
                    sx={{ objectFit: 'contain', bgcolor: '#fafafa', p: 2 }}
                    onError={() => handleLogoError(vendor._id)}
                  />
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {vendor.storeName || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Owner: {vendor.ownerFirstName} {vendor.ownerLastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {formatAddress(vendor.storeAddress)}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip label={`Zone: ${vendor.zone?.name || 'N/A'}`} size="small" color="primary" />
                      <Chip
                        label={`Delivery: ${vendor.minimumDeliveryTime || 'N/A'}-${vendor.maximumDeliveryTime || 'N/A'} min`}
                        size="small"
                        color="success"
                      />
                      <Chip label={`Module: ${vendor.module?.title || 'N/A'}`} size="small" color="secondary" />
                      <Chip label={`Status: ${vendor.status || 'N/A'}`} size="small" color={vendor.status === 'approved' ? 'success' : 'default'} />
                    </Box>
                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="outlined" size="small">
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>No providers found.</Typography>
        )}
      </Box>
    </Box>
  );
}

export default Addcatering;
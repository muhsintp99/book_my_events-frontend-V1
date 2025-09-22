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

  const activeModuleId = localStorage.getItem('moduleDbId');

  const [formData, setFormData] = useState({
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
    password: '',
    confirmPassword: '',
    businessTIN: '',
    tinExpireDate: ''
  });

  const [zones, setZones] = useState([]);
  const [modules, setModules] = useState([]);
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
    : "https://api.bookmyevent.ae/api";

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
      const activeModuleId = localStorage.getItem('moduleDbId');
      const filtered = Array.isArray(data)
        ? data.filter((m) => m._id === activeModuleId)
        : [];
      setModules(filtered);
    } catch (err) {
      setModules([]);
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
    setFormData({ ...formData, module: event.target.value });
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
    if (!formData.storeName.trim()) errors.push('Store name is required');
    if (!formData.storeAddress.fullAddress.trim()) errors.push('Full address is required');
    if (!formData.businessTIN.trim()) errors.push('Business TIN is required');
    if (!formData.tinExpireDate) errors.push('TIN expire date is required');
    if (!formData.zone) errors.push('Zone selection is required');
    if (!formData.module) errors.push('Module selection is required');
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
      formPayload.append('storeName', formData.storeName);
      formPayload.append('storeAddress[fullAddress]', formData.storeAddress.fullAddress);
      formPayload.append('businessTIN', formData.businessTIN);
      formPayload.append('tinExpireDate', formData.tinExpireDate);
      formPayload.append('module', formData.module);
      formPayload.append('zone', formData.zone);
      if (files.logo) formPayload.append('logo', files.logo);
      if (files.coverImage) formPayload.append('coverImage', files.coverImage);
      if (files.tinCertificate) formPayload.append('tinCertificate', files.tinCertificate);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: formPayload
      });
      const result = await response.json();
      if (response.ok && result.success) {
        showAlert('Vendor registered successfully', 'success');
        handleReset();
        fetchVendors();
      } else {
        throw new Error(result.message || 'Failed to register vendor');
      }
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      storeName: '',
      storeAddress: { street: '', city: '', state: '', zipCode: '', fullAddress: '' },
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
      password: '',
      confirmPassword: '',
      businessTIN: '',
      tinExpireDate: ''
    });
    setLogoPreview(null);
    setCoverPreview(null);
    setTinCertificatePreview(null);
    setFiles({ logo: null, coverImage: null, tinCertificate: null });
  };

  const formatAddress = (address) => {
    if (typeof address === 'string') return address;
    if (typeof address === 'object' && address !== null) {
      return address.fullAddress ||
        `${address.street || ''}, ${address.city || ''}, ${address.state || ''} ${address.zipCode || ''}`.trim();
    }
    return 'N/A';
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, backgroundColor: 'white', width: '100%', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" fontWeight="bold">Add New Provider</Typography>
      </Box>

      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
        Default English (EN)
      </Typography>

      <TextField
        fullWidth
        label="Store Name *"
        variant="outlined"
        value={formData.storeName}
        onChange={handleInputChange('storeName')}
        sx={{ mb: 2 }}
      />

      {/* Logo & Cover Section */}
      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
          Provider Logo & Covers
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center', flex: 1 }}>
            <Typography variant="caption">Logo (1:1)</Typography>
            {logoPreview && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px' }} />
              </Box>
            )}
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{ mt: 1, width: '100%' }}>
              {logoPreview ? 'Change Image' : 'Upload Image'}
              <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
            </Button>
          </Box>

          <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center', flex: 1 }}>
            <Typography variant="caption">Provider Cover (2:1)</Typography>
            {coverPreview && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <img src={coverPreview} alt="Cover Preview" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px' }} />
              </Box>
            )}
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{ mt: 1, width: '100%' }}>
              {coverPreview ? 'Change Image' : 'Upload Image'}
              <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'coverImage')} />
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Zone & Module */}
      {zonesLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Loading zones...</Typography>
        </Box>
      ) : (
        <Select
          fullWidth
          variant="outlined"
          displayEmpty
          value={selectedZone}
          onChange={handleZoneChange}
          sx={{ mb: 2 }}
        >
          <MenuItem value="" disabled>Select Zone *</MenuItem>
          {zones.map((zone) => (
            <MenuItem key={zone._id} value={zone._id}>{zone.name}</MenuItem>
          ))}
        </Select>
      )}

      {modulesLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Loading modules...</Typography>
        </Box>
      ) : (
        <Select fullWidth variant="outlined" value={formData.module} onChange={handleModuleChange} sx={{ mb: 2 }}>
          <MenuItem value="" disabled>Select Module *</MenuItem>
          {modules.map((m) => (
            <MenuItem key={m._id} value={m._id}>{m.title}</MenuItem>
          ))}
        </Select>
      )}

      {/* Owner Info */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>Owner Information</Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField fullWidth label="First name" variant="outlined" value={formData.ownerFirstName} onChange={handleInputChange('ownerFirstName')} />
          <TextField fullWidth label="Last name" variant="outlined" value={formData.ownerLastName} onChange={handleInputChange('ownerLastName')} />
          <TextField fullWidth label="Phone" variant="outlined" value={formData.ownerPhone} onChange={handleInputChange('ownerPhone')} />
          <TextField fullWidth label="Email" variant="outlined" type="email" value={formData.ownerEmail} onChange={handleInputChange('ownerEmail')} />
        </Box>
      </Box>

      {/* Account Info */}
      {/* <Box sx={{ mt: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>Account Information</Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField fullWidth label="Password" variant="outlined" type="password" value={formData.password} onChange={handleInputChange('password')} />
          <TextField fullWidth label="Confirm Password" variant="outlined" type="password" value={formData.confirmPassword} onChange={handleInputChange('confirmPassword')} />
        </Box>
      </Box> */}

      {/* Business TIN */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>Business TIN</Typography>
        <TextField fullWidth label="TIN *" variant="outlined" value={formData.businessTIN} onChange={handleInputChange('businessTIN')} sx={{ mb: 2 }} />
        <TextField fullWidth label="Expire Date *" type="date" value={formData.tinExpireDate} onChange={handleInputChange('tinExpireDate')} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />

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
          <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{ mt: 1, width: '100%' }}>
            {tinCertificatePreview ? 'Change File' : 'Upload File'}
            <input type="file" hidden accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => handleImageUpload(e, 'tinCertificate')} />
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 2 }}>
          <Button variant="outlined" onClick={handleReset} disabled={loading}>Reset</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : null}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </Box>

      <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
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
                <Card sx={{ height: "100%", borderRadius: 3, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transition: "transform 0.2s ease, box-shadow 0.2s ease", "&:hover": { transform: "translateY(-6px)", boxShadow: "0 8px 28px rgba(0,0,0,0.15)" } }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={logoErrors[vendor._id] || !vendor.logo ? "https://via.placeholder.com/150?text=No+Logo" : vendor.logo}
                    alt={`${vendor.storeName} logo`}
                    sx={{ objectFit: "contain", bgcolor: "#fafafa", p: 2 }}
                    onError={() => handleLogoError(vendor._id)}
                  />
                  <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>{vendor.storeName}</Typography>
                    <Typography variant="body2" color="text.secondary">Owner: {vendor.ownerFirstName} {vendor.ownerLastName}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>📍 {formatAddress(vendor.storeAddress)}</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                      <Chip label={`Zone: ${vendor.zone?.name || "N/A"}`} size="small" color="primary" />
                      <Chip label={`Delivery: ${vendor.minimumDeliveryTime}-${vendor.maximumDeliveryTime} min`} size="small" color="success" />
                      <Chip label={`Module: ${vendor.module?.title || "N/A"}`} size="small" color="secondary" />
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
          <Typography>No providers found.</Typography>
        )}
      </Box>
    </Box>
  );
}

export default AddProvider;

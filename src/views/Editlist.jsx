import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useLocation, useNavigate } from 'react-router-dom';

function EditList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { provider } = location.state || {};

  const [formData, setFormData] = useState({
    storeName: '',
    storeAddress: '',
    minimumDeliveryTime: '',
    maximumDeliveryTime: '',
    zone: '',
    latitude: '',
    longitude: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerPhone: '',
    ownerEmail: '',
    businessTIN: '',
    tinExpireDate: '',
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [tinCertificatePreview, setTinCertificatePreview] = useState(null);
  const [files, setFiles] = useState({
    logo: null,
    coverImage: null, // Updated to match backend expectation
    tinCertificate: null,
  });
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSeverity, setNotificationSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Validate provider data
  useEffect(() => {
    if (!provider || !provider.id) {
      setNotificationMessage('No valid provider data provided. Redirecting to providers list...');
      setNotificationSeverity('error');
      setShowNotification(true);
      setTimeout(() => navigate('/providers'), 2000);
      return;
    }

    // Pre-populate form with provider data
    setFormData({
      storeName: provider.storeName || '',
      storeAddress: provider.storeAddress || '',
      minimumDeliveryTime: provider.minimumDeliveryTime || '',
      maximumDeliveryTime: provider.maximumDeliveryTime || '',
      zone: provider.zoneId || '',
      latitude: provider.latitude || '',
      longitude: provider.longitude || '',
      ownerFirstName: provider.ownerFirstName || '',
      ownerLastName: provider.ownerLastName || '',
      ownerPhone: provider.ownerPhone || '',
      ownerEmail: provider.ownerEmail || '',
      businessTIN: provider.businessTIN || '',
      tinExpireDate: provider.tinExpireDate || '',
    });
    setSelectedZone(provider.zoneId || '');
    setLogoPreview(provider.logo || null);
    setCoverPreview(provider.coverImage || null);
    setTinCertificatePreview(provider.tinCertificate || null);
  }, [provider, navigate]);

  const fetchZones = async () => {
    try {
      setZonesLoading(true);
      const response = await fetch(`${API_BASE_URL}/zones`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setZones(data.data.zones || data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch zones');
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      setNotificationMessage(`Error fetching zones: ${error.message}`);
      setNotificationSeverity('error');
      setShowNotification(true);
      setZones([
        { _id: '1', name: 'Downtown Zone' },
        { _id: '2', name: 'North Zone' },
        { _id: '3', name: 'South Zone' },
        { _id: '4', name: 'East Zone' },
        { _id: '5', name: 'West Zone' },
        { _id: '6', name: 'Airport Zone' },
        { _id: '7', name: 'Industrial Zone' },
      ]);
    } finally {
      setZonesLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      setFiles({
        ...files,
        [type]: file, // Use the correct field name (logo, coverImage, tinCertificate)
      });
      const reader = new FileReader();
      reader.onload = (e) => {
        switch (type) {
          case 'logo':
            setLogoPreview(e.target.result);
            break;
          case 'coverImage': // Updated from 'cover' to 'coverImage'
            setCoverPreview(e.target.result);
            break;
          case 'tin':
            setTinCertificatePreview({
              name: file.name,
              size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
              type: file.type,
            });
            break;
          default:
            break;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoneChange = (event) => {
    const zoneId = event.target.value;
    setSelectedZone(zoneId);
    setFormData({
      ...formData,
      zone: zoneId,
    });
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.storeName.trim()) errors.push('Store name is required');
    if (!formData.storeAddress.trim()) errors.push('Store address is required');
    if (!formData.businessTIN.trim()) errors.push('Business TIN is required');
    if (!formData.tinExpireDate) errors.push('TIN expire date is required');
    if (!formData.zone) errors.push('Zone selection is required');
    if (formData.ownerEmail && !/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
      errors.push('Valid email is required');
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
      setNotificationMessage(validationErrors.join(', '));
      setNotificationSeverity('error');
      setShowNotification(true);
      return;
    }

    try {
      setLoading(true);
      const submitFormData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          submitFormData.append(key, formData[key]);
        }
      });
      Object.keys(files).forEach((key) => {
        if (files[key]) {
          submitFormData.append(key, files[key]);
        }
      });

      const token = localStorage.getItem('token'); // Retrieve token from localStorage or auth context

      console.log('Updating provider with ID:', provider.id);
      console.log('API URL:', `${API_BASE_URL}/providers/${provider.id}`);
      console.log('Form Data:', Object.fromEntries(submitFormData));

      const response = await fetch(`${API_BASE_URL}/providers/${provider.id}`, {
        method: 'PUT',
        body: submitFormData,
        credentials: 'include',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setNotificationMessage('Store updated successfully!');
        setNotificationSeverity('success');
        setShowNotification(true);
        setTimeout(() => navigate('/providers', { state: { updatedProvider: { ...formData, id: provider.id } } }), 2000);
      } else {
        throw new Error(data.message || 'Failed to update store');
      }
    } catch (error) {
      console.error('Error updating store:', error);
      let errorMessage = error.message;
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check if the server is running or if the API URL is correct.';
      }
      setNotificationMessage(`Error updating store: ${errorMessage}`);
      setNotificationSeverity('error');
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      storeName: provider?.storeName || '',
      storeAddress: provider?.storeAddress || '',
      minimumDeliveryTime: provider?.minimumDeliveryTime || '',
      maximumDeliveryTime: provider?.maximumDeliveryTime || '',
      zone: provider?.zoneId || '',
      latitude: provider?.latitude || '',
      longitude: provider?.longitude || '',
      ownerFirstName: provider?.ownerFirstName || '',
      ownerLastName: provider?.ownerLastName || '',
      ownerPhone: provider?.ownerPhone || '',
      ownerEmail: provider?.ownerEmail || '',
      businessTIN: provider?.businessTIN || '',
      tinExpireDate: provider?.tinExpireDate || '',
    });
    setSelectedZone(provider?.zoneId || '');
    setLogoPreview(provider?.logo || null);
    setCoverPreview(provider?.coverImage || null);
    setTinCertificatePreview(provider?.tinCertificate || null);
    setFiles({
      logo: null,
      coverImage: null,
      tinCertificate: null,
    });
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: 'white', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">Edit Store</Typography>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Updating store...</Typography>
        </Box>
      )}

      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
        Default English(EN)
      </Typography>
      <TextField
        fullWidth
        label="Name (Default)"
        variant="outlined"
        placeholder="Store name"
        value={formData.storeName}
        onChange={handleInputChange('storeName')}
        sx={{ mb: 2 }}
        required
      />
      <TextField
        fullWidth
        label="Address (Default)"
        variant="outlined"
        placeholder="Store address"
        multiline
        rows={4}
        value={formData.storeAddress}
        onChange={handleInputChange('storeAddress')}
        sx={{ mb: 2 }}
        required
      />

      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          Store Logo & Covers
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center' }}>
            <Typography variant="caption">Logo (1:1)</Typography>
            {logoPreview && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  style={{
                    maxWidth: '150px',
                    maxHeight: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Logo Preview
                </Typography>
              </Box>
            )}
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 1 }}
            >
              {logoPreview ? 'Change Image' : 'Upload Image'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'logo')}
              />
            </Button>
          </Box>

          <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center' }}>
            <Typography variant="caption">Store Cover (2:1)</Typography>
            {coverPreview && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <img
                  src={coverPreview}
                  alt="Cover Preview"
                  style={{
                    maxWidth: '300px',
                    maxHeight: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Cover Preview
                </Typography>
              </Box>
            )}
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 1 }}
            >
              {coverPreview ? 'Change Image' : 'Upload Image'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'coverImage')} // Updated from 'cover' to 'coverImage'
              />
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
          Store Information
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            label="Min Delivery Time (minutes)"
            variant="outlined"
            placeholder="15"
            value={formData.minimumDeliveryTime}
            onChange={handleInputChange('minimumDeliveryTime')}
            type="number"
          />
          <TextField
            fullWidth
            label="Max Delivery Time (minutes)"
            variant="outlined"
            placeholder="45"
            value={formData.maximumDeliveryTime}
            onChange={handleInputChange('maximumDeliveryTime')}
            type="number"
          />
        </Box>

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
            required
          >
            <MenuItem value="" disabled>
              Select zone *
            </MenuItem>
            {zones.map((zone) => (
              <MenuItem key={zone._id || zone.id} value={zone._id || zone.id}>
                {zone.name}
              </MenuItem>
            ))}
          </Select>
        )}

        {selectedZone && (
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="primary">
              Selected Zone: {zones.find((zone) => zone._id === selectedZone)?.name || 'N/A'}
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          label="Latitude"
          variant="outlined"
          placeholder="Ex: -94.22213"
          value={formData.latitude}
          onChange={handleInputChange('latitude')}
          sx={{ mb: 2 }}
          type="number"
          inputProps={{ step: 'any' }}
        />
        <TextField
          fullWidth
          label="Longitude"
          variant="outlined"
          placeholder="Ex: 103.344322"
          value={formData.longitude}
          onChange={handleInputChange('longitude')}
          sx={{ mb: 2 }}
          type="number"
          inputProps={{ step: 'any' }}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
          Owner Information
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            label="First name"
            variant="outlined"
            placeholder="First name"
            value={formData.ownerFirstName}
            onChange={handleInputChange('ownerFirstName')}
          />
          <TextField
            fullWidth
            label="Last name"
            variant="outlined"
            placeholder="Last name"
            value={formData.ownerLastName}
            onChange={handleInputChange('ownerLastName')}
          />
          <TextField
            fullWidth
            label="Phone"
            variant="outlined"
            placeholder="+1"
            value={formData.ownerPhone}
            onChange={handleInputChange('ownerPhone')}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
          Account Information
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            placeholder="Ex: ex@example.com"
            value={formData.ownerEmail}
            onChange={handleInputChange('ownerEmail')}
            type="email"
          />
          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            placeholder="Leave blank to keep unchanged"
            type="password"
            onChange={handleInputChange('password')}
          />
          <TextField
            fullWidth
            label="Confirm password"
            variant="outlined"
            placeholder="Leave blank to keep unchanged"
            type="password"
            onChange={handleInputChange('confirmPassword')}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
          Business TIN
        </Typography>
        <TextField
          fullWidth
          label="Taxpayer Identification Number (TIN) *"
          variant="outlined"
          placeholder="Type Your Taxpayer Identification Number (TIN)"
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
          InputLabelProps={{ shrink: true }}
          required
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">TIN Certificate</Typography>
          <Typography variant="caption" color="textSecondary">
            Pdf, doc, jpg. File size: max 2 MB
          </Typography>
        </Box>
        <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center', mb: 2 }}>
          {tinCertificatePreview && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                Selected File: {tinCertificatePreview.name || 'Existing File'}
              </Typography>
              {tinCertificatePreview.size && (
                <Typography variant="caption" color="textSecondary">
                  Size: {tinCertificatePreview.size} | Type: {tinCertificatePreview.type}
                </Typography>
              )}
            </Box>
          )}
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 1 }}
          >
            {tinCertificatePreview ? 'Change File' : 'Select a file or Drag & Drop here'}
            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, 'tinCertificate')} // Updated from 'tin' to 'tinCertificate'
            />
          </Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={showNotification}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notificationSeverity}
          sx={{ width: '100%' }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EditList;
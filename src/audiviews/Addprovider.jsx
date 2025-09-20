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

function AddAuditorium() {
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [auditoriumsLoading, setAuditoriumsLoading] = useState(true);
  
  // Form state
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
    password: '',
    confirmPassword: '',
    businessTIN: '',
    tinExpireDate: ''
  });

  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [auditoriums, setAuditoriums] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [tinCertificatePreview, setTinCertificatePreview] = useState(null);
  const [logoErrors, setLogoErrors] = useState({}); // Track logo loading errors
  
  // File state
  const [files, setFiles] = useState({
    logo: null,
    coverImage: null,
    tinCertificate: null
  });

  // Base API URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Fetch zones and auditoriums on component mount
  useEffect(() => {
    fetchZones();
    fetchAuditoriums();
  }, []);

  const fetchZones = async () => {
    try {
      setZonesLoading(true);
      const response = await fetch(`${API_BASE_URL}/zones`);
      const data = await response.json();
      
      if (data.success) {
        setZones(data.data.zones || data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch zones');
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      showAlert('Error fetching zones', 'error');
      setZones([
        { _id: '1', name: 'Downtown Zone' },
        { _id: '2', name: 'North Zone' },
        { _id: '3', name: 'South Zone' },
        { _id: '4', name: 'East Zone' },
        { _id: '5', name: 'West Zone' },
        { _id: '6', name: 'Airport Zone' },
        { _id: '7', name: 'Industrial Zone' }
      ]);
    } finally {
      setZonesLoading(false);
    }
  };

  const fetchAuditoriums = async () => {
    try {
      setAuditoriumsLoading(true);
      const response = await fetch(`${API_BASE_URL}/auditoriums`);
      const data = await response.json();
      
      if (data.success) {
        const auditoriumsData = data.data.auditoriums || [];
        // Ensure logo URLs are absolute
        const updatedAuditoriums = auditoriumsData.map(auditorium => ({
          ...auditorium,
          logo: auditorium.logo 
            ? auditorium.logo.startsWith('http') 
              ? auditorium.logo 
              : `${API_BASE_URL}/${auditorium.logo.replace(/^\//, '')}` // Convert relative to absolute URL
            : null
        }));
        setAuditoriums(updatedAuditoriums);
      } else {
        throw new Error(data.message || 'Failed to fetch auditoriums');
      }
    } catch (error) {
      console.error('Error fetching auditoriums:', error);
      showAlert('Error fetching auditoriums', 'error');
      setAuditoriums([]);
    } finally {
      setAuditoriumsLoading(false);
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

  // Handle zone selection
  const handleZoneChange = (event) => {
    const zoneId = event.target.value;
    setSelectedZone(zoneId);
    setFormData({
      ...formData,
      zone: zoneId
    });
  };

  // Handle image upload and preview
  const handleImageUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      setFiles({
        ...files,
        [type]: file
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        switch(type) {
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

  // Validate form
  const validateForm = () => {
    const errors = [];
    
    if (!formData.storeName.trim()) errors.push('Auditorium name is required');
    if (!formData.storeAddress.trim()) errors.push('Auditorium address is required');
    if (!formData.businessTIN.trim()) errors.push('Business TIN is required');
    if (!formData.tinExpireDate) errors.push('TIN expire date is required');
    if (!formData.zone) errors.push('Zone selection is required');
    
    if (formData.ownerEmail && !/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
      errors.push('Valid email is required');
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    } else if (formData.password && formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    if (formData.latitude && isNaN(parseFloat(formData.latitude))) {
      errors.push('Valid latitude is required');
    }
    
    if (formData.longitude && isNaN(parseFloat(formData.longitude))) {
      errors.push('Valid longitude is required');
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showAlert(validationErrors.join(', '), 'error');
      return;
    }

    try {
      setLoading(true);
      
      const submitFormData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          submitFormData.append(key, formData[key]);
        }
      });
      
      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitFormData.append(key, files[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/auditoriums`, {
        method: 'POST',
        body: submitFormData,
      });

      const data = await response.json();
      
      if (data.success) {
        showAlert('Auditorium created successfully!', 'success');
        fetchAuditoriums(); // Refresh auditoriums list
        handleReset();
      } else {
        throw new Error(data.message || 'Failed to create auditorium');
      }
    } catch (error) {
      console.error('Error creating auditorium:', error);
      showAlert(`Error creating auditorium: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
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
      password: '',
      confirmPassword: '',
      businessTIN: '',
      tinExpireDate: ''
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

  // Handle logo loading errors
  const handleLogoError = (auditoriumId) => {
    setLogoErrors(prev => ({
      ...prev,
      [auditoriumId]: true
    }));
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, backgroundColor: 'white', width: '100%', overflowY: 'auto' }}>
      {/* Main Heading */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" fontWeight="bold">Add New Auditorium</Typography>
      </Box>

      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
        Default English(EN)
      </Typography>

      <TextField
        fullWidth
        label="Auditorium Name (Default) *"
        variant="outlined"
        placeholder="Auditorium name"
        value={formData.storeName}
        onChange={handleInputChange('storeName')}
        sx={{ mb: 2 }}
        required
      />
      <TextField
        fullWidth
        label="Auditorium Address (Default) *"
        variant="outlined"
        placeholder="Auditorium address"
        multiline
        rows={4}
        value={formData.storeAddress}
        onChange={handleInputChange('storeAddress')}
        sx={{ mb: 2 }}
        required
      />

      {/* Auditorium Logo & Covers Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
          Auditorium Logo & Covers
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center', flex: 1 }}>
            <Typography variant="caption">Logo (1:1)</Typography>
            {logoPreview && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <img 
                  src={logoPreview} 
                  alt="Logo Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '150px', 
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }} 
                />
              </Box>
            )}
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 1, width: '100%' }}
            >
              {logoPreview ? 'Change Image' : 'Upload Image'}
              <input 
                type="file" 
                hidden 
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'logo')}
              />
            </Button>
          </Box>
          
          <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center', flex: 1 }}>
            <Typography variant="caption">Auditorium Cover (2:1)</Typography>
            {coverPreview && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <img 
                  src={coverPreview} 
                  alt="Cover Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '150px', 
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }} 
                />
              </Box>
            )}
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 1, width: '100%' }}
            >
              {coverPreview ? 'Change Image' : 'Upload Image'}
              <input 
                type="file" 
                hidden 
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'coverImage')}
              />
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Auditorium Information Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>Auditorium Information</Typography>
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
        
        <TextField
          fullWidth
          label="Latitude"
          variant="outlined"
          placeholder="Ex: -94.22213"
          value={formData.latitude}
          onChange={handleInputChange('latitude')}
          sx={{ mb: 2 }}
          type="number"
          inputProps={{ step: "any" }}
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
          inputProps={{ step: "any" }}
        />
      </Box>

      {/* Owner Information Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>Owner Information</Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
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

      {/* Account Information Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>Account Information</Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
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
            type="password" 
            placeholder="8+ characters required"
            value={formData.password}
            onChange={handleInputChange('password')}
          />
          <TextField 
            fullWidth 
            label="Confirm password" 
            variant="outlined" 
            type="password" 
            placeholder="8+ characters required"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
          />
        </Box>
      </Box>

      {/* Business TIN Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>Business TIN</Typography>
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

      {/* Existing Auditoriums Section */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          Existing Auditoriums
        </Typography>

        {auditoriumsLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography>Loading auditoriums...</Typography>
          </Box>
        ) : auditoriums.length > 0 ? (
          <Grid container spacing={3}>
            {auditoriums.map((auditorium) => (
              <Grid item xs={12} sm={6} md={4} key={auditorium._id}>
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
                    image={logoErrors[auditorium._id] || !auditorium.logo ? "https://via.placeholder.com/150?text=No+Logo" : auditorium.logo}
                    alt={`${auditorium.storeName} logo`}
                    sx={{ objectFit: "contain", bgcolor: "#fafafa", p: 2 }}
                    onError={() => handleLogoError(auditorium._id)} // Handle image loading errors
                  />

                  <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {auditorium.storeName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Owner: {auditorium.ownerFirstName} {auditorium.ownerLastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      📍 {auditorium.storeAddress}
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                      <Chip
                        label={`Zone: ${auditorium.zone?.name || "N/A"}`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        label={`Delivery: ${auditorium.minimumDeliveryTime}-${auditorium.maximumDeliveryTime} min`}
                        size="small"
                        color="success"
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
          <Typography>No auditoriums found.</Typography>
        )}
      </Box>
    </Box>
  );
}

export default AddAuditorium;
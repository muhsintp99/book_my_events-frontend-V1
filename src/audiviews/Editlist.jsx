import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Select, 
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function EditList() {
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [tinCertificatePreview, setTinCertificatePreview] = useState(null);
  const [selectedZone, setSelectedZone] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  // Sample zones - replace with your actual zones
  const zones = [
    { value: 'zone1', label: 'Zone 1 - Downtown' },
    { value: 'zone2', label: 'Zone 2 - Uptown' },
    { value: 'zone3', label: 'Zone 3 - Suburbs' },
    { value: 'zone4', label: 'Zone 4 - Industrial' },
  ];

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        switch (type) {
          case 'logo':
            setLogoPreview(e.target.result);
            break;
          case 'cover':
            setCoverPreview(e.target.result);
            break;
          case 'tin':
            setTinCertificatePreview({
              name: file.name,
              size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
              type: file.type
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
    setSelectedZone(event.target.value);
  };

  const handleSubmit = () => {
    // Here you would typically send data to your API
    setShowNotification(true);
  };

  const handleReset = () => {
    setLogoPreview(null);
    setCoverPreview(null);
    setTinCertificatePreview(null);
    setSelectedZone('');
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: 'white', width: '100%' }}>
      {/* Main Heading */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">Edit Store</Typography>
      </Box>

      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
        Default English(EN)
      </Typography>
      <TextField
        fullWidth
        label="Name (Default)"
        variant="outlined"
        placeholder="Store name"
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Address (Default)"
        variant="outlined"
        placeholder="Store"
        multiline
        rows={4}
        sx={{ mb: 2 }}
      />

      {/* Store Logo & Covers Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
          Store Logo & Covers
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Logo Upload */}
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
                    borderRadius: '8px'
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
          
          {/* Cover Upload */}
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
                    borderRadius: '8px'
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
                onChange={(e) => handleFileUpload(e, 'cover')}
              />
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Store Information Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>Store Information</Typography>
        <TextField
          fullWidth
          label="Estimated Delivery Time (Min & Maximum Time)"
          variant="outlined"
          placeholder=""
          sx={{ mb: 2 }}
        />
        <Select
          fullWidth
          variant="outlined"
          displayEmpty
          value={selectedZone}
          onChange={handleZoneChange}
          sx={{ mb: 2 }}
        >
          <MenuItem value="" disabled>
            Select zone
          </MenuItem>
          {zones.map((zone) => (
            <MenuItem key={zone.value} value={zone.value}>
              {zone.label}
            </MenuItem>
          ))}
        </Select>
        
        {/* Show selected zone */}
        {selectedZone && (
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="primary">
              Selected Zone: {zones.find(zone => zone.value === selectedZone)?.label}
            </Typography>
          </Box>
        )}
        
        <TextField
          fullWidth
          label="Latitude"
          variant="outlined"
          placeholder="Ex: -94.22213"
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Longitude"
          variant="outlined"
          placeholder="Ex: 103.344322"
          sx={{ mb: 2 }}
        />
      </Box>

      {/* Owner Information Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>Owner Information</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="First name"
            variant="outlined"
            placeholder="First name"
            sx={{ flex: 1 }}
          />
          <TextField
            fullWidth
            label="Last name"
            variant="outlined"
            placeholder="Last name"
            sx={{ flex: 1 }}
          />
          <TextField
            fullWidth
            label="Phone"
            variant="outlined"
            placeholder="+1"
            sx={{ flex: 1 }}
          />
        </Box>
      </Box>

      {/* Account Information Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>Account Information</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            placeholder="Ex: ex@example.com"
            sx={{ flex: 1 }}
          />
          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            placeholder="8+ characters required"
            type="password"
            sx={{ flex: 1 }}
          />
          <TextField
            fullWidth
            label="Confirm password"
            variant="outlined"
            placeholder="8+ characters required"
            type="password"
            sx={{ flex: 1 }}
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
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Expire Date *"
          variant="outlined"
          placeholder="dd-mm-yyyy"
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">TIN Certificate</Typography>
          <Typography variant="caption" color="textSecondary">
            Pdf, doc, jpg. File size : max 2 MB
          </Typography>
        </Box>
        <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center', mb: 2 }}>
          {tinCertificatePreview && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                Selected File: {tinCertificatePreview.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Size: {tinCertificatePreview.size} | Type: {tinCertificatePreview.type}
              </Typography>
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
              onChange={(e) => handleFileUpload(e, 'tin')}
            />
          </Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={handleReset}>Reset</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
        </Box>
      </Box>

      {/* Success Notification */}
      <Snackbar
        open={showNotification}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Changes updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EditList;
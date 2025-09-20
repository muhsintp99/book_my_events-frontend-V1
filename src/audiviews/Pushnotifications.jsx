import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Switch,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CloudUpload,
  Image as ImageIcon,
  Refresh,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Styled components (unchanged)
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  borderRadius: 8
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: '1px solid #e0e0e0',
  '& .MuiTab-root': {
    textTransform: 'none',
    minWidth: 120,
    fontWeight: 500,
    fontSize: '14px'
  },
  '& .Mui-selected': {
    color: '#14b8a6'
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#14b8a6'
  }
}));

const ImageUploadArea = styled(Box)(({ theme }) => ({
  border: '2px dashed #e0e0e0',
  borderRadius: 8,
  padding: theme.spacing(6),
  textAlign: 'center',
  backgroundColor: '#f8fffe',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  minHeight: 150,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    borderColor: '#14b8a6',
    backgroundColor: '#f0fdfa'
  }
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#14b8a6',
  color: 'white',
  fontWeight: 600,
  padding: theme.spacing(1.2, 4),
  borderRadius: 6,
  textTransform: 'none',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: '#0f9488'
  }
}));

const ResetButton = styled(Button)(({ theme }) => ({
  color: '#666',
  fontWeight: 500,
  padding: theme.spacing(1.2, 3),
  borderRadius: 6,
  textTransform: 'none',
  fontSize: '14px',
  border: '1px solid #e0e0e0',
  '&:hover': {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc'
  }
}));

const SearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 6,
    backgroundColor: '#f8f9fa'
  }
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 500,
  color: '#374151',
  backgroundColor: '#f0f4f8',
  borderBottom: '1px solid #e0e0e0',
  padding: theme.spacing(1.5),
  '&:first-of-type': {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8
  },
  '&:last-of-type': {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#fff'
  },
  '&:nth-of-type(even)': {
    backgroundColor: '#f9fafb'
  }
}));

// Simplified TabPanel without TypeScript interface
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Banner() {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    zone: '',
    sendTo: 'Customer',
    description: '',
    bannerImage: null,
    additionalFile: null
  });

  const [banners, setBanners] = useState([
    {
      id: 1,
      image: 'https://images.pexels.com/photos/2894944/pexels-photo-2894944.jpeg',
      title: 'demo banner latest',
      type: 'Customer',
      featured: false,
      status: true
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/3750717/pexels-photo-3750717.jpeg',
      title: 'Demo Banner',
      type: 'Store',
      featured: false,
      status: true
    }
  ]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        bannerImage: file
      });
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        additionalFile: file
      });
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      zone: '',
      sendTo: 'Customer',
      description: '',
      bannerImage: null,
      additionalFile: null
    });
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  const handleToggle = (id, field) => (event) => {
    setBanners((prevBanners) => prevBanners.map((banner) => (banner.id === id ? { ...banner, [field]: event.target.checked } : banner)));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <StyledPaper elevation={0}>
        {/* Tabs */}
        <StyledTabs value={tabValue} onChange={handleTabChange} aria-label="banner tabs">
          <Tab label="Default" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="English(EN)" id="tab-1" aria-controls="tabpanel-1" />
        </StyledTabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container rowSpacing={3} columnSpacing={3}>
            {/* Title Field */}
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                label="Title (Default)"
                variant="outlined"
                value={formData.title}
                onChange={handleInputChange('title')}
                placeholder="New banner"
                slotProps={{
                  input: { sx: { borderRadius: 1 } }
                }}
              />
            </Grid>

            {/* Banner Image Upload */}
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <Typography variant="body2" sx={{ mb: 1, color: '#ef4444', fontWeight: 500 }}>
                Banner image * (Ratio 3:1)
              </Typography>
              <input accept="image/*" style={{ display: 'none' }} id="banner-upload" type="file" onChange={handleImageUpload} />
              <label htmlFor="banner-upload">
                <ImageUploadArea role="button" tabIndex={0}>
                  <ImageIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {formData.bannerImage ? formData.bannerImage.name : 'New banner'}
                  </Typography>
                </ImageUploadArea>
              </label>
            </Grid>

            {/* Zone Field */}
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="zone-label">Zone</InputLabel>
                <Select
                  labelId="zone-label"
                  value={formData.zone}
                  onChange={handleInputChange('zone')}
                  label="Zone"
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="">
                    <em>---Select---</em>
                  </MenuItem>
                  <MenuItem value="zone1">Zone 1</MenuItem>
                  <MenuItem value="zone2">Zone 2</MenuItem>
                  <MenuItem value="zone3">Zone 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Send To Field */}
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="send-to-label">Send to</InputLabel>
                <Select
                  labelId="send-to-label"
                  value={formData.sendTo}
                  onChange={handleInputChange('sendTo')}
                  label="Send to"
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="Customer">Customer</MenuItem>
                  <MenuItem value="Deliveryman">Deliveryman</MenuItem>
                  <MenuItem value="Store">Store</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Description Field */}
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Enter description"
                slotProps={{
                  input: { sx: { borderRadius: 1 } }
                }}
              />
            </Grid>

            {/* File Upload Button */}
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <input accept="*/*" style={{ display: 'none' }} id="file-upload" type="file" onChange={handleFileUpload} />
                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    sx={{
                      textTransform: 'none',
                      borderColor: 'divider',
                      color: 'text.secondary',
                      borderRadius: 1,
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.light'
                      }
                    }}
                  >
                    Choose File
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary">
                  {formData.additionalFile ? formData.additionalFile.name : 'No file chosen'}
                </Typography>
              </Box>
            </Grid>

            {/* Action Buttons */}
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <ResetButton variant="outlined" onClick={handleReset} startIcon={<Refresh />}>
                  Reset
                </ResetButton>
                <SubmitButton variant="contained" onClick={handleSubmit}>
                  Send Notification
                </SubmitButton>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container rowSpacing={3} columnSpacing={3}>
            {/* English Version Fields */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title (English)"
                variant="outlined"
                placeholder="New banner"
                slotProps={{
                  input: { sx: { borderRadius: 1 } }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, color: '#ef4444', fontWeight: 500 }}>
                Banner image * (Ratio 3:1)
              </Typography>
              <input accept="image/*" style={{ display: 'none' }} id="banner-upload-en" type="file" onChange={handleImageUpload} />
              <label htmlFor="banner-upload-en">
                <ImageUploadArea role="button" tabIndex={0}>
                  <ImageIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    New banner
                  </Typography>
                </ImageUploadArea>
              </label>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="zone-label-en">Zone</InputLabel>
                <Select labelId="zone-label-en" label="Zone" sx={{ borderRadius: 1 }}>
                  <MenuItem value="">
                    <em>---Select---</em>
                  </MenuItem>
                  <MenuItem value="zone1">Zone 1</MenuItem>
                  <MenuItem value="zone2">Zone 2</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="send-to-label-en">Send to</InputLabel>
                <Select labelId="send-to-label-en" defaultValue="Customer" label="Send to" sx={{ borderRadius: 1 }}>
                  <MenuItem value="Customer">Customer</MenuItem>
                  <MenuItem value="Deliveryman">Deliveryman</MenuItem>
                  <MenuItem value="Store">Store</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                placeholder="Enter description"
                slotProps={{
                  input: { sx: { borderRadius: 1 } }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <input accept="*/*" style={{ display: 'none' }} id="file-upload-en" type="file" onChange={handleFileUpload} />
                <label htmlFor="file-upload-en">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#e0e0e0',
                      color: '#666',
                      borderRadius: 1,
                      '&:hover': {
                        borderColor: '#14b8a6',
                        backgroundColor: '#f0fdfa'
                      }
                    }}
                  >
                    Choose File
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary">
                  No file chosen
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <ResetButton variant="outlined" startIcon={<Refresh />} onClick={handleReset}>
                  Reset
                </ResetButton>
                <SubmitButton variant="contained">Submit</SubmitButton>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Banner List Section */}
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
                Notification List
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#14b8a6',
                  color: 'white',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                {banners.length}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SearchTextField
                size="small"
                placeholder="Search notification"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" sx={{ color: '#14b8a6' }}>
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
                sx={{ width: 200 }}
              />
              <Button
                variant="outlined"
                size="small"
                sx={{
                  textTransform: 'none',
                  borderColor: '#e0e0e0',
                  color: '#666',
                  borderRadius: 4,
                  '&:hover': {
                    borderColor: '#14b8a6',
                    backgroundColor: '#f0fdfa'
                  }
                }}
                endIcon={<span style={{ fontSize: 16 }}>↓</span>}
              >
                Export
              </Button>
            </Box>
          </Box>

          <Table sx={{ minWidth: 650, borderRadius: 1, overflow: 'hidden' }}>
            <TableHead>
              <TableRow>
                <StyledTableCell>SL</StyledTableCell>
                <StyledTableCell>Title</StyledTableCell>
                <StyledTableCell>Description</StyledTableCell>
                <StyledTableCell>Image</StyledTableCell>
                <StyledTableCell>Zone</StyledTableCell>
                <StyledTableCell>Target</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Action</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', padding: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img src="https://via.placeholder.com/150" alt="No Data Found" style={{ width: 150, height: 150 }} />
                      <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>
                        No Data Found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <StyledTableRow key={banner.id}>
                    <TableCell sx={{ padding: (theme) => theme.spacing(1.5) }}>{banner.id}</TableCell>
                    <TableCell sx={{ padding: (theme) => theme.spacing(1.5) }}>
                      <Typography>{banner.title}</Typography>
                    </TableCell>
                    <TableCell sx={{ padding: (theme) => theme.spacing(1.5) }}>
                      <Typography>{banner.description || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell sx={{ padding: (theme) => theme.spacing(1.5) }}>
                      <img
                        src={banner.image}
                        alt={banner.title}
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: 'cover',
                          borderRadius: 4
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: (theme) => theme.spacing(1.5) }}>
                      <Typography>{banner.zone || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell sx={{ padding: (theme) => theme.spacing(1.5) }}>
                      <Typography>{banner.type}</Typography>
                    </TableCell>
                    <TableCell sx={{ padding: (theme) => theme.spacing(1.5) }}>
                      <Switch checked={banner.status} onChange={handleToggle(banner.id, 'status')} color="success" />
                    </TableCell>
                    <TableCell sx={{ padding: (theme) => theme.spacing(1.5) }}>
                      <IconButton color="primary" size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </StyledTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </StyledPaper>
    </Box>
  );
}

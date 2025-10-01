import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography, Card, CardContent, Switch, FormControlLabel, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
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
    borderColor: theme.palette.primary.main,
  },
  '& input[type="file"]': {
    display: 'none',
  },
}));

const AddModule = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [moduleName, setModuleName] = useState('');
  const [appIcon, setAppIcon] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const savedModules = localStorage.getItem('modules');
    if (savedModules) {
      const parsedModules = JSON.parse(savedModules);
      // Ensure all modules have a status property
      const updatedModules = parsedModules.map(module => ({
        ...module,
        status: module.status || 'active', // Default to 'active' if status is undefined
      }));
      setModules(updatedModules);
      localStorage.setItem('modules', JSON.stringify(updatedModules)); // Update localStorage with status
    }
    window.addEventListener('moduleAdded', () => {
      const updatedModules = JSON.parse(localStorage.getItem('modules') || '[]').map(module => ({
        ...module,
        status: module.status || 'active',
      }));
      setModules(updatedModules);
    });
    return () => window.removeEventListener('moduleAdded', () => {});
  }, []);

  const handleSave = () => {
    if (!moduleName) {
      setToastMessage('Module name is required.');
      setOpenToast(true);
      return;
    }
    if (!appIcon) {
      setToastMessage('App icon is required.');
      setOpenToast(true);
      return;
    }
    if (!thumbnail) {
      setToastMessage('Thumbnail image is required.');
      setOpenToast(true);
      return;
    }

    const newModule = {
      name: moduleName,
      appIcon: URL.createObjectURL(appIcon),
      thumbnail: URL.createObjectURL(thumbnail),
      status: 'active',
    };

    let updatedModules;
    if (editIndex !== null) {
      updatedModules = modules.map((module, index) =>
        index === editIndex ? newModule : module
      );
      setToastMessage('Module updated successfully!');
    } else {
      updatedModules = [...modules, newModule];
      setToastMessage('Module added successfully!');
    }

    setModules(updatedModules);
    localStorage.setItem('modules', JSON.stringify(updatedModules));
    window.dispatchEvent(new Event('moduleAdded'));
    setModuleName('');
    setAppIcon(null);
    setThumbnail(null);
    setEditIndex(null);
    setShowForm(false);
    setOpenToast(true);
  };

  const handleToggleStatus = (index) => {
    const updatedModules = modules.map((module, i) =>
      i === index ? { ...module, status: module.status === 'active' ? 'inactive' : 'active' } : module
    );
    setModules(updatedModules);
    localStorage.setItem('modules', JSON.stringify(updatedModules));
    window.dispatchEvent(new Event('moduleAdded'));
    setToastMessage(`Module status updated to ${updatedModules[index].status}!`);
    setOpenToast(true);
  };

  const handleView = (module) => {
    console.log('Viewing module:', module);
    setToastMessage('Module details logged to console.');
    setOpenToast(true);
  };

  const handleEdit = (index) => {
    const module = modules[index];
    setModuleName(module.name);
    setAppIcon(null); // File inputs cannot be pre-filled due to browser security
    setThumbnail(null); // File inputs cannot be pre-filled due to browser security
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDropAppIcon = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setAppIcon(file);
    }
  };

  const handleDropThumbnail = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setThumbnail(file);
    }
  };

  const handleAppIconChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAppIcon(file);
    }
  };

  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setThumbnail(file);
    }
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenToast(false);
  };

  return (
    <Box sx={{ padding: 2, backgroundColor: 'white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <Box component="span" sx={{ mr: 1 }}>📚</Box> Module List <Box component="span" sx={{ ml: 1, color: 'text.secondary' }}>({modules.length})</Box>
        </Typography>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditIndex(null);
            setModuleName('');
            setAppIcon(null);
            setThumbnail(null);
          }}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ backgroundColor: '#397ed3ff', '&:hover': { backgroundColor: '#79a8e9ff' } }}
        >
          Add Module
        </Button>
      </Box>

      {showForm && (
        <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: '4px' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{editIndex !== null ? 'Edit Module' : 'Add New Module'}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{ backgroundColor: '#397ed3ff', '&:hover': { backgroundColor: '#79a8e9ff' } }}
            >
              Save
            </Button>
          </Box>
          <Card sx={{ p: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <TextField
                label="Name of Module"
                variant="outlined"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                required
              />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>App Icon</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  JPG, JPEG, PNG Less Than 1MB (Ratio 1:1)
                </Typography>
                <UploadDropArea
                  onDragOver={handleDragOver}
                  onDrop={handleDropAppIcon}
                  onClick={() => document.getElementById('app-icon-upload').click()}
                >
                  {appIcon ? (
                    <Box>
                      <img
                        src={URL.createObjectURL(appIcon)}
                        alt="App Icon preview"
                        style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain', marginBottom: '8px' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {appIcon.name}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <CloudUploadIcon sx={{ fontSize: 40, color: '#616161', mb: 1 }} />
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
                    id="app-icon-upload"
                    hidden
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleAppIconChange}
                  />
                </UploadDropArea>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>Thumbnail Image</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  JPG, JPEG, PNG Less Than 1MB (Ratio 2:1)
                </Typography>
                <UploadDropArea
                  onDragOver={handleDragOver}
                  onDrop={handleDropThumbnail}
                  onClick={() => document.getElementById('thumbnail-upload').click()}
                >
                  {thumbnail ? (
                    <Box>
                      <img
                        src={URL.createObjectURL(thumbnail)}
                        alt="Thumbnail preview"
                        style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain', marginBottom: '8px' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {thumbnail.name}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <CloudUploadIcon sx={{ fontSize: 40, color: '#616161', mb: 1 }} />
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
                    onChange={handleThumbnailChange}
                  />
                </UploadDropArea>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Ex: Search by module name..."
          size="small"
          sx={{ width: '300px' }}
          InputProps={{
            endAdornment: <IconButton edge="end"><SearchIcon /></IconButton>,
          }}
        />
      </Box>

      <Table sx={{ minWidth: 650 }} aria-label="module table">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell>Sl</TableCell>
            <TableCell>Module Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {modules.length > 0 ? (
            modules.map((module, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{module.name}</TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={module.status === 'active'}
                        onChange={() => handleToggleStatus(index)}
                        color="primary"
                      />
                    }
                    label={module.status ? module.status.charAt(0).toUpperCase() + module.status.slice(1) : 'Unknown'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleView(module)} title="View">
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton onClick={() => handleEdit(index)} title="Edit">
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box component="img" src="https://via.placeholder.com/150" alt="No Data" sx={{ width: '150px', height: '150px' }} />
                  <Typography variant="body1">No Data Found</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Snackbar
        open={openToast}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseToast} severity={toastMessage.includes('required') ? 'error' : 'success'} sx={{ backgroundColor: toastMessage.includes('required') ? '#d32f2f' : '#1976d2', color: 'white' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddModule;
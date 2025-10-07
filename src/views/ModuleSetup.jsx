import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Button,
  useTheme,
  CircularProgress,
  Alert,
  Switch,
  Paper,
  Grid,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// Import CKEditor
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const ModuleSetup = () => {
  const theme = useTheme();

  // State for module list
  const [searchTerm, setSearchTerm] = useState('');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for adding/editing module
  const [moduleForm, setModuleForm] = useState({
    name: '',
    description: '',
    appIcon: null,
    thumbnail: null,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Toggle form visibility and mode
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [editingModule, setEditingModule] = useState(null);

  // State for action menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  // State for image previews
  const [imagePreview, setImagePreview] = useState({
    appIcon: null,
    thumbnail: null,
  });

  // Fetch modules from API
  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:5000/api/modules');
        if (!res.ok) throw new Error('Failed to fetch modules');
        const data = await res.json();
        setModules(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  // Reset form function
  const resetForm = () => {
    setModuleForm({ name: '', description: '', appIcon: null, thumbnail: null });
    setImagePreview({ appIcon: null, thumbnail: null });
    setFormError(null);
    setEditingModule(null);
    
    // Reset file inputs
    const iconInput = document.getElementById('app-icon-upload');
    const thumbnailInput = document.getElementById('thumbnail-upload');
    if (iconInput) iconInput.value = '';
    if (thumbnailInput) thumbnailInput.value = '';
  };

  // Handle Add Module
  const handleAddModule = () => {
    resetForm();
    setFormMode('add');
    setShowForm(true);
  };

  // Handle Edit Module
  const handleEditModule = (module) => {
    setFormMode('edit');
    setEditingModule(module);
    setModuleForm({
      name: module.title || '',
      description: module.description || '',
      appIcon: null,
      thumbnail: null,
    });
    
    // Set existing image previews if they exist
    setImagePreview({
      appIcon: module.iconUrl ? `http://localhost:5000${module.iconUrl}` : null,
      thumbnail: module.thumbnailUrl ? `http://localhost:5000${module.thumbnailUrl}` : null,
    });
    
    setShowForm(true);
    handleActionClose();
  };

  // Handle file uploads with preview
  const handleAppIconUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormError('Please upload only image files for app icon');
        return;
      }
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setFormError('App icon file size should be less than 2MB');
        return;
      }
      
      setModuleForm({ ...moduleForm, appIcon: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => ({ ...prev, appIcon: reader.result }));
      };
      reader.readAsDataURL(file);
      
      setFormError(null);
    }
  };

  const handleThumbnailUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormError('Please upload only image files for thumbnail');
        return;
      }
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setFormError('Thumbnail file size should be less than 2MB');
        return;
      }
      
      setModuleForm({ ...moduleForm, thumbnail: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => ({ ...prev, thumbnail: reader.result }));
      };
      reader.readAsDataURL(file);
      
      setFormError(null);
    }
  };

  // Remove image preview
  const removeImagePreview = (type) => {
    setModuleForm(prev => ({ ...prev, [type]: null }));
    setImagePreview(prev => ({ ...prev, [type]: null }));
    
    // Reset file input
    const inputId = type === 'appIcon' ? 'app-icon-upload' : 'thumbnail-upload';
    const input = document.getElementById(inputId);
    if (input) input.value = '';
  };

  // Handle module status toggle
  const toggleModuleStatus = async (moduleId, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/modules/${moduleId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) throw new Error('Failed to update module status');

      // Update the module in the list
      setModules(modules.map(module => 
        module._id === moduleId ? { ...module, isActive: !currentStatus } : module
      ));
    } catch (err) {
      console.error('Status toggle error:', err);
      setError('Failed to update module status');
    }
  };

  // Handle action menu
  const handleActionClick = (event, module) => {
    setAnchorEl(event.currentTarget);
    setSelectedModule(module);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedModule(null);
  };

  // Filtered modules by search term
  const filteredModules = modules.filter((module) =>
    module.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submit (both add and edit)
  const handleSubmit = async () => {
    if (!moduleForm.name.trim()) {
      setFormError('Module name is required');
      return;
    }

    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', moduleForm.name.trim());
      formData.append('description', moduleForm.description);
      
      if (moduleForm.appIcon) {
        formData.append('icon', moduleForm.appIcon);
      }
      
      if (moduleForm.thumbnail) {
        formData.append('thumbnail', moduleForm.thumbnail);
      }

      let res;
      if (formMode === 'add') {
        // Create new module
        res = await fetch('http://localhost:5000/api/modules', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Update existing module
        res = await fetch(`http://localhost:5000/api/modules/${editingModule._id}`, {
          method: 'PUT',
          body: formData,
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${formMode} module`);
      }

      const responseData = await res.json();
      
      if (formMode === 'add') {
        setModules([...modules, responseData.module]);
      } else {
        setModules(modules.map(module => 
          module._id === editingModule._id ? responseData.module : module
        ));
      }
      
      resetForm();
      setShowForm(false);
      
    } catch (err) {
      console.error(`${formMode} module error:`, err);
      setFormError(err.message || `Failed to ${formMode} module`);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle cancel form
  const handleCancelForm = () => {
    resetForm();
    setShowForm(false);
    setFormMode('add');
  };

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.grey[100], minHeight: '100vh' }}>
      {!showForm ? (
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3, backgroundColor: 'white' }} elevation={2}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Module Set Up
          </Typography>

          {/* Search and Add Module Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                variant="outlined"
                placeholder="Search Module"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ width: 250 }}
              />
              <Button
                variant="outlined"
                sx={{
                  minWidth: 40,
                  height: 40,
                  backgroundColor: theme.palette.grey[400],
                  color: 'white',
                  '&:hover': { backgroundColor: theme.palette.grey[500] },
                }}
              >
                <SearchIcon />
              </Button>
            </Box>

            <Button
              variant="contained"
              onClick={handleAddModule}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': { backgroundColor: theme.palette.primary.dark },
              }}
            >
              Add Module
            </Button>
          </Box>

          {/* Loading / Error States */}
          {loading && (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Table */}
          {!loading && !error && (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 600 }}>Sl No</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Module Id</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredModules.length > 0 ? (
                  filteredModules.map((module, index) => (
                    <TableRow key={module._id} sx={{ '&:hover': { backgroundColor: theme.palette.grey[50] } }}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{module.moduleId || 'N/A'}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{module.title}</TableCell>
                      <TableCell>
                        <Switch
                          checked={module.isActive}
                          onChange={() => toggleModuleStatus(module._id, module.isActive)}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditModule(module)}
                            sx={{ color: 'primary.main' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      {searchTerm ? 'No modules found matching your search.' : 'No modules available.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Action Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleActionClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1,
                minWidth: 120,
              },
            }}
          >
            <MenuItem onClick={() => handleEditModule(selectedModule)} sx={{ py: 1 }}>
              <EditIcon sx={{ mr: 2, fontSize: 20 }} />
              Edit
            </MenuItem>
          </Menu>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }} elevation={2}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            {formMode === 'add' ? 'Add New Module' : 'Edit Module'}
          </Typography>

          {formError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          {/* Module Name Input */}
          <TextField
            fullWidth
            label="Name of Module"
            placeholder="Name of Module"
            value={moduleForm.name}
            onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
            required
            sx={{ mb: 3 }}
          />

          {/* CKEditor for Description */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Module Description
            </Typography>
            <CKEditor
              editor={ClassicEditor}
              data={moduleForm.description}
              onChange={(event, editor) => {
                const data = editor.getData();
                setModuleForm({ ...moduleForm, description: data });
              }}
            />
          </Box>

          {/* File Upload Section */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* App Icon Upload */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  height: 200,
                  border: `2px dashed ${theme.palette.grey[300]}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.light + '20',
                  },
                }}
                onClick={() => document.getElementById('app-icon-upload').click()}
              >
                {imagePreview.appIcon ? (
                  <Box sx={{ position: 'relative', textAlign: 'center' }}>
                    <img 
                      src={imagePreview.appIcon} 
                      alt="App Icon Preview" 
                      style={{ 
                        maxWidth: '120px', 
                        maxHeight: '120px', 
                        objectFit: 'contain',
                        marginBottom: '8px'
                      }} 
                    />
                    <IconButton
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: -10, 
                        right: -10, 
                        backgroundColor: 'error.main',
                        color: 'white',
                        '&:hover': { backgroundColor: 'error.dark' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImagePreview('appIcon');
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" display="block" color="primary">
                      {moduleForm.appIcon ? moduleForm.appIcon.name : 'Current App Icon'}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 50, color: theme.palette.grey[400], mb: 1 }} />
                    <Typography variant="body1" fontWeight={500}>
                      Upload App Icon
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Max 2MB, PNG/JPEG only
                    </Typography>
                  </>
                )}
                <input
                  id="app-icon-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAppIconUpload}
                />
              </Paper>
            </Grid>

            {/* Thumbnail Upload */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  height: 200,
                  border: `2px dashed ${theme.palette.grey[300]}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.light + '20',
                  },
                }}
                onClick={() => document.getElementById('thumbnail-upload').click()}
              >
                {imagePreview.thumbnail ? (
                  <Box sx={{ position: 'relative', textAlign: 'center' }}>
                    <img 
                      src={imagePreview.thumbnail} 
                      alt="Thumbnail Preview" 
                      style={{ 
                        maxWidth: '120px', 
                        maxHeight: '120px', 
                        objectFit: 'contain',
                        marginBottom: '8px'
                      }} 
                    />
                    <IconButton
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: -10, 
                        right: -10, 
                        backgroundColor: 'error.main',
                        color: 'white',
                        '&:hover': { backgroundColor: 'error.dark' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImagePreview('thumbnail');
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" display="block" color="primary">
                      {moduleForm.thumbnail ? moduleForm.thumbnail.name : 'Current Thumbnail'}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 50, color: theme.palette.grey[400], mb: 1 }} />
                    <Typography variant="body1" fontWeight={500}>
                      Upload Thumbnail
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Max 2MB, PNG/JPEG only
                    </Typography>
                  </>
                )}
                <input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleThumbnailUpload}
                />
              </Paper>
            </Grid>
          </Grid>

          {/* Submit Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handleCancelForm}
              sx={{ px: 4, py: 1 }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={formLoading}
              sx={{
                px: 4,
                py: 1,
                backgroundColor: theme.palette.primary.main,
                '&:hover': { backgroundColor: theme.palette.primary.dark },
              }}
            >
              {formLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                formMode === 'add' ? 'Submit' : 'Update'
              )}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ModuleSetup;
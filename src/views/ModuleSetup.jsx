import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

// Import CKEditor
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const ModuleSetup = () => {
  const theme = useTheme();

  // State for module list
  const [searchTerm, setSearchTerm] = useState('');
  const [modules, setModules] = useState([
    { id: 1, moduleId: 1, name: 'Venue', totalVendors: 12, status: true },
    { id: 2, moduleId: 2, name: 'Catering', totalVendors: 8, status: true },
    { id: 3, moduleId: 3, name: 'Photography', totalVendors: 5, status: false },
  ]);

  const [loading] = useState(false);
  const [error] = useState(null);

  // State for adding new module
  const [newModule, setNewModule] = useState({
    name: '',
    description: '', // CKEditor content
    appIcon: null,
    thumbnail: null,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Toggle form visibility
  const [showAddForm, setShowAddForm] = useState(false);

  // Handle file uploads
  const handleAppIconUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewModule({ ...newModule, appIcon: file });
    }
  };

  const handleThumbnailUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewModule({ ...newModule, thumbnail: file });
    }
  };

  // Handle module status toggle
  const toggleModuleStatus = (moduleId) => {
    setModules(
      modules.map((module) =>
        module.id === moduleId ? { ...module, status: !module.status } : module
      )
    );
  };

  // Filtered modules by search term
  const filteredModules = modules.filter((module) =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle submit new module
  const handleSubmit = async () => {
    if (!newModule.name.trim()) {
      setCreateError('Module name is required');
      return;
    }

    setCreateLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const moduleToAdd = {
        id: modules.length + 1,
        moduleId: modules.length + 1,
        name: newModule.name,
        totalVendors: 0,
        status: true,
        description: newModule.description,
      };

      setModules([...modules, moduleToAdd]);
      setNewModule({
        name: '',
        description: '',
        appIcon: null,
        thumbnail: null,
      });
      setCreateError(null);
      setShowAddForm(false);
    } catch (err) {
      setCreateError('Failed to create module');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.grey[100], minHeight: '100vh' }}>
      {!showAddForm ? (
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
              onClick={() => setShowAddForm(true)}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': { backgroundColor: theme.palette.primary.dark },
              }}
            >
              Add Module
            </Button>
          </Box>

          {/* Table */}
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell sx={{ fontWeight: 600 }}>Sl No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Module Id</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total Vendors</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredModules.map((module, index) => (
                <TableRow key={module.id} sx={{ '&:hover': { backgroundColor: theme.palette.grey[50] } }}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{module.moduleId}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{module.name}</TableCell>
                  <TableCell>{module.totalVendors}</TableCell>
                  <TableCell>
                    <Switch
                      checked={module.status}
                      onChange={() => toggleModuleStatus(module.id)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }} elevation={2}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Add New Module
          </Typography>

          {createError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setCreateError(null)}>
              {createError}
            </Alert>
          )}

          {/* Module Name Input */}
          <TextField
            fullWidth
            label="Name of Module"
            placeholder="Name of Module"
            value={newModule.name}
            onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
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
              data={newModule.description}
              onChange={(event, editor) => {
                const data = editor.getData();
                setNewModule({ ...newModule, description: data });
              }}
            />
          </Box>

          {/* File Upload Section */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
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
                  width: '100%',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.light + '20',
                  },
                }}
                onClick={() => document.getElementById('app-icon-upload').click()}
              >
                {newModule.appIcon ? (
                  <Typography variant="body2" color="primary">
                    {newModule.appIcon.name}
                  </Typography>
                ) : (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 50, color: theme.palette.grey[400], mb: 1 }} style={{width:"200px"}} />
                    <Typography variant="body1" fontWeight={500}>
                      Upload App Icon
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
                  width: '100%',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.light + '20',
                  },
                }}
                onClick={() => document.getElementById('thumbnail-upload').click()}
              >
                {newModule.thumbnail ? (
                  <Typography variant="body2" color="primary">
                    {newModule.thumbnail.name}
                  </Typography>
                ) : (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 50, color: theme.palette.grey[400], mb: 1 }} style={{width:"200px"}}  />
                    <Typography variant="body1" fontWeight={500}>
                      Upload Thumbnail
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

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => setShowAddForm(false)}
              sx={{ px: 4, py: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={createLoading}
              sx={{ px: 4, py: 1, backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } }}
            >
              {createLoading ? <CircularProgress size={20} color="inherit" /> : 'Submit'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ModuleSetup;
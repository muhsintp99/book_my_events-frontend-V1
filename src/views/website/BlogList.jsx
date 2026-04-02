
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
  Tooltip,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Drawer,
  Grid,
  Card,
  FormControlLabel,
  Switch,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { API_BASE_URL, getApiImageUrl } from '../../utils/apiImageUtils';

// --- Add/Edit Blog Form Component (Internal) ---
const BlogForm = ({ id, categories, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    author: 'Admin',
    isPublished: true,
    tags: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const getAuthToken = () => localStorage.getItem('token') || '';

  const fetchBlog = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs/id/${id}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const { title, content, summary, category, author, isPublished, tags, featuredImage } = result.data;
          setBlogForm({
            title,
            content: content || '',
            summary: summary || '',
            category: category || '',
            author: author || 'Admin',
            isPublished: isPublished !== undefined ? isPublished : true,
            tags: Array.isArray(tags) ? tags.join(', ') : (tags || ''),
          });
          if (featuredImage) {
            setImagePreview(featuredImage.startsWith('http') ? featuredImage : getApiImageUrl(featuredImage));
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (id) {
        setFetching(true);
        fetchBlog();
    } else {
        setBlogForm(prev => ({
            ...prev,
            title: '',
            content: '',
            summary: '',
            tags: '',
            category: categories.length > 0 ? categories[0] : ''
        }));
        setImage(null);
        setImagePreview(null);
        setFetching(false);
    }
  }, [id, categories]);

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setBlogForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('title', blogForm.title);
    formData.append('content', blogForm.content);
    formData.append('summary', blogForm.summary);
    formData.append('category', blogForm.category);
    formData.append('author', blogForm.author);
    formData.append('isPublished', blogForm.isPublished);
    if (blogForm.tags) {
        blogForm.tags.split(',').forEach(tag => {
            const trimmedTag = tag.trim();
            if (trimmedTag) {
                formData.append('tags[]', trimmedTag);
            }
        });
    }
    if (image) {
      formData.append('image', image);
    }

    try {
      const url = id ? `${API_BASE_URL}/blogs/${id}` : `${API_BASE_URL}/blogs/create`;
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        body: formData,
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSuccess(id ? 'Blog updated successfully' : 'Blog created successfully');
        if (onSuccess) {
            setTimeout(() => onSuccess(), 1000);
        }
      } else {
        throw new Error(result.error || result.message || 'Failed to save blog');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Blog Title *"
              name="title"
              value={blogForm.title}
              onChange={handleInputChange}
              fullWidth
              required
              variant="outlined"
              sx={{ bgcolor: '#f8fafc' }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Category *"
              name="category"
              value={blogForm.category}
              onChange={handleInputChange}
              fullWidth
              required
              variant="outlined"
              sx={{ bgcolor: '#f8fafc' }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Summary *"
              name="summary"
              value={blogForm.summary}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
              required
              variant="outlined"
              sx={{ bgcolor: '#f8fafc' }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Content *"
              name="content"
              value={blogForm.content}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={8}
              required
              variant="outlined"
              sx={{ bgcolor: '#f8fafc' }}
              placeholder="Write your blog content here..."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Tags (Comma separated)"
              name="tags"
              value={blogForm.tags}
              onChange={handleInputChange}
              fullWidth
              placeholder="e.g. Wedding, Planning, Events"
              variant="outlined"
              sx={{ bgcolor: '#f8fafc' }}
            />
          </Grid>
          
          <Grid item xs={12}>
             <FormControlLabel
                control={
                    <Switch
                    checked={blogForm.isPublished}
                    onChange={handleInputChange}
                    name="isPublished"
                    sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#EA4C46' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#EA4C46' },
                    }}
                    />
                }
                label="Published"
            />
          </Grid>

          <Grid item xs={12}>
            <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#64748b' }}>Featured Image</Typography>
                <Box
                sx={{
                    border: '1px dashed #cbd5e1',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: '#f8fafc',
                    '&:hover': { bgcolor: '#f1f5f9' },
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={() => document.getElementById('blog-image-upload-drawer-internal').click()}
                >
                <input
                    id="blog-image-upload-drawer-internal"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                />
                <Typography variant="body2" color="#64748b">
                    {image ? image.name : 'Click to upload featured image'}
                </Typography>
                </Box>
                {imagePreview && (
                <Box sx={{ mt: 1, textAlign: 'center', position: 'relative' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 100, objectFit: 'cover', borderRadius: 4 }} />
                    <IconButton size="small" onClick={() => { setImage(null); setImagePreview(null); }} sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.7)' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
                )}
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 'auto', pt: 4, display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={onCancel} 
            disabled={loading}
            sx={{ 
                height: 48, 
                borderRadius: 1.5, 
                color: '#EA4C46', 
                borderColor: '#EA4C46',
                '&:hover': { borderColor: '#d43d37', bgcolor: '#fff5f5' }
            }}
          >
            Cancel
          </Button>
          <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                    height: 48,
                    borderRadius: 1.5,
                    bgcolor: '#EA4C46',
                    '&:hover': { bgcolor: '#d43d37' },
                    boxShadow: 'none'
                }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : id ? 'Update' : 'Create'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

// --- Main BlogList Component ---
const BlogList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [categories, setCategories] = useState([]);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState('all');

  const getAuthToken = () => localStorage.getItem('token') || '';

  const fetchCategories = async () => {
      try {
          const [modRes, secModRes] = await Promise.all([
              fetch(`${API_BASE_URL}/modules`, { headers: { 'Authorization': `Bearer ${getAuthToken()}` } }),
              fetch(`${API_BASE_URL}/secondary-modules`, { headers: { 'Authorization': `Bearer ${getAuthToken()}` } })
          ]);
          
          const mods = await modRes.json();
          const secMods = await secModRes.json();
          
          const allModules = [
              ...(Array.isArray(mods) ? mods : (mods.data || [])),
              ...(Array.isArray(secMods) ? secMods : (secMods.data || []))
          ];
          
          setCategories(allModules.map(m => m.title));
      } catch (err) {
          console.error('Failed to fetch categories:', err);
      }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/blogs?page=${currentPage}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blogs: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setBlogs(result.data);
        setTotalItems(result.pagination.total);
      } else {
        throw new Error(result.error || 'Failed to fetch blogs');
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (response.ok) {
        setSuccess('Blog deleted successfully');
        fetchBlogs();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete blog');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBlogs();
  }, [currentPage, itemsPerPage]);

  const handleAddClick = () => {
    setEditingId(null);
    setDrawerOpen(true);
  };

  const handleEditClick = (id) => {
    setEditingId(id);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditingId(null);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchBlogs();
  };

  const filteredBlogs = blogs.filter(blog => 
    (categoryFilter === 'all' || blog.category === categoryFilter) &&
    (blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     blog.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 'lg', margin: 'auto', backgroundColor: 'white', borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', p: 3 }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" fontWeight={700} color="#1e293b">
            Blog Management List
          </Typography>
          <Button variant="contained" 
            sx={{ bgcolor: '#EA4C46', '&:hover': { bgcolor: '#d43d37' }, px: 3, borderRadius: 2, boxShadow: 'none' }} 
            onClick={handleAddClick}
          >
            + Create Blog
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

        <Card sx={{ p: 2, mb: 3, boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    variant="outlined"
                    placeholder="Search by title or author"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: '#94a3b8' }} /> }}
                />

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel sx={{ color: '#94a3b8' }}>Category</InputLabel>
                    <Select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)} 
                        label="Category"
                        sx={{ borderRadius: 2 }}
                    >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map((cat, idx) => (
                        <MenuItem key={idx} value={cat}>{cat}</MenuItem>
                    ))}
                    </Select>
                </FormControl>

                <Button 
                    variant="outlined" 
                    startIcon={<RefreshIcon />} 
                    onClick={fetchBlogs} 
                    disabled={loading}
                    sx={{ borderRadius: 2, borderColor: '#e2e8f0', color: '#64748b', '&:hover': { borderColor: '#cbd5e1' } }}
                >
                    Refresh
                </Button>
            </Box>
        </Card>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Sr</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Author</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Created At</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBlogs.length === 0 ? (
                  <TableRow><TableCell colSpan={8} align="center">No blogs found</TableCell></TableRow>
                ) : (
                  filteredBlogs.map((blog, index) => (
                    <TableRow key={blog._id} sx={{ '&:hover': { bgcolor: '#f1f5f9' } }}>
                      <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <img 
                          src={blog.featuredImage?.startsWith('http') ? blog.featuredImage : getApiImageUrl(blog.featuredImage)} 
                          alt={blog.title} 
                          style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/60x40?text=No+Image'; }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#1e293b' }}>{blog.title}</TableCell>
                      <TableCell><Chip label={blog.category} size="small" variant="outlined" sx={{ borderRadius: 1.5 }} /></TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{blog.author}</TableCell>
                      <TableCell>
                        <Chip 
                          label={blog.isPublished ? 'Published' : 'Draft'} 
                          sx={{ 
                              bgcolor: blog.isPublished ? '#dcfce7' : '#f1f5f9', 
                              color: blog.isPublished ? '#14532d' : '#475569',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              borderRadius: 1.5
                          }} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" sx={{ color: '#3b82f6', bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' } }} onClick={() => handleEditClick(blog._id)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" sx={{ color: '#ef4444', bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }} onClick={() => deleteBlog(blog._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination count={totalPages} page={currentPage} onChange={(e, page) => setCurrentPage(page)} color="primary" />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Blog Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 500 }, p: 4, display: 'flex', flexDirection: 'column' }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {editingId ? 'Edit Blog Article' : 'Create New Blog Article'}
            </Typography>
            <IconButton onClick={handleDrawerClose} sx={{ color: '#64748b' }}>
                <CloseIcon />
            </IconButton>
        </Box>
        <BlogForm id={editingId} categories={categories} onSuccess={handleFormSuccess} onCancel={handleDrawerClose} />
      </Drawer>
    </Box>
  );
};

export default BlogList;

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Tooltip,
  Fab,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  Star as StarIcon,
  Tag as TagIcon,
  CheckCircle as CheckIcon,
  Upload as UploadIcon,
  Group as GroupIcon,
  Inventory as ProductIcon,
  Description as DescriptionIcon,
  CurrencyRupee as PriceIcon,
  AccessTime as DurationIcon
} from '@mui/icons-material';

const API = 'http://localhost:5000';

export default function AddPackage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [modules, setModules] = useState([]);
  const [moduleId, setModuleId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationInDays, setDurationInDays] = useState(365);

  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const [maxUploads, setMaxUploads] = useState(20);
  const [allowedProducts, setAllowedProducts] = useState(100);
  const [allowedMembers, setAllowedMembers] = useState(3);

  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [trialAvailable, setTrialAvailable] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/modules`);
        setModules(res.data.modules || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const fetchPlan = async () => {
      try {
        const res = await axios.get(`${API}/api/subscription/plan/${id}`);
        // if (res.data.success) {
        //   const p = res.data.plan;
        //   setModuleId(p.moduleId?._id || "");
        //   setName(p.name || "");
        //   setDescription(p.description || "");
        //   setPrice(p.price || "");
        //   setDurationInDays(p.durationInDays || 365);
        //   setFeatures(p.features || []);
        //   setTags(p.tags || []);
        //   setMaxUploads(p.maxUploads ?? 20);
        //   setAllowedProducts(p.allowedProducts ?? 100);
        //   setAllowedMembers(p.allowedMembers ?? 3);
        //   setIsPopular(!!p.isPopular);
        //   setIsActive(p.isActive !== false);
        //   setTrialAvailable(!!p.trialAvailable);
        // }
        if (res.data.success) {
          const p = res.data.plan;

          setModuleId(p.moduleId?._id || '');
          setName(p.name || '');
          setDescription(p.description || '');

          // Only default 365
          setDurationInDays(p.durationInDays ?? 365);

          setPrice(p.price ?? '');

          // Use values as received (no default)
          setFeatures(p.features ?? []);
          setTags(p.tags ?? []);

          // No default values here
          setMaxUploads(p.maxUploads ?? '');
          setAllowedProducts(p.allowedProducts ?? '');
          setAllowedMembers(p.allowedMembers ?? '');

          setIsPopular(Boolean(p.isPopular));
          setIsActive(p.isActive !== false);
          setTrialAvailable(Boolean(p.trialAvailable));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlan();
  }, [id, isEdit]);

  const addFeature = () => {
    const val = featureInput.trim();
    if (val && !features.includes(val)) {
      setFeatures([...features, val]);
      setFeatureInput('');
    }
  };

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!moduleId) return alert('Please select a module');
    if (!name.trim()) return alert('Package name is required');
    if (!price || Number(price) <= 0) return alert('Enter a valid price');

    const payload = {
      moduleId,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      currency: 'INR',
      durationInDays: Number(durationInDays),
      features,
      tags,
      maxUploads: Number(maxUploads),
      allowedProducts: Number(allowedProducts),
      allowedMembers: Number(allowedMembers),
      isPopular,
      isActive,
      trialAvailable,
      planType: 'yearly'
    };

    setSubmitting(true);
    try {
      isEdit ? await axios.put(`${API}/api/subscription/plan/${id}`, payload) : await axios.post(`${API}/api/subscription/plan`, payload);
      alert(isEdit ? 'Package updated!' : 'Package created!');
      navigate('/settings/sub/list');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    if (window.confirm('Reset all fields?')) {
      setModuleId('');
      setName('');
      setDescription('');
      setPrice('');
      setDurationInDays(365);
      setFeatures([]);
      setTags([]);
      setMaxUploads(20);
      setAllowedProducts(100);
      setAllowedMembers(3);
      setIsPopular(false);
      setIsActive(true);
      setTrialAvailable(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f5f8ff', minHeight: '100vh', py: 4 }}>
      {/* FULL WIDTH CONTAINER - Extra Wide */}
      <Container maxWidth={false} sx={{ maxWidth: 1600, px: { xs: 2, lg: 4 } }}>
        {/* Header */}
        <Paper elevation={8} sx={{ borderRadius: 5, overflow: 'hidden', mb: 5 }}>
          <Box sx={{ bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', p: 6, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold">
              {isEdit ? 'Edit Subscription Package' : 'Create New Package'}
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, opacity: 0.95, fontWeight: 400 }}>
              Design a powerful, attractive, and scalable subscription plan
            </Typography>
          </Box>
        </Paper>

        {/* Main Wide Form Card */}
        <Paper elevation={6} sx={{ borderRadius: 5, p: { xs: 4, md: 6, lg: 8 } }}>
          <Stack spacing={7}>
            {/* Module Selection - Full Width */}
            <Box>
              <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
                Select Module
              </Typography>
              <FormControl fullWidth size="large">
                <InputLabel>Choose Module</InputLabel>
                <Select value={moduleId} label="Choose Module" onChange={(e) => setModuleId(e.target.value)}>
                  <MenuItem value="">
                    <em>Select a module</em>
                  </MenuItem>
                  {modules.map((m) => (
                    <MenuItem key={m._id} value={m._id}>
                      {m.title || m.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ borderColor: '#e0e0e0' }} />

            {/* Basic Info - Wide Layout */}
            <Box>
              <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
                Basic Information
              </Typography>
              <Stack spacing={4} mt={4}>
                <TextField
                  fullWidth
                  label="Package Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  size="large"
                  InputProps={{ startAdornment: <DescriptionIcon sx={{ mr: 2, color: 'action' }} /> }}
                />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                  <TextField
                    fullWidth
                    label="Price (INR) *"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    size="large"
                    InputProps={{ startAdornment: <PriceIcon sx={{ mr: 2, color: 'action' }} /> }}
                  />
                  <TextField
                    fullWidth
                    label="Duration (Days)"
                    type="number"
                    value={durationInDays}
                    onChange={(e) => setDurationInDays(e.target.value)}
                    size="large"
                    InputProps={{ startAdornment: <DurationIcon sx={{ mr: 2, color: 'action' }} /> }}
                  />
                </Stack>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this package offers..."
                />
              </Stack>
            </Box>

            <Divider />

            {/* Features & Limits - Side by Side on Large Screens */}
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={6}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
                  Features
                </Typography>
                <Stack direction="row" spacing={2} mt={3}>
                  <TextField
                    fullWidth
                    placeholder="e.g. Unlimited events, Custom branding, Priority support"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Tooltip title="Add Feature">
                    <Fab color="primary" size="medium" onClick={addFeature}>
                      <AddIcon />
                    </Fab>
                  </Tooltip>
                </Stack>
                <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {features.map((f) => (
                    <Chip key={f} label={f} onDelete={() => setFeatures(features.filter((x) => x !== f))} color="primary" size="medium" />
                  ))}
                  {features.length === 0 && <Typography color="text.secondary">No features added</Typography>}
                </Box>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
                  Usage Limits
                </Typography>
                <Stack spacing={4} mt={3}>
                  <TextField
                    fullWidth
                    label="Max Uploads"
                    type="number"
                    value={maxUploads}
                    onChange={(e) => setMaxUploads(e.target.value)}
                    InputProps={{ startAdornment: <UploadIcon sx={{ mr: 2, color: 'action' }} /> }}
                  />
                  <TextField
                    fullWidth
                    label="Allowed Products"
                    type="number"
                    value={allowedProducts}
                    onChange={(e) => setAllowedProducts(e.target.value)}
                    InputProps={{ startAdornment: <ProductIcon sx={{ mr: 2, color: 'action' }} /> }}
                  />
                  <TextField
                    fullWidth
                    label="Team Members"
                    type="number"
                    value={allowedMembers}
                    onChange={(e) => setAllowedMembers(e.target.value)}
                    InputProps={{ startAdornment: <GroupIcon sx={{ mr: 2, color: 'action' }} /> }}
                  />
                </Stack>
              </Box>
            </Stack>

            <Divider />

            {/* Tags */}
            <Box>
              <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
                Tags
              </Typography>
              <Stack direction="row" spacing={2} mt={3}>
                <TextField
                  fullWidth
                  placeholder="e.g. bestseller, premium, enterprise"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Tooltip title="Add Tag">
                  <Fab color="secondary" size="medium" onClick={addTag}>
                    <AddIcon />
                  </Fab>
                </Tooltip>
              </Stack>
              <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {tags.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    onDelete={() => setTags(tags.filter((x) => x !== t))}
                    color="success"
                    variant="outlined"
                    size="medium"
                  />
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Options */}
            <Box>
              <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
                Plan Options
              </Typography>
              <Stack direction="row" spacing={6} mt={4} flexWrap="wrap">
                <FormControlLabel
                  control={<Switch checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} color="warning" size="large" />}
                  label={
                    <Typography variant="h6">
                      <StarIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Popular Plan
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} size="large" />}
                  label={<Typography variant="h6">Active Plan</Typography>}
                />
                <FormControlLabel
                  control={
                    <Switch checked={trialAvailable} onChange={(e) => setTrialAvailable(e.target.checked)} color="success" size="large" />
                  }
                  label={<Typography variant="h6">Free Trial Available</Typography>}
                />
              </Stack>
            </Box>

            <Divider />

            {/* Action Buttons - Wide & Prominent */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3, mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ResetIcon />}
                onClick={resetForm}
                disabled={submitting}
                sx={{ minWidth: 180, py: 1.5 }}
              >
                Reset Form
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={submitting ? <CircularProgress size={26} /> : <SaveIcon />}
                onClick={handleSubmit}
                disabled={submitting}
                sx={{ minWidth: 240, py: 1.8, fontSize: '1.1rem', fontWeight: 'bold', boxShadow: 6 }}
              >
                {submitting ? 'Saving Package...' : isEdit ? 'Update Package' : 'Create Package'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

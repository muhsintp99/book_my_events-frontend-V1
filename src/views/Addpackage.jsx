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
  Container,
  Menu
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  Star as StarIcon,
  Upload as UploadIcon,
  Group as GroupIcon,
  Inventory as ProductIcon,
  Description as DescriptionIcon,
  CurrencyRupee as PriceIcon,
  AccessTime as DurationIcon,
  Storage as StorageIcon
} from '@mui/icons-material';

const API = 'http://localhost:5000';

// --------------------------------------------------
// DEFAULT BENEFITS FOR ALL PLANS
// --------------------------------------------------
const DEFAULT_BENEFITS = [
  "Included Benefits:",
  "2× visibility compared to Free Plan",
  "Dedicated profile management support",
  "Call support + priority response",
  "Guaranteed visibility on the first page",
  "5 relationship calls per year",
  "Pin two reviews at the top of your profile",
  "Full analytics access",
  "Multi-city listing option",
  "Visible customer contact details for incoming leads",
  "Maximum photo and video uploads"
];

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

  // -----------------------
  // PLAN BENEFITS (Separate Field)
  // -----------------------
  const [planBenefits, setPlanBenefits] = useState(DEFAULT_BENEFITS);
  const [benefitInput, setBenefitInput] = useState('');

  // -----------------------
  // FEATURES (Custom)
  // -----------------------
  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState('');

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // -----------------------
  // USAGE LIMITS (restored)
  // -----------------------
  const [maxUploads, setMaxUploads] = useState('');
  const [maxStorage, setMaxStorage] = useState('');
  const [storageUnit, setStorageUnit] = useState('MB'); // 'MB' or 'GB'
  const [allowedProducts, setAllowedProducts] = useState('');
  const [allowedMembers, setAllowedMembers] = useState('');

  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [trialAvailable, setTrialAvailable] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --------------------------------------------------
  // FETCH MODULES
  // --------------------------------------------------
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

  // --------------------------------------------------
  // EDIT MODE — LOAD PLAN
  // --------------------------------------------------
  useEffect(() => {
    if (!isEdit) return;

    const fetchPlan = async () => {
      try {
        const res = await axios.get(`${API}/api/subscription/plan/${id}`);
        if (res.data.success) {
          const p = res.data.plan;

          setModuleId(p.moduleId?._id || '');
          setName(p.name || '');
          setDescription(p.description || '');
          setDurationInDays(p.durationInDays ?? 365);
          setPrice(p.price ?? '');

          setPlanBenefits(p.planBenefits ?? DEFAULT_BENEFITS);
          setFeatures(p.features ?? []);
          setTags(p.tags ?? []);

          // USAGE LIMITS: load stored values (may be undefined)
          setMaxUploads(p.maxUploads ?? '');
          setMaxStorage(p.maxStorage ?? '');
          setStorageUnit(p.storageUnit ?? 'MB');
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

  // ---------------------------------------------
  // BENEFIT FUNCTIONS
  // ---------------------------------------------
  const addBenefit = () => {
    const val = benefitInput.trim();
    if (!val) return;
    if (planBenefits.includes(val)) {
      setBenefitInput(''); // clear but don't add duplicate
      return;
    }
    setPlanBenefits([...planBenefits, val]);
    setBenefitInput('');
  };

  const deleteBenefit = (b) => {
    if (b === "Included Benefits:")
      return alert("This heading cannot be removed.");
    setPlanBenefits(planBenefits.filter((x) => x !== b));
  };

  // ---------------------------------------------
  // FEATURE FUNCTIONS
  // ---------------------------------------------
  const addFeature = () => {
    const val = featureInput.trim();
    if (!val) return;
    if (features.includes(val)) {
      setFeatureInput('');
      return;
    }
    setFeatures([...features, val]);
    setFeatureInput('');
  };

  const deleteFeature = (f) => {
    setFeatures(features.filter((x) => x !== f));
  };

  // ---------------------------------------------
  // TAG FUNCTIONS
  // ---------------------------------------------
  const addTag = () => {
    const val = tagInput.trim();
    if (!val) return;
    if (tags.includes(val)) {
      setTagInput('');
      return;
    }
    setTags([...tags, val]);
    setTagInput('');
  };

  // --------------------------------------------------
  // SUBMIT PLAN
  // --------------------------------------------------
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

      // NEW FIELD
      planBenefits,

      // OLD
      features,
      tags,

      // USAGE LIMITS included in payload
      maxUploads: maxUploads ? Number(maxUploads) : null,
      maxStorage: maxStorage ? Number(maxStorage) : null,
      storageUnit: storageUnit || 'MB',
      allowedProducts: allowedProducts ? Number(allowedProducts) : null,
      allowedMembers: allowedMembers ? Number(allowedMembers) : null,

      isPopular,
      isActive,
      trialAvailable,
      planType: 'yearly'
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await axios.put(`${API}/api/subscription/plan/${id}`, payload);
        alert("Plan updated successfully!");
      } else {
        await axios.post(`${API}/api/subscription/plan`, payload);
        alert("Plan created successfully!");
      }

      navigate('/settings/sub/list');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving');
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------
  const resetForm = () => {
    if (!window.confirm("Reset all fields?")) return;

    setModuleId("");
    setName("");
    setDescription("");
    setPrice("");
    setDurationInDays(365);

    setPlanBenefits(DEFAULT_BENEFITS);
    setFeatures([]);
    setTags([]);

    // Reset usage limits
    setMaxUploads("");
    setMaxStorage("");
    setStorageUnit("MB");
    setAllowedProducts("");
    setAllowedMembers("");

    setIsPopular(false);
    setIsActive(true);
    setTrialAvailable(false);
  };

  // --------------------------------------------------
  // UI STARTS HERE
  // --------------------------------------------------

  return (
    <Box sx={{ bgcolor: '#f5f8ff', minHeight: '100vh', py: 4 }}>
      <Container maxWidth={false} sx={{ maxWidth: 1600, px: { xs: 2, lg: 4 } }}>

        {/* HEADER */}
        <Paper elevation={8} sx={{ borderRadius: 5, mb: 5, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#667eea', color: 'white', textAlign: 'center', p: 6 }}>
            <Typography variant="h3" fontWeight="bold">
              {isEdit ? "Edit Subscription Package" : "Create New Subscription Package"}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Design powerful subscription plans with benefits & features
            </Typography>
          </Box>
        </Paper>

        {/* MAIN CARD */}
        <Paper elevation={6} sx={{ borderRadius: 5, p: { xs: 3, md: 6 } }}>
          <Stack spacing={6}>

            {/* MODULE SELECT */}
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary">Select Module</Typography>
              <FormControl fullWidth>
                <InputLabel>Select Module</InputLabel>
                <Select value={moduleId} label="Select Module" onChange={(e) => setModuleId(e.target.value)}>
                  <MenuItem value=""><em>Select a module</em></MenuItem>
                  {modules.map((m) => (
                    <MenuItem key={m._id} value={m._id}>{m.title || m.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* BASIC INFO */}
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary">Basic Information</Typography>
              <Stack spacing={4} mt={3}>
                
                <TextField
                  label="Package Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                />

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <TextField
                    label="Price (INR) *"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Duration (Days)"
                    type="number"
                    value={durationInDays}
                    onChange={(e) => setDurationInDays(e.target.value)}
                    fullWidth
                  />
                </Stack>

                <TextField
                  multiline rows={4}
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                />

              </Stack>
            </Box>

            <Divider />

            {/* PLAN BENEFITS (SEPARATE FIELD) */}
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary">Plan Benefits</Typography>

              {/* Benefit input */}
              <Stack direction="row" spacing={2} mt={3}>
                <TextField
                  fullWidth
                  placeholder="Add a benefit..."
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
                />
                <Tooltip title="Add Benefit">
                  <Fab color="secondary" onClick={addBenefit}>
                    <AddIcon />
                  </Fab>
                </Tooltip>
              </Stack>

              {/* Benefit chips */}
              <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {planBenefits.map((b) => (
                  <Chip
                    key={b}
                    label={b}
                    onDelete={() => deleteBenefit(b)}
                    color="secondary"
                    size="medium"
                  />
                ))}
              </Box>
            </Box>

            <Divider />

            {/* FEATURES + USAGE LIMITS */}
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={6}>

              {/* FEATURES SECTION */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
                  Features
                </Typography>

                <Stack direction="row" spacing={2} mt={3}>
                  <TextField
                    fullWidth
                    placeholder="Add a custom feature..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Tooltip title="Add Feature">
                    <Fab color="primary" onClick={addFeature}>
                      <AddIcon />
                    </Fab>
                  </Tooltip>
                </Stack>

                <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {features.map((f) => (
                    <Chip
                      key={f}
                      label={f}
                      onDelete={() => deleteFeature(f)}
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>

              {/* USAGE LIMITS SECTION (RESTORED) */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
                  Usage Limits
                </Typography>

                <Stack spacing={3} mt={3}>
                  <TextField
                    fullWidth
                    label="Max Uploads"
                    type="number"
                    value={maxUploads}
                    onChange={(e) => setMaxUploads(e.target.value)}
                    InputProps={{ startAdornment: <UploadIcon sx={{ mr: 1 }} /> }}
                  />

                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      label="Max Storage"
                      type="number"
                      value={maxStorage}
                      onChange={(e) => setMaxStorage(e.target.value)}
                      InputProps={{ startAdornment: <StorageIcon sx={{ mr: 1 }} /> }}
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Unit</InputLabel>
                      <Select
                        value={storageUnit}
                        label="Unit"
                        onChange={(e) => setStorageUnit(e.target.value)}
                      >
                        <MenuItem value="MB">MB</MenuItem>
                        <MenuItem value="GB">GB</MenuItem>
                        <MenuItem value="TB">TB</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>

                  <TextField
                    fullWidth
                    label="Allowed Products"
                    type="number"
                    value={allowedProducts}
                    onChange={(e) => setAllowedProducts(e.target.value)}
                    InputProps={{ startAdornment: <ProductIcon sx={{ mr: 1 }} /> }}
                  />

                  <TextField
                    fullWidth
                    label="Team Members"
                    type="number"
                    value={allowedMembers}
                    onChange={(e) => setAllowedMembers(e.target.value)}
                    InputProps={{ startAdornment: <GroupIcon sx={{ mr: 1 }} /> }}
                  />
                </Stack>
              </Box>
            </Stack>

            <Divider />

            {/* TAGS */}
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary">Tags</Typography>
              <Stack direction="row" spacing={2} mt={3}>
                <TextField
                  fullWidth
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Tooltip title="Add Tag">
                  <Fab color="success" onClick={addTag}>
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
                    variant="outlined"
                    color="success"
                  />
                ))}
              </Box>
            </Box>

            <Divider />

            {/* PLAN OPTIONS */}
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary">Plan Options</Typography>
              <Stack direction="row" spacing={4} mt={3}>

                <FormControlLabel
                  control={<Switch checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} color="warning" />}
                  label={<Typography variant="h6"><StarIcon sx={{ mr: 1 }} /> Popular Plan</Typography>}
                />

                <FormControlLabel
                  control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                  label={<Typography variant="h6">Active Plan</Typography>}
                />

                <FormControlLabel
                  control={<Switch checked={trialAvailable} onChange={(e) => setTrialAvailable(e.target.checked)} color="success" />}
                  label={<Typography variant="h6">Free Trial Available</Typography>}
                />

              </Stack>
            </Box>

            <Divider />

            {/* ACTION BUTTONS */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
              <Button variant="outlined" size="large" startIcon={<ResetIcon />} onClick={resetForm}>
                Reset
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={submitting ? <CircularProgress size={24} /> : <SaveIcon />}
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Saving..." : isEdit ? "Update Package" : "Create Package"}
              </Button>
            </Box>

          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

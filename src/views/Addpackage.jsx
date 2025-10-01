import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
  FormControl,
  RadioGroup,
  Radio,
} from '@mui/material';
import { styled } from '@mui/system';
import {
  Dashboard as VendorPanelIcon,
  Smartphone as VendorAppIcon,
  PlayCircleOutline as Demo1Icon,
  PlayCircleFilled as Demo2Icon,
} from '@mui/icons-material';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'none',
  padding: theme.spacing(2),
}));

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const AddPackage = () => {
  const [packageNameDefault, setPackageNameDefault] = useState('');
  const [packageNameEnglish, setPackageNameEnglish] = useState('');
  const [packageNameArabic, setPackageNameArabic] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [packageValidityDays, setPackageValidityDays] = useState('');
  const [packageInfoDefault, setPackageInfoDefault] = useState('');
  const [packageInfoEnglish, setPackageInfoEnglish] = useState('');
  const [packageInfoArabic, setPackageInfoArabic] = useState('');
  const [features, setFeatures] = useState({
    vendorPanel: false,
    vendorApp: false,
    demo1: false,
    demo2: false,
  });
  const [maxOrderLimit, setMaxOrderLimit] = useState('unlimited');
  const [maxItemLimit, setMaxItemLimit] = useState('unlimited');
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  const handleFeatureChange = (event) => {
    setFeatures({ ...features, [event.target.name]: event.target.checked });
  };

  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    setFeatures({
      vendorPanel: isChecked,
      vendorApp: isChecked,
      demo1: isChecked,
      demo2: isChecked,
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log({
      packageNameDefault,
      packageNameEnglish,
      packageNameArabic,
      packagePrice,
      packageValidityDays,
      packageInfoDefault,
      packageInfoEnglish,
      packageInfoArabic,
      features,
      maxOrderLimit,
      maxItemLimit,
    });
    navigate('/settings/sub/list');
  };

  return (
    <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Subscription Package
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Create Subscriptions Packages for Subscription Business Model
      </Typography>
      <Box sx={{ mt: 2 }}>
        <StyledCard>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Package Information
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="language tabs">
                <Tab label="Default" {...a11yProps(0)} />
                <Tab label="English(EN)" {...a11yProps(1)} />
                <Tab label="العربية - Arabic (AR)" {...a11yProps(2)} />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Package Name (Default)"
                  variant="outlined"
                  value={packageNameDefault}
                  onChange={(e) => setPackageNameDefault(e.target.value)}
                  placeholder="Ex: 300"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Package Price ($)"
                  variant="outlined"
                  value={packagePrice}
                  onChange={(e) => setPackagePrice(e.target.value)}
                  placeholder="Ex: 365"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Package Validity Days"
                  variant="outlined"
                  value={packageValidityDays}
                  onChange={(e) => setPackageValidityDays(e.target.value)}
                  placeholder="Ex: 365"
                  sx={{ flex: 1 }}
                />
              </Box>
              <TextField
                label="Package info (Default)"
                variant="outlined"
                value={packageInfoDefault}
                onChange={(e) => setPackageInfoDefault(e.target.value)}
                placeholder="Ex: Value for money"
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Package Name (English)"
                  variant="outlined"
                  value={packageNameEnglish}
                  onChange={(e) => setPackageNameEnglish(e.target.value)}
                  placeholder="Ex: 300"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Package Price ($)"
                  variant="outlined"
                  value={packagePrice}
                  onChange={(e) => setPackagePrice(e.target.value)}
                  placeholder="Ex: 365"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Package Validity Days"
                  variant="outlined"
                  value={packageValidityDays}
                  onChange={(e) => setPackageValidityDays(e.target.value)}
                  placeholder="Ex: 365"
                  sx={{ flex: 1 }}
                />
              </Box>
              <TextField
                label="Package info (English)"
                variant="outlined"
                value={packageInfoEnglish}
                onChange={(e) => setPackageInfoEnglish(e.target.value)}
                placeholder="Ex: Value for money"
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Package Name (Arabic)"
                  variant="outlined"
                  value={packageNameArabic}
                  onChange={(e) => setPackageNameArabic(e.target.value)}
                  placeholder="Ex: 300"
                  sx={{ flex: 1 }}
                  dir="rtl"
                  inputProps={{ style: { textAlign: 'right' } }}
                />
                <TextField
                  label="Package Price ($)"
                  variant="outlined"
                  value={packagePrice}
                  onChange={(e) => setPackagePrice(e.target.value)}
                  placeholder="Ex: 365"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Package Validity Days"
                  variant="outlined"
                  value={packageValidityDays}
                  onChange={(e) => setPackageValidityDays(e.target.value)}
                  placeholder="Ex: 365"
                  sx={{ flex: 1 }}
                />
              </Box>
              <TextField
                label="Package info (Arabic)"
                variant="outlined"
                value={packageInfoArabic}
                onChange={(e) => setPackageInfoArabic(e.target.value)}
                placeholder="Ex: Value for money"
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 2 }}
                dir="rtl"
                inputProps={{ style: { textAlign: 'right' } }}
              />
            </TabPanel>
          </CardContent>
        </StyledCard>
        <StyledCard sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Package Available Features
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Mark the feature you want to give in this package
            </Typography>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={<Checkbox checked={Object.values(features).every(Boolean)} onChange={handleSelectAll} />}
                label="Select All"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={<Checkbox checked={features.vendorPanel} onChange={handleFeatureChange} name="vendorPanel" />}
                label={<><VendorPanelIcon fontSize="small" /> Vendor Panel</>}
              />
              <FormControlLabel
                control={<Checkbox checked={features.vendorApp} onChange={handleFeatureChange} name="vendorApp" />}
                label={<><VendorAppIcon fontSize="small" /> Vendor App</>}
              />
              <FormControlLabel
                control={<Checkbox checked={features.demo1} onChange={handleFeatureChange} name="demo1" />}
                label={<><Demo1Icon fontSize="small" /> Demo 1</>}
              />
              <FormControlLabel
                control={<Checkbox checked={features.demo2} onChange={handleFeatureChange} name="demo2" />}
                label={<><Demo2Icon fontSize="small" /> Demo 2</>}
              />
            </Box>
          </CardContent>
        </StyledCard>
        <StyledCard sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Set maximum order & product limit for this package
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl component="fieldset">
                <Typography variant="body2">Maximum Order Limit</Typography>
                <RadioGroup
                  row
                  value={maxOrderLimit}
                  onChange={(e) => setMaxOrderLimit(e.target.value)}
                >
                  <FormControlLabel value="unlimited" control={<Radio />} label="Unlimited (Default)" />
                  <FormControlLabel value="limit" control={<Radio />} label="Use Limit" />
                </RadioGroup>
              </FormControl>
              <FormControl component="fieldset">
                <Typography variant="body2">Maximum Item Limit</Typography>
                <RadioGroup
                  row
                  value={maxItemLimit}
                  onChange={(e) => setMaxItemLimit(e.target.value)}
                >
                  <FormControlLabel value="unlimited" control={<Radio />} label="Unlimited (Default)" />
                  <FormControlLabel value="limit" control={<Radio />} label="Use Limit" />
                </RadioGroup>
              </FormControl>
            </Box>
          </CardContent>
        </StyledCard>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setPackageNameDefault('');
              setPackageNameEnglish('');
              setPackageNameArabic('');
              setPackagePrice('');
              setPackageValidityDays('');
              setPackageInfoDefault('');
              setPackageInfoEnglish('');
              setPackageInfoArabic('');
              setFeatures({ vendorPanel: false, vendorApp: false, demo1: false, demo2: false });
              setMaxOrderLimit('unlimited');
              setMaxItemLimit('unlimited');
              setTabValue(0);
            }}
          >
            Reset
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddPackage;
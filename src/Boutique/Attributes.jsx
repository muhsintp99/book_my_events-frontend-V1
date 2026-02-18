import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Chip,
  IconButton,
  Button,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Palette as PaletteIcon,
  AttachMoney as AttachMoneyIcon,
  Straighten as StraightenIcon,
} from '@mui/icons-material';

const AttributeUI = () => {
  // State for attributes
  const [sizes, setSizes] = useState(['S', 'M', 'L', 'XL']);
  const [newSize, setNewSize] = useState('');
  const [selectedSizes, setSelectedSizes] = useState(['M', 'L']);

  const [colors, setColors] = useState([
    { name: 'Red', value: '#ff4444' },
    { name: 'Blue', value: '#4444ff' },
    { name: 'Green', value: '#44ff44' },
    { name: 'Black', value: '#000000' },
  ]);
  const [newColor, setNewColor] = useState({ name: '', value: '#000000' });
  const [selectedColors, setSelectedColors] = useState(['Red', 'Blue']);

  const [price, setPrice] = useState({
    base: 29.99,
    sale: 24.99,
    currency: 'USD',
  });

  // Size handlers
  const handleAddSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
      setNewSize('');
    }
  };

  const handleRemoveSize = (sizeToRemove) => {
    setSizes(sizes.filter(size => size !== sizeToRemove));
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  // Color handlers
  const handleAddColor = () => {
    if (newColor.name && !colors.some(c => c.name === newColor.name)) {
      setColors([...colors, { ...newColor }]);
      setNewColor({ name: '', value: '#000000' });
    }
  };

  const handleRemoveColor = (colorToRemove) => {
    setColors(colors.filter(color => color.name !== colorToRemove));
  };

  const handleColorToggle = (colorName) => {
    setSelectedColors(prev =>
      prev.includes(colorName)
        ? prev.filter(c => c !== colorName)
        : [...prev, colorName]
    );
  };

  // Price handlers
  const handlePriceChange = (field, value) => {
    setPrice(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          color: 'primary.main',
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        Product Attributes
      </Typography>

      <Grid container spacing={3}>
        {/* Size Section */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: 2,
                borderColor: 'primary.light',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <StraightenIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Sizes
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select available sizes and choose default selections
            </Typography>

            {/* Add Size Input */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Add New Size"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSize()}
              />
              <Button
                variant="contained"
                onClick={handleAddSize}
                disabled={!newSize}
                sx={{ minWidth: 'auto' }}
              >
                <AddIcon />
              </Button>
            </Box>

            {/* Available Sizes */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Available Sizes:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {sizes.map((size) => (
                  <Chip
                    key={size}
                    label={size}
                    onClick={() => handleSizeToggle(size)}
                    onDelete={() => handleRemoveSize(size)}
                    deleteIcon={<DeleteIcon />}
                    color={selectedSizes.includes(size) ? 'primary' : 'default'}
                    variant={selectedSizes.includes(size) ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Selected Sizes */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Selected Sizes:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedSizes.map((size) => (
                  <Chip
                    key={size}
                    label={size}
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Colors Section */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: 2,
                borderColor: 'primary.light',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PaletteIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Colors
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Add colors with names and hex values
            </Typography>

            {/* Add Color Input */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <TextField
                size="small"
                label="Color Name"
                value={newColor.name}
                onChange={(e) => setNewColor({...newColor, name: e.target.value})}
                sx={{ flex: 2 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <input
                  type="color"
                  value={newColor.value}
                  onChange={(e) => setNewColor({...newColor, value: e.target.value})}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                />
              </Box>
              <Button
                variant="contained"
                onClick={handleAddColor}
                disabled={!newColor.name}
                sx={{ minWidth: 'auto' }}
              >
                <AddIcon />
              </Button>
            </Box>

            {/* Available Colors */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Available Colors:
              </Typography>
              <Grid container spacing={1}>
                {colors.map((color) => (
                  <Grid item key={color.name}>
                    <Card
                      sx={{
                        width: 100,
                        cursor: 'pointer',
                        border: selectedColors.includes(color.name) 
                          ? '2px solid' 
                          : '1px solid',
                        borderColor: selectedColors.includes(color.name)
                          ? 'primary.main'
                          : 'divider',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3,
                        }
                      }}
                      onClick={() => handleColorToggle(color.name)}
                    >
                      <Box
                        sx={{
                          height: 60,
                          backgroundColor: color.value,
                          borderTopLeftRadius: 'inherit',
                          borderTopRightRadius: 'inherit',
                        }}
                      />
                      <CardContent sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="caption" noWrap>
                          {color.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Selected Colors */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Selected Colors:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {selectedColors.map((colorName) => {
                  const color = colors.find(c => c.name === colorName);
                  return color ? (
                    <Box
                      key={colorName}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: color.value,
                          borderRadius: '50%',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                      <Typography variant="body2">{colorName}</Typography>
                    </Box>
                  ) : null;
                })}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Price Section */}
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: 2,
                borderColor: 'primary.light',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Pricing
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Set base price and sale price for the product
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Base Price"
                  type="number"
                  value={price.base}
                  onChange={(e) => handlePriceChange('base', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Sale Price"
                  type="number"
                  value={price.sale}
                  onChange={(e) => handlePriceChange('sale', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'secondary.main',
                      },
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={price.currency}
                    label="Currency"
                    onChange={(e) => handlePriceChange('currency', e.target.value)}
                  >
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                    <MenuItem value="JPY">JPY (¥)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Price Summary */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Price Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Base Price:
                  </Typography>
                  <Typography variant="h6" color="text.primary">
                    ${price.base.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Sale Price:
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color={price.sale < price.base ? 'success.main' : 'text.primary'}
                  >
                    ${price.sale.toFixed(2)}
                  </Typography>
                </Grid>
                {price.sale < price.base && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="success.main">
                      You're saving ${(price.base - price.sale).toFixed(2)} ({((price.base - price.sale) / price.base * 100).toFixed(1)}% off)
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" size="large">
          Cancel
        </Button>
        <Button variant="contained" size="large" sx={{ px: 4 }}>
          Save Attributes
        </Button>
      </Box>
    </Box>
  );
};

export default AttributeUI;
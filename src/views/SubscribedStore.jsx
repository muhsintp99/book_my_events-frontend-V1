import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, 
  Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Menu, TextField, InputAdornment, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MoreVert } from '@mui/icons-material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 8,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e0e0e0',
}));

const StatsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: 16,
  marginBottom: 24,
}));

const StatCard = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  padding: 24,
  borderRadius: 8,
  flex: 1,
  textAlign: 'center',
  position: 'relative',
  border: '1px solid #e0e0e0',
}));

const StoreIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
  fontSize: '18px',
}));

const MetricsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 24,
  padding: '16px 0',
}));

const MetricItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 14,
  fontWeight: 500,
}));

const MetricDot = styled(Box)(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
}));

const SubscribedStore = () => {
  const [stores, setStores] = useState([
    { 
      id: 1, 
      name: 'CityLink Taxis', 
      rating: 4.0, 
      package: 'Regular', 
      price: '$500.00', 
      expDate: '05 Feb 2026', 
      used: 1, 
      icon: '🚕',
      iconBg: '#ff6b35',
      category: 'rental'
    },
    { 
      id: 2, 
      name: 'RideMaster Taxis', 
      rating: 5.0, 
      package: 'Premium', 
      price: '$1,000.00', 
      expDate: '05 Feb 2026', 
      used: 1, 
      icon: '🚗',
      iconBg: '#6c5ce7',
      category: 'rental'
    },
    { 
      id: 3, 
      name: 'Country Fair', 
      rating: 0.0, 
      package: 'Basic', 
      price: '$399.00', 
      expDate: '04 Oct 2024', 
      used: 1, 
      icon: '🌾',
      iconBg: '#00b894',
      category: 'event'
    },
    { 
      id: 4, 
      name: 'Sk General Store', 
      rating: 0.0, 
      package: 'Pro', 
      price: '$1,199.00', 
      expDate: '06 Jun 2025', 
      used: 1, 
      icon: '🏪',
      iconBg: '#fdcb6e',
      category: 'auditorium'
    },
    { 
      id: 5, 
      name: 'Drug Store', 
      rating: 0.0, 
      package: 'Basic', 
      price: '$399.00', 
      expDate: '04 Oct 2024', 
      used: 1, 
      icon: '💊',
      iconBg: '#00cec9',
      category: 'event'
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Filter stores based on search and category
  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.package.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || store.category === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Export functions
  const exportCSV = () => {
    const csvRows = [];
    const headers = ['Sl', 'Store Name', 'Rating', 'Package', 'Price', 'Exp Date', 'Used'];
    csvRows.push(headers.join(','));

    filteredStores.forEach((store, index) => {
      const values = [
        index + 1,
        store.name,
        store.rating,
        store.package,
        store.price,
        store.expDate,
        store.used
      ];
      csvRows.push(values.join(','));
    });

    const csvData = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(csvData);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.href = url;
    a.download = 'subscribed_stores.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportExcel = () => {
    // Since XLSX is not available in this environment, we'll create a simple Excel-like CSV
    const csvRows = [];
    const headers = ['Sl', 'Store Name', 'Rating', 'Package', 'Price', 'Exp Date', 'Used'];
    csvRows.push(headers.join('\t')); // Use tabs for Excel format

    filteredStores.forEach((store, index) => {
      const values = [
        index + 1,
        store.name,
        store.rating,
        store.package,
        store.price,
        store.expDate,
        store.used
      ];
      csvRows.push(values.join('\t'));
    });

    const csvData = new Blob([csvRows.join('\n')], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(csvData);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.href = url;
    a.download = 'subscribed_stores.xls';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ fontSize: '20px' }}>📋</Box>
          <Typography variant="h5" fontWeight={600}>
            Subscribed Store List
          </Typography>
        </Box>
        <Chip label="All Zones" variant="outlined" />
      </Box>

      {/* Stats Cards */}
      <StatsBox>
        <StatCard sx={{ backgroundColor: '#e3f2fd' }}>
          <Box sx={{ position: 'absolute', top: 8, right: 8, color: '#1976d2' }}>📊</Box>
          <Typography variant="h3" fontWeight="bold" color="#1976d2">8</Typography>
          <Typography variant="body2" color="#666">Total Subscribed User</Typography>
        </StatCard>
        <StatCard sx={{ backgroundColor: '#e8f5e9' }}>
          <Box sx={{ position: 'absolute', top: 8, right: 8, color: '#4caf50' }}>📈</Box>
          <Typography variant="h3" fontWeight="bold" color="#4caf50">2</Typography>
          <Typography variant="body2" color="#666">Active Subscriptions</Typography>
        </StatCard>
        <StatCard sx={{ backgroundColor: '#fff3e0' }}>
          <Box sx={{ position: 'absolute', top: 8, right: 8, color: '#ff9800' }}>📉</Box>
          <Typography variant="h3" fontWeight="bold" color="#ff9800">6</Typography>
          <Typography variant="body2" color="#666">Expired Subscription</Typography>
        </StatCard>
        <StatCard sx={{ backgroundColor: '#fff8e1' }}>
          <Box sx={{ position: 'absolute', top: 8, right: 8, color: '#ffc107' }}>👑</Box>
          <Typography variant="h3" fontWeight="bold" color="#ffc107">0</Typography>
          <Typography variant="body2" color="#666">Expiring Soon</Typography>
        </StatCard>
      </StatsBox>

      {/* Metrics Row */}
      <MetricsRow>
        <MetricItem sx={{ color: '#1976d2' }}>
          <MetricDot sx={{ backgroundColor: '#1976d2' }}></MetricDot>
          TOTAL TRANSACTIONS 8
        </MetricItem>
        <MetricItem sx={{ color: '#4caf50' }}>
          <MetricDot sx={{ backgroundColor: '#4caf50' }}></MetricDot>
          TOTAL EARNING $6,595.00
        </MetricItem>
        <MetricItem sx={{ color: '#ff5722' }}>
          <MetricDot sx={{ backgroundColor: '#ff5722' }}></MetricDot>
          EARNED THIS MONTH $0.00
        </MetricItem>
      </MetricsRow>

      {/* Store List Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Store List <span style={{ color: '#666' }}>{filteredStores.length}</span>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Category Dropdown */}
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
              size="small"
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Rental">Rental</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
              <MenuItem value="Auditorium">Auditorium</MenuItem>
            </Select>
          </FormControl>

          {/* Search Field */}
          <TextField
            size="small"
            placeholder="Ex: Search by name & pack"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          {/* Export Button */}
          <Button
            variant="outlined"
            startIcon={<MoreVert />}
            onClick={handleClick}
          >
            Export
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={() => { exportCSV(); handleClose(); }}>CSV</MenuItem>
            <MenuItem onClick={() => { exportExcel(); handleClose(); }}>Excel</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Table */}
      <StyledCard>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600, color: '#666', width: '8%' }}>Sl</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', width: '30%' }}>Store Info</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', width: '20%' }}>Current Package Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', width: '15%' }}>Package Price</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', width: '15%' }}>Exp Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', width: '12%', textAlign: 'center' }}>Total Subscription Used</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStores.map((store, index) => (
                <TableRow key={store.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StoreIcon sx={{ backgroundColor: store.iconBg }}>
                        {store.icon}
                      </StoreIcon>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {store.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="body2" color="#ffa726" sx={{ mr: 0.5 }}>
                            ⭐
                          </Typography>
                          <Typography variant="body2" color="#666">
                            {store.rating.toFixed(1)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{store.package}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {store.price}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {store.expDate}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={500}>
                      {store.used}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="#666" sx={{ py: 4 }}>
                      No stores found matching your search criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default SubscribedStore;
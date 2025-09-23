import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Typography,
  Table, TableBody, TableCell, TableHead, TableRow,
  Switch, IconButton, Menu, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, FormControl, InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { MoreVert } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx'; // For Excel export

const SubscriptionList = () => {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([
    { id: 1, name: 'Pro', price: '$1,199.00', duration: '365 Days', subscribers: 0, status: true },
    { id: 2, name: 'Standard', price: '$700.00', duration: '180 Days', subscribers: 0, status: true },
    { id: 3, name: 'Basic', price: '$399.00', duration: '120 Days', subscribers: 0, status: true },
  ]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [selectedModule, setSelectedModule] = useState('All');

  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleAddPackage = () => navigate('/settings/sub/add');
  const handleEditPackage = (id) => navigate(`/settings/sub/add/${id}`);

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedModule === 'All' || selectedModule === pkg.name.split(' ')[0])
  );

  const handleView = (pkg) => {
    setSelectedPkg(pkg);
    setViewOpen(true);
  };

  const handleViewClose = () => {
    setSelectedPkg(null);
    setViewOpen(false);
  };

  const handleToggleStatus = (id) => {
    setPackages(packages.map(pkg => pkg.id === id ? { ...pkg, status: !pkg.status } : pkg));
  };

  // --------- EXPORT FUNCTIONS ----------
  const exportCSV = () => {
    const csvRows = [];
    const headers = ['ID', 'Package Name', 'Price', 'Duration', 'Subscribers', 'Status'];
    csvRows.push(headers.join(','));

    packages.forEach(pkg => {
      const values = [
        pkg.id,
        pkg.name,
        pkg.price,
        pkg.duration,
        pkg.subscribers,
        pkg.status ? 'Active' : 'Inactive'
      ];
      csvRows.push(values.join(','));
    });

    const csvData = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(csvData);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.href = url;
    a.download = 'subscriptions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(packages.map(pkg => ({
      ID: pkg.id,
      'Package Name': pkg.name,
      Price: pkg.price,
      Duration: pkg.duration,
      Subscribers: pkg.subscribers,
      Status: pkg.status ? 'Active' : 'Inactive'
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscriptions');
    XLSX.writeFile(workbook, 'subscriptions.xlsx');
  };
  // -----------------------------------

  return (
    <Box sx={{ padding: 3, backgroundColor: 'white' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Subscription Package List</Typography>
      </Box>

      {/* Filter Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>All Module</InputLabel>
            <Select
              value={selectedModule}
              label="All Module"
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Rental">Rental</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
              <MenuItem value="Auditorium">Auditorium</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box>
          <Button variant="contained" color="primary" size="small">All</Button>
          <Button variant="outlined" color="primary" size="small">This Year</Button>
          <Button variant="outlined" color="primary" size="small">This Month</Button>
          <Button variant="outlined" color="primary" size="small">This Week</Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Card sx={{ width: '30%', backgroundColor: '#e6f3ff', textAlign: 'center', p: 2 }}>
          <CardContent>
            <Typography variant="h6" color="primary">Basic</Typography>
            <Typography variant="h4" color="primary">$798.00</Typography>
          </CardContent>
        </Card>
        <Card sx={{ width: '30%', backgroundColor: '#fff3e0', textAlign: 'center', p: 2 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary">Standard</Typography>
            <Typography variant="h4" color="text.secondary">$700.00</Typography>
          </CardContent>
        </Card>
        <Card sx={{ width: '30%', backgroundColor: '#e6f3ff', textAlign: 'center', p: 2 }}>
          <CardContent>
            <Typography variant="h6" color="primary">Pro</Typography>
            <Typography variant="h4" color="primary">$3,597.00</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Search + Export */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          
          <input
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mr: 2, mb: 2 , marginLeft: '50%'}}>
  <Button
    variant="contained"
    color="primary"
    startIcon={<AddIcon />}
    onClick={handleAddPackage}
  >
    Add Subscription Package
  </Button>
</Box>

        <Box>
          <Button
            variant="outlined"
            color="primary"
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
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>SI</TableCell>
            <TableCell>Package Name</TableCell>
            <TableCell>Pricing</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Current Subscriber</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredPackages.map((pkg, index) => (
            <TableRow key={pkg.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{pkg.name}</TableCell>
              <TableCell>{pkg.price}</TableCell>
              <TableCell>{pkg.duration}</TableCell>
              <TableCell>{pkg.subscribers}</TableCell>
              <TableCell>
                <Switch
                  checked={pkg.status}
                  onChange={() => handleToggleStatus(pkg.id)}
                  color="success"
                />
              </TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => handleEditPackage(pkg.id)}>
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {filteredPackages.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">No packages found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default SubscriptionList;

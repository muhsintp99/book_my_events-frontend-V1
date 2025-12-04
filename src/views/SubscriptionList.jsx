import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography,
  Table, TableBody, TableCell, TableHead, TableRow,
  Switch, IconButton, Menu, MenuItem
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { MoreVert } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const SubscriptionList = () => {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  // ===================== FETCH DATA ======================
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/subscription/plan");
      const data = await res.json();

      if (data.success) {
        const mapped = data.plans.map((p) => ({
          id: p._id,
          name: p.name,
          price: `₹${p.price}`,
          duration: `${p.durationInDays} Days`,
          subscribers: p.subscriberCount || 0,
          status: p.isActive,
        }));
        setPackages(mapped);
      }

    } catch (err) {
      console.error("Error:", err);
    }
  };

  // ===================== ACTIONS ======================
  const handleAdd = () => navigate('/settings/sub/add');

  const handleEdit = (id) => {
    navigate(`/settings/sub/add/${id}`); // open AddPackage.jsx in edit mode
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/subscription/plan/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        alert("Plan deleted successfully");
        fetchPackages();
      }
    } catch (err) {
      alert("Error deleting plan");
    }
  };

  const handleToggleStatus = (id) => {
    setPackages(
      packages.map((pkg) =>
        pkg.id === id ? { ...pkg, status: !pkg.status } : pkg
      )
    );
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ===================== EXPORT FUNCTIONS ======================
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
    a.href = url;
    a.download = 'subscriptions.csv';
    a.click();
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      packages.map(pkg => ({
        ID: pkg.id,
        'Package Name': pkg.name,
        Price: pkg.price,
        Duration: pkg.duration,
        Subscribers: pkg.subscribers,
        Status: pkg.status ? 'Active' : 'Inactive'
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscriptions');
    XLSX.writeFile(workbook, 'subscriptions.xlsx');
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: 'white' }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Subscription Package List</Typography>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        {packages[2] && (
          <Card sx={{ width: '30%', backgroundColor: '#e6f3ff', textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h6">{packages[2].name}</Typography>
              <Typography variant="h4">{packages[2].price}</Typography>
            </CardContent>
          </Card>
        )}

        {packages[1] && (
          <Card sx={{ width: '30%', backgroundColor: '#fff3e0', textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h6">{packages[1].name}</Typography>
              <Typography variant="h4">{packages[1].price}</Typography>
            </CardContent>
          </Card>
        )}

        {packages[0] && (
          <Card sx={{ width: '30%', backgroundColor: '#e6f3ff', textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h6">{packages[0].name}</Typography>
              <Typography variant="h4">{packages[0].price}</Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Search + Add + Export */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>

        <input
          type="text"
          placeholder="Search package..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            width: "230px"
          }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Subscription Package
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<MoreVert />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            Export
          </Button>

          <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { exportCSV(); setAnchorEl(null); }}>CSV</MenuItem>
            <MenuItem onClick={() => { exportExcel(); setAnchorEl(null); }}>Excel</MenuItem>
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
            <TableCell>Subscribers</TableCell>
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
                <IconButton color="primary" onClick={() => handleEdit(pkg.id)}>
                  <EditIcon />
                </IconButton>

                <IconButton color="error" onClick={() => handleDelete(pkg.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}

          {filteredPackages.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No packages found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default SubscriptionList;

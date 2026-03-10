import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Typography,
  Table, TableBody, TableCell, TableHead, TableRow,
  Switch, IconButton, Menu, MenuItem
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { MoreVert } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../utils/apiImageUtils';

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
      const res = await fetch(`${API_BASE_URL}/subscription/plan`);
      const data = await res.json();

      if (data.success) {
        const mapped = data.plans.map(p => {
          const mType = p.moduleModel || 'Module';
          let mName = 'Other';

          if (p.moduleId && typeof p.moduleId === 'object') {
            mName = p.moduleId.title || p.moduleId.name || mName;
          } else if (p.moduleId) {
            mName = `Module (${String(p.moduleId).slice(-4)})`;
          }

          return {
            id: p._id,
            name: p.name,
            module: mName,
            moduleType: mType,
            price: `₹${p.price}`,
            duration: `${p.durationInDays} Days`,
            subscribers: p.subscriberCount || 0,
            status: p.isActive,
          };
        });

        setPackages(mapped);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // ===================== GROUP BY TYPE AND MODULE ======================
  const groupedData = useMemo(() => {
    const groups = {
      main: {},
      secondary: {}
    };

    packages.forEach(pkg => {
      const type = pkg.moduleType === 'SecondaryModule' ? 'secondary' : 'main';
      if (!groups[type][pkg.module]) groups[type][pkg.module] = [];
      groups[type][pkg.module].push(pkg);
    });

    return groups;
  }, [packages]);

  // ===================== ACTIONS ======================
  const handleAdd = () => navigate('/settings/sub/add');
  const handleEdit = (id) => navigate(`/settings/sub/add/${id}`);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/subscription/plan/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) fetchPackages();
    } catch {
      alert("Error deleting plan");
    }
  };

  const handleToggleStatus = (id) => {
    setPackages(prev =>
      prev.map(p => p.id === id ? { ...p, status: !p.status } : p)
    );
  };

  // ===================== FILTER ======================
  const filteredGroups = useMemo(() => {
    const result = { main: {}, secondary: {} };

    ['main', 'secondary'].forEach(type => {
      Object.entries(groupedData[type]).forEach(([module, list]) => {
        const filtered = list.filter(pkg =>
          pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length) result[type][module] = filtered;
      });
    });

    return result;
  }, [groupedData, searchQuery]);

  // ===================== EXPORT ======================
  const exportCSV = () => {
    const rows = [
      ['Module', 'Package Name', 'Price', 'Duration', 'Subscribers', 'Status'],
      ...packages.map(p => [
        p.module,
        p.name,
        p.price,
        p.duration,
        p.subscribers,
        p.status ? 'Active' : 'Inactive'
      ])
    ];

    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'subscriptions.csv';
    a.click();
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(packages);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subscriptions');
    XLSX.writeFile(wb, 'subscriptions.xlsx');
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: 'white' }}>
      <Typography variant="h6" mb={3}>Subscription Package List</Typography>

      {/* Search + Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <input
          placeholder="Search package..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: 8, width: 230 }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Add Subscription Package
          </Button>

          <Button variant="outlined" startIcon={<MoreVert />} onClick={(e) => setAnchorEl(e.currentTarget)}>
            Export
          </Button>

          <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { exportCSV(); setAnchorEl(null); }}>CSV</MenuItem>
            <MenuItem onClick={() => { exportExcel(); setAnchorEl(null); }}>Excel</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* MAIN MODULE SECTIONS */}
      {Object.keys(filteredGroups.main).length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2', borderBottom: '2px solid #1976d2', pb: 1, display: 'inline-block' }}>
            Main Module Packages
          </Typography>
          {Object.entries(filteredGroups.main).map(([module, plans]) => (
            <Box key={module} sx={{ mb: 5, pl: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#555' }}>
                {module}
              </Typography>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SI</TableCell>
                    <TableCell>Module</TableCell>
                    <TableCell>Package Name</TableCell>
                    <TableCell>Pricing</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Subscribers</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {plans.map((pkg, i) => (
                    <TableRow key={pkg.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{pkg.module}</TableCell>
                      <TableCell>{pkg.name}</TableCell>
                      <TableCell>{pkg.price}</TableCell>
                      <TableCell>{pkg.duration}</TableCell>
                      <TableCell>{pkg.subscribers}</TableCell>
                      <TableCell>
                        <Switch
                          checked={pkg.status}
                          onChange={() => handleToggleStatus(pkg.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(pkg.id)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDelete(pkg.id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ))}
        </Box>
      )}

      {/* SECONDARY MODULE SECTIONS */}
      {Object.keys(filteredGroups.secondary).length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#9c27b0', borderBottom: '2px solid #9c27b0', pb: 1, display: 'inline-block' }}>
            Secondary Module Packages
          </Typography>
          {Object.entries(filteredGroups.secondary).map(([module, plans]) => (
            <Box key={module} sx={{ mb: 5, pl: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#555' }}>
                {module}
              </Typography>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SI</TableCell>
                    <TableCell>Module</TableCell>
                    <TableCell>Package Name</TableCell>
                    <TableCell>Pricing</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Subscribers</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {plans.map((pkg, i) => (
                    <TableRow key={pkg.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{pkg.module}</TableCell>
                      <TableCell>{pkg.name}</TableCell>
                      <TableCell>{pkg.price}</TableCell>
                      <TableCell>{pkg.duration}</TableCell>
                      <TableCell>{pkg.subscribers}</TableCell>
                      <TableCell>
                        <Switch
                          checked={pkg.status}
                          onChange={() => handleToggleStatus(pkg.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(pkg.id)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDelete(pkg.id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ))}
        </Box>
      )}

      {Object.keys(filteredGroups.main).length === 0 && Object.keys(filteredGroups.secondary).length === 0 && (
        <Typography align="center">No packages found</Typography>
      )}
    </Box>
  );
};

export default SubscriptionList;

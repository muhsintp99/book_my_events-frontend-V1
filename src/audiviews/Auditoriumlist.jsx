import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  Switch,
  IconButton,
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Button,
  Menu,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  FormControlLabel,
  Checkbox,
  InputLabel,
  FormControl,
  Select,
  Tabs,
  Tab,
  Autocomplete
} from '@mui/material';
import {
  Delete, Download, Edit, Visibility, LocationOn, Phone, Email,
  People, Chair, DirectionsCar, Restaurant, Liquor, AccessTime,
  AttachMoney, Category, Save, Close, Wifi, Lightbulb, AcUnit,
  Security, Accessible, Tag, Help, Web
} from '@mui/icons-material';

const VenuesList = () => {
  /* ────────────────────────────────────── STATE ────────────────────────────────────── */
  const [venues, setVenues] = useState([]);
  const [allVenues, setAllVenues] = useState([]);
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [zones, setZones] = useState([]);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.bookmyevent.ae/api';
  const API_URL = `${API_BASE_URL}/venues`;

  /* ────────────────────────────────────── HELPERS ────────────────────────────────────── */
  const getToken = () => {
    try { return localStorage.getItem('token') || sessionStorage.getItem('token'); }
    catch { return null; }
  };

  const getFetchOptions = (method = 'GET', body = null) => {
    const token = getToken();
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      mode: 'cors'
    };
    if (token) opts.headers.Authorization = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);
    return opts;
  };

  const makeAPICall = async (url, options, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) {
          const txt = await res.text();
          if (res.status === 401) throw new Error('Authentication required');
          if (res.status === 403) throw new Error('Access forbidden');
          if (res.status === 404) throw new Error('Not found');
          if (res.status >= 500) throw new Error('Server error');
          throw new Error(`HTTP ${res.status}: ${txt}`);
        }
        return await res.json();
      } catch (e) {
        if (i === retries) throw e;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  };

  /* ────────────────────────────────────── FETCH ZONES ────────────────────────────────────── */
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const data = await makeAPICall(`${API_BASE_URL}/zones`, getFetchOptions());
        if (data?.data && Array.isArray(data.data)) setZones(data.data);
      } catch (e) {
        setNotification({ open: true, message: `Zones: ${e.message}`, severity: 'error' });
      }
    };
    fetchZones();
  }, [API_BASE_URL]);

  /* ────────────────────────────────────── FETCH VENUES ────────────────────────────────────── */
  const mapVenue = (v, idx) => {
    const zoneName = v.zone?.name || (typeof v.zone === 'string' ? zones.find(z => z._id === v.zone)?.name : '') || '';
    const zoneId = v.zone?._id || v.zone || '';

    let price = 'N/A';
    if (v.pricingSchedule) {
      const days = Object.keys(v.pricingSchedule);
      const day = days.find(d => v.pricingSchedule[d]?.morning?.perDay || v.pricingSchedule[d]?.evening?.perDay);
      if (day) price = v.pricingSchedule[day].morning?.perDay || v.pricingSchedule[day].evening?.perDay || 'N/A';
    }

    return {
      id: idx + 1,
      _id: v._id,
      venueName: v.venueName || 'Unknown',
      venueAddress: v.venueAddress || 'N/A',
      venueState: v.venueState || 'N/A',
      venuePostalCode: v.venuePostalCode || 'N/A',
      venueCountry: v.venueCountry || 'N/A',
      contactPersonName: v.ownerManagerName || 'N/A',
      contactPersonPhone: v.ownerManagerPhone || v.contactPhone || 'N/A',
      contactPersonEmail: v.ownerManagerEmail || v.contactEmail || 'N/A',
      totalCapacity: (v.maxGuestsSeated || 0) + (v.maxGuestsStanding || 0),
      zone: zoneName,
      zoneId,
      isTopPick: v.isTopPick || false,
      status: v.isActive || false,
      maxGuestsSeated: v.maxGuestsSeated || 'N/A',
      maxGuestsStanding: v.maxGuestsStanding || 'N/A',
      parkingCapacity: v.parkingCapacity || 'N/A',
      cateringAvailable: v.foodCateringAvailability || false,
      alcoholPermitted: v.alcoholPermitted || false,
      venueType: v.categories?.[0]?.title || 'N/A',
      pricePerDay: price,
      availableFrom: v.openingHours || 'N/A',
      availableTo: v.closingHours || 'N/A',
      rawVenue: v
    };
  };

  const fetchVenues = async (topPicks = false) => {
    try {
      setLoading(true);
      const url = topPicks ? `${API_URL}/top-picks` : API_URL;
      const data = await makeAPICall(url, getFetchOptions());
      if (data?.data && Array.isArray(data.data)) {
        const mapped = data.data.map((v, i) => mapVenue(v, i));
        setAllVenues(mapped);
        setVenues(mapped);
      }
    } catch (e) {
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (zones.length) fetchVenues(); }, [zones]);

  const fetchByZone = async (zoneId) => {
    try {
      setLoading(true);
      const data = await makeAPICall(`${API_URL}?zone=${zoneId}`, getFetchOptions());
      if (data?.data) setVenues(data.data.map((v, i) => mapVenue(v, i)));
    } catch (e) {
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

const handleZoneChange = (e) => {
  const val = e.target.value;
  setSelectedZone(val);

  if (val === "All Zones") {
    setVenues(allVenues);
    return;
  }

  const selectedZoneObj = zones.find((z) => z.name === val);
  if (!selectedZoneObj) return;

  // ✅ Compare IDs as strings to handle ObjectId / string mismatch
  const filtered = allVenues.filter(
    (v) => String(v.zoneId) === String(selectedZoneObj._id)
  );

  setVenues(filtered);
};



  /* ────────────────────────────────────── TOGGLES ────────────────────────────────────── */
const handleTopPickToggle = useCallback(async (id) => {
  const key = `${id}-topPick`;
  if (toggleLoading[key]) return;

  const v = venues.find((x) => x._id === id);
  if (!v) return;

  const newVal = !v.isTopPick;

  setToggleLoading((p) => ({ ...p, [key]: true }));
  setVenues((p) => p.map((x) => (x._id === id ? { ...x, isTopPick: newVal } : x)));
  setAllVenues((p) => p.map((x) => (x._id === id ? { ...x, isTopPick: newVal } : x)));

  try {
    const data = await makeAPICall(
      `${API_URL}/${id}/toggle-top-pick`,
      getFetchOptions("PATCH", { isTopPick: newVal })
    );

    setNotification({
      open: true,
      message: newVal ? "Top Pick activated" : "Top Pick deactivated", // ✅ updated message
      severity: "success",
    });
  } catch (e) {
    setVenues((p) => p.map((x) => (x._id === id ? { ...x, isTopPick: !newVal } : x)));
    setAllVenues((p) => p.map((x) => (x._id === id ? { ...x, isTopPick: !newVal } : x)));
    setNotification({ open: true, message: e.message, severity: "error" });
  } finally {
    setToggleLoading((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
  }
}, [venues, toggleLoading]);



  const handleStatusToggle = useCallback(async (id) => {
  const key = `${id}-status`;
  if (toggleLoading[key]) return;

  const v = venues.find((x) => x._id === id);
  if (!v) return;

  const newVal = !v.status;

  setToggleLoading((p) => ({ ...p, [key]: true }));
  setVenues((p) => p.map((x) => (x._id === id ? { ...x, status: newVal } : x)));
  setAllVenues((p) => p.map((x) => (x._id === id ? { ...x, status: newVal } : x)));

  try {
    const data = await makeAPICall(
      `${API_URL}/${id}/toggle-active`,
      getFetchOptions("PATCH")
    );

    setNotification({
      open: true,
      message: newVal ? "Venue activated" : "Venue deactivated", // ✅ updated message
      severity: "success",
    });
  } catch (e) {
    setVenues((p) => p.map((x) => (x._id === id ? { ...x, status: !newVal } : x)));
    setAllVenues((p) => p.map((x) => (x._id === id ? { ...x, status: !newVal } : x)));
    setNotification({ open: true, message: e.message, severity: "error" });
  } finally {
    setToggleLoading((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
  }
}, [venues, toggleLoading]);

  /* ────────────────────────────────────── DELETE ────────────────────────────────────── */
  const handleDeleteClick = v => { setVenueToDelete(v); setOpenDeleteDialog(true); };
  const handleDeleteConfirm = async () => {
    try {
      await makeAPICall(`${API_URL}/${venueToDelete._id}`, getFetchOptions('DELETE'));
      setVenues(p => p.filter(x => x._id !== venueToDelete._id));
      setAllVenues(p => p.filter(x => x._id !== venueToDelete._id));
      setNotification({ open: true, message: 'Deleted', severity: 'success' });
    } catch (e) {
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setOpenDeleteDialog(false); setVenueToDelete(null);
    }
  };

  /* ────────────────────────────────────── EXPORT ────────────────────────────────────── */
  const [anchorEl, setAnchorEl] = useState(null);
  const exportToCSV = () => {
    const headers = ['Sl', 'Venue Name', 'Address', 'Contact', 'Phone', 'Seated', 'Standing', 'Total', 'Type', 'Price/Day', 'Top Pick', 'Status'];
    const rows = filteredVenues.map(v => [
      v.id, `"${v.venueName}"`, `"${v.venueAddress}"`, `"${v.contactPersonName}"`, v.contactPersonPhone,
      v.maxGuestsSeated, v.maxGuestsStanding, v.totalCapacity, v.venueType, v.pricePerDay,
      v.isTopPick ? 'Yes' : 'No', v.status ? 'Active' : 'Inactive'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    download(csv, 'text/csv', 'venues.csv');
    setAnchorEl(null);
  };
  const exportToExcel = () => {
    let html = `<table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    filteredVenues.forEach(v => {
      html += `<tr><td>${v.id}</td><td>${v.venueName}</td><td>${v.venueAddress}</td><td>${v.contactPersonName}</td><td>${v.contactPersonPhone}</td><td>${v.maxGuestsSeated}</td><td>${v.maxGuestsStanding}</td><td>${v.totalCapacity}</td><td>${v.venueType}</td><td>${v.pricePerDay}</td><td>${v.isTopPick ? 'Yes' : 'No'}</td><td>${v.status ? 'Active' : 'Inactive'}</td></tr>`;
    });
    html += `</table>`;
    download(html, 'application/vnd.ms-excel', 'venues.xls');
    setAnchorEl(null);
  };
  const download = (content, type, name) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };
  const filteredVenues = venues.filter(v =>
    v.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.venueAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ────────────────────────────────────── VIEW ────────────────────────────────────── */
  const handleView = v => { setSelectedVenue(v.rawVenue); setOpenViewDialog(true); };

  /* ────────────────────────────────────── EDIT ────────────────────────────────────── */
  const handleEdit = v => {
    const r = v.rawVenue;
    setEditingVenue(v);
    setEditFormData({
      venueName: r.venueName || '',
      shortDescription: r.shortDescription || '',
      venueAddress: r.venueAddress || '',
      venueState: r.venueState || '',
      venuePostalCode: r.venuePostalCode || '',
      venueCountry: r.venueCountry || '',
      latitude: r.latitude || '',
      longitude: r.longitude || '',
      language: r.language || 'EN',
      zone: r.zone?._id || r.zone || '',
      contactWebsite: r.contactWebsite || '',
      ownerManagerName: r.ownerManagerName || '',
      ownerManagerPhone: r.ownerManagerPhone || '',
      ownerManagerEmail: r.ownerManagerEmail || '',
      openingHours: r.openingHours || '',
      closingHours: r.closingHours || '',
      maxGuestsSeated: r.maxGuestsSeated || '',
      maxGuestsStanding: r.maxGuestsStanding || '',
      parkingCapacity: r.parkingCapacity || '',
      parkingAvailability: r.parkingAvailability || false,
      wheelchairAccessibility: r.wheelchairAccessibility || false,
      securityArrangements: r.securityArrangements || false,
      foodCateringAvailability: r.foodCateringAvailability || false,
      wifiAvailability: r.wifiAvailability || false,
      stageLightingAudio: r.stageLightingAudio || false,
      acAvailable: r.acAvailable || false,
      nonAcAvailable: r.nonAcAvailable || false,
      acType: r.acType || '',
      washroomsInfo: r.washroomsInfo || '',
      dressingRooms: r.dressingRooms || '',
      dynamicPricing: r.dynamicPricing || false,
      advanceDeposit: r.advanceDeposit || 0,
      cancellationPolicy: r.cancellationPolicy || '',
      extraCharges: r.extraCharges || '',
      discount: r.discount || 0,
      seatingArrangement: r.seatingArrangement || '',
      nearbyTransport: r.nearbyTransport || '',
      accessibilityInfo: r.accessibilityInfo || '',
      searchTags: r.searchTags || [],
      faqs: r.faqs || [],
      pricingSchedule: r.pricingSchedule || {}
    });
    setCurrentTab(0);
    setOpenEditDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      setSaveLoading(true);
      const payload = { ...editFormData };
      const data = await makeAPICall(`${API_URL}/${editingVenue._id}`, getFetchOptions('PUT', payload));
      if (data.success) {
        const updated = mapVenue(data.data, editingVenue.id - 1);
        setVenues(p => p.map(x => x._id === editingVenue._id ? updated : x));
        setAllVenues(p => p.map(x => x._id === editingVenue._id ? updated : x));
        setNotification({ open: true, message: 'Updated', severity: 'success' });
        setOpenEditDialog(false);
      }
    } catch (e) {
      setNotification({ open: true, message: e.message, severity: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePricingChange = (day, sess, field, val) => {
    setEditFormData(p => ({
      ...p,
      pricingSchedule: {
        ...p.pricingSchedule,
        [day]: {
          ...p.pricingSchedule[day],
          [sess]: { ...p.pricingSchedule[day]?.[sess], [field]: val }
        }
      }
    }));
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const sessions = ['morning', 'evening'];

  /* ────────────────────────────────────── RENDER ────────────────────────────────────── */
  return (
    <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      {/* ── Stats ── */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', p: 2, bgcolor: '#f5f5f5', gap: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ bgcolor: '#e3f2fd', p: 1, borderRadius: 1 }}>Total venues: {allVenues.length}</Box>
          <Box sx={{ bgcolor: '#fff3e0', p: 1, borderRadius: 1 }}>Active venues: {allVenues.filter(v => v.status).length}</Box>
          <Box sx={{ bgcolor: '#e0f7fa', p: 1, borderRadius: 1 }}>Inactive venues: {allVenues.filter(v => !v.status).length}</Box>
          <Box sx={{ bgcolor: '#fce4ec', p: 1, borderRadius: 1 }}>Top Pick venues: {allVenues.filter(v => v.isTopPick).length}</Box>
        </Box>
        <Button variant="contained" color="secondary" size="small" onClick={() => fetchVenues(true)} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Top Picks'}
        </Button>
      </Box>

      {/* ── Filters ── */}
      <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, bgcolor: '#f5f5f5' }}>
        <TextField select value={selectedZone} onChange={handleZoneChange} size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
          <MenuItem value="All Zones">All Zones</MenuItem>
          {zones.map(z => <MenuItem key={z._id} value={z.name}>{z.name}</MenuItem>)}
        </TextField>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <TextField placeholder="Search Venue" size="small" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">Search</InputAdornment> }} sx={{ bgcolor: 'white' }} />
          <Button variant="contained" color="primary" size="small" endIcon={<Download />} onClick={e => setAnchorEl(e.currentTarget)}>Export</Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={exportToExcel}>Excel</MenuItem>
            <MenuItem onClick={exportToCSV}>CSV</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* ── Table ── */}
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
          <CircularProgress size={20} /><Typography>Loading venues...</Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ position: 'sticky', top: 0, bgcolor: '#f5f5f5', zIndex: 1 }}>
              <TableRow>
                <TableCell>Sl</TableCell>
                <TableCell>Venue Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Seated</TableCell>
                <TableCell>Standing</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Venue Type</TableCell>
                <TableCell>Price/Day</TableCell>
                <TableCell>Top Pick</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVenues.length === 0 ? (
                <TableRow><TableCell colSpan={13} align="center"><Typography variant="body2" color="textSecondary">No venues found</Typography></TableCell></TableRow>
              ) : (
                filteredVenues.map(v => {
                  const topKey = `${v._id}-topPick`;
                  const statKey = `${v._id}-status`;
                  return (
                    <TableRow key={v._id} hover>
                      <TableCell>{v.id}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{v.venueName}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.venueAddress}</TableCell>
                      <TableCell>{v.contactPersonName}</TableCell>
                      <TableCell>{v.contactPersonPhone}</TableCell>
                      <TableCell>{v.maxGuestsSeated}</TableCell>
                      <TableCell>{v.maxGuestsStanding}</TableCell>
                      <TableCell><strong>{v.totalCapacity}</strong></TableCell>
                      <TableCell><Chip label={v.venueType} size="small" color="primary" variant="outlined" /></TableCell>
                      <TableCell>₹ {v.pricePerDay}</TableCell>
                      <TableCell>
                        <Switch checked={v.isTopPick} onChange={() => handleTopPickToggle(v._id)} disabled={toggleLoading[topKey]} size="small" />
                        {toggleLoading[topKey] && <CircularProgress size={12} sx={{ ml: 1 }} />}
                      </TableCell>
                      <TableCell>
                        <Switch checked={v.status} onChange={() => handleStatusToggle(v._id)} disabled={toggleLoading[statKey]} size="small" />
                        {toggleLoading[statKey] && <CircularProgress size={12} sx={{ ml: 1 }} />}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton size="small" color="info" onClick={() => handleView(v)} title="View"><Visibility fontSize="small" /></IconButton>
                          <IconButton size="small" color="primary" onClick={() => handleEdit(v)} title="Edit"><Edit fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteClick(v)} title="Delete"><Delete fontSize="small" /></IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* ── VIEW DIALOG ── */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6">{selectedVenue?.venueName}</Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedVenue && (
            <Grid container spacing={3}>
              {/* Basic */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom><LocationOn fontSize="small" /> Address</Typography>
                <Typography paragraph>{selectedVenue.venueAddress}, {selectedVenue.venueState}, {selectedVenue.venuePostalCode}, {selectedVenue.venueCountry}</Typography>

                <Typography variant="subtitle2" color="textSecondary" gutterBottom><Category fontSize="small" /> Type</Typography>
                <Typography paragraph>{selectedVenue.categories?.[0]?.title || 'N/A'}</Typography>

                <Typography variant="subtitle2" color="textSecondary" gutterBottom><People fontSize="small" /> Capacity</Typography>
                <Typography>Seated: <strong>{selectedVenue.maxGuestsSeated}</strong> | Standing: <strong>{selectedVenue.maxGuestsStanding}</strong> | Total: <strong>{selectedVenue.maxGuestsSeated + selectedVenue.maxGuestsStanding}</strong></Typography>
              </Grid>

              {/* Contact */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom><Phone fontSize="small" /> Contact</Typography>
                <Typography>{selectedVenue.ownerManagerName}</Typography>
                <Typography>{selectedVenue.ownerManagerPhone}</Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Email fontSize="small" /> {selectedVenue.ownerManagerEmail}</Typography>
                {selectedVenue.contactWebsite && <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Web fontSize="small" /> <a href={selectedVenue.contactWebsite} target="_blank" rel="noopener noreferrer">{selectedVenue.contactWebsite}</a></Typography>}
              </Grid>

              {/* Facilities */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Facilities</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip icon={<Chair />} label={`Parking: ${selectedVenue.parkingCapacity}`} size="small" />
                  {selectedVenue.foodCateringAvailability && <Chip icon={<Restaurant />} label="Catering" color="success" size="small" />}
                  {selectedVenue.alcoholPermitted && <Chip icon={<Liquor />} label="Alcohol" color="success" size="small" />}
                  {selectedVenue.wifiAvailability && <Chip icon={<Wifi />} label="WiFi" size="small" />}
                  {selectedVenue.stageLightingAudio && <Chip icon={<Lightbulb />} label="Stage & Audio" size="small" />}
                  {selectedVenue.acAvailable && <Chip icon={<AcUnit />} label={`AC: ${selectedVenue.acType}`} size="small" />}
                  {selectedVenue.wheelchairAccessibility && <Chip icon={<Accessible />} label="Wheelchair" size="small" />}
                  {selectedVenue.securityArrangements && <Chip icon={<Security />} label="Security" size="small" />}
                  <Chip icon={<AccessTime />} label={`Open: ${selectedVenue.openingHours} - ${selectedVenue.closingHours}`} size="small" />
                  <Chip icon={<AttachMoney />} label={`From: AED ${selectedVenue.pricingSchedule?.monday?.morning?.perDay || 'N/A'}`} color="primary" size="small" />
                </Box>
              </Grid>

              {/* Pricing Table */}
              {selectedVenue.pricingSchedule && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>Pricing Schedule</Typography>
                  <Table size="small">
                    <TableHead><TableRow><TableCell>Day</TableCell><TableCell>Morning</TableCell><TableCell>Per Day</TableCell><TableCell>Evening</TableCell><TableCell>Per Day</TableCell></TableRow></TableHead>
                    <TableBody>
                      {Object.entries(selectedVenue.pricingSchedule).map(([d, s]) => (
                        <TableRow key={d}>
                          <TableCell>{d}</TableCell>
                          <TableCell>{s.morning?.startTime} - {s.morning?.endTime}</TableCell>
                          <TableCell>{s.morning?.perDay || 0}</TableCell>
                          <TableCell>{s.evening?.startTime} - {s.evening?.endTime}</TableCell>
                          <TableCell>{s.evening?.perDay || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
              )}

              {/* Tags & Packages */}
              {selectedVenue.searchTags?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>Tags</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedVenue.searchTags.map(t => <Chip key={t} label={t} size="small" variant="outlined" />)}
                  </Box>
                </Grid>
              )}
              {selectedVenue.packages?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>Packages</Typography>
                  {selectedVenue.packages.map(p => (
                    <Box key={p._id} sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, mb: 1 }}>
                      <Typography variant="subtitle1"><strong>{p.title}</strong> - AED {p.price}</Typography>
                      <Typography variant="body2">{p.subtitle}</Typography>
                    </Box>
                  ))}
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)} variant="outlined">Close</Button>
          <Button onClick={() => { setOpenViewDialog(false); handleEdit({ rawVenue: selectedVenue }); }} variant="contained" startIcon={<Edit />}>Edit</Button>
        </DialogActions>
      </Dialog>

      {/* ── EDIT DIALOG ── */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Edit Venue: {editingVenue?.venueName}</Typography>
          <IconButton size="small" onClick={() => setOpenEditDialog(false)} sx={{ color: 'white' }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Basic" />
            <Tab label="Location" />
            <Tab label="Capacity" />
            <Tab label="Facilities" />
            <Tab label="Pricing" />
            <Tab label="Other" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* BASIC */}
            {currentTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label="Venue Name" value={editFormData.venueName || ''} onChange={e => setEditFormData(p => ({ ...p, venueName: e.target.value }))} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Short Description" multiline rows={2} value={editFormData.shortDescription || ''} onChange={e => setEditFormData(p => ({ ...p, shortDescription: e.target.value }))} /></Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth><InputLabel>Zone</InputLabel>
                    <Select value={editFormData.zone || ''} onChange={e => setEditFormData(p => ({ ...p, zone: e.target.value }))}>
                      {zones.map(z => <MenuItem key={z._id} value={z._id}>{z.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}><TextField fullWidth label="Website" value={editFormData.contactWebsite || ''} onChange={e => setEditFormData(p => ({ ...p, contactWebsite: e.target.value }))} /></Grid>
              </Grid>
            )}

            {/* LOCATION */}
            {currentTab === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label="Address" multiline rows={2} value={editFormData.venueAddress || ''} onChange={e => setEditFormData(p => ({ ...p, venueAddress: e.target.value }))} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth label="State" value={editFormData.venueState || ''} onChange={e => setEditFormData(p => ({ ...p, venueState: e.target.value }))} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth label="Postal Code" value={editFormData.venuePostalCode || ''} onChange={e => setEditFormData(p => ({ ...p, venuePostalCode: e.target.value }))} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth label="Country" value={editFormData.venueCountry || ''} onChange={e => setEditFormData(p => ({ ...p, venueCountry: e.target.value }))} /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth label="Latitude" type="number" value={editFormData.latitude || ''} onChange={e => setEditFormData(p => ({ ...p, latitude: e.target.value }))} /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth label="Longitude" type="number" value={editFormData.longitude || ''} onChange={e => setEditFormData(p => ({ ...p, longitude: e.target.value }))} /></Grid>
              </Grid>
            )}

            {/* CAPACITY */}
            {currentTab === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}><TextField fullWidth label="Seated" type="number" value={editFormData.maxGuestsSeated || ''} onChange={e => setEditFormData(p => ({ ...p, maxGuestsSeated: e.target.value }))} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth label="Standing" type="number" value={editFormData.maxGuestsStanding || ''} onChange={e => setEditFormData(p => ({ ...p, maxGuestsStanding: e.target.value }))} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth label="Parking" value={editFormData.parkingCapacity || ''} onChange={e => setEditFormData(p => ({ ...p, parkingCapacity: e.target.value }))} /></Grid>
              </Grid>
            )}

            {/* FACILITIES */}
            {currentTab === 3 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}><FormControlLabel control={<Checkbox checked={editFormData.parkingAvailability || false} onChange={e => setEditFormData(p => ({ ...p, parkingAvailability: e.target.checked }))} />} label="Parking" /></Grid>
                <Grid item xs={12} md={6}><FormControlLabel control={<Checkbox checked={editFormData.wifiAvailability || false} onChange={e => setEditFormData(p => ({ ...p, wifiAvailability: e.target.checked }))} />} label="WiFi" /></Grid>
                <Grid item xs={12} md={6}><FormControlLabel control={<Checkbox checked={editFormData.stageLightingAudio || false} onChange={e => setEditFormData(p => ({ ...p, stageLightingAudio: e.target.checked }))} />} label="Stage & Audio" /></Grid>
                <Grid item xs={12} md={6}><FormControlLabel control={<Checkbox checked={editFormData.foodCateringAvailability || false} onChange={e => setEditFormData(p => ({ ...p, foodCateringAvailability: e.target.checked }))} />} label="Catering" /></Grid>
                <Grid item xs={12} md={6}><FormControlLabel control={<Checkbox checked={editFormData.acAvailable || false} onChange={e => setEditFormData(p => ({ ...p, acAvailable: e.target.checked }))} />} label="AC" /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth label="AC Type" value={editFormData.acType || ''} onChange={e => setEditFormData(p => ({ ...p, acType: e.target.value }))} /></Grid>
              </Grid>
            )}

            {/* PRICING */}
            {currentTab === 4 && (
              <Box>
                {days.map(d => (
                  <Box key={d} sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, mb: 2 }}>
                    <Typography variant="subtitle2">{d.charAt(0).toUpperCase() + d.slice(1)}</Typography>
                    {sessions.map(s => (
                      <Grid container spacing={1} key={s} sx={{ mt: 1 }}>
                        <Grid item xs={3}><TextField label={`${s} Start`} size="small" value={editFormData.pricingSchedule?.[d]?.[s]?.startTime || ''} onChange={e => handlePricingChange(d, s, 'startTime', e.target.value)} /></Grid>
                        <Grid item xs={3}><TextField label="End" size="small" value={editFormData.pricingSchedule?.[d]?.[s]?.endTime || ''} onChange={e => handlePricingChange(d, s, 'endTime', e.target.value)} /></Grid>
                        <Grid item xs={3}><TextField label="Per Day" type="number" size="small" value={editFormData.pricingSchedule?.[d]?.[s]?.perDay || ''} onChange={e => handlePricingChange(d, s, 'perDay', e.target.value)} /></Grid>
                      </Grid>
                    ))}
                  </Box>
                ))}
              </Box>
            )}

            {/* OTHER */}
            {currentTab === 5 && (
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label="Seating Arrangement" value={editFormData.seatingArrangement || ''} onChange={e => setEditFormData(p => ({ ...p, seatingArrangement: e.target.value }))} /></Grid>
                <Grid item xs={12}>
                  <Autocomplete multiple freeSolo options={[]} value={editFormData.searchTags || []}
                    onChange={(e, v) => setEditFormData(p => ({ ...p, searchTags: v }))}
                    renderTags={(v, p) => v.map((o, i) => <Chip key={i} label={o} {...p(i)} />)}
                    renderInput={p => <TextField {...p} label="Search Tags" />} />
                </Grid>
                <Grid item xs={12}><TextField fullWidth label="Cancellation Policy" value={editFormData.cancellationPolicy || ''} onChange={e => setEditFormData(p => ({ ...p, cancellationPolicy: e.target.value }))} /></Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setOpenEditDialog(false)} variant="outlined" disabled={saveLoading}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" startIcon={saveLoading ? <CircularProgress size={16} /> : <Save />} disabled={saveLoading}>
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DELETE DIALOG ── */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle><Typography variant="h6" color="error">Confirm Delete</Typography></DialogTitle>
        <DialogContent><DialogContentText>Delete "<strong>{venueToDelete?.venueName}</strong>"? This cannot be undone.</DialogContentText></DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined" color="primary">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* ── SNACKBAR ── */}
     {/* ── SNACKBAR ── */}
<Snackbar
  open={notification.open}
  autoHideDuration={4000}
  onClose={() => setNotification((p) => ({ ...p, open: false }))}
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // ✅ position fixed here
>
  <Alert
    onClose={() => setNotification((p) => ({ ...p, open: false }))}
    severity={notification.severity}
    variant="filled"
    sx={{ width: '100%' }}
  >
    {notification.message}
  </Alert>
</Snackbar>

    </TableContainer>
  );
};

export default VenuesList;
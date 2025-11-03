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
  CircularProgress
} from '@mui/material';
import { VisibilityOutlined, Edit, Delete, Download } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const CateringList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [venues, setVenues] = useState([]);
  const [allVenues, setAllVenues] = useState([]);
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [zones, setZones] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.bookmyevent.ae/api';
  const API_URL = `${API_BASE_URL}/venues`;

  const getToken = () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return token;
    } catch (error) {
      console.warn('Error accessing storage for token:', error);
      return null;
    }
  };

  const getFetchOptions = (method = 'GET', body = null) => {
    const token = getToken();
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    return options;
  };

  const makeAPICall = async (url, options, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error Response:', errorText);

          if (response.status === 401) {
            throw new Error('Authentication required - please login again');
          } else if (response.status === 403) {
            throw new Error('Access forbidden - insufficient permissions');
          } else if (response.status === 404) {
            throw new Error('Resource not found');
          } else if (response.status >= 500) {
            throw new Error('Server error - please try again later');
          } else {
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`❌ API Call Failed (attempt ${attempt + 1}):`, {
          message: error.message,
          url,
          stack: error.stack
        });

        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        if (error.name === 'AbortError') {
          throw new Error('Request timed out - please check your connection');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Network error - please check if the server is running and CORS is properly configured');
        }

        throw error;
      }
    }
  };

  // Fetch zones first
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const url = `${API_BASE_URL}/zones`;
        const options = getFetchOptions();
        const data = await makeAPICall(url, options);
        
        if (data && data.data && Array.isArray(data.data)) {
          setZones(data.data);
          console.log('✅ Zones fetched successfully:', data.data.length);
        } else {
          throw new Error('Invalid zones data format');
        }
      } catch (error) {
        console.error('❌ Error fetching zones:', error);
        setZones([]);
        setNotification({
          open: true,
          message: `Error fetching zones: ${error.message}`,
          severity: 'error'
        });
      }
    };
    fetchZones();
  }, [API_BASE_URL]);

  const fetchVenues = async (fetchTopPicks = false) => {
    try {
      setLoading(true);
      const url = fetchTopPicks ? `${API_URL}/top-picks` : API_URL;
      const options = getFetchOptions();
      const data = await makeAPICall(url, options);

      if (data && Array.isArray(data.data)) {
        const mappedVenues = data.data.map((venue, index) => {
          let zoneName = '';
          let zoneId = '';
          
          // Handle zone field gracefully
          if (venue.zone && typeof venue.zone === 'object' && venue.zone._id) {
            zoneName = venue.zone.name || '';
            zoneId = venue.zone._id.toString();
          } else if (venue.zone && typeof venue.zone === 'string') {
            zoneId = venue.zone;
            const matchedZone = zones.find((z) => z._id === zoneId);
            zoneName = matchedZone ? matchedZone.name : '';
          }

          // Determine price per day from pricingSchedule
          let pricePerDay = 'N/A';
          if (venue.pricingSchedule && typeof venue.pricingSchedule === 'object') {
            const days = Object.keys(venue.pricingSchedule);
            const firstValidDay = days.find(day => 
              venue.pricingSchedule[day]?.morning?.perDay || venue.pricingSchedule[day]?.evening?.perDay
            );
            if (firstValidDay) {
              pricePerDay = venue.pricingSchedule[firstValidDay].morning?.perDay || 
                           venue.pricingSchedule[firstValidDay].evening?.perDay || 'N/A';
            }
          }

          return {
            id: index + 1,
            _id: venue._id,
            venueName: venue.venueName || 'Unknown Venue',
            venueAddress: venue.venueAddress || 'N/A',
            venueCity: venue.venueCity || 'N/A',
            venueState: venue.venueState || 'N/A',
            venuePostalCode: venue.venuePostalCode || 'N/A',
            venueCountry: venue.venueCountry || 'N/A',
            contactPersonName: venue.ownerManagerName || 'N/A',
            contactPersonPhone: venue.ownerManagerPhone || venue.contactPhone || 'N/A',
            contactPersonEmail: venue.ownerManagerEmail || venue.contactEmail || 'N/A',
            totalCapacity: (venue.maxGuestsSeated || 0) + (venue.maxGuestsStanding || 0),
            zone: zoneName,
            zoneId: zoneId,
            isTopPick: venue.isTopPick || false,
            status: venue.isActive || false,
            maxGuestsSeated: venue.maxGuestsSeated || 'N/A',
            maxGuestsStanding: venue.maxGuestsStanding || 'N/A',
            amenities: venue.amenities || [],
            parkingCapacity: venue.parkingCapacity || 'N/A',
            cateringAvailable: venue.foodCateringAvailability || false,
            alcoholPermitted: venue.alcoholPermitted || false,
            venueType: venue.categories?.[0]?.title || 'N/A',
            pricePerDay: pricePerDay,
            availableFrom: venue.openingHours ? venue.openingHours : 'N/A',
            availableTo: venue.closingHours ? venue.closingHours : 'N/A'
          };
        });
        setAllVenues(mappedVenues);
        setVenues(mappedVenues);
        console.log('✅ Venues fetched successfully:', mappedVenues.length);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('❌ Error fetching venues:', error);
      setNotification({
        open: true,
        message: `Error fetching venues: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVenuesByZone = async (zoneId) => {
    try {
      setLoading(true);
      const url = `${API_URL}?zone=${zoneId}`;
      const options = getFetchOptions();
      const data = await makeAPICall(url, options);

      if (data && Array.isArray(data.data)) {
        const mappedVenues = data.data.map((venue, index) => {
          let zoneName = '';
          let zoneIdStr = '';
          
          if (venue.zone && typeof venue.zone === 'object' && venue.zone._id) {
            zoneName = venue.zone.name || '';
            zoneIdStr = venue.zone._id.toString();
          } else if (venue.zone && typeof venue.zone === 'string') {
            zoneIdStr = venue.zone;
            const matchedZone = zones.find((z) => z._id === zoneIdStr);
            zoneName = matchedZone ? matchedZone.name : '';
          }

          // Determine price per day from pricingSchedule
          let pricePerDay = 'N/A';
          if (venue.pricingSchedule && typeof venue.pricingSchedule === 'object') {
            const days = Object.keys(venue.pricingSchedule);
            const firstValidDay = days.find(day => 
              venue.pricingSchedule[day]?.morning?.perDay || venue.pricingSchedule[day]?.evening?.perDay
            );
            if (firstValidDay) {
              pricePerDay = venue.pricingSchedule[firstValidDay].morning?.perDay || 
                           venue.pricingSchedule[firstValidDay].evening?.perDay || 'N/A';
            }
          }

          return {
            id: index + 1,
            _id: venue._id,
            venueName: venue.venueName || 'Unknown Venue',
            venueAddress: venue.venueAddress || 'N/A',
            venueCity: venue.venueCity || 'N/A',
            venueState: venue.venueState || 'N/A',
            venuePostalCode: venue.venuePostalCode || 'N/A',
            venueCountry: venue.venueCountry || 'N/A',
            contactPersonName: venue.ownerManagerName || 'N/A',
            contactPersonPhone: venue.ownerManagerPhone || venue.contactPhone || 'N/A',
            contactPersonEmail: venue.ownerManagerEmail || venue.contactEmail || 'N/A',
            totalCapacity: (venue.maxGuestsSeated || 0) + (venue.maxGuestsStanding || 0),
            zone: zoneName,
            zoneId: zoneIdStr,
            isTopPick: venue.isTopPick || false,
            status: venue.isActive || false,
            maxGuestsSeated: venue.maxGuestsSeated || 'N/A',
            maxGuestsStanding: venue.maxGuestsStanding || 'N/A',
            amenities: venue.amenities || [],
            parkingCapacity: venue.parkingCapacity || 'N/A',
            cateringAvailable: venue.foodCateringAvailability || false,
            alcoholPermitted: venue.alcoholPermitted || false,
            venueType: venue.categories?.[0]?.title || 'N/A',
            pricePerDay: pricePerDay,
            availableFrom: venue.openingHours ? venue.openingHours : 'N/A',
            availableTo: venue.closingHours ? venue.closingHours : 'N/A'
          };
        });
        setVenues(mappedVenues);
        console.log(`✅ Venues for zone ${zoneId} fetched:`, mappedVenues.length);
      }
    } catch (error) {
      console.error('❌ Error fetching venues by zone:', error);
      setNotification({
        open: true,
        message: `Error fetching venues for selected zone: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (zones.length > 0) {
      fetchVenues();
    }
  }, [zones]);

  const handleZoneChange = (e) => {
    const zoneName = e.target.value;
    setSelectedZone(zoneName);
    
    if (zoneName === 'All Zones') {
      setVenues(allVenues);
    } else {
      const zone = zones.find((z) => z.name === zoneName);
      if (zone) {
        fetchVenuesByZone(zone._id);
      }
    }
  };

  useEffect(() => {
    if (location.state?.updatedVenue) {
      const updatedVenue = location.state.updatedVenue;
      
      const updateVenueInList = (venueList) => {
        return venueList.map((venue) => {
          if (venue._id === updatedVenue._id) {
            let zoneName = venue.zone;
            let zoneId = venue.zoneId;
            
            if (updatedVenue.zone && typeof updatedVenue.zone === 'object' && updatedVenue.zone._id) {
              zoneName = updatedVenue.zone.name || zoneName;
              zoneId = updatedVenue.zone._id.toString();
            } else if (updatedVenue.zone && typeof updatedVenue.zone === 'string') {
              zoneId = updatedVenue.zone;
              const matchedZone = zones.find((z) => z._id === zoneId);
              zoneName = matchedZone ? matchedZone.name : zoneName;
            }

            // Determine price per day from pricingSchedule
            let pricePerDay = venue.pricePerDay;
            if (updatedVenue.pricingSchedule && typeof updatedVenue.pricingSchedule === 'object') {
              const days = Object.keys(updatedVenue.pricingSchedule);
              const firstValidDay = days.find(day => 
                updatedVenue.pricingSchedule[day]?.morning?.perDay || updatedVenue.pricingSchedule[day]?.evening?.perDay
              );
              if (firstValidDay) {
                pricePerDay = updatedVenue.pricingSchedule[firstValidDay].morning?.perDay || 
                             updatedVenue.pricingSchedule[firstValidDay].evening?.perDay || 'N/A';
              }
            }

            return {
              ...venue,
              ...updatedVenue,
              venueName: updatedVenue.venueName || venue.venueName,
              venueAddress: updatedVenue.venueAddress || venue.venueAddress,
              venueCity: updatedVenue.venueCity || venue.venueCity,
              venueState: updatedVenue.venueState || venue.venueState,
              venuePostalCode: updatedVenue.venuePostalCode || venue.venuePostalCode,
              venueCountry: updatedVenue.venueCountry || venue.venueCountry,
              contactPersonName: updatedVenue.ownerManagerName || venue.contactPersonName,
              contactPersonPhone: updatedVenue.ownerManagerPhone || updatedVenue.contactPhone || venue.contactPersonPhone,
              contactPersonEmail: updatedVenue.ownerManagerEmail || updatedVenue.contactEmail || venue.contactPersonEmail,
              totalCapacity: (updatedVenue.maxGuestsSeated || 0) + (updatedVenue.maxGuestsStanding || 0),
              zone: zoneName,
              zoneId: zoneId,
              isTopPick: updatedVenue.isTopPick ?? venue.isTopPick,
              status: updatedVenue.isActive ?? venue.status,
              amenities: updatedVenue.amenities || venue.amenities,
              parkingCapacity: updatedVenue.parkingCapacity || venue.parkingCapacity,
              cateringAvailable: updatedVenue.foodCateringAvailability ?? venue.cateringAvailable,
              alcoholPermitted: updatedVenue.alcoholPermitted ?? venue.alcoholPermitted,
              venueType: updatedVenue.categories?.[0]?.title || venue.venueType,
              pricePerDay: pricePerDay,
              availableFrom: updatedVenue.openingHours ? updatedVenue.openingHours : venue.availableFrom,
              availableTo: updatedVenue.closingHours ? updatedVenue.closingHours : venue.availableTo
            };
          }
          return venue;
        });
      };
      
      setVenues((prev) => updateVenueInList(prev));
      setAllVenues((prev) => updateVenueInList(prev));
      
      setNotification({
        open: true,
        message: 'Venue updated successfully!',
        severity: 'success'
      });
    }
  }, [location.state, zones]);

  const handleTopPickToggle = useCallback(
    async (_id) => {
      const toggleKey = `${_id}-topPick`;
      if (toggleLoading[toggleKey]) return;

      const venue = venues.find((v) => v._id === _id);
      if (!venue) {
        setNotification({
          open: true,
          message: 'Venue not found',
          severity: 'error'
        });
        return;
      }

      const newValue = !venue.isTopPick;
      setToggleLoading((prev) => ({ ...prev, [toggleKey]: true }));
      
      const updateVenue = (v) => (v._id === _id ? { ...v, isTopPick: newValue } : v);
      setVenues((prev) => prev.map(updateVenue));
      setAllVenues((prev) => prev.map(updateVenue));

      try {
        const endpoint = `${API_URL}/${_id}/toggle-top-pick`;
        const options = getFetchOptions('PATCH');
        const data = await makeAPICall(endpoint, options);

        if (!data.success) throw new Error(data.message || 'Update failed');

        const finalUpdate = (v) => 
          v._id === _id ? { ...v, isTopPick: data.data.isTopPick ?? v.isTopPick } : v;
        
        setVenues((prev) => prev.map(finalUpdate));
        setAllVenues((prev) => prev.map(finalUpdate));

        const statusMessage = data.data.isTopPick 
          ? 'Top pick activated successfully' 
          : 'Top pick deactivated successfully';

        setNotification({
          open: true,
          message: statusMessage,
          severity: data.data.isTopPick ? 'success' : 'info'
        });
      } catch (error) {
        console.error('❌ Top Pick toggle error:', error);
        
        const revertUpdate = (v) => (v._id === _id ? { ...v, isTopPick: !newValue } : v);
        setVenues((prev) => prev.map(revertUpdate));
        setAllVenues((prev) => prev.map(revertUpdate));

        setNotification({
          open: true,
          message: `Error updating top pick status: ${error.message}`,
          severity: 'error'
        });
      } finally {
        setToggleLoading((prev) => {
          const newState = { ...prev };
          delete newState[toggleKey];
          return newState;
        });
      }
    },
    [venues, API_URL, toggleLoading]
  );

  const handleStatusToggle = useCallback(
    async (_id) => {
      const toggleKey = `${_id}-status`;
      if (toggleLoading[toggleKey]) return;

      const venue = venues.find((v) => v._id === _id);
      if (!venue) {
        setNotification({
          open: true,
          message: 'Venue not found',
          severity: 'error'
        });
        return;
      }

      const newValue = !venue.status;
      setToggleLoading((prev) => ({ ...prev, [toggleKey]: true }));
      
      const updateVenue = (v) => (v._id === _id ? { ...v, status: newValue } : v);
      setVenues((prev) => prev.map(updateVenue));
      setAllVenues((prev) => prev.map(updateVenue));

      try {
        const endpoint = `${API_URL}/${_id}/toggle-active`;
        const options = getFetchOptions('PATCH');
        const data = await makeAPICall(endpoint, options);

        if (!data.success) throw new Error(data.message || 'Update failed');

        const finalUpdate = (v) => 
          v._id === _id ? { ...v, status: data.data.isActive ?? v.status } : v;
        
        setVenues((prev) => prev.map(finalUpdate));
        setAllVenues((prev) => prev.map(finalUpdate));

        const statusMessage = data.data.isActive 
          ? 'Venue activated successfully' 
          : 'Venue deactivated successfully';

        setNotification({
          open: true,
          message: statusMessage,
          severity: 'success'
        });
      } catch (error) {
        console.error('❌ Status toggle error:', error);
        
        const revertUpdate = (v) => (v._id === _id ? { ...v, status: !newValue } : v);
        setVenues((prev) => prev.map(revertUpdate));
        setAllVenues((prev) => prev.map(revertUpdate));

        setNotification({
          open: true,
          message: `Error updating status: ${error.message}`,
          severity: 'error'
        });
      } finally {
        setToggleLoading((prev) => {
          const newState = { ...prev };
          delete newState[toggleKey];
          return newState;
        });
      }
    },
    [venues, API_URL, toggleLoading]
  );

  const handleDeleteClick = (venue) => {
    setVenueToDelete(venue);
    setOpenDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setVenueToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      const url = `${API_URL}/${venueToDelete._id}`;
      const options = getFetchOptions('DELETE');
      const data = await makeAPICall(url, options);

      if (data.success) {
        setVenues((prev) => prev.filter((v) => v._id !== venueToDelete._id));
        setAllVenues((prev) => prev.filter((v) => v._id !== venueToDelete._id));
        setNotification({
          open: true,
          message: `${venueToDelete.venueName} has been deleted successfully`,
          severity: 'success'
        });
      } else {
        throw new Error(data.message || 'Failed to delete venue');
      }
    } catch (error) {
      console.error('❌ Error deleting venue:', error);
      setNotification({
        open: true,
        message: `Error deleting venue: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setOpenDeleteDialog(false);
      setVenueToDelete(null);
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  const handleFetchTopPicks = async () => {
    try {
      setLoading(true);
      setSelectedZone('All Zones');
      await fetchVenues(true);
      setNotification({
        open: true,
        message: 'Top pick venues fetched successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('❌ Error fetching top picks:', error);
      setNotification({
        open: true,
        message: `Error fetching top picks: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.venueAddress.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ['Sl', 'Venue Name', 'Address', 'City', 'State', 'Postal Code', 'Country', 'Contact Person', 'Phone', 'Email', 'Seated', 'Standing', 'Total', 'Parking', 'Venue Type', 'Price/Day', 'Top Pick', 'Status'];
    const csvData = filteredVenues.map((venue) => [
      venue.id,
      `"${venue.venueName}"`,
      `"${venue.venueAddress}"`,
      `"${venue.venueCity}"`,
      `"${venue.venueState}"`,
      `"${venue.venuePostalCode}"`,
      `"${venue.venueCountry}"`,
      `"${venue.contactPersonName}"`,
      `"${venue.contactPersonPhone}"`,
      `"${venue.contactPersonEmail}"`,
      `"${venue.maxGuestsSeated}"`,
      `"${venue.maxGuestsStanding}"`,
      `"${venue.totalCapacity}"`,
      `"${venue.parkingCapacity}"`,
      `"${venue.venueType}"`,
      `"${venue.pricePerDay}"`,
      venue.isTopPick ? 'Yes' : 'No',
      venue.status ? 'Active' : 'Inactive'
    ]);

    const csvContent = [headers.join(','), ...csvData.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `venues_list_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleClose();

    setNotification({
      open: true,
      message: 'CSV file exported successfully!',
      severity: 'success'
    });
  };

  const exportToExcel = () => {
    const headers = ['Sl', 'Venue Name', 'Address', 'City', 'State', 'Postal Code', 'Country', 'Contact Person', 'Phone', 'Email', 'Seated', 'Standing', 'Total', 'Parking', 'Venue Type', 'Price/Day', 'Catering', 'Alcohol', 'Top Pick', 'Status'];
    let excelContent = `
      <table border="1">
        <thead>
          <tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${filteredVenues
            .map(
              (venue) => `
            <tr>
              <td>${venue.id}</td>
              <td>${venue.venueName}</td>
              <td>${venue.venueAddress}</td>
              <td>${venue.venueCity}</td>
              <td>${venue.venueState}</td>
              <td>${venue.venuePostalCode}</td>
              <td>${venue.venueCountry}</td>
              <td>${venue.contactPersonName}</td>
              <td>${venue.contactPersonPhone}</td>
              <td>${venue.contactPersonEmail}</td>
              <td>${venue.maxGuestsSeated}</td>
              <td>${venue.maxGuestsStanding}</td>
              <td>${venue.totalCapacity}</td>
              <td>${venue.parkingCapacity}</td>
              <td>${venue.venueType}</td>
              <td>${venue.pricePerDay}</td>
              <td>${venue.cateringAvailable ? 'Yes' : 'No'}</td>
              <td>${venue.alcoholPermitted ? 'Yes' : 'No'}</td>
              <td>${venue.isTopPick ? 'Yes' : 'No'}</td>
              <td>${venue.status ? 'Active' : 'Inactive'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `venues_list_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleClose();

    setNotification({
      open: true,
      message: 'Excel file exported successfully!',
      severity: 'success'
    });
  };

  const statsVenues = selectedZone === 'All Zones' ? allVenues : venues;

  return (
    <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      {/* Stats bar */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', p: 2, bgcolor: '#f5f5f5', gap: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ bgcolor: '#e3f2fd', p: 1, borderRadius: 1 }}>
            Total venues: {statsVenues.length}
          </Box>
          <Box sx={{ bgcolor: '#fff3e0', p: 1, borderRadius: 1 }}>
            Active venues: {statsVenues.filter((v) => v.status).length}
          </Box>
          <Box sx={{ bgcolor: '#e0f7fa', p: 1, borderRadius: 1 }}>
            Inactive venues: {statsVenues.filter((v) => !v.status).length}
          </Box>
          <Box sx={{ bgcolor: '#fce4ec', p: 1, borderRadius: 1 }}>
            Top Pick venues: {statsVenues.filter((v) => v.isTopPick).length}
          </Box>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={handleFetchTopPicks}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Fetch Top Picks'}
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, bgcolor: '#f5f5f5' }}>
        <TextField
          select
          value={selectedZone}
          onChange={handleZoneChange}
          size="small"
          sx={{ minWidth: 150, bgcolor: 'white' }}
        >
          <MenuItem value="All Zones">All Zones</MenuItem>
          {zones.map((zone) => (
            <MenuItem key={zone._id} value={zone.name}>
              {zone.name}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <TextField
            placeholder="Search Venue"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
            sx={{ bgcolor: 'white' }}
          />
          <Button variant="contained" color="primary" size="small" endIcon={<Download />} onClick={handleClick}>
            Export
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={exportToExcel}>Excel</MenuItem>
            <MenuItem onClick={exportToCSV}>CSV</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
          <CircularProgress size={20} />
          <Typography>Loading venues...</Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ position: 'sticky', top: 0, bgcolor: '#f5f5f5', zIndex: 1 }}>
              <TableRow>
                <TableCell>Sl</TableCell>
                <TableCell>Venue Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Seated</TableCell>
                <TableCell>Standing</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Venue Type</TableCell>
                <TableCell>Price/Day</TableCell>
                <TableCell>Top Pick</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVenues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No venues found {selectedZone !== 'All Zones' && `in ${selectedZone}`}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVenues.map((venue) => {
                  const topPickToggleKey = `${venue._id}-topPick`;
                  const statusToggleKey = `${venue._id}-status`;
                  return (
                    <TableRow key={venue._id}>
                      <TableCell>{venue.id}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{venue.venueName}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{venue.venueAddress}</TableCell>
                      <TableCell>{venue.venueCity}</TableCell>
                      <TableCell>{venue.contactPersonName}</TableCell>
                      <TableCell>{venue.contactPersonPhone}</TableCell>
                      <TableCell>{venue.maxGuestsSeated}</TableCell>
                      <TableCell>{venue.maxGuestsStanding}</TableCell>
                      <TableCell>{venue.totalCapacity}</TableCell>
                      <TableCell>{venue.venueType}</TableCell>
                      <TableCell>{venue.pricePerDay}</TableCell>
                      <TableCell>
                        <Switch
                          checked={venue.isTopPick}
                          onChange={() => handleTopPickToggle(venue._id)}
                          disabled={toggleLoading[topPickToggleKey]}
                          color="primary"
                        />
                        {toggleLoading[topPickToggleKey] && <CircularProgress size={16} sx={{ ml: 1 }} />}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={venue.status}
                          onChange={() => handleStatusToggle(venue._id)}
                          disabled={toggleLoading[statusToggleKey]}
                          color="primary"
                        />
                        {toggleLoading[statusToggleKey] && <CircularProgress size={16} sx={{ ml: 1 }} />}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton color="primary" onClick={() => alert(`Viewing: ${venue.venueName}`)}>
                          <VisibilityOutlined />
                        </IconButton>
                        <IconButton color="primary" onClick={() => navigate('/venues/edit', { state: { venue } })}>
                          <Edit />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteClick(venue)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Delete dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        sx={{ '& .MuiDialog-paper': { borderRadius: 2, padding: 2, maxWidth: 400 } }}
      >
        <DialogTitle>
          <Typography variant="h6" color="error">
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete venue "<strong>{venueToDelete?.venueName}</strong>"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel} variant="outlined" color="primary" sx={{ borderRadius: 1, textTransform: 'none', px: 3 }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ borderRadius: 1, textTransform: 'none', px: 3 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </TableContainer>
  );
};

export default CateringList;
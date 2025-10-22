import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  useTheme,
  Switch,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Snackbar,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon, Edit as EditIcon } from "@mui/icons-material";
import axios from "axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "300px" };
const defaultPositions = [{ lat: 10.8505, lng: 76.2711 }];

const ZoneSetup = () => {
  const theme = useTheme();
  const [zones, setZones] = useState([]);
  const [zoneName, setZoneName] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [selectedPositions, setSelectedPositions] = useState(defaultPositions);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [editingZone, setEditingZone] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAfLUm1kPmeMkHh1Hr5nbgNpQJOsNa7B78", // Replace with your own key
  });

  useEffect(() => {
    const fetchZones = async () => {
      try {
        setFetching(true);
        const response = await axios.get("https://api.bookmyevent.ae/api/zones");
        const data = response.data.data;
        if (Array.isArray(data)) setZones(data);
        else setZones([]);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch zones");
      } finally {
        setFetching(false);
      }
    };
    fetchZones();
  }, []);

  const handleIconUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) setIconFile(file);
  };

  const resetForm = () => {
    setZoneName("");
    setIconFile(null);
    setSelectedPositions(defaultPositions);
    setEditingZone(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!zoneName.trim()) {
      setError("Zone name is required");
      return;
    }
    if (selectedPositions.length === 0) {
      setError("Please select at least one location on the map");
      return;
    }

    setLoading(true);
    try {
      const zoneData = {
        name: zoneName,
        icon: iconFile?.name || "",
        coordinates: selectedPositions,
      };

      let response;
      if (editingZone) {
        response = await axios.put(
          `https://api.bookmyevent.ae/api/zones/${editingZone._id}`,
          zoneData
        );
        setZones(
          zones.map((z) => (z._id === editingZone._id ? response.data.data : z))
        );
      } else {
        response = await axios.post("https://api.bookmyevent.ae/api/zones", zoneData);
        setZones([...zones, response.data.data]);
      }

      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setZoneName(zone.name);
    if (zone.coordinates && Array.isArray(zone.coordinates)) {
      setSelectedPositions(
        zone.coordinates.map((c) => ({
          lat: parseFloat(c.lat),
          lng: parseFloat(c.lng),
        }))
      );
    } else {
      setSelectedPositions([]);
    }
  };

  const handleStatusToggle = async (zoneId) => {
    try {
      const zone = zones.find((z) => z._id === zoneId);
      const updated = await axios.patch(
        `https://api.bookmyevent.ae/api/zones/${zoneId}`,
        { isActive: !zone.isActive }
      );
      setZones(zones.map((z) => (z._id === zoneId ? updated.data.data : z)));
    } catch (err) {
      console.error(err);
      setError("Failed to update status");
    }
  };

  const handleMapClick = (e) => {
    if (selectedPositions.length >= 3) {
      setToastMessage("You can add a maximum of 3 locations per zone");
      setToastOpen(true);
      return;
    }

    if (e.latLng) {
      setSelectedPositions([
        ...selectedPositions,
        { lat: e.latLng.lat(), lng: e.latLng.lng() },
      ]);
    }
  };

  const handleRemoveMarker = (index) => {
    if (selectedPositions.length === 1) {
      setToastMessage("At least one location must remain on the map");
      setToastOpen(true);
      return;
    }
    const newPositions = [...selectedPositions];
    newPositions.splice(index, 1);
    setSelectedPositions(newPositions);
  };

  return (
    <Box sx={{ p: 4, backgroundColor: theme.palette.grey[50], minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}>
        Zone Setup
      </Typography>

      {/* Add/Edit Form */}
      <Paper sx={{ p: 4, borderRadius: 3, mb: 4, backgroundColor: "white" }} elevation={3}>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.main }}
        >
          {editingZone ? "Edit Business Zone" : "Add New Business Zone"}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Business Zone Name"
              placeholder="Enter business zone name"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                width: "100%",
                height: 150,
                border: `2px dashed ${theme.palette.grey[300]}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: theme.palette.primary.light + "10",
                },
              }}
              onClick={() => document.getElementById("icon-upload")?.click()}
            >
              {iconFile ? (
                <Typography variant="body2" color="primary">
                  {iconFile.name}
                </Typography>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body2" color="textSecondary" width={400}>
                    Upload Zone Icon
                  </Typography>
                </>
              )}
              <input
                id="icon-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleIconUpload}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ width: "100%", height: 300, borderRadius: 2, overflow: "hidden" }}>
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={selectedPositions[0]}
                  zoom={7}
                  onClick={handleMapClick}
                >
                  {selectedPositions.map((pos, index) => (
                    <Marker
                      key={index}
                      position={{ lat: pos.lat, lng: pos.lng }}
                      onClick={() => handleRemoveMarker(index)}
                    />
                  ))}
                </GoogleMap>
              ) : (
                <Typography sx={{ p: 2 }}>Loading map...</Typography>
              )}
            </Paper>

            {selectedPositions.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Selected Locations:</Typography>
                {selectedPositions.map((pos, index) => (
                  <Typography key={index} variant="body2">
                    {index + 1}. Lat: {pos.lat.toFixed(4)}, Lng: {pos.lng.toFixed(4)}
                  </Typography>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, textAlign: "right" }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 600 }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : editingZone ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </Box>
      </Paper>

      {/* Table (Icon column removed) */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden", backgroundColor: "white" }} elevation={2}>
        {fetching ? (
          <Box sx={{ textAlign: "center", p: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell sx={{ fontWeight: 600 }}>Sl/No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Zone Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Coordinates</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {zones.map((zone, index) => (
                <TableRow
                  key={zone._id}
                  sx={{ "&:hover": { backgroundColor: theme.palette.grey[50] } }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{zone.name}</TableCell>
                  <TableCell>
                    {zone.coordinates?.map((c, i) => (
                      <span key={i}>
                        ({parseFloat(c.lat).toFixed(4)}, {parseFloat(c.lng).toFixed(4)}){" "}
                      </span>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={zone.isActive}
                      onChange={() => handleStatusToggle(zone._id)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="inherit" onClick={() => handleEdit(zone)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="warning" sx={{ width: "100%" }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ZoneSetup;

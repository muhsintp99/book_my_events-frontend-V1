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
  Avatar,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon
} from "@mui/icons-material";
import axios from "axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { API_BASE_URL, getApiImageUrl } from "../utils/apiImageUtils";

const ZoneSetup = () => {
  const theme = useTheme();
  const [zones, setZones] = useState([]);
  const [zoneName, setZoneName] = useState("");
  const [zoneDescription, setZoneDescription] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [selectedPositions, setSelectedPositions] = useState([{ lat: 10.8505, lng: 76.2711 }]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [editingZone, setEditingZone] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("warning");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAfLUm1kPmeMkHh1Hr5nbgNpQJOsNa7B78",
  });

  const showToast = (message, severity = "warning") => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${API_BASE_URL}/zones`);
      const data = response.data.data;
      if (Array.isArray(data)) {
        setZones(data);
      } else {
        setZones([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch zones");
      showToast("Failed to fetch zones", "error");
    } finally {
      setFetching(false);
    }
  };

  const handleIconUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast("Please upload an image file", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("File size should not exceed 5MB", "error");
        return;
      }
      setIconFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setZoneName("");
    setZoneDescription("");
    setIconFile(null);
    setIconPreview(null);
    setSelectedPositions([{ lat: 10.8505, lng: 76.2711 }]);
    setEditingZone(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!zoneName.trim()) {
      setError("Zone name is required");
      showToast("Zone name is required", "error");
      return;
    }
    if (selectedPositions.length < 3) {
      setError("Please select at least 3 locations on the map");
      showToast("Please select at least 3 locations on the map", "error");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", zoneName);
      formData.append("description", zoneDescription);
      formData.append("coordinates", JSON.stringify(selectedPositions));

      if (iconFile) {
        formData.append("icon", iconFile);
      }

      let response;
      if (editingZone) {
        response = await axios.put(
          `${API_BASE_URL}/zones/${editingZone._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        showToast("Zone updated successfully", "success");
      } else {
        response = await axios.post(
          `${API_BASE_URL}/zones`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        showToast("Zone created successfully", "success");
      }

      await fetchZones();
      resetForm();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Something went wrong";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setZoneName(zone.name);
    setZoneDescription(zone.description || "");

    if (zone.iconUrl) {
      setIconPreview(getApiImageUrl(zone.iconUrl));
    }

    if (zone.coordinates && Array.isArray(zone.coordinates)) {
      setSelectedPositions(
        zone.coordinates.map((c) => ({
          lat: parseFloat(c.lat),
          lng: parseFloat(c.lng),
        }))
      );
    } else {
      setSelectedPositions([{ lat: 10.8505, lng: 76.2711 }]);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (zoneId, zoneName) => {
    if (!window.confirm(`Are you sure you want to delete "${zoneName}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/zones/${zoneId}`);
      showToast("Zone deleted successfully", "success");
      await fetchZones();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to delete zone";
      showToast(errorMessage, "error");
    }
  };

  const handleStatusToggle = async (zoneId) => {
    try {
      const zone = zones.find((z) => z._id === zoneId);
      const response = await axios.put(
        `${API_BASE_URL}/zones/${zoneId}`,
        { isActive: !zone.isActive }
      );

      showToast(
        `Zone ${response.data.data.isActive ? "activated" : "deactivated"} successfully`,
        "success"
      );
      await fetchZones();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to update status";
      showToast(errorMessage, "error");
    }
  };

  const handleTopZoneToggle = async (zoneId) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/zones/${zoneId}/toggle-top`
      );

      const updatedZone = response.data.data;
      showToast(
        `Zone ${updatedZone.isTopZone ? "added to" : "removed from"} top zones`,
        "success"
      );

      await fetchZones();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to update Top Zone status";
      showToast(errorMessage, "error");
    }
  };

  const handleMapClick = (e) => {
    if (selectedPositions.length >= 10) {
      showToast("Maximum 10 locations allowed per zone", "warning");
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
      showToast("At least one location must remain on the map", "warning");
      return;
    }
    const newPositions = [...selectedPositions];
    newPositions.splice(index, 1);
    setSelectedPositions(newPositions);
  };

  const handleCancelEdit = () => {
    resetForm();
    showToast("Edit cancelled", "info");
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
          sx={{ mb: 4, fontWeight: 600, color: theme.palette.primary.main, textAlign: "center" }}
        >
          {editingZone ? "Edit Business Zone" : "Add New Business Zone"}
        </Typography>

        <Box sx={{ maxWidth: 800, mx: "auto" }}>
          {/* Business Zone Name */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
              Business Zone Name *
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter business zone name"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              required
              variant="outlined"
              size="medium"
            />
          </Box>

          {/* Description */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
              Description (Optional)
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter zone description"
              value={zoneDescription}
              onChange={(e) => setZoneDescription(e.target.value)}
              variant="outlined"
              size="medium"
            />
          </Box>

          {/* Zone Icon Upload */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
              Zone Icon *
            </Typography>
            <Paper
              sx={{
                width: "100%",
                minHeight: 200,
                border: `2px dashed ${theme.palette.grey[300]}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: theme.palette.primary.light + "10",
                },
              }}
              onClick={() => document.getElementById("icon-upload")?.click()}
            >
              {iconPreview ? (
                <Box>
                  <Avatar
                    src={iconPreview}
                    alt="Icon preview"
                    sx={{ width: 80, height: 80, mb: 2 }}
                    variant="rounded"
                  />
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                    {iconFile?.name || "Current Icon"}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 0.5 }}>
                    Click to change
                  </Typography>
                </Box>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                    Click to upload
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    Or drag and drop
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Max 5MB | PNG, JPG, SVG
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
          </Box>

          {/* Map Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
              Zone Coordinates (Click on map to add locations) *
            </Typography>
            <Paper
              sx={{
                width: "100%",
                height: 450,
                borderRadius: 2,
                overflow: "hidden",
                border: `1px solid ${theme.palette.grey[200]}`
              }}
              elevation={0}
            >
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={selectedPositions[0]}
                  zoom={7}
                  onClick={handleMapClick}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: true,
                    fullscreenControl: true,
                  }}
                >
                  {selectedPositions.map((pos, index) => (
                    <Marker
                      key={index}
                      position={{ lat: pos.lat, lng: pos.lng }}
                      onClick={() => handleRemoveMarker(index)}
                      label={{
                        text: (index + 1).toString(),
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  ))}
                </GoogleMap>
              ) : (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <CircularProgress />
                </Box>
              )}
            </Paper>
          </Box>

          {/* Selected Locations */}
          {selectedPositions.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Paper sx={{ p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.main }}>
                  Selected Locations ({selectedPositions.length}/10):
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedPositions.map((pos, index) => (
                    <Box
                      key={index}
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        backgroundColor: "white",
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.grey[300]}`,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}>
                        {index + 1}. {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 1 }}>
                  Click on a marker to remove it
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 3, mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
          {editingZone && (
            <Button
              variant="outlined"
              onClick={handleCancelEdit}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                borderColor: theme.palette.error.main,
                color: theme.palette.error.main,
                "&:hover": {
                  borderColor: theme.palette.error.dark,
                  backgroundColor: theme.palette.error.light + "10",
                },
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              backgroundColor: theme.palette.error.main,
              "&:hover": {
                backgroundColor: theme.palette.error.dark,
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : editingZone ? (
              "Update Zone"
            ) : (
              "Submit"
            )}
          </Button>
        </Box>
      </Paper>

      {/* Zones Table */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden", backgroundColor: "white" }} elevation={2}>
        <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderBottom: `1px solid ${theme.palette.grey[300]}` }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Existing Zones ({zones.length})
          </Typography>
        </Box>

        {fetching ? (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>Loading zones...</Typography>
          </Box>
        ) : zones.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <Typography variant="body1" color="textSecondary">
              No zones found. Create your first zone above.
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell sx={{ fontWeight: 600 }}>Sl/No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Icon</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Zone Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Coordinates</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Top Zone</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {zones.map((zone, index) => (
                <TableRow
                  key={zone._id}
                  sx={{
                    "&:hover": { backgroundColor: theme.palette.grey[50] },
                    backgroundColor: editingZone?._id === zone._id ? theme.palette.primary.light + "10" : "transparent"
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {zone.iconUrl ? (
                      <Avatar
                        src={getApiImageUrl(zone.iconUrl)}
                        alt={zone.name}
                        sx={{ width: 40, height: 40 }}
                        variant="rounded"
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: theme.palette.grey[200]
                        }}
                        variant="rounded"
                      >
                        <ImageIcon sx={{ color: theme.palette.grey[500] }} />
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {zone.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                      {zone.coordinates?.length || 0} points
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {zone.city || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Switch
                      checked={zone.isActive}
                      onChange={() => handleStatusToggle(zone._id)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Switch
                      checked={zone.isTopZone || false}
                      onChange={() => handleTopZoneToggle(zone._id)}
                      color="secondary"
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(zone)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(zone._id, zone.name)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity={toastSeverity}
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ZoneSetup;
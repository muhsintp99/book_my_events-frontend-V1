import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Stack,
  useTheme,
  useMediaQuery
} from "@mui/material";

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  ExpandMore as ExpandMoreIcon,
  TableView as ExcelIcon,
  Description as CsvIcon,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../utils/apiImageUtils';

// API_BASE_URL is now imported from apiImageUtils

const API = {
  list: "/makeup-types",
  create: "/makeup-types",
  delete: (id) => `/makeup-types/${id}`,
  update: (id) => `/makeup-types/${id}`,
};

/* ---------------------------
   Component
----------------------------*/
export default function MakeupTypeManagement() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm")); // fullscreen on small screens

  const [nameInput, setNameInput] = useState("");
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: "" });

  // Edit dialog state (popup)
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState(null); // { _id, name }

  // Export menu
  const [exportAnchor, setExportAnchor] = useState(null);
  const exportOpen = Boolean(exportAnchor);

  const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

  const showNotify = (msg, severity = "success") => {
    setNotification({ open: true, message: msg, severity });
  };

  const fetchTypes = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setTypes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API.list}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        // unauthorized -> redirect to login
        navigate("/login");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to fetch makeup types");
      }
      const json = await res.json();
      // API returns { success: true, count, data: [ ... ] } or similar
      const items = json.data || json.makeupTypes || [];
      setTypes(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("fetchTypes error:", err);
      showNotify("Failed to fetch makeup types", "error");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  /* ---------------------------
     CREATE
  ----------------------------*/
  const handleAdd = async () => {
    const token = getToken();
    if (!token) return navigate("/login");

    const name = (nameInput || "").trim();
    if (!name) return showNotify("Please enter a type name", "error");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API.create}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create type");
      }

      const json = await res.json();
      showNotify(json.message || "Created successfully", "success");
      setNameInput("");
      fetchTypes();
    } catch (err) {
      console.error("create error:", err);
      showNotify(err.message || "Failed to create type", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     DELETE
  ----------------------------*/
  const confirmDelete = (type) => {
    setDeleteDialog({ open: true, id: type._id, name: type.name });
  };

  const handleDelete = async () => {
    const token = getToken();
    if (!token) return navigate("/login");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API.delete(deleteDialog.id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Delete failed");
      }
      const json = await res.json();
      showNotify(json.message || "Deleted successfully", "success");
      setDeleteDialog({ open: false, id: null, name: "" });
      fetchTypes();
    } catch (err) {
      console.error("delete error:", err);
      showNotify(err.message || "Failed to delete", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     EDIT (popup)
  ----------------------------*/
  const openEditDialog = (type) => {
    setEditingType({ ...type }); // shallow copy
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingType(null);
  };

  const handleEditSave = async () => {
    if (!editingType) return;
    const token = getToken();
    if (!token) return navigate("/login");

    const name = (editingType.name || "").trim();
    if (!name) return showNotify("Enter a name", "error");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API.update(editingType._id)}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Update failed");
      }

      const json = await res.json();
      showNotify(json.message || "Updated successfully", "success");
      closeEditDialog();
      fetchTypes();
    } catch (err) {
      console.error("edit save error:", err);
      showNotify(err.message || "Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     EXPORT
  ----------------------------*/
  const exportCSV = () => {
    const headers = ["SI", "ID", "Name"];
    const rows = filteredTypes.map((t, idx) => [idx + 1, t._id, t.name]);

    let csv = headers.join(",") + "\n";
    rows.forEach((r) => {
      csv += r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `makeup_types_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportAnchor(null);
    showNotify("CSV downloaded", "success");
  };

  const exportExcel = () => {
    const headers = ["SI", "ID", "Name"];
    const rows = filteredTypes.map((t, idx) => [idx + 1, t._id, t.name]);

    let content = headers.join("\t") + "\n";
    rows.forEach((r) => {
      content += r.join("\t") + "\n";
    });

    const blob = new Blob([content], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `makeup_types_${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    setExportAnchor(null);
    showNotify("Excel downloaded", "success");
  };

  /* ---------------------------
     Derived data: filtered list
  ----------------------------*/
  const filteredTypes = types.filter((t) => (t.name || "").toLowerCase().includes((search || "").toLowerCase()));

  /* ---------------------------
     UI
  ----------------------------*/
  return (
    <Box sx={{ width: "100%", minHeight: "100vh", background: "#f5f5f5", p: 3 }}>
      {/* CREATE FORM */}
      <Card sx={{ maxWidth: 1200, mx: "auto", mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Create Makeup Type
          </Typography>

          <Typography sx={{ mb: 1, fontWeight: 500 }}>
            Name <span style={{ color: "red" }}>*</span>
          </Typography>

          <TextField
            fullWidth
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            sx={{ mb: 3 }}
            placeholder="Enter type name"
            disabled={loading}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={() => setNameInput("")} disabled={loading}>
              Reset
            </Button>
            <Button variant="contained" onClick={handleAdd} disabled={!nameInput.trim() || loading}>
              {loading ? <CircularProgress size={18} color="inherit" /> : "Add"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* LIST */}
      <Card sx={{ maxWidth: 1200, mx: "auto", borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Makeup Type List <Chip label={filteredTypes.length} size="small" sx={{ ml: 1 }} />
            </Typography>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                size="small"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 220 }}
                disabled={loading}
              />

              <Button variant="outlined" startIcon={<ExportIcon />} endIcon={<ExpandMoreIcon />} onClick={(e) => setExportAnchor(e.currentTarget)}>
                Export
              </Button>
            </Box>
          </Box>

          <Menu anchorEl={exportAnchor} open={exportOpen} onClose={() => setExportAnchor(null)}>
            <MenuItem onClick={exportExcel}>
              <ListItemIcon>
                <ExcelIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export to Excel</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={exportCSV}>
              <ListItemIcon>
                <CsvIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export to CSV</ListItemText>
            </MenuItem>
          </Menu>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small" sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow sx={{ height: 56 }}>
                  <TableCell sx={{ width: "8%", fontWeight: 700, background: "#fafafa" }}>SI</TableCell>
                  <TableCell sx={{ width: "64%", fontWeight: 700, background: "#fafafa" }}>Name</TableCell>
                  <TableCell sx={{ width: "28%", fontWeight: 700, background: "#fafafa" }}>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6, color: "#777" }}>
                      {search ? "No types match your search." : "No makeup types found. Create one above."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTypes.map((row, idx) => (
                    <TableRow key={row._id} hover sx={{ height: 64 }}>
                      <TableCell>{idx + 1}</TableCell>

                      <TableCell sx={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <Typography variant="body2" fontWeight={500}>
                          {row.name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" onClick={() => openEditDialog(row)}>
                            <EditIcon fontSize="small" />
                          </IconButton>

                          <IconButton size="small" color="error" onClick={() => confirmDelete(row)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* DELETE CONFIRM */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, name: "" })}>
        <DialogTitle>Delete Makeup Type</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{deleteDialog.name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: "" })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT DIALOG - fullscreen on small screens */}
      <Dialog
        open={editDialogOpen}
        onClose={closeEditDialog}
        fullWidth
        maxWidth="sm"
        fullScreen={isXs}
        aria-labelledby="edit-makeup-type"
      >
        <DialogTitle id="edit-makeup-type">Edit Makeup Type</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Name"
              value={editingType?.name || ""}
              onChange={(e) => setEditingType((p) => ({ ...p, name: e.target.value }))}
              placeholder="Enter type name"
              autoFocus
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave} disabled={!editingType?.name?.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* NOTIFICATION */}
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification((n) => ({ ...n, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity={notification.severity} onClose={() => setNotification((n) => ({ ...n, open: false }))} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

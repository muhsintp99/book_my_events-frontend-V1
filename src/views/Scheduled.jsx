import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  useMediaQuery,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const Schedule = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [scheduleData, setScheduleData] = useState([
    {
      id: 1,
      scheduleId: "SCH001",
      tripId: 100036,
      scheduleDate: "2025-02-08T12:40",
      driverInfo: "Unassigned",
      vehicleInfo: "Unassigned",
      status: "Pending",
    },
    {
      id: 2,
      scheduleId: "SCH002",
      tripId: 100035,
      scheduleDate: "2025-02-06T17:56",
      driverInfo: "Ruth Kerry kuzo**@gmail.com",
      vehicleInfo: "1 Vehicle",
      status: "Assigned",
    },
    {
      id: 3,
      scheduleId: "SCH003",
      tripId: 100033,
      scheduleDate: "2025-02-06T17:43",
      driverInfo: "Unassigned",
      vehicleInfo: "Unassigned",
      status: "Completed",
    },
  ]);

  const [formData, setFormData] = useState({
    scheduleId: "",
    tripId: "",
    scheduleDate: "",
    driverInfo: "",
    vehicleInfo: "",
    status: "Pending",
  });

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({
      scheduleId: "",
      tripId: "",
      scheduleDate: "",
      driverInfo: "",
      vehicleInfo: "",
      status: "Pending",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSaveSchedule = () => {
    if (editingId) {
      // Update existing schedule
      setScheduleData((prev) =>
        prev.map((sch) =>
          sch.id === editingId ? { ...formData, id: editingId } : sch
        )
      );
    } else {
      // Add new schedule
      const newSchedule = { ...formData, id: scheduleData.length + 1 };
      setScheduleData((prev) => [...prev, newSchedule]);
    }
    handleClose();
  };

  const handleEdit = (schedule) => {
    setFormData({ ...schedule });
    setEditingId(schedule.id);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setScheduleData((prev) => prev.filter((sch) => sch.id !== id));
  };

  const filteredSchedules = scheduleData.filter(
    (schedule) =>
      schedule.scheduleId.toLowerCase().includes(search.toLowerCase()) ||
      schedule.tripId.toString().includes(search)
  );

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Trip Schedules
      </Typography>

      <Paper sx={{ mt: 2, width: "100%" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          p={2}
        >
          <Button variant="contained" onClick={handleOpen}>
            Add New Schedule
          </Button>
          <TextField
            label="Search by Schedule ID or Trip ID"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            sx={{ maxWidth: { sm: 300 } }}
          />
          <Button variant="contained" color="primary">
            Export
          </Button>
        </Stack>

        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>S#</TableCell>
                <TableCell>Schedule ID</TableCell>
                <TableCell>Trip ID</TableCell>
                <TableCell>Schedule Date</TableCell>
                <TableCell>Driver Info</TableCell>
                <TableCell>Vehicle Info</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSchedules.map((schedule, index) => (
                <TableRow key={schedule.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{schedule.scheduleId}</TableCell>
                  <TableCell>{schedule.tripId}</TableCell>
                  <TableCell>
                    {new Date(schedule.scheduleDate).toLocaleString()}
                  </TableCell>
                  <TableCell>{schedule.driverInfo}</TableCell>
                  <TableCell>{schedule.vehicleInfo}</TableCell>
                  <TableCell>{schedule.status}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEdit(schedule)}
                      >
                        Edit
                      </Button>
                      <Button variant="outlined" size="small">
                        View
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Schedule Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogTitle>{editingId ? "Edit Schedule" : "Add New Schedule"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Schedule ID"
            name="scheduleId"
            value={formData.scheduleId}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Trip ID"
            name="tripId"
            value={formData.tripId}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Schedule Date & Time"
            name="scheduleDate"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={formData.scheduleDate}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Driver Info"
            name="driverInfo"
            value={formData.driverInfo}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Vehicle Info"
            name="vehicleInfo"
            value={formData.vehicleInfo}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Assigned">Assigned</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSchedule}>
            {editingId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Schedule;
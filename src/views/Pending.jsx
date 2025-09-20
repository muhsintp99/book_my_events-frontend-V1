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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const PendingTrips = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    tripId: "",
    bookingDate: "",
    scheduleAt: "",
    customerInfo: "",
    driverInfo: "",
    vehicleInfo: "",
    tripType: "",
    tripAmount: "",
    tripStatus: "",
  });

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Static trips data
  const tripsData = [
    { 
      id: 1, 
      tripId: 100036, 
      bookingDate: "08 Feb 2025", 
      scheduleAt: "08 Feb 2025 12:40pm", 
      customerInfo: "Jhon j*@gmail.com", 
      driverInfo: "Unassigned", 
      vehicleInfo: "Unassigned", 
      tripType: "Hourly\nInstant", 
      tripAmount: "$247.50", 
      tripStatus: "Pending\nUnpaid" 
    },
    { 
      id: 2, 
      tripId: 100035, 
      bookingDate: "06 Feb 2025", 
      scheduleAt: "06 Feb 2025 05:56pm", 
      customerInfo: "Jonathon Jack s*@gmail.com", 
      driverInfo: "Unassigned", 
      vehicleInfo: "Unassigned", 
      tripType: "Hourly\nInstant", 
      tripAmount: "$33.75", 
      tripStatus: "Confirmed\nUnpaid" 
    },
    { 
      id: 3, 
      tripId: 100033, 
      bookingDate: "06 Feb 2025", 
      scheduleAt: "06 Feb 2025 05:43pm", 
      customerInfo: "MS 133 m*@gmail.com", 
      driverInfo: "Unassigned", 
      vehicleInfo: "Unassigned", 
      tripType: "Distance wise\nInstant", 
      tripAmount: "$180.60", 
      tripStatus: "Pending\nUnpaid" 
    },
    { 
      id: 4, 
      tripId: 100031, 
      bookingDate: "06 Feb 2025", 
      scheduleAt: "06 Feb 2025 03:22pm", 
      customerInfo: "Jonathon Jack s*@gmail.com", 
      driverInfo: "Ruth Kerry kuzo**@gmail.com", 
      vehicleInfo: "1 Vehicles", 
      tripType: "Distance wise\nInstant", 
      tripAmount: "$180.60", 
      tripStatus: "Completed\nPaid" 
    },
  ];

  // Filter for Pending trips only
  const pendingTrips = tripsData.filter(trip =>
    trip.tripStatus.toLowerCase().includes("pending")
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      tripId: "",
      bookingDate: "",
      scheduleAt: "",
      customerInfo: "",
      driverInfo: "",
      vehicleInfo: "",
      tripType: "",
      tripAmount: "",
      tripStatus: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredTrips = pendingTrips.filter(trip =>
    trip.tripId.toString().includes(search) ||
    trip.customerInfo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Pending Trips
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
            Add New Trip
          </Button>
          <TextField
            label="Search by trip ID, customer name, email"
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
                <TableCell>Trip ID</TableCell>
                <TableCell>Booking Date</TableCell>
                <TableCell>Schedule At</TableCell>
                <TableCell>Customer Info</TableCell>
                <TableCell>Driver Info</TableCell>
                <TableCell>Vehicle Info</TableCell>
                <TableCell>Trip Type</TableCell>
                <TableCell>Trip Amount</TableCell>
                <TableCell>Trip Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTrips.map((trip, index) => (
                <TableRow key={trip.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{trip.tripId}</TableCell>
                  <TableCell>{trip.bookingDate}</TableCell>
                  <TableCell>{trip.scheduleAt}</TableCell>
                  <TableCell>{trip.customerInfo}</TableCell>
                  <TableCell>{trip.driverInfo}</TableCell>
                  <TableCell>{trip.vehicleInfo}</TableCell>
                  <TableCell>{trip.tripType}</TableCell>
                  <TableCell>{trip.tripAmount}</TableCell>
                  <TableCell>{trip.tripStatus}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small">Download</Button>
                      <Button variant="outlined" size="small">View</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTrips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    No pending trips found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogTitle>Add New Pending Trip</DialogTitle>
        <DialogContent dividers>
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
            label="Booking Date"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Schedule At"
            name="scheduleAt"
            value={formData.scheduleAt}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Customer Info"
            name="customerInfo"
            value={formData.customerInfo}
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
          <TextField
            fullWidth
            label="Trip Type"
            name="tripType"
            value={formData.tripType}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Trip Amount"
            name="tripAmount"
            value={formData.tripAmount}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Trip Status"
            name="tripStatus"
            value={formData.tripStatus}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleClose}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingTrips;
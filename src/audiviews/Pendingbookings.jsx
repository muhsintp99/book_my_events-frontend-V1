import React, { useEffect, useState } from "react";
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
import axios from "axios";

const Pendingbookings = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // FETCH BOOKINGS
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/bookings");
        const allBookings = res.data.bookings || [];

        // Filter only Pending bookings
        const filtered = allBookings.filter(
          (b) =>
            b.status?.toLowerCase() === "pending" ||
            b.paymentStatus?.toLowerCase() === "pending"
        );

        setPendingBookings(filtered);
      } catch (error) {
        console.error("Error fetching pending bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSearchChange = (e) => setSearch(e.target.value);

  // Search filtering
  const filteredTrips = pendingBookings.filter(
    (b) =>
      b._id.includes(search) ||
      (b.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.emailAddress || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Pending Bookings
      </Typography>

      <Paper sx={{ mt: 2, width: "100%" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          p={2}
        >
          <TextField
            label="Search by Booking ID, Customer Name, Email"
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
                <TableCell>Booking ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Guests</TableCell>
                <TableCell>Booking Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                filteredTrips.map((b, index) => (
                  <TableRow key={b._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{b._id}</TableCell>
                    <TableCell>{b.fullName}</TableCell>
                    <TableCell>{b.emailAddress}</TableCell>
                    <TableCell>{b.numberOfGuests}</TableCell>
                    <TableCell>
                      {new Date(b.bookingDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{b.finalPrice}</TableCell>
                    <TableCell>{b.status}</TableCell>
                    <TableCell>{b.paymentStatus}</TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button variant="outlined" size="small">
                          View
                        </Button>
                        <Button variant="outlined" size="small">
                          Download
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && filteredTrips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No Pending Bookings Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add New Trip Modal (Optional – you can remove if not needed) */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
        <DialogTitle>Add New Pending Trip</DialogTitle>
        <DialogContent dividers>
          <Typography>This form is optional. You can remove it.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Pendingbookings;

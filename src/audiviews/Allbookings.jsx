import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Stack,
} from "@mui/material";
import axios from "axios";

const Allbookings = () => {
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch ALL bookings (no provider filter)
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/bookings"); 
        setBookings(res.data.bookings || []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleSearchChange = (e) => setSearch(e.target.value);

  // 🔍 Search by bookingId, name, email
  const filteredBookings = bookings.filter((b) =>
    (b.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.emailAddress || "").toLowerCase().includes(search.toLowerCase()) ||
    b._id.includes(search)
  );

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        All Bookings
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
            label="Search by Booking ID, Name, Email"
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
                <TableCell>Customer</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Booking Date</TableCell>
                <TableCell>Guests</TableCell>
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
                filteredBookings.map((b, index) => (
                  <TableRow key={b._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{b._id}</TableCell>
                    <TableCell>{b.fullName || "N/A"}</TableCell>
                    <TableCell>{b.emailAddress || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(b.bookingDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{b.numberOfGuests}</TableCell>
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

              {!loading && filteredBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Allbookings;

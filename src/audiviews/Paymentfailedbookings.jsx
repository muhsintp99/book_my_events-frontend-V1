import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Stack,
  TextField,
} from "@mui/material";
import axios from "axios";

const PaymentFailedbookings = () => {
  const [search, setSearch] = useState("");
  const [failedPayments, setFailedPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all bookings & filter failed
  useEffect(() => {
    const fetchFailed = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/bookings");
        const all = res.data.bookings || [];

        // Filter payment failed
        const failed = all.filter(
          (b) => b.paymentStatus?.toLowerCase() === "failed"
        );

        setFailedPayments(failed);
      } catch (err) {
        console.error("Error fetching failed payments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFailed();
  }, []);

  const handleSearchChange = (e) => setSearch(e.target.value);

  const filteredPayments = failedPayments.filter(
    (b) =>
      b._id.includes(search) ||
      (b.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.emailAddress || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Failed Payments
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
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Booking Date</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                filteredPayments.map((b, index) => (
                  <TableRow key={b._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{b._id}</TableCell>
                    <TableCell>{b.fullName}</TableCell>
                    <TableCell>{b.emailAddress}</TableCell>
                    <TableCell>{b.finalPrice}</TableCell>
                    <TableCell>
                      {new Date(b.bookingDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{b.paymentStatus}</TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button variant="outlined" size="small">
                          Retry
                        </Button>
                        <Button variant="outlined" size="small">
                          View
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No failed payments found
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

export default PaymentFailedbookings;

import React, { useState } from "react";
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

const PaymentFailedbookings = () => {
  const [search, setSearch] = useState("");

  const failedPaymentsData = [
    {
      id: 1,
      paymentId: "PMT1001",
      tripId: 100036,
      customerInfo: "John Doe j*@gmail.com",
      amount: "$247.50",
      paymentDate: "08 Feb 2025 12:40pm",
      status: "Failed",
      reason: "Insufficient Funds",
    },
    {
      id: 2,
      paymentId: "PMT1002",
      tripId: 100035,
      customerInfo: "Jane Smith j*@gmail.com",
      amount: "$33.75",
      paymentDate: "06 Feb 2025 05:56pm",
      status: "Failed",
      reason: "Card Expired",
    },
    {
      id: 3,
      paymentId: "PMT1003",
      tripId: 100033,
      customerInfo: "MS 133 m*@gmail.com",
      amount: "$180.60",
      paymentDate: "06 Feb 2025 05:43pm",
      status: "Failed",
      reason: "Payment Gateway Error",
    },
  ];

  const handleSearchChange = (e) => setSearch(e.target.value);

  const filteredPayments = failedPaymentsData.filter(
    (payment) =>
      payment.paymentId.toLowerCase().includes(search.toLowerCase()) ||
      payment.customerInfo.toLowerCase().includes(search.toLowerCase()) ||
      payment.tripId.toString().includes(search)
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
            label="Search by Payment ID, Trip ID, Customer"
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
                <TableCell>Payment ID</TableCell>
                <TableCell>Trip ID</TableCell>
                <TableCell>Customer Info</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Failure Reason</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment, index) => (
                <TableRow key={payment.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{payment.paymentId}</TableCell>
                  <TableCell>{payment.tripId}</TableCell>
                  <TableCell>{payment.customerInfo}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>{payment.paymentDate}</TableCell>
                  <TableCell>{payment.status}</TableCell>
                  <TableCell>{payment.reason}</TableCell>
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
              {filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
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
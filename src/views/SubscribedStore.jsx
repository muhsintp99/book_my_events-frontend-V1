import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Button,
  Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableHead, TableRow,
  Menu, TextField, InputAdornment, Chip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { MoreVert } from "@mui/icons-material";
import { styled } from "@mui/system";

const StyledCard = styled(Card)({
  borderRadius: 8,
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  border: "1px solid #e0e0e0",
});

const StatCard = styled(Box)({
  padding: 24,
  borderRadius: 8,
  flex: 1,
  textAlign: "center",
  border: "1px solid #e0e0e0",
});

const StoreIcon = styled(Box)({
  width: 40,
  height: 40,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
  fontSize: "20px",
});

const SubscribedStore = () => {
  const [stores, setStores] = useState([]);
  const [modules, setModules] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("All");
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchSubscribedStores();
    fetchModules();

    // ✅ Listen for subscription updates from other tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === 'subscriptionUpdated' && e.newValue === 'true') {
        console.log('🔄 Subscription updated - refreshing list');
        fetchSubscribedStores();
        localStorage.removeItem('subscriptionUpdated');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // ✅ Also listen for custom events in the same tab
    const handleSubscriptionUpdate = () => {
      console.log('🔄 Subscription updated (same tab) - refreshing list');
      fetchSubscribedStores();
    };

    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, []);

  // Fetch Subscribed Stores
  const fetchSubscribedStores = async () => {
    try {
      const res = await fetch("https://api.bookmyevent.ae/api/subscription/all");
      const data = await res.json();

      if (data.success) {
        const mapped = data.subscriptions.map((sub) => {
          const expDate = new Date(sub.endDate);

          return {
            id: sub._id,
            name: sub.userId?.storeName || sub.userId?.businessName || sub.userId?.name || "Unknown Store",
            module: sub.moduleId?.title || "Unknown",
            moduleId: sub.moduleId?._id || "none",
            package: sub.planId?.name || "N/A",
            price: `₹${sub.planId?.price || 0}`,
            expDate,
            expDateString: expDate.toDateString(),
            used: 1,
            icon: "🏪",
            iconBg: "#6c5ce7"
          };
        });

        setStores(mapped);
      }
    } catch (err) {
      console.log("Error fetching subscriptions:", err);
    }
  };

  // Fetch Modules
  const fetchModules = async () => {
    try {
      const res = await fetch("https://api.bookmyevent.ae/api/modules");
      const data = await res.json();

      if (Array.isArray(data)) {
        setModules(data);
      } else if (Array.isArray(data.modules)) {
        setModules(data.modules);
      } else if (Array.isArray(data.data)) {
        setModules(data.data);
      }
    } catch (err) {
      console.log("Error fetching modules:", err);
    }
  };

  // Filter logic
  const filteredStores = stores.filter((store) => {
    const matchSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.package.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.module.toLowerCase().includes(searchQuery.toLowerCase());

    const matchModule =
      selectedModule === "All" || store.moduleId === selectedModule;

    return matchSearch && matchModule;
  });

  // Stats
  const totalSubscribed = stores.length;
  const activeSubscriptions = stores.filter((s) => s.expDate > new Date()).length;
  const expiredSubscriptions = stores.filter((s) => s.expDate < new Date()).length;
  const expiringSoon = stores.filter((s) => {
    const now = new Date();
    const diffDays = (s.expDate - now) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 7;
  }).length;

  // Export CSV
  const exportCSV = () => {
    const csvRows = [];
    csvRows.push(["Sl", "Store Name", "Module", "Package", "Price", "Exp Date", "Used"].join(","));

    filteredStores.forEach((store, index) => {
      csvRows.push([
        index + 1,
        store.name,
        store.module,
        store.package,
        store.price,
        store.expDateString,
        store.used
      ].join(","));
    });

    const file = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribed_store_list.csv";
    a.click();
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Subscribed Store List</Typography>
        <Chip label="All Zones" variant="outlined" />
      </Box>

      {/* Stats row */}
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <StatCard sx={{ background: "linear-gradient(180deg, #e8f4ff 0%, #e6f3ff 100%)", borderColor: "#d0eaff" }}>
          <Typography variant="h4" fontWeight={700} color="#0b66b2">{totalSubscribed}</Typography>
          <Typography color="#0b66b2">Total Subscribed User</Typography>
        </StatCard>

        <StatCard sx={{ background: "linear-gradient(180deg, #eaf6ea 0%, #e8f5e9 100%)", borderColor: "#dff0df" }}>
          <Typography variant="h4" fontWeight={700} color="#2e7d32">{activeSubscriptions}</Typography>
          <Typography color="#2e7d32">Active Subscriptions</Typography>
        </StatCard>

        <StatCard sx={{ background: "linear-gradient(180deg, #fff6ea 0%, #fff3e0 100%)", borderColor: "#ffe9cc" }}>
          <Typography variant="h4" fontWeight={700} color="#b45f08">{expiredSubscriptions}</Typography>
          <Typography color="#b45f08">Expired Subscription</Typography>
        </StatCard>

        <StatCard sx={{ background: "linear-gradient(180deg, #fffdf2 0%, #fff8e1 100%)", borderColor: "#fff2c9" }}>
          <Typography variant="h4" fontWeight={700} color="#a66a00">{expiringSoon}</Typography>
          <Typography color="#a66a00">Expiring Soon</Typography>
        </StatCard>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Store List {filteredStores.length}</Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Module</InputLabel>
            <Select
              value={selectedModule}
              label="Module"
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              {modules.map((mod) => (
                <MenuItem key={mod._id} value={mod._id}>
                  {mod.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Search store / plan / module"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 260 }}
          />

          <Button variant="outlined" startIcon={<MoreVert />} onClick={(e) => setAnchorEl(e.currentTarget)}>
            Export
          </Button>

          <Menu open={open} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { exportCSV(); setAnchorEl(null); }}>CSV</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Table */}
      <StyledCard>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                <TableCell>Sl</TableCell>
                <TableCell>Store Info</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Package</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Exp Date</TableCell>
                <TableCell align="center">Used</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredStores.map((store, index) => (
                <TableRow key={store.id} hover>
                  <TableCell>{index + 1}</TableCell>

                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <StoreIcon sx={{ backgroundColor: store.iconBg }}>
                        {store.icon}
                      </StoreIcon>
                      <Typography>{store.name}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell>{store.module}</TableCell>
                  <TableCell>{store.package}</TableCell>
                  <TableCell>{store.price}</TableCell>
                  <TableCell>{store.expDateString}</TableCell>
                  <TableCell align="center">{store.used}</TableCell>
                </TableRow>
              ))}

              {filteredStores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    No stores found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default SubscribedStore;
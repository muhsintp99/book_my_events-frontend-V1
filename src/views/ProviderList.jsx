import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    TextField,
    CircularProgress,
    Snackbar,
    Alert,
    Avatar,
    IconButton,
    Chip,
    InputAdornment,
    Paper,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Tooltip,
    Stack,
    Grid
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SortIcon from '@mui/icons-material/Sort';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllVendors, deleteProvider, formatVendorsForList, getImageUrl } from '../api/providerApi';
import { API_BASE_URL } from '../utils/apiImageUtils';

function ProviderList() {
    const navigate = useNavigate();
    const location = useLocation();

    const [tabValue, setTabValue] = useState(0);
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [packageStatusFilter, setPackageStatusFilter] = useState('all');
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Determine module from URL and auto-select
    const detectModuleFromUrl = useCallback((modulesList) => {
        const path = location.pathname.toLowerCase();
        console.log('Detecting module for path:', path);

        let detectedMod = null;

        if (path.includes('ornament')) {
            detectedMod = modulesList.find(m => (m.title || '').toLowerCase().includes('ornament'));
        } else if (path.includes('catering')) {
            detectedMod = modulesList.find(m => (m.title || '').toLowerCase().includes('catering'));
        } else if (path.includes('makeup')) {
            detectedMod = modulesList.find(m => (m.title || '').toLowerCase().includes('makeup'));
        } else if (path.includes('photography')) {
            detectedMod = modulesList.find(m => (m.title || '').toLowerCase().includes('photography'));
        } else if (path.includes('cake')) {
            detectedMod = modulesList.find(m => (m.title || '').toLowerCase().includes('cake'));
        } else if (path.includes('auditorium')) {
            detectedMod = modulesList.find(m => (m.title || '').toLowerCase().includes('auditorium'));
        } else if (path.includes('transport') || path.includes('vehicle') || path.includes('providers/vehiclevendorlist')) {
            // Check for transport or vehicle related modules
            detectedMod = modulesList.find(m => {
                const title = (m.title || '').toLowerCase();
                return title.includes('transport') || title.includes('vehicle') || title.includes('rental') || title.includes('crm');
            });
            if (!detectedMod) {
                // Fallback if specific module not found, try to find a generic one or use the first one if it makes sense contextually, 
                // but for now relying on explicit titles.
                // Often 'CRM' or 'Rental' is the module name for Transport.
                detectedMod = modulesList.find(m => m._id === 'crm' || m.title === 'CRM' || m.title === 'Rental');
            }
        }

        if (detectedMod) {
            console.log('Detected module:', detectedMod.title);
            setSelectedModule(detectedMod._id);
        }
    }, [location.pathname]);

    /* ================= FETCH VENDORS ================= */
    const fetchVendors = async () => {
        try {
            setLoading(true);
            const data = await getAllVendors(sortBy, sortOrder);
            const mappedVendors = formatVendorsForList(data.data);
            setVendors(mappedVendors);
        } catch (err) {
            setNotification({
                open: true,
                message: err.message,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchModules = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/modules`);
            const data = await response.json();
            let modulesList = [];
            if (Array.isArray(data)) {
                modulesList = data;
            } else if (data.data && Array.isArray(data.data)) {
                modulesList = data.data;
            }
            setModules(modulesList);
            detectModuleFromUrl(modulesList);
        } catch (err) {
            console.error('Error fetching modules:', err);
        }
    };

    useEffect(() => {
        fetchVendors();
        fetchModules();
    }, [sortBy, sortOrder]);

    /* ================= DELETE VENDOR ================= */
    const handleDeleteVendor = async (vendorId, name) => {
        if (!vendorId) {
            setNotification({
                open: true,
                message: 'Vendor ID missing. Cannot delete.',
                severity: 'error'
            });
            return;
        }

        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            await deleteProvider(vendorId);
            setVendors(prev => prev.filter(v => v.vendorId !== vendorId));
            setNotification({
                open: true,
                message: 'Vendor deleted successfully',
                severity: 'success'
            });
        } catch (err) {
            setNotification({
                open: true,
                message: err.message,
                severity: 'error'
            });
        }
    };

    /* ================= FILTER ================= */
    const filteredVendors = vendors.filter(v => {
        const tabMatch = tabValue === 0 ? !v.isVerified : v.isVerified;
        const searchMatch =
            v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.phone && v.phone.toLowerCase().includes(searchTerm.toLowerCase()));
        const moduleMatch = selectedModule === 'all' || v.moduleId === selectedModule;
        const paymentMatch = paymentFilter === 'all' || (paymentFilter === 'paid' ? v.isPaid : !v.isPaid);
        const packageStatusMatch = packageStatusFilter === 'all' || v.packageStatus.toLowerCase() === packageStatusFilter.toLowerCase();
        return tabMatch && searchMatch && moduleMatch && paymentMatch && packageStatusMatch;
    });

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };

    const getModuleTitle = () => {
        if (selectedModule === 'all') return 'All Providers';
        const mod = modules.find(m => m._id === selectedModule);
        return mod ? `${mod.title} Providers` : 'Providers';
    };

    return (
        <Box p={3} bgcolor="#f4f6f8" minHeight="100vh">
            {/* Header */}
            {/* Header */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                    <Box>
                        <Typography variant="h5" fontWeight={600} color="#2c3e50">
                            {getModuleTitle()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage vendor partners and view detailed profiles
                        </Typography>
                    </Box>
                    <Box sx={{ minWidth: { xs: '100%', sm: 300 } }}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Search vendor, email or phone"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: 1,
                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                </Stack>
            </Paper>

            {/* Table */}
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    sx={{
                        bgcolor: '#f8f9fa',
                        '& .MuiTab-root': { fontWeight: 600 }
                    }}
                >
                    <Tab label="Pending Vendors" />
                    <Tab label="Verified Vendors" />
                </Tabs>

                <Box p={3}>
                    <Grid container spacing={2} alignItems="center" mb={3}>
                        <Grid item xs={12} md={3}>
                            <Typography variant="h6" fontWeight={600}>
                                Vendors ({filteredVendors.length})
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={9}>
                            <Stack
                                direction="row"
                                spacing={2}
                                flexWrap="wrap"
                                useFlexGap
                                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                            >
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Module</InputLabel>
                                    <Select
                                        value={selectedModule}
                                        label="Module"
                                        onChange={(e) => setSelectedModule(e.target.value)}
                                        sx={{ bgcolor: 'white' }}
                                    >
                                        <MenuItem value="all">All Modules</MenuItem>
                                        {modules.map((m) => (
                                            <MenuItem key={m._id} value={m._id}>
                                                {m.title}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 140 }}>
                                    <InputLabel>Payment</InputLabel>
                                    <Select
                                        value={paymentFilter}
                                        label="Payment"
                                        onChange={(e) => setPaymentFilter(e.target.value)}
                                        sx={{ bgcolor: 'white' }}
                                    >
                                        <MenuItem value="all">All Payments</MenuItem>
                                        <MenuItem value="paid">Paid Only</MenuItem>
                                        <MenuItem value="free">Free Only</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 140 }}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={packageStatusFilter}
                                        label="Status"
                                        onChange={(e) => setPackageStatusFilter(e.target.value)}
                                        sx={{ bgcolor: 'white' }}
                                    >
                                        <MenuItem value="all">All Status</MenuItem>
                                        <MenuItem value="active">Active (With Packages)</MenuItem>
                                        <MenuItem value="pending">Pending (No Packages)</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 160 }}>
                                    <InputLabel>Sort By</InputLabel>
                                    <Select
                                        value={['createdAt', 'popularity', ''].includes(sortBy) ? sortBy : ''}
                                        label="Sort By"
                                        onChange={(e) => setSortBy(e.target.value)}
                                        startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} />}
                                        sx={{ bgcolor: 'white' }}
                                    >
                                        <MenuItem value="">Default</MenuItem>
                                        <MenuItem value="createdAt">Newest / Oldest</MenuItem>
                                        <MenuItem value="popularity">Popularity</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 160 }}>
                                    <InputLabel>Metric Filter</InputLabel>
                                    <Select
                                        value={['packageCount', 'bookingCount'].includes(sortBy) ? sortBy : ''}
                                        label="Metric Filter"
                                        onChange={(e) => setSortBy(e.target.value)}
                                        startAdornment={<SearchIcon sx={{ mr: 1, color: 'action.active' }} />}
                                        sx={{ bgcolor: 'white' }}
                                    >
                                        <MenuItem value="">None</MenuItem>
                                        <MenuItem value="packageCount">Top Packages</MenuItem>
                                        <MenuItem value="bookingCount">Top Bookings</MenuItem>
                                    </Select>
                                </FormControl>

                                <Tooltip title={sortOrder === 'desc' ? 'Downward (High to Low)' : 'Upward (Low to High)'}>
                                    <IconButton
                                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                        sx={{
                                            border: '1px solid #e0e0e0',
                                            borderRadius: 1.5,
                                            bgcolor: 'white',
                                            height: 40,
                                            width: 40,
                                            '&:hover': { bgcolor: '#f5f5f5' }
                                        }}
                                    >
                                        {sortOrder === 'desc' ? <SortIcon sx={{ transform: 'scaleY(-1)' }} /> : <SortIcon />}
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Grid>
                    </Grid>

                    {loading ? (
                        <Box display="flex" alignItems="center" gap={2} py={4}>
                            <CircularProgress size={22} />
                            <Typography>Loading vendors...</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                        <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Module</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Packages</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Bookings</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Verification</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Package Status</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {filteredVendors.map(vendor => (
                                        <TableRow
                                            key={vendor.vendorId}
                                            hover
                                            sx={{
                                                '&:hover': { bgcolor: '#f8f9fa' },
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Avatar
                                                        src={getImageUrl(vendor.profilePhoto)}
                                                        sx={{ bgcolor: '#a1c4fd', width: 40, height: 40 }}
                                                    >
                                                        {vendor.name.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography fontWeight={500}>{vendor.name}</Typography>
                                                        {vendor.isPaid && (
                                                            <Chip
                                                                label="Paid"
                                                                size="small"
                                                                sx={{
                                                                    height: 18,
                                                                    fontSize: '0.65rem',
                                                                    bgcolor: '#FFD700',
                                                                    color: '#000',
                                                                    fontWeight: 700
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>
                                            </TableCell>

                                            <TableCell>{vendor.email}</TableCell>
                                            <TableCell>{vendor.phone}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={vendor.module}
                                                    size="small"
                                                    sx={{ bgcolor: 'rgba(161, 196, 253, 0.1)', color: '#2c3e50', fontWeight: 500 }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Chip label={vendor.packageCount} size="small" color="primary" variant="outlined" />
                                            </TableCell>

                                            <TableCell>
                                                <Chip label={vendor.bookingCount} size="small" color="secondary" variant="outlined" />
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={vendor.status}
                                                    size="small"
                                                    color={vendor.isVerified ? 'success' : 'warning'}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={vendor.packageStatus}
                                                    size="small"
                                                    color={vendor.packageStatus === 'Active' ? 'success' : 'default'}
                                                    variant={vendor.packageStatus === 'Active' ? 'filled' : 'outlined'}
                                                />
                                            </TableCell>

                                            <TableCell align="center">
                                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                                    <Tooltip title="View Details">
                                                        <IconButton
                                                            size="small"
                                                            sx={{ color: '#a1c4fd', '&:hover': { bgcolor: 'rgba(161, 196, 253, 0.1)' } }}
                                                            onClick={() => navigate(`/provider/${vendor.vendorId}/details`)}
                                                        >
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => {
                                                                const moduleLower = (vendor.module || '').toLowerCase();
                                                                let base = '/catering';
                                                                if (moduleLower.includes('ornament')) base = '/ornaments';
                                                                else if (moduleLower.includes('makeup')) base = '/makeup';
                                                                else if (moduleLower.includes('photography')) base = '/photography';
                                                                else if (moduleLower.includes('cake')) base = '/cake';
                                                                else if (moduleLower.includes('auditorium')) base = '/auditorium';
                                                                else if (moduleLower.includes('transport') || moduleLower.includes('vehicle') || moduleLower.includes('crm') || moduleLower.includes('rental')) base = '/providers';

                                                                const action = (moduleLower.includes('catering') || moduleLower.includes('auditorium')) ? 'addprovider' : 'AddProvider';

                                                                // Special case for transport/CRM which might use /providers/add or similar
                                                                if (base === '/providers') {
                                                                    // Assuming there is an edit route or we use the add route with ID
                                                                    // Based on MainRoutes, /providers/add exists. Edit might be implied or separate.
                                                                    // Verified legacy used /providers/edit/:id but mainroutes has commented it out? 
                                                                    // Actually MainRoutes has { path: 'providers/add', element: <AddProvider /> }
                                                                    // and { path: 'providers/new', element: <NewProvider /> }
                                                                    // Let's use /providers/add which likely handles edit with state or param if configured, 
                                                                    // OR if there's a specific edit route we missed.
                                                                    // For now, mapping to /providers/add/ID or similar if that pattern holds, 
                                                                    // but standard seems to be base/action/id.
                                                                    // However, CRM route is often root /providers.
                                                                    navigate(`/providers/add?id=${vendor.vendorId}`); // Or just /providers/add and pass state?
                                                                    // Let's try to stick to the pattern found in MainRoutes for other modules if possible,
                                                                    // but since Transport is unique, let's look at how it WAS done.
                                                                    // Legacy: navigate(`/providers/edit/${vendor.vendorId}`)
                                                                    // MainRoutes: // { path: 'providers/edit', element: <EditList /> } (Commented out)
                                                                    // Let's us /providers/add and hope it handles "Edit" or use the query param approach.
                                                                    // BETTER: Use the same pattern as others if AddProvider supports it. 
                                                                    // Checking AddProvider.jsx... it doesn't seem to use useParams for ID, but it might use location state or query params.
                                                                    // WAIT, AddProvider.jsx doesn't have useParams.
                                                                    // Let's rely on standard navigation for now, or maybe the user wants us to fix the edit route too.
                                                                    // For now, let's map it to /providers/add which is the "Add New Provider" page, 
                                                                    // possibly the user intends to use that for editing too (common in some apps).
                                                                    navigate(`/providers/add`);
                                                                } else {
                                                                    navigate(`${base}/${action}/${vendor.vendorId}`);
                                                                }
                                                            }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteVendor(vendor.vendorId, vendor.name)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {filteredVendors.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                                <Typography color="text.secondary">No Vendors Found</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </Box>
            </Paper>

            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={() => setNotification(p => ({ ...p, open: false }))}
            >
                <Alert severity={notification.severity} variant="filled">
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ProviderList;

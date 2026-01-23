import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Avatar,
    Chip,
    IconButton,
    Card,
    CardContent,
    CardMedia,
    Divider,
    CircularProgress,
    Alert,
    Skeleton,
    Stack,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationOnIcon,
    Verified as VerifiedIcon,
    Category as CategoryIcon,
    LocalOffer as LocalOfferIcon,
    ShoppingCart as ShoppingCartIcon,
    TrendingUp as TrendingUpIcon,
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    Twitter as TwitterIcon,
    Language as LanguageIcon,
    CheckCircle as CheckCircleIcon,
    CalendarToday as CalendarTodayIcon,
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    Receipt as ReceiptIcon,
    BarChart as BarChartIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import Chart from 'react-apexcharts';
import { getProviderDetails, deleteProvider, getImageUrl } from '../api/providerApi';

function ProviderDetailsView() {
    const { providerId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('overview');
    const [providerData, setProviderData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [bookingSort, setBookingSort] = useState('latest');

    useEffect(() => {
        fetchProviderDetails();
    }, [providerId]);

    const fetchProviderDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getProviderDetails(providerId);
            setProviderData(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this provider?')) return;

        try {
            await deleteProvider(providerId);
            navigate(-1);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', height: '100vh' }}>
                <Box sx={{ width: 280, p: 2 }}>
                    <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 2 }} />
                </Box>
                <Box sx={{ flex: 1, p: 3 }}>
                    <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 3, mb: 3 }} />
                    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
            </Box>
        );
    }

    if (!providerData) return null;

    const { profile, packages, bookings, stats } = providerData;
    const user = profile.user;
    const vendorProfile = profile.vendorProfile;
    const coverImage = getImageUrl(profile.banner);
    const logo = getImageUrl(profile.logo);

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: <DashboardIcon /> },
        { id: 'packages', label: 'Packages', count: packages?.length || 0, icon: <InventoryIcon /> },
        { id: 'bookings', label: 'Bookings', count: bookings?.length || 0, icon: <ReceiptIcon /> },
        { id: 'stats', label: 'Statistics', icon: <BarChartIcon /> },
    ];

    const filteredPackages = packages?.filter(pkg => {
        const name = pkg.name || pkg.packageTitle || pkg.title || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

    const filteredBookings = (bookings?.filter(booking => {
        const customerName = `${booking.userId?.firstName || ''} ${booking.userId?.lastName || ''}`;
        return customerName.toLowerCase().includes(searchTerm.toLowerCase());
    }) || []).sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return bookingSort === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8f9fa', overflow: 'hidden' }}>
            {/* Sidebar */}
            <Box
                sx={{
                    width: 280,
                    bgcolor: 'white',
                    borderRight: '1px solid #e0e0e0',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                }}
            >
                {/* Provider Avatar & Name */}
                <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                            src={logo}
                            sx={{
                                width: 56,
                                height: 56,
                                bgcolor: '#667eea',
                            }}
                        >
                            {user?.firstName?.charAt(0) || 'P'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" fontWeight={700} noWrap>
                                {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Provider'}
                            </Typography>
                            {vendorProfile?.isVerified && (
                                <Chip
                                    icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                                    label="Verified"
                                    size="small"
                                    color="success"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                            )}
                        </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => navigate(-1)} sx={{ bgcolor: '#f5f5f5' }}>
                            <ArrowBackIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => navigate(`/providers/edit/${providerId}`)} sx={{ bgcolor: '#f5f5f5' }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={handleDelete} sx={{ bgcolor: '#ffebee', color: 'error.main' }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Box>

                {/* Navigation Menu */}
                <List sx={{ flex: 1, py: 2 }}>
                    {menuItems.map((item) => (
                        <ListItemButton
                            key={item.id}
                            selected={activeSection === item.id}
                            onClick={() => setActiveSection(item.id)}
                            sx={{
                                mx: 1.5,
                                mb: 0.5,
                                borderRadius: 1.5,
                                '&.Mui-selected': {
                                    bgcolor: '#667eea',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: '#5568d3',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                    '& .MuiChip-root': {
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                    }
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                            />
                            {item.count !== undefined && (
                                <Chip
                                    label={item.count}
                                    size="small"
                                    sx={{
                                        height: 22,
                                        minWidth: 22,
                                        fontSize: '0.75rem',
                                        fontWeight: 700
                                    }}
                                />
                            )}
                        </ListItemButton>
                    ))}
                </List>

                {/* Contact Info */}
                <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1.5}>
                        CONTACT
                    </Typography>
                    <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                            <EmailIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.3 }} />
                            <Typography variant="caption" sx={{ wordBreak: 'break-word', lineHeight: 1.4 }}>
                                {user?.email || 'N/A'}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="caption">
                                {user?.phone || 'N/A'}
                            </Typography>
                        </Box>
                        {vendorProfile?.storeAddress?.fullAddress && (
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.3 }} />
                                <Typography variant="caption" sx={{ wordBreak: 'break-word', lineHeight: 1.4 }}>
                                    {vendorProfile.storeAddress.fullAddress}
                                </Typography>
                            </Box>
                        )}
                    </Stack>

                    {/* Social Links */}
                    {profile.profile?.socialLinks && Object.keys(profile.profile.socialLinks).length > 0 && (
                        <Stack direction="row" spacing={0.5} sx={{ mt: 2 }}>
                            {profile.profile.socialLinks.facebook && (
                                <IconButton
                                    component="a"
                                    href={profile.profile.socialLinks.facebook}
                                    target="_blank"
                                    size="small"
                                    sx={{ bgcolor: '#1877f2', color: 'white', '&:hover': { bgcolor: '#145dbf' } }}
                                >
                                    <FacebookIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            )}
                            {profile.profile.socialLinks.instagram && (
                                <IconButton
                                    component="a"
                                    href={profile.profile.socialLinks.instagram}
                                    target="_blank"
                                    size="small"
                                    sx={{
                                        background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                                        color: 'white'
                                    }}
                                >
                                    <InstagramIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            )}
                            {profile.profile.socialLinks.twitter && (
                                <IconButton
                                    component="a"
                                    href={profile.profile.socialLinks.twitter}
                                    target="_blank"
                                    size="small"
                                    sx={{ bgcolor: '#1da1f2', color: 'white', '&:hover': { bgcolor: '#1a8cd8' } }}
                                >
                                    <TwitterIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            )}
                            {profile.profile.socialLinks.website && (
                                <IconButton
                                    component="a"
                                    href={profile.profile.socialLinks.website}
                                    target="_blank"
                                    size="small"
                                    sx={{ bgcolor: '#667eea', color: 'white', '&:hover': { bgcolor: '#5568d3' } }}
                                >
                                    <LanguageIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            )}
                        </Stack>
                    )}
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Banner */}
                <Box
                    sx={{
                        height: 220,
                        background: coverImage
                            ? `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%), url(${coverImage})`
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'flex-end',
                        p: 3,
                    }}
                >
                    <Box>
                        <Typography variant="h4" fontWeight={800} color="white" gutterBottom>
                            {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Provider'}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            {vendorProfile?.module && (
                                <Chip
                                    icon={<CategoryIcon />}
                                    label={vendorProfile.module.title}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 600 }}
                                />
                            )}
                            {vendorProfile?.zone && (
                                <Chip
                                    icon={<LocationOnIcon />}
                                    label={vendorProfile.zone.name}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 600 }}
                                />
                            )}
                        </Stack>
                    </Box>
                </Box>

                {/* Content Area */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                    {/* Overview Section */}
                    {activeSection === 'overview' && (
                        <Box>
                            {vendorProfile?.bio && (
                                <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight={700} gutterBottom>
                                        {vendorProfile.bio.title || 'About Us'}
                                    </Typography>
                                    {vendorProfile.bio.subtitle && (
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            {vendorProfile.bio.subtitle}
                                        </Typography>
                                    )}
                                    {vendorProfile.bio.description && (
                                        <Typography variant="body2" sx={{ mt: 2, lineHeight: 1.8 }}>
                                            {vendorProfile.bio.description}
                                        </Typography>
                                    )}
                                </Paper>
                            )}

                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Business Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6} md={3}>
                                    <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Business Name
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {vendorProfile?.storeName || 'N/A'}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Module
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {vendorProfile?.module?.title || 'N/A'}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Zone
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {vendorProfile?.zone?.name || 'N/A'}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Status
                                        </Typography>
                                        <Chip
                                            label={vendorProfile?.isVerified ? 'Verified' : 'Pending'}
                                            size="small"
                                            color={vendorProfile?.isVerified ? 'success' : 'warning'}
                                            sx={{ mt: 0.5 }}
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* Packages Section */}
                    {activeSection === 'packages' && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight={700}>
                                    Packages ({filteredPackages.length})
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="Search packages..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    sx={{ width: 250 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            {filteredPackages.length > 0 ? (
                                <Grid container spacing={2}>
                                    {filteredPackages.map((pkg, index) => {
                                        let packageImageRaw = pkg.thumbnail || pkg.featuredImage || pkg.images?.[0] || pkg.gallery?.[0] || pkg.galleryImages?.[0];

                                        // Fix for Transport module missing /uploads/vehicles/ prefix
                                        const isTransport = vendorProfile?.module?.title === 'Transport' || vendorProfile?.module?.slug === 'transport';
                                        if (isTransport && packageImageRaw && !packageImageRaw.includes('uploads')) {
                                            packageImageRaw = `/uploads/vehicles/${packageImageRaw.startsWith('/') ? packageImageRaw.substring(1) : packageImageRaw}`;
                                        }

                                        const packageImage = getImageUrl(packageImageRaw);
                                        return (
                                            <Grid item xs={12} sm={6} md={4} key={index}>
                                                <Card
                                                    elevation={0}
                                                    sx={{
                                                        height: '100%',
                                                        border: '1px solid #e0e0e0',
                                                        borderRadius: 2,
                                                        transition: 'all 0.3s',
                                                        '&:hover': {
                                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                            transform: 'translateY(-4px)',
                                                        }
                                                    }}
                                                >
                                                    <CardMedia
                                                        component="img"
                                                        height="160"
                                                        image={packageImage || 'https://via.placeholder.com/400x300?text=No+Image'}
                                                        alt={pkg.name || pkg.packageTitle || pkg.title}
                                                        sx={{ objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                                        }}
                                                    />
                                                    <CardContent sx={{ p: 2 }}>
                                                        <Chip
                                                            label={pkg.type || 'Package'}
                                                            size="small"
                                                            sx={{ mb: 1, height: 20, fontSize: '0.7rem' }}
                                                        />
                                                        <Typography variant="subtitle2" fontWeight={700} gutterBottom noWrap>
                                                            {pkg.name || pkg.packageTitle || pkg.title || 'Package'}
                                                        </Typography>
                                                        {pkg.pricing?.basePrice && (
                                                            <Typography variant="h6" color="primary" fontWeight={800}>
                                                                AED {pkg.pricing.basePrice}
                                                            </Typography>
                                                        )}
                                                        {pkg.isActive !== undefined && (
                                                            <Chip
                                                                icon={pkg.isActive ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : null}
                                                                label={pkg.isActive ? 'Active' : 'Inactive'}
                                                                size="small"
                                                                color={pkg.isActive ? 'success' : 'default'}
                                                                sx={{ mt: 1, height: 20, fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            ) : (
                                <Alert severity="info">No packages found.</Alert>
                            )}
                        </Box>
                    )}

                    {/* Bookings Section */}
                    {activeSection === 'bookings' && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight={700}>
                                    Bookings ({filteredBookings.length})
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Date</InputLabel>
                                        <Select
                                            value={bookingSort}
                                            label="Date"
                                            onChange={(e) => setBookingSort(e.target.value)}
                                        >
                                            <MenuItem value="latest">Latest First</MenuItem>
                                            <MenuItem value="oldest">Oldest First</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        size="small"
                                        placeholder="Search bookings..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        sx={{ width: 250 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Stack>
                            </Box>

                            {filteredBookings.length > 0 ? (
                                <Grid container spacing={2}>
                                    {filteredBookings.map((booking, index) => (
                                        <Grid item xs={12} md={6} key={booking._id || index}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2.5,
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: 2,
                                                    transition: 'all 0.3s',
                                                    '&:hover': {
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: booking.status === 'confirmed' ? 'success.main' :
                                                                booking.status === 'pending' ? 'warning.main' : 'error.main',
                                                            width: 44,
                                                            height: 44,
                                                        }}
                                                    >
                                                        <ShoppingCartIcon />
                                                    </Avatar>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                                                            {booking.userId?.firstName} {booking.userId?.lastName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            {booking.moduleId?.title || 'Booking'}
                                                        </Typography>
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
                                                            <Chip
                                                                label={booking.status}
                                                                size="small"
                                                                color={
                                                                    booking.status === 'confirmed' ? 'success' :
                                                                        booking.status === 'pending' ? 'warning' : 'error'
                                                                }
                                                                sx={{ height: 20, fontSize: '0.7rem' }}
                                                            />
                                                            <Chip
                                                                icon={<CalendarTodayIcon sx={{ fontSize: 12 }} />}
                                                                label={new Date(booking.createdAt).toLocaleDateString()}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ height: 20, fontSize: '0.7rem' }}
                                                            />
                                                            {booking.totalPrice && (
                                                                <Typography variant="subtitle2" fontWeight={800} color="primary">
                                                                    AED {booking.totalPrice}
                                                                </Typography>
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Alert severity="info">No bookings found.</Alert>
                            )}
                        </Box>
                    )}

                    {/* Stats Section */}
                    {activeSection === 'stats' && (
                        <Box>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h4" fontWeight={800} color="#1e293b" gutterBottom>
                                    Business Analytics
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Deep dive into your performance metrics and growth over time
                                </Typography>
                            </Box>
                            {/* Stat Summary Cards */}
                            <Grid container spacing={3} mb={4}>
                                {[
                                    { title: 'Total Revenue', value: `AED ${stats?.totalRevenue || 0}`, icon: <TrendingUpIcon />, gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', textColor: '#ffffff' },
                                    { title: 'Total Packages', value: stats?.totalPackages || 0, icon: <InventoryIcon />, gradient: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)', textColor: '#ffffff' },
                                    { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: <ReceiptIcon />, gradient: 'linear-gradient(135deg, #701a75 0%, #d946ef 100%)', textColor: '#ffffff' },
                                    { title: 'Average Rating', value: stats?.avgRating || '4.8', icon: <VerifiedIcon />, gradient: 'linear-gradient(135deg, #7c2d12 0%, #f97316 100%)', textColor: '#ffffff' },
                                ].map((stat, i) => (
                                    <Grid item xs={12} sm={6} md={3} key={i}>
                                        <Paper
                                            elevation={4}
                                            sx={{
                                                p: 3,
                                                borderRadius: 4,
                                                background: stat.gradient,
                                                color: stat.textColor,
                                                position: 'relative',
                                                overflow: 'hidden',
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-8px)',
                                                    boxShadow: '0 12px 48px rgba(0,0,0,0.2)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ position: 'relative', zIndex: 2 }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        fontWeight: 700,
                                                        letterSpacing: 1.2,
                                                        textTransform: 'uppercase',
                                                        fontSize: '0.72rem',
                                                        mb: 1,
                                                        color: '#ffffff'
                                                    }}
                                                >
                                                    {stat.title}
                                                </Typography>
                                                <Typography variant="h3" fontWeight={800} sx={{ mb: 1, letterSpacing: -1, color: '#ffffff' }}>
                                                    {stat.value}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            bgcolor: 'rgba(255,255,255,0.2)',
                                                            px: 1,
                                                            py: 0.3,
                                                            borderRadius: 10
                                                        }}
                                                    >
                                                        <TrendingUpIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                        <Typography variant="caption" fontWeight={700}>+12%</Typography>
                                                    </Box>
                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#ffffff' }}>vs last month</Typography>
                                                </Box>
                                            </Box>
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    right: -15,
                                                    bottom: -15,
                                                    opacity: 0.15,
                                                    transform: 'rotate(-10deg)',
                                                    zIndex: 1
                                                }}
                                            >
                                                {React.cloneElement(stat.icon, { sx: { fontSize: 100 } })}
                                            </Box>
                                            {/* Decorative gloss effect */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '-50%',
                                                    left: '-50%',
                                                    width: '200%',
                                                    height: '200%',
                                                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Graphs */}
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 4 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                            <Typography variant="h6" fontWeight={700}>Booking Trends</Typography>
                                            <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
                                                <Select defaultValue="this-year" size="small">
                                                    <MenuItem value="this-year">This Year</MenuItem>
                                                    <MenuItem value="last-year">Last Year</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Chart
                                            options={{
                                                chart: { id: 'booking-chart', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'Poppins, sans-serif' },
                                                stroke: { curve: 'smooth', width: 3 },
                                                colors: ['#667eea', '#f093fb'],
                                                fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 90, 100] } },
                                                dataLabels: { enabled: false },
                                                xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
                                                grid: { borderColor: '#f1f1f1' }
                                            }}
                                            series={[
                                                { name: 'Bookings', data: [31, 40, 28, 51, 42, 109, 100, 80, 70, 90, 110, 95] },
                                                { name: 'Views', data: [11, 32, 45, 32, 34, 52, 41, 60, 50, 75, 80, 85] }
                                            ]}
                                            type="area"
                                            height={350}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 4, height: '100%' }}>
                                        <Typography variant="h6" fontWeight={700} gutterBottom>Category Distribution</Typography>
                                        <Chart
                                            options={{
                                                chart: { id: 'category-pie' },
                                                labels: ['Active', 'Pending', 'Inactive'],
                                                colors: ['#00b09b', '#faba2a', '#ff5252'],
                                                legend: { position: 'bottom' },
                                                plotOptions: { pie: { donut: { size: '65%' } } }
                                            }}
                                            series={[packages?.filter(p => p.isActive).length || 5, 2, 1]}
                                            type="donut"
                                            height={350}
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default ProviderDetailsView;

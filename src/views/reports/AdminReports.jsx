import { useEffect, useState } from 'react';
import axios from 'axios';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Grid,
    Typography,
    Box,
    Card,
    CardContent,
    useMediaQuery,
    Stack,
    Chip,
    Avatar,
    LinearProgress
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { API_BASE_URL } from '../../utils/apiImageUtils';

// assets
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

// ==============================|| ADMIN REPORTS DASHBOARD ||============================== //

const AdminReports = () => {
    const theme = useTheme();
    const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/reports/admin/all-around`);
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching admin report:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    const ReportCard = ({ title, value, icon: Icon, color, subtitle }) => (
        <Card sx={{ 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: theme.palette.divider,
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
            '&:after': {
                content: '""',
                position: 'absolute',
                width: 210,
                height: 210,
                background: `linear-gradient(210.04deg, ${color} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
                borderRadius: '50%',
                top: -125,
                right: -15,
                opacity: 0.1
            }
        }}>
            <CardContent>
                <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Avatar variant="rounded" sx={{ 
                            bgcolor: color + '20', 
                            color: color, 
                            width: 48, 
                            height: 48 
                        }}>
                            <Icon />
                        </Avatar>
                        <Chip size="small" label="Live" color="success" sx={{ height: 20, bgcolor: theme.palette.success.light, color: theme.palette.success.dark }} />
                    </Box>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>
                            {value}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
                            {title}
                        </Typography>
                    </Box>
                    {subtitle && (
                        <Typography variant="caption" sx={{ color: color, fontWeight: 600, mt: 1 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );

    if (isLoading) return <LinearProgress color="secondary" />;

    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        System Analytics Overview
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        Platform-wide performance and engagement metrics
                    </Typography>
                </Box>
            </Grid>

            {/* Summary Row */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ReportCard 
                    title="Total Customers" 
                    value={data?.platform?.users || 0} 
                    icon={PeopleAltOutlinedIcon} 
                    color={theme.palette.secondary.main} 
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ReportCard 
                    title="Approved Vendors" 
                    value={data?.platform?.activeVendors || 0} 
                    icon={StorefrontOutlinedIcon} 
                    color={theme.palette.primary.main} 
                    subtitle={`${data?.platform?.pendingApproval || 0} Pending Approval`}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ReportCard 
                    title="Main Modules" 
                    value={data?.platform?.primaryModules || 0} 
                    icon={ReceiptLongOutlinedIcon} 
                    color={theme.palette.warning.main} 
                    subtitle={`${data?.platform?.secondaryModules || 0} Secondary Services`}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ReportCard 
                    title="System Revenue" 
                    value={`₹ ${data?.totalSubsRevenue?.toLocaleString() || 0}`} 
                    icon={AccountBalanceWalletOutlinedIcon} 
                    color={theme.palette.success.main} 
                    subtitle={`${data?.platform?.platformPackages || 0} Live Packages`}
                />
            </Grid>

            {/* Detailed Stats */}
            <Grid size={{ xs: 12, md: 8 }}>
                <MainCard title="Booking Lifecycle Analytics">
                    <Grid container spacing={2}>
                        {data?.bookings?.map((item, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                <Box sx={{ 
                                    p: 2, 
                                    border: '1px solid', 
                                    borderColor: 'divider', 
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <Typography variant="h4" color={
                                        item._id === 'Completed' ? 'success.main' : 
                                        item._id === 'Cancelled' ? 'error.main' : 
                                        'primary.main'
                                    }>
                                        {item.count}
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ mt: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>
                                        {item._id || 'Draft'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        Revenue: ₹ {item.revenue.toLocaleString()}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </MainCard>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <MainCard title="Platform Distribution">
                    <Stack spacing={3}>
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2">User to Vendor Ratio</Typography>
                                <Typography variant="caption" fontWeight={600}>
                                    {((data?.platform?.activeVendors / data?.platform?.users) * 100 || 0).toFixed(1)}%
                                </Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={(data?.platform?.activeVendors / data?.platform?.users) * 100 || 0} 
                                color="secondary" 
                            />
                        </Box>
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2">Conversion Success</Typography>
                                <Typography variant="caption" fontWeight={600}>
                                    {(data?.bookings?.find(b => b._id === 'Completed')?.count / data?.bookings?.reduce((a,b) => a+b.count, 0) * 100 || 0).toFixed(1)}%
                                </Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={data?.bookings?.find(b => b._id === 'Completed')?.count / data?.bookings?.reduce((a,b) => a+b.count, 0) * 100 || 0} 
                                color="success" 
                            />
                        </Box>
                    </Stack>
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default AdminReports;

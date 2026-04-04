import { useEffect, useState } from 'react';
import axios from 'axios';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Grid,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    LinearProgress,
    Stack,
    IconButton,
    Tooltip,
    Avatar
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { API_BASE_URL } from '../../utils/apiImageUtils';

// assets
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';

// ==============================|| ACCOUNT REPORTS DASHBOARD ||============================== //

const AccountReports = () => {
    const theme = useTheme();
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/reports/admin/payments`);
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching account report:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    const SummaryCard = ({ title, amount, icon: Icon, color }) => (
        <Paper elevation={0} sx={{ 
            p: 3, 
            bgcolor: color + '08', 
            border: '1px solid', 
            borderColor: color + '20',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Box sx={{ 
                position: 'absolute', 
                right: -20, 
                top: -20, 
                width: 120, 
                height: 120, 
                bgcolor: color + '10', 
                borderRadius: '50%' 
            }} />
            <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: color, color: '#fff', width: 48, height: 48 }}>
                    <Icon />
                </Avatar>
                <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>
                        {title}
                    </Typography>
                    <Typography variant="h3" fontWeight={700}>
                        AED {amount?.toLocaleString()}
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );

    if (isLoading) return <LinearProgress color="secondary" />;

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Box>
                        <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            Financial Performance Report
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                            Consolidated view of subscriptions and booking revenue
                        </Typography>
                    </Box>
                    <Tooltip title="Export to PDF">
                        <IconButton color="secondary" sx={{ p: 1.5, border: '1px solid', borderColor: 'divider' }}>
                            <FileDownloadOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Grid>

            {/* Financial Summary */}
            <Grid item xs={12} md={4}>
                <SummaryCard 
                    title="Total Consolidated Revenue" 
                    amount={data?.summary?.totalRevenue || 0} 
                    icon={AccountBalanceOutlinedIcon} 
                    color={theme.palette.secondary.main} 
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <SummaryCard 
                    title="Direct Booking Earning" 
                    amount={data?.summary?.bookingRevenue || 0} 
                    icon={MonetizationOnOutlinedIcon} 
                    color={theme.palette.success.main} 
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <SummaryCard 
                    title="Subscription Payouts" 
                    amount={data?.summary?.subscriptionRevenue || 0} 
                    icon={RequestQuoteOutlinedIcon} 
                    color={theme.palette.primary.main} 
                />
            </Grid>

            {/* Monthly Trend Table */}
            <Grid item xs={12} md={7}>
                <MainCard title="Yearly Revenue Trend">
                    <TableContainer sx={{ maxHeight: 400 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Month</TableCell>
                                    <TableCell>Revenue (AED)</TableCell>
                                    <TableCell align="center">Orders</TableCell>
                                    <TableCell align="right">Success Rate</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.monthlyBreakdown?.map((row, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{`${row._id.month}/${row._id.year}`}</TableCell>
                                        <TableCell>AED {row.revenue.toLocaleString()}</TableCell>
                                        <TableCell align="center">{row.orders}</TableCell>
                                        <TableCell align="right">
                                            <Chip 
                                                size="small" 
                                                label="Target Met" 
                                                color="success" 
                                                variant="outlined" 
                                                sx={{ fontSize: 10, height: 20 }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!data?.monthlyBreakdown || data?.monthlyBreakdown.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">No data found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </MainCard>
            </Grid>

            {/* Subscription vs Booking Distribution */}
            <Grid item xs={12} md={5}>
                <MainCard title="Revenue Distribution">
                    <Stack spacing={4}>
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2">Subscription Share</Typography>
                                <Typography variant="caption" fontWeight={700}>
                                    {((data?.summary?.subscriptionRevenue / data?.summary?.totalRevenue) * 100 || 0).toFixed(1)}%
                                </Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={(data?.summary?.subscriptionRevenue / data?.summary?.totalRevenue) * 100 || 0} 
                                sx={{ height: 8, borderRadius: 4 }}
                                color="primary" 
                            />
                        </Box>
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2">Booking Share</Typography>
                                <Typography variant="caption" fontWeight={700}>
                                    {((data?.summary?.bookingRevenue / data?.summary?.totalRevenue) * 100 || 0).toFixed(1)}%
                                </Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={(data?.summary?.bookingRevenue / data?.summary?.totalRevenue) * 100 || 0} 
                                sx={{ height: 8, borderRadius: 4 }}
                                color="success" 
                            />
                        </Box>
                    </Stack>
                </MainCard>
            </Grid>

            {/* Recent Transactions Table */}
            <Grid item xs={12}>
                <MainCard title="Recent Financial Transactions">
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Transaction ID</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Vendor</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.recentTransactions?.map((tx, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell sx={{ color: 'primary.main', fontWeight: 500 }}>{tx._id.substring(18).toUpperCase()}</TableCell>
                                        <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{tx.providerId?.firstName} {tx.providerId?.lastName}</TableCell>
                                        <TableCell>{tx.userId?.firstName} {tx.userId?.lastName}</TableCell>
                                        <TableCell>
                                            <Chip size="small" label="Completed" color="success" />
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>AED {tx.finalPrice.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                {(!data?.recentTransactions || data?.recentTransactions.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">No transactions found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default AccountReports;

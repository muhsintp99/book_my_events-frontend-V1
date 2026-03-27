import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, TextField, CircularProgress, Alert, IconButton, Tooltip,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid,
  Card, CardContent, Snackbar, Avatar, Tabs, Tab, FormControl, Select, MenuItem as MuiMenuItem,
  InputLabel
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  Category as CategoryIcon,
  AccessTime as AccessTimeIcon,
  Message as MessageIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Inbox as InboxIcon,
  QuestionAnswer as EnquiryIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { API_BASE_URL } from '../../utils/apiImageUtils';

/* ============ Premium Theme ============ */
const themeColors = {
  primary: '#2D3436',
  accent: '#E15B64',
  accentLight: '#FFF8F9',
  success: '#00B894',
  warning: '#FDCB6E',
  danger: '#D63031',
  background: '#F9FAFB',
  border: '#E2E8F0',
  textMain: '#2D3436',
  textSecondary: '#636E72',
  white: '#FFFFFF',
  gradientPrimary: 'linear-gradient(135deg, #E15B64 0%, #FD7272 100%)',
  gradientSuccess: 'linear-gradient(135deg, #00B894 0%, #55EFC4 100%)'
};

const HeaderStat = ({ label, value, icon, color, gradient }) => (
  <Box
    sx={{
      bgcolor: 'white', borderRadius: '18px', py: 2, px: 2.8,
      display: 'flex', alignItems: 'center', gap: 2.4, flex: 1, minWidth: '200px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'rgba(0,0,0,0.04)',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 25px rgba(0,0,0,0.06)' }
    }}
  >
    <Box
      sx={{
        width: 48, height: 48, borderRadius: '14px',
        background: gradient || `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: gradient ? '#FFFFFF' : color,
        boxShadow: gradient ? '0 4px 10px rgba(225, 91, 100, 0.2)' : 'none'
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 24 } })}
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.7rem' }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 900, color: themeColors.textMain, lineHeight: 1.1, fontSize: '1.35rem' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const DetailRow = ({ icon, label, value }) => (
  <Box display="flex" alignItems="center" gap={2} py={1.5}
    sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
    <Box sx={{
      width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(225,91,100,0.1)', color: themeColors.accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography fontWeight={500}>{value || 'N/A'}</Typography>
    </Box>
  </Box>
);

const AllEnquiries = () => {
  const [search, setSearch] = useState('');
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0); // 0 = All, 1 = Pending, 2 = Responded
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [moduleFilter, setModuleFilter] = useState('all');

  const fetchEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/enquiries`);
      const data = await res.json();

      if (data.success) {
        setEnquiries(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch enquiries');
      }
    } catch (err) {
      console.error('Fetch enquiries error:', err);
      setError('Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleDelete = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/enquiries/${enquiryId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setEnquiries(prev => prev.filter(e => e._id !== enquiryId));
        setNotification({ open: true, message: 'Enquiry deleted successfully', severity: 'success' });
      } else {
        setNotification({ open: true, message: 'Failed to delete enquiry', severity: 'error' });
      }
    } catch {
      setNotification({ open: true, message: 'Error deleting enquiry', severity: 'error' });
    }
  };

  const handleOpenChat = async (enquiry) => {
    setSelectedEnquiry(enquiry);
    setChatOpen(true);
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/enquiries/${enquiry._id}/messages`);
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.data || []);
      } else {
        setChatMessages([]);
      }
    } catch (err) {
      console.error('Fetch chat messages error:', err);
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedEnquiry) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: selectedEnquiry._id,
          senderId: 'admin',
          senderType: 'admin',
          message: newMessage.trim()
        })
      });
      const data = await res.json();
      if (data.success || data.data) {
        setChatMessages(prev => [...prev, data.data || { message: newMessage, senderType: 'admin', createdAt: new Date() }]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Send message error:', err);
      setNotification({ open: true, message: 'Failed to send message', severity: 'error' });
    } finally {
      setSendingMessage(false);
    }
  };

  // Filter by search
  const searchFiltered = enquiries.filter(e =>
    (e.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.contact || '').includes(search) ||
    (e.eventType || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.moduleId?.title || '').toLowerCase().includes(search.toLowerCase())
  );

  // Filter by module
  const moduleFiltered = moduleFilter === 'all'
    ? searchFiltered
    : searchFiltered.filter(e => {
        const mTitle = (e.moduleId?.title || '').toLowerCase();
        return mTitle === moduleFilter.toLowerCase();
      });

  // Filter by tab
  const filteredEnquiries = moduleFiltered.filter(e => {
    if (activeTab === 0) return true;
    if (activeTab === 1) return (e.status || 'pending').toLowerCase() === 'pending';
    if (activeTab === 2) return (e.status || '').toLowerCase() !== 'pending';
    return true;
  });

  const stats = {
    total: moduleFiltered.length,
    pending: moduleFiltered.filter(e => (e.status || 'pending').toLowerCase() === 'pending').length,
    resolved: moduleFiltered.filter(e => (e.status || '').toLowerCase() !== 'pending').length
  };

  // Get unique modules
  const moduleNames = [...new Set(enquiries.map(e => e.moduleId?.title).filter(Boolean))];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: themeColors.background, color: themeColors.textMain }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900, background: themeColors.gradientPrimary,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-1.1px', fontSize: { xs: '1.6rem', md: '2.3rem' }
            }}
          >
            {moduleFilter === 'all' ? 'All Module Enquiries' : `${moduleFilter} Enquiries`}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: themeColors.textSecondary, fontWeight: 600, mt: 0.2, fontSize: '0.88rem' }}>
            {moduleFilter === 'all'
              ? `View and manage enquiries across all modules • ${moduleNames.length} active modules`
              : `Showing enquiries for ${moduleFilter} module`
            }
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filter by Module</InputLabel>
            <Select
              value={moduleFilter}
              label="Filter by Module"
              onChange={(e) => setModuleFilter(e.target.value)}
              sx={{ borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <MuiMenuItem value="all">All Modules</MuiMenuItem>
              {moduleNames.map(name => (
                <MuiMenuItem key={name} value={name}>{name}</MuiMenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon fontSize="small" />}
            onClick={fetchEnquiries}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700,
              px: 2.2, height: 42, fontSize: '0.82rem',
              borderColor: themeColors.border, color: themeColors.textSecondary
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2.5, mb: 4, flexWrap: 'wrap' }}>
        <HeaderStat label="Total Enquiries" value={stats.total} icon={<EnquiryIcon />} color={themeColors.accent} gradient={themeColors.gradientPrimary} />
        <HeaderStat label="Pending" value={stats.pending} icon={<AccessTimeIcon />} color={themeColors.warning} />
        <HeaderStat label="Responded" value={stats.resolved} icon={<InboxIcon />} color={themeColors.success} gradient={themeColors.gradientSuccess} />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '14px' }}>{error}</Alert>}

      {/* Tabs + Search */}
      <Paper
        elevation={0}
        sx={{
          p: 1.8, mb: 3.5, borderRadius: '18px', border: '1px solid',
          borderColor: themeColors.border, bgcolor: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.85rem', minHeight: 40 },
              '& .Mui-selected': { color: themeColors.accent },
              '& .MuiTabs-indicator': { backgroundColor: themeColors.accent }
            }}
          >
            <Tab label={`All (${stats.total})`} />
            <Tab label={`Pending (${stats.pending})`} />
            <Tab label={`Responded (${stats.resolved})`} />
          </Tabs>
          <TextField
            placeholder="Search by name, email, module..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ color: themeColors.textSecondary, mr: 1, fontSize: 18 }} /> }}
            sx={{ width: { xs: '100%', sm: 350 }, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: themeColors.background, fontSize: '0.82rem' } }}
          />
        </Box>
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid', borderColor: themeColors.border, bgcolor: 'white' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '2px solid' + themeColors.border, py: 1.8 } }}>
                <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.78rem' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.78rem' }}>CUSTOMER</TableCell>
                <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.78rem' }}>MODULE</TableCell>
                <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.78rem' }}>EVENT TYPE</TableCell>
                <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.78rem' }}>VENDOR</TableCell>
                <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.78rem' }}>DATE</TableCell>
                <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.78rem' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 900, color: themeColors.textSecondary, fontSize: '0.78rem' }} align="center">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: themeColors.accent }} />
                    <Typography sx={{ mt: 2, color: themeColors.textSecondary, fontWeight: 600 }}>Loading enquiries...</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredEnquiries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <InboxIcon sx={{ fontSize: 48, color: themeColors.border, mb: 1 }} />
                    <Typography sx={{ color: themeColors.textSecondary, fontWeight: 600 }}>No enquiries found</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredEnquiries.map((e, i) => {
                const vendorName = e.vendorId
                  ? `${e.vendorId.firstName || ''} ${e.vendorId.lastName || ''}`.trim() || e.vendorId.email || 'Vendor'
                  : 'N/A';
                const statusColor = (e.status || 'pending').toLowerCase() === 'pending'
                  ? themeColors.warning
                  : themeColors.success;
                const moduleName = e.moduleId?.title || 'Unknown';

                return (
                  <TableRow key={e._id} hover sx={{ '& td': { py: 1.6 }, '&:hover': { bgcolor: '#F9FAFB' } }}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: themeColors.textSecondary, fontSize: '0.85rem' }}>
                        {i + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: themeColors.accent, fontSize: '0.85rem', fontWeight: 800 }}>
                          {(e.fullName || 'U')[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{e.fullName || 'N/A'}</Typography>
                          <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>{e.email || ''}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={moduleName}
                        size="small"
                        sx={{ fontWeight: 700, bgcolor: '#E3F2FD', color: '#1976D2', fontSize: '0.72rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={e.eventType || 'General'}
                        size="small"
                        sx={{ fontWeight: 700, bgcolor: themeColors.accentLight, color: themeColors.accent, fontSize: '0.72rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{vendorName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        {e.bookingDate ? new Date(e.bookingDate).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={(e.status || 'Pending').charAt(0).toUpperCase() + (e.status || 'pending').slice(1)}
                        size="small"
                        sx={{ fontWeight: 800, bgcolor: statusColor + '20', color: statusColor, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => { setSelectedEnquiry(e); setOpenModal(true); }}
                            sx={{ color: themeColors.accent }}>
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chat">
                          <IconButton size="small" onClick={() => handleOpenChat(e)}
                            sx={{ color: '#1976D2' }}>
                            <ChatIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(e._id)}
                            sx={{ color: themeColors.danger }}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Detail Dialog */}
      <Dialog open={openModal} onClose={() => { setOpenModal(false); setSelectedEnquiry(null); }}
        maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ background: themeColors.gradientPrimary, color: 'white', py: 2.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography fontWeight={800} fontSize="1.1rem">Enquiry Details</Typography>
            <IconButton onClick={() => { setOpenModal(false); setSelectedEnquiry(null); }} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedEnquiry && (
            <Grid container spacing={3} mt={0}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: '16px' }}>
                  <CardContent>
                    <Typography fontWeight={800} mb={2} color={themeColors.accent}>Customer Information</Typography>
                    <DetailRow icon={<PersonIcon fontSize="small" />} label="Full Name" value={selectedEnquiry.fullName} />
                    <DetailRow icon={<EmailIcon fontSize="small" />} label="Email" value={selectedEnquiry.email} />
                    <DetailRow icon={<PhoneIcon fontSize="small" />} label="Contact" value={selectedEnquiry.contact} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: '16px' }}>
                  <CardContent>
                    <Typography fontWeight={800} mb={2} color={themeColors.accent}>Booking Information</Typography>
                    <DetailRow icon={<CategoryIcon fontSize="small" />} label="Module" value={selectedEnquiry.moduleId?.title} />
                    <DetailRow icon={<CategoryIcon fontSize="small" />} label="Event Type" value={selectedEnquiry.eventType} />
                    <DetailRow icon={<EventIcon fontSize="small" />} label="Booking Date" value={selectedEnquiry.bookingDate ? new Date(selectedEnquiry.bookingDate).toLocaleDateString() : 'N/A'} />
                    <DetailRow icon={<AccessTimeIcon fontSize="small" />} label="Created At" value={new Date(selectedEnquiry.createdAt).toLocaleString()} />
                  </CardContent>
                </Card>
              </Grid>
              {selectedEnquiry.vendorId && (
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: '16px' }}>
                    <CardContent>
                      <Typography fontWeight={800} mb={2} color={themeColors.accent}>Vendor Information</Typography>
                      <DetailRow icon={<PersonIcon fontSize="small" />} label="Name"
                        value={`${selectedEnquiry.vendorId.firstName || ''} ${selectedEnquiry.vendorId.lastName || ''}`.trim()} />
                      <DetailRow icon={<EmailIcon fontSize="small" />} label="Email" value={selectedEnquiry.vendorId.email} />
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {selectedEnquiry.description && (
                <Grid item xs={12} md={selectedEnquiry.vendorId ? 6 : 12}>
                  <Card variant="outlined" sx={{ borderRadius: '16px' }}>
                    <CardContent>
                      <Typography fontWeight={800} mb={2} color={themeColors.accent}>Customer Message</Typography>
                      <DetailRow icon={<MessageIcon fontSize="small" />} label="Description" value={selectedEnquiry.description} />
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => { setOpenModal(false); if (selectedEnquiry) handleOpenChat(selectedEnquiry); }}
            variant="contained"
            startIcon={<ChatIcon />}
            sx={{
              borderRadius: '12px', fontWeight: 700, textTransform: 'none',
              bgcolor: '#1976D2', '&:hover': { bgcolor: '#1565C0' }
            }}
          >
            Open Chat
          </Button>
          <Button
            onClick={() => { setOpenModal(false); setSelectedEnquiry(null); }}
            variant="outlined"
            sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onClose={() => { setChatOpen(false); setSelectedEnquiry(null); setChatMessages([]); setNewMessage(''); }}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', height: '70vh' } }}>
        <DialogTitle sx={{ background: themeColors.gradientPrimary, color: 'white', py: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography fontWeight={800} fontSize="1rem">
                Chat - {selectedEnquiry?.fullName || 'Customer'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {selectedEnquiry?.moduleId?.title || 'Module'} • {selectedEnquiry?.eventType || 'General'}
              </Typography>
            </Box>
            <IconButton onClick={() => { setChatOpen(false); setSelectedEnquiry(null); setChatMessages([]); setNewMessage(''); }} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Messages Area */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f5f5f5' }}>
            {chatLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress size={28} sx={{ color: themeColors.accent }} />
              </Box>
            ) : chatMessages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: themeColors.textSecondary }}>
                <ChatIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography fontWeight={600}>No messages yet</Typography>
                <Typography variant="caption">Start a conversation with this vendor/customer</Typography>
              </Box>
            ) : (
              chatMessages.map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.senderType === 'admin' ? 'flex-end' : 'flex-start',
                    mb: 1.5
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      px: 2, py: 1.2,
                      borderRadius: msg.senderType === 'admin' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      bgcolor: msg.senderType === 'admin' ? themeColors.accent : 'white',
                      color: msg.senderType === 'admin' ? 'white' : themeColors.textMain,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                  >
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 500 }}>{msg.message}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7, fontSize: '0.65rem' }}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Box>

          {/* Message Input */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: themeColors.border, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={sendingMessage || !newMessage.trim()}
                sx={{
                  bgcolor: themeColors.accent, color: 'white',
                  width: 44, height: 44, borderRadius: '12px',
                  '&:hover': { bgcolor: '#d44a53' },
                  '&:disabled': { bgcolor: '#ccc', color: '#999' }
                }}
              >
                {sendingMessage ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SendIcon />}
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={notification.severity} variant="filled"
          sx={{ borderRadius: '14px', fontWeight: 700, fontSize: '0.82rem' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AllEnquiries;

import React from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Typography, 
  TextField 
} from '@mui/material';

function NewProvider() {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        backgroundColor: 'white', 
        overflowX: 'auto' // Enables horizontal scroll on small screens
      }}
    >
      {/* Tabs for Pending Stores and Denied Stores */}
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ mb: 2, minHeight: { xs: 40, sm: 48 } }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Pending Stores" sx={{ minWidth: { xs: 120, sm: 160 } }} />
        <Tab label="Denied Stores" sx={{ minWidth: { xs: 120, sm: 160 } }} />
      </Tabs>

      {/* Stores List and Search */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 2, 
          gap: 1
        }}
      >
        <Typography variant="h6" sx={{ mb: { xs: 1, sm: 0 } }}>
          Stores List {tabValue === 0 ? '0' : '0'}
        </Typography>
        <TextField
          variant="outlined"
          placeholder="Ex: Search Store Name"
          size="small"
          sx={{ width: { xs: '100%', sm: 200 } }}
        />
      </Box>

      {/* Table */}
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>S1</TableCell>
              <TableCell>Store Information</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Owner Information</TableCell>
              <TableCell>Zone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* No Data Found */}
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                  {/* Replace with an actual image or icon if needed */}
                  <Typography variant="h6">No Data Found</Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}

export default NewProvider;

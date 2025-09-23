// menu-items/auditorium/customers.js
import {
  IconPhoto,
  IconTicket,
  IconBell
} from '@tabler/icons-react';

const icons = {
  IconPhoto,     // for Banners
  IconTicket,    // for Coupons
  IconBell       // for Push Notifications
};

const zonemanagement = {
  id: 'zone-managemet',
  title: 'Zone Management',
  type: 'group',
  children: [
    {
      id: 'Zone-setup',
      title: 'Zone Setup',
      type: 'item',
      url: '/settings/zone-setup',
      icon: icons.IconPhoto,
      breadcrumbs: false
    }
   
  ]
};

export default zonemanagement;

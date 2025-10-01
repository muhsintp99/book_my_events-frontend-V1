

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

const taxmanagement = {
  id: 'tax-managemet',
  title: 'Tax Management',
  type: 'group',
  children: [
    {
      id: 'create',
      title: 'Create',
      type: 'item',
      url: '/settings/tax',
      icon: icons.IconPhoto,
      breadcrumbs: false
    },
    {
      id: 'tax-setup',
      title: 'Tax Setup',
      type: 'item',
      url: '/settings/tax',
      icon: icons.IconPhoto,
      breadcrumbs: false
    }
   
  ]
};

export default taxmanagement;

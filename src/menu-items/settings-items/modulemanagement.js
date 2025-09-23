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

const modulemanagement = {
  id: 'module-managemet',
  title: 'Module Management',
  type: 'group',
  children: [
    {
      id: 'all-module',
      title: 'All Modules',
      type: 'item',
      url: '/settings/module-setup',
      icon: icons.IconPhoto,
      breadcrumbs: false
    }
   
  ]
};

export default modulemanagement;

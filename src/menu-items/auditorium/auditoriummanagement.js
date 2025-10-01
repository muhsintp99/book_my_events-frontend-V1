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

const auditoriummanagement = {
  id: 'auditorium-customers',
  title: 'AuditoriumManagement',
  type: 'group',
  children: [
    {
      id: 'Banners',
      title: 'Banners',
      type: 'item',
      url: '/auditorium/banner',
      icon: icons.IconPhoto,
      breadcrumbs: false
    },
    {
      id: 'Coupons',
      title: 'Coupons',
      type: 'item',
      url: '/auditorium/coupons',
      icon: icons.IconTicket,
      breadcrumbs: false
    },
    {
      id: 'Push-notifications',
      title: 'Push Notifications',
      type: 'item',
      url: '/auditorium/pushnotifications',
      icon: icons.IconBell,
      breadcrumbs: false
    }
  ]
};

export default auditoriummanagement;

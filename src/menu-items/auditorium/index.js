// src/menu-items/auditorium/index.js
import { IconDashboard, IconCalendarEvent, IconUsers, IconBuildingSkyscraper, IconCategory } from '@tabler/icons-react';

// constant
const icons = {
  IconDashboard,
  IconCalendarEvent,
  IconUsers,
  IconBuildingSkyscraper,
  IconCategory
};

// ==============================|| AUDITORIUM MENU ITEMS ||============================== //

const auditorium = {
  id: 'auditorium',
  title: 'Auditorium',
  type: 'group',
  children: [
    {
      id: 'auditorium-dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/auditorium/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    // {
    //   id: 'auditorium-bookings',
    //   title: 'Bookings',
    //   type: 'item',
    //   url: '/auditorium/bookings',
    //   icon: icons.IconCalendarEvent,
    //   breadcrumbs: false
    // },
    // {
    //   id: 'auditorium-events',
    //   title: 'Events',
    //   type: 'item',
    //   url: '/auditorium/events',
    //   icon: icons.IconUsers,
    //   breadcrumbs: false
    // },
    // {
    //   id: 'auditorium-facilities',
    //   title: 'Facilities',
    //   type: 'item',
    //   url: '/auditorium/facilities',
    //   icon: icons.IconBuildingSkyscraper,
    //   breadcrumbs: false
    // },
    // {
    //   id: 'auditorium-customers',
    //   title: 'Customers',
    //   type: 'item',
    //   url: '/auditorium/customers',
    //   icon: icons.IconCategory,
    //   breadcrumbs: false
    // }
  ]
};

export default auditorium;
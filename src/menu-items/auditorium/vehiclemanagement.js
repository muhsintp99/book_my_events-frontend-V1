// menu-items/auditorium/bookings.js
import { IconCalendarEvent, IconCalendarPlus, IconCalendarStats } from '@tabler/icons-react';

const icons = {
  IconCalendarEvent,
  IconCalendarPlus,
  IconCalendarStats
};

const bookings = {
  id: 'auditorium-bookings',
  title: 'Vehiclemanagement',
  type: 'group',
  children: [
    {
      id: 'category',
      title: 'category',
      type: 'item',
      url: '/auditorium/category',
      icon: icons.IconCalendarEvent,
      breadcrumbs: false
    },
    {
      id: 'new-booking',
      title: 'New Booking',
      type: 'item',
      url: '/auditorium/bookings/new',
      icon: icons.IconCalendarPlus,
      breadcrumbs: false
    },
    {
      id: 'booking-reports',
      title: 'Reports',
      type: 'item',
      url: '/auditorium/bookings/reports',
      icon: icons.IconCalendarStats,
      breadcrumbs: false
    }
  ]
};

export default bookings;
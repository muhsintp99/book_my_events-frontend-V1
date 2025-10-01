// assets
import {
  IconDashboard,
  IconUserPlus,
  IconUsers,
  IconBuildingSkyscraper,
  IconBriefcase,
  IconFileText,
  IconVideo,
  IconBell,
  IconCalendarEvent,
  IconCreditCard,
  IconSettings,
  IconCalendar,
  IconUserCheck,
  IconClock,
  IconCurrencyDollar,
  IconKey,
  IconGraph
} from '@tabler/icons-react';

// constants
const icons = {
  IconDashboard,
  IconUserPlus,
  IconUsers,
  IconBuildingSkyscraper,
  IconBriefcase,
  IconFileText,
  IconVideo,
  IconBell,
  IconCalendarEvent,
  IconCreditCard,
  IconSettings,
  IconCalendar,
  IconUserCheck,
  IconClock,
  IconCurrencyDollar,
  IconKey,
  IconGraph
};

// ==============================|| DASHBOARD FULL MENU GROUP ||============================== //

const management = {
  title: 'Management',
  id: 'tripmanagemet',
  type: 'group',
  children: [
    {
      id: 'Trips',
      title: 'Bookings',
      type: 'collapse',
      icon: icons.IconBuildingSkyscraper,  // <- changed icon here
      children: [
        {
          id: 'all-leads',
          title: 'All ',
          type: 'item',
          url: '/bookings/all'
        },
        {
          id: 'new-leads',
          title: 'Scheduled',
          type: 'item',
          url: '/bookings/scheduled'
        },
        {
          id: 'follow-up',
          title: 'Pending',
          type: 'item',
          url: '/bookings/Pending'
        },
        {
          id: 'converted',
          title: 'Confirmed',
          type: 'item',
          url: '/bookings/confirmed'
        },
        {
          id: 'converted',
          title: 'Ongoing',
          type: 'item',
          url: '/bookings/ongoing'
        },
        {
          id: 'converted',
          title: 'Completed',
          type: 'item',
          url: '/bookings/completed'
        },
        {
          id: 'converted',
          title: 'Canceled',
          type: 'item',
          url: '/bookings/cancelled'
        },
        {
          id: 'converted',
          title: 'Payment failed',
          type: 'item',
          url: '/bookings/paymentfailedbookings'
        }
      ]
    },
  ]
};

export default management;

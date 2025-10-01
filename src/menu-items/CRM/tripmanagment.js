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

const tripmanagemet = {
  title: 'Trip Management',
  id: 'tripmanagemet',
  type: 'group',
  children: [
    {
      id: 'Trips',
      title: 'Trips',
      type: 'collapse',
      icon: icons.IconBuildingSkyscraper,  // <- changed icon here
      children: [
        {
          id: 'all-leads',
          title: 'All ',
          type: 'item',
         url: '/trips/alltrips'
        },
        {
          id: 'new-leads',
          title: 'Scheduled',
          type: 'item',
          url: '/trips/scheduled'
        },
        {
          id: 'follow-up',
          title: 'Pending',
          type: 'item',
          url: '/trips/pending'
        },
        {
          id: 'converted',
          title: 'Confirmed',
          type: 'item',
          url: '/trips/confirmed'
        },
        {
          id: 'converted',
          title: 'Ongoing',
          type: 'item',
          url: '/trips/ongoing'
        },
        {
          id: 'converted',
          title: 'Completed',
          type: 'item',
          url: '/trips/completed'
        },
        {
          id: 'converted',
          title: 'Canceled',
          type: 'item',
          url: '/trips/cancelled'
        },
        {
          id: 'converted',
          title: 'Payment failed',
          type: 'item',
          url: '/trips/paymentfailed'
        }
      ]
    },
  ]
};

export default tripmanagemet;

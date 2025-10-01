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

const subscriptionmanagement = {
  id: 'subscription-managemet',
  title: 'Subscription Management',
  type: 'group',
  children: [
    {
      id: 'subscription-list',
      title: 'Subscription List',
      type: 'item',
      url: '/settings/sub/list',
      icon: icons.IconPhoto,
      breadcrumbs: false
    },
    {
      id: 'subscribedstore-list',
      title: 'Subscribed Store List',
      type: 'item',
      url: '/settings/sub/store',
      icon: icons.IconPhoto,
      breadcrumbs: false
    },
    // {
    //   id: 'Add-pacakage',
    //   title: 'Add Package',
    //   type: 'item',
    //   url: '/settings/sub/add',
    //   icon: icons.IconPhoto,
    //   breadcrumbs: false
    // }
   
  ]
};

export default subscriptionmanagement;

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

const photographymanangement = {
  id: 'photography-management-group',
  title: 'PhotographyManagement',
  type: 'group',
  children: [

    {
      id: 'Coupons',
      title: 'Coupons',
      type: 'item',
      url: '/photography/coupons',
      icon: icons.IconTicket,
      breadcrumbs: false
    },
    // {
    //   id: 'Push-notifications',
    //   title: 'Push Notifications',
    //   type: 'item',
    //   url: '/auditorium/pushnotifications',
    //   icon: icons.IconBell,
    //   breadcrumbs: false
    // }
  ]
};

export default photographymanangement;

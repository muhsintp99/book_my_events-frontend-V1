// assets
import {
  IconPhoto,        // banners
  IconTicket,       // coupons
  IconCash,         // cashback
  IconBell          // push notifications
} from '@tabler/icons-react';

// constants
const icons = {
  IconPhoto,
  IconTicket,
  IconCash,
  IconBell
};

// ==============================|| DASHBOARD FULL MENU GROUP ||============================== //

const Promotionmgt = {
  id: 'promotion-management',
  title: 'Promotion Management',
  type: 'group',
  children: [
    {
      id: 'promotion-banners',
      title: 'Banners',
      type: 'item',
      url: '/promotions/Banners',  // Matches the route
      icon: icons.IconPhoto,
      breadcrumbs: false
    },
    {
      id: 'promotion-coupons',
      title: 'Coupons',
      type: 'item',
      url: '/promotions/Coupons',  // Matches the route
      icon: icons.IconTicket,
      breadcrumbs: false
    },
    {
      id: 'promotion-cashback',
      title: 'Cashback',
      type: 'item',
      url: '/promotions/cashback', // Assuming a route exists or will be added
      icon: icons.IconCash,
      breadcrumbs: false
    },
    {
      id: 'promotion-push-notifications',
      title: 'Push Notifications',
      type: 'item',
      url: '/promotions/PushNotification', // Matches the route
      icon: icons.IconBell,
      breadcrumbs: false
    }
  ]
};

export default Promotionmgt;
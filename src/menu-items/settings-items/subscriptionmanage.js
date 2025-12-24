import {
  IconClipboardList,
  IconBuildingStore,
  IconPackage,
  IconMailForward,
} from '@tabler/icons-react';

const icons = {
  IconClipboardList,   // Subscription List
  IconBuildingStore,   // Subscribed Store List
  IconPackage,         // Packages / Plans
  IconMailForward,     // Subscription Requests
};

const subscriptionmanagement = {
  id: 'subscription-management',
  title: 'Subscription Management',
  type: 'group',
  children: [
    {
      id: 'subscription-list',
      title: 'Subscription List',
      type: 'item',
      url: '/settings/sub/list',
      icon: icons.IconClipboardList,
      breadcrumbs: false
    },
    {
      id: 'subscribedstore-list',
      title: 'Subscribed Store List',
      type: 'item',
      url: '/settings/sub/store',
      icon: icons.IconBuildingStore,
      breadcrumbs: false
    },
    {
      id: 'subscription-requests',
      title: 'Subscription Requests',
      type: 'item',
      url: '/settings/sub/requests',
      icon: icons.IconMailForward,
      breadcrumbs: false
    },
    // {
    //   id: 'Add-pacakage',
    //   title: 'Add Package',
    //   type: 'item',
    //   url: '/settings/sub/add',
    //   icon: icons.IconPackage,
    //   breadcrumbs: false
    // }
  ]
};

export default subscriptionmanagement;

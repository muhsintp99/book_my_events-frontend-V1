// menu-items/auditorium/customers.js
import {
  IconMapPinCog
} from '@tabler/icons-react';

const icons = {
  IconMapPinCog   // Zone Setup
};

const zonemanagement = {
  id: 'zone-management',
  title: 'Zone Management',
  type: 'group',
  children: [
    {
      id: 'Zone-setup',
      title: 'Zone Setup',
      type: 'item',
      url: '/settings/zone-setup',
      icon: icons.IconMapPinCog,
      breadcrumbs: false
    }
  ]
};

export default zonemanagement;

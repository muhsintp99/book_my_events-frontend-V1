// menu-items/auditorium/management.js
import { IconBuildingSkyscraper, IconSettings, IconTools } from '@tabler/icons-react';
import AddProvider from './../../views/Addprovider';

const icons = {
  IconBuildingSkyscraper,
  IconSettings,
  IconTools
};

const Providermanagement = {
  id: 'auditorium-management',
  title: 'Venue Management',
  type: 'group',
  children: [
    {
      id: 'new-providers-request',
      title: 'Venue Provider List',
      type: 'item',
      url: '/auditorium/provider',
      icon: icons.IconBuildingSkyscraper,
      breadcrumbs: false
    },
    {
      id: 'auditoriumadd',
      title: 'Add Venue Provider',
      type: 'item',
      url: '/auditorium/AddProvider',
      icon: icons.IconSettings,
      breadcrumbs: false
    },
    {
      id: 'Auditorium List',
      title: 'Venue List',
      type: 'item',
      url: '/auditorium/auditoriumlist',
      icon: icons.IconTools,
      breadcrumbs: false
    },

  ]
};

export default Providermanagement;
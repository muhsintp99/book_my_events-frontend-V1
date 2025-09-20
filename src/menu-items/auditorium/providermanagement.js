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
  title: 'ProviderManagement',
  type: 'group',
  children: [
    {
      id: 'new-providers-request',
      title: 'New Providers Request',
      type: 'item',
      url: '/auditorium/provider',
      icon: icons.IconBuildingSkyscraper,
      breadcrumbs: false
    },
    {
      id: 'auditoriumadd',
      title: 'Add Auditorium',
      type: 'item',
      url: '/auditorium/AddProvider',
      icon: icons.IconSettings,
      breadcrumbs: false
    },
    {
      id: 'Auditorium List',
      title: 'Auditorium List',
      type: 'item',
      url: '/auditorium/auditoriumlist',
      icon: icons.IconTools,
      breadcrumbs: false
    },
     
  ]
};

export default Providermanagement;
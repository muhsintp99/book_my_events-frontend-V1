// menu-items/auditorium/management.js
import { IconBuildingSkyscraper, IconSettings, IconTools } from '@tabler/icons-react';
import AddProvider from '../../views/Addprovider';

const icons = {
  IconBuildingSkyscraper,
  IconSettings,
  IconTools
};

const MakeupProvidermanagement = {
  id: 'makeup-management',
  title: 'ProviderManagement',
  type: 'group',
  children: [
    {
      id: 'new-providers-request',
      title: 'New Providers Request',
      type: 'item',
      url: '/makeup/provider',
      icon: icons.IconBuildingSkyscraper,
      breadcrumbs: false
    },
    {
      id: 'cateringadd',
      title: 'Add Providers',
      type: 'item',
      url: '/makeup/AddProvider',
      icon: icons.IconSettings,
      breadcrumbs: false
    },
    {
      id: 'makeup List',
      title: 'makeup List',
      type: 'item',
      url: '/makeup/makeupList',
      icon: icons.IconTools,
      breadcrumbs: false
    },
    
     
  ]
};

export default MakeupProvidermanagement;
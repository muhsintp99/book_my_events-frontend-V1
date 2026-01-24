// menu-items/auditorium/management.js
import { IconBuildingSkyscraper, IconSettings, IconTools } from '@tabler/icons-react';
import AddProvider from '../../views/Addprovider';

const icons = {
  IconBuildingSkyscraper,
  IconSettings,
  IconTools
};

const CateringProvidermanagement = {
  id: 'catering-management',
  title: 'ProviderManagement',
  type: 'group',
  children: [
    {
      id: 'new-providers-request',
      title: 'Providers List',
      type: 'item',
      url: '/catering/cateringprovider',
      icon: icons.IconBuildingSkyscraper,
      breadcrumbs: false
    },
    {
      id: 'cateringadd',
      title: 'Add Providers',
      type: 'item',
      url: '/catering/AddProvider',
      icon: icons.IconSettings,
      breadcrumbs: false
    },
    {
      id: 'catering List',
      title: 'catering List',
      type: 'item',
      url: '/catering/cateringList',
      icon: icons.IconTools,
      breadcrumbs: false
    },

  ]
};

export default CateringProvidermanagement;
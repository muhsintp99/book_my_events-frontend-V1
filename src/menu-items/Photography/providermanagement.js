// menu-items/auditorium/management.js
import { IconBuildingSkyscraper, IconSettings, IconTools } from '@tabler/icons-react';
import AddProvider from '../../views/Addprovider';

const icons = {
  IconBuildingSkyscraper,
  IconSettings,
  IconTools
};

const PhotographyProvidermanagement = {
  id: 'photography-management',
  title: 'ProviderManagement',
  type: 'group',
  children: [
    {
         id: 'new-providers-request',
         title: 'New Providers Request',
         type: 'item',
         url: '/photography/photographyvendors',
         icon: icons.IconBuildingSkyscraper,
         breadcrumbs: false
       },
    {
      id: 'cateringadd',
      title: 'Add Providers',
      type: 'item',
      url: '/photography/AddProvider',
      icon: icons.IconSettings,
      breadcrumbs: false
    },
    {
      id: 'photography List',
      title: 'PhotographyList',
      type: 'item',
      url: '/photography/photographyList',
      icon: icons.IconTools,
      breadcrumbs: false
    },
     
  ]
};

export default PhotographyProvidermanagement;
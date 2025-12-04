// menu-items/auditorium/customers.js
import {
  IconApps,
  IconHierarchy2
} from '@tabler/icons-react';

const icons = {
  IconApps,        // All Modules
  IconHierarchy2   // Secondary Modules
};

const modulemanagement = {
  id: 'module-management',
  title: 'Module Management',
  type: 'group',
  children: [
    {
      id: 'all-module',
      title: 'All Modules',
      type: 'item',
      url: '/settings/module-setup',
      icon: icons.IconApps,
      breadcrumbs: false
    },
    {
      id: 'secondary-module',
      title: 'Secondary Modules',
      type: 'item',
      url: '/settings/secondery-module-setup',
      icon: icons.IconHierarchy2,
      breadcrumbs: false
    }
  ]
};

export default modulemanagement;

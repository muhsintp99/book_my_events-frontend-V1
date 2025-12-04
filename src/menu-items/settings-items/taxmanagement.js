// menu-items/auditorium/customers.js
import {
  IconReceipt,
  IconPercentage
} from '@tabler/icons-react';

const icons = {
  IconReceipt,      // Create Tax
  IconPercentage    // Tax Setup
};

const taxmanagement = {
  id: 'tax-management',
  title: 'Tax Management',
  type: 'group',
  children: [
    {
      id: 'create',
      title: 'Create',
      type: 'item',
      url: '/settings/tax',
      icon: icons.IconReceipt,
      breadcrumbs: false
    },
    {
      id: 'tax-setup',
      title: 'Tax Setup',
      type: 'item',
      url: '/settings/tax',
      icon: icons.IconPercentage,
      breadcrumbs: false
    }
  ]
};

export default taxmanagement;

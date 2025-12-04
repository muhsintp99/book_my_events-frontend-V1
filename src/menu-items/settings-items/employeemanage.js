// menu-items/auditorium/customers.js
import {
  IconUserCog,
  IconUserPlus
} from '@tabler/icons-react';

const icons = {
  IconUserCog,   // Roles
  IconUserPlus   // Add New Employee
};

const employeemanagement = {
  id: 'employee-management',
  title: 'Employee Management',
  type: 'group',
  children: [
    {
      id: 'roles',
      title: 'Roles',
      type: 'item',
      url: '/settings/employee',
      icon: icons.IconUserCog,
      breadcrumbs: false
    },
    {
      id: 'add-new',
      title: 'Add New',
      type: 'item',
      url: '/settings/employee',
      icon: icons.IconUserPlus,
      breadcrumbs: false
    }
  ]
};

export default employeemanagement;



// menu-items/auditorium/customers.js
import {
  IconPhoto,
  IconTicket,
  IconBell
} from '@tabler/icons-react';

const icons = {
  IconPhoto,     // for Banners
  IconTicket,    // for Coupons
  IconBell       // for Push Notifications
};

const employeemanagement = {
  id: 'employee-managemet',
  title: 'Employee Management',
  type: 'group',
  children: [
    {
      id: 'roles',
      title: 'Roles',
      type: 'item',
      url: '/settings/employee',
      icon: icons.IconPhoto,
      breadcrumbs: false
    },
    {
      id: 'add-new',
      title: 'Add New',
      type: 'item',
      url: '/settings/employee',
      icon: icons.IconPhoto,
      breadcrumbs: false
    }
   
  ]
};

export default employeemanagement;

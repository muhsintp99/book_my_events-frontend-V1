// menu-items/auditorium/pincodemanagement.js
import { IconMapPin } from '@tabler/icons-react';

const icons = {
  IconMapPin
};

const pincodemanagement = {
  id: 'pincode-management',
  title: 'Pincode Management',
  type: 'group',
  children: [
    {
      id: 'pincode-setup',
      title: 'Pincode Setup',
      type: 'item',
      url: '/settings/pincode-setup',
      icon: icons.IconMapPin,
      breadcrumbs: false
    }
  ]
};

export default pincodemanagement;

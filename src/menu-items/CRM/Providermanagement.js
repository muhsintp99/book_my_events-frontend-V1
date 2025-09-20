// assets
import {
  IconUserPlus,      
  IconUserCheck,     
  IconUsers,         
  IconUpload,        
  IconDownload       
} from '@tabler/icons-react';

// constants
const icons = {
  IconUserPlus,
  IconUserCheck,
  IconUsers,
  IconUpload,
  IconDownload
};

// ==============================|| DASHBOARD FULL MENU GROUP ||============================== //

const Providermgt = {
  id: 'provider-management',
  title: 'Provider Management',
  type: 'group',
  children: [
    {
      id: 'new-providers-request',
      title: 'New Providers Request',
      type: 'item',
      url: '/providers/new',
      icon: icons.IconUserPlus,
      breadcrumbs: false
    },
    {
      id: 'add-new-provider',
      title: 'Add New Provider',
      type: 'item',
      url: '/providers/add',
      icon: icons.IconUserCheck,
      breadcrumbs: false
    },
    {
      id: 'providers-list',
      title: 'Providers List',
      type: 'item',
      url: '/providers/list',
      icon: icons.IconUsers,
      breadcrumbs: false
    },
    {
      id: 'bulk-import',
      title: 'Bulk Import',
      type: 'item',
      url: '/providers/import',
      icon: icons.IconUpload,
      breadcrumbs: false
    },
    {
      id: 'bulk-export',
      title: 'Bulk Export',
      type: 'item',
      url: '/providers/export',
      icon: icons.IconDownload,
      breadcrumbs: false
    }
  ]
};

export default Providermgt;

// assets
import {
  IconCar,           // for vehicle-related items
  IconCategory,      // for categories
  IconTrademark,     // for brands
  IconPlus,          // create new
  IconList,          // list
  IconClipboardCheck,// review
  IconUpload,        // bulk import
  IconDownload,      // bulk export
  IconEngine         // ongoing/active trips
} from '@tabler/icons-react';

// constants
const icons = {
  IconCar,
  IconCategory,
  IconTrademark,
  IconPlus,
  IconList,
  IconClipboardCheck,
  IconUpload,
  IconDownload,
  IconEngine
};

// ==============================|| DASHBOARD FULL MENU GROUP ||============================== //

const vehiclemgt = {
  id: 'vehicle-management',
  title: 'Vehicle Management',
  type: 'group',
  children: [
    {
      id: 'vehicle-category',
      title: 'Category',
      type: 'item',
      url: '/vehicles/category',
      icon: icons.IconCategory,
      breadcrumbs: false
    },
    {
      id: 'vehicle-brands',
      title: 'Brands',
      type: 'item',
      url: '/vehicles/brands',
      icon: icons.IconTrademark,
      breadcrumbs: false
    },
    {
      id: 'vehicle-setup',
      title: 'Vehicle Setup',
      type: 'collapse',
      icon: icons.IconCar,
      children: [
        {
          id: 'create-vehicle',
          title: 'Create New',
          type: 'item',
          url: '/vehicles/create',
          icon: icons.IconPlus
        },
        {
          id: 'vehicle-list',
          title: 'List',
          type: 'item',
          url: '/vehicles/list',
          icon: icons.IconList
        },
        {
          id: 'vehicle-review',
          title: 'Review',
          type: 'item',
          url: '/vehicles/review',
          icon: icons.IconClipboardCheck
        },
        {
          id: 'bulk-import-vehicles',
          title: 'Bulk Import',
          type: 'item',
          url: '/vehicles/import',
          icon: icons.IconUpload
        },
        {
          id: 'ongoing-vehicles',
          title: 'Ongoing',
          type: 'item',
          url: '/vehicles/ongoing',
          icon: icons.IconEngine
        },
        {
          id: 'bulk-export-vehicles',
          title: 'Bulk Export',
          type: 'item',
          url: '/vehicles/export',
          icon: icons.IconDownload
        }
      ]
    }
  ]
};

export default vehiclemgt;

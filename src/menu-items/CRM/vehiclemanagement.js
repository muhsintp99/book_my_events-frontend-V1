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
  IconEngine,        // ongoing/active trips
  IconListDetails    // 👈 NEW ICON for Vehicle Attributes
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
  IconEngine,
  IconListDetails    // 👈 Add here
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
      id: 'vehicle-attributes',
      title: 'Vehicle Attributes',
      type: 'item',
      url: '/vehicles/Attributes',
      icon: icons.IconListDetails,   // 👈 UPDATED ICON
      breadcrumbs: false
    }
  ]
};

export default vehiclemgt;

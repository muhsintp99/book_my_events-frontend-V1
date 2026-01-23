// menu-items/auditorium/customers.js
import {
  IconUsers,
  IconUserPlus,
  IconUserCheck,
  IconCategory,
  IconCategory2,
  IconTrademark,
  IconBuilding,
  IconPlus,
  IconList,
  IconClipboardCheck,
  IconUpload,
  IconDownload,
  IconCalendarTime,
  IconPhoto
} from '@tabler/icons-react';

const icons = {
  IconUsers,
  IconUserPlus,
  IconUserCheck,
  IconCategory,
  IconCategory2,
  IconTrademark,
  IconBuilding,
  IconPlus,
  IconList,
  IconClipboardCheck,
  IconUpload,
  IconDownload,
  IconCalendarTime,
  IconPhoto
};

const makeupsections = {
  id: 'makeup-sections-group',
  title: 'Makeup Sections',
  type: 'group',
  children: [
    {
      id: 'makeup-category',
      title: 'Category',
      type: 'item',
      url: '/makeup/category',
      icon: icons.IconCategory,
      breadcrumbs: false
    },
    {
      id: 'makeup-types',
      title: 'Makeup Types',
      type: 'item',
      url: '/makeup/types',
      icon: icons.IconCategory2,
      breadcrumbs: false
    },
    // {
    //   id: 'portfolio',
    //   title: 'Portfolio',
    //   type: 'item',
    //   url: '/makeup/portfolio',
    //   icon: icons.IconPhoto, // Fixed Portfolio Icon
    //   breadcrumbs: false
    // }
  ]
};

export default makeupsections;

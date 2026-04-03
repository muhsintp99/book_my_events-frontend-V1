import { IconPhoto, IconTicket, IconNews, IconPhotoPlus } from '@tabler/icons-react';

const icons = {
  IconPhoto,
  IconTicket,
  IconNews,
  IconPhotoPlus
};

const websitemanagement = {
  id: 'website-management',
  title: 'Website Management',
  type: 'group',
  children: [
    {
      id: 'Banners',
      title: 'Banners',
      type: 'item',
      url: '/settings/banner',
      icon: icons.IconPhoto,
      breadcrumbs: false
    },
    {
      id: 'promotion-coupons',
      title: 'Coupons (Admin)',
      type: 'item',
      url: '/settings/coupons', // 👈 New path in settings
      icon: icons.IconTicket,
      breadcrumbs: false
    },
    {
      id: 'BlogList',
      title: 'Blog List',
      type: 'item',
      url: '/settings/blogs', // 👈 Placeholder from screenshot
      icon: icons.IconNews,
      breadcrumbs: false
    },
    {
      id: 'GalleryManagement',
      title: 'Gallery Management',
      type: 'item',
      url: '/settings/gallery', // 👈 Placeholder from screenshot
      icon: icons.IconPhotoPlus,
      breadcrumbs: false
    }
  ]
};

export default websitemanagement;

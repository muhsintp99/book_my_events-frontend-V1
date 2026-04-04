import { IconPhoto,IconNews } from '@tabler/icons-react';

const icons = {
  IconPhoto,
  IconNews
};

const bannermanagement = {
  id: 'banner-management',
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
      id: 'blog-list',
      title: 'Blog List',
      type: 'item',
      url: '/settings/blogs',
      icon: icons.IconNews,
      breadcrumbs: false
    },
    {
      id: 'gallery-list',
      title: 'Gallery Management',
      type: 'item',
      url: '/settings/gallery',
      icon: icons.IconNews,
      breadcrumbs: false
    }
  ]
};

export default bannermanagement;

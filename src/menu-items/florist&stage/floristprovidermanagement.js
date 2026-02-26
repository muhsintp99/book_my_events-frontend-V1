import { IconBuildingSkyscraper, IconSettings, IconTools } from '@tabler/icons-react';

const icons = {
    IconBuildingSkyscraper,
    IconSettings,
    IconTools
};

const FloristProvidermanagement = {
    id: 'florist-provider-management',
    title: 'Provider Management',
    type: 'group',
    children: [
        {
            id: 'florist-providers-list',
            title: 'Providers List',
            type: 'item',
            url: '/florist/floristprovider',
            icon: icons.IconBuildingSkyscraper,
            breadcrumbs: false
        },
        {
            id: 'floristadd',
            title: 'Add Providers',
            type: 'item',
            url: '/florist/AddProvider',
            icon: icons.IconSettings,
            breadcrumbs: false
        },
        {
            id: 'florist-list',
            title: 'Florist List',
            type: 'item',
            url: '/florist/floristList',
            icon: icons.IconTools,
            breadcrumbs: false
        },
    ]
};

export default FloristProvidermanagement;

import { IconBuildingSkyscraper, IconSettings, IconTools } from '@tabler/icons-react';

const icons = {
    IconBuildingSkyscraper,
    IconSettings,
    IconTools
};

const MehandiProvidermanagement = {
    id: 'mehandi-provider-management',
    title: 'Provider Management',
    type: 'group',
    children: [
        {
            id: 'mehandi-providers-list',
            title: 'Providers List',
            type: 'item',
            url: '/mehandi/mehandiprovider',
            icon: icons.IconBuildingSkyscraper,
            breadcrumbs: false
        },
        {
            id: 'mehandiadd',
            title: 'Add Providers',
            type: 'item',
            url: '/mehandi/AddProvider',
            icon: icons.IconSettings,
            breadcrumbs: false
        },
        {
            id: 'mehandi-list',
            title: 'Mehandi List',
            type: 'item',
            url: '/mehandi/mehandiList',
            icon: icons.IconTools,
            breadcrumbs: false
        },
    ]
};

export default MehandiProvidermanagement;

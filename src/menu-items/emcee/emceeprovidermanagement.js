import { IconBuildingSkyscraper, IconSettings, IconTools } from '@tabler/icons-react';

const icons = {
    IconBuildingSkyscraper,
    IconSettings,
    IconTools
};

const EmceeProvidermanagement = {
    id: 'emcee-provider-management',
    title: 'Provider Management',
    type: 'group',
    children: [
        {
            id: 'emcee-providers-list',
            title: 'Providers List',
            type: 'item',
            url: '/emcee/emceeprovider',
            icon: icons.IconBuildingSkyscraper,
            breadcrumbs: false
        },
        {
            id: 'emceeadd',
            title: 'Add Providers',
            type: 'item',
            url: '/emcee/AddProvider',
            icon: icons.IconSettings,
            breadcrumbs: false
        },
        {
            id: 'emcee-list',
            title: 'Emcee List',
            type: 'item',
            url: '/emcee/emceeList',
            icon: icons.IconTools,
            breadcrumbs: false
        },
    ]
};

export default EmceeProvidermanagement;

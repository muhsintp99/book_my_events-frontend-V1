import { IconBuildingSkyscraper, IconSettings, IconMessageCircle } from '@tabler/icons-react';

const icons = {
    IconBuildingSkyscraper,
    IconSettings,
    IconMessageCircle
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
            id: 'emcee-enquiries',
            title: 'Enquiries',
            type: 'item',
            url: '/emcee/enquiries',
            icon: icons.IconMessageCircle,
            breadcrumbs: false
        },
    ]
};

export default EmceeProvidermanagement;

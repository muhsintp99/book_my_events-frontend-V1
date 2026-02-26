import { IconBuildingSkyscraper, IconSettings, IconTools } from '@tabler/icons-react';

const icons = {
    IconBuildingSkyscraper,
    IconSettings,
    IconTools
};

const BouncerProvidermanagement = {
    id: 'bouncer-provider-management',
    title: 'Provider Management',
    type: 'group',
    children: [
        {
            id: 'bouncer-providers-list',
            title: 'Providers List',
            type: 'item',
            url: '/bouncers/bouncerprovider',
            icon: icons.IconBuildingSkyscraper,
            breadcrumbs: false
        },
        {
            id: 'bounceradd',
            title: 'Add Providers',
            type: 'item',
            url: '/bouncers/AddProvider',
            icon: icons.IconSettings,
            breadcrumbs: false
        },
        {
            id: 'bouncer-list',
            title: 'Bouncer List',
            type: 'item',
            url: '/bouncers/bouncerList',
            icon: icons.IconTools,
            breadcrumbs: false
        },
    ]
};

export default BouncerProvidermanagement;

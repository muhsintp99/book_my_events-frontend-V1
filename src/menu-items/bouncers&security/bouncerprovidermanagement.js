import { IconBuildingSkyscraper, IconSettings, IconMessageCircle } from '@tabler/icons-react';

const icons = {
    IconBuildingSkyscraper,
    IconSettings,
    IconMessageCircle
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
            id: 'bouncer-enquiries',
            title: 'Enquiries',
            type: 'item',
            url: '/bouncers/enquiries',
            icon: icons.IconMessageCircle,
            breadcrumbs: false
        },
    ]
};

export default BouncerProvidermanagement;

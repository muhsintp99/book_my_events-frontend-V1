import { IconBuildingSkyscraper, IconSettings, IconMessageCircle } from '@tabler/icons-react';

const icons = {
    IconBuildingSkyscraper,
    IconSettings,
    IconMessageCircle
};

const LightProvidermanagement = {
    id: 'light-provider-management',
    title: 'Provider Management',
    type: 'group',
    children: [
        {
            id: 'light-providers-list',
            title: 'Providers List',
            type: 'item',
            url: '/lights/lightprovider',
            icon: icons.IconBuildingSkyscraper,
            breadcrumbs: false
        },
        {
            id: 'lightadd',
            title: 'Add Providers',
            type: 'item',
            url: '/lights/AddProvider',
            icon: icons.IconSettings,
            breadcrumbs: false
        },
        {
            id: 'light-enquiries',
            title: 'Enquiries',
            type: 'item',
            url: '/lights/enquiries',
            icon: icons.IconMessageCircle,
            breadcrumbs: false
        },
    ]
};

export default LightProvidermanagement;

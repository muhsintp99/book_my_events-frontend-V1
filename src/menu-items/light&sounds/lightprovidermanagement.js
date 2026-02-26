import { IconBuildingSkyscraper, IconSettings, IconTools } from '@tabler/icons-react';

const icons = {
    IconBuildingSkyscraper,
    IconSettings,
    IconTools
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
            id: 'light-list',
            title: 'Light & Sound List',
            type: 'item',
            url: '/lights/lightList',
            icon: icons.IconTools,
            breadcrumbs: false
        },
    ]
};

export default LightProvidermanagement;

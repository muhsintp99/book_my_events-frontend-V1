import { IconBuildingSkyscraper, IconSettings, IconTools } from '@tabler/icons-react';

const icons = {
    IconBuildingSkyscraper,
    IconSettings,
    IconTools
};

const PanthalProvidermanagement = {
    id: 'panthal-provider-management',
    title: 'Provider Management',
    type: 'group',
    children: [
        {
            id: 'panthal-providers-list',
            title: 'Providers List',
            type: 'item',
            url: '/panthal/panthalprovider',
            icon: icons.IconBuildingSkyscraper,
            breadcrumbs: false
        },
        {
            id: 'panthaladd',
            title: 'Add Providers',
            type: 'item',
            url: '/panthal/AddProvider',
            icon: icons.IconSettings,
            breadcrumbs: false
        },
        {
            id: 'panthal-list',
            title: 'Panthal List',
            type: 'item',
            url: '/panthal/panthalList',
            icon: icons.IconTools,
            breadcrumbs: false
        },
    ]
};

export default PanthalProvidermanagement;

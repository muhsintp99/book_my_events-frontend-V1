import { IconBuildingSkyscraper, IconSettings, IconTools } from '@tabler/icons-react';

const icons = {
    IconBuildingSkyscraper,
    IconSettings,
    IconTools
};

const OrnamentsProvidermanagement = {
    id: 'ornaments-management',
    title: 'ProviderManagement',
    type: 'group',
    children: [
        {
            id: 'new-providers-request',
            title: 'Providers List',
            type: 'item',
            url: '/ornaments/ornamentsprovider',
            icon: icons.IconBuildingSkyscraper,
            breadcrumbs: false
        },
        {
            id: 'ornamentsadd',
            title: 'Add Providers',
            type: 'item',
            url: '/ornaments/AddProvider',
            icon: icons.IconSettings,
            breadcrumbs: false
        },
        {
            id: 'ornaments List',
            title: 'ornaments List',
            type: 'item',
            url: '/ornaments/ornamentsList',
            icon: icons.IconTools,
            breadcrumbs: false
        },
    ]
};

export default OrnamentsProvidermanagement;

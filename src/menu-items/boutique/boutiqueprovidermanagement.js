import { IconBuildingSkyscraper, IconSettings, IconTools } from '@tabler/icons-react';

const icons = {
    IconBuildingSkyscraper,
    IconSettings,
    IconTools
};

const BoutiqueProvidermanagement = {
    id: 'boutique-management',
    title: 'ProviderManagement',
    type: 'group',
    children: [
        {
            id: 'new-providers-request',
            title: 'Providers List',
            type: 'item',
            url: '/boutique/boutiqueprovider',
            icon: icons.IconBuildingSkyscraper,
            breadcrumbs: false
        },
        {
            id: 'boutiqueadd',
            title: 'Add Providers',
            type: 'item',
            url: '/boutique/AddProvider',
            icon: icons.IconSettings,
            breadcrumbs: false
        },
        {
            id: 'boutique List',
            title: 'boutique List',
            type: 'item',
            url: '/boutique/boutiqueList',
            icon: icons.IconTools,
            breadcrumbs: false
        },
    ]
};

export default BoutiqueProvidermanagement;

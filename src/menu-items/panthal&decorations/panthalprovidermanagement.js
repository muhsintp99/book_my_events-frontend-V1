import { IconBuildingSkyscraper, IconSettings, IconMessageCircle } from '@tabler/icons-react';

const icons = {
    IconBuildingSkyscraper,
    IconSettings,
    IconMessageCircle
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
            id: 'panthal-enquiries',
            title: 'Enquiries',
            type: 'item',
            url: '/panthal/enquiries',
            icon: icons.IconMessageCircle,
            breadcrumbs: false
        },
    ]
};

export default PanthalProvidermanagement;

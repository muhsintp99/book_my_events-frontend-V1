import { IconBuildingSkyscraper, IconSettings, IconTools } from '@tabler/icons-react';

const icons = {
    IconBuildingSkyscraper,
    IconSettings,
    IconTools
};

const InvitationProvidermanagement = {
    id: 'mehandi-provider-management',
    title: 'Provider Management',
    type: 'group',
    children: [
        {
            id: 'invitation-providers-list',
            title: 'Providers List',
            type: 'item',
            url: '/invitation/invitationprovider',
            icon: icons.IconBuildingSkyscraper,
            breadcrumbs: false
        },
        {
            id: 'invitationadd',
            title: 'Add Providers',
            type: 'item',
            url: '/invitation/AddProvider',
            icon: icons.IconSettings,
            breadcrumbs: false
        },
        {
            id: 'invitation-list',
            title: 'Invitation List',
            type: 'item',
            url: '/invitation/invitationList',
            icon: icons.IconTools,
            breadcrumbs: false
        },
    ]
};

export default InvitationProvidermanagement;

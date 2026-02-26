import {
    IconCategory,
} from '@tabler/icons-react';

const icons = {
    IconCategory,
};

const invitationsections = {
    id: 'invitation-sections-group',
    title: 'Invitation Sections',
    type: 'group',
    children: [
        {
            id: 'invitation-category',
            title: 'Category',
            type: 'item',
            url: '/invitation/category',
            icon: icons.IconCategory,
            breadcrumbs: false
        },
    ]
};

export default invitationsections;

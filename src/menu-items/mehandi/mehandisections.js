import {
    IconCategory,
} from '@tabler/icons-react';

const icons = {
    IconCategory,
};

const mehandisections = {
    id: 'mehandi-sections-group',
    title: 'Mehandi Sections',
    type: 'group',
    children: [
        {
            id: 'mehandi-category',
            title: 'Category',
            type: 'item',
            url: '/mehandi/category',
            icon: icons.IconCategory,
            breadcrumbs: false
        },
    ]
};

export default mehandisections;
